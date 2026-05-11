"""
格式规范定义——与 AI Prompt 完全分离
每个字段定义一次，改新模板只改这里

不涉及内容生成，纯粹是格式约束。
"""

FORMAT_SPEC = {
    "outdoor": {
        "type": "daily_list",
        "days": 5,
        "day_labels": ("周一", "周二", "周三", "周四", "周五"),
        "prefix": "《{}》",
        "max_chars_per_item": 10,
        "require_unique": True,
        "separator": "\n",
    },

    "game": {
        "type": "daily_list",
        "days": 5,
        "day_labels": ("周一", "周二", "周三", "周四", "周五"),
        "prefix": "《{}》",
        "max_chars_per_item": 8,
        "require_unique": True,
        "separator": "\n",
    },

    "study": {
        "type": "daily_list",
        "days": 5,
        "day_labels": ("周一", "周二", "周三", "周四", "周五"),
        "max_chars_per_item": 10,
        "separator": "\n",
    },

    "life": {
        "type": "bullet_list",
        "max_items": 3,
        "max_chars_per_item": 20,
        "separator": "\n",
    },

    "environment": {
        "type": "bullet_list",
        "max_items": 3,
        "max_chars_per_item": 30,
        "separator": "\n",
    },

    "family": {
        "type": "bullet_list",
        "max_items": 3,
        "max_chars_per_item": 25,
        "separator": "\n",
    },

    "area": {
        "type": "bullet_list",
        "max_items": 3,
        "max_chars_per_item": 30,
        "separator": "\n",
    },

    "morning": {
        "type": "text",
        "max_chars": 200,
    },

    "departure": {
        "type": "text",
        "max_chars": 200,
    },
}

# 允许按班级覆盖规范
SPEC_OVERRIDES = {
    "小班": {
        "life": {"max_items": 2},
        "study": {"days": 1},
    },
    "大班": {
        "life": {"max_items": 4, "max_chars_per_item": 25},
        "environment": {"max_items": 4},
    },
}


def get_spec(field_id: str, class_level: str = "") -> dict:
    """获取字段规范，支持班级覆盖"""
    spec = FORMAT_SPEC.get(field_id, {}).copy()
    if class_level in SPEC_OVERRIDES:
        override = SPEC_OVERRIDES[class_level].get(field_id, {})
        spec.update(override)
    return spec
