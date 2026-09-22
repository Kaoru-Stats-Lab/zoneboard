# 実装プロンプト — キット・アクセント色（セカンドリング）

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

## 0. 境界ゲート（チャットに4行）

1. Idea→Explanation？ → **Yes**（クラブ2色を匂わせて説明しやすくする）  
2. Game→Analysis？ → **No**  
3. Workstation 化？ → **No**（塗り＋細いリングのみ。ストライプなし）  
4. 帯 → **Should**（P0 ではないがプロダクト差分として明確）

---

## 1. CPO / CMO / CTO 確定（守る）

| 事項 | 判断 |
|------|------|
| ストライプ（ヴァスコ斜め · アヤックス縦） | **やらない** |
| いまの白／黒 **外枠＋ノーズ**をキット色にする | **やらない**（向き可読用シルエットインク） |
| セカンド色の出し方 | **塗りとシルエット外枠のあいだの細いリング**（任意） |
| 未設定 | 現行どおり1色＋シルエット |
| GK | **v1 はアクセントなし**（フィールドユニだけ2色。Drawer を増やしすぎない） |

**描画順（正本）:**

```text
1. シルエット塗り（silInk · ノーズ一体）     ← 既存
2. キット円塗り（primary）                 ← 既存
3. アクセント環（secondary · 任意）         ← 新規
4. シルエット外枠ストローク（silInk）       ← 既存（向きの縁を最前面に残す）
5. 番号（インクは primary 基準）           ← 既存
```

選択リング・ベンチ破線・カード印のロジックは壊さない。

---

## 2. 現状コード（必読）

1. `src/canvas/drawBoard.ts` — `drawPiece`（L725〜）。コメントどおり  
   `シルエット → キット円 → 外枠`。`silInk` は `usesDarkPitchInk` で白／ほぼ黒。  
2. `src/models/kits.ts` — `KitPalette` · `kitsFromBoard` · `colorForKit` · `paintPiecesWithKits`  
3. `src/models/types.ts` — `homeColor` / `awayColor` / `homeGkColor` / `awayGkColor`  
4. `src/models/defaults.ts` — `createBoard` · `migrateBoard`  
5. `src/hooks/useAppState.ts` — `setKitColor`（変更時に全シーン `paintPiecesWithKits`）  
6. `src/components/Drawer.tsx` — `.kit-colors-block` · `KitColorField`（フィールド＋GK）  
7. `src/components/KitColorField.tsx` — スウォッチ＋ポップオーバー HEX  
8. `.cursor/rules/i18n-ui-guardrails.mdc` — **Drawer に長い横並びを足すな** · HEX は popover  

触らない: ストライプ描画 · B-070 · Piece size · 円内マーク文字数 · changelog。

---

## 3. データモデル

ボードに **フィールド用アクセントのみ**（任意）:

```ts
/** フィールドユニのアクセント。未設定・空・primary と同色ならリング非描画 */
homeAccentColor?: string;
awayAccentColor?: string;
```

- `migrateBoard`: 欠落は `undefined`（リングなし）。強制デフォルト色を埋めない。  
- `KitPalette` に `homeAccent` / `awayAccent` を足すか、描画時に board から読む。  
- **`piece.color` は primary のまま。** アクセントを駒に焼き込まない（`paintPiecesWithKits` は primary のみ継続）。  
- `sceneThumb` のキャッシュキーに accent を含める（色変更でサムネが古くならないように）。

正規化: `normalizePieceColor`。クリアは空文字 → `undefined` 扱い。

---

## 4. 描画（`drawPiece`）

アクセントを描く条件:

- 駒の `kit !== "gk"`（または未指定 outfield）  
- チームに対応する accent が存在し、primary と RGB が十分違う（例: 同一 HEX ならスキップ）

リング:

- 中心 `(x,y)`、半径はキット円に沿う（目安: `fillR` 付近、または `fillR - edgeW*0.25`）  
- 線幅: `max(1.25, edgeW * 0.9)` 程度。精密でも消えないよう **CSS px 下限**を1つ持つ  
- `strokeStyle = accent`（ハローは必須ではない。シルエット外枠が外にある）  
- **ノーズにはアクセントを伸ばさない**（円弧のみ）。向きは sil 外枠の仕事  

番号: 引き続き `numberFill(fillColor)`（primary）。アクセントで番号色を変えない。

Export PNG は `drawBoard` 経由なら自動追随。確認のみ。

---

## 5. UI（Drawer）

各チームの `.kit-colors-swatches` に、フィールド色の横（または直下）へ **アクセント用 `KitColorField` を1つ**。

- ラベル例: JA「アクセント」 / EN「Accent」（`kitAccent` · 必要なら `kitAccentShort`）  
- `title` / hint: 「メインの外側に細い色。ストライプではない」程度（`kitAccentHint`）  
- **GK 列は増やさない**  
- 300px Drawer: 既存 `.kit-colors-block` パターンを崩さない。HEX は既存 popover。横に3つ並べて溢れるなら **フィールド＋アクセントを2スウォッチ、GK は次行**など構造固定で対応  
- クリア手段: ポップ内に「なし」／空 HEX で accent 削除（任意だが推奨）

`setKitColor` を拡張するか `setKitAccent(team, color | null)` を追加。変更は board のみでよく、全駒 `color` の再ペイントは不要（accent は描画時参照）。

全 **9 locale** の `messages.ts` を同時更新。`npm run test:i18n-chrome`。

---

## 6. 受け入れ

- [ ] accent 未設定: 見た目が現状と実質同じ  
- [ ] home primary `#ffffff` · accent `#c8102e`（Ajax 風）: 白円＋赤環＋白／黒シルエット外枠  
- [ ] ノーズ（向き）はシルエット色のまま。アクセント色に染まらない  
- [ ] GK 駒にアクセントリングが付かない  
- [ ] 紙ピッチ／芝ピッチの両方で向きが読める  
- [ ] 精密 Piece size でもリングが完全消失しない（下限幅）  
- [ ] migrate 旧ボードが壊れない  
- [ ] `tsc` · `test:i18n-chrome` PASS  
- [ ] ストライプ実装なし · コミットなし  

---

## 7. やらないこと

- 斜め／縦／横ストライプ · パターン塗り  
- シルエット外枠のキット色化  
- GK アクセント（Later）  
- 駒単位の個別アクセント上書き（Later）  
- 公式キット API · クラブ名からの自動色  
- changelog · LP · コミット  

---

## 8. 報告フォーマット

```text
## 境界ゲート
1. … 2. … 3. … 4. …

## やったこと
- データ: …
- drawPiece: …
- Drawer: …

## 触ったファイル
- …

## 確認
- tsc / i18n-chrome — …
- 手動（あれば）: Ajax 風 / 向き / GK …

## やらなかったこと
- …
```
