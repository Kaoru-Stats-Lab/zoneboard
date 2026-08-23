# 駒インク（背番号可読性）— エッジ一覧 & 別 Agent 用プロンプト

**作成:** 2026-08-23  
**前提:** 配信 OBS キャプチャ（1920×1080）で背番号が 1 秒で読めること。チームカラーピッカー UI はこの防御が通ってから。

---

## 現状の穴（`drawPiece` @ `src/canvas/drawBoard.ts`）

| 項目 | 現状 |
|------|------|
| 背番号 | `fillStyle = "#fff"` 固定（L376） |
| 向き三角 | 塗り `piece.color`、縁 `#fff` 固定（L352–369） |
| 利き足 | 暗丸＋白文字（L392–400）。番号と競合しうる（N9） |
| フォント | `700 max(8, r*0.9)px` — 絶対 8px 下限（N6/N7） |
| 番号文字列 | `piece.number` をそのまま `fillText` — 桁数・全角未処理 |
| 退場 | `globalAlpha = 0.45` が円全体にかかり、番号も薄くなる（L275–278, N8） |
| ベンチ半径 | `base * 0.48`（L105） |
| PNG | `exportPng.ts` → `drawBoard()` 経由（同一描画） |
| カード集計 | `matchCards.ts` の `pieceTeam()` が `color === HOME_COLOR` 比較 — カスタム色で null（`Piece.team` は既にある） |

---

## エッジ（色）

| # | ケース | 何が壊れる |
|---|---|---|
| C1 | ホームが黄・白・薄緑 | 白番号が消える。芝生とも同化 |
| C2 | アウェイが赤系でホームに近い | チームが区別できない |
| C3 | 両軍とも暗い（紺 vs 黒） | 駒同士は読めても、番号以外の輪郭が芝で溶ける |
| C4 | GK だけ上書きで白／蛍光 | 1 駒だけ番号が死ぬ。チーム設定では検知漏れ |
| C5 | `#fff` / `white` / 短縮 HEX / 不正文字 | パース失敗で黒塗りや透明 |
| C6 | 半透明・8 桁 HEX | canvas が薄く、番号だけ残る |
| C7 | PNG 書き出し・配信 16:9 縮小 | 画面ではギリ、キャプチャで潰れる |

## エッジ（番号）

| # | ケース | 何が壊れる |
|---|---|---|
| N1 | 空・空白 | 無地の円。誰か分からない |
| N2 | `10` は可、`99`/`00`/`101`/`10A` | 3 桁以上が円からはみ出す |
| N3 | 全角 `１０`、絵文字 | 幅が爆発 |
| N4 | 同一チームで番号重複 | 配信で同一人物に見える |
| N5 | ホーム 1 とアウェイ 1 | 許容。色で区別。警告しない |
| N6 | ベンチ半径 0.48 | 2 桁が読めない |
| N7 | 精密 `pieceScale` | フォント 8px 下限でも OBS 1080p で潰れる |
| N8 | 退場 alpha 0.45 | 番号も一緒に薄くなる |
| N9 | 利き足 L/R が番号に重なる | 特に 1 桁 |
| N10 | 駒同士の重ね | 下の番号が欠ける（ドラッグ順） |

## エッジ（色 × 番号の交差）

| # | ケース |
|---|---|
| X1 | 黄駒＋白番号＋黄カードリング |
| X2 | 選択白リングと白駒が同化 |
| X3 | 5 レーン薄色と黄緑駒 |
| X4 | ダーク LP とボードのパレットが違う（LP は `drawBoard` 経由なら同一インクで自動） |

## やらない

- コート色のフルカスタム
- 番号のドロップシャドウ劇場
- 色覚の完全シミュレーション UI
- チームカラーピッカー UI の本実装（防御関数だけ先）

---

## 潰しの方針（実装に固定）

1. **インク自動:** 塗りに対し番号＋向き三角は白かほぼ黒。WCAG 相対輝度。しきい値は芝（暗緑）でも白が勝つ側。
2. **番号ハロー:** 逆色の極細 `strokeText`（1〜2px）。C1/C7 用。影の山は禁止。
3. **チーム 2 色:** 互いのコントラストが足りなければアウェイをずらすか、ピッカーでブロック（関数だけ export）。駒 11 個を個別検査しなくてよい。GK 上書きは保存時にインク再計算。
4. **番号は表示用に正規化:** trim、最大 2 桁（サカ）/ 許容は数字と 1 文字。描画は縮小。入力は消さず、はみ出しだけ防ぐ。
5. **退場:** 塗りは薄く、番号は不透明のまま。
6. **ベンチ:** 2 桁が `r` に収まるまで font を下げる。消さない。

---

## 別 Agent 用プロンプト（このブロックを 1 本で渡す）

```
# 役割
zoneboard（C:\asl_dev\zoneboard）の実装者。駒の塗りと背番号が配信キャプチャで読めなくなるエッジを、描画と入力の両方で潰す。新機能（チームカラーピッカー一式、フォーメ追加）は範囲外。可読性の防御だけ。

# 北極星
1920×1080 配信で、芝生 ON、精密サイズ（pieceScale 最大）でも、2 桁背番号が 1 秒で読める。色の好みより可読性を優先する。ユーザが黄や白を選んでも番号が死なない。

# 先に開け（識別子はファイルを正とする）
- src/canvas/drawBoard.ts — drawPiece（塗り・白縁・fillText 白固定 L376・退場 globalAlpha L275–278・ベンチ r*0.48 L105）
- src/canvas/exportPng.ts — drawBoard 経由（別描画パスを増やさない）
- src/models/types.ts — Piece.color / number / team、HOME_COLOR / AWAY_COLOR / PIECE_SCALE
- src/components/PieceInspector.tsx — number の自由入力
- src/hooks/useAppState.ts — patchPiece（正規化をここか専用関数経由で）
- src/canvas/matchCards.ts — pieceTeam() が color === HOME_COLOR（L82–85）。Piece.team を正とする

# エッジ（すべて対処。無視しない）

色:
- C1 明るい塗り（黄・白・薄緑・シアン）で白番号が消える
- C2 ホームとアウェイの色差が小さい
- C3 両軍とも暗い（輪郭が芝に溶ける）— 既存の白縁を維持し、足りなければ縁を少し太く
- C4 1 駒だけの上書き色（GK）
- C5 不正・短縮・名前付き CSS 色。パース失敗時はチーム既定色へフォールバック
- C6 alpha 付き色は不透明に正規化
- C7 PNG 書き出しと配信 16:9 縮小でも同じインク規則

番号:
- N1 空は描画しないが、インスペクタではプレースホルダのまま（強制「0」にしない）
- N2 3 桁以上・長い文字列は描画時に縮小。円からはみ出さない。4 文字超は保存時にトリム可
- N3 全角数字は半角に正規化。絵文字・制御文字は捨てる
- N4 同一チームの重複番号はインスペクタで短く警告（ブロックしない。ベンチとスタメンの同番があり得る）
- N5 ホーム 1 とアウェイ 1 は正常。警告しない
- N6 ベンチ小半径でも 2 桁が収まる
- N7 pieceScale 精密でも min フォントを r 連動に（絶対 8px 固定をやめる）
- N8 退場の globalAlpha を番号にかけない（塗り・三角・カードリングだけ薄く）
- N9 利き足マークが番号を隠さない（番号優先。足は外側 r*0.85 以降など）
- N10 重なりは z 順の既存のまま。スタック並べ替えはしない

交差:
- X1 黄駒＋黄カード — 番号インクは塗り基準。カード環は既存 CARD_YELLOW
- X2 白駒の選択リング — 既存の暗ハロー（drawPieceSelectionRing）を維持
- X3 レーン着色との同化 — 駒縁の白/暗を消さない
- X4 LP ヒーロー（lpHeroScene.ts）も drawBoard 経由なら自動

# 実装

1. src/canvas/pieceInk.ts（名前は既存スタイルに合わせる）
   - normalizePieceColor(input, fallback): #rrggbb 不透明
   - relativeLuminance(hex)
   - numberFill(bg): "#fff" | "#111"（しきい値 ~0.45。芝上でも明るい塗りで黒インクになる側。定数にコメント）
   - numberHalo(bg): 逆側
   - normalizePieceNumber(raw): trim, 全角→半角, 不正除去, 描画用最大長
   - fitNumberFontSize(ctx, text, r): 2 文字が ~1.6*r 幅に収まるまで下げ、min ~r*0.45
   - teamPairOk(home, away): 色差が足りないか（将来ピッカー用。今回 UI なし）
2. drawPiece
   - 塗り前に color を normalize（表示用 piece.color は patch 時に正規化）
   - 番号と向き三角の fill を numberFill(normalizedColor)
   - fillText 直前に halo（strokeText 1〜2px）
   - 退場: save/restore で alpha を塗り・三角・縁だけに限定。番号・利き足は alpha 1
   - フォント: fitNumberFontSize を使う
3. patchPiece / PieceInspector
   - number: normalizePieceNumber。空は許可
   - color: normalizePieceColor、失敗時 team 既定
   - 同一 team 内 number 重複: 選択駒変更時に短い警告テキスト（i18n 1 キー追加可）
4. matchCards.ts — pieceTeam() を piece.team 優先（color 比較は後方互換フォールバックのみ）
5. テスト: vitest 未導入。pieceInk.ts は pure 関数なので `npx tsx` で小さな assert スクリプトを scripts/ か pieceInk.test.ts 相当で可。最低: #fde047→黒、#e74c3c→白、#fff→黒、不正 "nope"→fallback

# 禁止
- カラーピッカー UI の本実装
- コート色変更
- 番号を常に黒にする（赤駒で死ぬ）
- アウェイ自動で補色ネオン
- GSAP、新規 npm 依存（vitest 追加も今回は不要）

# 完了条件
- 黄・白・赤・紺の駒を並べて、芝生 ON・精密サイズ・1920 幅相当で 2 桁が読める
- 退場駒の番号が通常より明らかに薄くない
- 3 桁入力しても円から大きくはみ出さない
- PNG export も同じ見え
- npx tsc --noEmit 通過

# 手動確認
1. インスペクタでホーム 1 を #fde047 / #ffffff / #111111 に（patch で仮でも可）
2. 番号を 9 / 10 / 99 / 100 / １０ / 空
3. 配信モード 16:9（?broadcast=1）
4. PNG 書き出し
```

---

## 参照

- エッジ詳細・方針: 本ファイル上部
- 配信キャプチャ: [`docs/OBS.md`](OBS.md)
- 全体引き継ぎ: [`docs/AGENT_HANDOFF.md`](AGENT_HANDOFF.md)
