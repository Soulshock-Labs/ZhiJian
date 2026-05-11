"""
单元测试：word_engine.format_converter

覆盖：
- _split_items 智能分割
- normalize_field 各类型转换
- validate_field 校验逻辑
- 三个已修复的优化点（双重编号/唯一性/字数）
"""
import unittest
from word_engine.format_converter import (
    _split_items,
    normalize_field,
    validate_field,
    _DEFAULT_ACTIVITY_POOL,
)


class TestSplitItems(unittest.TestCase):
    """_split_items 智能分割测试"""

    def test_empty_input(self):
        """空输入返回空列表"""
        self.assertEqual(_split_items(""), [])
        self.assertEqual(_split_items(None), [])
        self.assertEqual(_split_items("   "), [])

    def test_newline_split(self):
        """按换行分割"""
        result = _split_items("活动1\n活动2\n活动3")
        self.assertEqual(result, ["活动1", "活动2", "活动3"])

    def test_chinese_punctuation_split(self):
        """中文标点分割（逗号、句号、顿号等）"""
        result = _split_items("活动1，活动2、活动3。活动4")
        self.assertEqual(result, ["活动1", "活动2", "活动3", "活动4"])

    def test_remove_day_prefix(self):
        """移除周一/星期一前缀"""
        result = _split_items("周一 活动1\n周二 活动2")
        self.assertEqual(result, ["活动1", "活动2"])

    def test_remove_domain_prefix(self):
        """移除【健康】等领域前缀"""
        result = _split_items("【健康】跑步\n【语言】阅读")
        self.assertEqual(result, ["跑步", "阅读"])

    def test_remove_existing_numbering(self):
        """移除已有编号（修复点1：防止双重编号）"""
        result = _split_items("1. 项目1\n2. 项目2\n3. 项目3")
        self.assertEqual(result, ["项目1", "项目2", "项目3"])

    def test_remove_existing_numbering_chinese(self):
        """移除中文标点的编号"""
        result = _split_items("1．项目1\n2．项目2")
        self.assertEqual(result, ["项目1", "项目2"])

    def test_max_items_truncation(self):
        """超出 max_items 应截断"""
        result = _split_items("a,b,c,d,e", max_items=3)
        self.assertEqual(result, ["a", "b", "c"])


class TestNormalizeFieldDailyList(unittest.TestCase):
    """normalize_field 日期列表（daily_list）"""

    def test_outdoor_basic(self):
        """outdoor 基础转换"""
        result = normalize_field("outdoor", "跑步,爬山,踩高跷,滑梯,荡秋千")
        self.assertIn("周一 《跑步》", result)
        self.assertIn("周五 《荡秋千》", result)
        self.assertEqual(len(result.split("\n")), 5)

    def test_outdoor_with_prefix_in_input(self):
        """带日期前缀的输入"""
        raw = "周一 跑步\n周二 爬山\n周三 滑梯\n周四 球类\n周五 荡秋千"
        result = normalize_field("outdoor", raw)
        self.assertIn("周一 《跑步》", result)
        self.assertNotIn("周一 周一", result)

    def test_unique_fill_when_insufficient(self):
        """修复点2：唯一性字段不足时从池中补充不同项"""
        result = normalize_field("outdoor", "跑步")
        lines = result.split("\n")
        self.assertEqual(len(lines), 5)
        # 应该没有重复
        contents = [line.split(" ", 1)[1] for line in lines]
        self.assertEqual(len(set(contents)), 5, f"应五个不同活动，实际：{contents}")

    def test_unique_fill_excludes_existing(self):
        """补充时不应与已有项重复"""
        result = normalize_field("outdoor", "散步")  # 散步在池中
        lines = result.split("\n")
        contents = [line.split(" ", 1)[1] for line in lines]
        self.assertEqual(contents.count("《散步》"), 1, "已有项不应重复添加")

    def test_truncate_when_too_many(self):
        """超出 days 应截断"""
        result = normalize_field("outdoor", "a,b,c,d,e,f,g,h")
        self.assertEqual(len(result.split("\n")), 5)

    def test_study_no_unique_required(self):
        """study 无唯一性要求，可以重复填充"""
        result = normalize_field("study", "阅读")
        lines = result.split("\n")
        self.assertEqual(len(lines), 5)


class TestNormalizeFieldBulletList(unittest.TestCase):
    """normalize_field 条目列表（bullet_list）"""

    def test_life_basic(self):
        """life 基础转换"""
        result = normalize_field("life", "能洗手，能整理玩具，能排队")
        lines = result.split("\n")
        self.assertEqual(lines[0], "1. 能洗手")
        self.assertEqual(lines[1], "2. 能整理玩具")
        self.assertEqual(lines[2], "3. 能排队")

    def test_no_double_numbering(self):
        """修复点1：输入已有编号时不应双重编号"""
        result = normalize_field("life", "1. 能洗手\n2. 能整理玩具")
        self.assertNotIn("1. 1.", result)
        self.assertNotIn("2. 2.", result)
        self.assertIn("1. 能洗手", result)

    def test_xiaoban_max_items_override(self):
        """小班 life max_items=2，应截断"""
        result = normalize_field("life", "项目1,项目2,项目3,项目4", "小班")
        lines = result.split("\n")
        self.assertEqual(len(lines), 2)


class TestNormalizeFieldText(unittest.TestCase):
    """normalize_field 纯文本"""

    def test_morning_pass_through(self):
        """text 类型直接返回"""
        text = "晨间活动包括早操、自由游戏。"
        result = normalize_field("morning", text)
        self.assertEqual(result, text)


class TestValidateField(unittest.TestCase):
    """validate_field 校验逻辑"""

    def test_valid_outdoor(self):
        """合规的 outdoor 应通过"""
        formatted = normalize_field("outdoor", "跑步,爬山,踩高跷,滑梯,荡秋千")
        valid, msg = validate_field("outdoor", formatted)
        self.assertTrue(valid, f"应通过但报：{msg}")

    def test_day_count_mismatch(self):
        """天数不匹配应失败"""
        valid, msg = validate_field("outdoor", "周一 《跑步》")
        self.assertFalse(valid)
        self.assertIn("应有 5 天", msg)

    def test_unique_violation(self):
        """唯一性违反应失败"""
        formatted = "周一 《跑步》\n周二 《跑步》\n周三 《跑步》\n周四 《跑步》\n周五 《跑步》"
        valid, msg = validate_field("outdoor", formatted)
        self.assertFalse(valid)
        self.assertIn("重复", msg)

    def test_max_chars_exceeded_daily(self):
        """修复点3：daily_list 单项超字数应失败"""
        long_name = "这是超过十个字符的非常长的活动名称"
        formatted = f"周一 《{long_name}》\n周二 《b》\n周三 《c》\n周四 《d》\n周五 《e》"
        valid, msg = validate_field("outdoor", formatted)
        self.assertFalse(valid)
        self.assertIn("超过限制", msg)

    def test_max_chars_exceeded_bullet(self):
        """修复点3：bullet_list 单项超字数应失败"""
        long_text = "x" * 25  # life 限制 20 字
        formatted = f"1. {long_text}\n2. 短\n3. 短"
        valid, msg = validate_field("life", formatted)
        self.assertFalse(valid)
        self.assertIn("超过限制", msg)

    def test_bullet_max_items_exceeded(self):
        """bullet_list 项数超限应失败"""
        formatted = "1. a\n2. b\n3. c\n4. d"
        valid, msg = validate_field("life", formatted)
        self.assertFalse(valid)
        self.assertIn("最多", msg)

    def test_empty_formatted_passes(self):
        """空内容通过校验（不强制有内容）"""
        valid, msg = validate_field("outdoor", "")
        self.assertTrue(valid)


class TestDefaultActivityPool(unittest.TestCase):
    """默认活动池配置"""

    def test_outdoor_pool_has_enough_items(self):
        """outdoor 池至少 5 个，满足填充需求"""
        self.assertGreaterEqual(len(_DEFAULT_ACTIVITY_POOL["outdoor"]), 5)

    def test_game_pool_has_enough_items(self):
        """game 池至少 5 个"""
        self.assertGreaterEqual(len(_DEFAULT_ACTIVITY_POOL["game"]), 5)

    def test_pool_items_are_unique(self):
        """池内不应有重复"""
        for field_id, pool in _DEFAULT_ACTIVITY_POOL.items():
            self.assertEqual(len(pool), len(set(pool)),
                             f"{field_id} 池有重复")


if __name__ == "__main__":
    unittest.main()
