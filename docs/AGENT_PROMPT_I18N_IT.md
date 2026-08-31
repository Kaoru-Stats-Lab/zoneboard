# プロンプト索引 — イタリア語（it）翻訳データ作成

**実装はまだしない。** 成果物は **翻訳ドラフトファイル** のみ。Gemini に **1 波ずつ** 渡す。

## 正本（最重要）

| 使う | 使わない |
|------|----------|
| **`messages.ts` の `en` オブジェクト全体** | `ja` · `es` · `pt` · `pl` · `de` · `fr` · `tr` ドラフト |
| **`howTo.ts` の `en` ブロック** | 他ロケールの Cool 軸文案のコピペ |
| **en LP の `lp*` キー**（構造・意味） | LP_COPY 決定稿を ja 経由で読む |

**矛盾したら常に `en` が勝つ。** イタリア語は **英語 UI から直接** 訳す。他ロケールは **参照禁止**（Gemini が勝手に読まないこと）。

**将来の locale コード:** `it`（`Locale` 拡張は **実装 Agent**）

**市場:** **it-IT 標準**（イタリア · 海外カルチョ・コミュニティ）。**dialetto 連発** · **it-CH 固有語**は避ける。

**戦略メモ:** 第3波 **1 位** — Match Analysis · **lavagna tattica** · Alesia / MatchStudio 層（[`LOCALE_MARKETS.md`](LOCALE_MARKETS.md) §3-8）。

---

## ROLE（Gemini · 全波共通）

あなたは **ネイティブ it-IT 話者のサッカー配信 UI 翻訳者**。英語 `en` を読んで **自然な it** に言い換える。

| 項目 | 内容 |
|------|------|
| **読者** | watchalong 配信者 · 戦術 YouTuber · coach（18–45 · calcio · IT 普通） |
| **翻訳元** | **英語 `en` のみ** |
| **人称** | **tu**（ボタン · hint）。過度な **Lei** 敬語は避ける |
| **地域** | it-IT 標準 |

**自己チェック:** « Uno streamer italiano legge il pannello prima della live e sa **senza dizionario** cosa cliccare? »

---

## サッカー用語（en → it · 1 ファイル内で統一）

| 概念 | en | it 推奨 |
|------|-----|---------|
| scene | scene | **Scena** |
| piece | piece | **pedina**（盤上）· 名簿の人 → **giocatore** |
| roster / lineup | roster | **rosa** · **formazione** |
| starters | starters | **titolari** |
| bench | bench | **panchina** · **riserve** |
| corner | corner | **corner** |
| set piece | set piece | **palla inattiva** · **calcio piazzato**（短い UI → **palla inattiva**） |
| press | press | **pressing** |
| pass（線種） | Pass | **Passaggio** |
| run | Run | **Corsa**（ツール名）· hint で **movimento senza palla** 可 |
| dribble | Dribble | **Dribbling** |
| GK | GK | **portiere** |
| HT | half-time | **intervallo** |
| pitch | pitch | **campo**（**prato** は prose 1 回まで · UI は **campo** 統一） |
| board（UI/LP） | board | **lavagna tattica** | **lavagna** 単独 · **lavagna della scuola** 禁止 |
| 5 lanes / half-spaces | 5 lanes | **5 corridoi**（Short）· hint で **half-space / tra le linee** |

**戦術語（hint · LP 本文で自然に）:** **Costruzione dal basso** · **Braccetto** · **Tra le linee** · **Blocco basso/alto** · **Pressione alta** · **Sottopunta** — 造語禁止。

**ツール名:** **Passaggio / Corsa / Dribbling** · Pen/Link/Zone → **Pennello / Collegamento / Zona**（1 ファイル内統一 · 推奨 **Pennello**）

**禁止:** **lavagna** 単独（教室）→ **lavagna tattica** または **ZoneBoard**

---

## イタリア圏訴求（LP · hint · キー invent 禁止）

| 軸 | 方向 |
|----|------|
| **即時 · broadcast** | istantanea · nel browser · qualità broadcast |
| **Match Analysis** | video · live stream · debrief · **Struttura / Fase** |
| **Passaggio vs Corsa** | `passHint` / `runHint` / LP 本文で明確に |
| **OBS** | **cattura finestra** — OBS 固有名詞のまま |
| **ローカル** | zero registrazioni · salvato in locale（`lpCan5` · `lpBullet3`） |

**コアメッセージ参考（H1 を置き換えない）:**  
*La lavagna tattica 2D più veloce per i tuoi video e live stream — Zero registrazioni, qualità broadcast*

---

## 実行順

| 順 | ファイル | 出力先 |
|----|----------|--------|
| **1** | [`AGENT_PROMPT_I18N_IT_APP.md`](AGENT_PROMPT_I18N_IT_APP.md) | `docs/i18n-draft/it/gemini-app-raw.json` · `howTo.it.json` |
| **1b（任意）** | — | `node scripts/build-it-app-draft.mjs` → `messages-app.it.json` |
| **2** | [`AGENT_PROMPT_I18N_IT_LP.md`](AGENT_PROMPT_I18N_IT_LP.md) | `docs/i18n-draft/it/messages-lp.it.json` |
| **3（任意）** | [`AGENT_PROMPT_I18N_IT_APP_GROK_REVIEW.md`](AGENT_PROMPT_I18N_IT_APP_GROK_REVIEW.md) | `docs/i18n-draft/it/GROK-APP-REVIEW.md` |
| **4（任意）** | [`AGENT_PROMPT_I18N_IT_LP_GROK_REVIEW.md`](AGENT_PROMPT_I18N_IT_LP_GROK_REVIEW.md) | `docs/i18n-draft/it/GROK-LP-REVIEW.md` |

---

## ガードレール

| # | 悪癖 | 正しい |
|---|------|--------|
| G1 | 他ロケールから訳す | **en のみ** |
| G2 | es Cool 軸 H1 を it にコピー | **en `lp*` の意味を it 化** |
| G3 | 実在クラブ/スターを placeholder に | **中立** — `CAS`/`TRAS` · **Giornata 1** · Rossi/Bianchi（App 波 §プレースホルダ） |
| G4 | キー増減 | en と **完全一致** |
| G5 | `*Short` 長文化 | ~12 ラテン文字目安 |
| G6 | 実装までやる | JSON ドラフトのみ |
| G7 | dialetto が混ざる | **it-IT** チェック |
| G8 | **lavagna** 単独で board | **lavagna tattica** |

---

## 実装 Agent（後日）

1. `docs/i18n-draft/it/*.json` → `messages.ts` `it:` マージ（`scripts/merge-locale-messages.mjs it`）
2. `/it/` · `?lang=it` · `test:i18n-chrome` · `scripts/build-it-app-draft.mjs`（de/fr/tr 同型）
