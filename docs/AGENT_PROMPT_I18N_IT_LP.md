# 翻訳プロンプト — イタリア語 · LP（it · 波 2）

**索引:** [`AGENT_PROMPT_I18N_IT.md`](AGENT_PROMPT_I18N_IT.md)  
**前提:** 波 1 と **別セッション**

## 正本: 英語 `en` の `lp*` のみ

Gemini にそのまま渡してよい。JSON のみ · コード変更禁止。

---

## イタリア圏 LP 温度

**en 本番 LP の構造を守る**（2 行 H1 · payoff · 3 promise）。自然な範囲で:

| 軸 | it 方向 |
|----|---------|
| **broadcast** | qualità broadcast · zero registrazioni |
| **Match Analysis** | video · live stream · debrief（`lpCanTitle`） |
| **Passaggio vs Corsa** | `lpCan2` · `lpPromise2Body` |
| **OBS** | cattura finestra |

**コアメッセージ参考（H1 を置き換えない）:**  
*La lavagna tattica 2D più veloce per i tuoi video e live stream — Zero registrazioni, qualità broadcast*

---

## 成果物

`docs/i18n-draft/it/messages-lp.it.json`

- lp* 全キー + `openBoard` · `openBoardContinue` · `openBoardNew` · `brand`
- 波 1 の `openBoard*` と **同じ訳**

---

## コピールール

| en | it |
|----|-----|
| tactics board | **lavagna tattica** |
| Hide the tools | **Nascondi gli strumenti** |
| Capture only the pitch | **Cattura solo il campo** |
| Press B | **Premi B** |
| pass / run / dribble | **passaggi** · **corse** · **dribbling** |

**lavagna** 単独禁止 · 実在クラブ名禁止

### Grok 先取り（任意）

| キー | 方針 |
|------|------|
| `lpCanTitle` | **Per watchalong, analisi tattica e debrief post-partita.** |
| `lpCloseCta` | **Apri la lavagna — zero registrazioni · pronta per OBS** |

---

## 検証

- [ ] en lp 1:1 · openBoard 一致 · lavagna tattica · JSON valid
