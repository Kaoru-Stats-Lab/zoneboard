# ZoneBoard — motion brief

Source: canonical brand mark (`public/brand/exports/icon-color.svg`). Raster fit skipped — geometry is already minimal primitives (circles + one stroke).

## Personality

| Axis | Reading |
|---|---|
| Energy | Mid-low — boardroom calm, not stadium hype |
| Tone | Serious / professional — tactics, not entertainment splash |

**Three words:** precise, composed, intentional

Closest preset: **Trustworthy / Professional** timing with **Elegant** duration band (splash/intro for Clipchamp end cards).

```css
--p2m-duration: 1600ms;
--p2m-ease-enter: cubic-bezier(0, 0, 0.2, 1);      /* confident ease-out */
--p2m-ease-settle: cubic-bezier(0.4, 0, 0.2, 1);
--p2m-ease-natural: cubic-bezier(0.4, 0, 0.2, 1);
--p2m-overshoot: 1.0;                               /* land exactly — composed */
--p2m-squash: 0;
```

## Usage context

Splash / intro reveal (~1600ms) → hold on final static mark. Primary consumer: Clipchamp end card / brand sting after board recording.

## Part inventory

| Id | Role |
|---|---|
| `#plate` | Studio tile (static; no motion) |
| `#link` | Diagonal zone stroke — draw-on |
| `#dot-0` … `#dot-4` | Ivory markers — staggered assembly (reading order) |
| `#dot-accent` | Brass first-marker — arrives last |

## Choreography sketch

**Pattern:** staggered assembly → beat → draw-on link → accent (reveal-patterns §2 + §1)

1. **Anticipation (0–20%):** empty plate hold — no bounce, no pre-shrink of the whole logo.
2. **Ivory cascade (18–54%):** dots land TL→TR then BL→BM.
3. **Beat (~54–64%, ≈160ms):** lattice holds so the link reads as consequence.
4. **Link draw (64–86%):** `#link` draws TR→BL.
5. **Beat (~86–91%, ≈80ms):** link complete before accent.
6. **Accent (91–100%):** brass snaps to full `#c4a24a` (no opacity ramp — avoids muddy mid-frames), whisper `scale(0.98→1)`.
7. **Hold + outro (1600–2400ms):** geometry holds; plate/mark whisper-fade to 0.9 for editor cuts.

Drag hierarchy: plate (static) → ivory dots → link → accent.

### Peer-review tweaks

- v2: link after ivory; brass overshoot off; plate `#141516` + hairline on stage `#0c0d0e`.
- v3: link beat ~160ms (64%); quieter brass; soft outro fade on hold tail (`--p2m-total: 2400ms`).
- v4: brass color fidelity — opacity hard-cut to `#c4a24a`; ~80ms after link; scale-only settle 0.98→1.

## Principles applied

- Staging — reading order across the 2×3 lattice; brass last = first-marker story
- Slow In / Slow Out — literal ease-out / ease-in-out on every keyframe segment
- Timing — 1600ms splash; part windows ~280–400ms
- Follow Through — brief post-cascade beat before the link; accent lands without bounce
- Appeal — restraint; no squash, no sparkle

## Complexity note

Primitives only (ladder level 1). Smoothness gate N/A for stair-steps; circles and round-cap stroke are the source of truth. IoU vs raster not run — vector is authored source.
