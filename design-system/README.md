# KodNest Premium Build System

Design system for a serious B2C product. Calm, intentional, coherent, confident. One mind; no visual drift.

---

## Design philosophy

- **Calm** — No animation noise, no flash, no gradients or glassmorphism.
- **Intentional** — Every spacing and color comes from the scale. No random values.
- **Coherent** — Same radius, same hover, same focus across all components.
- **Confident** — Serif headlines, generous spacing, clear hierarchy.

**Not:** flashy, loud, playful, hackathon-style, neon, decorative.

---

## Color system (4 colors)

| Token | Value | Use |
|-------|--------|-----|
| `--color-bg` | `#F7F6F3` | Background (off-white) |
| `--color-text` | `#111111` | Primary text |
| `--color-accent` | `#8B0000` | Accent, primary actions, focus |
| `--color-muted` | `#6B6560` | Secondary text, borders, badges |

Semantic aliases (muted, not extra colors): `--color-success`, `--color-warning`, `--color-border`, `--color-border-focus`.

---

## Typography

- **Headings:** `--font-serif` (Lora). Large, confident. Use `--text-heading-size` / `--text-heading-size-lg`, `--text-heading-line`, `--text-heading-spacing`.
- **Body:** `--font-sans` (Source Sans 3). 16–18px (`--text-body-size` / `--text-body-size-lg`), line-height 1.6–1.8. Max width for text blocks: `--text-body-max-width` (720px).
- No decorative fonts; no random sizes.

---

## Spacing scale

Use only: **8px, 16px, 24px, 40px, 64px**

| Token | Value |
|-------|--------|
| `--space-1` | 8px |
| `--space-2` | 16px |
| `--space-3` | 24px |
| `--space-4` | 40px |
| `--space-5` | 64px |

Never use values outside this scale (e.g. 13px, 27px). Whitespace is part of the design.

---

## Global layout structure

Every page follows this order:

1. **Top Bar** — Left: project name. Center: progress (Step X / Y). Right: status badge (Not Started / In Progress / Shipped).
2. **Context Header** — One large serif headline, one-line subtext. Clear purpose; no hype.
3. **Primary Workspace (70%)** — Main product interaction. Clean cards; predictable components.
4. **Secondary Panel (30%)** — Step explanation, copyable prompt box, actions (Copy, Build in Lovable, It Worked, Error, Add Screenshot). Calm styling.
5. **Proof Footer** — Checklist: □ UI Built □ Logic Working □ Test Passed □ Deployed. Each item requires user proof input.

**Classes:** `.kn-app` → `.kn-topbar` → `.kn-context-header` → `.kn-main` (`.kn-workspace` + `.kn-panel`) → `.kn-proof-footer`.

---

## Component rules

- **Primary button:** solid deep red (`--color-accent`). **Secondary:** outlined, same radius.
- **Hover:** 150–200ms, ease-in-out. Same effect everywhere; no bounce, no parallax.
- **Inputs:** clean border, no heavy shadows, clear focus (ring using `--shadow-focus`).
- **Cards:** subtle border (`--border-color`), no drop shadows, padding from spacing scale.
- **Border radius:** `--radius` (6px), `--radius-sm` (4px) for badges.

---

## Interaction

- **Transitions:** `--transition-duration` (180ms), `--transition-ease` (ease-in-out). Use `--transition` for consistency.
- No bounce, no parallax, no decorative motion.

---

## Error and empty states

- **Errors:** Explain what went wrong and how to fix it. Never blame the user. Use `.kn-error`, `.kn-error__title`, `.kn-error__message`, `.kn-error__fix`.
- **Empty states:** Provide the next action; never feel dead. Use `.kn-empty`, `.kn-empty__title`, `.kn-empty__hint`.

---

## Usage

```html
<link rel="stylesheet" href="design-system/index.css" />
```

Load fonts (e.g. in `<head>`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Source+Sans+3:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## File structure

```
design-system/
  index.css      ← Single entry (imports all)
  tokens.css     ← Colors, type, spacing, layout, transition
  base.css       ← Reset, typography, focus, selection
  layout.css     ← App shell, topbar, context header, main, footer
  components.css ← Buttons, badges, cards, inputs, prompt box, error, empty
  README.md      ← This document
```

No product features are defined in the design system; it is the visual and structural foundation only.
