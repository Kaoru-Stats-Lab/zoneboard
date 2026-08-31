# 翻訳プロンプト — ドイツ語 · アプリ UI（de · DACH · 波 1）

**索引:** [`AGENT_PROMPT_I18N_DE.md`](AGENT_PROMPT_I18N_DE.md)

**正本: 英語 `en` のみ。** `ja` · `es` · `pt` · `pl` は **読まない · 参照しない · コピーしない。**

Gemini にそのまま渡してよい。成果物は JSON のみ · コード変更禁止。

---

## 読む（この順だけ）

1. 本ファイル
2. [`src/i18n/messages.ts`](../src/i18n/messages.ts) — **`en` オブジェクト**（`lp*` 除く翻訳元）
3. [`src/i18n/howTo.ts`](../src/i18n/howTo.ts) — **`en` ブロックのみ**
4. [`.cursor/rules/i18n-ui-guardrails.mdc`](../.cursor/rules/i18n-ui-guardrails.mdc)
5. [`scripts/i18n-chrome-check.ts`](../scripts/i18n-chrome-check.ts) — Short ペア

**触らない:** `ja` · `es` · `pt` · `pl` · `docs/i18n-draft/*/` · `lp*`

---

## 成果物

### A. `docs/i18n-draft/de/messages-app.de.json`

```json
{
  "_meta": {
    "locale": "de",
    "bcp47": "de-DE",
    "source": "messages.ts en ONLY",
    "excludes": "lp*",
    "keyCount": 0
  },
  ...
}
```

- `messages.en` の全キー except `lp*`
- `openBoard` · `openBoardContinue` · `openBoardNew` を含む

### B. `docs/i18n-draft/de/howTo.de.json`

- `howTo.en` と同形
- **`keys[].combo` は英語のまま**
- `heading` · `paragraphs` · `meaning` のみ de 化

---

## 翻訳ルール

- **en の意味・役割・長さ**を保つ（ja のトーンは見ない）
- **Pass / Lauf / Dribbling** — Pass/Run/Dribble と同役割
- 配信モード B → **Sendemodus** または **Broadcast-Modus**（**1 ファイル内で統一** · 推奨 **Sendemodus**）
- OBS → **Fensteraufnahme**（Window Capture · OBS は固有名詞）
- `languageHint`: ボードメニューのみ de · 法務読み物は英語 · Spielernamen bleiben Nutzereingabe

### DACH 固有（App）

| キー群 | 注意 |
|--------|------|
| **`lanes5` / `lanes5Hint` / `lanesOff*` / `lanesOn*`** | **Halbräume / 5 Räume** — Taktik-Nerd 向けの核心機能。hint で penalty-box / centre circle の説明を de 化 |
| **局面 · 試合タブ** | **Szene** · **Spiel** / **Partie** — 1 ファイル内統一（推奨 **Szene** + **Spiel**） |
| **capture import** | **Szene importieren** · **Broadcast-Aufnahme** — 短く |
| **press / corner（lpCan 以外）** | **Pressing** · **Eckball** |

### `*Short`

~12 ラテン文字。超えたら `_shortOverflow` に列挙。

例（参考 · 短くしすぎない）:

| en Short | de 方向 |
|----------|---------|
| No lanes | **Ohne** / **Aus** |
| 5 lanes | **5 Räume** |
| Broadcast | **Live** / **Sendung** |

### プレースホルダ（中立 · 全言語共通）

**実在クラブ（BVB, FCB, HSV…）・リーグ名（Bundesliga 固有表現）・スター（Musiala, Kane…）は禁止。**

| 用途 | 例 |
|------|-----|
| チーム | `HOM` / `AWY` または `HEIM` / `AUSW` |
| リーグ/節 | `Spieltag 1` · `Runde 1` |
| 選手姓 | `Müller` · `Schmidt` · `Schneider`（hint/parseFail も同じ姓） |

`rosterPlaceholder*` → 改行は `\n` 1 文字列（例: `"10,Müller,R\n7,Schmidt\n4,Schneider\n11,Weber,L"`）

---

## やってはいけない

- ja/es/pt/pl を入力に使う
- `messages.ts` / `howTo.ts` を編集
- `lp*` を含める
- キー名変更 · combo 変更
- **Schultafel / Tafel** で board を訳す

---

## 検証

- [ ] ソースは **en のみ**（`_meta.source` に明記）
- [ ] lp キー 0
- [ ] en 非 lp キー数と **完全一致**
- [ ] howTo 5 セクション · combo 不変
- [ ] JSON valid · `\n` placeholder 正しい
- [ ] `lanes5Hint` に Halbraum/ Halbräume の説明がある

---

## 完了報告（日本語）

- パス · キー数 · Short オーバー · en から判断が分かった語 3 件以内
- **Sendemodus vs Broadcast-Modus** · **Taktikboard vs Taktiktafel** の統一選択
- de-DE っぽい揺れ（Schweizer/Austrianismen）が無いか
