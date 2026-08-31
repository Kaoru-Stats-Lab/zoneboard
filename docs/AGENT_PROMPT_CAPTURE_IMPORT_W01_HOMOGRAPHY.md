# 実装プロンプト — 局面取込 W01: Homography コア（B-070 · Phase 1）

**索引:** [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md) · **Wave 1/5**  
このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

**いまやるのは:** 4点対応 Homography の **純関数 + 単体テストのみ**。UI · 貼付 · drawBoard は **触らない**。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

## 0. 先に読め

1. [`docs/PRODUCT_NOTE.md`](PRODUCT_NOTE.md) — 局面取込決定ログ（キャリブ · 105×68）
2. 索引 [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md) — グローバル・ガードレール G1–G15
3. `src/presets/soccerPitch.ts` — `SOCCER_NORM` / FIFA 寸法
4. `src/canvas/drawBoard.ts` — `worldToPitch` / `pitchToWorld`（座標の意味だけ理解。変更しない）

---

## 1. ゴール

| 関数（名前は調整可） | 入出力 |
|---------------------|--------|
| `computeHomography(src4, dst4)` | 画像上4点 `[x,y][]` → 3×3 `number[]`（行優先 or 列優先は **1 つに固定して export**） |
| `transformPoint(H, x, y)` | ピクセル → **pitch 正規化** `{ px: 0–1, py: 0–1 }` |
| `invertHomography(H)` | 逆変換用（W05 クリック配置で使う） |
| `pitchNormToWorld(px, py, board?)` | **W01 では board 不要。** `{ x: px, y: py }` を返す薄ラッパで可（横フル soccer では world=pitch norm） |

**dst4 の正本（横フル · ゴール左=0 · タッチ上=0）:**

| 点 | pitch norm (px, py) | 意味 |
|----|---------------------|------|
| TL | (0, 0) | 左ゴールライン × 上タッチ |
| TR | (1, 0) | 右ゴールライン × 上タッチ |
| BR | (1, 1) | 右 × 下タッチ |
| BL | (0, 1) | 左 × 下タッチ |

**src4 の順序は dst4 と同じ対応**（ユーザが UI で並べ替え可能にする前提で、関数は「点の対応が一致している」入力だけ受ける）。

---

## 2. 実装メモ

- 新規: `src/capture/homography.ts`（または `src/lib/homography.ts` — **`src/capture/` 推奨**で W02 以降と同居）
- 新規: `scripts/homography-check.ts` または `src/capture/homography.test.ts`（既存テスト慣習に合わせる）
- アルゴリズム: DLT 4点で可。**OpenCV · wasm · npm 新規 deps 禁止**
- 数値安定: 退化配置（4点共線など）は `null` / `Result` で失敗返却。throw 乱発しない
- プロキシ解像度は **W01 では不要**（ピクセル座標 in = out）

### テスト最低限

1. **恒等に近い** — 正方形 src → 正方形 dst で四隅が 0/1 に収束（誤差 < 1e-4）
2. **既知の射影** — 台形 src → 矩形 dst で中心点が期待 norm 付近
3. **逆変換** — `transformPoint(H)` → `transformPoint(Hinv)` が src に戻る
4. **退化** — 一直線上4点 → 失敗

---

## 3. やってはいけない

- React コンポーネント · Canvas 描画 · クリップボード
- `drawBoard.ts` 変更
- Phase 2 自動駒 · RANSAC 自動4点
- `opencv-js` 等の追加
- docs 新規大量

---

## 4. ガードレール（Cursor Auto · この Wave）

1. **UI を「ついでに」作るな** — テスト通れば W01 完了
2. **worldToPitch を書き換えるな** — Homography は **取込専用レイヤ**
3. **3 ファイルに同じ行列計算をコピペするな** — 1 モジュール
4. **105×68 以外の dst を invent しない** — ジュニアコートは Later
5. **失敗時に適当な恒等行列を返すな** — 呼び出し側がフォールバック判断

---

## 5. 検証

```bash
npx tsc --noEmit
npx tsx scripts/homography-check.ts
# または npm test（追加した runner に合わせる）
```

---

## 6. 完了報告

- export した関数名 · 行列の並び convention  
- テストケース一覧  
- W02 が import するパス  
- やらなかったこと（UI · Worker · pitch half）
