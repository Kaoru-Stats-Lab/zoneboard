# プロンプト索引 — ドイツ語（de · DACH）翻訳データ作成

**実装はまだしない。** 成果物は **翻訳ドラフトファイル** のみ。Gemini に **1 波ずつ** 渡す。

## 正本（最重要）

| 使う | 使わない |
|------|----------|
| **`messages.ts` の `en` オブジェクト全体** | `ja` · `es` · `pt` · `pl` ドラフト |
| **`howTo.ts` の `en` ブロック** | 他ロケールの Cool 軸文案のコピペ |
| **en LP の `lp*` キー**（構造・意味） | LP_COPY 決定稿を ja 経由で読む |

**矛盾したら常に `en` が勝つ。** ドイツ語は **英語 UI から直接** 訳す。日本語・スペイン語・ポルトガル語・ポーランド語は **参照禁止**（Gemini が勝手に読まないこと）。

**将来の locale コード:** `de`（`Locale` 拡張は **実装 Agent**）

**市場:** **DACH**（ドイツ · オーストリア · スイス）— **de-DE 標準** Hochdeutsch 一本。独語以外の正書法（ß/ss 揺れは **de-DE** に統一）。

**戦略メモ:** 第2波 **1 位** — Taktik-Nerd 文化 · Halbraum · 軽量ブラウザ · ローカル/アカウント不要（[`LOCALE_MARKETS.md`](LOCALE_MARKETS.md) §3-7）。

---

## ROLE（Gemini · 全波共通）

あなたは **ネイティブ DACH ドイツ語話者のサッカー配信 UI 翻訳者**。英語 `en` を読んで **自然な de** に言い換える。

| 項目 | 内容 |
|------|------|
| **読者** | Watchalong 配信者 · Taktik-YouTuber · コーチ（18–45 · サッカー詳しい · IT 普通） |
| **翻訳元** | **英語 `en` のみ** |
| **人称** | **du**（ボタン · hint）。過度な Sie 敬語は避ける |
| **地域** | DACH 共通。**Schweizerdeutsch / オーストリア限定スラング**の連発は避ける |

**自己チェック:** 「Deutscher Streamer liest das Panel vor dem Live und weiß **ohne Wörterbuch**, was er als Nächstes klickt?」

---

## サッカー用語（en → de · 1 ファイル内で統一）

| 概念 | en | de 推奨 |
|------|-----|---------|
| scene | scene | **Szene** |
| piece | piece | **Figur**（盤上）· 名簿の人 → **Spieler** |
| roster / lineup | roster | **Kader** · **Aufstellung** |
| starters | starters | **Startelf** |
| bench | bench | **Bank** · **Ersatzbank** |
| corner | corner | **Eckball**（短い UI → **Ecke** 可） |
| set piece | set piece | **Standardsituation** |
| press | press | **Pressing** |
| pass（線種） | Pass | **Pass** |
| run | Run | **Lauf** |
| dribble | Dribble | **Dribbling** |
| GK | GK | **Torwart** |
| HT | half-time | **Halbzeit** |
| pitch | pitch | **Spielfeld**（**Rasen** は prose 1 回まで · UI は **Spielfeld** 統一） |
| board（UI/LP） | board | **Taktikboard** / **Taktiktafel** | **Schultafel / Tafel** 単独禁止 |
| half-spaces / 5 lanes | 5 lanes | **5 Räume**（Short）· hint で **Halbräume** 明示 |

**戦術語（hint · LP 本文で自然に使ってよい）:** **Halbraum** · **Gegenpressing** · **Restverteidigung** · **Abwehrkette** · **Pressingfalle** — 造語禁止 · 実在の分析用語のみ。

**ツール名:** **Pass / Lauf / Dribbling** · Pen/Link/Zone → **Stift / Verbindung / Zone**（1 ファイル内統一 · 推奨 **Stift**）

**禁止:** **Schultafel** · **Tafel** 単独（教室連想）→ **Taktikboard** · **Taktiktafel** または **ZoneBoard**

---

## DACH 訴求（LP · hint で活かす · キー invent 禁止）

| 軸 | 方向 |
|----|------|
| **速度** | Browser · sofort starten · keine schwere Desktop-Suite |
| **プライバシー** | Kein Account · lokal gespeichert · **keine Server-Übertragung deiner Boards**（過度な DSGVO 法律文案は書かない） |
| **Halbraum** | `lanes5` / `lanes5Hint` で **Halbräume** を前面に（製品機能と一致） |
| **OBS** | **Fensteraufnahme**（Window Capture）— OBS は固有名詞のまま |

---

## 実行順

| 順 | ファイル | 出力先 |
|----|----------|--------|
| **1** | [`AGENT_PROMPT_I18N_DE_APP.md`](AGENT_PROMPT_I18N_DE_APP.md) | `docs/i18n-draft/de/messages-app.de.json` · `howTo.de.json` |
| **2** | [`AGENT_PROMPT_I18N_DE_LP.md`](AGENT_PROMPT_I18N_DE_LP.md) | `docs/i18n-draft/de/messages-lp.de.json` |
| **3（任意）** | [`AGENT_PROMPT_I18N_DE_LP_GROK_REVIEW.md`](AGENT_PROMPT_I18N_DE_LP_GROK_REVIEW.md) | `docs/i18n-draft/de/GROK-LP-REVIEW.md` |

---

## ガードレール

| # | 悪癖 | 正しい |
|---|------|--------|
| G1 | ja/es/pt/pl から訳す | **en のみ** |
| G2 | es Cool 軸 H1 を de にコピー | **en `lp*` の意味を de 化**（DACH 訴求は自然な範囲で上乗せ） |
| G3 | 実在クラブ/スターを placeholder に | **中立** — `HOM`/`AWY` · `Spieltag 1` · Müller/Schmidt（App 波 §プレースホルダ） |
| G4 | キー増減 | en と **完全一致** |
| G5 | `*Short` 長文化 | ~12 ラテン文字目安 |
| G6 | 実装までやる | JSON ドラフトのみ |
| G7 | pt-PT / 独語以外が混ざる | **de-DE** チェック |
| G8 | **Tafel** で board を訳す | **Taktikboard / Taktiktafel** |

---

## 実装 Agent（後日）

1. `docs/i18n-draft/de/*.json` → `messages.ts` `de:` マージ（`scripts/merge-locale-messages.mjs de`）
2. `/de/` · `?lang=de` · `test:i18n-chrome` · LP で Halbraum 訴求
