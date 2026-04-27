from __future__ import annotations

from uuid import uuid4

from fastapi import HTTPException

from core.state import FIRESTORE_ENABLED, _fs, logger
from core.utils import _utc_iso
from services.data_store import _load_user_accounts, _save_user_accounts

# 每个用户最多同时保留的 token 数（小程序 + Web + Android + 备用）
_MAX_TOKENS = 5


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
            "active_tokens": [],   # 多端 token 列表
        }
        _save_user_accounts(accounts)
    return accounts[openid]


def _generate_user_token(openid: str) -> str:
    """生成用户会话 token（不写入，由调用方写入 active_tokens）。"""
    return f"ut_{uuid4().hex}"


def _add_token_to_account(accounts: dict, user_id: str, token: str) -> None:
    """
    把新 token 追加进 active_tokens 列表（多端支持）。
    同时保持向后兼容：last_token 字段仍指向最新 token。
    超出 _MAX_TOKENS 时淘汰最旧的。
    """
    entry = accounts[user_id]
    tokens: list[str] = list(entry.get("active_tokens") or [])

    # 新 token 放最后（最新）
    if token not in tokens:
        tokens.append(token)

    # 超出上限时从头部淘汰最旧的
    if len(tokens) > _MAX_TOKENS:
        tokens = tokens[-_MAX_TOKENS:]

    entry["active_tokens"] = tokens
    entry["last_token"] = token   # 向后兼容旧字段


def _verify_user_token(token: str) -> str:
    """
    验证 user_token，返回对应 user_id（openid）。失败抛 401。
    支持多端同时在线：检查 active_tokens 列表，兼容旧 last_token 字段。
    """
    token = str(token or "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="请先登录（user_token 缺失）")

    if FIRESTORE_ENABLED:
        try:
            # Firestore：先查 active_tokens 数组包含，再回退查 last_token
            fs = _fs()
            docs = fs.collection("users").where("active_tokens", "array_contains", token).limit(1).stream()
            for doc in docs:
                return doc.id
            # 回退：旧用户只有 last_token
            docs = fs.collection("users").where("last_token", "==", token).limit(1).stream()
            for doc in docs:
                return doc.id
        except Exception as e:
            logger.warning("Firestore token 验证失败，回退本地：%s", e)

    # 本地回退（active_tokens 优先，兼容旧 last_token）
    accounts = _load_user_accounts()
    for user_id, entry in accounts.items():
        active = entry.get("active_tokens") or []
        if token in active:
            return user_id
        if entry.get("last_token") == token:
            return user_id

    raise HTTPException(status_code=401, detail="token 无效或已过期，请重新登录")
