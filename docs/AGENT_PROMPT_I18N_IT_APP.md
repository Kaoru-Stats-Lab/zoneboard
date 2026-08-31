# 翻訳プロンプト — イタリア語 · アプリ UI（it · 波 1）

**索引:** [`AGENT_PROMPT_I18N_IT.md`](AGENT_PROMPT_I18N_IT.md)

**正本: 英語 `en` のみ。** 他ロケールドラフトは **読まない · 参照しない · コピーしない。**

Gemini にそのまま渡してよい。成果物は JSON のみ · コード変更禁止。

---

## 読む（この順だけ）

1. 本ファイル
2. [`src/i18n/messages.ts`](../src/i18n/messages.ts) — **`en` オブジェクト**（`lp*` 除く）
3. [`src/i18n/howTo.ts`](../src/i18n/howTo.ts) — **`en` ブロックのみ**
4. [`.cursor/rules/i18n-ui-guardrails.mdc`](../.cursor/rules/i18n-ui-guardrails.mdc)
5. [`scripts/i18n-chrome-check.ts`](../scripts/i18n-chrome-check.ts)

**触らない:** 他ロケール · `lp*`

---

## 成果物

### A. `docs/i18n-draft/it/gemini-app-raw.json`

フラット JSON（`_meta` なし）。`messages.en` 全キー except `lp*`。

完了後: `node scripts/build-it-app-draft.mjs` → `messages-app.it.json`

### B. `docs/i18n-draft/it/howTo.it.json`

- `howTo.en` と同形 · **`keys[].combo` は英語のまま**

---

## 翻訳ルール

- **Passaggio / Corsa / Dribbling** — Pass/Run/Dribble と同役割
- 配信モード B → **modalità diretta**（1 ファイル内統一）
- OBS → **cattura finestra**

### イタリア圏固有（App）

| キー群 | 注意 |
|--------|------|
| **`passHint` / `runHint` / `dribbleHint`** | **Passaggio** = traiettoria palla · **Corsa** = senza palla · **Dribbling** = con palla |
| **`lanes5` / `lanes5Hint`** | **5 corridoi** · hint で **tra le linee** / half-space |
| **局面 · 試合** | **Scena** · **Partita** — 統一 |
| **roster 系** | **rosa** · **titolari** · **formazione** |

### プレースホルダ

**Serie A / Juve / Inter / Milan / star names 禁止。**

| 用途 | 例 |
|------|-----|
| チーム | `CAS` / `TRAS` |
| 節 | **Giornata 1** |
| 姓 | **Rossi** · **Bianchi** · **Romano** · **Ferrari** |

`rosterPlaceholder*`: `"10,Rossi,P\n7,Bianchi\n4,Romano\n11,Ferrari,P"`

---

## 検証

- [ ] en 非 lp キー数一致 · lp 0 · howTo combo 不変 · JSON valid

---

## 完了報告（日本語）

- キー数 · Short オーバー · **lavagna tattica** · Passaggio/Corsa 統一
