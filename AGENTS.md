# 知笺项目技术文档

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

## 技术债务记录

### Cloud Run 最小实例配置

**日期：** 2026-04-28  
**状态：** 已实施，待评估

**当前配置：**
- Cloud Run 服务：`zhijian-api`
- 最小实例数：**1**（常驻，避免冷启动）
- 区域：`asia-east1`

**目的：**  
设置最小实例 = 1，确保服务始终有一个实例在运行，消除冷启动延迟（原冷启动约 3-8 秒）。

**费用影响：**
- 前期用户量小时，费用可接受（约 **$10–20 / 月**）
- 随用户增长，此方案成本会线性上升

**建议迁移时机（用户规模达到以下任一条件时评估）：**
- 日活跃用户 > 500
- 月 API 调用量 > 50,000 次
- Cloud Run 月费用 > $50

**后期优化方向：**
1. **自建 VPS**（如 Hetzner CX21，约 $5–8/月）：适合稳定流量，可降低约 70% 后端成本
2. **专用推理服务**（如 Modal / Replicate）：按调用计费，适合高峰不稳定场景
3. **混合架构**：Cloud Run 处理 API 路由，VPS 承载 AI 推理

**命令备忘（如需调整实例数）：**
```bash
# 设置最小实例为 1（当前配置）
gcloud run services update zhijian-api \
  --region=asia-east1 \
  --min-instances=1

# 恢复为 0（省钱模式，有冷启动）
gcloud run services update zhijian-api \
  --region=asia-east1 \
  --min-instances=0

# 查看当前配置
gcloud run services describe zhijian-api --region=asia-east1
```

---

## 项目架构概览

### 平台组成

| 平台 | 目录 | 技术栈 | 域名 |
|------|------|--------|------|
| Web 工作台 | `zhijian-workbench/web-workbench/` | Next.js + Tailwind | Vercel 自动部署 |
| 微信小程序 | `zhijian-mini/` | WXML / WXSS / JS | 微信生态 |
| 后端 API | `zhijian-api/` | Python (FastAPI/Flask) | `https://api.zhijian.me` |

### AI 模型分配策略

| 场景 | 模型 | 原因 |
|------|------|------|
| 周计划生成 | `moonshot-v1-8k`（AI_MODEL_FAST） | 结构化 JSON 输出，速度优先 |
| 日教案生成 | `kimi-k2.5`（AI_MODEL） | 质量优先，内容更丰富 |

### 环境变量（Cloud Run）

```
MOONSHOT_API_KEY=...       # Kimi / 月之暗面
DEEPSEEK_API_KEY=...       # DeepSeek
DASHSCOPE_API_KEY=...      # 阿里云百炼 / Qwen
AI_MODEL=kimi-k2.5
AI_MODEL_FAST=moonshot-v1-8k
```

---

## 待办 / 未完成功能

- [ ] 小程序日教案页面接入真实 API（当前 generate.js 日教案为占位符）
- [ ] 用户量增长后评估 Cloud Run 迁移方案
- [ ] 模板中心（SideNav 中标注"即将上线"）
- [ ] 周计划、日教案数据持久化（当前存储在 Cloud Run JSON 文件，重启后可能丢失）
- [ ] 考虑接入真实数据库（PostgreSQL / Supabase）替代 JSON 文件存储
