# 翻訳プロンプト — ドイツ語 · LP（de · DACH · 波 2）

**索引:** [`AGENT_PROMPT_I18N_DE.md`](AGENT_PROMPT_I18N_DE.md)  
**前提:** 波 1 と **別セッション**

## 正本: 英語 `en` の `lp*` のみ

- [`src/i18n/messages.ts`](../src/i18n/messages.ts) の **`en` LP キー**を翻訳する
- **es / pt / pl の文案は使わない**（H1 を他ロケールから持ってこない）
- [`docs/LP_COPY.md`](../LP_COPY.md) — **何を書かないか** のルールのみ（文案の正本は en）

Gemini にそのまま渡してよい。JSON のみ · コード変更禁止。

---

## DACH LP 温度（波 2 追記）

**en 本番 LP の構造を守る**（2 行 H1 · payoff · 3 promise）。その上で DACH 向けに自然なら以下を織り込む:

| 軸 | de 方向（ invent キー禁止 · 既存 lp* 内で） |
|----|---------------------------------------------|
| **即起動** | schnell · im Browser · sofort |
| **ローカル** | kein Account · lokal gespeichert · **server-frei**（`lpCan5` · `lpBullet3` · `lpLede` 等） |
| **OBS** | Fensteraufnahme · Cam und Chat bleiben in OBS |
| **Taktik** | Pass vs Lauf · Pressing · **optional:** Szene für Eckball/Pressing（`lpCan3`） |
| **Halbraum** | App の `lanes5` と矛盾しない語彙（LP に専用キーは無い — **無理に Halbraum を H1 に入れない**） |

**コアメッセージ参考（1 行 · H1 を置き換えない）:**  
*Die schnellste 2D-Taktiktafel für deine Analyse — server-frei & sofort bereit*

---

## en LP（翻訳元 · この意味を de 化）

```text
lpHeadline1: Add a football tactics board to tonight's OBS show.
lpHeadline2: Hide the tools. Capture only the pitch.
lpPayoff: Your cam and chat stay in OBS — not on this board.
lpLede: No account. Open in the browser. Add the window in OBS.
lpHeroCaption: Tools hide. The pitch fills the window. Cam and chat stay in OBS.
lpPromise1Title: Place
lpPromise2Title: Draw
lpPromise3Title: Show
lpPromise3Body: Press B. Your OBS layout stays the same.
lpCanLead: For streamers first. The same board works for coaches too.
lpCan5: No account. Up to three boards on your machine.
lpBullet3: No sign-up · saves locally · up to 3 boards
```

**注意:** en 本番は **OBS 仕事ベース**。**en を忠実に de 化**する。Grok レビューで Taktik-Nerd 向け Cool 寄せは **後段**。

---

## 読む

1. 本ファイル
2. `messages.ts` — **`en` の `lp*` + 共有 4 キー**
3. [`docs/LP_COPY.md`](../LP_COPY.md) · [`LP_STRUCTURE.md`](../LP_STRUCTURE.md)
4. 波 1: `docs/i18n-draft/de/messages-app.de.json` の `openBoard*` — **同じ訳を LP にコピー**

**触らない:** `ja` · `es` · `pt` · `pl` ドラフト · App 非 lp キー

---

## 成果物

`docs/i18n-draft/de/messages-lp.de.json`

- en の lp* 全キー + `openBoard` · `openBoardContinue` · `openBoardNew` · `brand`
- `_meta.source`: `"messages.ts en lp* ONLY"`

### 含めるキー（en と 1:1 · invent 禁止）

`lpHeadline1` … `lpSavedHint`（`lp` プレフィックス全部）+ 共有 4 キー（索引 §実行順 参照 · pt LP プロンプトと同集合）

---

## コピールール

| en 概念 | de 方向 |
|---------|---------|
| tactics board | **Taktikboard** / **Fußball-Taktikboard** |
| tonight's OBS show | **deiner heutigen OBS-Show** / **deinem Live heute Abend** |
| Hide the tools | **Tools ausblenden** / **Werkzeuge ausblenden** |
| Capture only the pitch | **Nur das Spielfeld aufnehmen** |
| Press B | **B drücken** |
| pass / run / dribble（本文） | **Pass** · **Lauf** · **Dribbling** |
| streamers | **Live-Creator** / **Streamer**（**1 ファイル内統一** · 推奨 **Live-Creator zuerst, Streamer auch ok**） |
| coaches | **Trainer** |

- **Taktikboard / Taktiktafel**（**Tafel / Schultafel 禁止**）
- OBS · ZoneBoard · PNG · Instagram · X — 固有名詞そのまま
- 競合名 · OBS 内部心理 · 機能羅列 — 書かない（LP_COPY）
- **Metrica / TacticalPad** 等の競合名 — 書かない

### Grok 先取り（任意 · en 訳後でも可）

| キー | 方針 |
|------|------|
| `lpCanLead` | **Für Live-Creator. Trainer nutzen es auch.** |
| `lpCloseCta` | **… · bereit für OBS** / **Taktikboard öffnen — kein Account** |
| `lpBullet3` | **Kein Login · lokal gespeichert · bis zu 3 Boards** |
| **Spielfeld** | 本文で **Rasen** を混ぜすぎない — **Spielfeld 統一** |

---

## やってはいけない

- es `Tu directo. El campo…` や pt/pl H1 を de に移植
- ja LP を参照
- App 非 lp を同ファイルに入れる
- H1 を 1 文スローガンに膨らませる（en と同じ **2 行 H1**）
- 存在しない lp キーを invent
- 過度な DSGVO 法律文案（「DSGVO-konform zertifiziert」等）

---

## 検証

- [ ] `_meta.source` = en ONLY
- [ ] en lp と 1:1 キー
- [ ] openBoard 系 = 波 1 と一致
- [ ] Schultafel / Tafel 単独なし · JSON valid
- [ ] server-frei / lokal / kein Account の訴求が lpCan5 または lpBullet3 に自然に入っている

---

## 完了報告（日本語）

- H1/payoff の de 一行要約
- **en から離れた意訳**があれば理由
- es/pt/pl を参照しなかった旨
- DACH 訴求（Halbraum/server-frei）を入れた行の一覧
