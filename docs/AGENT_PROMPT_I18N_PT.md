# プロンプト索引 — ブラジリアン・ポルトガル語（pt-BR）翻訳データ作成

**実装はまだしない。** 成果物は **翻訳ドラフトファイル** のみ。Gemini（または別 AI）に **1 波ずつ** 渡す。

**正本（翻訳元）:** 英語 `en` 第一 · 日本語 `ja` はトーン・用語の参考 · **es ドラフト**は Cool 軸・LP 構造の参考（単語のコピペ禁止）。矛盾したら **en** を勝ちにする。

**将来の locale コード:** `pt`（`Locale = "ja" | "en" | "es" | "pt"` は **実装 Agent** が後で行う）  
**言語タグ:** BCP 47 では `pt-BR`。ファイル名・メタは **`pt`**（es と同型）。

**市場:** **ブラジル一本。** 欧州ポルトガル語（pt-PT）向けの別ロケールは **作らない**。

---

## ROLE（Gemini が演じる役 · 全波共通）

あなたは **ネイティブ pt-BR 話者のサッカー配信 UI 翻訳者** である。機械翻訳の直訳役ではない。

| 項目 | 内容 |
|------|------|
| **読者** | ウォッチアロング配信者 · コーチ · 解説者（**18–45 歳 · サッカーは詳しい · IT は普通**） |
| **地域** | **ブラジル全国** — 口語は BR 標準。**pt-PT 禁止**（tu/teu · guarda-redes · bancada 等の欧州語） |
| **人称** | **você**（ボタン · hint）。過度な「o senhor/a senhora」は避ける |
| **仕事** | en の **意味と長さの役割**を保ち、**母語で自然**に言い換える |
| **やらない** | 文学調 · マーケ過剰 · CBF/FIFA 規則書 · ポルトガル国内限定表現 |

**自己チェック（翻訳後に 1 回読む）:**  
「BR の配信者が live 前に painel を読んで、**辞書なしで** 次の操作が想像できるか？」

---

## ネイティブに伝わりやすく（全波共通）

| 原則 | 具体 |
|------|------|
| **一文一操作** | hint に操作 2 つ以上入れたら分割 |
| **能動態** | 「É possível…」「Pode-se…」の連発より **Coloque · Pressione · Arraste** |
| **UI 語彙を統一** | 同じ概念は同じ語（cena なら全文で cena · 場面/シーン/局面を混ぜない） |
| **短いラベル** | ボタンは **動詞原形 or 名詞 1–2 語**。説明は `*Hint` / `title` へ |
| **ESL 配信者** | 英語 UI を B2 で読める人が pt でも **同等の一読性**（LP 特に） |
| **避ける** | 「mediante o menu suspenso…」· 「a seguir proceda…」· 過去形の説明書 |

**良い / 悪い（App hint の例）**

| en | ❌ 直訳調 / pt-PT | ✅ 配信者向け pt-BR |
|----|-------------------|----------------------|
| Duplicate scene | Duplicar a cena do menu | **Duplicar cena** |
| Hide tools in broadcast | Ocultar ferramentas no modo transmissão | **Modo live: sem ferramentas** |
| Paste roster numbers | Colar números da plantel da área de transferência | **Cole o elenco (Ctrl+V)** |

---

## サッカー用語（全波共通 · en/ja からの対応）

**準拠:** 実況 · 解説 · 戦術配信（Brasileirão · Libertadores · seleção）で **実際に口にする語**。

### 用語表（App · LP · How-to 共通）

| 概念 | en | pt-BR 推奨 | 備考 |
|------|-----|------------|------|
| 局面 | scene | **cena** | 「cenário」「fase do jogo」は使わない |
| 駒（盤上） | piece | **peça** | 名簿の人 → **jogador** |
| 名簿 / XI | roster · lineup | **elenco** · **escalação** | XI → **time titular** 可 |
| スタメン | starters | **titulares** | |
| 控え | bench | **reservas** · **banco** | UI 短い → **reservas** |
| コーナー | CK · corner | **escanteio** | |
| フリーキック | FK · set piece | **falta** · **bola parada** | 短い UI → **bola parada** |
| プレス | press | **pressão** | |
| パス（線種） | pass | **Passe** | ツール名 · 説明文も **passe** |
| ラン | run | **Corrida** | ツール名 · LP 本文も **corrida** |
| ドリブル | dribble | **Drible** | ツール名 · 説明文も **drible** |
| ゴールキーパー | GK | **goleiro** | pt-PT guarda-redes 禁止 |
| ハーフタイム | HT | **intervalo** | |
| 背番号 | number | **número** · **camisa** | 盤上 → **número** で足りる |
| 試合（ボード単位） | match · board | **partida** · **quadro** | 保存単位 → **partida** · UI/LP → **quadro** |
| ピッチ | pitch | **campo** | **gramado** は prose で可 · **1 ファイル内 campo 統一** 推奨 |

**禁止:** **quadro negro** · **lousa** — 教室連想 · ZB ブランド（クリエイターツール）と不一致。**quadro** または **ZoneBoard** のみ。

**es からの対応（参考 · コピペ禁止）:** escena→cena · ficha→peça · plantilla→elenco · tablero→quadro · Pase/Carrera/Regate→Passe/Corrida/Drible

### ツール名（Pass / Run / …）

- **方針（確定）:** **Passe / Corrida / Drible** — UI 全体を pt-BR で統一（ja のパス/ラン/ドリブル · es の Pase/Carrera/Regate と同役割）
- **Pen · Link · Zone** → **Caneta** / **Lápis** · **Vincular** · **Zona**（Caneta vs Lápis は **1 ファイル内で統一** — 推奨 **Caneta**）
- howTo の `combo` も messages と **同じ語**（混在禁止）

### 競技・画角

- **futebol**（サッカー）— 「futebol soccer」不要
- **campo** · **área** · **meio-campo** — 画角 hint で使用可
- **ビーチ:** **futebol de areia**（[`BACKLOG.md`](BACKLOG.md) B-037）

### サッカー以外

- バスケ · フットサル等は **その競技の一般語**（cesta · futsal 等）。サッカー用語を流用しない

---

## es から学んだこと（pt 波で先取り）

| es で起きたこと | pt での方針 |
|-----------------|-------------|
| **pizarra** = 教室 | **quadro negro / lousa 禁止** → **quadro** |
| LP **Cool 軸**（配信の夜 · campo 満画面 · メニュー消える） | **同軸** — LP_COPY の「仕事ベース」より画面現象 |
| Grok: **streamers** が浮く | **Para criadores ao vivo. Treinadores também.**（`lpCanLead` 方向） |
| Grok: **césped** vs **campo** | **campo** 統一 |
| Grok: CTA に **listo para OBS** 相当 | **pronto para OBS** を `lpCloseCta` に検討 |
| 改行入り placeholder | JSON は **`\n` 1 文字列**（複数行を連結文字列にしない） |
| **プレースホルダ中立** | 実在クラブ/リーグ/スター禁止 — `LOC`/`VIS` · `Rodada 1` · Silva 等（App 波 §プレースホルダ） |

---

## 実行順

| 順 | ファイル | 対象 | 出力先 |
|----|----------|------|--------|
| **1** | [`AGENT_PROMPT_I18N_PT_APP.md`](AGENT_PROMPT_I18N_PT_APP.md) | ボード UI · How-to · locale 既定文案 | `docs/i18n-draft/pt/messages-app.pt.json` · `howTo.pt.json` |
| **2** | [`AGENT_PROMPT_I18N_PT_LP.md`](AGENT_PROMPT_I18N_PT_LP.md) | LP（`lp*` キー） | `docs/i18n-draft/pt/messages-lp.pt.json` |
| **3（任意）** | [`AGENT_PROMPT_I18N_PT_LP_GROK_REVIEW.md`](AGENT_PROMPT_I18N_PT_LP_GROK_REVIEW.md) | LP ネイティブ受け止め | `docs/i18n-draft/pt/GROK-LP-REVIEW.md` に貼付 |

**Later（本索引の範囲外）:** `src/site/pages.ts` 読み物 · `consentCopy.ts` · changelog · `/updates/` — **App/LP 完了後**

---

## 共通ルール（Gemini 向け · 詳細は上 §ROLE / §ネイティブ / §サッカー用語）

| 項目 | 方針 |
|------|------|
| **レジスタ** | サッカー **配信・ウォッチアロング**向け。**você** 可 · 若者スラングの連発は避ける |
| **避ける** | pt-PT · 説明書調「será possível…」の連発 · CBF 規則書トーン |
| **固有名詞** | **ZoneBoard · OBS · Product Hunt · PNG · Ctrl · Cmd · Instagram · X** はそのまま |
| **ツール名** | 索引 §サッカー用語「ツール名」参照 |
| **キー** | **追加・削除・リネーム禁止** — 値だけ |
| **空文字** | en/ja が `""` なら pt も `""` |
| **実装禁止** | `messages.ts` · `locale.ts` · React · コミット |

---

## ガードレール（Auto / Gemini 悪癖）

| # | 悪癖 | 正しい |
|---|------|--------|
| G1 | キーを勝手に足す/消す | en と **完全一致** |
| G2 | `*Short` を長文化 | **~12 文字**（ラテン）目安 · 超えたら短縮案を2つ付記 |
| G3 | LP と App を 1 ファイルに混ぜる | **波 1 / 2 で分割** |
| G4 | 日本語から直訳 | **en 基準** · ja/es は補助 |
| G5 | 実装までやる | **JSON ドラフトのみ** |
| G6 | `lp*` を App 波に含める | LP 波のみ |
| G7 | **サッカー用語表を無視** | 索引 §サッカー用語に準拠 · 混用禁止 |
| G8 | **cena/cenário 混在** | **cena** に統一 |
| G9 | **pt-PT が混ざる** | BR 用語チェック（goleiro · escanteio · você） |
| G10 | **マニュアル調の長文 Short** | 短縮 + full キーへ逃がす |

---

## 実装 Agent への引き継ぎ（翻訳完了後 · 今はやらない）

1. `docs/i18n-draft/pt/*.json` を `src/i18n/messages.ts` の `pt:` にマージ（`scripts/merge-es-messages.mjs` を参考に **`\n` は JSON.stringify 1 行**）
2. `Locale` · `locale.ts` · `/pt/` ルート · `dist/pt/index.html` · `test:i18n-chrome`
3. es 実装済みパターン: `Landing locale="pt"` · `boardHref({ lang: pt })` · Settings **Português (Brasil)**

---

## 完了報告テンプレ（翻訳 Agent）

- 出力ファイルパス
- キー数（en と一致したか）
- `*Short` で 12 文字超えたキー一覧
- 意訳した箇所（英→葡で判断が分かれたところ）
- **用語統一表**（cena/peça/elenco/quadro 等 · 逸脱があれば理由）
- pt-PT っぽい語が混ざっていないか
- 実装 Agent への注意 1–3 行
