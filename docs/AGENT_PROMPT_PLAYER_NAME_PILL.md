# 実装プロンプト — 名前ピル（ボード単位オプション）

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

あなたは ZoneBoard（`c:\asl_dev\zoneboard`）の実装エージェントです。  
**いまやるのは:** 芝上の駒に **名前ピル（暗チップ）を出すかどうか**を、**試合（ボード）単位**で切り替える。

Pitch View UI · 縦ピッチ描画 · B-070 は **触らない**。

---

## 0. 先に読め

1. [`docs/PRODUCT_NOTE.md`](PRODUCT_NOTE.md) — 背番号ファースト（§1）
2. このファイル全文
3. `.cursor/rules/i18n-ui-guardrails.mdc`
4. コード:
   - `src/canvas/drawBoard.ts` — `drawPiece` · `drawPieceNameCaption` · `drawBenchNameChip` · `captionNameForPiece`
   - `src/models/types.ts` · `src/models/defaults.ts`（`migrateBoard`）
   - `src/components/Drawer.tsx`（試合タブ · 駒サイズ付近）
   - `src/i18n/messages.ts`（`ja` + `en`）
   - `src/canvas/exportPng.ts`（焼き込みが drawBoard 経由なら確認のみ）

---

## 1. ジョブ

| ユーザ | 欲しいもの |
|--------|------------|
| **watchalong 本線** | 番号だけ。名前は口で言う · OBS 圧縮で読める |
| **この試合のフォーメーション** | スタメン 11 人の **名前を常に読める**（名簿から） |

**受け入れ絵（2026-08-31）:** VTuber 配信の **フォーメーション画面** — 両チーム色の丸コマ（番号入り）＋直下に **名前ピル**（日本語姓・フルネーム）。ピッチ上に 4-4-2 等を並べ、視聴者が「誰がどこか」を一目で読む。**このニーズが ON のときの見え方。**

**ピルの種類は 1 つだけ**（控え帯と同型の暗チップ）。大きめは **新ピルではなく既存 `pieceScale`**（戦術／標準／精密）。

---

## 2. 仕様

### データ

| 項目 | 値 |
|------|-----|
| フィールド | `BoardDocument.showPlayerNames: boolean` |
| **新規ボード** | 既定 **`false`**（番号のみ） |
| **migrate** | キー欠落は **`true`**（既存セーブは今まで名簿名が芝上に出ていた — 回帰回避） |
| スコープ | **ボード単位**。局面・グローバル設定にしない |

### 描画

| `showPlayerNames` | 芝上スターター（`role !== "bench"`） |
|-------------------|--------------------------------------|
| **`false`** | 円内 **番号のみ**。`drawPieceNameCaption` は **呼ばない** |
| **`true`** | 円内番号 ＋ 下に **暗チップピル**（名前）。`drawBenchNameChip` と **同じ見た目・1 種類** |

**控え（ベンチ）:** 従来どおり **常にチップ**（`showPlayerNames` の影響を受けない）。

**名前の出所:** 既存 `captionNameForPiece`（`piece.label` → 名簿の番号一致）。変更しない。

**短名:** 芝上ピルも控えと同様 — 非選択時は `shortPlayerName`（姓）、選択時はフル寄り。新ルールを invent しない。

**リファクタ推奨:** `drawBenchNameChip` を `drawPlayerNameChip(ctx, pitch, x, y, r, piece, board, selected)` に抽出し、ベンチ・芝上の両方から呼ぶ。差分は最小。

**やらない:**

- 縞ユニフォーム・薄灰ピル（参考 TTA 風）の第 2 スキン
- ピル ON/OFF/短名/フル名の **4 段階セグメント**
- 名前だけの駒（番号なし）専用 UI
- `pieceScale` 以外の「ピル大／小」スライダー

### UI

- **試合タブ** · 駒サイズ（`piece-scale-presets`）の **直上または直下**
- **1 チェックボックス**（`.check` パターン。フットサルの checkbox 行と同型）
- ラベル: `showPlayerNames` / `showPlayerNamesShort`（ドロワーは Short 不要なら full を `title` に、表示は 1 行で収まる短文）
- ヒント 1 行（`hint-muted`）: この試合だけ · 名簿の名前が出る · 大きさは駒サイズ

局面タブ・配信 chrome・ツールレールには出さない。

### i18n

`ja` + `en` 両方。例:

- `showPlayerNames` — フル（title / checkbox に使う）
- `showPlayerNamesHint` — ヒント

`npm run test:i18n-chrome` 必須。

### Export / 配信

- 配信モード・PNG Export とも **同じ描画パス**（`drawBoard`）。別焼きロジックを足さない。

---

## 3. ガードレール（Cursor Auto）

1. **ピル種類を増やすな** — 暗チップ 1 種のみ
2. **デフォルトを新規だけ false にし、migrate は true** — 既存ユーザの名前表示を消すな
3. **控えのチップ挙動を壊すな**
4. **番号の正立・向き三角・カードマーク** は触らない
5. **ドロワー横スクロール** — 長文ラベルを横並びにしない
6. **`if (locale === "ja")` レイアウト分岐禁止**
7. **docs 大量追加・How-to 新セクション・LP 変更** しない
8. **勝手 commit / push しない**
9. **描画を 3 ファイルにコピペ展開しない** — チップは 1 関数

---

## 4. 実装の順

1. 型 + `createBoard`（false）+ `migrateBoard`（欠落 → true）
2. `drawBoard` 分岐 + チップ抽出
3. Drawer チェック + i18n
4. `tsc` · `test:i18n-chrome` · ブラウザ（OFF/ON · ベンチ · 選択 · 配信 · Export）

---

## 5. 検証チェックリスト

- [ ] 新規ボード: 既定で **番号のみ**（名簿に名前があっても芝上に出ない）
- [ ] チェック ON: 芝上に **暗チップ**（控えと同系）
- [ ] チェック OFF: 芝上は番号のみ。控えは **従来どおりチップ**
- [ ] 名簿にない番号: 名前なし（番号だけ）
- [ ] `piece.label` 直書き: 従来どおり優先
- [ ] 選択時: フル名寄り（控えと同じルール）
- [ ] `pieceScale` 大: ピルも比例して大きくなる
- [ ] 古い localStorage: 名前は **今まで通り見える**（migrate true）
- [ ] 配信モード・PNG: 設定どおり
- [ ] `npx tsc --noEmit` · `npm run test:i18n-chrome`

---

## 6. 完了報告（日本語）

- フィールド名と既定（新規 / migrate）
- チップ共通化のやり方
- 触ったファイル
- チェックリスト結果
- 意図的にやらなかったこと（ピル種類追加・グローバル設定・局面別）
