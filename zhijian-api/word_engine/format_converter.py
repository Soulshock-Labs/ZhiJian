"""
格式转换器——把 AI 原始输出转成标准格式

输入：AI 生成的原始文本（可能格式混乱）
输出：标准化格式（"周一《活动1》\n周二《活动2》..."）

核心逻辑：
1. 智能分割文本（按 \n、，、。等）
2. 移除前缀（周一、【领域】等）
3. 按规范格式重组输出
"""
import re
from typing import Optional
from .format_spec import FORMAT_SPEC, get_spec


def _split_items(raw: str, max_items: Optional[int] = None) -> list[str]:
    """智能分割文本成列表项"""
    raw = str(raw or "").strip()
    if not raw:
        return []

    # 先按换行分
    items = [x.strip() for x in raw.split('\n') if x.strip()]

    if len(items) == 1:
        # 再按中文标点分
        items = re.split(r'[。，、;；,]', items[0])
        items = [x.strip() for x in items if x.strip()]

    # 移除开头的"周一""【健康】"等前缀
    cleaned = []
    for item in items:
        # 移除"周一"、"星期一"等日期前缀
        item = re.sub(r'^(?:周[一二三四五]|星期[一二三四五])\s*[·：:]*\s*', '', item)
        # 移除"【健康】"等领域前缀
        item = re.sub(r'^【[^】]+】\s*', '', item)
        # 移除《》括号内的重复标签
        item = item.strip()
        if item:
            cleaned.append(item)

    if max_items:
        cleaned = cleaned[:max_items]

    return cleaned


def normalize_field(field_id: str, raw: str, class_level: str = "") -> str:
    """
    根据格式规范，把 AI 原始输出转换成标准格式

    Args:
        field_id: 字段 ID（如 "outdoor", "life"）
        raw: AI 生成的原始文本
        class_level: 班级等级（用于规范覆盖）

    Returns:
        标准化的格式化文本
    """
    spec = get_spec(field_id, class_level)
    if not spec:
        return str(raw or "").strip()

    raw = str(raw or "").strip()
    if not raw:
        return ""

    field_type = spec.get("type")

    # ── 日期分行列表（study, game, outdoor） ──
    if field_type == "daily_list":
        items = _split_items(raw)
        days = spec.get("days", 5)
        day_labels = spec.get("day_labels", ("周一", "周二", "周三", "周四", "周五"))
        prefix = spec.get("prefix", "{}")

        # 若项数不足，用最后一项填充
        while len(items) < days:
            items.append(items[-1] if items else "（活动）")

        # 若超过，截断
        items = items[:days]

        # 构造输出
        lines = []
        for i, item in enumerate(items):
            day_label = day_labels[i] if i < len(day_labels) else f"周{i+1}"
            # 如果 prefix 包含 {}，用它来包裹项
            if "{}" in prefix:
                formatted = prefix.format(item)
            else:
                formatted = item
            lines.append(f"{day_label} {formatted}")

        return "\n".join(lines)

    # ── 条目列表（life, family, environment, area） ──
    elif field_type == "bullet_list":
        items = _split_items(raw, max_items=spec.get("max_items"))
        if not items:
            return ""

        lines = []
        for i, item in enumerate(items, 1):
            # 自动加编号
            formatted = f"{i}. {item}"
            lines.append(formatted)

        return "\n".join(lines)

    # ── 纯文本（morning, departure） ──
    elif field_type == "text":
        return raw

    return raw


def validate_field(field_id: str, formatted: str, class_level: str = "") -> tuple[bool, str]:
    """
    验证字段是否符合格式规范
    返回 (是否通过, 错误信息)
    """
    spec = get_spec(field_id, class_level)
    if not spec:
        return True, ""

    formatted = str(formatted or "").strip()
    if not formatted:
        return True, ""

    field_type = spec.get("type")
    lines = formatted.split("\n")

    # ── 验证日期分行列表 ──
    if field_type == "daily_list":
        expected_days = spec.get("days", 5)
        actual_days = len(lines)

        if actual_days != expected_days:
            return False, f"{field_id}：应有 {expected_days} 天，实际 {actual_days} 行"

        # 检查唯一性
        if spec.get("require_unique"):
            # 提取每行的活动名（去掉日期前缀）
            contents = [re.sub(r'^周[一二三四五]\s+', '', line.strip()) for line in lines]
            if len(set(contents)) != len(contents):
                return False, f"{field_id}：五天内容重复"

        return True, ""

    # ── 验证条目列表 ──
    elif field_type == "bullet_list":
        max_items = spec.get("max_items", 3)
        actual_items = len(lines)

        if actual_items > max_items:
            return False, f"{field_id}：最多 {max_items} 项，实际 {actual_items} 项"

        return True, ""

    # ── 纯文本不验证 ──
    elif field_type == "text":
        return True, ""

    return True, ""
