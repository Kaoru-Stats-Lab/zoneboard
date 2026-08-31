# Grok プロンプト — de LP ネイティブ受け止め（DACH · 3 視点）

**用途:** **en ベース**で訳した `messages-lp.de.json` の評価。  
**出力:** 日本語

**注意:** de は **es Cool 軸ではなく en 本番 LP から訳している**。Grok には **en 原文と de 訳を並べて**、Taktik-Nerd 自然さ + DACH 訴求（Halbraum · server-frei）を見てもらう。

Gemini ドラフト完成後、JSON を貼って Grok に渡す。

---

```
## ROLE

3 人のネイティブ **de-DE** 話者（DACH）:

| ペルソナ | 背景 |
|----------|------|
| **Jonas（ベルリン）** | 29 · Bundesliga / CL Watchalong · Twitch/YouTube · OBS · Taktik-Nerd · EN UI B2 |
| **Lena（ミュンヘン）** | 27 · Spielverlagerung 読者 · Substack 戦術記事 · 英語資料も読む |
| **Markus（ハンブルク）** | 34 · Bohndesliga 視聴 · 元 Jugendtrainer · Halbraum/Gegenpressing 解説動画 |

初見 zoneboard.app · 18–45 · サッカー詳しい · **Taktik-Content を作る/見る層**

## プロダクト

ZoneBoard = ブラウザ **Taktikboard** · OBS **Fensteraufnahme** · B = Tools aus · kein Account · **5 Räume / Halbräume**（App 内 · LP に専用キーは無い）

**教室の Tafel ではない** — Creator-Tool（OBS/Canva 温度）

## 評価文案（Gemini de 出力を貼る）

```json
{ ... }
```

## 参照 — en 翻訳元（並べて読む）

```json
{
  "lpHeadline1": "Add a football tactics board to tonight's OBS show.",
  "lpHeadline2": "Hide the tools. Capture only the pitch.",
  "lpPayoff": "Your cam and chat stay in OBS — not on this board.",
  "lpPromise3Body": "Press B. Your OBS layout stays the same.",
  "lpCan5": "No account. Up to three boards on your machine.",
  "lpBullet3": "No sign-up · saves locally · up to 3 boards"
}
```

## やること

1. **5 秒テスト**（3 人 · de の心の声 → 日本語要約）
2. **スコア 1–10:** Cool/ブランド · 自分ごと化（Watchalong/Taktik-Video）· 信頼 · サッカー語 · 配信用語 · CTA · de 自然さ · **server-frei/ lokal** の伝わり方
3. **en vs de:** en の意味が de で失われていないか · **Taktik-Nerd 向けに強化すべき行**（Halbraum · Gegenpressing · Fensteraufnahme）があれば提案
4. **Taktikboard / Tafel** の連想（教室か · 分析ツールか）
5. **Metrica/TacticalPad ユーザー**が「軽すぎる/信頼できる」と感じるか
6. **CMO 判定:** 出荷可 / 要修正 / 要リライト · top 3

## 禁止

- es/pt/pl 文案を正本として批判しない（de の正本は en）
- 機能 invent 禁止
- 法的 DSGVO 断言の追加提案（「zertifiziert」等）
```

---

## メモ（カオル向け）

| ステップ | 内容 |
|----------|------|
| 1 | Gemini ← `AGENT_PROMPT_I18N_DE_APP.md`（**en のみ**） |
| 2 | Gemini ← `AGENT_PROMPT_I18N_DE_LP.md`（**en lp* のみ**） |
| 3 | Grok + JSON → `docs/i18n-draft/de/GROK-LP-REVIEW.md` |
| 4 | Grok が Taktik 訴求を提案した場合のみ LP 改稿（en 逸脱は `_meta.notes` に理由） |

**戦略:** de は第2波 **1 位** — Halbraum 実装済みを App/LP 文脈で活かす（[`LOCALE_MARKETS.md`](LOCALE_MARKETS.md) §3-7）

**OUTREACH 連携:** LP 出荷後 · Spielverlagerung / r/fussball / Taktik-YouTuber 向け DM は [`OUTREACH_EU_STREAM.md`](OUTREACH_EU_STREAM.md) §2-D（DE 文面）
