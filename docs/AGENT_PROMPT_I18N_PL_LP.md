# 翻訳プロンプト — ポーランド語 · LP（pl · 波 2）

**索引:** [`AGENT_PROMPT_I18N_PL.md`](AGENT_PROMPT_I18N_PL.md)  
**前提:** 波 1 と **別セッション**

## 正本: 英語 `en` の `lp*` のみ

- [`src/i18n/messages.ts`](../src/i18n/messages.ts) の **`en` LP キー**を翻訳する
- **es / pt の Cool 軸文案は使わない**（H1 を es から持ってこない）
- [`docs/LP_COPY.md`](../LP_COPY.md) — **何を書かないか** のルールのみ（文案の正本は en）

Gemini にそのまま渡してよい。JSON のみ · コード変更禁止。

---

## en LP（翻訳元 · この意味を pl 化）

```text
lpHeadline1: Add a football tactics board to tonight's OBS show.
lpHeadline2: Hide the tools. Capture only the pitch.
lpPayoff: Your cam and chat stay in OBS — not on this board.
lpLede: No account. Open in the browser. Window-capture in OBS.
lpHeroCaption: (en 本番キーを messages.ts から読む)
lpPromise1Title: Place
lpPromise2Title: Draw
lpPromise3Title: Show
lpPromise3Body: Press B. Your OBS layout stays the same.
```

**注意:** en 本番は **OBS 仕事ベース**（es の「campo a pantalla llena」型ではない）。**en を忠実に pl 化**する。Grok レビューで Cool 寄せを検討するのは **後段**。

---

## 読む

1. 本ファイル
2. `messages.ts` — **`en` の `lp*` + 共有 4 キー**
3. [`docs/LP_COPY.md`](../LP_COPY.md) · [`LP_STRUCTURE.md`](../LP_STRUCTURE.md)
4. 波 1: `docs/i18n-draft/pl/messages-app.pl.json` の `openBoard*` — **同じ訳を LP にコピー**

**触らない:** `ja` · `es` · `pt` ドラフト · App 非 lp キー

---

## 成果物

`docs/i18n-draft/pl/messages-lp.pl.json`

- en の lp* 全キー + `openBoard` · `openBoardContinue` · `openBoardNew` · `brand`
- `_meta.source`: `"messages.ts en lp* ONLY"`

---

## コピールール

| en 概念 | pl 方向 |
|---------|---------|
| tactics board | **plansza taktyczna** / **plansza** |
| tonight's OBS show | **dzisiejszej transmisji OBS** |
| Hide the tools | **Ukryj narzędzia** |
| Capture only the pitch | **Przechwytuj tylko boisko** |
| Press B | **Naciśnij B** |
| pass / run / dribble（本文） | **podanie** · **bieg** · **drybling** |

- **plansza**（**tablica** 禁止）
- OBS · ZoneBoard · PNG · Instagram · X — 固有名詞そのまま
- 競合名 · OBS 内部心理 · 機能羅列 — 書かない（LP_COPY）

---

## Grok 先取り（任意 · en 訳後でも可）

以下は es/pt Grok で効いたパターン。**en 訳ができたあと**、自然なら取り入れてよい（en 構造を無視しない）:

- `lpCanLead`: **Dla twórców na żywo. Trenerzy też.**（裸の streamers 回避）
- `lpCloseCta`: **… · gotowe do OBS**
- **boisko** 統一

---

## やってはいけない

- es `Tu directo. El campo…` を pl に移植
- ja LP を参照
- App 非 lp を同ファイルに入れる
- H1 を 1 文スローガンに膨らませる（en と同じ **2 行 H1**）

---

## 検証

- [ ] `_meta.source` = en ONLY
- [ ] en lp と 1:1 キー
- [ ] openBoard 系 = 波 1 と一致
- [ ] tablica なし · JSON valid

---

## 完了報告（日本語）

- H1/payoff の pl 一行要約
- **en から離れた意訳**があれば理由
- es/pt を参照しなかった旨
