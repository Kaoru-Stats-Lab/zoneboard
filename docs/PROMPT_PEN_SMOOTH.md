# 実装プロンプト: Pen の追従と滑らかさ

ZoneBoard（`C:\asl_dev\zoneboard`）の作業。日本語でコミットメッセージと UI 文言を書く。LP コピーは触らない。

完了条件: `npx tsc --noEmit` が通る。マウス・可能ならペン／タッチで、引き中と確定後の線が角ばらず、先端がポインタから大きく遅れない。

対象は **Pen ツールのみ**。パス／ラン／ドリブルの `smoothLinePath`（RDP で点を間引く）は戦術線用なので、Pen に流用しない。

---

## 背景

いまの Pen は `pointermove` の点をそのまま `push` し、`lineTo` で結ぶ解説用インクである。液タブ＋描画アプリの域には達していない。達させる必要もない。目標は **丸と囲みが配信で角ばらない** まで。

原因（2026-08-23）:

- 高周波タブレットの途中点（`getCoalescedEvents`）を捨てている
- 描画が折れ線。パス用の平滑は Pen のプレビュー／確定にかかっていない
- 毎移動でボード全体を再描画（`bumpDragVisual` → rAF）。今回は全面書き換えしない

やらない: スタビライザー（遅れて追う）、筆圧、入り抜き、perfect-freehand 等の新規 npm、専用インクレイヤ。

決定の正本: [`BACKLOG.md`](BACKLOG.md) §1-7、B-047。

---

## 1. 合算イベントを全部取る

`src/components/BoardCanvas.tsx` の Pen ドラッグ（`d.mode === "pen"`）。

各 `pointermove` で:

```ts
const native = e.nativeEvent;
const extras =
  typeof native.getCoalescedEvents === "function"
    ? native.getCoalescedEvents()
    : [];
const batch = extras.length > 0 ? extras : [native];
```

バッチ内の各イベントをピッチ座標に変換して `d.points` へ。同一点の連打は間引いてよい（ノルム距離が極小なら skip）。

`getCoalescedEvents` が空の環境（一部ブラウザ・マウス）では、今どおりその move 1点だけ。壊れないこと。

React の合成イベントが合算を消すなら、Pen 中だけ canvas に native `pointermove` を足してもよい。その場合 `{ passive: true }` でよく、既存の `onPointerUp` / capture と二重に点が入らないこと。

---

## 2. 中点二次ベジェで描く

`src/canvas/drawBoard.ts` の `strokePenPath`（プレビューもここを通すこと）。

生の `lineTo` 連鎖をやめる。定番:

- 点 0 へ `moveTo`
- `i = 1 .. n-2` で、区間の中点を終点にした `quadraticCurveTo(points[i], midpoint(i, i+1))`
- 最後の点は `lineTo`（ポインタ位置を残す。ここを平滑で遅らせない）

`lineJoin` / `lineCap` は `round` のまま。ハロー（芝用）も同じパス。

プレビュー（`previewPen`）と確定後でアルゴリズムを分けない。引き中にカクつき、上げた瞬間だけ滑らか、は失敗。

確定時（`addPen`）に **ごく弱い** 移動平均をかけてもよい（端点は固定。`smoothLinePath` の RDP / 10点間引きは使わない。円が多角形になる）。

データは点列のまま。スキーマ変更なし。既存の粗い Pen ストロークは、新しいベジェ描画で少し滑らかに見えてよい。

---

## 3. 触る場所の目安

- `src/components/BoardCanvas.tsx` — Pen のサンプリング
- `src/canvas/drawBoard.ts` — `strokePenPath`、プレビュー
- 平滑が独立するなら `src/canvas/smoothPath.ts` に `strokePenSmooth` 相当を足す（パス用 RDP と混ぜない）
- `src/hooks/useAppState.ts` の `addPen` は点列をそのまま保存でよい。平滑は描画側が主

PNG / 配信モード / 選択ヒットは、ヒット判定を「描いた曲線の近く」に保つ。点列の折れ線距離で足りることが多い。ベジェと大きくずれるならヒットだけ少しスロップを足す。

---

## 4. 品質

- マウスの直線も極端にうねらない
- 素早く円を描いても辺が少ない多角形に見えない
- 先端が指／カーソルから明らかに遅れない（スタビライザ禁止の理由）
- 芝ピッチで白ハローがベジェに乗っている（**Pen は除外**。白インクにハローは太くホバーに見える）
- `getCoalescedEvents` 無しでも退行しない

---

## 5. 確認手順

1. Pen でゆっくり囲む → 角が少ない。
2. 素早く円 → 多角形に見えない。
3. マウスで短い線 → 不自然に曲がらない。
4. 引いている最中と pointerup 後で形がほぼ同じ。
5. 選択・Delete・「図を消す」・Ctrl+Z が従来どおり。
6. PNG 書き出しでも同じ曲線。
7. パス／ラン／ドリブルの見た目が変わっていない。

---

## 6. やらないこと

- LP
- スタビライザー、予測ストローク、筆圧、ブラシサイズ UI
- 新規 npm
- キャンバスを ink 専用レイヤに分割する（今回の範囲外）
- ブロック専用ツール（Pen で足りる）
- パス用 `smoothLinePath` を Pen にかける
