# プロンプト索引 — スペイン語（es）翻訳データ作成

**実装はまだしない。** 成果物は **翻訳ドラフトファイル** のみ。Gemini（または別 AI）に **1 波ずつ** 渡す。

**正本（翻訳元）:** 英語 `en` 第一 · 日本語 `ja` はトーン・用語の参考。矛盾したら **en** を勝ちにする。

**将来の locale コード:** `es`（`Locale = "ja" | "en" | "es"` は **実装 Agent** が後で行う）

---

## ROLE（Gemini が演じる役 · 全波共通）

あなたは **ネイティブスペイン語話者のサッカー配信 UI 翻訳者** である。機械翻訳の直訳役ではない。

| 項目 | 内容 |
|------|------|
| **読者** | ウォッチアロング配信者 · コーチ · 解説者（**18–45 歳 · サッカーは詳しい · IT は普通**） |
| **地域** | **ラテンアメリカ中立** + スペインでも違和感が少ない語。米国ヒスパニック可 |
| **人称** | **tú** 可（ボタン・hint）。敬語「usted」だらけにしない |
| **仕事** | en の **意味と長さの役割**を保ち、**母語で自然**に言い換える |
| **やらない** | 文学調 · マーケ過剰 · FIFA 規則書 · スペイン国内限定（vosotros · 「ordenador」だけ等） |

**自己チェック（翻訳後に 1 回読む）:**  
「LATAM の配信者がライブ前にパネルを読んで、**辞書なしで** 次の操作が想像できるか？」

---

## ネイティブに伝わりやすく（全波共通）

| 原則 | 具体 |
|------|------|
| **一文一操作** | hint に操作 2 つ以上入れたら分割 |
| **能動態** | 「Se puede…」「Es posible…」の連発より **Coloca · Pulsa · Arrastra** |
| **UI 語彙を統一** | 同じ概念は同じ語（escena なら全文で escena · 場面/シーン/局面を混ぜない） |
| **短いラベル** | ボタンは **動詞原形 or 名詞 1–2 語**。説明は `*Hint` / `title` へ |
| **ESL 配信者** | 英語 UI を B2 で読める人が es でも **同等の一読性**（LP 特に） |
| **避ける** | 「mediante el menú desplegable…」· 「a continuación proceda…」· 過去形の説明書 |

**良い / 悪い（App hint の例）**

| en | ❌ 直訳調 | ✅ 配信者向け |
|----|-----------|----------------|
| Duplicate scene | Duplicar la escena del menú | **Duplicar escena** |
| Hide tools in broadcast | Ocultar herramientas en modo transmisión | **Modo emisión: sin herramientas** |
| Paste roster numbers | Pegar números de plantilla desde portapapeles | **Pega la plantilla (Ctrl+V)** |

---

## サッカー用語（全波共通 · en/ja からの対応）

**準拠:** 実況 · 解説 · 戦術配信で **実際に口にする語**。FIFA 英語用語のカタカナ直訳は禁止。

### 用語表（App · LP · How-to 共通）

| 概念 | en | es 推奨 | 備考 |
|------|-----|---------|------|
| 局面 | scene | **escena** | 「シナリオ」「fase del juego」は使わない |
| 駒（盤上） | piece | **ficha** | 名簿の人 → **jugador** |
| 名簿 / XI | roster · lineup | **plantilla** · **alineación** | XI → **once inicial** 可 |
| スタメン | starters | **titulares** | |
| 控え | bench | **suplentes** · **banquillo** | UI 短い → **suplentes** |
| コーナー | CK · corner | **córner** | 「esquina」単独は避けがち |
| フリーキック | FK · set piece | **tiro libre** · **jugada a balón parado** | 短い UI → **balón parado** |
| プレス | press | **presión** | |
| パス（線種） | pass | **Pase** | ツール名 · 説明文も **pase** |
| ラン | run | **Carrera** | ツール名 · LP 本文も **carrera** |
| ドリブル | dribble | **Regate** | ツール名 · 説明文も **regate** |
| ゴールキーパー | GK | **portero** | |
| ハーフタイム | HT | **descanso** | |
| 背番号 | number | **dorsal** · **número** | 盤上 → **número** で足りる |
| 試合（ボード単位） | match · board | **partido** · **tablero** | 保存単位 → **partido** · UI/LP → **tablero** |

**禁止:** **pizarra** — 教室連想 · ZB ブランド（クリエイターツール）と不一致。**tablero** または **ZoneBoard** のみ。

### ツール名（Pass / Run / …）

- **方針（確定）:** **Pase / Carrera / Regate** — UI 全体をスペイン語で統一（ja のパス/ラン/ドリブルと同役割）
- **Pen · Link · Zone** → **Lápiz · Enlace · Zona**
- howTo の `combo` も messages と **同じ語**（混在禁止）

### 競技・画角

- **fútbol**（サッカー）— 「fútbol soccer」不要
- **campo** · **cancha** — LatAm では **cancha** も可。1 ファイル内で **campo に統一** 推奨
- **portería** · **área** · **mediocampo** — 画角 hint で使用可

### サッカー以外

- バスケ · フットサル · ビーチのキーは **その競技の一般語**（canasta · futsal 等）。サッカー用語を流用しない

---

## 実行順

| 順 | ファイル | 対象 | 出力先 |
|----|----------|------|--------|
| **1** | [`AGENT_PROMPT_I18N_ES_APP.md`](AGENT_PROMPT_I18N_ES_APP.md) | ボード UI · How-to · locale 既定文案 | `docs/i18n-draft/es/messages-app.es.json` · `howTo.es.json` |
| **2** | [`AGENT_PROMPT_I18N_ES_LP.md`](AGENT_PROMPT_I18N_ES_LP.md) | LP（`lp*` キー） | `docs/i18n-draft/es/messages-lp.es.json` |

**Later（本索引の範囲外）:** `src/site/pages.ts` 読み物 · `consentCopy.ts` · changelog · `/updates/` — **App/LP 完了後**

---

## 共通ルール（Gemini 向け · 詳細は上 §ROLE / §ネイティブ / §サッカー用語）

| 項目 | 方針 |
|------|------|
| **レジスタ** | サッカー **配信・ウォッチアロング**向け。口語的すぎない **tú** 可（LatAm 中立） |
| **避ける** | vosotros · スペイン国内限定スラング · 説明書調「se podrá…」の連発 |
| **固有名詞** | **ZoneBoard · OBS · Product Hunt · PNG · Ctrl · Cmd** はそのまま（必要なら短い説明を括弧） |
| **ツール名** | 索引 §サッカー用語「ツール名」参照 |
| **キー** | **追加・削除・リネーム禁止** — 値だけ |
| **空文字** | en/ja が `""` なら es も `""` |
| **実装禁止** | `messages.ts` · `locale.ts` · React · コミット |

---

## ガードレール（Auto / Gemini 悪癖）

| # | 悪癖 | 正しい |
|---|------|--------|
| G1 | キーを勝手に足す/消す | en と **完全一致** |
| G2 | `*Short` を長文化 | **~12 文字**（ラテン）目安 · 超えたら短縮案を2つ付記 |
| G3 | LP と App を 1 ファイルに混ぜる | **波 1 / 2 で分割** |
| G4 | 日本語から直訳 | **en 基準** · ja は補助 |
| G5 | 実装までやる | **JSON ドラフトのみ** |
| G6 | `lp*` を App 波に含める | LP 波のみ |
| G7 | **サッカー用語表を無視** | 索引 §サッカー用語に準拠 · 混在禁止 |
| G8 | **1 キー内で escena/escenario 混在** | 用語統一 |
| G9 | **マニュアル調の長文 Short** | 短縮 + full キーへ逃がす |

---

## 実装 Agent への引き継ぎ（翻訳完了後 · 今はやらない）

1. `docs/i18n-draft/es/*.json` を `src/i18n/messages.ts` の `es:` にマージ
2. `Locale` · `locale.ts` · `isLocale` · `test:i18n-chrome` · Short pairs 検証
3. LP 公開は `/es/` ルート等 — **別フェーズ**

---

## 完了報告テンプレ（翻訳 Agent）

- 出力ファイルパス
- キー数（en と一致したか）
- `*Short` で 12 文字超えたキー一覧
- 意訳した箇所（英→西で判断が分かれたところ）
- **用語統一表**（escena/ficha/plantilla 等 · 逸脱があれば理由）
- 実装 Agent への注意 1–3 行
