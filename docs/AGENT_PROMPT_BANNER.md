# 実装プロンプト — 試合帯と名簿セグメント（別 Agent 用）

このファイルをそのまま渡してよい。正本は [`STUDIO.md`](STUDIO.md) **§6–7**。矛盾したら STUDIO を勝ちにする。  
スタジオ波 1–4（ダーク chrome・キットは Roster・準備/実況・配信得点）は完了済み。**触らない。** このチケットは B-052 と B-053 だけ。

---

あなたは ZoneBoard（`c:\asl_dev\zoneboard`）の実装エージェントです。  
日本語で報告する。コミットはユーザが頼むまでしない。

## 読め

1. [`docs/STUDIO.md`](STUDIO.md) §6（キットは面で分ける）§7（試合帯）
2. コード:
   - `src/canvas/matchBanner.ts`（チーム名とタイムラインを `kits.home` / `kits.away` で fill している）
   - `src/canvas/matchCards.ts`（タイムライン文字列）
   - `src/components/Drawer.tsx`（`.team-segment` の Home/Away）
   - `src/styles.css`（`.team-segment button.team-home.active` が `#e74c3c` / `#3498db` 固定）
   - `src/canvas/pieceInk.ts`（`numberFill` = キット上の白／黒）
   - `src/models/kits.ts` `kitsFromBoard`
   - `index.html`（いま Barlow + Zen Kaku のみ。キリルなし）

必要なら `.cursor/skills/a11y-audit/SKILL.md`（帯の本文は 4.5:1、チップは 3:1）。

## やってはいけない

- チーム名や得点者名をキット色で塗る（現状のバグそのもの）
- 名前を `slice(0,3)` / 自動ラテン略称 / 機械的 `toUpperCase()` する
- Barlow だけを帯の font にする（キリルが欠ける）
- UEFA / PL のスコアバグをトレースする。紋・紫・黄は使わない
- スタジオのパネル IA・トークン・配信 chrome を巻き戻す
- 巨大リファクタ、`--no-verify`

## やれ（この順。1 波ごとに `npx tsc --noEmit`）

### 波 1 — B-053 名簿 Home/Away をキット色に

Roster の Home / Away セグメントは **色がラベル**。フィールドキットを背景にする。

- `kitsFromBoard(board).home` / `.away` を active 面の `background` に
- 字は `numberFill(kit)`（`#fff` or `#111`）
- 非 active は地のまま、またはキットを薄い左ボーダーだけ
- 名簿 textarea の左線も同じフィールド色に（いま `#e74c3c` / `#3498db` 固定）
- GK 色はセグメントに使わない（フィールドだけ）

### 波 2 — B-052 試合帯の本文を象牙に

`drawMatchBanner`（とタイムライン）:

- チーム名、大会名、得点者名: 象牙（`#f3f3f1` 前後）。キット fill 禁止
- スコア数字: 白、一段大きく、`font-weight: 700`。可能なら `font-variant-numeric: tabular-nums` 相当（キャンバスなら等幅に近い数字フォント）
- 区切りは `" - "` ではなく en dash `–`、左右に約 0.35em（見た目 `1  –  1`）
- キット色を出すならチーム名の **隣の 3–4px の縦棒**、または略称チップの背景だけ。チップ内の字は `numberFill`
- カード合計はスコア数字に接着させない。名前の肩の小さなバッジ
- タイムラインも本文は象牙／ミュート。チーム区別はドットやアイコン縁だけ

### 波 3 — 長さはユーザ、バケない

- 入力制約で3文字にしない。プレースホルダ例は `LIV` で短さを示してよい
- 幅不足のときだけ省略。`ctx.measureText` の幅。できれば書記素（`Intl.Segmenter`）。サロゲートを割らない
- 帯のキャンバス font は **Noto Sans を実ロード**したスタック（ラテン拡張・キリル・日本語）。`index.html` に Noto Sans（`subset` でキリル+ラテン+日本語が重いなら Noto Sans + Noto Sans JP の2系統）。Barlow は LP 見出しのまま
- スウェーデン語（Malmö）とキリル（ЦСКА）と日本語（浦和）が □ にならないこと。自動大文字化しない

RTL（アラビア語・ヘブライ語）はこの波でやらない。

### 検証

- `npx tsc --noEmit`
- ブラウザ:
  1. Roster で Home フィールドを茶系・Away を暗い紫に → セグメントの active 面がその色。駒も変わる。**帯のチーム名は白のまま読める**
  2. チーム名に `Malmö` `ЦСКА` `浦和` `Liverpool` を順に入れる → 欠けない。長い名前は幅で省略、文字数クリップではない
  3. スコア `1  –  1` が数字優位で、ハイフンが密着していない
  4. 配信モードで帯 ON → 暗いユニでも Aston Villa 相当が消えない
  5. 390px / 1440px。帯の象牙 vs `#141414` は本文コントラスト 4.5:1 以上

### 完了報告（日本語）

波ごとに何を変えたか、触ったファイル、確認した文字列（Malmö / ЦСКА / 浦和）、残した判断。コミットはしない。
