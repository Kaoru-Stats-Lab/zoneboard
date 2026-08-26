#!/usr/bin/env python3
"""Export ZoneBoard brand motion masters (Pixel2Motion choreography).

Surfaces from public/brand/motion/OUTPUTS.md:
  A — mark sting + lockup sting (plate)
  B — clear transparent mark (overlay)

Requires: playwright + chromium, Pillow.
Optional MP4: pip install imageio imageio-ffmpeg
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MOTION = ROOT / "public" / "brand" / "motion"
OUT = MOTION / "exports"
FPS = 30


def render_html(
    *,
    svg: str,
    css: str,
    bg: str,
    stage_w: int,
    stage_h: int,
    logo_w: int,
) -> str:
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    html, body {{
      margin: 0;
      width: {stage_w}px;
      height: {stage_h}px;
      background: {bg};
      overflow: hidden;
    }}
    #logo-root {{
      width: {stage_w}px;
      height: {stage_h}px;
      display: grid;
      place-items: center;
    }}
    #logo-root svg {{
      width: {logo_w}px;
      height: auto;
      display: block;
    }}
    @media (prefers-reduced-motion: reduce) {{
      #logo-root * {{ animation: none !important; }}
    }}
    @media (prefers-reduced-motion: no-preference) {{
{chr(10).join("      " + line if line.strip() else line for line in css.splitlines())}
    }}
  </style>
</head>
<body>
  <div id="logo-root">{svg}</div>
  <script>
    window.__p2mReady = false;
    const params = new URLSearchParams(location.search);
    const seekMs = params.get("t");
    const staticMode = params.get("static");
    function heroAnimations() {{
      return document.getAnimations().filter((a) => {{
        const t = a.effect && a.effect.target;
        return t && document.getElementById("logo-root")?.contains(t);
      }});
    }}
    requestAnimationFrame(() => {{
      requestAnimationFrame(() => {{
        if (staticMode !== null) {{
          for (const a of heroAnimations()) {{
            try {{ a.finish(); }} catch {{ a.cancel(); }}
          }}
          window.__p2mReady = true;
          return;
        }}
        if (seekMs !== null) {{
          for (const a of heroAnimations()) {{
            a.pause();
            a.currentTime = Number(seekMs);
          }}
          window.__p2mReady = true;
          return;
        }}
        window.__p2mReady = true;
      }});
    }});
  </script>
</body>
</html>
"""


CLEAR_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 40 40" width="320" height="320" role="img" aria-label="ZoneBoard">
  <g id="mark">
    <line id="link" x1="22.5" y1="9.5" x2="9.5" y2="22.5" stroke="#f3f3f1" stroke-width="2.2" stroke-linecap="round" pathLength="1" fill="none"/>
    <circle id="dot-0" cx="9" cy="9" r="2.45" fill="#f3f3f1"/>
    <circle id="dot-1" cx="16" cy="9" r="2.45" fill="#f3f3f1"/>
    <circle id="dot-2" cx="23" cy="9" r="2.45" fill="#f3f3f1"/>
    <circle id="dot-3" cx="9" cy="23" r="2.45" fill="#f3f3f1"/>
    <circle id="dot-4" cx="16" cy="23" r="2.45" fill="#f3f3f1"/>
    <circle id="dot-accent" cx="23" cy="23" r="2.45" fill="#c4a24a"/>
  </g>
</svg>
"""


def times_ms(total_ms: int) -> list[int]:
    step = 1000 // FPS
    return list(range(0, total_ms + 1, step))


def capture(
    html_path: Path,
    frame_dir: Path,
    *,
    viewport: tuple[int, int],
    omit_background: bool,
    total_ms: int,
) -> list[Path]:
    from playwright.sync_api import sync_playwright

    frame_dir.mkdir(parents=True, exist_ok=True)
    for old in frame_dir.glob("*.png"):
        old.unlink()
    frames: list[Path] = []
    url = html_path.resolve().as_uri()
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(
            viewport={"width": viewport[0], "height": viewport[1]},
            device_scale_factor=1,
        )
        for t in times_ms(total_ms):
            page.goto(f"{url}?t={t}")
            page.wait_for_function("window.__p2mReady === true")
            path = frame_dir / f"frame_{t:05d}.png"
            page.locator("#logo-root").screenshot(
                path=str(path),
                omit_background=omit_background,
            )
            frames.append(path)
        browser.close()
    return frames


def write_gif(frames: list[Path], out_path: Path, *, transparent: bool) -> None:
    from PIL import Image

    images = []
    for path in frames:
        im = Image.open(path)
        if transparent:
            images.append(im.convert("RGBA"))
        else:
            images.append(im.convert("RGB"))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    duration = int(1000 / FPS)
    if transparent:
        images[0].save(
            out_path,
            save_all=True,
            append_images=images[1:],
            duration=duration,
            loop=0,
            disposal=2,
            optimize=False,
        )
    else:
        images[0].save(
            out_path,
            save_all=True,
            append_images=images[1:],
            duration=duration,
            loop=0,
            optimize=True,
        )
    print(f"gif -> {out_path}")


def write_mp4(frames: list[Path], out_path: Path) -> bool:
    try:
        import imageio.v2 as imageio
    except ImportError:
        print("skip mp4 (pip install imageio imageio-ffmpeg)", file=sys.stderr)
        return False
    out_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        writer = imageio.get_writer(
            out_path,
            fps=FPS,
            codec="libx264",
            quality=8,
            pixelformat="yuv420p",
            macro_block_size=1,
        )
        for path in frames:
            writer.append_data(imageio.imread(path))
        writer.close()
        print(f"mp4 -> {out_path}")
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"skip mp4 ({exc})", file=sys.stderr)
        if out_path.exists():
            out_path.unlink()
        return False


def copy_final(frames: list[Path], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(frames[-1], out_path)
    print(f"png -> {out_path}")


def main() -> int:
    # Ensure lockup sources exist
    import subprocess

    subprocess.check_call([sys.executable, str(ROOT / "scripts" / "build-lockup-motion.py")])

    mark_css = (MOTION / "motion.css").read_text(encoding="utf-8")
    lockup_css = (MOTION / "motion-lockup.css").read_text(encoding="utf-8")
    logo = (MOTION / "logo.svg").read_text(encoding="utf-8")
    lockup = (MOTION / "logo-lockup.svg").read_text(encoding="utf-8")

    staging = OUT / "_staging"
    staging.mkdir(parents=True, exist_ok=True)

    variants = [
        {
            "id": "A-mark-1x1",
            "svg": logo,
            "css": mark_css,
            "bg": "#0c0d0e",
            "stage": (1080, 1080),
            "logo_w": 640,
            "total_ms": 2400,
            "omit_bg": False,
            "transparent_gif": False,
            "gif": OUT / "A" / "sting-plate-1x1.gif",
            "mp4": OUT / "A" / "sting-plate-1x1.mp4",
            "final": OUT / "A" / "final-plate-1x1.png",
        },
        {
            "id": "A-mark-16x9",
            "svg": logo,
            "css": mark_css,
            "bg": "#0c0d0e",
            "stage": (1920, 1080),
            "logo_w": 560,
            "total_ms": 2400,
            "omit_bg": False,
            "transparent_gif": False,
            "gif": OUT / "A" / "sting-plate-16x9.gif",
            "mp4": OUT / "A" / "sting-plate-16x9.mp4",
            "final": OUT / "A" / "final-plate-16x9.png",
        },
        {
            "id": "A-lockup-16x9",
            "svg": lockup,
            "css": lockup_css,
            "bg": "#0c0d0e",
            "stage": (1920, 1080),
            "logo_w": 1100,
            "total_ms": 3000,
            "omit_bg": False,
            "transparent_gif": False,
            "gif": OUT / "A" / "sting-lockup-plate-16x9.gif",
            "mp4": OUT / "A" / "sting-lockup-plate-16x9.mp4",
            "final": OUT / "A" / "final-lockup-plate-16x9.png",
        },
        {
            "id": "A-lockup-1x1",
            "svg": lockup,
            "css": lockup_css,
            "bg": "#0c0d0e",
            "stage": (1080, 1080),
            "logo_w": 920,
            "total_ms": 3000,
            "omit_bg": False,
            "transparent_gif": False,
            "gif": OUT / "A" / "sting-lockup-plate-1x1.gif",
            "mp4": OUT / "A" / "sting-lockup-plate-1x1.mp4",
            "final": OUT / "A" / "final-lockup-plate-1x1.png",
        },
        {
            "id": "B-1x1",
            "svg": CLEAR_SVG,
            "css": mark_css,
            "bg": "transparent",
            "stage": (1080, 1080),
            "logo_w": 640,
            "total_ms": 2400,
            "omit_bg": True,
            "transparent_gif": True,
            "gif": OUT / "B" / "sting-clear-1x1.gif",
            "mp4": None,
            "final": OUT / "B" / "final-clear-1x1.png",
            "keep_seq": True,
            "seq_dir": OUT / "B" / "sting-clear-1x1-frames",
        },
    ]

    for v in variants:
        html_path = staging / f"{v['id']}.html"
        html_path.write_text(
            render_html(
                svg=v["svg"],
                css=v["css"],
                bg=v["bg"],
                stage_w=v["stage"][0],
                stage_h=v["stage"][1],
                logo_w=v["logo_w"],
            ),
            encoding="utf-8",
        )
        frame_dir = staging / f"frames-{v['id']}"
        n = len(times_ms(v["total_ms"]))
        print(f"\n=== {v['id']} ({n} frames @ {FPS}fps, {v['total_ms']}ms) ===")
        frames = capture(
            html_path,
            frame_dir,
            viewport=v["stage"],
            omit_background=v["omit_bg"],
            total_ms=v["total_ms"],
        )
        write_gif(frames, v["gif"], transparent=v["transparent_gif"])
        if v.get("mp4"):
            write_mp4(frames, v["mp4"])
        copy_final(frames, v["final"])
        if v.get("keep_seq"):
            seq = Path(v["seq_dir"])
            if seq.exists():
                shutil.rmtree(seq)
            shutil.copytree(frame_dir, seq)
            print(f"seq -> {seq}")

    print(f"\nDone → {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
