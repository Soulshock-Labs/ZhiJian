# 小纸笺微信小程序 · 重设计版

> 路径：`zhijian-mini/mini-redesign/`  
> 用微信开发者工具直接打开此目录即可预览运行。

---

## 文件结构

```
mini-redesign/
├── app.js                        # 全局 App，管理登录状态
├── app.json                      # 页面路由 + tabBar 配置
├── app.wxss                      # 全局设计 Token（CSS 变量）+ 通用组件样式
├── sitemap.json
├── project.config.json           # 填入你的 AppID 后可直接运行
├── assets/
│   ├── chick-default.svg         # 小纸鸡·默认站姿
│   ├── chick-thinking.svg        # 小纸鸡·思考中（AI生成时）
│   └── chick-happy.svg           # 小纸鸡·开心（生成完成）
└── pages/
    ├── workbench/                # 首页工作台
    │   ├── workbench.wxml
    │   ├── workbench.wxss
    │   ├── workbench.js
    │   └── workbench.json
    ├── generate/                 # AI 生成周计划（三步骤流程）
    │   ├── generate.wxml
    │   ├── generate.wxss
    │   ├── generate.js
    │   └── generate.json
    └── profile/                  # 个人中心 + 登录注册
        ├── profile.wxml
        ├── profile.wxss
        ├── profile.js
        └── profile.json
```

---

## 快速启动

1. 打开**微信开发者工具**
2. 新建项目 → 选择目录 `zhijian-mini/mini-redesign/`
3. 填入你的 AppID（在 `project.config.json` 中替换 `YOUR_APPID_HERE`）
4. 点击编译即可预览三个页面

---

## 接入后端 API

在 `generate.js` 和 `profile.js` 中，所有 `wx.request` 的 `url` 均指向 `https://api.zhijian.me`。  
开发阶段可在微信开发者工具中勾选「不校验合法域名」。  
上线前需在[微信公众平台](https://mp.weixin.qq.com) → 开发设置 → 服务器域名中添加 `api.zhijian.me`。

---

## 设计 Token 说明

所有颜色、间距、圆角均在 `app.wxss` 的 `page { }` 中定义为 CSS 变量，与 `colors_and_type.css`（Web 端）保持一致：

| Token | 值 | 用途 |
|---|---|---|
| `--color-brand` | `#e07040` | 品牌主色（陶土橙） |
| `--color-paper` | `#f6f1e7` | 主背景（暖米色纸张） |
| `--color-ink` | `#2a2520` | 主文字 |
| `--color-paper-hi` | `#fbf7ed` | 卡片背景 |

---

## 吉祥物使用规范

| 文件 | 使用场景 |
|---|---|
| `chick-default.svg` | 首页 hero、对话入口 |
| `chick-thinking.svg` | AI 生成中（loading 态） |
| `chick-happy.svg` | 生成完成（success 态） |

建议在 `<image>` 中使用 `mode="aspectFit"` 保持比例。
