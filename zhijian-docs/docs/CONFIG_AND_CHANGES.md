# 改代码、看配置 — 都去哪找

> 目标：每次改完，**自己**和 **Cursor/同事** 都能快速对齐「改了啥、配置在哪」。

---

## 一、代码改了什么（事实来源）

| 方式 | 命令 / 位置 | 看什么 |
|------|-------------|--------|
| **最近一次提交** | `git show --stat` | 上次提交了哪些文件 |
| **和远程比** | `git status` / `git diff origin/main` | 本地还没推的改动 |
| **某次历史** | `git log --oneline -20` | 提交列表 |
| **某个文件历史** | `git log -p -- main.py` | 单文件怎么变过来的 |

**结论：** **Git 是唯一「改了什么地方」的权威记录**；聊天里说的不算，以 `git` 为准。

---

## 二、配置分三类（别混在一起想）

### 1）仓库里、可版本管理的（能看清、能 PR）

| 内容 | 典型路径 |
|------|-----------|
| Python 依赖 | `requirements.txt` |
| 容器怎么跑 | `Dockerfile`、`.dockerignore` |
| 小程序域名等 | `mini-program/utils/config.js`、`project.config.json` |
| 提示词与范本 | `prompt_engineering/*.json`、`prompt_engineering/prompt_config.py` |
| 工程约定与变更说明 | `docs/ENGINEERING_CHANGELOG.md`、`MEMORY.md` |
| 开收工检查 | `Start.md`、`End.md` |

改这些：**提交到 Git**，大家就都能在 GitHub 上看到。

### 2）本机密钥、不进 Git（你电脑上有，仓库里「看不清」是正常的）

| 内容 | 典型位置 |
|------|-----------|
| API Key、数据库连接串 | 项目根目录 **`.env`**（一般在 `.gitignore` 里） |

看别人机器上的配置：**不能**靠仓库；要当面要 **`.env.example`（只写变量名）** 或文档说明。  
若仓库里**没有** `.env.example`，需要时可以加一个，只列变量名、不写真密钥。

### 3）云上运行时（Git 里只有「部署方式」，具体值在控制台）

| 内容 | 去哪看 |
|------|--------|
| Cloud Run 环境变量、Secret | [Google Cloud Console](https://console.cloud.google.com/) → Cloud Run → 服务 `smart-teacher-api` → **修订版本 / 变量与密钥** |
| Firestore 是否开启 | Firestore 控制台 |
| 自定义域名 | Cloud Run 域名映射 / 负载均衡 |

**本地改了 `main.py` 里读 `os.getenv("XXX")` 的变量**，若线上也要生效，必须在 **Cloud Run 里同样配置 `XXX`**，否则「本地好、线上坏」。

---

## 三、建议你固定一个小习惯（减负）

每次改完一轮功能：

1. `git add` / `git commit` / `git push`（事实落盘）  
2. 在 **`docs/ENGINEERING_CHANGELOG.md`** 里**追加一条**（模板已在文件里）：改了哪些文件、是否已部署  
3. 若动了**环境变量**：在 CHANGELOG 里写一句「Cloud Run 需增加/修改 XXX」

这样 **「配置 + 代码变更」** 至少有两处能对上：**Git + CHANGELOG**；云上的值再在 **GCP 控制台** 对一下。

---

## 四、和 Cursor 协作时怎么说

你可以直接说：

- 「配置按 **`docs/CONFIG_AND_CHANGES.md`**，密钥只写 `.env` / Cloud Run，别写进仓库。」  
- 「改完请 **`git diff --stat`** 列文件，并更新 **`ENGINEERING_CHANGELOG.md`**。」

---

## 五、一页总览（存脑图里也行）

```
代码改了啥     →  git log / git diff
仓库内配置     →  requirements.txt、Dockerfile、mini-program/utils/config.js、prompt_engineering/
本机密钥       →  .env（勿提交）
线上运行配置   →  GCP Cloud Run 环境变量与 Secret
人类可读摘要   →  docs/ENGINEERING_CHANGELOG.md
```
