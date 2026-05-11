# 第三方商城卡密兑换接口（v1）

本文档给第三方商城服务端使用，用于把商城售出的卡密兑换到 `smart-teacher-assistant`。

## 1) 接口地址

- 生产：`POST https://api.zhijian.me/partner/redeem`
- 开发：`POST http://127.0.0.1:8000/partner/redeem`

## 2) 鉴权方式

- Header: `X-Partner-Token: <your_token>`
- 也支持在 body 传 `partner_token`（不推荐，优先 Header）。

服务端环境变量：

- `PARTNER_REDEEM_TOKENS=token-a,token-b`（逗号分隔）
- `PARTNER_REDEEM_SOURCE=third_party_mall`（可选，默认这个值）

当 `PARTNER_REDEEM_TOKENS` 为空时，接口返回 `503 第三方兑换入口未启用`。

## 3) 请求参数（JSON）

```json
{
  "code": "VIP2026",
  "user_id": "13800138000",
  "order_id": "MALL-20260413-0001",
  "source": "mall_a"
}
```

- `code`：卡密，必填。
- `user_id`：用户账号或手机号，必填。
- `order_id`：商城订单号，选填，建议传。
- `source`：来源标识，选填。

## 4) 成功响应示例

```json
{
  "ok": true,
  "status": "success",
  "message": "成功",
  "service": {
    "type": "membership",
    "name": "会员",
    "days": 30
  },
  "granted": {
    "type": "membership",
    "name": "会员",
    "code": "VIP2026",
    "granted_at_utc": "2026-04-13T02:12:00+00:00",
    "membership_until": "2026-05-13T02:12:00+00:00"
  },
  "order_id": "MALL-20260413-0001",
  "channel": "partner_api"
}
```

## 5) 业务状态（HTTP 200）

```json
{ "ok": false, "status": "invalid", "message": "无效" }
{ "ok": false, "status": "used", "message": "已使用" }
{ "ok": false, "status": "expired", "message": "已过期" }
```

## 6) 典型错误码

- `401`：token 错误。
- `400`：参数缺失（如没传 `code`/`user_id`）。
- `503`：第三方入口未启用（未配置 token）。

## 7) cURL 示例

```bash
curl -X POST "https://api.zhijian.me/partner/redeem" \
  -H "Content-Type: application/json" \
  -H "X-Partner-Token: mall-prod-token-1" \
  -d '{
    "code": "VIP2026",
    "user_id": "13800138000",
    "order_id": "MALL-20260413-0001",
    "source": "mall_a"
  }'
```
