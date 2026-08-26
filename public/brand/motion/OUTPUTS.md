# Brand motion outputs — where & what

## MECE usage map

| ID | Surface | Job | Never |
|---|---|---|---|
| **A** | Standalone sting | Fills the frame *after* board footage ends | Overlay on live play |
| **B** | Composite overlay | Sits *on* existing footage (transparent mark) | Full-screen end card |
| **C** | Product / owned UI | Live HTML / same tokens | Baked into every creator cut |
| **D** | Reference / QA | Review only | Ship to viewers |

Out of scope: Broadcast live, pitch ink, sound logo.

### Surface A — two masters (pick by audience)

| Variant | When | Default? |
|---|---|---|
| **Lockup** (mark + ZoneBoard word) | Discovery / VOD end card — viewers may not know the mark | **Yes — Clipchamp / YouTube default** |
| **Mark-only** | Audience already knows the brand; shorter square sting | Secondary |

## Format matrix

| Asset | Spec | Use |
|---|---|---|
| `A/sting-lockup-plate-16x9.mp4` | 1920×1080 · ~3.0s | **Default** landscape end card |
| `A/sting-lockup-plate-1x1.mp4` | 1080×1080 · ~3.0s | Square end card |
| `A/sting-plate-1x1.mp4` | 1080×1080 · ~2.4s | Mark-only square |
| `A/sting-plate-16x9.mp4` | 1920×1080 · ~2.4s | Mark-only landscape |
| `B/sting-clear-1x1.gif` (+ PNG seq) | Transparent mark | Composite over board |
| `C/logo_motion.html` | Mark live | Product / QA |
| `C` lockup sources | `logo-lockup.svg` + `motion-lockup.css` | Regenerated with export |

Choreography:

- **Mark:** plate → ivory reading order → beat → link draw → brass snap (`#c4a24a`)
- **Lockup:** same mark, then LTR wordmark wipe (~80ms after brass)

Regenerate: `npm run brand:motion`

## Editor recipe (Clipchamp)

1. Board capture ends.
2. Drop **`A/sting-lockup-plate-16x9.mp4`** (~3s).
3. Known-audience / tight cut: mark-only `sting-plate-1x1.mp4`.
4. Overlay on last second of board: **B** clear, not lockup.

## LP（Sports signal）

- ヒーローに載せない。Parallax なし。
- After 帯: **HTML/CSS 1-shot**（`LpEndCardDemo` — スクロールインで1回、Replay 可）。`prefers-reduced-motion` は静止ロックアップ。
- MP4（`exports/A/sting-lockup-plate-16x9.mp4`）は Clipchamp 用マスター。LP の正は CSS。
