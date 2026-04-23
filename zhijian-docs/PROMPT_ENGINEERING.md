# 智伴幼师 · Prompt 工程文档

**版本**: 1.0.0  
**最后更新**: 2026-04-14  
**作者**: Smart Teacher Team  

---

## 📋 目录

1. [核心理念](#核心理念)
2. [参考范本分析](#参考范本分析)
3. [Prompt 结构](#prompt-结构)
4. [质量标准](#质量标准)
5. [参数化模板](#参数化模板)
6. [版本控制](#版本控制)

---

## 核心理念

### 目标

生成与现有 1.7GB 教案库**风格一致、质量稳定**的幼儿园课程内容。

### 三个关键原则

| 原则 | 说明 |
|------|------|
| **风格一致性** | 所有输出都遵循最好的 10 个模板的结构和文风 |
| **质量可控性** | 明确的评估标准，便于迭代优化 |
| **可复现性** | 同样的输入，任何时间任何电脑都产生同样质量的输出 |

---

## 参考范本分析

### 最佳模板来源

```
小班: 第 1-2 周（春季启蒙）
中班: 第 8 周（长大真好）
大班: 第 15-16 周（毕业季规划）
```

### 标准模板结构

每个优秀教案包含：

```json
{
  "周目标": [
    "目标 1（行为动词 + 具体内容）",
    "目标 2（可测量、可观察）"
  ],
  "五大领域分配": {
    "周一": "健康",
    "周二": "语言",
    "周三": "社会",
    "周四": "科学",
    "周五": "艺术"
  },
  "每日活动": [
    {
      "day": "周一",
      "domain": "健康",
      "activity_name": "具体活动名称（如：踩高跷）",
      "materials": ["材料 1", "材料 2"],
      "process": "分步骤的玩法描述（100-150 字）",
      "focus": "观察重点（3-5 项幼儿发展维度）",
      "hint": "教师指导要点"
    }
  ],
  "儿歌/歌谣": [
    "歌谣名称或全文"
  ],
  "周反思": "本周幼儿发展亮点和下周关注点（100 字以内）"
}
```

### 高质量内容的特征

✅ **活动名称**
- 具体、有画面感（而非"体育运动"）
- 例：「踩高跷」「穿大鞋」「送快递的叔叔」

✅ **材料清单**
- 可具体采购（而非"体育器材"）
- 自制材料要有尺寸建议
- 例：「纸盒（30×20cm）、小红旗、泡沫盒」

✅ **玩法过程**
- 分 3-5 个步骤，每步 20-30 字
- 包含「导入 → 示范 → 幼儿操作 → 延伸」
- 体现班级年龄特点（小班更多示范，大班更多自主探索）

✅ **观察重点**
- 按发展维度（动作协调、社交能力、认知发展等）
- 具体到能「看到」的行为
- 例：「观察幼儿是否能保持平衡跨越障碍」

---

## Prompt 结构

### 系统 Prompt（System）

```
你是一位拥有 15 年经验的资深幼儿园教研主任，曾在全国示范幼儿园工作。

你的核心职责是编写**符合《幼儿园教育指导纲要》、兼具园本特色**的周计划和日教案。

## 三个绝对要求

1. **风格一致**：所有输出必须模仿提供的参考范本的结构、用词、逻辑
2. **质量标准**：
   - 每个活动都要有具体的材料清单和分步骤的玩法
   - 不允许泛泛而谈（禁止"体育运动""创意美术"之类的模糊表述）
   - 观察重点要可观察、可测量
3. **班级适配**：
   - 小班（3-4岁）：更多示范、更多重复、动作简单、强调安全
   - 中班（4-5岁）：平衡示范与探索、难度适中、开始有规则意识
   - 大班（5-6岁）：强调自主探索、挑战性高、数字和文字融入

## 严禁

- 编造不存在的活动游戏名称
- 写出"随意""自由发挥"这样模糊的表述
- 一周内两个以上相同领域的活动（要均衡 5 大领域）
- 写出与班级年龄不符的难度或风格
```

### 用户 Prompt（User）

结构：**参考范本 → 约束条件 → 具体请求 → 输出格式**

```
【参考范本】
[插入最好的 3 个模板作为示例]

【关键约束】
- 主题：{THEME}
- 班级：{CLASS_LEVEL}（3-4/4-5/5-6 岁）
- 教育理念：{PHILOSOPHY}
- 活动类型：{ACTIVITY_TYPES}

【具体要求】
1. 周目标：2-3 个，可测量、可观察
2. 五大领域均衡分配（健康、语言、社会、科学、艺术各 1-2 个）
3. 每日活动要包含：
   - 活动名称（具体、有画面感）
   - 所需材料（可采购或自制说明）
   - 分步骤的玩法（100-150 字）
   - 3-5 个观察重点
   - 教师指导要点
4. 配搭 1-2 首儿歌或歌谣
5. 周反思：本周亮点和下周关注点

【输出格式】
返回严格的 JSON，不要 Markdown，不要其他文字：
{
  "week_theme": "...",
  "goals": [...],
  "days": [
    {
      "day": "周一",
      "domain": "...",
      "activity_name": "...",
      "materials": [...],
      "process": "...",
      "observation": [...],
      "teacher_hint": "..."
    }
  ],
  "songs": [...],
  "reflection": "..."
}
```

---

## 质量标准

### 自评清单（生成后必须检查）

- [ ] 每个活动名称都具体可执行（不是类别名）
- [ ] 材料清单不超过 5 项，每项都能买到或自制
- [ ] 玩法分至少 3 步，每步有明确的教师和幼儿行为
- [ ] 观察重点用动词短语（"能否...""是否..."）
- [ ] 周内 5 大领域各至少 1 个，不超过 2 个
- [ ] 班级适配（查看年龄特性描述是否准确）
- [ ] 儿歌确实存在或逻辑通顺
- [ ] JSON 格式正确、可解析

### 评分标准

| 维度 | 满分 | 评估方法 |
|------|------|---------|
| **结构完整性** | 20 | JSON 完整、字段齐全 |
| **活动具体性** | 30 | 活动名称、材料、步骤是否都能执行 |
| **班级适配** | 20 | 难度、用词、重复是否符合班级年龄 |
| **创意与实用** | 20 | 新颖但可行（而非天马行空） |
| **文风一致** | 10 | 用词、句式是否匹配参考范本 |

---

## 参数化模板

### 环境变量配置

```bash
# .env 中添加
PROMPT_VERSION=1.0
TEMPLATE_EXAMPLES_PATH=knowledge_base/reference_templates.json
QUALITY_RUBRIC=prompt_engineering/quality_rubric.json
PHILOSOPHY_HINTS=prompt_engineering/philosophy_hints.json
CLASS_LEVEL_HINTS=prompt_engineering/class_level_hints.json
```

### Python 代码实现

```python
# prompt_config.py
from pathlib import Path
import json
from typing import Dict, List

class PromptTemplate:
    def __init__(self):
        self.version = "1.0.0"
        self.examples = self._load_examples()
        self.philosophy_hints = self._load_philosophy()
        self.class_hints = self._load_class_hints()
    
    def _load_examples(self) -> List[Dict]:
        """加载最好的 10 个参考范本"""
        path = Path("knowledge_base/reference_templates.json")
        with open(path, encoding="utf-8") as f:
            return json.load(f)["templates"][:3]  # 取前 3 个作为示例
    
    def _load_philosophy(self) -> Dict:
        """加载教育理念提示词"""
        path = Path("prompt_engineering/philosophy_hints.json")
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    
    def _load_class_hints(self) -> Dict:
        """加载班级特征提示词"""
        path = Path("prompt_engineering/class_level_hints.json")
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    
    def build_system_prompt(self) -> str:
        """构造系统 Prompt"""
        return """
你是一位拥有 15 年经验的资深幼儿园教研主任。

## 核心职责
编写符合《幼儿园教育指导纲要》、兼具园本特色的周计划。

## 绝对要求
1. 每个活动必须具体可执行（含材料清单和分步玩法）
2. 禁止泛泛而谈（无"体育运动""创意美术"这样的模糊表述）
3. 五大领域必须均衡分配
4. 班级适配（难度和表述要符合年龄）

## 输出格式
严格的 JSON，无 Markdown，无其他文字。
"""
    
    def build_user_prompt(
        self,
        theme: str,
        class_level: str,
        philosophy: str,
        activities: List[str],
    ) -> str:
        """构造用户 Prompt"""
        
        # 获取相关的参考范本
        examples_text = self._format_examples(class_level)
        
        # 获取理念和班级提示
        phil_hint = self.philosophy_hints.get(philosophy, "")
        class_hint = self.class_hints.get(class_level, "")
        
        acts_str = "、".join(activities) if activities else "区域活动、户外活动"
        
        return f"""
【参考范本 - 必须参考这些优秀教案的结构和风格】

{examples_text}

【关键约束】
- 主题：{theme}
- 班级：{class_level}（{class_hint}）
- 教育理念：{philosophy}
  {phil_hint}
- 活动类型：{acts_str}

【具体要求】
1. 周目标：2-3 个，用行为动词，可测量、可观察
2. 五大领域（健康、语言、社会、科学、艺术）均衡分配，不重复
3. 每日活动包含：
   - activity_name：具体、有画面感（如"踩高跷"而非"体育运动"）
   - materials：3-5 项，可采购或自制（附尺寸建议）
   - process：分 3-5 步，每步 20-30 字，含导入-示范-操作-延伸
   - observation：3-5 项观察重点，用"能否..."或"是否..."的动词短语
   - teacher_hint：核心指导要点（1-2 句）
4. 配搭 1-2 首儿歌（确实存在或逻辑通顺的创作）
5. 周反思：本周幼儿发展亮点和下周关注点（80 字内）

【输出 JSON 格式】
{{
  "week_theme": "{theme}",
  "class_level": "{class_level}",
  "goals": ["目标 1", "目标 2"],
  "days": [
    {{
      "day": "周一",
      "domain": "健康",
      "activity_name": "具体活动名称",
      "materials": ["材料 1", "材料 2"],
      "process": "分步骤的玩法描述",
      "observation": ["观察点 1", "观察点 2"],
      "teacher_hint": "教师指导要点"
    }}
  ],
  "songs": ["儿歌名称或内容"],
  "reflection": "周反思"
}}

只返回 JSON，不要其他文字。
"""
    
    def _format_examples(self, class_level: str) -> str:
        """格式化参考范本"""
        relevant = [e for e in self.examples if e.get("class_level") == class_level][:2]
        
        result = []
        for i, ex in enumerate(relevant, 1):
            result.append(f"""
【参考范本 {i}】
主题：{ex.get("week_theme")}
班级：{ex.get("class_level")}
目标：{ex.get("goals")}
周一活动：{ex["days"][0]["activity_name"]}
材料：{ex["days"][0]["materials"]}
玩法摘要：{ex["days"][0]["process"][:100]}...
""")
        
        return "\n".join(result)
```

---

## 版本控制

### 迭代日志

| 版本 | 日期 | 更新内容 | 质量分数 |
|------|------|---------|---------|
| 1.0.0 | 2026-04-14 | 初始版本（基于 10 个最佳范本） | 8.5/10 |
| 1.1.0 | TBD | 加入活动难度分级 | - |
| 1.2.0 | TBD | 加入家园互动环节 | - |

### 优化建议

每次生成后，评估以下指标：
- 活动具体性评分（1-10）
- 班级适配度（1-10）
- 与参考范本的风格相似度（0-100%）

低于 7/10 的部分需要在下一个版本中改进。

---

## 使用示例

```python
from prompt_config import PromptTemplate

template = PromptTemplate()

# 生成周计划
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {
            "role": "system",
            "content": template.build_system_prompt()
        },
        {
            "role": "user",
            "content": template.build_user_prompt(
                theme="春天的花朵",
                class_level="中班",
                philosophy="以幼儿为中心，注重探索与体验",
                activities=["户外活动", "区域活动"],
            )
        }
    ],
    temperature=0.2,  # 保持风格一致，降低创意度
    max_tokens=4096,
)

result = json.loads(response.choices[0].message.content)
print(result)
```

---

## 常见问题

**Q: 为什么温度设置为 0.2？**  
A: 低温（0.2）使 AI 更倾向于学习参考范本的风格，而非自由创意。如果需要更多创意，可升到 0.3-0.4。

**Q: 如何持续优化 Prompt？**  
A: 每周收集生成的结果，评分，找出最弱的维度，在下一个版本中强化。

**Q: 可以加入自己的教案吗？**  
A: 是的。每收集 3-5 个新的优秀教案，就更新 `reference_templates.json`。

---

**维护者**: Smart Teacher Team  
**下次审查**: 2026-05-14
