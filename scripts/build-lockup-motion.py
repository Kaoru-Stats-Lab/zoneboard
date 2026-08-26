"""Build lockup motion SVG + CSS from mark motion + wordmark path."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MOTION = ROOT / "public" / "brand" / "motion"
MARK_CSS = (MOTION / "motion.css").read_text(encoding="utf-8")
LOCKUP_SRC = (ROOT / "public" / "brand" / "exports" / "lockup-color-dark.svg").read_text(
    encoding="utf-8"
)
WORD_D = re.search(r'<path fill="[^"]+" d="([^"]+)"', LOCKUP_SRC)
assert WORD_D
WORD_D = WORD_D.group(1)

# Canonical row lockup metrics (scripts/write-brand-marks.ts)
PAD = 2
MARK_BOX = 32
GAP = 10
WORD_W = 129.22
WORD_CAP = 19.6
LOCKUP_W = PAD + MARK_BOX + GAP + WORD_W + PAD  # 175.22
LOCKUP_H = PAD + MARK_BOX + PAD  # 36
WORD_X = PAD + MARK_BOX + GAP  # 44
BASELINE = PAD + MARK_BOX / 2 + WORD_CAP / 2  # 27.8
MARK_SPAN = 21
S = MARK_BOX / MARK_SPAN
TX = PAD - 5.5 * S
TY = PAD - 5.5 * S

# Breathing room around plate
VB_PAD = 10
VB_X = -VB_PAD
VB_Y = -VB_PAD
VB_W = LOCKUP_W + VB_PAD * 2
VB_H = LOCKUP_H + VB_PAD * 2

svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VB_X} {VB_Y} {VB_W:.2f} {VB_H:.2f}" width="{VB_W:.2f}" height="{VB_H:.2f}" role="img" aria-label="ZoneBoard">
  <rect id="plate" x="0" y="0" width="{LOCKUP_W:.2f}" height="{LOCKUP_H:.2f}" rx="8" fill="#141516" stroke="#1c1d1f" stroke-width="0.35"/>
  <g id="lockup">
    <g id="mark" transform="translate({TX:.3f} {TY:.3f}) scale({S:.6f})">
      <line id="link" x1="22.5" y1="9.5" x2="9.5" y2="22.5" stroke="#f3f3f1" stroke-width="2.2" stroke-linecap="round" pathLength="1" fill="none"/>
      <circle id="dot-0" cx="9" cy="9" r="2.45" fill="#f3f3f1"/>
      <circle id="dot-1" cx="16" cy="9" r="2.45" fill="#f3f3f1"/>
      <circle id="dot-2" cx="23" cy="9" r="2.45" fill="#f3f3f1"/>
      <circle id="dot-3" cx="9" cy="23" r="2.45" fill="#f3f3f1"/>
      <circle id="dot-4" cx="16" cy="23" r="2.45" fill="#f3f3f1"/>
      <circle id="dot-accent" cx="23" cy="23" r="2.45" fill="#c4a24a"/>
    </g>
    <path id="wordmark" fill="#f3f3f1" d="{WORD_D}" transform="translate({WORD_X:.2f} {BASELINE:.2f})"/>
  </g>
</svg>
"""
(MOTION / "logo-lockup.svg").write_text(svg, encoding="utf-8")

# Lockup CSS: reuse mark keyframes; word wipe after mark; longer outro clock
# Strip mark-only outro targets and prepend lockup tokens + wordmark
css_body = MARK_CSS
# Replace root tokens and outro targets for lockup timeline
lockup_css = f"""/* ZoneBoard lockup sting — mark v4 + wordmark wipe (Surface A discovery end card).
   Mark clock 1600ms; wordmark 2200ms; outro/hold total 3000ms.
*/
:root {{
  --p2m-duration: 1600ms;
  --p2m-word-duration: 2200ms;
  --p2m-total: 3000ms;
  --p2m-ease-enter: cubic-bezier(0, 0, 0.2, 1);
  --p2m-ease-settle: cubic-bezier(0.4, 0, 0.2, 1);
  --p2m-ease-natural: cubic-bezier(0.4, 0, 0.2, 1);
  --p2m-overshoot: 1.0;
}}

#plate,
#lockup {{
  animation: zb-outro var(--p2m-total) both;
}}

#dot-0,
#dot-1,
#dot-2,
#dot-3,
#dot-4,
#dot-accent {{
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
  animation: zb-dot var(--p2m-duration) both;
}}

#dot-0 {{ animation-name: zb-dot-0; }}
#dot-1 {{ animation-name: zb-dot-1; }}
#dot-2 {{ animation-name: zb-dot-2; }}
#dot-3 {{ animation-name: zb-dot-3; }}
#dot-4 {{ animation-name: zb-dot-4; }}
#dot-accent {{ animation-name: zb-dot-accent; }}

#link {{
  stroke-dasharray: 1 1.2;
  stroke-dashoffset: 1.1;
  animation: zb-draw var(--p2m-duration) both;
}}

#wordmark {{
  /* Mask wipe LTR — no opacity ramp (keeps ivory ink weight) */
  clip-path: inset(0 100% 0 0);
  animation: zb-word var(--p2m-word-duration) both;
}}

"""

# Append keyframes from mark css (from first @keyframes onward)
idx = MARK_CSS.find("@keyframes zb-dot-0")
assert idx != -1
keyframes = MARK_CSS[idx:]
# Replace outro percentages for 3000ms: hold through ~2.4s = 80%, fade to end
# Old outro was 83.333% of 2400 = 2000ms. New: 2400/3000 = 80%
keyframes = keyframes.replace(
    """@keyframes zb-outro {
  0%, 83.333% {
    opacity: 1;
  }
  83.333% {
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  100% {
    opacity: 0.9;
  }
}""",
    """@keyframes zb-outro {
  0%, 80% {
    opacity: 1;
  }
  80% {
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  100% {
    opacity: 0.9;
  }
}

/* Wordmark after brass (~1600ms = 72.7% of 2200ms) + ~80ms beat */
@keyframes zb-word {
  0%, 76% {
    clip-path: inset(0 100% 0 0);
  }
  76% {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1); /* --p2m-ease-enter */
  }
  92% {
    clip-path: inset(0 0 0 0);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  100% {
    clip-path: inset(0 0 0 0);
  }
}""",
)

(MOTION / "motion-lockup.css").write_text(lockup_css + keyframes, encoding="utf-8")
print("wrote logo-lockup.svg + motion-lockup.css")
