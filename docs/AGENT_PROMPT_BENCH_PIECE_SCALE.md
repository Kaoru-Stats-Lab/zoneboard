# 実装プロンプト — ベンチ駒サイズを Piece size から切り離す

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

## 0. 境界ゲート（チャットに4行）

1. Idea→Explanation？ → **Yes**（XI を小さくしても控え名簿が読める · 交代説明の摩擦削減）  
2. Game→Analysis？ → **No**  
3. Workstation 化？ → **No**（描画1関数の修正）  
4. 帯 → **P0 可読性欠陥**（Piece size の誤結合）

---

## 1. 背景（CPO 確定）

Panel の **Piece size**（`board.pieceScale`）は **芝上 XI（starter）用**。  
ベンチ（`role === "bench"`）は名簿レールで、すでに `base * 0.48` と小さい。同じ `pieceScale` で潰すと番号・名前が先に死ぬ。

**方針（これだけでよい）:**  
ベンチ半径から `pieceScale` を外す。別つまみ・減衰カーブ・新 UI は **作らない**。

他アプリ比較・影響調査の結論:

- Swap は `roleFromPosition(y)` 依存 → **サイズ切り離しで壊れない**
- 縦ピッチ / ハーフは位置写像と `densityZoom` の話 → **scale 非連動で追加分岐不要**
- ヒットテストは `pieceRadius` 共有 → **描画とヒットが一致したまま**

---

## 2. 先に読め

1. このファイル全文  
2. `src/canvas/drawBoard.ts` — `pieceRadius`（現状 `scale` を bench にも掛ける）  
3. 同ファイル — `pieceHitRadiusNorm` · `hitTestPiece` · `hitTestPieceForSwap`（変更不要・同じ `pieceRadius` を使うこと）  
4. `src/models/types.ts` — `PIECE_SCALE`（min 0.5 / max 1.6 · 参考）  
5. `src/models/pieceRole.ts` — `roleFromPosition` / `BENCH_BAND`（触らない）

触らない: Drawer の Piece size UI · Swap ロジック · 縦/ハーフ写像 · i18n · Homography · B-070 · changelog。

---

## 3. 実装（Must）

### 3.1 `pieceRadius` のみ変更

現状（概念）:

```ts
const scale = board.pieceScale ?? 1;
const base =
  (Math.min(pitch.w, pitch.h) * 0.028 * scale) / densityZoom(board);
return role === "bench" ? base * 0.48 : base;
```

目標:

```ts
const scale = role === "bench" ? 1 : (board.pieceScale ?? 1);
const base =
  (Math.min(pitch.w, pitch.h) * 0.028 * scale) / densityZoom(board);
return role === "bench" ? base * 0.48 : base;
```

または同等:

- starter: 今どおり `pieceScale` を掛ける  
- bench: **`pieceScale` を掛けず**、`0.48 * (min(w,h)*0.028) / densityZoom`  
- **`densityZoom` はベンチにも残す**（ズーム時の画面密度合わせ。外さない）

ベンチ係数 `0.48` は変えない。

### 3.2 回帰確認（コードパス）

変更は `pieceRadius` 一箇所で足りる想定。次が同じ関数を使うことを確認し、二重定義しない:

- `drawPiece` / 名前チップ位置  
- `pieceHitRadiusNorm` · `hitTestPiece` · `hitTestPieceForSwap`  
- Export PNG（`drawBoard` 経由なら自動追随）

`ballRadius` は今回触らない。

---

## 4. 受け入れ

- [ ] Piece size を **精密（0.65）や min（0.5）** にしても、ベンチの円・背番号・名前が balanced（1.0）時と同程度の大きさ  
- [ ] Piece size を **戦術（1.35）** にしてもベンチは肥大化しない（scale=1 相当のまま）  
- [ ] XI↔ベンチの **ドラッグ Swap** が従来どおり成立（ヒット半径が描画と一致）  
- [ ] 縦フル / 縦ハーフ / 横ハーフでベンチが表示され、極端に消えたり掴メなくならない  
- [ ] `tsc` PASS  
- [ ] 新 UI・新 i18n キーなし  
- [ ] コミットしない  

手動の目安（ブラウザ）:

1. 横フル · balanced → Sub 可読  
2. 同じ局面で Piece size → 精密 → **XI だけ小さく、Sub はほぼ不変**  
3. スタメンを Sub にドロップ交代 → role とサイズが入れ替わる  

---

## 5. やらないこと

- Sub 専用スライダー  
- `0.48` の再チューニングや px 下限の追加（必要なら Later）  
- `roleFromPosition` / Swap / hideHalf / pitchView の変更  
- PRODUCT_NOTE 境界の変更  
- changelog · LP · コミット  

---

## 6. 報告フォーマット

```text
## 境界ゲート
1. … 2. … 3. … 4. …

## やったこと
- pieceRadius: …

## 触ったファイル
- …

## 確認
- tsc — …
- 手動（あれば）: 精密で Sub 不変 / Swap OK …

## やらなかったこと
- …
```
