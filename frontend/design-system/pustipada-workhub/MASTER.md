# Pustipada Workhub — Design System Master

> **LOGIC:** When building a specific page, first check `design-system/pustipada-workhub/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

**Direction:** Swiss minimal + ledger. Density 8/10, variance 3/10, motion 2/10.
**Source of truth in code:** `src/styles/tokens.css`. This document explains intent; the tokens file wins on values.

---

## Typography

- **Sans:** Inter (`--font-sans`), self-hosted at `public/fonts/inter-var-latin.woff2`.
- **Mono:** JetBrains Mono (`--font-mono`), used only for numbers, metrics, dates, IDs, and compact counters.
- Body base is **16px** (`--text-md`). UI copy uses `--text-base` (14px), labels `--text-xs` (12px).
- Scale: `12 / 13 / 14 / 16 / 20 / 24 / 32 / 40` (`--text-xs` … `--text-3xl`).
- Headings: weight 600, line-height 1.2, tracking `-0.02em`. Labels: tracking `0.04em`, never `0.16em`.
- Numbers in tables, stats, dates, and metrics use `font-variant-numeric: tabular-nums`.

## Color

- One brand accent: teal. `--primary: #0f766e` with `--on-primary: #ffffff` (contrast ≥ 4.5:1).
- `#0d9488` is reserved for focus rings/soft accents, never as a button fill with white text.
- Semantic tones only: `neutral | info | warning | success | danger` (`--tone-*-bg`, `--tone-*-fg`).
- No violet/purple. No raw hex outside `tokens.css`.
- Dark mode is token-driven via `prefers-color-scheme`; do not invert colors by hand.

## Space, Radius, Elevation, Motion

- Spacing: 4px scale `--space-1` … `--space-8`.
- Radius: `--r-xs 4`, `--r-sm 6`, `--r-md 8`, `--r-lg 12`. Buttons use `--r-md`; pills are forbidden except avatars and 6px dots.
- Elevation: **no shadow on cards or panels**. Only modals/popovers may use `--shadow-pop`.
- Motion: `--dur-fast 120ms`, `--dur 180ms`, `--dur-slow 240ms`, `--ease`.
- Respect `prefers-reduced-motion` (handled globally in `base.css`).

## Components

- `Button`: primary / secondary / ghost / danger; sizes sm (32px) and md (40px); loading state keeps width.
- `Badge`: dot + label, 6px radius, no pill, tones above.
- `Surface`: 1px border, radius 12, no shadow; tones plain / muted / inset.
- `Stat`: muted label with tone dot, mono tabular value, optional hint.
- `Field`: visible label, hint, error with `role="alert"` and `aria-describedby`; validate on blur.
- `Modal`: focus trap, Esc to close, focus restored to trigger, `aria-labelledby`.
- `ConfirmDialog`: replaces `window.confirm`; destructive action uses danger variant.
- `Skeleton`: pulse placeholder for lists and metrics; spinner only for session-level loading.

## Layout

- Sidebar: solid deep teal (`--sidebar`), flat monogram, active item = 2px left bar + text color (no tinted pill).
- Content: max-width 1180px, grid-based, hairline separators.
- Tables: sortable headers with `aria-sort`, rows reachable by keyboard via a real link, right-aligned dates/numbers.
- Mobile/tablet: 44×44px minimum targets; table becomes a stacked ledger list below 768px, or when its container is narrower than 920px.
- Login: factual, not marketing. No radial gradients, no hero copy.

## Anti-Patterns (Do NOT Use)

- Gradients used as decoration (brand marks, page backgrounds, stat cards).
- Shadow-heavy cards, 4px colored left borders on stat cards, or elevation on every surface.
- Pill buttons, mixed radius languages, all-caps micro-labels with heavy tracking.
- Emojis or text glyphs (✓, →) as icons; use inline SVG with `aria-hidden` plus a label.
- "Halo, {firstName}" greetings; use factual page titles and context.
- Color-only status meaning, violet status badges, or hardcoded hex in components.
- `window.confirm`, icon-only buttons without `aria-label`, clickable `<tr>` without keyboard access.

## Pre-Delivery Checklist

- [ ] No raw hex outside `tokens.css`
- [ ] No decorative shadows or gradients
- [ ] Radius uses the `--r-*` scale; no new pills
- [ ] Inter and JetBrains Mono load from `public/fonts`
- [ ] Focus visible on every interactive element
- [ ] Contrast ≥ 4.5:1 for text, ≥ 3:1 for UI boundaries
- [ ] Keyboard: tab order, Esc in modals, focus restored
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive at 375 / 768 / 1024 / 1440
- [ ] No horizontal scroll on mobile
