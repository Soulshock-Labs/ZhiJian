# 会话 / 开发开始

每次开干前先过一遍，再写代码。

## 1. 看 PR（未合并的工作）

```bash
gh pr list
# 或打开：https://github.com/Ethan7586/ZhiJian/pulls
```

- 有与你相关的 **Open PR**：先读完描述与 diff，避免和别人的分支打架。

## 2. 拉最新主分支

```bash
git fetch origin && git status
git pull origin main
```

## 3. 服务与健康（若动后端 / 部署）

```bash
curl -sS "$YOUR_CLOUD_RUN_URL/health" | head -c 800
```

## 4. 读项目记忆（可选但推荐）

1. `MEMORY.md` — 决策与待办  
2. `docs/ENGINEERING_PREFLIGHT_CHECKLIST.md` — 检查单  
3. `docs/ENGINEERING_CHANGELOG.md` — 近期改动记录  

## 5. 今天要做什么

在本分支或 `MEMORY.md` 里写清：**目标 / 不动哪些文件 / 部署吗**

---

（与另一对话里约定的「提交 = git → PR → Cloud Run → 小程序手动上传」配合使用，见 `End.md`。）
