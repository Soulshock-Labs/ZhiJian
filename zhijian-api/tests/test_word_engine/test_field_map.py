"""
单元测试：word_engine.field_map

覆盖：
- match_field 关键字匹配
- _weekday_tag_from_header 星期表头识别
- _build_weekday_domain_plan 五大领域分配
- CELL_KEYWORD_MAP 数据完整性
"""
import unittest
from word_engine.field_map import (
    match_field,
    _weekday_tag_from_header,
    _build_weekday_domain_plan,
    CELL_KEYWORD_MAP,
    _ACTIVITY_FIELDS,
    ACTIVITY_LABEL_MAP,
    FIVE_DOMAINS,
    PHILOSOPHY_HINTS,
    CLASS_LEVEL_HINTS,
)


class TestMatchField(unittest.TestCase):
    """match_field 关键字匹配"""

    def test_basic_match(self):
        """基础关键字匹配"""
        self.assertEqual(match_field("户外活动"), "outdoor")
        self.assertEqual(match_field("生活活动"), "life")
        self.assertEqual(match_field("游戏活动"), "game")

    def test_alias_match(self):
        """别名匹配"""
        self.assertEqual(match_field("户外与体能活动"), "outdoor")
        self.assertEqual(match_field("体能活动"), "outdoor")
        self.assertEqual(match_field("生活活动与保育"), "life")

    def test_morning_aliases(self):
        """晨间运动各种别名"""
        for alias in ["晨间运动", "晨间", "早谈", "晨谈", "早操"]:
            self.assertEqual(match_field(alias), "morning",
                             f"别名 '{alias}' 应匹配 morning")

    def test_match_within_longer_text(self):
        """关键字在长文本中也能匹配"""
        self.assertEqual(match_field("本周户外活动安排"), "outdoor")

    def test_no_match_returns_none(self):
        """无匹配返回 None"""
        self.assertIsNone(match_field("完全无关的随机文字xyz"))
        self.assertIsNone(match_field(""))

    def test_compact_text_match(self):
        """支持 Word 拆分 run 的拼合文本匹配（含空格/换行）"""
        # 模拟 Word 表格内容被拆成多段
        self.assertEqual(match_field("户外\n\n活动"), "outdoor")
        self.assertEqual(match_field("户 外 活 动"), "outdoor")

    def test_whitespace_handling(self):
        """前后空白不影响匹配"""
        self.assertEqual(match_field("   户外活动   "), "outdoor")

    def test_theme_field_match(self):
        """主题字段匹配"""
        self.assertEqual(match_field("教学主题"), "theme")
        self.assertEqual(match_field("活动主题"), "theme")
        self.assertEqual(match_field("本月主题"), "theme")


class TestWeekdayTagFromHeader(unittest.TestCase):
    """_weekday_tag_from_header 星期识别"""

    def test_chinese_weekdays(self):
        """中文星期识别"""
        self.assertEqual(_weekday_tag_from_header("星期一"), "mon")
        self.assertEqual(_weekday_tag_from_header("星期五"), "fri")

    def test_short_weekdays(self):
        """简写周X识别"""
        self.assertEqual(_weekday_tag_from_header("周一"), "mon")
        self.assertEqual(_weekday_tag_from_header("周三"), "wed")

    def test_no_match_returns_none(self):
        """无匹配返回 None"""
        self.assertIsNone(_weekday_tag_from_header("不相关文字"))
        self.assertIsNone(_weekday_tag_from_header(""))
        self.assertIsNone(_weekday_tag_from_header(None))

    def test_match_within_text(self):
        """在长文本中也能识别"""
        self.assertEqual(_weekday_tag_from_header("第一天 周一 上午"), "mon")


class TestWeekdayDomainPlan(unittest.TestCase):
    """_build_weekday_domain_plan 五大领域分配"""

    def test_returns_all_five_days(self):
        """返回包含周一到周五"""
        plan = _build_weekday_domain_plan("春天")
        self.assertEqual(set(plan.keys()), {"mon", "tue", "wed", "thu", "fri"})

    def test_all_domains_used(self):
        """五天恰好覆盖五大领域"""
        plan = _build_weekday_domain_plan("春天")
        self.assertEqual(set(plan.values()), set(FIVE_DOMAINS))

    def test_deterministic_for_same_theme(self):
        """相同主题应产生相同分配"""
        plan1 = _build_weekday_domain_plan("春天")
        plan2 = _build_weekday_domain_plan("春天")
        self.assertEqual(plan1, plan2)

    def test_different_themes_can_differ(self):
        """不同主题可能产生不同起始顺序"""
        plan_a = _build_weekday_domain_plan("a")
        plan_z = _build_weekday_domain_plan("zzzzzz")
        # 不强制要求一定不同，但起始位应该可能不同（不是全部固定）
        # 这个测试只确保函数可处理不同输入
        self.assertEqual(len(plan_a), 5)
        self.assertEqual(len(plan_z), 5)

    def test_empty_theme(self):
        """空主题不报错"""
        plan = _build_weekday_domain_plan("")
        self.assertEqual(len(plan), 5)


class TestDataIntegrity(unittest.TestCase):
    """数据完整性检查"""

    def test_cell_keyword_map_not_empty(self):
        """CELL_KEYWORD_MAP 非空"""
        self.assertGreater(len(CELL_KEYWORD_MAP), 0)

    def test_all_mapped_fields_are_strings(self):
        """所有映射目标都是字符串"""
        for keywords, field in CELL_KEYWORD_MAP:
            self.assertIsInstance(field, str)
            self.assertGreater(len(field), 0)
            self.assertIsInstance(keywords, list)
            self.assertGreater(len(keywords), 0)

    def test_activity_fields_consistency(self):
        """_ACTIVITY_FIELDS 应包含 ACTIVITY_LABEL_MAP 中的 key"""
        for field in ACTIVITY_LABEL_MAP.keys():
            self.assertIn(field, _ACTIVITY_FIELDS,
                          f"{field} 在 ACTIVITY_LABEL_MAP 但不在 _ACTIVITY_FIELDS")

    def test_philosophy_hints_have_content(self):
        """所有教育理念都有提示词"""
        for name, hint in PHILOSOPHY_HINTS.items():
            self.assertGreater(len(hint), 20, f"{name} 提示词过短")

    def test_class_level_hints_cover_three_levels(self):
        """覆盖小中大班"""
        self.assertIn("小班", CLASS_LEVEL_HINTS)
        self.assertIn("中班", CLASS_LEVEL_HINTS)
        self.assertIn("大班", CLASS_LEVEL_HINTS)

    def test_five_domains_count(self):
        """五大领域恰好 5 个"""
        self.assertEqual(len(FIVE_DOMAINS), 5)


if __name__ == "__main__":
    unittest.main()
