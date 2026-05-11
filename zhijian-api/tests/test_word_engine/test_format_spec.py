"""
单元测试：word_engine.format_spec

覆盖：
- FORMAT_SPEC 数据完整性
- get_spec() 基础查询
- SPEC_OVERRIDES 班级覆盖逻辑
"""
import unittest
from word_engine.format_spec import FORMAT_SPEC, SPEC_OVERRIDES, get_spec


class TestFormatSpecData(unittest.TestCase):
    """FORMAT_SPEC 数据完整性检查"""

    def test_all_required_fields_exist(self):
        """所有 9 个核心字段必须定义"""
        required = ["outdoor", "game", "study", "life", "environment",
                    "family", "area", "morning", "departure"]
        for field in required:
            self.assertIn(field, FORMAT_SPEC, f"缺少字段 {field}")

    def test_daily_list_fields_have_required_keys(self):
        """daily_list 类型必须有 days/day_labels"""
        for field_id, spec in FORMAT_SPEC.items():
            if spec.get("type") == "daily_list":
                self.assertIn("days", spec, f"{field_id} 缺少 days")
                self.assertIn("day_labels", spec, f"{field_id} 缺少 day_labels")
                self.assertEqual(len(spec["day_labels"]), spec["days"],
                                 f"{field_id} day_labels 数量与 days 不匹配")

    def test_bullet_list_fields_have_max_items(self):
        """bullet_list 类型必须有 max_items"""
        for field_id, spec in FORMAT_SPEC.items():
            if spec.get("type") == "bullet_list":
                self.assertIn("max_items", spec, f"{field_id} 缺少 max_items")
                self.assertGreater(spec["max_items"], 0)

    def test_field_types_are_valid(self):
        """type 只能是 daily_list/bullet_list/text"""
        valid_types = {"daily_list", "bullet_list", "text"}
        for field_id, spec in FORMAT_SPEC.items():
            self.assertIn(spec.get("type"), valid_types, f"{field_id} type 非法")


class TestGetSpec(unittest.TestCase):
    """get_spec() 函数测试"""

    def test_basic_query_returns_copy(self):
        """get_spec 返回的是副本，修改不影响原始"""
        spec = get_spec("outdoor")
        spec["days"] = 999
        original = get_spec("outdoor")
        self.assertNotEqual(original["days"], 999)

    def test_unknown_field_returns_empty(self):
        """未知字段返回空字典"""
        self.assertEqual(get_spec("nonexistent"), {})

    def test_empty_class_level_no_override(self):
        """空 class_level 不应用覆盖"""
        spec = get_spec("life", "")
        self.assertEqual(spec["max_items"], FORMAT_SPEC["life"]["max_items"])


class TestSpecOverrides(unittest.TestCase):
    """SPEC_OVERRIDES 班级覆盖逻辑"""

    def test_xiaoban_life_max_items(self):
        """小班 life 应覆盖 max_items=2"""
        spec = get_spec("life", "小班")
        self.assertEqual(spec["max_items"], 2)

    def test_xiaoban_study_days(self):
        """小班 study 应覆盖 days=1"""
        spec = get_spec("study", "小班")
        self.assertEqual(spec["days"], 1)

    def test_daban_life_max_items(self):
        """大班 life 应覆盖 max_items=4"""
        spec = get_spec("life", "大班")
        self.assertEqual(spec["max_items"], 4)

    def test_zhongban_no_override(self):
        """中班无覆盖，使用默认值"""
        spec = get_spec("life", "中班")
        self.assertEqual(spec["max_items"], FORMAT_SPEC["life"]["max_items"])

    def test_override_preserves_other_keys(self):
        """覆盖只改指定 key，其他保留"""
        spec = get_spec("life", "小班")
        self.assertEqual(spec["type"], "bullet_list")
        self.assertEqual(spec["max_items"], 2)


if __name__ == "__main__":
    unittest.main()
