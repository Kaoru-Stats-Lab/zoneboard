# 実装プロンプト — 局面取込 W03: 手動4点キャリブ UI（B-070 · Phase 1）

**索引:** [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md) · **Wave 3/5**  
**前提:** W01–W02 merge 済み · **`isCaptureImportEnabled()` ゲートあり**（false ならオーバーレイ出さない）。

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

**いまやるのは:** 画像上の **4点ドラッグ** → Homography 計算 → セッションに `homography` 保存。**下敷き合成 · 駒配置は W04–05。**

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

## 0. 先に読め

1. 索引 + G1–G15 · [`BROADCAST_CAPTURE_IMPORT_RESEARCH.md`](BROADCAST_CAPTURE_IMPORT_RESEARCH.md) §2e（ゴチャつき全画面 · 手動 ROI）
2. W01 `homography.ts` · W02 セッション型
3. `.cursor/rules/i18n-ui-guardrails.mdc`
4. `src/components/BoardCanvas.tsx` — オーバーレイ追加の参考（全面改変しない）

---

## 1. ゴール

### 1-1. フロー

```text
phase "image"
  → 「4点を合わせる」で phase "calib"
  → 4ハンドルドラッグ（TL/TR/BR/BL）
  → 「適用」で homography 計算成功 → phase "place"（W04 が下敷き）
  → 失敗 → インラインエラー · 確定不可
```

### 1-2. UI

- **フルスクリーンオーバーレイ**（`position: fixed` · z-index 配信 UI より上 · 編集モードのみ）
- 下に貼付画像 · 上に **4 ハンドル**（色付き円 · ドラッグ）
- **任意 ROI（Phase 1 簡易）:** 4点の前に **矩形クロップ 1 段** を入れてよい（全画面スクショ対策）。自動クロップは **禁止**
- 操作:
  - ハンドルドラッグ（pointer capture）
  - **リセット** — 初期位置 = 画像の 10% インセット四角
  - **適用** / **戻る** / **取消**（W02 の clear）
- 初期配置ヒント（`title` のみ）: 「ピッチ四隅に近い点を置く（ペナ角 · タッチライン交点）」

**ドロワー 300px に 4点 UI を押し込むな** — オーバーレイ専用。

### 1-3. Homography 計算

- W01 `computeHomography(src4, dst4)` を使用
- **Web Worker 推奨** — `src/capture/homographyWorker.ts`  
  - 入力: src4 · 画像サイズ  
  - 出力: H or error  
- Worker 未使用の場合も **同期計算は 1 フレーム以内**（プロキシ 1280px 以下に downscale してから src4 を scale）

### 1-4. セッション更新

成功時:

```ts
session.homography = H;
session.phase = "place";
// src4 もセッションに保持（微調整再入用）
```

---

## 2. i18n

- `captureCalibTitle`
- `captureCalibApply` / `captureCalibApplyShort`
- `captureCalibReset` / `captureCalibResetShort`
- `captureCalibBack`
- `captureCalibFail`
- `captureCalibHint`（title 用）

Short キーはオーバーレイのボタン用（~12 文字 / ~6 CJK）。`npm run test:i18n-chrome`

---

## 3. やってはいけない

- ピッチ線自動検出 · ML · OpenCV
- 下敷きを drawBoard に載せる（W04）
- 駒クリック配置（W05）
- 動画フレーム
- サイト DOM 解析クロップ
- 4:3 アンストレッチ（Later）

---

## 4. ガードレール（Cursor Auto）

1. **自動4点当てを「フォールバック」で入れるな** — 失敗はユーザが点を直す
2. **BoardCanvas の pointer 処理を 200 行書き換えるな** — `CaptureCalibOverlay.tsx` 分離
3. **4点 UI を Drawer 内 row に並べるな** — フルスクリーン
4. **Homography を Editor.tsx に直書きするな** — W01 import
5. **計算中に UI スレッドを 3 秒ブロックするな** — Worker or downscale
6. **「適用」で scene.pieces を更新するな** — homography 保存のみ

---

## 5. 検証

- [ ] 貼付 → 4点 → 適用 → `homography` non-null · `phase === "place"`
- [ ] 共線配置 → エラー · pieces 不変
- [ ] 取消 → URL revoke
- [ ] 配信モードでオーバーレイ出ない
- [ ] `tsc` · `test:i18n-chrome`
- [ ] （任意）台形画像で四隅 norm が 0/1 付近 — devtools log

---

## 6. 完了報告

- オーバーレイコンポーネント名
- Worker の有無とメッセージ形式
- W04 へ渡す `homography` + 画像 ref の取り方
