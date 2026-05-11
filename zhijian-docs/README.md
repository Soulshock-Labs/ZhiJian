# 智伴幼师 · AI 幼师助手

> **解决幼师繁琐排版难题，实现 1:1 格式无损填充。**  
> 上传任意 Word 模板 → AI 按教育理念精准填充 → 一键导出原格式 .docx

---

## 开发前先读

- 记忆日志：[MEMORY.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/MEMORY.md)
- 工程起飞检查单：[docs/ENGINEERING_PREFLIGHT_CHECKLIST.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/docs/ENGINEERING_PREFLIGHT_CHECKLIST.md)
- 工程修改记录：[docs/ENGINEERING_CHANGELOG.md](/Users/Ethan/Library/CloudStorage/Dropbox/smart-teacher-assistant/docs/ENGINEERING_CHANGELOG.md)

建议所有开发、部署、排查 Bug 都遵循这个顺序：

1. 先读 `MEMORY.md`
2. 再读 `ENGINEERING_PREFLIGHT_CHECKLIST.md`
3. 再读 `ENGINEERING_CHANGELOG.md`
4. 再开始看代码、改代码、部署

默认发布规则：

- 功能或修复完成并通过检查后，默认进入 `GitHub 同步 -> GCloud 发布`。
- 只有在改动未完成、存在风险、或明确要求暂不上线时，才停留在本地。

---

## 痛点

| 场景 | 传统做法 | 智伴幼师 |
|------|---------|---------|
| 活动计划表 | 逐格手写，排版耗时 1-2 小时 | 填写主题 + 上传模板，30 秒生成 |
| 教育理念落地 | 靠记忆套用专业术语，易同质化 | 按所选理念自动注入专属词汇体系 |
| 周→日联动 | 周计划和日教案需分别手写 | 一键拆解周任务为四维日教案 |
| 格式保留 | 复制粘贴破坏原格式 | 保留原字体/行高/颜色，格式分毫不动 |

---

## 技术特性

### 🤖 阿里云百炼大模型驱动
- 接入 **Qwen-Max**（阿里云百炼），支持 8 种教育理念专属内容生成
- 每种理念内置专业词汇体系：蒙氏→「操作教具/敏感期观察」；瑞吉欧→「生成课程/环境留痕」等
- OpenAI 兼容协议，无缝切换 GPT-4 / 其他模型

### 📄 Word 结构化解析 · 铁律填充
- `python-docx` 遍历所有表格行列，关键字匹配（不依赖固定行列位置）
- **双策略**：优先填右侧单元格（横向表），自动回退下方单元格（纵向表）
- 填充时完整复制原始 `run` 的字体名、字号、颜色（含 `w:eastAsia` 中文字体属性）
- 行高、段落间距由段落对象保留，写入不触碰

### 🗓 周日计划自动流转
```
周计划 JSON
    ↓  POST /generate-weekly
五天任务列表（任务/关注点/活动类型/教师提示）
    ↓  选择任意一天 + 上传日教案模板
    ↓  POST /generate-daily
四维日教案（导入 → 过程 → 延伸 → 反思）→ 填充 Word 模板 → 下载
```

### 🌿 渐进式披露 UX
- 首屏仅一个输入框"老师，今天的主题是什么？"
- 输入主题后，理念/活动重点依次弹出（`cubic-bezier(.22,1,.36,1)` 缓动）
- 进度条与真实 API 生命周期绑定（不定式脉冲等待 + 响应后即停）

---

## 项目结构

```
smart-teacher-assistant/
├── index.html          # 前端单页（同域部署，无需独立服务器）
├── main.py             # FastAPI 后端
│   ├── POST /generate          → 活动计划表 Word 填充
│   ├── POST /preview           → 内容预览 JSON（调试）
│   ├── POST /generate-weekly   → 五天周计划生成
│   ├── POST /generate-daily    → 四维日教案生成 + Word 填充
│   ├── POST /generate-term-plan    → 园部学期/月/周骨架生成（To B）
│   ├── POST /apply-daily-feedback  → 日计划执行反馈回流周计划（P0闭环）
│   ├── GET  /roadmap               → To B / To C 模块分期（P0/P1/P2）
│   └── POST /preview-daily     → 日教案预览 JSON（调试）
├── requirements.txt
├── Dockerfile          # Cloud Run / 阿里云 ACK 通用
├── .env.example
└── .gitignore
```

---

## 快速启动

```bash
# 1. 克隆并安装
git clone https://github.com/<your-username>/smart-teacher-assistant.git
cd smart-teacher-assistant
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 2. 配置 API Key
cp .env.example .env
# 编辑 .env，填入 DASHSCOPE_API_KEY=sk-xxxx

# 3. 启动
python main.py
# → http://localhost:8000  （完整页面）
# → http://localhost:8000/docs  （Swagger API 文档）
```

> **无 API Key 也能运行**：自动降级为 Mock 数据，全流程演示可用。

---

## API 接口一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/` | 前端页面 |
| GET  | `/health` | Cloud Run 健康探针 |
| POST | `/generate` | 活动计划表 → 填充 Word → 下载 .docx |
| POST | `/preview` | 活动计划内容预览 JSON |
| POST | `/generate-weekly` | 生成五天周计划 JSON |
| POST | `/generate-daily` | 四维日教案 → 填充 Word → 下载 .docx |
| POST | `/preview-daily` | 日教案内容预览 JSON |
| POST | `/generate-term-plan` | 园部学期/月/周骨架生成（To B） |
| POST | `/apply-daily-feedback` | 日计划执行反馈回流周计划 |
| GET  | `/roadmap` | 双端模块分期配置（P0/P1/P2） |

---

## 版本路线图（当前：v1.1.4）

- P0（已落地）
  - 模块1：园部学期-月-周骨架生成（To B）
  - 模块2：日计划生成与调整，并可回流周计划（To C）
  - 模块3：周日联动 + 日教案四维生成（To C）
- P1（已预留）
  - 模块4：幼儿成长中台
  - 模块6：家园沟通中台
- P2（已预留）
  - 模块5：多场景活动引擎（下棋/跳舞/春游/节日等）
  - 模块7：教师档案与成长（园所/个人双视角）

---

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `DASHSCOPE_API_KEY` | ✅ | [阿里云百炼控制台](https://bailian.console.aliyun.com/) 获取 |
| `DASHSCOPE_BASE_URL` | 否 | 默认 `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `AI_MODEL` | 否 | 默认 `qwen-max`，可改为 `qwen-plus` / `qwen-turbo` |
| `PORT` | 否 | 服务端口，Cloud Run 自动注入，本地默认 `8000` |

---

## Cloud Run 一键部署

```bash
export PROJECT_ID=your-gcp-project-id
export REGION=asia-east1

gcloud builds submit --tag asia-east1-docker.pkg.dev/$PROJECT_ID/smart-teacher/api
gcloud run deploy smart-teacher-api \
  --image asia-east1-docker.pkg.dev/$PROJECT_ID/smart-teacher/api \
  --region $REGION --allow-unauthenticated \
  --update-secrets="DASHSCOPE_API_KEY=DASHSCOPE_API_KEY:latest"
```

---

## 阿里云平移

| 项目 | GCP Cloud Run | 阿里云 |
|------|--------------|--------|
| 镜像仓库 | Artifact Registry | 容器镜像服务 ACR |
| 部署 | `gcloud run deploy` | ACK 控制台 / `fun deploy` |
| AI API | DashScope（同一 Key）✅ | DashScope（同一 Key）✅ |
| PORT 变量 | 自动注入 ✅ | 同样支持 ✅ |

> AI API 调用代码零改动，只需重新 tag 镜像推送到 ACR 即可。

---

## 支持的教育理念

| 理念 | 专属词汇 |
|------|---------|
| 五大领域 | 核心经验、发展指南对照、领域均衡 |
| 蒙氏教育（AMI/AMS） | 操作教具、敏感期观察、三段式教学、工作周期 |
| 瑞吉欧教育 | 生成课程、环境留痕、Documentation Panel、项目网络 |
| DAP 发展适宜性实践 | 最近发展区、支架式学习、真实性评估 |
| 华德福教育 | 生命节律、季节桌、优律思美、故事讲述 |
| 项目化学习（PBL） | 驱动性问题、评价量规、真实受众 |
| 自主游戏 / 游戏化课程 | 松散材料、儿童视角、游戏即工作 |
| 传统文化 / 国学教育 | 二十四节气、经典诵读、传统礼仪 |

---

## 版本更新记录

### v1.1.4 (2026-04-07)

- 第三步结果页新增“模板板块查询”卡片：
  - 展示本次用于生成的模板名称与模板类型
  - 展示最近上传记录（本地缓存，最近 6 条）
- 预览内容视觉调整为“空白模板感”：
  - 动态生成文本与状态角标统一为灰色系
  - 保留模板结构与标签层级，弱化高饱和干扰色
- 前端版本角标更新为 `v1.1.4`
- 后端 `FastAPI` 版本号同步为 `1.1.4`

### v1.1.3 (2026-04-07)

- 新增“模板板块”状态卡（第二步上传页）：
  - 上传前显示“模板待上传”
  - 上传成功后显示“模板上传成功，已识别为预定模板”
  - 显示模板类型、文件名和“可生成”状态标签
  - 支持一键“重新上传”
- 前端版本角标更新为 `v1.1.3`
- 后端 `FastAPI` 版本号同步为 `1.1.3`

### v1.1.2 (2026-04-07)

- 修复导出 500：移除会触发 `latin-1` 编码异常的中文响应头
- 页面增加版本号显示，便于确认线上是否为最新

### v1.1.1 (2026-04-07)

- 下载文件名编码改为兼容中英文，降低中文文件名触发 500 的概率
- 模板回填改为尽量不改结构（不删段落/不重建段落）
- 上传限制统一为 `.docx`
