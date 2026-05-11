# CLAUDE.md · 纸笺前端工程约束

> 放在仓库根目录。Claude Code 每次打开项目自动读这个。保持 < 100 行。

## 项目是什么
- FastAPI 后端 + 单页 `index.html` 前端，同域部署
- 三端：Web（index.html）· 微信小程序（mini-program/）· Android（android-app/）
- 当前版本 v1.1.4，不接 Next.js / Vite / Webpack

## 视觉方向已冻结
- 主字：Noto Sans SC / HarmonyOS Sans SC
- 品牌字：LXGW WenKai Screen（仅用于品牌名 + 大标题）
- 数字：Inter · tabular-nums
- 主色：朱砂 `oklch(0.62 0.14 40)`
- 底色：米纸 `#f6f1e7` / `#fbf7ed`
- 文本：暖墨 `#2a2520` / `#5a5148` / `#8a8178`
- 一切参数走 `static/tokens.css`

## 铁律
1. **不发明视觉**。所有样式从 `tokens.css` + `components.css` 取。
2. **不改后端接口**，不碰 `main.py` 里的路由签名。
3. **不新增依赖**，不引入打包工具。
4. **写死的颜色 / 字号 / 圆角必须换成 CSS var**。
5. 每个改动 ≤ 一个 PATCH，分支 `feat/frontend-redesign-*`，一个 PATCH 一个 commit。
6. 不动 `android-app/`、`mini-program/`、`static-www-soulshock/`，除非明确要求。

## 接口清单（不要改路径）
- `POST /generate` · `POST /generate-weekly` · `POST /generate-daily`
- `POST /preview` · `POST /preview-daily`
- `POST /generate-term-plan` · `POST /apply-daily-feedback`
- `GET /roadmap` · `GET /health`

## 动手前先答
1. 我要改的文件是哪几个？
2. 有没有不必要的新增依赖？
3. 这个改动是否影响 Android / 小程序端？
4. 风险点 + 回滚命令。

## 文档顺序
1. 先读 `MEMORY.md`
2. 再读 `docs/CLAUDE_HANDOFF.md`
3. 再动代码
