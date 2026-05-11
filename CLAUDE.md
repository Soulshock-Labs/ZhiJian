# 知笺项目技术文档

---

## AI 行为准则（Karpathy 四原则）

> 来源：Andrej Karpathy 观察 + Forrest Chang 整理，GitHub 10万+ Stars

### 1. 先想后写
**不做假设。不隐藏困惑。主动说明取舍。**
- 明确说出假设；不确定就问
- 有多种理解时，列出来，不要自己悄悄选一个
- 如果有更简单的方案，说出来，该反驳就反驳
- 遇到不清楚的，停下来，说明哪里困惑，然后问

### 2. 简洁优先
**最少代码解决问题。不写推测性代码。**
- 不加没被要求的功能
- 单次使用的代码不做抽象
- 不加没被要求的"灵活性"或"可配置性"
- 写了 200 行但 50 行能搞定的，重写

### 3. 精准修改
**只动必须动的。只清理自己制造的烂摊子。**
- 不"顺手优化"周边代码、注释、格式
- 不重构没坏的东西
- 沿用已有风格，即使你会换一种写法
- 发现不相关的死代码，提一句，但不删
- 验证标准：每一行改动都能直接追溯到用户的需求

### 4. 目标驱动
**定义成功标准。循环直到验证通过。**
- "加校验" → "写测试覆盖非法输入，让测试通过"
- "修 bug" → "先写能复现的测试，再让它通过"
- 多步任务先列计划：步骤 → 验证条件

---

## ⚠️ 铁律：严禁擅自修改设计

**设计稿是唯一标准。** 所有 UI 尺寸、间距、颜色、字体，必须严格照抄设计稿，禁止自己发挥。

设计稿位置：`_ Design System(1)/ui_kits/workbench/index-v2.html`

**具体数值（不得更改）：**
- TopNav 高度：`56px`
- nav-link：`height: 34px`，`padding: 0 14px`
- search-wrap：`height: 34px`，`width: 180px`
- redeem-pill：`height: 32px`，`padding: 0 14px`
- avatar：`32px` 圆形
- SideNav 宽度：`220px`

**违反此规则 = 浪费用户 token，严禁发生。**

---

## 团队

| 角色 | 职责 |
|------|------|
| Ethan | 架构决策者，所有架构变更必须先问他 |
| Tina | 开发执行 |

---

## 项目架构概览

### 平台组成

| 平台 | 目录 | 技术栈 | 域名 |
|------|------|--------|------|
| Web 工作台 | `zhijian-workbench/web-workbench/` | Next.js 14 + Tailwind | Vercel 自动部署 |
| 微信小程序 | `zhijian-mini/` | WXML / WXSS / JS | 微信生态 |
| 后端 API | `zhijian-api/` | **Python (FastAPI)** | `https://api.zhijian.me` |

### AI 模型分配策略

| 场景 | 模型 | 原因 |
|------|------|------|
| 周计划生成 | `moonshot-v1-8k`（AI_MODEL_FAST） | 结构化 JSON 输出，速度优先 |
| 日教案生成 | `kimi-k2.5`（AI_MODEL） | 质量优先，内容更丰富 |

**备选低成本方案：** 周计划可换 `deepseek-v3`（约 1/5 价格，质量相当）

### 环境变量（Cloud Run）

```
MOONSHOT_API_KEY=...       # Kimi / 月之暗面
DEEPSEEK_API_KEY=...       # DeepSeek
DASHSCOPE_API_KEY=...      # 阿里云百炼 / Qwen
AI_MODEL=kimi-k2.5
AI_MODEL_FAST=moonshot-v1-8k
```

---

## ⚠️ 最高风险：数据持久化未完成

**现状：** 102 个用户账号存在 Cloud Run 本地 JSON 文件，重启即丢失。

**重要说明：** 102 个账号是**真实付费用户**（以赠送形式发放，已收费），数据丢失影响真实用户。

**禁止在迁移完成前重启 Cloud Run。**

**迁移目标：** Supabase PostgreSQL（ap-northeast-1 东京节点），9 步迁移路径已在 Obsidian Canvas 设计完毕。

**已完成：** `core/db.py` + `repositories/user_repo.py` 双写层已实现（2026-05-01）
- 写入顺序：先写 JSON（主），再异步写 Supabase（副）
- Supabase 写失败只记日志，不影响业务
- 读路径暂仍走 JSON，待 DB 稳定后切换

**待确认：** Cloud Run 是否已配置 `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` 环境变量

相关文件：
- `zhijian-api/user_accounts.json`（131KB，4个文件，全部在 git 中）
- `zhijian-api/account_index.json`
- `zhijian-api/user_services.json`
- `zhijian-api/redeem_codes.json`
- `zhijian-api/core/db.py` — Supabase 连接层
- `zhijian-api/repositories/user_repo.py` — 双写逻辑

---

## 核心功能：贝乐思 Word 模板生成（第一步，95% 完成）

### 模板文件位置

```
zhijian-api/templates/belesi/
├── 小班_上午班_template.docx
├── 小班_下午班_template.docx
├── 中班_上午班_template.docx
├── 中班_下午班_template.docx
├── 大班_上午班_template.docx
└── 大班_下午班_template.docx
```

源文件位置：`C:\Users\Ethan\Dropbox\（原 Gsyen Dropbox，已迁移）\Workspace\贝乐思\`

### 模板选择规则

| 班型 | 时段 | 模板文件 |
|------|------|---------|
| 小班 | 上午班 | 小班_上午班_template.docx |
| 小班 | 下午班 | 小班_下午班_template.docx |
| 中班 | 上午班 | 中班_上午班_template.docx |
| 中班 | 下午班 | 中班_下午班_template.docx |
| 大班 | 上午班 | 大班_上午班_template.docx |
| 大班 | 下午班 | 大班_下午班_template.docx |

### 表格结构（上午班）

| 行 | 内容 |
|----|------|
| Row 0 | 类型 / 班型 / 执教班级 / 执教人 |
| Row 1 | 本月主题 |
| Row 2 | 重点目标 |
| Row 3 | 时间及活动环节 + 星期一～五 |
| Row 4 | 生活活动（周一～五各一格） |
| Row 5-6 | 学习活动（周一～五，每天 2 个） |
| Row 7 | 户外活动（周一～五各一格） |

下午班：Row 5-6 改为 游戏活动 + 区域游戏，新增 环境创设、家园共育行。

### 贝乐思字段清单

**固定标签（不清空，保留原样）**

```
类型、班型、执教班级、执教人
上午班、下午班、小班、中班、大班
本月主题、重点目标、指导要点
时间及活动环节
星期一、星期二、星期三、星期四、星期五
上午、下午
生活活动、学习活动、户外活动（上午班）
游戏活动、游戏活动（区域）、环境创设、家园共育（下午班）
生活环境、户外环境
```

**需要 AI 填充的字段**
- 执教班级名称、执教人姓名
- 本月主题
- 重点目标（五大领域：健康 / 语言 / 社会 / 科学 / 艺术）
- 学习活动（周一～五，每天 2 个，仅上午班）
- 游戏活动（周一～五，每天 1 个，仅下午班）
- 户外活动（周一～五，每天 1 个）
- 环境创设（仅下午班）
- 家园共育（仅下午班）

### 格式规范（贝乐思标准）

- 纸张：A4（11906 × 16838 DXA）
- 页边距：四边 1134 DXA
- 标题：黑体 小三 加粗 居中
- 正文：宋体 小四
- 行距：固定值 22 磅，首行缩进

### ⚠️ Word XML 三个已知坑（必读）

**坑 1：不能用 `itertext()` 读取文本**
Word 文件含 revision markup（修订记录），`itertext()` 会把同一段文字重复返回 3 次（如 `类型类型类型`），导致标签匹配失败。
✅ 正确方法：用 `tc.findall('.//{%s}t' % W)` 只取 `<w:t>` 元素。

**坑 2：不能用 python-docx 高层 API 操作合并单元格**
`id(cell)` 和 `id(cell._tc)` 在 vMerge 行中均会重复，导致单元格被跳过或多次处理。
✅ 正确方法：直接操作 XML，遍历 `<w:tr>/<w:tc>`，用 `is_vmerge_continuation()` 跳过续行单元格。

**坑 3：vMerge 续行单元格检测**
`<w:vMerge/>` 无 `val` 属性或 `val != "restart"` = 续行（跳过）。
`<w:vMerge w:val="restart"/>` = 主单元格（处理）。

### 模板清空脚本（可直接复用）

```python
import docx
from lxml import etree

W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

LABELS = {
    '类型', '班型', '执教班级', '执教人',
    '上午班', '下午班', '小班', '中班', '大班',
    '本月主题', '重点\n目标', '重点目标',
    '指导\n要点', '指导要点', '时间及活动环节',
    '星期一', '星期二', '星期三', '星期四', '星期五',
    '上午', '下午',
    '生活\n活动', '学习\n活动', '户外\n活动',
    '游戏\n活动', '游戏\n活动\n（区域）',
    '家园\n共育', '家园共育', '生活\n环境', '户外\n环境',
}

def get_tc_text(tc):
    parts = []
    for p in tc.findall('{%s}p' % W):
        line = ''.join(t.text or '' for t in p.findall('.//{%s}t' % W))
        if line: parts.append(line)
    return '\n'.join(parts).strip()

def is_vmerge_continuation(tc):
    tcPr = tc.find('{%s}tcPr' % W)
    if tcPr is None: return False
    vMerge = tcPr.find('{%s}vMerge' % W)
    if vMerge is None: return False
    return vMerge.get('{%s}val' % W, '') != 'restart'

def clear_tc(tc):
    for t_el in tc.findall('.//{%s}t' % W):
        t_el.text = ''
    paras = tc.findall('{%s}p' % W)
    for p in paras[1:]:
        tc.remove(p)

def clean_template(src, dst):
    doc = docx.Document(src)
    for table in doc.tables:
        tbl = table._tbl
        for tr in tbl.findall('{%s}tr' % W):
            for tc in tr.findall('{%s}tc' % W):
                if is_vmerge_continuation(tc): continue
                text = get_tc_text(tc)
                if text not in LABELS and text != '':
                    clear_tc(tc)
    doc.save(dst)
```

**运行方式：**
```bash
python clean_template.py
# 输出到 zhijian-api/templates/belesi/
```

**注意：** Windows 上运行需加 `sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')` 避免中文乱码。

---

## 知识库（本地，永不上传服务器）

**位置：** `C:\Users\Ethan\Desktop\` （统一存放，待整理）

| 来源 | 内容 | 格式 | 大小 |
|------|------|------|------|
| 爱立方一日活动课程 | 小/中/大班 上下学期各16周周计划 | PDF | 1.8GB |
| 向日葵班（安诺森自然学堂） | 2025.9-2026.4 真实教案、备课本、月末资料 | docx | 32MB |
| 贝乐思 | 小/中/大班 上下午班 真实周计划 | docx | 若干 |

**使用原则：**
- 原始文件永远留本地，**绝不上传服务器**
- 本地运行解析脚本 → 提取精华 → 写入 `reference_templates.json`（几KB）
- 只有 `reference_templates.json` 随代码部署到 Cloud Run

**待完成：** PDF 解析脚本（pdfplumber）+ 内容结构化 + 写入 reference_templates.json

---

## 核心代码：Word 模板填充完整链路（✅ 95% 完成）

### 执行流程

```
POST /generate (routers/generate.py)
    ↓
① 校验文件格式（.docx only）
    ↓
② 提取模板提纲 → 注入 Prompt
    ↓
③ AI 生成内容 (ai_service.generate_content)
    ├─ Build Prompt（注入理念词库 + 班级特征）
    ├─ Call 阿里云百炼 Qwen-Max
    ├─ JSON 解析 + 强约束输出
    └─ Return: {"goals": [...], "activities": {...}, ...}
    ↓
④ 模板填充 (word_engine.fill_word_template) ⭐ 核心
    ├─ clean_template_keep_style()      # 清空骨架
    ├─ _build_weekly_fill_data()        # 组织字段字典
    └─ _fill_word_template_docx_bytes() # 核心算法
         ├─ 扫描星期表头行及列
         ├─ match_field() 关键字匹配单元格
         ├─ _write_cell_preserve_style() 保留样式写入
         └─ 处理合并单元格 / 日期分配
    ↓
⑤ 格式转换（可选）
    ├─ docx → PDF（需 Aspose）
    └─ docx → PNG（需 pdf2image）
    ↓
⑥ 返回文件
    ├─ Web：StreamingResponse（content-disposition: attachment）
    └─ 小程序：JSON {file_base64: "..."}
```

### 关键文件及职责

| 文件 | 行数 | 功能 | 完成度 |
|------|------|------|--------|
| `routers/generate.py` | ~200 | FastAPI 路由入口，接收参数、调度 AI + 填充 | ✅ 完成 |
| `ai_service.py` | ~396 | AI 内容生成，Prompt 工程、JSON 解析、降级保护 | ✅ 完成 |
| `word_engine/docx_filler.py` | ~434 | **核心填充引擎**，处理合并单元格、样式保留 | ✅ 完成 |
| `word_engine/field_map.py` | ~180 | 52 条关键字映射规则 + 理念/班级词库 | ✅ 完成 |
| `word_engine/template_tools.py` | ? | 模板清空、样式保留、日期处理 | ✅ 完成 |

### 已验证的三个 Word XML 坑位（核心焦点）

所有坑位都已在代码中解决：

✅ **坑 1：itertext() 重复**  
Word 含修订记录，`itertext()` 会重复返回同一段文字 3 次。  
**解决：** 用 `tc.findall('{%s}t' % W)` 直接取 `<w:t>` 元素（docx_filler.py:47）

✅ **坑 2：合并单元格波动**  
`id(cell)` 和 `id(cell._tc)` 在 vMerge 行中重复，导致跳过或重复处理。  
**解决：** 直接 XML 操作 `<w:tr>/<w:tc>` + `is_vmerge_continuation()` 跳过续行（docx_filler.py:226-307）

✅ **坑 3：vMerge 续行检测**  
`<w:vMerge/>` 无 `val` 属性或 `val != "restart"` = 续行（跳过）。  
`<w:vMerge w:val="restart"/>` = 主单元格（处理）。  
**解决：** 在 template_tools.py 中正确判断

### API 示例

```bash
curl -X POST http://localhost:8000/generate \
  -F "user_token=xxx" \
  -F "theme=春天来了" \
  -F "phil=蒙氏教育（AMI/AMS）" \
  -F "activities=[\"outdoor\",\"area\",\"morning\"]" \
  -F "class_level=中班" \
  -F "template=@模板.docx" \
  -o 成品.docx
```

---

## 核心功能：内容填充（第二步，待开发）

**目标：** ✅ AI 生成内容 + 字段映射 + 填充 Word 已完成。下一步：多园区模板自动选择。

**待实现：**
- 根据 `org_id + class_type + session` 自动选择正确模板（目前需手动上传）
- 本地知识库集成（reference_templates.json 对标参考）
- 批量生成接口（周计划 + 日教案）

---

## 待办 / 未完成功能（按优先级）

### 🔴 P0 数据持久化
- 现状：102 真实付费用户（赠送账号）存本地 JSON，重启丢失
- 双写层已实现，待确认 Cloud Run env var 是否配置
- 部署安全：先确认 Supabase env var → 再部署
- 目标：切换读路径到 Supabase，JSON 降为备份
- **迁移前禁止重启 Cloud Run**

### 🟠 P1 org_id 贝乐思字段
- 现状：所有用户 org_id = "internal_beta"，无真实幼儿园 ID
- 目标：账号绑定 org_id=belesi，支持多园区扩展

### 🟡 P2 模板内容填充（第二步核心）
- 现状：6 个空白模板已就位
- 目标：AI 内容 → 字段映射 → 填入 Word → 下载

### 🟡 P3 小程序日教案接口
- 现状：占位符，显示"暂未开放"
- 目标：接通后端生成接口（`zhijian-mini/generate.js`）

### ⬜ P4 响应式设计升级
- TopNav 搜索框仅 ≥1024px 显示（`hidden lg:flex`）
- 相关文件：`components/TopNav.tsx` 第 85 行

### ⬜ P5 模板中心
- SideNav 标注"即将上线"，未开发

---

## 技术债务：Cloud Run 最小实例配置

**日期：** 2026-04-28 | **状态：** 已实施，待评估

- 最小实例数：**1**（常驻，消除冷启动 3-8 秒延迟）
- 区域：`asia-east1`
- 费用：约 $10–20 / 月（前期可接受）

**建议迁移时机：** 日活 > 500 / 月调用 > 50,000 次 / Cloud Run 月费 > $50

```bash
# 设置最小实例为 1（当前配置）
gcloud run services update zhijian-api \
  --region=asia-east1 \
  --min-instances=1

# 恢复为 0（省钱模式，有冷启动）
gcloud run services update zhijian-api \
  --region=asia-east1 \
  --min-instances=0
```

---

## ⚠️ Python 文件安全规范（2026-05-08 血泪教训）

> **事件**: 全部 Python 后端文件丢失，原因：未 commit + AI 会话误删。

**Claude Code 操作 Python 文件前必须**：

1. `git status` — 确认文件是否已 commit，未 commit 的不得删除/移动/覆盖
2. 批量操作（重构/目录整理）前先 `git add -A && git commit`
3. 新写的 Python 文件立即 commit，不要"写完统一提交"

**永久禁止**：
- `.gitignore` 里加 `*.py`
- `rm -rf` 整个 Python 目录（必须逐文件或先备份）

---

## 禁止事项

- **禁止重启 Cloud Run**（数据未持久化，重启丢失所有用户数据）
- **禁止删除** `templates/belesi/` 下任何文件
- **禁止修改** 已验证的模板清空逻辑（三个坑已踩过）
- **禁止擅自改动 UI 尺寸**（必须照设计稿）
- **架构决策必须问 Ethan**
