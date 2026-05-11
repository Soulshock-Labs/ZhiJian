from fastapi import HTTPException


def _raise_if_invalid_key(exc: Exception) -> None:
    """401 / invalid_api_key → 503，提示检查 MOONSHOT_API_KEY / DEEPSEEK_API_KEY。"""
    text = str(exc)
    low = text.lower()
    if (
        "401" in text
        or "invalid_api_key" in low
        or "incorrect api key" in low
    ):
        raise HTTPException(
            status_code=503,
            detail="AI API Key 无效或已过期，请检查 Cloud Run 环境变量 MOONSHOT_API_KEY / DEEPSEEK_API_KEY。",
        )


# 向后兼容别名（防止其他文件还引用旧名称）
_raise_if_invalid_dashscope_key = _raise_if_invalid_key
