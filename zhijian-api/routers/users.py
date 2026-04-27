from __future__ import annotations

from fastapi import APIRouter, Body, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse, StreamingResponse

import hashlib
import json
import os
from datetime import datetime, timezone

from core.utils import _utc_iso
from services.data_store import _load_user_accounts, _load_user_services, _save_user_accounts
from services.user_service import _generate_user_token, _get_or_create_user, _verify_user_token

router = APIRouter()


def _hash_password(password: str) -> str:
    """SHA-256 哈希密码，不明文存储。"""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def _build_service_info(user_id: str) -> dict:
    """读取用户权益状态，提取公共逻辑避免重复。"""
    user_services = _load_user_services()
    entry = user_services.get(user_id, {})
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
@router.post("/user/wxlogin", tags=["用户"])
async def user_wxlogin(
    code: str = Form(..., description="微信 wx.login() 返回的 code"),
):
    """
    小程序登录接口：
    1. 用 code 换微信 openid（需配置 WECHAT_APPID + WECHAT_SECRET）
    2. 自动创建用户档案（含 agent_profile）
    3. 返回 user_token 用于后续所有请求认证
    """
    import httpx

    appid  = os.getenv("WECHAT_APPID", "")
    secret = os.getenv("WECHAT_SECRET", "")

    openid = ""
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
        # 未配置微信密钥时，用 code 本身作为 openid（本地开发用）
        openid = f"dev_{code[:16]}"

    user = _get_or_create_user(openid)
    token = _generate_user_token(openid)

    # 写 token 到 Firestore + 本地
    accounts = _load_user_accounts()
    accounts[openid]["last_token"] = token
    accounts[openid]["last_login"] = _utc_iso()
    # 存量微信用户静默补填角色字段
    accounts[openid].setdefault("role",   "teacher")
    accounts[openid].setdefault("org_id", "")
    _save_user_accounts(accounts)

    return {
        "ok":           True,
        "openid":       openid,
        "user_token":   token,
        "role":         accounts[openid]["role"],
        "org_id":       accounts[openid]["org_id"],
        "agent_profile": user.get("agent_profile", {}),
        "user_id":      user.get("user_id") or "",
        "is_new":       user.get("created_at") == accounts[openid].get("last_login"),
    }
@router.post("/user/agent", tags=["用户"])
async def update_agent_profile(
    user_token: str = Form(..., description="登录 token"),
    name: str = Form("小助手", description="智能体名字"),
    personality: str = Form("热心、耐心", description="性格特征"),
    tone: str = Form("亲切温暖", description="说话音调"),
    style: str = Form("鼓励式教学", description="教学风格"),
):
    """自定义用户的 AI 智能体性格，影响所有生成内容的风格。"""
    openid = _verify_user_token(user_token)
    accounts = _load_user_accounts()
    accounts[openid]["agent_profile"] = {
        "name": name,
        "personality": personality,
        "tone": tone,
        "style": style,
    }
    _save_user_accounts(accounts)
    return {"ok": True, "agent_profile": accounts[openid]["agent_profile"]}
@router.post("/user/register", tags=["用户"])
async def user_register(payload: dict = Body(...)):
    """
    注册：手机号 + 密码。
    - 手机号已存在 → 报错（请直接登录）
    - 新用户 → 创建账号，返回 token 直接登录
    """
    phone    = str(payload.get("phone", "") or payload.get("user_id", "")).strip()
    password = str(payload.get("password", "")).strip()

    if len(phone) < 5:
        raise HTTPException(status_code=400, detail="请填写有效手机号（至少5位）")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="密码至少6位")

    user_id  = phone.lower()
    accounts = _load_user_accounts()

    if user_id in accounts:
        raise HTTPException(status_code=409, detail="该手机号已注册，请直接登录")

    now_iso = _utc_iso()
    token   = _generate_user_token(user_id)
    accounts[user_id] = {
        "user_id":        user_id,
        "phone":          phone,
        "password_hash":  _hash_password(password),
        "role":           "teacher",
        "org_id":         "",
        "last_token":     token,
        "last_login":     now_iso,
        "created_at_utc": now_iso,
        "updated_at_utc": now_iso,
    }
    _save_user_accounts(accounts)

    return {
        "ok":             True,
        "is_new":         True,
        "user_id":        user_id,
        "user_token":     token,
        "role":           "teacher",
        "org_id":         "",
        "created_at_utc": now_iso,
        "service":        _build_service_info(user_id),
    }


@router.post("/user/login", tags=["用户"])
async def user_login(payload: dict = Body(...)):
    """
    登录：手机号 + 密码，返回 user_token。
    """
    phone    = str(payload.get("phone", "") or payload.get("user_id", "")).strip()
    password = str(payload.get("password", "")).strip()

    if not phone or not password:
        raise HTTPException(status_code=400, detail="请填写手机号和密码")

    user_id  = phone.lower()
    accounts = _load_user_accounts()

    if user_id not in accounts:
        raise HTTPException(status_code=404, detail="账号不存在，请先注册")

    entry = accounts[user_id]

    # 存量用户（无密码字段）静默补填结构，但不允许空密码登录
    stored_hash = entry.get("password_hash", "")
    if not stored_hash:
        raise HTTPException(status_code=400, detail="该账号未设置密码，请联系管理员或重新注册")

    if stored_hash != _hash_password(password):
        raise HTTPException(status_code=401, detail="密码错误")

    now_iso = _utc_iso()
    token   = _generate_user_token(user_id)
    entry["last_token"]     = token
    entry["last_login"]     = now_iso
    entry["updated_at_utc"] = now_iso
    entry.setdefault("role",   "teacher")
    entry.setdefault("org_id", "")
    _save_user_accounts(accounts)

    return {
        "ok":         True,
        "user_id":    user_id,
        "user_token": token,
        "role":       entry["role"],
        "org_id":     entry["org_id"],
        "service":    _build_service_info(user_id),
    }
