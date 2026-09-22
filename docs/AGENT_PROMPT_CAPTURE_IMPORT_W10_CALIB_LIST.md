# 実装プロンプト — 局面取込 W10: キャリブ一覧 · ラベル HCI（B-070）

**仕様正本:** [`CAPTURE_IMPORT_CALIB_UX_W10_SPEC.md`](CAPTURE_IMPORT_CALIB_UX_W10_SPEC.md)（**UI/コピー/リストで勝ち**）  
**前段:** [`CAPTURE_IMPORT_CALIB_UX_SPEC.md`](CAPTURE_IMPORT_CALIB_UX_SPEC.md)（W09 · フロー骨格）  
**境界:** [`AGENT_PROMPT_PRODUCT_BOUNDARY.md`](AGENT_PROMPT_PRODUCT_BOUNDARY.md)  
**索引:** [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md)

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

## 0. 境界ゲート（チャットに4行）

1. Idea→Explanation？ → **Yes**（取込の学習摩擦 · 認知負荷削減）  
2. Game→Analysis？ → **No**  
3. Workstation 化？ → **手動4点 · 自動検出なし**  
4. 帯 → **P0 Core 欠陥修正（キャリブ HCI）**

---

## 1. 背景（実装済みとの関係 · 重要）

### すでに終わっている（触らない / 壊さない）

| 層 | 状態 |
|----|------|
| W08 | `LandmarkId` · `landmarkNorm` · Homography Worker |
| W09 | `CalibLandmarkPreset` · `CalibGoalSide` · プリセット×side の4 id 表 · 中央十字初期 · `calibSrcMoved` · 入口「ピッチを取り込む」 · ハンドル直下28 select 削除 |

### スクショで残っている欠陥（今回の本丸）

本番スクショ（Penalty · EN）:

- 下部が **ネイティブ `<select>`** のまま → OS が巨大リストで画像を覆う  
- 表示が `Pen · field top` / `Pen · field bot` / `Pen. arc` → **内部座標語がユーザー面に露出**  
- ゴール俯瞰の title 等に **Left / Right** が残っている可能性  
- 認知がまだ **「座標IDを選ぶ」側** に寄っている  

**W09 をゼロから書き直すな。** リスト UI · ラベル · ミニ俯瞰コピーだけを W10 仕様に合わせる。

ChatGPT の長文要件は参考。**正本は W10 SPEC。** 重複する「Full/Penalty…」再実装は不要。

---

## 2. 先に読め

1. [`CAPTURE_IMPORT_CALIB_UX_W10_SPEC.md`](CAPTURE_IMPORT_CALIB_UX_W10_SPEC.md) **全文**  
2. `src/components/CaptureCalibOverlay.tsx`（下部リスト · MiniPitchGoalPicker）  
3. `src/i18n/messages.ts`（`captureLm*Short` · `captureCalibGoal*`）  
4. `src/capture/pitchLandmarks.ts`（id は読むだけ · 幾何変更は原則不要）  
5. `.cursor/rules/i18n-ui-guardrails.mdc`

触らない: Homography 数式 · W06 · Phase 2 · LP · changelog · 縦ピッチ · 攻撃方向 UI · 自動検出。

---

## 3. 実装タスク

### 3.1 ラベル一掃（全 locale）

- `captureLm*Short` / Full から禁止語を除去:  
  `field top` · `field bot` · `near` · `far` · `Pen L` · `GA L` · `線上/野上` が **画面上下の略**として読めるものは、ピッチ相対（ゴールライン側 / フィールド側）へ。  
- ベース名は SPEC §6（ペナルティエリア角 · Penalty-area corner 等）。  
- 同名 Short は許容。区別は 3.3。  
- `npm run test:i18n-chrome` PASS。

### 3.2 下部リスト: select 廃止

`CaptureCalibOverlay` の各行:

- **削除:** ランドマーク用 `<select>` / `<optgroup>`  
- **追加:**  
  - 常時可視の主ラベル（競技用語）  
  - `[変更]`（Short · title にフル）  
  - 変更パネル: おすすめ 6–8 を **ボタン／ラジオ行**で選択。`Show all` で残りを同パネル内に展開  
- キーボード: フォーカス可能 · Escape で閉じる · `aria-expanded`  
- パネルは画像を可能な限り遮らない（下部アンカー / 行隣 popover）。**ネイティブ option の全画面リストにしない。**

### 3.3 同名の区別

フォーカス中の ①–④ について、ミニ俯瞰上に **対応 Landmark のピン**を1点描画（`landmarkNorm` を俯瞰 viewBox に写像）。  
任意: 行の subtitle に `ゴールライン側` / `フィールド側` のみ（top/bot 禁止）。

### 3.4 ミニ俯瞰コピー

- 可視: 「映っているゴールを選ぶ」系のみ。  
- `captureCalibGoalX0` / `X1` から **左／右／Left／Right** を除去。図上の端として説明するか、aria は「diagram goal (near top of this icon)」等、**画面の左右プリセット語を使わない**。  
- ボタン上に L/R テキストを置かない（現状ヒット領域のみなら維持し、title だけ直す）。

### 3.5 Suggested の意味

- プリセット `mixed` の title/hint に「静的なおすすめ · 自動検出ではない」を短く（既存 hint と重複させすぎない）。  
- 幾何表は変更しない。

### 3.6 エラー · CTA

- 技術語エラーを次アクション型に寄せる（既存キー改稿で可）。  
- Apply Short「取込」維持可。改名は必須ではない。

### 3.7 CSS

- `.capture-calib-list-*` を select 前提から行＋パネルへ。  
- i18n: drawer と同じく overflow 横スクロールを出さない。  
- 画像ステージの面積を削りすぎない。

---

## 4. 受け入れ（報告にチェック）

- [ ] 下部にランドマーク用 `<select>` なし  
- [ ] EN/JA 等に `field top/bot` · `Pen ·` 座標略語なし  
- [ ] ミニ俯瞰可視文言に Left/Right / 左ゴール / 右ゴールなし  
- [ ] 同名2点でもピン（または subtitle）で区別可  
- [ ] Show all が OS 巨大 select になっていない  
- [ ] `calibSrcMoved` · プリセット幾何 · Homography 回帰  
- [ ] `tsc` · `test:i18n-chrome` · `landmark-check` PASS  
- [ ] 自動検出なし · コミットなし  

---

## 5. 報告フォーマット

```text
## 境界ゲート
1. … 2. … 3. … 4. …

## やったこと
- …

## 触ったファイル
- …

## ラベル方針（例 2–3）
- pen_l_far_t → …

## やらなかったこと
- Homography 書き直し / 自動検出 / コミット …

## チェック
- tsc / i18n-chrome / landmark-check — …
```

---

## 6. やらないこと（再掲）

AI · 線検出 · Tracking · 攻撃方向 · カメラモード · W09 プリセット表の全面作り直し · changelog · **コミット**
