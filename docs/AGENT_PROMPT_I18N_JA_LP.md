# 翻訳プロンプト — 日本語 · LP（ja · リライト）

**索引:** [`AGENT_PROMPT_I18N_JA.md`](AGENT_PROMPT_I18N_JA.md)  
**ボイス:** [`docs/i18n-draft/ja/VOICE-JA.md`](i18n-draft/ja/VOICE-JA.md)

**正本: 英語 `en` の `lp*` + VOICE-JA。** 他ロケールは参照禁止。

Gemini にそのまま渡してよい。成果物は JSON のみ · コード変更禁止。

---

## 読む（この順だけ）

1. 本ファイル
2. [`VOICE-JA.md`](i18n-draft/ja/VOICE-JA.md)
3. [`src/i18n/messages.ts`](../src/i18n/messages.ts) — **`en` の `lp*` / `tagline` / `openBoard*` のみ**
4. （参考）現行 `ja` の同キー — **悪い例**として「何を直すか」把握。コピーしない

---

## 成果物

`docs/i18n-draft/ja/messages-lp.ja.json`

- `_meta` 可
- キー: `tagline` · `openBoard` · `openBoardContinue` · `openBoardNew` · `lpSavedHint` · 全 `lp*`（空文字キーは空のまま）

---

## ルール

- 常体 · 短文 · 声に出して 15 秒
- **禁止:** ウォッチアロング · 芝 · 読み物 · ローカル保存 · 「〜を足す」直訳連発
- **推奨:** 試合配信 · ピッチ · アカウント不要 · UI は隠す · OBS

---

## 完了報告（日本語）

- キー数 · H1+payoff の読み上げ秒数 · カタカナ連続チェック
