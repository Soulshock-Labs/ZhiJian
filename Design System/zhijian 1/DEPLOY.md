# 小纸笺前端部署指南

> 如何把本设计系统 + UI Kit 集成到 `Ethan7586/ZhiJian` 并部署到 GitHub Pages / Vercel

---

## 一、把设计 Token 集成到 Next.js 工作台

### 方法 A：直接复制 CSS 变量（最快）

1. 把 `colors_and_type.css` 中的 `:root { ... }` 内容复制到：
   ```
   zhijian-workbench/web-workbench/app/globals.css
   ```
   （已有的 `globals.css` 格式完全一致，直接替换即可）

2. 字体 import 已经在 `globals.css` 里了，无需重复添加。

### 方法 B：作为独立文件导入

```tsx
// zhijian-workbench/web-workbench/app/layout.tsx
import '../../colors_and_type.css'   // 调整相对路径
```

---

## 二、把吉祥物/Logo 复制到项目

```bash
# 在 ZhiJian 仓库根目录执行
cp design-system/assets/logo-paperpen-icon.svg \
   zhijian-workbench/web-workbench/public/logo.svg

cp design-system/assets/logo-paperpen-blackgold.svg \
   zhijian-workbench/web-workbench/public/logo-full.svg
```

小鸡吉祥物目前是内联 SVG，可以把 SVG 代码提取为 React 组件：

```tsx
// components/ChickIcon.tsx
export function ChickIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.17} viewBox="0 0 220 260" fill="none">
      {/* 复制 preview/mascot-agent.html 中的 SVG 内容 */}
    </svg>
  )
}
```

---

## 三、把家园页面部署到 GitHub Pages

### 步骤

1. 在 `Ethan7586/ZhiJian` 仓库里，进入 **Settings → Pages**
2. Source 选择 **GitHub Actions** 或 **Deploy from a branch**
3. 选择分支 `main`，目录选 `zhijian-homes/`（或 `zhijian-web/`）

### 或者用 Vercel（推荐）

```bash
# 在 zhijian-homes/ 目录
npx vercel --prod
# 根目录是 zhijian-homes/，output 是 index.html
```

项目已有 `.vercelignore` 和 `firebase.json`，说明也在考虑 Firebase Hosting：

```bash
# Firebase 部署（zhijian-web/static-www-soulshock 已配置好）
cd zhijian-web/static-www-soulshock
firebase deploy
```

---

## 四、把工作台部署到 Vercel

```bash
cd zhijian-workbench/web-workbench

# 安装依赖
npm install

# 本地预览
npm run dev

# 部署
npx vercel --prod
```

环境变量（参考 `.env.local.example`）：
```env
NEXT_PUBLIC_API_URL=https://api.zhijian.me
FIREBASE_PROJECT_ID=zhijian-prod
# ... 其余参考 .env.local.example
```

---

## 五、把本设计系统作为 Git Submodule 引用（可选）

如果想让设计系统跟随主仓库一起维护：

```bash
# 在 ZhiJian 仓库根目录
git submodule add https://github.com/YOUR_ORG/zhijian-design-system design-system
git commit -m "chore: add design system submodule"
```

之后在 Next.js 里可以直接 `import '../../../design-system/colors_and_type.css'`

---

## 六、推荐的前端文件结构

```
ZhiJian/
├── zhijian-workbench/web-workbench/   # Next.js 教师工作台
│   ├── public/
│   │   ├── logo.svg                   ← 从 assets/ 复制
│   │   └── chick-mascot.svg           ← 从 preview/ 提取
│   ├── app/globals.css                ← 已包含设计 Token
│   └── components/
│       ├── ChickIcon.tsx              ← 新建：吉祥物组件
│       └── ...existing components
├── zhijian-homes/index.html           # 家长端静态页（直接部署）
├── zhijian-web/                       # 营销官网（静态）
└── design-system/                     # （可选 submodule）
    ├── colors_and_type.css
    ├── assets/
    └── preview/
```

---

## 七、快速 Checklist

- [ ] 复制 `colors_and_type.css` → `globals.css`（Token 统一）
- [ ] 把 Logo SVG 放入 `public/`
- [ ] 创建 `ChickIcon.tsx` 组件（从 SVG 提取）
- [ ] 把 `Ma Shan Zheng` 字体 import 加入 `globals.css`
- [ ] Vercel 部署 workbench：`cd zhijian-workbench/web-workbench && vercel`
- [ ] Firebase 部署 homes：`cd zhijian-web/static-www-soulshock && firebase deploy`
- [ ] GitHub Pages 或 Vercel 部署 `zhijian-homes/index.html`
