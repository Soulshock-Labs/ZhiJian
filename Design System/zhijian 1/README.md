# 小纸笺 Design System

> 智能创作助手 — AI-powered toolkit for content creation and workflow support.
> "小纸笺" (Xiǎo Zhǐjiān) means *Little Paper Note* — evoking the handwritten records, lesson plans, and daily observations a preschool teacher lovingly keeps.

**Sources used:**
- GitHub repo: `Ethan7586/ZhiJian` (private) — full monorepo with web workbench, homes page, WeChat mini-program, API, docs, and Android app.
- Key files: `zhijian-workbench/web-workbench/app/globals.css` (design tokens), `tailwind.config.ts`, all `components/*.tsx`.

---

## Products

| Surface | Path | URL | Description |
|---|---|---|---|
| **Web Workbench** | `zhijian-workbench/web-workbench/` | admin.zhijian.me | Teacher-facing Next.js app — lesson plans, weekly plans, knowledge vault, admin console |
| **Homes** | `zhijian-homes/` | zhijian.homes | Parent-facing landing — shows daily logs, child timeline, family-school connection |
| **WeChat Mini Program** | `zhijian-mini/mini-program/` | — | WeChat-native teacher workbench; mirrors web workbench features |
| **Marketing Web** | `zhijian-web/` | zhijian.me | Static marketing & landing pages |

---

## CONTENT FUNDAMENTALS

**Tone:** Warm, professional, nurturing. Never cold or corporate. The voice is that of a caring teacher writing to a parent — patient, specific, encouraging. Not overly cute or childish despite the preschool context.

**Language:** Simplified Chinese primary. English used only for technical labels, code, and eyebrow/meta text. URLs and brand always in lowercase Roman (zhijian.me, zhijian.homes).

**Casing:** Chinese headlines are natural case. English UI labels use sentence case, never ALL CAPS (except eyebrow / mono labels at micro size). No title case.

**Person:** First person ("我们", "老师") when speaking as the product/team. Second person ("您", "孩子") for parents. Direct and warm, never distant.

**Emoji:** Used sparingly and purposefully — mainly in timeline contexts (🌅 08:00 入园) and as icon placeholders for features not yet iconified. Not used in formal UI chrome (nav, buttons, headers). No decorative emoji spam.

**Copy length:** Short. Buttons are 2–4 characters. Descriptions cap at 2 lines. Taglines are poetic one-liners. Long-form content lives in the document body, never in UI chrome.

**Example phrases:**
- "孩子在园的每一天，我们都和您在一起"
- "每个孩子都是独特的存在"
- "即将上线" (for unreleased features — friendly, never "coming soon" in English)
- "工作台" / "周计划" / "日教案" — functional, direct

---

## VISUAL FOUNDATIONS

### Colors
**Background / Surface:** Warm parchment — `#f6f1e7` (paper), `#fbf7ed` (elevated), `#efe8da` (sunken). The warm cream base is central to the brand identity, evoking actual paper. Never pure white or gray for main backgrounds.

**Brand:** Warm terracotta/rust — `oklch(0.62 0.14 40)`. This is the single accent color. Used for CTAs, active nav states, logo mark, and highlights. Has hover (`oklch(0.56 0.15 40)`) and press (`oklch(0.50 0.15 40)`) states. Tint for backgrounds: `oklch(0.94 0.05 55)`.

**Ink:** Rich warm dark — `#2a2520` primary, stepping through `#5a5148`, `#8a8178`, `#b8ad9c`. All warm-tinted grays, never cool grays or pure black.

**Semantic:** Success = sage green, Info = calm blue, Warn = amber, Danger = deep rust. All have a 3-level system (base / tint / ink).

### Typography
**Primary (body/UI):** Noto Sans SC — clean, legible, Chinese-optimized. Used for all UI copy.
**Expressive (calligraphy):** LXGW WenKai Screen — used for brand wordmark, headings that need warmth, poetic text. The `.font-wenkai` class activates this.
**Numbers:** Inter — tabular-nums for data/stats. The `.font-num` class.
**Mono:** JetBrains Mono — code blocks, eyebrow labels.

**Scale:** display (48px) → h1 (34px) → h2 (26px) → h3 (20px) → h4 (17px) → body (15px) → body-sm (13px) → meta (12px) → micro (11px).

**Eyebrow labels:** mono font, micro size, 1.2px letter-spacing, UPPERCASE — used for section group titles in nav and cards.

### Spacing
4px base unit. Scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 120px.

### Border Radius
xs (4px) / sm (8px) / md (12px) / lg (16px) / xl (24px) / pill (999px). Buttons and nav items prefer pill. Cards use md–lg. Small icon badges use xs–sm.

### Shadows
All shadows use warm brown tints `rgba(60,40,20,...)` — never cool gray. xs → sm → md → lg → xl progression. Focus ring is brand color at 35% opacity, 3px spread.

### Backgrounds & Texture
Flat warm paper — no textures, no patterns, no gradients (except subtle radial glows on hero sections). Cards are `--color-paper-hi` on the `--color-paper` base. No glassmorphism except for the sticky nav (`backdrop-filter: saturate(1.1)`).

### Animation
Minimal. Transitions at `0.15s` ease for color/background changes. No bounce or spring animations in production UI. Panels (WeeklyPlanPanel) may slide in. Hover = background shift; active = slight scale (`scale(0.97)`) or `brightness` change.

### Hover / Press States
- Nav items: `hover:bg-paper-sunk hover:text-ink`
- Buttons: brand button uses `hover:brightness-105 active:brightness-95`
- Ghost/outline buttons: `hover:bg-brand-tint`
- Scale press: `active:scale-[.97]`

### Cards
- Background: `--color-paper-hi` or white
- Border: none (shadow only)
- Radius: `--radius-md` (12px) to `--radius-lg` (16px)
- Shadow: `--shadow-sm` to `--shadow-md`
- Padding: 16–24px

### Borders
Rule lines use `--color-rule` (#d9d0bd) — warm stone. Soft rules `--color-rule-soft` (#ebe3d1). Borders are 1px solid, never dashed or dotted in UI chrome.

### Imagery / Illustrations
No photographic imagery in the current product. Brand uses illustrated SVG logos (pen-character mashups). No full-bleed images. No gradients as primary design element.

### Corner radius for specific elements
- Nav links / pills / tags: pill (999px)
- Cards: md (12px) or lg (16px)
- Icon badges / small chips: sm (8px) or xs (4px)
- Modal / panel: lg (16px) or xl (24px)
- Logo mark square: xs (4px)

---

## ICONOGRAPHY

**Approach:** The current product uses **no icon font or icon set**. Icon slots are represented as small `<span>` blocks with `rounded-xs bg-current opacity-40` — a deliberate placeholder system. This is intentional, awaiting a custom icon set.

**Logo system:** Rich SVG illustration-based logos in `assets/`. All variations of a "paper + pen" character (a stylized pen nib or pen holding figure):
- `logo-paperpen-blackgold.svg` — primary logo, black/gold formal
- `logo-paperpen-icon.svg` — minimal icon mark
- `logo-paperpen-finger-love-clean.svg` — pen with heart gesture
- `logo-paperpen-poetic.svg` — expressive brush-style
- `logo-paperpen-neon-a.svg` — neon/vivid variant
- `logo-paperpen-spring-character.svg` — spring character style

**In-UI brand mark:** A small square pill `<span>` with `bg-brand text-white` containing the character `笺` in WenKai font. Used in TopNav.

**Emoji as icons:** Used in timeline/feature cards as placeholder icons. Not in formal UI chrome.

**Planned:** The user has mentioned desire for a chick mascot (🐣) as a brand pet/logo — to replace the pen-character system with something more child-friendly and memorable.

---

## FILES

```
README.md                         ← This file
colors_and_type.css               ← All CSS design tokens (import in artifacts)
SKILL.md                          ← Claude Code skill definition
assets/
  logo-paperpen-blackgold.svg
  logo-paperpen-icon.svg
  logo-paperpen-finger-love-clean.svg
  logo-paperpen-poetic.svg
  logo-paperpen-neon-a.svg
  logo-paperpen-spring-character.svg
preview/
  colors-brand.html               ← Brand color palette card
  colors-ink.html                 ← Ink / neutral palette card
  colors-semantic.html            ← Semantic colors card
  typography-display.html         ← Display & heading type specimens
  typography-body.html            ← Body / meta / utility type
  typography-wenkai.html          ← WenKai calligraphic font specimen
  spacing-tokens.html             ← Spacing + radius + shadow tokens
  components-buttons.html         ← Button variants
  components-nav.html             ← TopNav + SideNav
  components-cards.html           ← Card patterns
  components-badges.html          ← Chips / badges / status
  logos-overview.html             ← All logo variants
ui_kits/
  workbench/
    index.html                    ← Interactive workbench prototype
  homes/
    index.html                    ← Parent homes page prototype
```
