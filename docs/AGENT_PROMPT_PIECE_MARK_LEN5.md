# 実装プロンプト — 円内マーク上限を 5 文字に

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

## 0. 境界ゲート（チャットに4行）

1. Idea→Explanation？ → **Yes**（練習・概念図で短い役割マーク · `PIVOT` / `PRESS` 等）  
2. Game→Analysis？ → **No**（ポジション辞書・自動判定なし）  
3. Workstation 化？ → **No**  
4. 帯 → **P0 小改善**（円内マーク文字数）

---

## 1. 背景（CPO / HCI 確定）

- 円の中の文字は **`piece.number`**（名前ピルではない）。  
- 現行 `NUMBER_MAX_LEN = 4` のため `Libero` → `libe` になる。  
- 幾何見積: **5 文字は円幅に収まる**（`fitNumberFontSize` の相対下限内）。**6 文字は下限でもはみ出し** → **上限は 5**。  
- コマ半径をラベル長で拡大しない。センタリングは既存のまま。  
- 多言語ポジション辞書・Quick labels・Name→Label 改名は **本タスク外**。

使い方の例（実装不要・理解用）: `GK` `DM` `PIVOT` `PRESS` `SWEEP` `FALSE`。  
`Libero`(6) は円内フル保証しない → `LIB` 等。

---

## 2. 先に読め

1. このファイル全文  
2. `src/canvas/pieceInk.ts` — `NUMBER_MAX_LEN` · `normalizePieceNumber` · 末尾 assert  
3. `src/canvas/drawBoard.ts` — `drawPieceNumberLabel` · `fitNumberFontSize`（**描画ロジックは原則触らない**）  
4. `src/components/PieceInspector.tsx` — number 入力に `maxLength` が無いこと確認  

触らない: ベンチ scale · Homography · i18n 大改修 · ポジション辞書 · コマ自動拡大 · 絶対 px 下限の追加（Later）。

---

## 3. 実装（Must）

### 3.1 `NUMBER_MAX_LEN` → `5`

`src/canvas/pieceInk.ts`:

```ts
const NUMBER_MAX_LEN = 5;
```

- `normalizePieceNumber` の JSDoc を「max 5 chars」に更新。  
- 末尾の self-assert を更新:
  - 例: 入力 `"10001"` → length **5**（従来は 4 期待だった）  
  - 例: `"LIBERO"` → `"LIBER"`（6→5）を assert してよい  
  - 例: `"PIVOT"` → `"PIVOT"`（5 のまま）

正規化ルールは維持: NFKC · trim · `[^\dA-Za-z]` 除去 · 空許可。

### 3.2 描画

- `drawPieceNumberLabel` は既に `textAlign = "center"` · `textBaseline = "middle"`。**変更不要。**  
- `fitNumberFontSize` を今回いじらない（相対フィットのまま）。  
- コマ `r` を文字数で変えない。

### 3.3 UI 入力

- number フィールドに `maxLength={4}` 等があれば **5 に合わせる or 外す**（正規化が正本なら maxlength 無しでも可）。  
- placeholder / ヒントが「2桁のみ」と明言していて誤解を招く場合のみ、短く直す（全 locale）。なければ触らない。

---

## 4. 受け入れ

- [ ] `normalizePieceNumber("PIVOT") === "PIVOT"`  
- [ ] `normalizePieceNumber("LIBERO") === "LIBER"`（6 文字目は切る）  
- [ ] `normalizePieceNumber("99") === "99"`（背番号回帰）  
- [ ] 円内は中央揃えのまま  
- [ ] Piece size を変えてもコマ半径がラベル長に依存しない  
- [ ] `npx tsc --noEmit` PASS  
- [ ] `npx --yes tsx src/canvas/pieceInk.ts`（ファイル末尾 assert）PASS  
- [ ] コミットしない  

手動（任意）: balanced で `PIVOT` / `PRESS` を円内に入れて目視。

---

## 5. やらないこと

- 上限 6  
- 多言語ポジション表 · Quick label UI  
- `piece.label`（名前ピル）の仕様変更  
- 絶対フォント px 下限の新規導入  
- PRODUCT_NOTE の長い決定ログ（不要ならスキップ）  
- changelog · コミット  

---

## 6. 報告フォーマット

```text
## 境界ゲート
1. … 2. … 3. … 4. …

## やったこと
- NUMBER_MAX_LEN: 4 → 5
- assert: …

## 触ったファイル
- …

## 確認
- tsc — …
- pieceInk assert — …

## やらなかったこと
- …
```
