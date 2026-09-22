# 実装プロンプト — 局面取込 W09: キャリブ UX 作り替え（B-070）

**仕様正本:** [`CAPTURE_IMPORT_CALIB_UX_SPEC.md`](CAPTURE_IMPORT_CALIB_UX_SPEC.md)（必読・勝ち）  
**索引:** [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md)  
**境界:** [`AGENT_PROMPT_PRODUCT_BOUNDARY.md`](AGENT_PROMPT_PRODUCT_BOUNDARY.md)  

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

## 0. 境界ゲート（チャットに4行）

1. Idea→Explanation？ → Yes（取込の学習摩擦削減）  
2. Game→Analysis？ → No  
3. Workstation 化？ → 手動4点のまま · 自動検出なし  
4. 帯 → P0 Core 欠陥修正（キャリブ UX）

---

## 1. 背景（実装済みとの関係）

- **W08** で `pitchLandmarks.ts` · dst 可変 Homography · 旧 UI（Full/Left/Right · ハンドル下28セレクト · 四隅インセット）が入った。  
- セカンドオピニオン合議の結果、**UI/コピー/フローを本仕様に作り替える**（エンジンの FIFA dst は再利用）。  
- 旧ユーザー向け文言 `Left goal` / `Pen L near B` / ヤード数値 Short / 画像四隅初期は **廃止**。

---

## 2. 先に読め

1. [`CAPTURE_IMPORT_CALIB_UX_SPEC.md`](CAPTURE_IMPORT_CALIB_UX_SPEC.md) **全文**  
2. `src/capture/pitchLandmarks.ts`  
3. `src/components/CaptureCalibOverlay.tsx` · `src/styles.css`（capture-calib-*）  
4. `src/hooks/useAppState.ts`（calib 適用）  
5. `src/i18n/messages.ts`（captureCalib* · captureLm*）  
6. `.cursor/rules/i18n-ui-guardrails.mdc` · `product-boundary.mdc`

触らない: W06 · Phase 2 自動駒 · Homography 数式の書き直し · LP · changelog · 縦ピッチ。

---

## 3. 実装タスク

### 3.1 データ（`pitchLandmarks.ts`）

- 内部 `LandmarkId` / `landmarkNorm` は維持してよい。  
- UI プリセットを差し替え:

```ts
type CalibLandmarkPreset = "full" | "penalty" | "goal" | "mixed";
type CalibGoalSide = "x0" | "x1"; // Canonical 左ゴール / 右ゴール
```

- 各プリセット × `CalibGoalSide` → `LandmarkQuad`（おすすめ4 id）を表で定義。  
  - `full` は goal side 無視で四隅。  
  - `penalty` / `goal` / `mixed` は side に応じて `*_l_*` ↔ `*_r_*` を選ぶ。  
- 旧 `PRESET_LEFT_GOAL` / `right` / ユーザー向け Left/Right は削除または非公開エイリアス。  
- `landmark-check.ts` を新プリセットの非退化・鏡映（x0↔x1）で更新。

### 3.2 セッション / state

- `calibGoalSide` · `calibPreset` を session に追加。  
- `setCaptureCalibPreset` · ゴール選択 API · おすすめ4点適用で `calibLandmarkIds` + **初期 src**（四隅インセット禁止）。  
- 初期 src: 画像中央付近に①–④を少しずらして置く、またはゴール側半面に軽くオフセット（**線スナップ禁止**）。

### 3.3 UI（`CaptureCalibOverlay` 中心）

仕様 §2.2 フローを実装:

1. 入口コピー: 「ピッチを取り込む」（キャリブを前面に出さない）  
2. **ミニ俯瞰**（簡易 SVG/Canvas でゴール2つ）→ クリックで `calibGoalSide`  
   - Full pitch のみ先に選ぶ場合はスキップ可  
3. プリセット4: 全体に近い / ペナ付近 / ゴール付近 / おまかせ  
4. 画像上 **番号①–④のみ**（ハンドル下 `<select>` 28項は削除）  
5. **下部リスト**で①–④の意味表示・変更（おすすめ＋その他）  
6. ヒント: 「線の交点にドラッグして合わせてください」（自動検出ではない）  
7. 適用 / リセット / 戻る / 取消  

i18n: 全9ロケール。Short にヤード／メートル数値・`near/far`・`Pen L` 型を出さない。仕様の意味役割表に従う。`npm run test:i18n-chrome`。

### 3.4 スタイル

- ハンドル下セレクト用 CSS を整理。下部リスト用のドロワー内スタック（overflow 注意 · i18n ガードレール）。  
- ミニ俯瞰はタッチで選べるサイズ。

---

## 4. ガードレール

| # | 禁止 | 正しい行動 |
|---|------|------------|
| 1 | 交点自動検出・吸着 | ドラッグのみ |
| 2 | UI に Left/Right Goal（画面・攻撃） | ミニ俯瞰のゴール選択 |
| 3 | Short に 18yd / 6yd / m | ペナ／ゴールエリア＋相対位置 |
| 4 | 四隅インセット初期 | 中央寄りの①–④ |
| 5 | Homography 全面書き直し | dst / UI のみ |
| 6 | changelog / 勝手 commit | 報告のみ |
| 7 | 28項を初手に出す | おすすめ＋その他 |

---

## 5. 検証

```bash
npx tsc --noEmit
npm run test:i18n-chrome
npx tsx scripts/landmark-check.ts
npx tsx scripts/homography-check.ts
```

手動（DEV or `?captureImport=1`）:

1. 片側ペナ実写 → 俯瞰でゴール選択 → ペナ付近/おまかせ → ①–④を交点へ → 適用 → 下敷き一致  
2. 俯瞰フル → 全体に近い → 四隅 → 回帰  
3. UI 文言に旧略語・ヤード数値がないこと  

---

## 6. 完了報告

- プリセット×goalSide→4 id の表  
- 触ったファイル  
- 旧 Left/Right UI の削除箇所  
- チェックリスト結果  
- やらなかったこと（自動検出 · 攻撃方向 · ドローン専用）

---

## 7. コピペ用 — 別 Agent への渡し文

```text
docs/AGENT_PROMPT_CAPTURE_IMPORT_W09_CALIB_UX.md と
docs/CAPTURE_IMPORT_CALIB_UX_SPEC.md を正本に実装して。

キャリブ UX を作り替える（W08 の dst エンジンは再利用）:
- 四隅インセット廃止、中央「ピッチを取り込む」→ ミニ俯瞰でゴール選択
- プリセットは全体/ペナ/ゴール/おまかせ（Left/Right 画面意味は廃止）
- ①–④＋下部リスト。ハンドル下28セレクト廃止
- ラベルは競技用語のみ（near/far・ヤード数値・Pen L 略語を表に出さない）
- 自動検出禁止。コミットしない。日本語で報告。
```
