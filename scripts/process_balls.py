"""ボール PNG: 背景透過・256px。円マスク＋エッジ洪水でチェッカー除去。"""
from __future__ import annotations

import math
from collections import deque
from pathlib import Path

from PIL import Image

BALLS = Path(__file__).resolve().parents[1] / "public" / "balls"
OUT_SIZE = 256
RAW = BALLS / "raw"


def is_bg_color(r: int, g: int, b: int, a: int) -> bool:
    if a < 10:
        return True
    mx, mn = max(r, g, b), min(r, g, b)
    # 白〜薄灰
    if mx >= 230 and mx - mn <= 25:
        return True
    # チェッカー灰
    if mx - mn <= 25 and 140 <= mx <= 245:
        return True
    return False


def is_anchor(r: int, g: int, b: int, a: int) -> bool:
    if a < 8 or is_bg_color(r, g, b, a):
        return False
    if r >= 200 and g >= 200 and b >= 200:
        return True
    # バスケ橙
    if r > 140 and g < 130 and b < 90 and r > g + 30:
        return True
    # バレー黄
    if r > 180 and g > 150 and b < 120:
        return True
    # 青（バレー／フットサル）
    if b > 100 and b > r + 20 and b > g + 20:
        return True
    # 緑（フットサル）
    if g > 100 and g > r + 20 and g > b + 20:
        return True
    # 赤（フットサル）
    if r > 150 and g < 110 and b < 110 and r > g + 40:
        return True
    mx, mn = max(r, g, b), min(r, g, b)
    if mx - mn < 30 and 40 <= mx <= 180:
        return True
    return False


def is_ball_color(r: int, g: int, b: int, a: int) -> bool:
    """黒縫い目の隣がボール色か（洪水で縫い目を消さない）"""
    if a < 10:
        return False
    if r >= 200 and g >= 200 and b >= 200:
        return True
    if r > 140 and g < 130 and b < 90 and r > g + 30:
        return True
    if r > 180 and g > 150 and b < 120:
        return True
    if b > 100 and b > r + 20:
        return True
    if g > 100 and g > r + 20 and g > b + 20:
        return True
    if r > 150 and g < 110 and b < 110 and r > g + 40:
        return True
    return False


def classify(im: Image.Image) -> str:
    px = im.load()
    w, h = im.size
    orange = blue = yellow = red = green = 0
    for y in range(0, h, 6):
        for x in range(0, w, 6):
            r, g, b, a = px[x, y]
            if a < 8 or is_bg_color(r, g, b, a):
                continue
            if r > 150 and g < 110 and b < 110 and r > g + 40:
                red += 1
            elif r > 140 and g < 130 and b < 90 and r > g + 30:
                orange += 1
            elif g > 100 and g > r + 20 and g > b + 20:
                green += 1
            elif b > 100 and b > r + 20:
                blue += 1
            elif r > 180 and g > 150 and b < 120:
                yellow += 1
    # フットサル: 赤・緑・青が揃う
    if red > 15 and green > 15 and blue > 15:
        return "futsal"
    if orange > blue and orange > yellow:
        return "basketball"
    if blue > 30 or yellow > 30:
        return "volleyball"
    return "soccer"


def flood_clear_bg(im: Image.Image) -> None:
    """四辺から背景色を洪水で透明化（黒縫い目は円内なので残る）"""
    px = im.load()
    w, h = im.size
    q: deque[tuple[int, int]] = deque()
    seen = [[False] * w for _ in range(h)]

    def try_push(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= w or y >= h or seen[y][x]:
            return
        r, g, b, a = px[x, y]
        if not is_bg_color(r, g, b, a) and not (r < 30 and g < 30 and b < 30 and a > 200):
            # 黒は「円の外の黒背景」だけ消したい。辺から繋がる黒のみ。
            if r < 30 and g < 30 and b < 30 and a > 200:
                pass  # allow flood through solid black background
            else:
                return
        if not is_bg_color(r, g, b, a) and not (r < 35 and g < 35 and b < 35):
            return
        seen[y][x] = True
        q.append((x, y))

    for x in range(w):
        try_push(x, 0)
        try_push(x, h - 1)
    for y in range(h):
        try_push(0, y)
        try_push(w - 1, y)

    while q:
        x, y = q.popleft()
        px[x, y] = (0, 0, 0, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if nx < 0 or ny < 0 or nx >= w or ny >= h or seen[ny][nx]:
                continue
            r, g, b, a = px[nx, ny]
            # 辺から繋がる背景灰・白・黒背景のみ
            if is_bg_color(r, g, b, a) or (r < 35 and g < 35 and b < 35 and a > 10):
                # 黒がボール内部の縫い目かどうか: 周囲にオレンジ/黄/青/白があれば縫い目→消さない
                if r < 35 and g < 35 and b < 35:
                    neighbor_color = False
                    for ox, oy in (
                        (nx + 1, ny),
                        (nx - 1, ny),
                        (nx, ny + 1),
                        (nx, ny - 1),
                        (nx + 2, ny),
                        (nx - 2, ny),
                        (nx, ny + 2),
                        (nx, ny - 2),
                    ):
                        if 0 <= ox < w and 0 <= oy < h:
                            rr, gg, bb, aa = px[ox, oy]
                            if is_ball_color(rr, gg, bb, aa):
                                neighbor_color = True
                                break
                    if neighbor_color:
                        continue
                seen[ny][nx] = True
                q.append((nx, ny))


def process(src: Path) -> tuple[Image.Image, str]:
    im = Image.open(src).convert("RGBA")
    sport = classify(im)
    px = im.load()
    w, h = im.size

    anchors: list[tuple[int, int]] = []
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r, g, b, a = px[x, y]
            if is_anchor(r, g, b, a):
                anchors.append((x, y))
    if not anchors:
        for y in range(0, h, 3):
            for x in range(0, w, 3):
                r, g, b, a = px[x, y]
                if a > 8 and not is_bg_color(r, g, b, a) and not (
                    r < 35 and g < 35 and b < 35
                ):
                    anchors.append((x, y))

    cx = sum(p[0] for p in anchors) / len(anchors)
    cy = sum(p[1] for p in anchors) / len(anchors)
    r_max = max(math.hypot(x - cx, y - cy) for x, y in anchors)
    r_keep = r_max * 1.06 + 3

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for y in range(h):
        for x in range(w):
            if math.hypot(x - cx, y - cy) > r_keep:
                continue
            r, g, b, a = px[x, y]
            opx[x, y] = (r, g, b, a)

    flood_clear_bg(out)

    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    side = max(out.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - out.size[0]) // 2, (side - out.size[1]) // 2), out)
    canvas = canvas.resize((OUT_SIZE, OUT_SIZE), Image.Resampling.LANCZOS)
    return canvas, sport


def main() -> None:
    sources = list(RAW.glob("Gemini_Generated_Image_*.png")) if RAW.exists() else []
    sources += list(BALLS.glob("Gemini_Generated_Image_*.png"))
    sources = sorted(set(sources))
    if not sources:
        print("No source PNGs in public/balls/raw")
        return

    RAW.mkdir(exist_ok=True)
    for src in sources:
        img, sport = process(src)
        dest = BALLS / f"{sport}.png"
        img.save(dest, "PNG", optimize=True)
        # 四隅アルファ確認
        px = img.load()
        s = img.size[0]
        corners = [px[0, 0][3], px[s - 1, 0][3], px[0, s - 1][3], px[s - 1, s - 1][3]]
        print(f"{src.name} -> {dest.name} corners_a={corners} bytes={dest.stat().st_size}")


if __name__ == "__main__":
    main()
