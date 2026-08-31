# 実装プロンプト — 縦ピッチの画角プリセット（B-072 追補）

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

**前提:** 縦ピッチ描画（`pitchOrientation` · `drawPitch*` · `aspectFor`）と Pitch View UI は **実装済み**。局面タブの画角（カメラ）プリセットは **縦サッカー 5 種**に絞る。

仕様: [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) 決定ログ「縦ピッチの画角プリセット（2026-08-31）」· [`VERTICAL_PITCH.md`](VERTICAL_PITCH.md) §3（座標）· §5（左右ピラーは仕様）。矛盾したら PRODUCT_NOTE を勝ちにする。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

あなたは ZoneBoard（`c:\asl_dev\zoneboard`）の実装エージェントです。

---

## 0. 先に読め

1. [`docs/PRODUCT_NOTE.md`](PRODUCT_NOTE.md) — 縦ピッチの画角プリセット（2026-08-31）
2. [`docs/VERTICAL_PITCH.md`](VERTICAL_PITCH.md) §3 · §5 · §6
3. コード:
   - `src/presets/viewport.ts` — `PORTRAIT_SOCCER_VIEW_PRESETS` · `resolveViewPreset` · `viewPresetsForSport`
   - `src/components/ViewportPresetGrid.tsx` — 縦サムネ（46×72）
   - `src/hooks/useAppState.ts` — `applyViewPreset`

触らない: Pitch View 5 アイコン · ツールモード · LP · 横ボードの既存プリセット（13 種）· B-070。

---

## 1. 問題（解決済みの背景）

縦フルピッチ選択時、横用 `VIEW_PRESETS` をそのまま適用すると x/y が 90° ずれ、サムネも横向きのままだった。

さらに **CK・スローは縦では意味が薄い**（Story 向けはゴールエンド別ズームだけで足りる）。横のセットプレー語彙を回転マッピングして並べても、ユーザにとって冗長で認知負荷が高い。

---

## 2. 座標契約（必須）

| 向き | 正規化 x | 正規化 y |
|------|----------|----------|
| **横（landscape）** | ゴール↔ゴール（長さ） | タッチライン（幅） |
| **縦（portrait）** | タッチライン（幅） | ゴール↔ゴール（長さ） |

根拠: `drawBoard.ts` サッカー `worldToPitch`（縦は `visY` でハーフ · 横は `visX`）。

---

## 3. ゴール（受け入れ）

### 3-1. 縦サッカーで UI に出すプリセット（5 種のみ）

| id | ラベル（ja） | 縦での意味 |
|---|---|---|
| `full` | 全体 | フルピッチ |
| `final-third-left` | FT上 | 上ゴール側ファイナルサード（cy≈0.17） |
| `final-third-right` | FT下 | 下ゴール側ファイナルサード（cy≈0.83） |
| `pen-left` | ペナ上 | 上ペナルティエリア（cy≈0.12） |
| `pen-right` | ペナ下 | 下ペナルティエリア（cy≈0.88） |

**縦では出さない:** `corner-*` · `ck-setup-*` · `throw-*` — 横のセットプレー語彙。セットプレーは局面複製で対応。

### 3-2. プリセット解決（必須）

- `resolveViewPreset(sport, orientation, id)` — 縦サッカーは `PORTRAIT_SOCCER_VIEW_PRESETS`（上記 5 種のみ）
- 横サッカー / 他競技: 現行 `VIEW_PRESETS[id]` **そのまま**（回帰ゼロ）
- `viewPresetsForSport("soccer", "portrait")` は **5 エントリ**を返す
- `viewportMatchesPreset` も同じ解決経由

### 3-3. ViewportPresetGrid（必須）

- `sport === "soccer"` かつ `pitchOrientation === "portrait"`:
  - サムネ: `SoccerPortraitBody` · viewBox **46×72**
  - ファインダー inner: `{ x:2.5, y:2.5, w:41, h:67 }`
- それ以外: 現行の横向きサムネ

### 3-4. 触らないもの

| 項目 | 理由 |
|------|------|
| `fitField` の contain | 縦は左右ピラーが正しい（VERTICAL_PITCH §5） |
| 横ボードのプリセット数値・件数 | 回帰 |
| 試合タブ Pitch View | 別コントロール |

---

## 4. 検証

- `npx tsc --noEmit`
- `npm run test:i18n-chrome`
- `npx tsx scripts/portrait-viewport-check.ts` — 5 種リスト · cy 目安

手動:

- [ ] **縦フル**: 画角グリッドが **5 ボタン**（全体 · FT上/下 · ペナ上/下）
- [ ] サムネ縦向き · FT上で上ゴール側ズーム
- [ ] **横フル**: 13 プリセット回帰

---

## 5. やってはいけない

- 縦に CK・スローを復活させる（横語彙の回転マッピング）
- 横 `VIEW_PRESETS` の数値を書き換える
- 縦ボードで画角プリセットを非表示にして逃げる
- 勝手 commit / push

---

## 6. Later

- 縦の `hideHalf` · Export 画角 · 9:16 キャプチャ枠プレビュー · ペナ/FT のゴールライン・ピン
