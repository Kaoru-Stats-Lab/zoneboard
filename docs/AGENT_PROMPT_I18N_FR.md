# プロンプト索引 — フランス語（fr）翻訳データ作成

**実装はまだしない。** 成果物は **翻訳ドラフトファイル** のみ。Gemini に **1 波ずつ** 渡す。

## 正本（最重要）

| 使う | 使わない |
|------|----------|
| **`messages.ts` の `en` オブジェクト全体** | `ja` · `es` · `pt` · `pl` · `de` ドラフト |
| **`howTo.ts` の `en` ブロック** | 他ロケールの Cool 軸文案のコピペ |
| **en LP の `lp*` キー**（構造・意味） | LP_COPY 決定稿を ja 経由で読む |

**矛盾したら常に `en` が勝つ。** フランス語は **英語 UI から直接** 訳す。他ロケールは **参照禁止**（Gemini が勝手に読まないこと）。

**将来の locale コード:** `fr`（`Locale` 拡張は **実装 Agent**）

**市場:** **fr-FR 標準**（フランス · ベルギー · スイス仏語圏 · アフリカ仏語圏の配信者も同 UI）。**fr-CA / québécismes** の連発は避ける。

**戦略メモ:** 第2波 **2 位** — Wiloo / Le Coach 等の戦術 YouTube · Play-by-Play · Pass vs **appel de balle**（[`LOCALE_MARKETS.md`](LOCALE_MARKETS.md) §3-7）。

---

## ROLE（Gemini · 全波共通）

あなたは **ネイティブ fr-FR 話者のサッカー配信 UI 翻訳者**。英語 `en` を読んで **自然な fr** に言い換える。

| 項目 | 内容 |
|------|------|
| **読者** | watchalong 配信者 · 戦術 YouTuber · coach（18–45 · foot 詳しい · IT 普通） |
| **翻訳元** | **英語 `en` のみ** |
| **人称** | **tu**（ボタン · hint）。過度な **vous** 敬語は避ける |
| **地域** | fr-FR 標準。**argot TikTok 連発** · **fr-CA 固有語**は避ける |

**自己チェック:** « Un streamer français lit le panneau avant le live et sait **sans dictionnaire** quoi cliquer ? »

---

## サッカー用語（en → fr · 1 ファイル内で統一）

| 概念 | en | fr 推奨 |
|------|-----|---------|
| scene | scene | **scène** |
| piece | piece | **figurine**（盤上）· 名簿の人 → **joueur** |
| roster / lineup | roster | **effectif** · **composition** |
| starters | starters | **titulaires** |
| bench | bench | **banc** · **remplaçants** |
| corner | corner | **corner**（実況語 · UI 短い） |
| set piece | set piece | **coup de pied arrêté** · **phase arrêtée**（短い UI → **CPA** 可） |
| press | press | **pressing** |
| pass（線種） | Pass | **Passe** |
| run | Run | **Course**（ツール名）· hint で **appel de balle** 可 |
| dribble | Dribble | **Dribble** |
| GK | GK | **gardien** |
| HT | half-time | **mi-temps** |
| pitch | pitch | **terrain**（**pelouse** は prose 1 回まで · UI は **terrain** 統一） |
| board（UI/LP） | board | **tableau tactique** | **tableau** 単独 · **tableau noir** 禁止 |
| 5 lanes / half-spaces | 5 lanes | **5 couloirs**（Short）· hint で **demi-espaces** |

**戦術語（hint · LP 本文で自然に）:** **bloc bas** · **bloc haut** · **relance** · **coup franc** · **appel de balle** · **pressing** — 造語禁止。

**ツール名:** **Passe / Course / Dribble** · Pen/Link/Zone → **Stylo / Lien / Zone**（1 ファイル内統一 · 推奨 **Stylo**）

**禁止:** **tableau noir** · **tableau** 単独（教室）→ **tableau tactique** または **ZoneBoard**

---

## 仏語圏訴求（LP · hint · キー invent 禁止）

| 軸 | 方向 |
|----|------|
| **即時** | instantané · dans le navigateur · en 3 secondes |
| **débrief / live** | débriefs · directs · watchalong |
| **Pass vs Course** | `passHint` / `runHint` / LP 本文で **Passe**（ballon）と **Course**（sans ballon / appel de balle）を明確に |
| **OBS** | **capture de fenêtre** — OBS 固有名詞のまま |
| **ローカル** | pas de compte · enregistré localement（`lpCan5` · `lpBullet3`） |

**コアメッセージ参考（H1 を置き換えない）:**  
*Le tableau tactique instantané pour tes débriefs et live streams*

---

## 実行順

| 順 | ファイル | 出力先 |
|----|----------|--------|
| **1** | [`AGENT_PROMPT_I18N_FR_APP.md`](AGENT_PROMPT_I18N_FR_APP.md) | `docs/i18n-draft/fr/messages-app.fr.json` · `howTo.fr.json` |
| **2** | [`AGENT_PROMPT_I18N_FR_LP.md`](AGENT_PROMPT_I18N_FR_LP.md) | `docs/i18n-draft/fr/messages-lp.fr.json` |
| **3（任意）** | [`AGENT_PROMPT_I18N_FR_LP_GROK_REVIEW.md`](AGENT_PROMPT_I18N_FR_LP_GROK_REVIEW.md) | `docs/i18n-draft/fr/GROK-LP-REVIEW.md` |

---

## ガードレール

| # | 悪癖 | 正しい |
|---|------|--------|
| G1 | ja/es/pt/pl/de から訳す | **en のみ** |
| G2 | es Cool 軸 H1 を fr にコピー | **en `lp*` の意味を fr 化** |
| G3 | 実在クラブ/スターを placeholder に | **中立** — `LOC`/`VIS` · `Journée 1` · Martin/Bernard（App 波 §プレースホルダ） |
| G4 | キー増減 | en と **完全一致** |
| G5 | `*Short` 長文化 | ~12 ラテン文字目安 |
| G6 | 実装までやる | JSON ドラフトのみ |
| G7 | fr-CA が混ざる | **fr-FR** チェック |
| G8 | **tableau** 単独で board | **tableau tactique** |

---

## 実装 Agent（後日）

1. `docs/i18n-draft/fr/*.json` → `messages.ts` `fr:` マージ（`scripts/merge-locale-messages.mjs fr`）
2. `/fr/` · `?lang=fr` · `test:i18n-chrome` · `scripts/build-fr-app-draft.mjs`（de 同型）
