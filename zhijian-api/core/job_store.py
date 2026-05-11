from __future__ import annotations

import time

_JOB_STORE: dict[str, dict] = {}
_JOB_TTL = 600  # 10 分钟过期


def evict_expired() -> None:
    now = time.time()
    expired = [k for k, v in _JOB_STORE.items() if now - v.get("started_at", now) > _JOB_TTL]
    for k in expired:
        _JOB_STORE.pop(k, None)
