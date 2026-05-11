# 知笺项目 — Tina 开发环境搭建指南

## 第一步：克隆代码

```bash
git clone https://github.com/Ethan7586/smart-teacher-assistant
cd zhijian
```

---

## 第二步：Python 后端环境

```bash
cd zhijian-api
pip install -r requirements.txt
```

找 Ethan 要 `.env` 文件，放到 `zhijian-api/` 目录下。

---

## 第三步：前端环境

```bash
cd zhijian-workbench/web-workbench
npm install
npm run dev
```

---

## 第四步：Claude Code 个人设置（一次性）

在你电脑上创建 `~/.claude/CLAUDE.md`，内容如下：

```markdown
# Tina 开发规范

## 角色
开发执行。所有架构决策必须先问 Ethan。

## AI 行为准则
1. 先想后写 — 不确定就问 Ethan，不自作主张
2. 简洁优先 — 不加没要求的功能
3. 精准修改 — 只改任务范围内的代码
4. 架构变更必须先问 Ethan

## 项目 CLAUDE.md
克隆代码后，C:\dev\zhijian\CLAUDE.md 里有完整项目规范，
Claude Code 启动时会自动读取。
```

---

## ⚠️ 最重要的事

**禁止重启 Cloud Run！**
102 个真实付费用户数据在服务器上，重启即丢失。
任何部署操作前必须先联系 Ethan。

---

## 本地启动

```bash
# 后端
cd zhijian-api
uvicorn main:app --host 0.0.0.0 --port 8080 --reload

# 前端（新终端）
cd zhijian-workbench/web-workbench
npm run dev
```

访问 http://localhost:3000 即可。

---

有问题找 Ethan。
