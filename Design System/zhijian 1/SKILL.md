---
name: zhijian-design
description: Use this skill to generate well-branded interfaces and assets for 小纸笺 (ZhiJian), a Chinese AI-powered toolkit for early-childhood educators. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), import `colors_and_type.css` for all design tokens and copy relevant assets from `assets/`. Create static HTML files for the user to view.

If working on production code, use `colors_and_type.css` tokens as the source of truth and follow the conventions in README.md (VISUAL FOUNDATIONS + CONTENT FUNDAMENTALS sections).

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key facts to keep in mind:
- Brand color: oklch(0.62 0.14 40) — warm terracotta/rust
- Background: #f6f1e7 — warm parchment, never pure white
- Primary font: Noto Sans SC (UI), LXGW WenKai (expressive/brand)
- Tone: warm, nurturing, professional — written for Chinese preschool teachers & parents
- Products: web workbench (admin.zhijian.me), homes parent page (zhijian.homes), WeChat mini program
- Logo: in-UI mark is 笺 character in WenKai font on brand-colored square; full logos in assets/
