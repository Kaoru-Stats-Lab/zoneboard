# プロンプト索引 — ポーランド語（pl）翻訳データ作成

**実装はまだしない。** 成果物は **翻訳ドラフトファイル** のみ。Gemini に **1 波ずつ** 渡す。

## 正本（最重要）

| 使う | 使わない |
|------|----------|
| **`messages.ts` の `en` オブジェクト全体** | `ja` · `es` · `pt` ドラフト |
| **`howTo.ts` の `en` ブロック** | es/pt の Cool 軸文案のコピペ |
| **en LP の `lp*` キー**（構造・意味） | LP_COPY 決定稿を ja 経由で読む |

**矛盾したら常に `en` が勝つ。** ポーランド語は **英語 UI から直接** 訳す。日本語・スペイン語・ポルトガル語は **参照禁止**（Gemini が勝手に読まないこと）。

**将来の locale コード:** `pl`（`Locale` 拡張は **実装 Agent**）

**市場:** ポーランド（**pl** 一本）。チェコ語等は Later。

**戦略メモ:** 人口は fr より小さいが **未ローカライズ niche への感謝度** を優先（[`LOCALE_MARKETS.md`](LOCALE_MARKETS.md) §3-6）。**fr は pl の後。**

---

## ROLE（Gemini · 全波共通）

あなたは **ネイティブポーランド語話者のサッカー配信 UI 翻訳者**。英語 `en` を読んで **自然な pl** に言い換える。

| 項目 | 内容 |
|------|------|
| **読者** | watchalong 配信者 · コーチ · 解説者（18–45 · サッカー詳しい · IT 普通） |
| **翻訳元** | **英語 `en` のみ** |
| **人称** | **ty**（ボタン · hint）。過度な Pan/Pani 敬語は避ける |
| **地域** | ポーランド標準。**若者配信用スラングの連発**は避ける |

**自己チェック:** 「Polski streamer czyta panel przed live i **bez słownika** wie, co kliknąć?」

---

## サッカー用語（en → pl · 1 ファイル内で統一）

| 概念 | en | pl 推奨 |
|------|-----|---------|
| scene | scene | **scena** |
| piece | piece | **figurka** |
| roster / lineup | roster | **skład** · **skład wyjściowy** |
| starters | starters | **podstawowy skład** / **wyjściowa jedenastka** |
| bench | bench | **ławka** · **rezerwowi** |
| corner | corner | **rzut rożny**（短い UI → **rożny** 可） |
| set piece | set piece | **stały fragment** |
| press | press | **pressing** / **presja** |
| pass（線種） | Pass | **Podanie** |
| run | Run | **Bieg** |
| dribble | Dribble | **Drybling** |
| GK | GK | **bramkarz** |
| HT | half-time | **przerwa** |
| pitch | pitch | **boisko** |
| board（UI/LP） | board | **plansza** | **tablica**（教室）禁止 |

**ツール名:** **Podanie / Bieg / Drybling** · Pen/Link/Zone → **Pióro / Połączenie / Strefa**（1 ファイル内統一）

**禁止:** **tablica szkolna** · **tablica** 単独（教室連想）→ **plansza** または **ZoneBoard**

---

## 実行順

| 順 | ファイル | 出力先 |
|----|----------|--------|
| **1** | [`AGENT_PROMPT_I18N_PL_APP.md`](AGENT_PROMPT_I18N_PL_APP.md) | `docs/i18n-draft/pl/messages-app.pl.json` · `howTo.pl.json` |
| **2** | [`AGENT_PROMPT_I18N_PL_LP.md`](AGENT_PROMPT_I18N_PL_LP.md) | `docs/i18n-draft/pl/messages-lp.pl.json` |
| **3（任意）** | [`AGENT_PROMPT_I18N_PL_LP_GROK_REVIEW.md`](AGENT_PROMPT_I18N_PL_LP_GROK_REVIEW.md) | `docs/i18n-draft/pl/GROK-LP-REVIEW.md` |

---

## ガードレール

| # | 悪癖 | 正しい |
|---|------|--------|
| G1 | ja/es/pt から訳す | **en のみ** |
| G2 | es Cool 軸 H1 を pl にコピー | **en `lp*` の意味を pl 化** |
| G3 | キー増減 | en と **完全一致** |
| G4 | `*Short` 長文化 | ~12 ラテン文字目安 |
| G5 | 実装までやる | JSON ドラフトのみ |

---

## 実装 Agent（後日）

1. `docs/i18n-draft/pl/*.json` → `messages.ts` `pl:` マージ
2. `/pl/` · `?lang=pl` · `test:i18n-chrome`
