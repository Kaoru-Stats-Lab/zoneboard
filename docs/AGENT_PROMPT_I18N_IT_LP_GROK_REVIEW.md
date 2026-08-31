# Grok プロンプト — it LP ネイティブ受け止め（イタリア · 3 視点）

**用途:** **en ベース**で訳した `messages-lp.it.json` の評価。  
**出力:** 日本語（`docs/i18n-draft/it/GROK-LP-REVIEW.md` に保存）

**注意:** it の正本は **en**。Grok には **en 原文と it 訳を並べて**、Alesia / MatchStudio 視聴者層の自然さ + **Passaggio/Corsa** + **lavagna tattica** 訴求を見てもらう。

**貼る JSON:** `docs/i18n-draft/it/messages-lp.it.json` の全文（`_meta` 含む可）

---

```
## ROLE

3 人のネイティブ **it-IT** 話者:

| ペルソナ | 背景 |
|----------|------|
| **Marco（Milano）** | 28 · Serie A / UCL watchalong · Twitch/YouTube · OBS · EN UI B2 |
| **Giulia（Roma）** | 26 · Alesia / MatchStudio 視聴 · analisi tattica post-partita · Stories |
| **Luca（Torino）** | 33 · ex settore giovanile · debrief YouTube · OBS cattura finestra |

初見 zoneboard.app · 18–45 · calcio · **lavagna tattica / Match Analysis / watchalong** 層

## プロダクト

ZoneBoard = **lavagna tattica** nel browser · OBS **cattura finestra** · B = strumenti nascosti · zero registrazioni · **Passaggio vs Corsa**（App）

**Non è la lavagna della scuola** — strumento creator (OBS/Canva). Concorrente tipico: **DrawTactics** (it · Voronoi · più pesante in live)

## 評価文案（it LP JSON を貼る）

```json
{ ... messages-lp.it.json ... }
```

## 参照 — en 翻訳元（並べて読む）

```json
{
  "lpHeadline1": "Add a football tactics board to tonight's OBS show.",
  "lpHeadline2": "Hide the tools. Capture only the pitch.",
  "lpPayoff": "Your cam and chat stay in OBS — not on this board.",
  "lpLede": "No account. Open in the browser. Add the window in OBS.",
  "lpHeroCaption": "Tools hide. The pitch fills the window. Cam and chat stay in OBS.",
  "lpPromise2Body": "Connect passes, runs, and dribbles with lines.",
  "lpPromise3Body": "Press B. Your OBS layout stays the same.",
  "lpCanTitle": "For streamers first. The same board works for coaches too.",
  "lpCanLead": "For streamers first. The same board works for coaches too.",
  "lpCan3": "Save scenes. Jump back to a corner or a press.",
  "lpCan4": "Save a PNG for Instagram, your Stories, or X. Drag the frame to crop.",
  "lpCan5": "No account. Up to three boards on your machine.",
  "lpCloseCta": "Open the board — no account · ready for OBS",
  "lpBullet3": "No sign-up · saves locally · up to 3 boards"
}
```

## やること

1. **5 秒テスト**（3 人 · H1+payoff を声に出して読んだ心の声 → **日本語要約**）
2. **スコア 1–10**（各軸に 1 文理由）:
   - Cool/ブランド
   - 自分ごと化（watchalong · debrief · analisi tattica）
   - 信頼（煽りすぎ · 機能の過大主張なし）
   - サッカー語（calcio · pressing · corner 等）
   - 配信用語（OBS · cattura finestra · modalità diretta）
   - CTA（`lpCloseCta` · `openBoard`）
   - it 自然さ（翻訳調 · dialetto）
   - **Passaggio/Corsa/Dribbling**（`lpPromise2Body` · `lpCan2`）
   - **lavagna tattica**（教室連想がないか · Pizarra 文化との距離）
3. **en vs it:** 意味が失われた行 · **Alesia/MatchStudio 向けに強化すべき行**（Costruzione dal basso · Struttura/Fase · qualità broadcast）— invent キー禁止
4. **campo vs erba/prato:** UI/LP で **campo** 統一されているか（`lpCan1` 等）
5. **DrawTactics / TacticalPad ユーザー**が「troppo leggero / credibile / utile per la live」か
6. **CMO 判定:** 出荷可 / 要修正 / 要リライト · **優先修正 top 3**（キー名 · 現行文 · 提案文）

## 出力フォーマット（日本語）

- 5 秒テスト（3 人）
- スコア表
- en vs it
- lavagna tattica / lavagna scuola 連想
- DrawTactics 比較
- CMO 判定 + top 3
- 反映した修正表（採用する場合のみ）

## 禁止

- es/de/fr/tr 文案を正本として批判しない（it の正本は **en**）
- 機能 invent 禁止 · 実在クラブ名（Juve/Inter/Milan/Roma）を LP に入れる提案
- H1 を 1 文スローガンに膨らませる提案（en と同じ **2 行 H1** を維持）
```

---

## メモ（カオル向け）

| ステップ | 内容 |
|----------|------|
| 1 | Gemini ← [`AGENT_PROMPT_I18N_IT_APP.md`](AGENT_PROMPT_I18N_IT_APP.md) |
| 2 | Gemini ← [`AGENT_PROMPT_I18N_IT_LP.md`](AGENT_PROMPT_I18N_IT_LP.md) |
| 3 | **Grok** ← 本ファイル + `messages-lp.it.json` → [`GROK-LP-REVIEW.md`](../i18n-draft/it/GROK-LP-REVIEW.md) |
| 4 | Grok top 3 は任意反映 · en 逸脱は `_meta.notes` に理由 |

**差し替え候補（Grok が弱い場合）:**

| キー | 方向 |
|------|------|
| `lpCanTitle` | **Per watchalong, analisi tattica e debrief post-partita.** |
| `lpCloseCta` | **Apri la lavagna — zero registrazioni · pronta per OBS** |
| `lpCan1` | **campo**（`erba` より UI 統一） |

**戦略:** it 第3波 · Fit 74% · DrawTactics 差は **Broadcast + zero WM**（[`LOCALE_MARKETS.md`](LOCALE_MARKETS.md) §3-8）
