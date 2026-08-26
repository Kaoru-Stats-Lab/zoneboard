# LP verification — synthesis (2026-08-26)

**Prompt:** [`AGENT_PROMPT_LP_VERIFY.md`](AGENT_PROMPT_LP_VERIFY.md)  
**Sources:** ChatGPT · Claude · Grok · Gemini  

| Model | Verdict | WouldOpen |
|---|---|---|
| ChatGPT | **ship** | 9 |
| Claude | revise (polish only; no new FATAL) | 8 |
| Grok | **ship** | 8 |
| Gemini | **ship** | 9 |

**Aggregate:** **ship.** FATAL 6/6 pass（Claude のみ hide-tools 反復を fail だが NEW FATAL なし＝出荷阻害ではない）。

## Surgical 採用

| 採用 | 却下 |
|---|---|
| H1 に `football`（ChatGPT） | Gemini の lead を「match reviews…」に広げて streamer 主を薄める案 |
| How/Show から hide-tools を外し Press B に寄せる（Claude） | H1-2 の `Hide the tools. Capture only the pitch.` を触る（Claude: ここは残す） |
| Close を `Press B before kick-off`（Claude） | CTA から `— no account` を外す（Grok）— 摩擦除去の得を残す |
| scenes 行を短く（Grok） | |

**裁定:** **ship。** 外科適用済（`messages.ts` · `Landing.tsx`）。これ以上のセカンドオピニオンは不要。次は実機で LP を見て出す。
