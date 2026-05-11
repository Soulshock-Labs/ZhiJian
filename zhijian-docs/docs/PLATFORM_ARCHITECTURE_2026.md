# 纸笺幼师 · 平台架构规划

> 版本：v1.3.0 · 更新于 2026-04-28  
> 定位：AI 幼师助手，服务幼师、园所、家长、孩子

---

## 一、产品矩阵

| 端 | 技术栈 | 仓库目录 | 状态 |
|----|--------|---------|------|
| Web 工作台 | Next.js 14 + React | `zhijian-workbench` | ✅ 上线 |
| 微信小程序 | 原生小程序 | `zhijian-mini` | ✅ 上线 |
| Android App | 原生 Android | `zhijian-android` | 🔲 规划中 |
| 品牌官网 | 纯 HTML | `zhijian-web` | ✅ 上线 |
| 家园共育落地页 | 纯 HTML | `zhijian-homes` | ✅ 上线（家长入口）|
| 后端 API | FastAPI / Python 3.12 | `zhijian-api` | ✅ 上线 |

**基础设施：**

| 组件 | 当前方案 | 备选（迁移就绪） |
|------|---------|----------------|
| 计算 | GCP Cloud Run `asia-east1` | 阿里云 ACK |
| 数据库 | Firestore + 本地 JSON 兜底 | - |
| 文件存储 | Google Cloud Storage | 阿里云 OSS（代码已就绪） |
| Web 前端 | Vercel | - |

---

## 二、用户角色体系

```
platform_admin     纸笺平台运营（你自己）
    └── org_admin        园长 / 园所管理员
            └── teacher          幼师
            └── parent           家长（规划中）
                    └── child    孩子档案（非登录实体）

guest              未登录访客
```

### 权限矩阵

| 权限项 | guest | teacher | org_admin | platform_admin |
|--------|-------|---------|-----------|----------------|
| 生成周计划 / 日教案 | ❌ | ✅ | ✅ | ✅ |
| 观察记录 | ❌ | ✅ | ✅ | ✅ |
| 文档空间（上传/读取） | ❌ | ✅ | ✅ | ✅ |
| 养成 Agent | ❌ | ✅ | ✅ | ✅ |
| 管理本园所老师 | ❌ | ❌ | ✅ | ✅ |
| 管理卡密 / 兑换码 | ❌ | ❌ | ❌ | ✅ |
| 查看所有用户 | ❌ | ❌ | ❌ | ✅ |

**后端权限校验（一行搞定）：**

```python
# core/auth.py
account = require_permission(user_token, "generate")
```

---

## 三、账号体系

### 核心设计原则

- **一个手机号 = 一个账号**，跨端（小程序/Web/Android）完全统一
- **主键永不变**，手机号可以迁移换号
- **多端同时在线**，token 互不干扰（最多 5 个并发 token）
- **旧数据自动迁移**，首次请求时静默升级，用户无感知

### 账号数据模型

```python
# user_accounts，主键 = account_id
{
  "uid_a3f8c2hex...": {
    "account_id":    "uid_a3f8c2hex...",  # 系统主键，uuid，永不变
    "member_no":     "10086",             # 会员号，6位递增，10000起，永不变
    "phone":         "13800138000",       # 唯一索引，可换号
    "openid":        "wx_xxx",            # 微信 openid，绑定后写入，可空
    "password_hash": "sha256...",         # Web / Android 登录
    "role":          "teacher",           # teacher / org_admin / platform_admin
    "org_id":        "",                  # 所属园所 ID
    "active_tokens": ["ut_abc", "ut_def"],# 多端 token 列表，最多5个
    "agent_profile": { ... },
    "created_at_utc": "...",
    "updated_at_utc": "...",
  }
}
```

### 反查索引（account_index.json）

```python
{
  "phone:13800138000": "uid_a3f8c2...",  # 手机号 → account_id
  "openid:wx_xxx":     "uid_a3f8c2...",  # openid → account_id
  "token:ut_abc":      "uid_a3f8c2...",  # token  → account_id（O(1)验证）
}
```

### 会员权益模型

```python
# user_services，主键 = account_id（与账号对齐，换手机号不影响）
{
  "uid_a3f8c2...": {
    "account_id":       "uid_a3f8c2...",
    "membership_until": "2026-12-31T...",
    "is_active_member": True,
    "balance":          0,
    "quota":            100,
  }
}
```

### 登录流程

**微信小程序：**
```
wx.login → code
  → 后端换 openid
  → 查 account_index["openid:xxx"]
  → 找到 → 签发 token，返回 phone_bound 字段
  → 未找到 → 创建新账号 → 提示"绑定手机号解锁完整权益"
```

**Web / Android：**
```
手机号 + 密码
  → 查 account_index["phone:xxx"]
  → 验证 password_hash
  → 签发 token
```

### 多端同时在线机制

```
小程序登录  → 生成 token_A，追加进 active_tokens
Web 登录    → 生成 token_B，追加进 active_tokens
Android 登录 → 生成 token_C，追加进 active_tokens

active_tokens: ["token_A", "token_B", "token_C"]
三端同时有效，互不干扰，超出5个自动淘汰最旧的
```

### 换手机号流程（规划中）

```
① 旧手机号验证身份
② 新手机号收验证码确认
③ account.phone 改为新号
④ account_index: 删旧 phone key，写新 phone key
⑤ active_tokens 全部清空，强制重新登录
⑥ user_services 按 account_id 查，权益完全不受影响
```

### 会员号规则

- 格式：6 位纯数字字符串
- 起始：**10000**（第一个注册用户）
- 规则：全局递增，永不复用
- 用途：客服核对、人工审核、用户截图沟通
- 情感价值：10000 是创始会员，体现早期用户身份

---

## 四、文件存储架构

### 云存储抽象层（core/storage.py）

```
StorageBackend（抽象基类）
  ├── LocalStorageBackend   本地文件系统（开发 / 测试）
  ├── GCSStorageBackend     Google Cloud Storage（当前生产）
  └── OSSStorageBackend     阿里云 OSS（迁移就绪）
```

**迁移到阿里云只需改环境变量：**
```
STORAGE_BACKEND=oss
OSS_ACCESS_KEY_ID=xxx
OSS_ACCESS_KEY_SECRET=xxx
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
OSS_BUCKET=zhijian-prod
```

### 用户文档空间路径规范

```
users/{account_id}/docs/{doc_id}/original.{ext}   原始文件
users/{account_id}/docs/{doc_id}/content.md        提取的 Markdown
users/{account_id}/docs/{doc_id}/meta.json         元数据
users/{account_id}/docs/index.json                 该用户文档索引
```

### 文档处理流程

```
用户上传文件（.docx / .pdf / 图片）
  ↓
doc_reader 提取文本
  ├── .docx → python-docx
  ├── .pdf  → pdfplumber
  └── 图片  → Kimi Vision OCR（moonshot-v1-8k-vision-preview）
  ↓
转为 Markdown
  ↓
DeepSeek 分析教学风格（可选）
  ↓
存入用户空间，返回 doc_id
```

### 生成周计划时注入文档（三种方式）

| 优先级 | 方式 | 说明 |
|--------|------|------|
| 1（最高）| `doc_id` + `user_id` | 从用户空间读已存储文档 MD |
| 2 | `scan_space=1` | 扫描用户所有文档拼合注入（Agent 模式）|
| 3 | `ref_doc` 临时上传 | 用完不存储，兼容旧流程 |

---

## 五、三层知识架构（规划中）

```
平台层（platform）
  └── 纸笺官方知识库，所有用户共享
      例：课程标准、教育理念文档、优质教案范例

园所层（org）
  └── 某园所上传的园本课程、教学大纲、活动方案
      仅该园所的老师可见

个人层（personal）
  └── 幼师自己的文档空间
      仅本人可见
```

生成内容时，三层按优先级叠加注入 prompt，个人层权重最高。

---

## 六、Agent 体系（规划中）

### 核心理念

> **Agent 是用户的数字分身，归属于孩子，由家长/老师各自养成，记忆独立，可以社交。**

```
孩子（child）
  └── 拥有多个 Agent（各自独立）
        ├── 爸爸 Agent    ← 爸爸账号创建，只有爸爸能养成
        ├── 妈妈 Agent    ← 妈妈账号创建，只有妈妈能养成
        └── 张老师 Agent  ← 幼师账号创建，只有该老师能养成
```

### 关键规则

| 规则 | 说明 |
|------|------|
| 归属 | Agent 归属孩子，不归属创建者账号 |
| 养成权 | 只有 `owner_id`（创建者）可以修改 Agent |
| 记忆 | 每个 Agent 独立记忆，**绝不共享** |
| 社交 | Agent 之间可以传递消息（social_inbox），但各自独立处理 |
| 孩子互动 | 孩子可以和所有归属自己的 Agent 对话，不能修改 Agent |

### Agent 社交示例

```
张老师 Agent 发起：
  "小明今天画了一棵大树，很有想象力，建议家长鼓励"
  ↓ 写入爸爸 Agent 的 social_inbox
爸爸 Agent 收到消息，基于自己的独立记忆回应：
  "小明上周跟我说想画恐龙，今天画树说明他在探索新事物"
  ↓ 回复写入张老师 Agent 的 social_inbox
```

### 数据模型

```python
# agents 表
{
  "agt_xxx": {
    "agent_id":     "agt_xxx",
    "child_id":     "child_xxx",      # 归属哪个孩子
    "owner_id":     "uid_爸爸",       # 创建者 account_id
    "relation":     "father",         # teacher/father/mother/grandpa/...
    "name":         "爸爸",
    "personality":  "活泼有趣",
    "tone":         "轻松温暖",
    "style":        "启发引导",
    "memory": [                       # 独立记忆，不与其他 Agent 共享
      {"date": "2026-04-01", "event": "小明说想画恐龙"},
      {"date": "2026-04-28", "event": "小明今天很开心"},
    ],
    "social_inbox": [                 # 其他 Agent 发来的消息
      {
        "from_agent": "agt_老师xxx",
        "from_name":  "张老师",
        "message":    "小明今天画了一棵大树",
        "sent_at":    "2026-04-28T...",
        "read":       False,
      }
    ],
    "created_at": "...",
    "updated_at": "...",
  }
}
```

---

## 七、实施路线图

### ✅ 第一步（已完成）— 核心功能 + 账号基建

- [x] 周计划 / 日教案生成
- [x] 文档上传 → OCR/提取 → MD → 影响生成内容
- [x] 用户文档空间（per-user 隔离，GCS 存储）
- [x] 云存储抽象层（GCS / 本地 / OSS 三选一）
- [x] 手机号 + 密码注册/登录
- [x] 微信小程序登录（wxlogin）
- [x] 多端同时在线（active_tokens，最多5个）
- [x] 账号重构：uuid 主键 + 6位会员号 + 反查索引
- [x] 权限体系（core/auth.py，ROLE_PERMISSIONS）
- [x] Web 工作台登录/注册弹窗（AuthModal + useAuth）

### 🔲 第二步 — 接口权限收口

- [ ] `/generate-weekly`、`/generate-daily` 加 `require_permission("generate")`
- [ ] `/doc-space/*` 加 `require_permission("doc_space")`
- [ ] `/observation/*` 加 `require_permission("observe")`
- [ ] 手机号绑定接口（小程序 openid → 统一账号）
- [ ] 换手机号接口

### 🔲 第三步 — 孩子档案模块

- [ ] child 数据模型（child_id、name、birth_date、org_id）
- [ ] 监护人关联（account_id + relation）
- [ ] 孩子与园所关联

### 🔲 第四步 — Agent 模块

- [ ] Agent CRUD 接口
- [ ] Agent 记忆写入（每次互动后更新）
- [ ] Agent 社交（social_inbox 收发）
- [ ] 生成内容时选择 Agent 风格注入

### 🔲 第五步 — 园所模块

- [ ] org 数据模型
- [ ] 园长邀请老师加入园所
- [ ] 园所文档空间（三层知识架构第二层）
- [ ] 园所维度的用量统计

### 🔲 第六步 — 家长 & 孩子互动

- [ ] parent 角色注册/登录
- [ ] 家长查看孩子成长记录
- [ ] 家长 Agent 养成入口

---

## 八、技术约定

### API 响应字段规范

| 字段 | 说明 |
|------|------|
| `account_id` | 系统主键，格式 `uid_xxx`，所有接口统一返回 |
| `member_no` | 会员号，6位数字字符串，对外展示 |
| `user_id` | 向后兼容旧字段，值等于 `account_id` |
| `user_token` | 登录 token，格式 `ut_xxx` |
| `role` | `teacher` / `org_admin` / `platform_admin` |
| `phone_bound` | 微信登录时返回，`false` 表示需引导绑定手机号 |

### 环境变量

| 变量 | 用途 |
|------|------|
| `DASHSCOPE_API_KEY` | 阿里云通义千问 + Kimi Vision OCR |
| `DEEPSEEK_API_KEY` | DeepSeek 文档分析 / 内容生成 |
| `WECHAT_APPID` / `WECHAT_SECRET` | 微信小程序登录 |
| `STORAGE_BACKEND` | `local` / `gcs` / `oss` |
| `GCS_BUCKET_NAME` | GCS 存储桶名 |
| `REDEEM_CODES_GCS_URI` | 卡密库 GCS 路径（`gs://bucket/file.json`）|
| `PARTNER_REDEEM_TOKENS` | 第三方合作卡密 token（逗号分隔）|

### 存量数据兼容策略

旧格式账号（以手机号或 openid 为主键）在**首次请求时自动迁移**：

```
检测到旧格式 key（不以 uid_ 开头）
  → 生成新 uuid account_id
  → 生成 6位会员号
  → 写回 user_accounts
  → 更新 account_index
  → 用户完全无感知
```

### 权限校验使用方式

```python
from core.auth import require_permission, get_account_optional

# 强制登录 + 检查权限
account = require_permission(user_token, "generate")

# 软验证（未登录也可用，但登录后有额外功能）
account = get_account_optional(user_token)
if account:
    # 有登录态的逻辑
```
