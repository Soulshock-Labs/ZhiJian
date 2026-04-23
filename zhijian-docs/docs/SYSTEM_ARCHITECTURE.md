# 智伴幼师 / 纸笺 — 系统线路图（Obsidian 用）

> 将本文件复制到你的 Obsidian 库，或用 Obsidian 直接打开此仓库下的路径。  
> 需开启 **Mermaid**（Obsidian 核心插件「Mermaid」默认可渲染 ` ```mermaid ` 代码块）。

---

## 总览（用户 → 入口 → 后端）

```mermaid
flowchart TB
  subgraph clients["客户端"]
    MP["微信小程序\nwx.login / 工作台 / 兑换"]
    WEB["浏览器\nindex.html 纸笺首页"]
  end

  subgraph edge["公网"]
    DNS["域名\nzhijian.soulshock.cn\nCloud Run URL"]
  end

  subgraph gcp["Google Cloud"]
    CR["Cloud Run\nsmart-teacher-api\nFastAPI main.py"]
    FS[("Firestore\nusers / user_services\n(双写兜底 JSON)")]
    GCS[("Cloud Storage\n可选: 知识库 / 卡密同步等")]
    SM["Secret Manager\nDASHSCOPE_API_KEY 等"]
  end

  subgraph ai["模型服务"]
    DS["DashScope / OpenAI 兼容\nDeepSeek / Qwen 等"]
  end

  MP --> DNS
  WEB --> DNS
  DNS --> CR
  CR --> FS
  CR --> GCS
  CR --> SM
  CR --> DS
```

---

## 请求链路（生成教案）

```mermaid
sequenceDiagram
  participant U as 老师
  participant C as 小程序 / 网页
  participant API as Cloud Run API
  participant Auth as user_token / user_id 校验
  participant PE as prompt_engineering
  participant LLM as DashScope LLM
  participant FS as Firestore / JSON

  U->>C: 填主题、理念、班级、模板
  C->>API: POST /generate 或 /generate-weekly 等
  API->>Auth: 校验会员/账号（视接口）
  API->>PE: 组装 Prompt（模板 + 班级/理念 hints）
  API->>LLM: chat.completions
  LLM-->>API: 结构化内容 / 文本
  API->>API: fill_word_template → docx
  API-->>C: 文件流或 JSON
  Note over API,FS: 用户档案、核销等多写 Firestore + 本地 JSON
```

---

## 数据与知识（概念）

```mermaid
flowchart LR
  subgraph seed["冷启动 / 原始资料"]
    KB["knowledge_base/\n索引 JSON + 文档"]
  end

  subgraph runtime["运行时"]
    IDX["检索 / 引用\n(按你们当前实现)"]
    PROMPT["Prompt 内参考范本\nreference_templates 等"]
  end

  subgraph future["后续可扩展"]
    UP["老师上传教案\n→ GCS + 索引"]
  end

  KB --> IDX
  KB --> PROMPT
  UP -.-> IDX
```

---

## 会员与用户（当前方向）

```mermaid
flowchart TB
  subgraph identity["身份"]
    WX["微信 openid\n/user/wxlogin"]
    PHONE["手机号/邮箱 user_id\n兑换卡密绑定"]
  end

  subgraph ent["权益"]
    SVC["user_services\n会员 / 次数 / 余额"]
  end

  WX --> ACC["用户档案\nFirestore + user_accounts.json"]
  PHONE --> ACC
  ACC --> SVC
```

---

## 在 Obsidian 里怎么用

1. **把整个文件**复制进 vault，或 **添加文件夹链接** 指向本仓库 `docs/SYSTEM_ARCHITECTURE.md`。  
2. 若 Mermaid 不显示：设置 → 核心插件 → 确认 **Mermaid** 开启；或安装社区插件 **Mermaid Tools**。  
3. 想单独放大某张图：可把对应 ` ```mermaid ` 块**剪到新笔记**里编辑。

---

*文档由项目上下文整理，随架构变更请手动改图。*
