# 翻訳プロンプト — ポーランド語 · アプリ UI（pl · 波 1）

**索引:** [`AGENT_PROMPT_I18N_PL.md`](AGENT_PROMPT_I18N_PL.md)

**正本: 英語 `en` のみ。** `ja` · `es` · `pt` は **読まない · 参照しない · コピーしない。**

Gemini にそのまま渡してよい。成果物は JSON のみ · コード変更禁止。

---

## 読む（この順だけ）

1. 本ファイル
2. [`src/i18n/messages.ts`](../src/i18n/messages.ts) — **`en` オブジェクト**（`lp*` 除く翻訳元）
3. [`src/i18n/howTo.ts`](../src/i18n/howTo.ts) — **`en` ブロックのみ**
4. [`.cursor/rules/i18n-ui-guardrails.mdc`](../.cursor/rules/i18n-ui-guardrails.mdc)
5. [`scripts/i18n-chrome-check.ts`](../scripts/i18n-chrome-check.ts) — Short ペア

**触らない:** `ja` · `es` · `pt` · `docs/i18n-draft/es/` · `docs/i18n-draft/pt/` · `lp*`

---

## 成果物

### A. `docs/i18n-draft/pl/messages-app.pl.json`

```json
{
  "_meta": {
    "locale": "pl",
    "source": "messages.ts en ONLY",
    "excludes": "lp*",
    "keyCount": 0
  },
  ...
}
```

- `messages.en` の全キー except `lp*`
- `openBoard` · `openBoardContinue` · `openBoardNew` を含む

### B. `docs/i18n-draft/pl/howTo.pl.json`

- `howTo.en` と同形
- **`keys[].combo` は英語のまま**
- `heading` · `paragraphs` · `meaning` のみ pl 化

---

## 翻訳ルール

- **en の意味・役割・長さ**を保つ（ja のトーンは見ない）
- **Podanie / Bieg / Drybling** — Pass/Run/Dribble と同役割
- **modo emisión 等の es 語彙を流用しない**
- 配信モード B → **tryb transmisji** または **na żywo**（**1 ファイル内で統一**）
- OBS → **Przechwytywanie okna**（Window Capture）
- `rosterPlaceholder*` → 改行は `\n` 1 文字列（例: `"10,Kowalski,R\n7,Nowak\n4,Wiśniewski\n11,Lewandowski,L"`）
- `languageHint`: ボードメニューのみ pl · 法務読み物は英語 · figurki 名はユーザー入力のまま

### `*Short`

~12 ラテン文字。超えたら `_shortOverflow` に列挙。

---

## やってはいけない

- ja/es/pt を入力に使う
- `messages.ts` / `howTo.ts` を編集
- `lp*` を含める
- キー名変更 · combo 変更

---

## 検証

- [ ] ソースは **en のみ**（`_meta.source` に明記）
- [ ] lp キー 0
- [ ] 523 キー一致
- [ ] howTo 5 セクション · combo 不変
- [ ] JSON valid · `\n` placeholder 正しい

---

## 完了報告（日本語）

- パス · キー数 · Short オーバー · en から判断が分かった語 3 件以内
