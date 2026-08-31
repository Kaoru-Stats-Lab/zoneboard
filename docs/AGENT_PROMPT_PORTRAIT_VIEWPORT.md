# 実装プロンプト — 縦ピッチの画角プリセット（B-072 追補）

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

**前提:** 縦ピッチ描画（`pitchOrientation` · `drawPitch*` · `aspectFor`）と Pitch View UI は **実装済み**。いま直すのは **局面タブの画角（カメラ）プリセット** が横前提のままな点。

仕様: [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) 決定ログ「縦ピッチの画角プリセット（2026-08-31）」· [`VERTICAL_PITCH.md`](VERTICAL_PITCH.md) §3（座標）· §5（左右ピラーは仕様）。矛盾したら PRODUCT_NOTE を勝ちにする。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

あなたは ZoneBoard（`c:\asl_dev\zoneboard`）の実装エージェントです。

---

## 0. 先に読め

1. [`docs/PRODUCT_NOTE.md`](PRODUCT_NOTE.md) — 縦ピッチの画角プリセット（2026-08-31）
2. [`docs/VERTICAL_PITCH.md`](VERTICAL_PITCH.md) §3 · §5 · §6
3. [`docs/VIEWPORT_RESEARCH.md`](VIEWPORT_RESEARCH.md) — CK 矩形のピン方針（横）。縦では **top/bottom ピン**に読み替える
4. [`docs/UI_UX.md`](UI_UX.md) §4-5 — 画角アイコンは横ピッチ＋ファインダー。**縦ボードは例外**を足す
5. コード:
   - `src/presets/viewport.ts` — `VIEW_PRESETS` · `viewPresetsForSport` · `viewportCoveringRect`
   - `src/components/ViewportPresetGrid.tsx` — **横向きサムネ固定**（要修正）
   - `src/hooks/useAppState.ts` — `applyViewPreset` · `setViewport`
   - `src/canvas/layout.ts` — `fitField`（**基本は触らない**。contain で左右ピラーは正しい）
   - `src/canvas/drawBoard.ts` — `worldToPitch` / `pitchToWorld`（縦は **y＝長さ · x＝幅**）
   - `src/components/PitchLookPicker.tsx` — `SoccerPortraitBody`（サムネ再利用）
   - `src/presets/pitchLook.ts` — 向き変更時 `viewport: DEFAULT_VIEWPORT`（維持）
   - `src/models/scene.ts` — `swapViewportEnds`（縦でのエンドチェンジは要確認 · 壊れていたら最小修正）

触らない: Pitch View 5 アイコン · ツールモード · LP · B-070 · 横ボードの既存プリセット数値（回帰ゼロ）。

---

## 1. 問題（スクショ再現）

縦フルピッチ選択時:

1. キャンバス中央に縦ピッチは出るが、**左右のランオフ緑**が広い → **仕様どおり**（16:9 窓の contain）。バグ扱いしない
2. 局面タブ「画角（ズーム）」のサムネが **すべて横向き** → ユーザが「今の画角」と対応づけられない
3. 「FT左」「CK左下」等を押すと、**縦世界では x/y の意味が違う**ため、意図しない場所にズームする

---

## 2. 座標契約（必須 · 捏造禁止）

| 向き | 正規化 x | 正規化 y |
|------|----------|----------|
| **横（landscape）** | ゴール↔ゴール（長さ） | タッチライン（幅） |
| **縦（portrait）** | タッチライン（幅） | ゴール↔ゴール（長さ） |

根拠: `drawBoard.ts` サッカー `worldToPitch`（縦は `visY` でハーフ · 横は `visX`）。

`VIEW_PRESETS` の `cx/cy` は **横世界で書かれた値**。縦にそのまま適用すると **90° ずれる**。

---

## 3. ゴール（受け入れ）

### 3-1. プリセット解決（必須）

- `applyViewPreset(id)` は **board の `pitchOrientation`** を見て解決する
- **横サッカー / 他競技 / バスケ:** 現行 `VIEW_PRESETS[id]` **そのまま**（回帰ゼロ）
- **縦サッカー:** 縦用 viewport を返す（下表または同等の明示マッピング）

推奨 API（例）:

```ts
export function resolveViewPreset(
  sport: SportId,
  orientation: PitchOrientation,
  id: ViewPresetId,
): Viewport;
```

`viewportMatchesPreset` も同じ解決経由にする。

### 3-2. 縦サッカーのプリセット語彙（必須）

横の **空間意味** を縦に回す。id は横と **同じ ViewPresetId を流用**してよいが、**解決結果の cx/cy が縦世界で正しいこと**。

| 横の意味（現行） | 縦での意味（画面） | 実装メモ |
|------------------|-------------------|----------|
| `full` | 全体 | `{ zoom:1, cx:0.5, cy:0.5 }` |
| `final-third-left` | **上ゴール側**の三方（y 小） | 横の cx フォーカス → 縦の **cy** |
| `final-third-right` | **下ゴール側**の三方（y 大） | 同上 |
| `pen-left` / `pen-right` | **上ペナ** / **下ペナ** | cx↔cy の読み替え |
| `throw-top` / `throw-bottom` | **左タッチ** / **右タッチ** のスローイン寄り | 横の cy フォーカス → 縦の **cx** |
| `corner-tl` 等 | 縦の **四隅**（ゴール×タッチ） | `viewportCoveringRect` を **縦座標**で再定義。ピンは `top/bottom` + `left/right` |

CK 系は [`VIEWPORT_RESEARCH.md`](VIEWPORT_RESEARCH.md) の「ゴール裏ピン」「規定余白のみ」を **top/bottom ゴール**に適用。

**ラベル（i18n）:** 縦のときだけ `viewFtTop` / `viewFtBottom` 等の **別キー**を出してよい。`if (locale===)` レイアウト分岐は禁止 · 文言だけ差し替え。

### 3-3. ViewportPresetGrid（必須）

- `sport === "soccer"` かつ `pitchOrientation === "portrait"`:
  - サムネ: `SoccerPortraitBody` · viewBox **46×72**（`PitchLookPicker` と同系）
  - ファインダー矩形: 縦 inner（例: `{ x:2.5, y:2.5, w:41, h:67 }`）
  - `finderOnInner(resolveViewPreset(...), inner)` で枠を描く
- それ以外: **現行の横向きサムネのまま**

`viewPresetsForSport` を縦用に分岐するか、Grid 側で orientation を渡す。

### 3-4. 触らないもの

| 項目 | 理由 |
|------|------|
| `fitField` の contain | 縦は左右ピラーが正しい（VERTICAL_PITCH §5） |
| 横ボードのプリセット数値 | 回帰 |
| 試合タブ Pitch View | 別コントロール（ワールド切り替え） |
| `hideHalf` left/right ラベル | Later（縦では y 軸で隠すべき · 別チケット） |

### 3-5. 向き切替

`resetAllScenesForOrientationChange` は既に `DEFAULT_VIEWPORT`。**変更不要**（横の viewport を縦に持ち込まない）。

---

## 4. 実装ステップ（推奨順）

1. `viewport.ts` に `resolveViewPreset` + 縦サッカー用マップ（単体で cx/cy が期待どおりかコメント付き表）
2. `useAppState.applyViewPreset` / `viewportMatchesPreset` を解決関数経由に
3. `ViewportPresetGrid` に `pitchOrientation` prop（または board から取得）· 縦サムネ分岐
4. `messages.ts` — 縦用 Short ラベル（必要分のみ · ja/en 両方）
5. `scripts/` に軽いチェック（例: `portrait-viewport-check.ts`）— 縦で `final-third-left` が cy≈0.17 側になる等
6. `npx tsc --noEmit` · `npm run test:i18n-chrome`

---

## 5. やってはいけない

- 横 `VIEW_PRESETS` の数値を書き換えて縦も直す（横回帰）
- キャンバス CSS `rotate(90deg)` でごまかす
- 縦ボードで画角プリセットを非表示にして逃げる（最小は「全体＋主要 CK」でも可だが **サムネは縦**）
- 16:9 配信 contain の変更
- docs 大量追加 · 勝手 commit / push

---

## 6. 検証チェックリスト

- [ ] **横フル**ボード: 画角サムネ横向き · FT左が **左ゴール側**（回帰）
- [ ] **縦フル**ボード: サムネ縦向き · 「全体」でフル縦ピッチ
- [ ] 縦: FT左（または縦ラベル）が **上ゴール側**にズーム
- [ ] 縦: CK左下が **下×左コーナー**付近
- [ ] 縦: プリセット押下後、アクティブ枠とキャンバスが一致
- [ ] 横↔縦 Pitch View 切替後 viewport は **DEFAULT**（持ち込みなし）
- [ ] 配信モード 16:9 · 縦ピッチ左右マット（回帰）
- [ ] `tsc` · `test:i18n-chrome`

---

## 7. 完了報告（日本語）

- 横/縦の座標対応表（プリセット id ごと）
- `resolveViewPreset` の置き場所
- 縦サムネの viewBox / inner 矩形
- 追加 i18n キー一覧
- 触ったファイル
- チェックリスト結果
- Later: hideHalf 縦 · Export 画角 · 編集窓フィットズーム
