# 个人 AI 用量面板方案

> 日期：2026-05-01
> 目标：打开一个在线页面，就能看到 Codex / Claude Code / Gemini CLI / Kimi / DeepSeek 等工具的余额、用量和刷新时间。

## 结论

可以做，但要分两层：

1. **API 账户用量**：可以自动化，适合做在线面板。
2. **订阅制 App / CLI 套餐剩余额度**：很多平台不开放个人套餐实时 API，需要手动录入、邮件解析，或浏览器自动化辅助。

## 第一版字段

| 字段 | 说明 |
|------|------|
| provider | OpenAI / Anthropic / Gemini / Kimi / DeepSeek |
| tool | Codex / Claude Code / Gemini CLI / Kimi / DeepSeek |
| account_type | API / Pro 订阅 / Team / 手动 |
| quota_label | 月额度、余额、Token、次数等 |
| used | 已用 |
| remaining | 剩余 |
| cost | 本周期费用 |
| currency | CNY / USD |
| refreshed_at | 最近刷新时间 |
| source | API / CSV / 手动 / 邮件 |
| note | 限制或说明 |

## 平台接入判断

| 平台 | 自动化可行性 | 第一版建议 |
|------|--------------|------------|
| OpenAI / Codex | 高。OpenAI 有 Usage / Costs API。 | 接 API，展示 API 成本与用量。Codex App 个人套餐如无公开接口，先手动。 |
| Anthropic / Claude Code | 高。Anthropic 有 Usage and Cost API。 | 接 API，Claude Code 订阅套餐限制另做手动字段。 |
| Gemini CLI | 中。Gemini API 走 Google AI Studio / Cloud Billing。 | 先接 Google Cloud Billing 或手动填，后续加预算告警。 |
| Kimi | 高。Kimi / Moonshot 有余额查询接口。 | 接 `/v1/users/me/balance`。 |
| DeepSeek | 高。DeepSeek 有 `/user/balance`。 | 接余额接口，使用明细可先 CSV 导入。 |

## 第一版实现路线

1. 建一个私有的 `usage-dashboard` 小页面。
2. 后端只读环境变量里的各平台 API Key，不在前端暴露。
3. 每 30-60 分钟刷新一次，结果缓存到数据库或 JSON。
4. 页面按平台展示：余额 / 已用 / 估算剩余 / 最近刷新 / 异常。
5. 对没有 API 的套餐型工具，提供手动录入和到期提醒。

## 安全约束

- API Key 只放服务端环境变量。
- 页面需要登录或至少 Basic Auth。
- 不在浏览器 localStorage 保存平台 Key。
- 记录刷新失败原因，但不要写入完整 Key。

## 参考入口

- OpenAI Usage / Costs API
- Anthropic Usage and Cost API
- Google Gemini API Billing
- Kimi Balance API
- DeepSeek Balance API
