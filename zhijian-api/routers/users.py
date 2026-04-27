from __future__ import annotations

from fastapi import APIRouter, Body, File, Form, HTTPException, UploadFile

import hashlib
from datetime import datetime, timezone

from core.utils import _utc_iso
from services.data_store import _load_user_accounts, _load_user_services, _save_user_accounts
from services.user_service import (
    _create_phone_account,
    _get_account_by_phone,
    _get_or_create_user,
    _issue_token,
    _verify_user_token,
    _verify_user_token_full,
)

router = APIRouter()


def _hash_password(password: str) -> str:
    """SHA-256 哈希密码，不明文存储。"""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def _build_service_info(account_id: str) -> dict:
    """读取用户权益状态（按 account_id 查询）。"""
    user_services = _load_user_services()
    entry = user_services.get(account_id, {})
    membership_until = entry.get("membership_until")
    is_active_member = False
    if membership_until:
        try:
            until_dt = datetime.fromisoformat(str(membership_until))
            is_active_member = datetime.now(timezone.utc) < until_dt
        except Exception:
            pass
    return {
        "membership_until": membership_until,
        "is_active_member": is_active_member,
        "balance": int(entry.get("balance", 0) or 0),
        "quota":   int(entry.get("quota",   0) or 0),
    }


def _account_response(account: dict, token: str, is_new: bool = False) -> dict:
    """统一的账号响应格式。"""
    return {
        "ok":          True,
        "is_new":      is_new,
        "account_id":  account["account_id"],
        "member_no":   account.get("member_no", ""),
        "user_id":     account["account_id"],      # 向后兼容旧字段
        "user_token":  token,
        "role":        account.get("role", "teacher"),
        "org_id":      account.get("org_id", ""),
        "agent_profile": account.get("agent_profile", {}),
        "service":     _build_service_info(account["account_id"]),
    }


# ── /user/wxlogin ─────────────────────────────────────────────────────
@router.post("/user/wxlogin", tags=["用户"])
async def user_wxlogin(
    code: str = Form(..., description="微信 wx.login() 返回的 code"),
):
    """
    小程序登录：code → openid → 查/建账号 → 返回 token。
    如果 openid 未绑定手机号，返回 bound=False，前端引导绑定。
    """
    import httpx
    import os

    appid  = os.getenv("WECHAT_APPID", "")
    secret = os.getenv("WECHAT_SECRET", "")

    if appid and secret:
        try:
            url = (
                f"https://api.weixin.qq.com/sns/jscode2session"
                f"?appid={appid}&secret={secret}&js_code={code}&grant_type=authorization_code"
            )
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(url)
                wx_data = resp.json()
            openid = str(wx_data.get("openid", "")).strip()
            if not openid:
                raise HTTPException(status_code=400, detail=f"微信登录失败：{wx_data.get('errmsg', '未知')}")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"微信接口调用失败：{e}")
    else:
        openid = f"dev_{code[:16]}"

    account = _get_or_create_user(openid)
    token   = _issue_token(account["account_id"])

    # 重新读取最新 account（_issue_token 已写回）
    accounts = _load_user_accounts()
    account  = accounts.get(account["account_id"], account)

    return {
        **_account_response(account, token),
        "openid":      openid,
        "phone_bound": bool(account.get("phone")),   # 前端判断是否需要绑定手机号
    }


# ── /user/register ────────────────────────────────────────────────────
@router.post("/user/register", tags=["用户"])
async def user_register(payload: dict = Body(...)):
    """
    注册：手机号 + 密码。
    手机号已存在 → 409；新用户 → 创建账号并直接登录。
    """
    phone    = str(payload.get("phone", "") or payload.get("user_id", "")).strip()
    password = str(payload.get("password", "")).strip()

    if len(phone) < 4:
        raise HTTPException(status_code=400, detail="请填写有效手机号（至少4位）")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="密码至少6位")

    account = _create_phone_account(phone, _hash_password(password))
    token   = _issue_token(account["account_id"])

    return _account_response(account, token, is_new=True)


# ── /user/login ───────────────────────────────────────────────────────
@router.post("/user/login", tags=["用户"])
async def user_login(payload: dict = Body(...)):
    """
    登录：手机号 + 密码，返回 user_token。
    """
    phone    = str(payload.get("phone", "") or payload.get("user_id", "")).strip()
    password = str(payload.get("password", "")).strip()

    if not phone or not password:
        raise HTTPException(status_code=400, detail="请填写手机号和密码")

    account = _get_account_by_phone(phone)
    if not account:
        raise HTTPException(status_code=404, detail="账号不存在，请先注册")

    stored_hash = account.get("password_hash", "")
    if not stored_hash:
        raise HTTPException(status_code=400, detail="该账号未设置密码，请联系管理员")
    if stored_hash != _hash_password(password):
        raise HTTPException(status_code=401, detail="密码错误")

    token = _issue_token(account["account_id"])

    # 读最新 account
    accounts = _load_user_accounts()
    account  = accounts.get(account["account_id"], account)

    return _account_response(account, token)


# ── /user/agent ───────────────────────────────────────────────────────
@router.post("/user/agent", tags=["用户"])
async def update_agent_profile(
    user_token:  str = Form(..., description="登录 token"),
    name:        str = Form("小助手",   description="智能体名字"),
    personality: str = Form("热心、耐心", description="性格特征"),
    tone:        str = Form("亲切温暖", description="说话音调"),
    style:       str = Form("鼓励式教学", description="教学风格"),
):
    """自定义用户的 AI 智能体性格，影响所有生成内容的风格。需要 agent 权限。"""
    from core.auth import require_permission
    account = require_permission(user_token, "agent")

    accounts = _load_user_accounts()
    aid      = account["account_id"]
    accounts[aid]["agent_profile"] = {
        "name":        name,
        "personality": personality,
        "tone":        tone,
        "style":       style,
    }
    _save_user_accounts(accounts)
    return {"ok": True, "agent_profile": accounts[aid]["agent_profile"]}


# ── /user/me ──────────────────────────────────────────────────────────
@router.get("/user/me", tags=["用户"])
async def get_me(user_token: str):
    """获取当前登录用户信息。"""
    account = _verify_user_token_full(user_token)
    return _account_response(account, user_token)
