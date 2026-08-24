---
name: a11y-audit
description: Audit ZoneBoard UI against WCAG 2.2 AA with measured contrast and keyboard/focus checks. Use when the user asks for an accessibility audit, contrast check, keyboard review, screen-reader names, or WCAG pass/fail on chrome, landing, or kit colors.
---

# Accessibility Audit

Audit **editor chrome, landing, and overlays** — not the pitch canvas itself. The board is a drawing surface; a11y applies to tools, dialogs, tabs, and copy around it.

## ZoneBoard constraints

- Pitch is the product. Do not add skip-links, banners, or chrome that shrink the canvas.
- Broadcast mode hides chrome on purpose. Do not flag missing toolbars there.
- Tools are **words**, not Lucide/icon-only buttons. If an icon exists, it still needs an accessible name.
- Kit colors: outfield vs GK are separate. Do not infer GK from shirt number. Claret-vs-red is allowed; **measure** number ink on the piece, do not block the picker.
- Football only in the UI. Do not recommend sport-switcher a11y.
- Findings language: match the user (Japanese if the chat is Japanese).

## Scope

| In | Out |
|----|-----|
| Topbar, tool rail, drawer, inspectors, settings, landing, export/broadcast chrome | Pitch markings, piece glyphs as graphics, drawing ink on grass |
| Color inputs, kit swatches, piece card (number/name/GK) | Tactical meaning of pass/run/dribble styles |

## Steps

1. Name the surface (landing / editor / drawer tab / inspector / broadcast).
2. Check P0 per control:
   - Keyboard reachable
   - Visible focus (UI vs adjacent ≥ 3:1)
   - Accessible name / role / state
   - Contrast: text **4.5:1**, UI/graphics **3:1**
   - Target ≥ 24×24 CSS px (WCAG 2.5.8)
   - Not color-only (kit swatch needs a text label)
3. WCAG 2.2 extras: Focus Not Obscured (2.4.11), Target Size (2.5.8). Skip Accessible Authentication — there is no login.
4. **Measure contrast. Do not guess.**

```bash
node .cursor/skills/a11y-audit/scripts/contrast.mjs "#foreground" "#background"
```

Multiple pairs: pass `fg bg` pairs as extra args. Report the script output, never an eyeballed ratio.

Kit defaults to measure when relevant:

| Pair | fg | bg |
|------|----|----|
| LP body on stage | `#f3f3f1` | `#0c0d0e` |
| Brass CTA on stage | `#0c0d0e` | `#c4a24a` |
| Home outfield on grass-ish | `#ffffff` or piece ink | `#e74c3c` |
| Home GK | piece ink | `#2ecc71` |
| Away GK | piece ink | `#f1c40f` |

5. `prefers-reduced-motion`: LP hero loop and drawing animation must not be the only way to understand the product.

## Output

Table only. Confirm passes in one line after the table.

| WCAG | Sev | Fail | Fix |
|------|-----|------|-----|
| 1.4.3 | P0 | … | … |

Severity: **P0** blocks ship, **P1** this pass, **P2** later.

Do not trade accessibility for aesthetics on chrome. Do not invent a design-token system to “fix” hex in `src/styles.css`.
