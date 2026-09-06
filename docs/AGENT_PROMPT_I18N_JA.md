# プロンプト索引 — 日本語（ja）文案リライト

**目的:** 既存 `messages.ts` の `ja` を **配信者向け自然語** に刷新。新 locale 追加ではない。

**正本:** 英語 `en`（意味）+ [`VOICE-JA.md`](i18n-draft/ja/VOICE-JA.md)（トーン）

**触らない（Pending）:** `siteNavI18n` の About/FAQ · `howTo.ts` 長文 · 読み物 HTML

---

## パイプライン

| 順 | 担当 | 出力 |
|----|------|------|
| 1 | **Gemini** ← APP/LP プロンプト | `docs/i18n-draft/ja/messages-app-chrome.ja.json` · `messages-lp.ja.json` |
| 2 | **Grok** ← GROK レビュー | `GROK-LP-REVIEW.md` · `GROK-APP-REVIEW.md` |
| 3 | **カオル** | top-10 手修正 |
| 4 | **Cursor** | `messages.ts` 反映 · `test:i18n-chrome` |

**非推奨:** Cursor Auto 単独 · Gemini 最終稿単独（[`DEVELOPER_STORY.md`](DEVELOPER_STORY.md) §AI）

---

## スコープ（オプション 3）

| 面 | 対象 |
|----|------|
| A | `lp*` · `tagline` · `openBoard*` |
| B | `localePublicCopy.ts` · `consentCopy.ts` |
| C | App chrome（`lp*` 除く `ja` 全キー）— hint · OBS · ツール · 確認 |

---

## ファイル

| ファイル | 用途 |
|----------|------|
| [`VOICE-JA.md`](i18n-draft/ja/VOICE-JA.md) | トーン正本 |
| [`AGENT_PROMPT_I18N_JA_LP.md`](AGENT_PROMPT_I18N_JA_LP.md) | Gemini · LP |
| [`AGENT_PROMPT_I18N_JA_APP.md`](AGENT_PROMPT_I18N_JA_APP.md) | Gemini · App chrome |
| [`AGENT_PROMPT_I18N_JA_LP_GROK_REVIEW.md`](AGENT_PROMPT_I18N_JA_LP_GROK_REVIEW.md) | Grok · LP（索引） |
| [`AGENT_PROMPT_I18N_JA_APP_GROK_REVIEW.md`](AGENT_PROMPT_I18N_JA_APP_GROK_REVIEW.md) | Grok · App（索引） |
| **[`GROK-LP-PASTE.md`](i18n-draft/ja/GROK-LP-PASTE.md)** | **Grok に全文コピペ（LP）** |
| **[`GROK-APP-PASTE.md`](i18n-draft/ja/GROK-APP-PASTE.md)** | **Grok に全文コピペ（App+公開）** |
| [`JA-COPY-REWRITE-LOG.md`](i18n-draft/ja/JA-COPY-REWRITE-LOG.md) | 実装ログ |

---

## ガードレール

| # | 悪癖 | 正しい |
|---|------|--------|
| G1 | 他ロケールから訳す | **en + VOICE-JA** |
| G2 | 駒 · 読み物ページ · ローカル保存 | VOICE-JA 語彙 |
| G3 | Short 長文化 | ~6 CJK · `test:i18n-chrome` |
| G4 | FAQ/About ラベル変更 | **Pending** |
