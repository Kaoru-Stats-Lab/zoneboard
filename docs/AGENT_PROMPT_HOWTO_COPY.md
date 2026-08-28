# プロンプト — 使い方（How-to）文案の日英リライト

このファイルをそのまま別 Agent に渡してよい。実装正本は [`src/i18n/howTo.ts`](../src/i18n/howTo.ts)。印刷用コマンド表は同ファイルから生成される（[`src/site/shortcutSheet.ts`](../src/site/shortcutSheet.ts)）。

---

あなたは ZoneBoard（`c:\asl_dev\zoneboard`）の **文案エージェント**です。  
**使い方モーダル**（`?` / `F1`）と **配信コマンド表**（`/materials/shortcut-sheet/`）の文言を、日本語と英語で書き直す。

成果物は **`src/i18n/howTo.ts` の `ja` と `en` オブジェクトのみ**を更新する。TypeScript の型・キー構造・`combo` 文字列は変えない（実装とキーバインドが依存している）。

日本語で報告する。コミットはユーザが頼むまでしない。

---

## 読め（矛盾したら上から優先）

1. 現行文案: [`src/i18n/howTo.ts`](../src/i18n/howTo.ts)
2. 製品トーン: [`docs/UI_UX.md`](../docs/UI_UX.md) §2（軽い・速い・ウィザードなし）
3. 学習コスト: [`docs/PRODUCT_NOTE.md`](../docs/PRODUCT_NOTE.md) §2（駒を動かすだけで足りる。ホットキーは任意加速）
4. 配信前提: [`docs/OBS.md`](../docs/OBS.md) · 配信モードでツール非表示 · 局面複製ワークフロー（2026-08-28 決定）

---

## 何を直すか

| 対象 | 直す | 直さない |
|------|------|----------|
| `intro` | ○ | |
| 各 `section.heading` | ○ | |
| 各 `section.paragraphs[]` | ○ | |
| 各 `keys[].meaning` | ○ | |
| `keys[].combo` | × | `Click` `Ctrl/Cmd+Click` 等はそのまま |
| セクション数・順序 | × | 5 セクション固定 |
| 各セクションの keys 行数・combo 一覧 | × | 追加・削除・並べ替え禁止 |

**ゴール**

- **日本語:** 翻訳調・説明書調・「〜となります」を減らし、配信者が口にしそうな自然な文にする。
- **英語:** ネイティブの修辞やスラングより、**EU/UK の配信者が英語第二言語でも一読でわかる**平易な英語にする。

---

## 日本語のルール

### トーン

- 読者は **解説配信者・部活監督**。敬語すぎない。です・ますは使ってよいが、堅いマニュアル口調は避ける。
- **短文**。1 文に操作が 2 つ以上入るなら割る。
- サッカー語はそのまま使う（ライン、プレス、セットプレー、CK、マーク、ハイライン）。IT 用語は必要最小（パネル、キャプチャ、配信モード）。
- 「〜することができます」「〜となります」は原則禁止。能動態で書く。

### 避ける

- 直訳のカタカナ連打（「トランスレート」「グループセレクション」）
- 同じ語尾の三連続（「〜します。〜します。〜します。」）
- 芝生の上にチュートリアルを出す、と矛盾する「初めての方は〜」系ウィザード口調

### 良い例 / 悪い例

| 悪い | よい |
|------|------|
| 選択された駒群を平行移動させることができます | 選んだ駒をまとめてドラッグすると、形を保ったまま動きます |
| 配信モードにおいてはツールバーが非表示となります | 配信モード（B）ではツールが消えます |
| 修飾キーを押下した状態で | Ctrl または Cmd を押したまま |

### `keys[].meaning`（日本語）

- **12 文字前後**を目安（長くても 20 字）。コマンド表の列幅用。
- 体言止め・短い動詞でよい（「その駒だけ選ぶ」「選択を解除」）。

### 語彙（ZB 正本 — 新造語禁止）

| 使う | 使わない | 根拠 |
|------|----------|------|
| **駒** | トークン、マーカー、プレイヤー | `pieceHome` · `pieceSize` |
| **選択** | 塊、グループ | ツール `select`＝選択 |
| **局面** | シーン（ja 本文） | Scenes ドロワー |
| **Pass / Run / Pen / Link / Zone** | パス、ラン（ツール説明時） | ツールレール表記 |
| 具体名 | これ、それ、「がこれです」 | 曖昧指示語 |

- **駒は変えない** — すでに ZB 正本（マグネットボード比喩とも一致）。
- **塊は使わない** — UI に無い語。ユーザが本文とツール名で二重学習になる。

---

## 英語のルール（ESL-first）

読者像: **Premier League 同時視聴配信者のうち、英語が母語でない人**（南欧・東欧・中東・アジア在住の EU ストリーマー含む）。UK スラングや文学調は不要。

### 文法・語彙

- **短い文。** 平均 12–18 語。1 文 1 アイデア。
- **能動態。** Passive は避ける（× "is hidden" → ○ "hides" / "tools hide"）。
- **常用語のみ。** 難語を避ける:

| 避ける | 使う |
|--------|------|
| chrome | tools / menus / panels |
| marquee | box select / drag a box |
| translate (verb for movement) | move the selection / move together |
| ferrying | move one by one |
| centroid | centre of the selection |
| group (in body copy) | selection |
| fork (scene) | copy the scene |
| pack / spread (alone) | move closer together / move apart |
| on air | while you are live / during the stream |
| eat the capture | show up on stream / appear in the recording |

- **スラング・比喩を減らす。** × "the same hands work on air" → ○ "you can use the same keys while live"
- **略語は初出で説明不要**（OBS は既知前提）。Ctrl/Cmd はそのまま。
- スペル: **UK**（colour 不要なら省略可。centre / behaviour は centre のみ使う場面で）。

### `keys[].meaning`（英語）

- **短く。** 名詞句または動詞句（"Select one piece" / "Clear selection"）。
- 括弧は 1 組まで（"Nudge (small step)"）。

### 良い例 / 悪い例

| 悪い | よい |
|------|------|
| Piece work is then a keyboard job | You move pieces with the keyboard |
| Capture a panel and you are showing chrome | If the side panel is open, viewers see menus, not tactics |
| The group translates together | The whole group moves together |
| Fork this scene and try a move | Copy this scene, then try your move |
| Learn the ones you will actually press | Learn only the keys you need |

---

## 内容の正本（事実を変えない）

文案を書き換えても、次の製品事実は維持すること。

1. 配信モード（**B**）でツール・ドロワーが消える。操作はキーボード＋配信 chrome（局面 `[` `]`、複製、試合操作）。
2. 芝の上に初回オーバーレイは出さない。この How-to と公開ガイドが説明書。
3. 選択 → 移動の順。範囲選択は空き地ドラッグ。CB ラベルはない。
4. 複数選択のドラッグは入れ替えしない。入れ替えは 1 駒のときだけ。
5. **R** = 向きのみ。**Q/E** = 2 人以上で形を回転。**- / =** = コンパクト／開く。
6. Pass = ボールの道。Run / Dribble = 走り／運び。Pen = 自由線。Link = 駒追従の直線。
7. 局面は **`[` `]`** で切替。試す前に **局面を複製**。初期配置リセットボタンはない。
8. How-to は **配信中に開かない**（`?` / F1）。
9. 全部のコマンドを覚える必要はない — 使うものだけでよい。

---

## 作業手順

1. `howTo.ts` を読み、各 `paragraph` と `meaning` に **問題メモ**（日本語 1 行ずつ）を付けた表を作る（チャット出力でよい）。
2. `ja` 全文をリライト。
3. `en` 全文をリライト（日本語の直訳にしない。同じ事実を ESL 英語で）。
4. `ja` と `en` の **セクション見出しは対訳**にする（意味同等。文字数は揃えなくてよい）。
5. `keys[].combo` が変わっていないか diff で確認。
6. `npx tsc --noEmit` を実行。
7. （任意）`npm run site:pages` で shortcut-sheet HTML を再生成。

---

## 完了報告に含めるもの

- 変更したファイル一覧
- 日本語・英語それぞれで直した方針を 3 行ずつ
- 意図的に残した硬い表現があれば理由
- Before / After を **代表 3 箇所**（intro + 各言語 1 段落 + 各言語 1 つの `meaning`）
- コミットはしない

---

## コピペ用 — 下線より下を Agent に渡す

---

You are rewriting ZoneBoard **in-app How-to** copy in `src/i18n/howTo.ts`.

**Audience**

- **Japanese:** football streamers and coaches. Natural spoken Japanese. Not manual-style or translationese.
- **English:** streamers for whom **English is not their first language**. Plain, short sentences. No slang, no clever metaphors, no passive voice piles. UK spelling where it matters (`centre`).

**Scope**

- Edit only: `intro`, `section.heading`, `section.paragraphs[]`, `keys[].meaning` for both `ja` and `en`.
- Do **not** change: `keys[].combo`, section order, number of sections, number of key rows, TypeScript structure.

**Product facts (must stay true)**

- Broadcast mode (B) hides tools; keyboard + minimal broadcast chrome remain.
- No first-run overlay on the pitch. This panel is the manual.
- Select then move. Marquee = drag on empty grass. No CB role labels on pieces.
- Multi-piece drag does not swap shirts; swap is single-piece only.
- R = facing only. Q/E = rotate shape (2+ pieces). -/= = compact / spread.
- Pass = ball path. Run/Dribble = movement. Pen = freehand. Link = piece-following line.
- Scenes: `[` `]`. Duplicate scene before trying a move; no reset-to-start button.
- How-to does not open during broadcast (? / F1).
- Users need not learn every shortcut.

**Japanese style**

- Short sentences. Active voice. です・ます OK but not stiff.
- Avoid: 〜することができます、〜となります、カタカナ直訳。
- `keys[].meaning`: ~12 characters when possible.

**English style (ESL-first)**

- Average 12–18 words per sentence. One idea per sentence.
- Avoid: chrome, marquee, translate (for movement), ferrying, centroid, fork, "on air", "eat the capture".
- Prefer: tools/menus, box select, move together, copy the scene, during the stream.
- `keys[].meaning`: short phrase ("Clear selection").

**Deliverable**

- Updated `src/i18n/howTo.ts` only.
- Run `npx tsc --noEmit`.
- Report in Japanese: strategy, 3 before/after samples, files touched. No git commit.

Read first: `src/i18n/howTo.ts`, `docs/UI_UX.md` §2, `docs/PRODUCT_NOTE.md` §2.
