# プロンプト索引 — トルコ語（tr）翻訳データ作成

**実装はまだしない。** 成果物は **翻訳ドラフトファイル** のみ。Gemini に **1 波ずつ** 渡す。

## 正本（最重要）

| 使う | 使わない |
|------|----------|
| **`messages.ts` の `en` オブジェクト全体** | `ja` · `es` · `pt` · `pl` · `de` · `fr` ドラフト |
| **`howTo.ts` の `en` ブロック** | 他ロケールの Cool 軸文案のコピペ |
| **en LP の `lp*` キー**（構造・意味） | LP_COPY 決定稿を ja 経由で読む |

**矛盾したら常に `en` が勝つ。** トルコ語は **英語 UI から直接** 訳す。他ロケールは **参照禁止**（Gemini が勝手に読まないこと）。

**将来の locale コード:** `tr`（`Locale` 拡張は **実装 Agent**）

**市場:** **tr-TR 標準**（イスタンブール · 国内配信者 · diaspora も同 UI）。**Azerbaycan Türkçesi** の固有語連発 · **Osmanlıca/過度な argo** は避ける。

**戦略メモ:** 第2波 **3 位（最終）** — Watchalong · **Kadro（予想スタメン）** · X/Twitter 画像 · 軽量 UI（[`LOCALE_MARKETS.md`](LOCALE_MARKETS.md) §3-7）。**戦術解剖より「10 秒で綺麗な kadro görseli」** が LP の芯。

---

## ROLE（Gemini · 全波共通）

あなたは **ネイティブ tr-TR 話者のサッカー配信 UI 翻訳者**。英語 `en` を読んで **自然な tr** に言い換える。

| 項目 | 内容 |
|------|------|
| **読者** | watchalong 配信者 · Kadro 画像を X に載せるファン · coach（18–45 · futbol bilgili · IT 普通） |
| **翻訳元** | **英語 `en` のみ** |
| **人称** | **sen**（ボタン · hint）。過度な **siz** 敬語 · 官僚語は避ける |
| **地域** | tr-TR 標準。**TikTok argo 連発** · **Azeri 固有語**は避ける |

**自己チェック:** « Türk yayıncı canlıdan önce paneli okuyor ve **sözlüksüz** neye tıklayacağını biliyor mu? »

---

## サッカー用語（en → tr · 1 ファイル内で統一）

| 概念 | en | tr 推奨 |
|------|-----|---------|
| scene | scene | **Sahne** |
| piece | piece | **figür**（盤上）· 名簿の人 → **oyuncu** |
| roster / lineup | roster | **kadro** · **diziliş** |
| starters | starters | **ilk 11** · **as kadro** |
| bench | bench | **yedekler** · **yedek kulübesi** |
| corner | corner | **korner** |
| set piece | set piece | **duran top** · **standart**（短い UI → **duran top**） |
| press | press | **pres** · **baskı**（**1 ファイル内統一** · 推奨 **pres**） |
| pass（線種） | Pass | **Pas** |
| run | Run | **Koşu**（ツール名）· hint で **topu olmadan koşu** / **boş koşu** 可 |
| dribble | Dribble | **Dripling** |
| GK | GK | **kaleci** |
| HT | half-time | **devre arası** |
| pitch | pitch | **saha**（**çim** は prose 1 回まで · UI は **saha** 統一） |
| board（UI/LP） | board | **taktik tahtası** · **taktik tahta** | **tahta** 単独 · **kara tahta** 禁止 |
| 5 lanes / half-spaces | 5 lanes | **5 koridor**（Short）· hint で **yarı alanlar** |

**戦術語（hint · LP 本文で自然に）:** **blok** · **pres** · **duran top** · **korner** · **kontra** · **diziliş** — 造語禁止。

**ツール名:** **Pas / Koşu / Dripling** · Pen/Link/Zone → **Kalem / Bağlantı / Bölge**（1 ファイル内統一 · 推奨 **Kalem**）

**禁止:** **kara tahta** · **tahta** 単独（教室）→ **taktik tahtası** または **ZoneBoard**

---

## トルコ圏訴求（LP · hint · キー invent 禁止）

| 軸 | 方向 |
|----|------|
| **即時 · 軽量** | saniyeler içinde · tarayıcıda · ağır kurulum yok |
| **Kadro / diziliş** | **kadro** · **diziliş** · maç öncesi X görseli（`lpCanTitle` · `lpCan4` · Export 系 hint） |
| **Pas vs Koşu** | `passHint` / `runHint` / LP 本文で **Pas**（top yolu）と **Koşu**（topsuz hareket）を明確に |
| **OBS** | **pencere yakalama** — OBS 固有名詞のまま |
| **ローカル** | hesap yok · yerel kayıt（`lpCan5` · `lpBullet3`） |

**コアメッセージ参考（H1 を置き換えない）:**  
*10 saniyede harika 2D kadro görseli*

---

## 実行順

| 順 | ファイル | 出力先 |
|----|----------|--------|
| **1** | [`AGENT_PROMPT_I18N_TR_APP.md`](AGENT_PROMPT_I18N_TR_APP.md) | `docs/i18n-draft/tr/gemini-app-raw.json` · `howTo.tr.json` |
| **1b（任意）** | — | `node scripts/build-tr-app-draft.mjs` → `messages-app.tr.json` |
| **2** | [`AGENT_PROMPT_I18N_TR_LP.md`](AGENT_PROMPT_I18N_TR_LP.md) | `docs/i18n-draft/tr/messages-lp.tr.json` |
| **3（任意）** | [`AGENT_PROMPT_I18N_TR_LP_GROK_REVIEW.md`](AGENT_PROMPT_I18N_TR_LP_GROK_REVIEW.md) | `docs/i18n-draft/tr/GROK-LP-REVIEW.md` |

---

## ガードレール

| # | 悪癖 | 正しい |
|---|------|--------|
| G1 | ja/es/pt/pl/de/fr から訳す | **en のみ** |
| G2 | es Cool 軸 H1 を tr にコピー | **en `lp*` の意味を tr 化** |
| G3 | 実在クラブ/スターを placeholder に | **中立** — `EV`/`DEP` · **Hafta 1** · Yılmaz/Kaya（App 波 §プレースホルダ） |
| G4 | キー増減 | en と **完全一致** |
| G5 | `*Short` 長文化 | ~12 ラテン文字目安 |
| G6 | 実装までやる | JSON ドラフトのみ |
| G7 | Azeri / argo が混ざる | **tr-TR** チェック |
| G8 | **tahta** 単独で board | **taktik tahtası** |

---

## 実装 Agent（後日）

1. `docs/i18n-draft/tr/*.json` → `messages.ts` `tr:` マージ（`scripts/merge-locale-messages.mjs tr`）
2. `/tr/` · `?lang=tr` · `test:i18n-chrome` · `scripts/build-tr-app-draft.mjs`（fr/de 同型）
