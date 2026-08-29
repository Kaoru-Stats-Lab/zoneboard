# ZoneBoard — Developer story (English)

**Updated:** 2026-08-29  
**Status:** Site-ready · **in** `src/site/pages.ts` (run `npm run site:pages`)  
**Source:** [`DEVELOPER_STORY.md`](DEVELOPER_STORY.md) (pre-polish draft) · [`AGENT_PROMPT_DEVELOPER_STORY_EN.md`](AGENT_PROMPT_DEVELOPER_STORY_EN.md)  
**JA 正本:** [`DEVELOPER_STORY_DECIDED_JA.md`](DEVELOPER_STORY_DECIDED_JA.md)

---

## Meta

| Item | Value |
|------|-------|
| **About H2** | `Why I built it` |
| **Suggested HTML id** | `why-i-built-it` |
| **og:description** | I never played football. In 2026 I watched a journalist struggle with Google Slides on a live stream — and built ZoneBoard so others wouldn't have to. |
| **A) About embed** | ~236 words |
| **B) Full story** | ~490 words |

### Placement

Insert **Version A** in [`public/about/index.html`](../public/about/index.html) **before** `<h2 id="who-operates-site">` (after “What we refuse to put on the pitch”).

---

## Version A — About embed

**Use:** `public/about/index.html` · outreach one-liners · PH / press kit summary  
**Word count:** ~236

---

## Why I built it

I have never played football properly. Not in a real match. Not even as a child in any serious way. I have always watched instead — on television, in stadiums, on trips abroad when a player's name was enough to start a conversation with a stranger.

By 2026 I was also building web products. I looked at football and thought, coldly, that a sport this big must need better tools. Then the North and Central America World Cup cycle started. I watched a respected journalist analysing a match on a live stream. He knew the game. He cared about the game. His tactics board was Google Slides. He moved shapes one by one, slowly, fighting the interface while he talked. The interface slowed him down. Viewers could feel the friction. The software cut the energy he wanted to share with viewers.

I thought: this is not good enough.

I am not a former player. I am not a television commentator. I cannot stand on the pitch or deliver expert commentary. What I can do is build something under my control and hand it to others — journalists, coaches, streamers, and fans who simply want to show what they see.

That is ZoneBoard. Open it, place the players, and switch to broadcast mode (B). The tools hide. The pitch stays. The view is clean and ready for a stream, with no tutorial needed.

---

## Version B — Full story

**Use:** `/about/story/` (future) · EU creator outreach · long-form About appendix  
**Word count:** ~490

---

I have never played football properly. Not in a real match. Not even as a child in any serious way. Football still followed me — through commentary on television, cup finals I reached by night bus, and strangers abroad who lit up when I mentioned Juninho or Chelsea.

Work took over in my thirties. I came home after midnight. Live matches became rare. Football stayed close anyway. I kept old magazines in cardboard boxes. I played casual futsal after overtime with colleagues who were far better than me. On a trip to Thailand I saw Premier League branding on an MRT train. In another country a monk asked whether I supported Chelsea. The game crossed borders faster than almost anything else I knew.

In 2011, during a hard year for the country I live in and for me personally, football still gave me something steady. Players and teams kept going when other things felt heavy. I did not forget that.

As the years passed I watched fewer friendlies and more World Cups. I also started building digital products. Part of me looked at football and thought, coldly, that a market this large must need better tools.

Then came 2026 and the World Cup cycle.

I watched a respected football journalist analysing a match on a live stream. He was clearly knowledgeable. The tool he used for his tactics board was Google Slides. He moved shapes one by one, slowly, carefully, fighting the interface while trying to explain ideas in real time. The interface slowed him down. Viewers could feel the friction. The software cut the energy he wanted to share with viewers.

I thought: this is not good enough.

People who care about the game — journalists, coaches, streamers, analysts, ordinary fans who want to show what they see — should not have to fight their tools.

I am not a former player. I am not a professional analyst or a television commentator. I cannot stand on the pitch or deliver expert commentary. What I can do is build something that stays under my control and that I can hand to others.

Better software will not fix football. Leagues, pathways, and the wider ecosystem are larger than any single tool. Those sit outside what one person can change. What I can change is the small friction that appears every time someone tries to talk about the game with clarity on a stream.

I received a great deal from football over the years — stadium noise, a perfect free-kick, unexpected connections with strangers, and light when other things were dark. Building a simple, fast tactics board felt like a practical way to give something back to the people who keep explaining the game.

That is ZoneBoard. Open it, place the players, and switch to broadcast mode (B). The tools hide. The pitch stays. The view is clean and ready for a stream, with no tutorial needed.

---

## Diagnosis (why the pre-polish draft was not site-ready)

| # | Issue | Impact |
|---|--------|--------|
| 1 | Long sentences · high ESL load | Harder to read |
| 2 | AI-style opener (“every chapter of my life”) | Tone mismatch with About |
| 3 | Abstract phrases (`learning cost`, `heat of the explanation`) | Drift from product copy |
| 4 | Generic “press of a button” | Not tied to broadcast mode (B) |
| 5 | Japan-specific episodes too dense | Harder for EU readers to relate |
| 6 | JFA / federation name risk | Unwanted local politics |
| 7 | Product explanation too long for embed | About section bloat |
| 8 | Not enough short active sentences | ESL-first rule not met |
| 9 | Marketing adjectives | Weakens direct tone |
| 10 | No og:description one-liner | Weak SNS / SEO hook |

---

## Before / After (representative)

**Hook**

- Before: *Yet football has been present in almost every chapter of my life.*
- After: *I have never played football properly. Not in a real match. Not even as a child in any serious way.*

**Google Slides paragraph**

- Before: *The heat of the explanation should not be lost to clunky software.*
- After: *The interface slowed him down. Viewers could feel the friction.* / *The software cut the energy he wanted to share with viewers.*

**Closing**

- Before: *with almost no learning cost, that produces a clean, broadcast-ready view at the press of a button.*
- After: *Open it, place the players, and switch to broadcast mode (B). The tools hide. The pitch stays. The view is clean and ready for a stream, with no tutorial needed.*

---

## Human pass (Kaoru · before HTML)

1. Read Version A aloud next to existing About paragraphs — voice should feel adjacent, not like a blog post dropped in.
2. Confirm **B** / broadcast mode appears once, naturally.
3. Decide whether Version B gets its own URL or stays internal until note/JA story ships.
