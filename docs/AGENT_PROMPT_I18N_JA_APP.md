# 翻訳プロンプト — 日本語 · アプリ chrome（ja · リライト）

**索引:** [`AGENT_PROMPT_I18N_JA.md`](AGENT_PROMPT_I18N_JA.md)  
**ボイス:** [`docs/i18n-draft/ja/VOICE-JA.md`](i18n-draft/ja/VOICE-JA.md)

**正本: 英語 `en`（`lp*` 除く）+ VOICE-JA。**

Gemini にそのまま渡してよい。成果物は JSON のみ · コード変更禁止。

---

## 読む（この順だけ）

1. 本ファイル
2. [`VOICE-JA.md`](i18n-draft/ja/VOICE-JA.md)
3. [`src/i18n/messages.ts`](../src/i18n/messages.ts) — **`en` オブジェクト（`lp*` 除く）**
4. [`.cursor/rules/i18n-ui-guardrails.mdc`](../.cursor/rules/i18n-ui-guardrails.mdc)

**触らない:** `lp*` · FAQ/About · `howTo.ts` 長文

---

## 成果物

`docs/i18n-draft/ja/messages-app-chrome.ja.json`

優先キー群（最低限）:

- ツール hint: `passHint` · `runHint` · `dribbleHint` · `penHint` · `linkHint`
- OBS: `obs*`
- 確認: `confirm*` · `resetBoard` · `deleteHint`
- 言語: `languageHint`
- フィードバック: `feedbackHint` · `feedbackSent`
- UI 語彙: `pieceHome` · `pieceAway` · `pieceProps` · `pieceSize` — **「駒」禁止 → 選手 / 短いラベル**

---

## ルール

- **駒 → 選手**（盤上マーカー）。`pieceHome`/`pieceAway` は「ホーム」「アウェイ」で足りる
- 芝 → **ピッチ**
- Short キーは ~6 CJK · レイアウト変更禁止
- 確認ダイアログだけ「〜しますか？」可

---

## 完了報告（日本語）

- 「駒」「芝」「読み物」残件数 · Short オーバー
