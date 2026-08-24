---
name: design-review
description: Score ZoneBoard UI across hierarchy, consistency, a11y, usability, responsiveness, and performance with a prioritized findings table. Use when the user asks for a design review, heuristic evaluation, LP/editor critique, visual QA, or before/after UI polish.
---

# Design Review

Structured review for **ZoneBoard** (stream tactics board). Product is the pitch, not a recorder and not a component library.

## ZoneBoard constraints

Apply before generic SaaS taste:

- Canvas ≥ chrome. Broadcast hides tools. Do not recommend denser sidebars, extra CTAs, or icon toolbars.
- Tools stay **words** (Place / Draw / Show language). No Lucide-as-tools.
- LP: one dark studio, brass rest CTA `#c4a24a`, no cyan primary, no second CTA at the footer, no fake “Loading…”.
- Home/Away kit pickers live in Roster (prep). Soccer family: Outfield + GK per team. Do not infer GK from number 1. Club names stay in Match.
- Selection color in Settings is the selection ring only, not the kit.
- Football-only UI. Do not score the missing sport dropdown as a gap.
- Do not propose DTCG tokens, shadcn, or “make it feel like Linear/Stripe”.
- Findings language: match the user (Japanese if the chat is Japanese).

If a11y contrast is in doubt, run the sibling skill’s script:

```bash
node .cursor/skills/a11y-audit/scripts/contrast.mjs "#foreground" "#background"
```

## Steps

1. Name surface + job (streamer placing XI, drawing a run, going broadcast, landing visitor).
2. Score 1–5 on each dimension. Overall = weighted sum.

| Dimension | Weight |
|-----------|--------|
| Visual hierarchy | 20% |
| Consistency | 20% |
| Accessibility (chrome only) | 20% |
| Usability | 20% |
| Responsiveness | 10% |
| Performance / chrome cost | 10% |

3. Nielsen 10 — flag by number only when it bites this product (visibility of system status, match between system and football world, user control, consistency, error prevention, recognition vs recall, flexibility, aesthetic and minimalist, error recovery, help).
4. Anti-slop: generic rounded cards, purple gradients, icon grids, extra empty states, “AI” badges, second hero CTA.

## Output

```
Overall: X.X / 5

| Dimension | Score | Note |
|-----------|-------|------|
| Hierarchy | n | … |

| # | Sev | Finding | Fix |
|---|-----|---------|-----|
| 1 | Critical | … | … |
```

Severity: **Critical** → **Major** → **Minor** → **Enhancement**.

Fixes must name existing files (`src/styles.css`, `src/components/Drawer.tsx`, …) and keep the current visual language. Do not add a design-system package.
