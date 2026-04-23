from __future__ import annotations

from uuid import uuid4

from fastapi import HTTPException

from core.state import FIRESTORE_ENABLED, _fs, logger
from core.utils import _utc_iso
from services.data_store import _load_user_accounts, _save_user_accounts

def _get_or_create_user(openid: str) -> dict:
    """获取或创建用户档案（含 agent_profile）。"""
    accounts = _load_user_accounts()
    if openid not in accounts:
        accounts[openid] = {
            "openid": openid,
            "user_id": None,
            "created_at": _utc_iso(),
            "agent_profile": {
                "name": "小助手",
                "personality": "热心、耐心",
                "tone": "亲切温暖",
                "style": "鼓励式教学",
            },
            "last_token": None,
        }
        _save_user_accounts(accounts)
    return accounts[openid]

def _generate_user_token(openid: str) -> str:
    """生成用户会话 token。"""
    return f"ut_{uuid4().hex}"

def _verify_user_token(token: str) -> str:
    """验证 user_token，返回对应 openid。失败抛 401。"""
    token = str(token or "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="请先登录（user_token 缺失）")
    if FIRESTORE_ENABLED:
        try:
            docs = _fs().collection("users").where("last_token", "==", token).limit(1).stream()
            for doc in docs:
                return doc.id
        except Exception as e:
            logger.warning("Firestore token 验证失败，回退本地：%s", e)
    # 本地回退
    accounts = _load_user_accounts()
    for openid, entry in accounts.items():
        if entry.get("last_token") == token:
            return openid
    raise HTTPException(status_code=401, detail="token 无效或已过期，请重新登录")
