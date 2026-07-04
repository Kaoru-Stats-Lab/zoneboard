# ボール・アイコン デザイン言語（競技横展開）

**更新:** 2026-07-04  
**正本アセット:** `public/balls/soccer_ball2.svg`  
**用途:** 戦術ボード上のボールマーカー。Nanobanana 等で生成 → SVG 化するときの仕様書。

---

## 1. `soccer_ball2.svg` から抽出したデザイン言語

| 項目 | 仕様 |
|------|------|
| **形** | 外接円にぴったり内接（余白ほぼゼロ） |
| **構造** | **下地の塗り円** ＋ **上にパネル／縫い目の path** |
| **トーン** | フラット。グラデ・影・ハイライト・3D **禁止** |
| **線** | 縫い目は単色・均一ストローク。手描きゆらぎなし |
| **コントラスト** | 高コントラスト（配信・縮小表示でも読める） |
| **サッカー固有** | 下地 **黒 `#000000`**、パネル **白 `#ffffff`**（Telstar 型の五角・六角） |
| **viewBox** | 正方形（例: `0 0 194 194`）。中心にボール |
| **複雑さ** | path は少なくてよい（1〜数個）。ピクトグラム水準 |

**言語化（一文）:**  
「真円に内接するフラットなピクトグラム。黒地に白パネルでクラシックなサッカーボール。影なし・線は均一。」

---

## 2. 競技別カラー（世界基準）

| 競技 | 色 | 根拠 |
|------|-----|------|
| **サッカー** | 黒地＋白パネル | 国際試合の定番アイコン（Telstar 系） |
| **バレーボール** | **ミカサ配色**（黄・青・白）＋黒アウトライン | 国際大会の事実上の標準球ブランド。ユーザ指定どおり |
| **バスケットボール** | **オレンジ／茶色**（例 `#C65102`）＋黒縫い目 | NBA / FIBA とも試合球の色展開は実質この系統のみ |
| **ラグビー** | **黒本体**＋白の端ストライプ＋白レース | ピクトグラム定番（高コントラスト）。試合球の白革とは別で、UI アイコンとしては黒地が読みやすい |
| **フットサル** | **白地**＋赤・緑・青のベタ星形パネル | 屋内視認性の高い派手球（Trionda 系）をフラット化。リアル禁止 |

色展開（チームカラーのボール差し替え）は **やらない**。競技ごとに **世界で通じる1種**。

---

## 3. Nanobanana 用プロンプト

**重要:** 線画のみ（中が透明）は禁止。SVG 化で背景が透ける。  
必ず **不透明な塗り**（サッカーなら白パネル＋黒五角形）を入れる。

### 共通前置き（全ボール）

```
Flat vector pictogram icon, no gradients, no shadows, no 3D, no highlights, no photorealism.
Clean uniform stroke weight, high contrast, suitable as a tiny UI marker on a tactics board.
Square composition, centered. The ball fills the frame with almost no padding.

CRITICAL FILLS (not outline-only):
- The ball body must be OPAQUE solid fills, never transparent panels.
- Outside the ball: fully transparent background (no gray checkerboard, no white rectangle).
- Do NOT output line-art only. Every panel region must be filled with a solid color.
```

### 3-1. Soccer

```
Flat vector pictogram icon, no gradients, no shadows, no 3D, no highlights, no photorealism.
Clean uniform stroke weight, high contrast, suitable as a tiny UI marker on a tactics board.
Square composition, centered. The ball fills the frame with almost no padding.

CRITICAL FILLS (not outline-only):
- The ball body must be OPAQUE solid fills, never transparent panels.
- Outside the ball: fully transparent background (no gray checkerboard, no white rectangle).
- Do NOT output line-art only. Every panel region must be filled with a solid color.

Soccer ball (classic Telstar):
- Outer circle filled with solid WHITE (#FFFFFF) for all hexagon panels.
- Pentagon panels filled with solid BLACK (#000000).
- Black outlines between panels.
- Not a hollow outline icon. White and black must both be painted fills.
```

### 3-2. Volleyball（Mikasa）

```
Flat vector pictogram icon, no gradients, no shadows, no 3D, no highlights, no photorealism.
Clean uniform stroke weight, high contrast, suitable as a tiny UI marker on a tactics board.
Square composition, centered. The ball fills the frame with almost no padding.

CRITICAL FILLS (not outline-only):
- The ball body must be OPAQUE solid fills, never transparent panels.
- Outside the ball: fully transparent background (no gray checkerboard, no white rectangle).
- Do NOT output line-art only. Every panel region must be filled with a solid color.

Volleyball (Mikasa match-ball colors, no brand logo):
- Curved panels filled solid yellow (#F5D000), solid blue (#0057B8), and solid white (#FFFFFF).
- Thin black outlines between panels.
- Classic three-panel curved seams. Every panel is opaque paint, not empty.
```

### 3-3. Basketball

```
Flat vector pictogram icon, no gradients, no shadows, no 3D, no highlights, no photorealism.
Clean uniform stroke weight, high contrast, suitable as a tiny UI marker on a tactics board.
Square composition, centered. The ball fills the frame with almost no padding.

CRITICAL FILLS (not outline-only):
- The ball body must be OPAQUE solid fills, never transparent panels.
- Outside the ball: fully transparent background (no gray checkerboard, no white rectangle).
- Do NOT output line-art only. Every panel region must be filled with a solid color.

Basketball:
- Entire ball filled solid orange-brown (#C65102).
- Black curved seam lines (standard four-line pattern) on top of the orange fill.
- Not outline-only; the orange fill is mandatory.
```

### 3-4. Futsal（白＋赤緑青ベタ）

リアル写真・トポグラフィ線・金縁は **禁止**。既存サッカー／バレーと同じピクトグラム言語。

```
Flat vector pictogram icon, no gradients, no shadows, no 3D, no highlights, no photorealism, no leather texture, no stitching detail, no topographic lines, no gold outlines.
Clean uniform stroke weight, high contrast, suitable as a tiny UI marker on a tactics board.
Square composition, centered. The ball fills the frame with almost no padding.

CRITICAL FILLS (not outline-only):
- The ball body must be OPAQUE solid fills, never transparent panels.
- Outside the ball: fully transparent background (no gray checkerboard, no white rectangle).
- Do NOT output line-art only. Every panel region must be filled with a solid color.

Futsal ball (high-visibility indoor style, simplified Trionda-like stars, icon only):
- Outer circle filled solid WHITE (#FFFFFF) as the base.
- Three large simple star-shaped (or rounded star) panels in solid RED (#E53935), solid GREEN (#43A047), and solid BLUE (#1E88E5) only — flat color blocks, no internal patterns.
- Thin black outlines between panels and around the circle.
- No logos, no text, no brand marks.
- Same flat pictogram language as a soccer Telstar icon, not a product photo.
```

### 3-5. Rugby（黒本体＋白ディテール）

参考: フラットな黒シルエット、両端の白い帯、中央の白いレース。

```
Flat vector pictogram icon, no gradients, no shadows, no 3D, no highlights, no photorealism.
Clean uniform stroke weight, high contrast, suitable as a tiny UI marker on a tactics board.
Square composition, centered. The ball fills the frame with almost no padding.

CRITICAL FILLS (not outline-only):
- The ball body must be OPAQUE solid fills, never transparent panels.
- Outside the ball: fully transparent background (no gray checkerboard, no white rectangle).
- Do NOT output line-art only. Every region must be filled with a solid color.

Rugby ball (icon style, black body with white details):
- Prolate oval (lemon / American-football shape) tilted about 30–45 degrees.
- Entire body filled solid BLACK (#000000).
- Two thick WHITE curved stripes near each pointed end (opaque white paint on the black body).
- Center laces in WHITE: one long stitch line along the ball, crossed by about five short perpendicular stitches.
- High contrast black-and-white only. Not outline-only; black fill and white fill are both mandatory.
```

---

## 4. SVG 化チェックリスト

生成画像を SVG にするとき:

1. **正方形 viewBox**（ラグビーも外接正方形に収める）
2. 背景は透明（白矩形を残さない）
3. 色は上記パレットに寄せてポスタライズ
4. path 数を減らし、フラット塗りのみ
5. ファイル名:
   - `soccer_ball2.svg`（採用済）
   - `volleyball.svg`
   - `basketball.svg`
   - `rugby.svg`
   - `futsal.svg`
6. `public/balls/` に格納し、`ATTRIBUTION.md` を更新

---

## 5. アプリ側の接続

| ファイル | 役割 |
|----------|------|
| `soccer_ball2.svg` | サッカー（正本） |
| `volleyball.svg` | バレー（ミカサ色）※未配置なら幾何フォールバック |
| `basketball.svg` | バスケ（茶）※同上 |
| `rugby.svg` | ラグビー ※競技追加時 |

コードは `src/assets/ballImages.ts` で読み込み、未ロード時は幾何描画にフォールバック。

---

## 6. やらないこと

- チームカラー別ボール
- リアル写真風・3D・光沢
- ブランドロゴの無断トレース（ミカサは**配色のみ**踏襲、ロゴマークは入れない）
