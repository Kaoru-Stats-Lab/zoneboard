# Ball assets

デザイン言語: [`docs/BALL_DESIGN.md`](../../docs/BALL_DESIGN.md)

| ファイル | 競技 | 形式 | 備考 |
|----------|------|------|------|
| `soccer.png` | サッカー | PNG 256px | 背景除去済み（推奨） |
| `soccer_ball2.svg` | サッカー | SVG | 軽量フォールバック |
| `basketball.png` | バスケ | PNG 256px | 背景除去済み |
| `volleyball.png` | バレー | PNG 256px | ミカサ配色・背景除去済み |
| `futsal.png` | フットサル | PNG 256px | 白＋赤緑青ベタ・背景除去済み |

## なぜ PNG か

Gemini / Nanobanana 由来の SVG はチェッカー背景が **数千 path** にトレースされ、数百 KB〜数 MB になる。  
ボード上は **256px PNG（透過）** の方が軽く、見た目も安定する。

生ファイルは `raw/`（gitignore）。再処理: `python scripts/process_balls.py`

## 処理内容

- 白・チェッカーグレーを透明化
- 正方形にトリム／パディング
- 256×256 に縮小
