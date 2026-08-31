# 実装プロンプト — Pitch View UI（B-072 · サッカー試合タブ）

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。  
**前提:** 縦ピッチの **描画エンジン**（`pitchOrientation` · `drawPitch*` · `aspectFor`）は **別 Agent が実装済み** とみなす。未実装なら [`AGENT_PROMPT_VERTICAL_PITCH.md`](AGENT_PROMPT_VERTICAL_PITCH.md) の波 1–2 を先に。

**いまやるのは UI だけ:** 試合タブのピッチ見た目選択を [The Tactics App](https://thetacticsapp.com/) 型の **5 線画アイコン**に統合する。

仕様: [`VERTICAL_PITCH.md`](VERTICAL_PITCH.md) §6。矛盾したら VERTICAL_PITCH を勝ちにする。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

あなたは ZoneBoard（`c:\asl_dev\zoneboard`）の実装エージェントです。

---

## 0. 先に読め

1. [`docs/VERTICAL_PITCH.md`](VERTICAL_PITCH.md) §6（UI 契約）
2. このファイル全文
3. `.cursor/rules/i18n-ui-guardrails.mdc`
4. コード:
   - `src/components/PitchLookPicker.tsx`（現状は横サムネ 2 枚のみ）
   - `src/components/Drawer.tsx`（**削除対象:** `nextPitchOrientation` セグメント）
   - `src/hooks/useAppState.ts`（`nextPitchOrientation` / `setNextPitchOrientation`）
   - `src/styles.css`（`.pitch-look__thumbs` は今 2 列 grid）
   - `src/canvas/drawBoard.ts`（`worldToPitch` / `pitchToWorld` のハーフ・flip 意味）
   - `src/i18n/messages.ts`（`ja` + `en`）

描画エンジン・B-070・LP は触らない。

---

## 1. 問題（直すこと）

現状の試合タブは **二重時計** でユーザが迷う:

| コントロール | 効く対象 | 見た目 |
|--------------|----------|--------|
| 向き（横／縦） | **次の新規ボード** | キャンバスは変わらない |
| ピッチ（フル／ハーフ） | **いまのボード** | 常に **横** のサムネ |

→ 縦を選んでも左のキャンバスもピッチアイコンも横のまま。**不合格。**

---

## 2. ゴール（受け入れ）

### 原則（必須）

**アイコンの絵 ＝ いまのボードの状態（一意）。**  
青枠の絵とキャンバスが一致しない状態を作らない。

### UI 形（TTA 型 · まるっと真似てよい）

試合タブ（サッカー）に **1 つの Pitch View セグメント** — 線画アイコン **5 つ・1 行**（区切り線・選択時の青枠は TTA 参考）。

| # | アイコン | `pitchOrientation` | `pitchView` | `pitchFlipped` |
|---|----------|-------------------|-------------|----------------|
| 1 | **横フル** | `landscape` | `full` | `false` |
| 2 | **縦フル** | `portrait` | `full` | `false` |
| 3 | **縦ハーフ（下ゴール）** | `portrait` | `half` | `false` |
| 4 | **横ハーフ（右ゴール・既定）** | `landscape` | `half` | `false` |
| 5 | **縦ハーフ（上ゴール）** | `portrait` | `half` | `true` |

並び順は TTA の Pitch View 行に合わせてよい（上表と同順推奨）。

**ラベル:** UI に「ホーム／アウェイ」と書かない（`teamFocus` と混同）。`title` / `aria-label` は **空間**（例: 縦フル · 横ハーフ・右ゴール側 · 縦ハーフ・上ゴール側）。ボタン表面は **アイコンのみ**（文字なし）。

### 残すもの

- **5レーン** … 既存の文字セグメント（なし／レーン）。ピッチアイコンにレーンを描かない
- **バスケ** … 既存の横 2 サムネ（`court="basketball"`）。今回の 5 枚は **サッカーのみ**
- **ツールレール** … 言葉のまま。向きで並べ替えない

### 削除するもの

- 試合タブの **「向き（横／縦）」セグメント** と `orientationHint` 行
- `useAppState` の **`nextPitchOrientation` / `setNextPitchOrientation`**（新規ボードは **横フル既定** のまま。縦が欲しければ Pitch View で縦フルを選んでから作業、または将来ボード作成フローで拡張 — 今回は sticky 予約を消す）
- ハーフ時の **別「反転」ボタン**（`pitch-look__flip`）。flip は **アイコン 5 枚目**に含める
- 横ハーフの **反対側**（左ゴール）用の 6 枚目は **今回やらない**（必要なら Later。報告に残す）

---

## 3. データ — 向きを変えたとき（今回の判断）

アイコンとキャンバスを一意にするため、**いまのボード**でアイコンを押したら **即 `BoardDocument` を更新**する。

### 3a. `pitchOrientation` が変わるとき（横↔縦）

**座標写像はしない。** 次を実行:

1. `pitchOrientation` / `pitchView` / `pitchFlipped` をプリセットどおりにセット
2. **全 `scenes` をリセット:** 駒 `[]` · 線 `[]` · ボール `{ x:0.5, y:0.5 }` · `viewport` は `DEFAULT_VIEWPORT` 相当  
   （`createBoard` の portrait 空シードと同じ思想）
3. `showMatchBanner` … 横なら既存ロジック（サッカー既定 ON 可）· 縦なら **描画しない**（既存 `matchBanner.ts` 追従）
4. **確認ダイアログは出さない**（Undo `Ctrl+Z` で戻せれば足りる）。`updateBoard` 前に `captureUndo` する

### 3b. 同じ向き内でフル↔ハーフだけ変わるとき

**駒・線は保持**（既存 `pitchView` 切替と同じ）。`worldToPitch` / `pitchToWorld` が効く。

### 3c. 同じ向き・ハーフで `pitchFlipped` だけ変わるとき

プリセット 3 ↔ 5 のような切替は **駒保持**でよい（縦ハーフの上下入替）。

### 3d. 新規ボード

`createBoard("soccer")` は **横フル** のまま（OBS 既定）。`nextPitchOrientation` は廃止。

---

## 4. 実装メモ

### 型

`src/presets/pitchLook.ts` など小さなファイルでよい:

```ts
export type SoccerPitchLookPreset =
  | "landscapeFull"
  | "portraitFull"
  | "portraitHalfBottom"
  | "landscapeHalfRight"
  | "portraitHalfTop";

export function boardToSoccerPitchLookPreset(board): SoccerPitchLookPreset;
export function soccerPitchLookPresetToBoardFields(preset): {
  pitchOrientation; pitchView; pitchFlipped;
};
```

`boardTo*` は現在の 3 軸から **どれか 1 プリセットに逆引き**。該当なし（例: 横ハーフ + flip true）は **最も近い**プリセットにフォールバックするか、4 を off・5 を on で表現 — **横ハーフ flip true は今回 UI に無い**ので、読み込み時は **4（landscapeHalfRight）** に丸めてよい。

### サムネ SVG

`PitchLookPicker.tsx` に追加:

- `PitchThumbPortraitFull` · `PitchThumbPortraitHalfBottom` · `PitchThumbPortraitHalfTop`
- 横ハーフは既存 `PitchThumbHalf`（左ゴースト）
- 縦ハーフ上は **上側ゴースト**（`GhostUnusedTop` 等）。キャンバスと同じ「ライブ側／未使用側」の見え方

既存 `SoccerLandscapeBody` を流用・回転コピーでよい。レーン線は **サムネに描かない**。

### レイアウト CSS

`.pitch-look__thumbs` を **5 列 1 行**（`grid-template-columns: repeat(5, 1fr)` または flex）。  
各セル ~40px 級 · `min-width: 0` · ドロワー 300px で **横スクロール禁止**（`overflow-x: hidden` 親を壊さない）。  
縦サムネ用 `.pitch-thumb--portrait`（高さ > 幅）を追加。TTA 風の細い区切り・`.is-active` 青枠は既存 `.pitch-look__thumb.is-active` を活かす。

### Drawer

サッカーブロックを:

```tsx
<PitchLookPicker
  mode="soccerPitchView"
  preset={boardToSoccerPitchLookPreset(board)}
  onPreset={(p) => state.applySoccerPitchLook(p)}
  showLanes5={...}
  onLanes5={...}
  labels={{ pitchView: t("pitchView"), ... pitchLook* keys }}
/>
```

`applySoccerPitchLook` は `useAppState` に追加（向き変化時リセット含む）。

---

## 5. i18n

`messages.ts` に **各プリセットの `title` / `aria-label` 用キー**（Short 不要 — ボタンはアイコンのみ）。

例（ja / en 両方）:

- `pitchLookLandscapeFull`
- `pitchLookPortraitFull`
- `pitchLookPortraitHalfBottom`
- `pitchLookLandscapeHalfRight`
- `pitchLookPortraitHalfTop`

`orientationHint` · `orientationCurrent` · `nextPitchOrientation` 用 UI が消えれば、キーは残してもよいが **未使用なら削除可**（`test:i18n-chrome` の key parity を保つ）。

`npm run test:i18n-chrome` 必須。

---

## 6. やってはいけない

- TTA の Lines 9 枚・Grass 6 枚・Field 切替をコピー
- 「次の新規用」向きセグメントを残す
- 縦選択時に横サムネのまま
- 横↔縦で駒座標を写像する
- キャンバス全体 `rotate(90deg)`
- ツールレールのアイコン化
- `if (locale === "ja")` レイアウト分岐
- docs 大量追加・LP・How-to 新セクション
- 勝手 commit / push
- 6 枚目（横ハーフ左）を勝手に足してスコープ膨らませ

---

## 7. ガードレール（Cursor Auto）

1. **PitchLookPicker だけ直して Drawer を半分残すな** — 向きセグメントと `nextPitchOrientation` は **根こそぎ削除**
2. **5 アイコン全部つなぐ前に 2 枚だけ縦を足して終わるな**
3. **プリセット関数を 3 ファイルに分散させない** — 1 モジュール + Picker + state
4. **横ボード回帰:** アイコン 1 が青 · キャンバス横フル · 帯あり
5. **縦フル:** アイコン 2 が青 · ゴール上下 · 帯なし
6. **押した直後に青枠とキャンバスが一致**することをブラウザで目視
7. `tsc` + `test:i18n-chrome` を通す

---

## 8. 検証チェックリスト

- [ ] 向きセグメント（次の新規用）が **無い**
- [ ] 5 アイコンが 1 行に収まり、ドロワー横スクロールなし
- [ ] 各アイコン押下後、**青枠＝キャンバス**（縦フル・縦ハーフ・横ハーフ含む）
- [ ] 横→縦アイコン: キャンバス縦になる · 駒は空＋中央ボール（写像なし）
- [ ] 縦→横アイコン: 同様リセット
- [ ] 横フル↔横ハーフ: 駒は **保持**
- [ ] レーンセグメントは従来どおり
- [ ] バスケ試合タブは **従来の 2 サムネ**のまま
- [ ] 配信モードで 16:9 contain（縦時左右マット）
- [ ] `npx tsc --noEmit` · `npm run test:i18n-chrome`

---

## 9. 完了報告（日本語）

- 削除した state / UI
- 5 プリセットと 3 フィールドの対応表
- 向き変更時のリセット仕様
- 触ったファイル
- チェックリスト結果
- 残課題（横ハーフ左・6 枚目・新規ボード作成時の向き）— 実装せず列挙
