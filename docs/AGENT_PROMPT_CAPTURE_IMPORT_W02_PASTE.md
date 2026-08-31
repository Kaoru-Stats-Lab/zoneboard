# 実装プロンプト — 局面取込 W02: 貼付と短命セッション（B-070 · Phase 1）

**索引:** [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md) · **Wave 2/5**  
**前提:** W01 **完了・検証済み**（`src/capture/homography.ts` · Hartley + 8×8 DLT · `PITCH_CORNERS_NORM` export）。

```ts
import {
  computeHomography,
  transformPoint,
  invertHomography,
  pitchNormToWorld,
  PITCH_CORNERS_NORM,
  type HomographyMatrix,
  type Point,
} from "../capture/homography";
```

検証: `npx tsc --noEmit` · `npx tsx scripts/homography-check.ts`（6 ケース）。

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。**実装はこの Agent のみ。親セッションはコードを書かない。**

**ロールアウト:** [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md) §隠し機能。**W02 で `isCaptureImportEnabled()` を入れ、false なら UI も paste も無い。**

**いまやるのは:** `Ctrl+V` / ドロップで画像を **メモリに載せる** + **CaptureImportSession** state。**4点 UI · 下敷き描画は W03–04。**

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

## 0. 先に読め

1. 索引 + G1–G15
2. W01 の `src/capture/homography.ts`
3. `.cursor/rules/i18n-ui-guardrails.mdc`
4. コード:
   - `src/hooks/useAppState.ts` — state 追加パターン
   - `src/components/Editor.tsx` — キーボード（`V` 等）
   - `src/components/Drawer.tsx` — 局面タブ構造
   - `src/models/types.ts` — `Scene` / `BoardDocument`（**永続スキーマは Phase 1 で拡張しない**）
   - `src/i18n/messages.ts`

---

## 1. ゴール

### 1-1. 短命セッション型（React state / ref · 永続化しない）

```ts
// 名前は調整可。BoardDocument には入れない。
type CaptureImportPhase = "idle" | "image" | "calib" | "place" | "confirm";

interface CaptureImportSession {
  phase: CaptureImportPhase;
  /** object URL or ImageBitmap — タブ閉じで消える */
  image: { width: number; height: number; url: string } | null;
  /** W03 で埋める。W02 は null でよい */
  homography: number[] | null;
  /** W05 で埋める */
  draftPieces: Piece[];
}
```

- `useAppState` に `captureImport: CaptureImportSession | null` + `startCaptureImport()` / `clearCaptureImport()` / `setCaptureImage(...)`
- **localStorage / migrate / schemaVersion 変更禁止**

### 1-2. 入力経路

| 経路 | 要件 |
|------|------|
| **`Ctrl+V`** | `paste` イベント · `image/*` clipboard。編集モードかつ `sport === "soccer"` かつ横フル相当 |
| **ドロップ** | キャンバス or エディタ領域（配信モードでは無効） |
| **ドロワー入口** | 局面タブに **1 ボタン**「局面取込」→ 貼付待ち（`captureImportPasteHint`） |

**非対象:** 縦ピッチ · バスケ · ファイル `<input multiple>` の動画 · URL 取込

### 1-3. 画像処理

- `createImageBitmap` or `Image` + `URL.createObjectURL`
- **最大辺 4096** 超えたらリサイズしてから保持（帯 B）
- 失敗時: トースト or `hint-muted`（i18n キー 2–3 個）
- **サーバ POST なし**

### 1-5. 隠し機能ゲート（必須 · W02 で実装）

[`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md) §ロールアウト参照。

- 新規 `src/lib/captureImportGate.ts` · `isCaptureImportEnabled()`
- **PROD:** `?captureImport=1` で LS セット → 以降そのブラウザのみ有効
- **DEV:** 常時 true
- ゲート OFF: ボタンなし · paste/drop 未登録 · state 触らない

---

取込開始時:

- `board.sport !== "soccer"` → 開始不可（メッセージ）
- `pitchOrientation === "portrait"` または `pitchView === "half"` → **Phase 1 不可**（メッセージ · Later）

---

## 2. UI（最小）

- 局面タブ: `.drawer-stack-actions` 内 **1 ボタン**（`captureImportShort` + `title= captureImport`）
- セッション中: トップバー or ドロワーに **「取込中 · 取消」**（`captureImportCancelShort`）
- **4点オーバーレイは W03** — W02 では画像受け取り後 `phase: "image"` で **「次: 4点合わせ（未実装）」スタブ表示可** または W03 着手前のプレースホルダ 1 行

---

## 3. i18n（最小）

`ja` + `en` 両方 · key parity:

- `captureImport` / `captureImportShort`
- `captureImportPasteHint`
- `captureImportCancel` / `captureImportCancelShort`
- `captureImportUnsupportedSport`
- `captureImportUnsupportedPitch`

`npm run test:i18n-chrome` 必須。

---

## 4. やってはいけない

- Homography UI · drawBoard 下敷き
- 画像の IndexedDB 保存
- 自動駒 · Worker（W03）
- LP · How-to 更新
- `Scene` / `BoardDocument` スキーマ変更
- 局面タブ以外に巨大パネル

---

## 5. ガードレール（Cursor Auto）

1. **W03 の UI を半分だけ作って W02 完了にするな** — 貼付 + state + 取消まで
2. **`BoardDocument` に imageUrl フィールドを足すな** — セッションは React state のみ
3. **配信モードで paste を有効にするな** — 編集モードのみ
4. **drawer に横並び 5 ボタンを並べるな** — stack / 1 入口
5. **clipboard 以外の「AI アップロード」UI を invent しない**
6. **縦対応を if 分岐で黙って通すな** — 明示ブロック
7. **ゲートなしで UI / paste を出すな** — G16

---

## 6. 検証

- [ ] サッカー横フル: PNG 貼付 → セッション `image` 非 null
- [ ] 取消 → object URL revoke · state null
- [ ] バスケ / 縦: 開始拒否メッセージ
- [ ] リロード → 画像残らない
- [ ] ゲート OFF: 局面取込ボタンなし · paste 無反応
- [ ] ゲート ON (`?captureImport=1`): ボタン表示 · 貼付可
- [ ] `npx tsc --noEmit` · `npm run test:i18n-chrome`

---

## 7. 完了報告

- state 型と hook API（W03 が使う名前）
- 触ったファイル
- W03 への引き継ぎ（`phase` 遷移 `image` → `calib`）
