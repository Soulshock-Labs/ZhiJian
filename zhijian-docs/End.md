# 会话 / 开发结束

收工前过一遍，保证闭环。

## 1. 再看 PR

```bash
gh pr list
```

- 本次改动若 **还没进 main**：应有一个已推送分支 + PR（或说明为何不打 PR）。

## 2. 代码与测试

- [ ] 只包含本次相关改动（避免顺手大重构）  
- [ ] 本地能跑：`python3 -m uvicorn main:app --host 127.0.0.1 --port 8000`（按需）  
- [ ] 小程序改动能用开发者工具编译通过（按需）  

## 3. 提交与远程

```bash
git status
git add <具体文件>
git commit -m "feat|fix: 简短说明"
git push origin <分支名>
```

需要 PR 时：

```bash
gh pr create --base main --head <分支名> --title "..." --body "..."
```

## 4. 部署（你说「提交部署」时做）

```bash
# 按你们仓库里的脚本或习惯，例如：
# ./scripts/deploy_google_cloud_run.sh ...
# 或 gcloud run deploy ...
```

## 5. 小程序

- 微信开发者工具 → **上传** → 体验版 / 提审（**始终手动**，不进 CI 亦可）

## 6. 更新记忆（重要决策时）

在 `MEMORY.md` 或 `docs/ENGINEERING_CHANGELOG.md` 记一条：改了什么、为何、下一步。

---

**约定口令（与团队对齐即可）**

| 口令 | 含义 |
|------|------|
| 提交代码 | add → commit → push →（需要则）PR |
| 提交部署 / 开始部署 | Cloud Run（或你们既定流水线）再部署一次 |
| 小程序 | 你本地用微信工具上传 |
