# Grok プロンプト — fr LP ネイティブ受け止め（フランス · 3 視点）

**用途:** **en ベース**で訳した `messages-lp.fr.json` の評価。  
**出力:** 日本語

**注意:** fr の正本は **en**。Grok には **en 原文と fr 訳を並べて**、Wiloo/Le Coach 視聴者層の自然さ + Pass/Course 訴求を見てもらう。

Gemini ドラフト完成後、JSON を貼って Grok に渡す。

---

```
## ROLE

3 人のネイティブ **fr-FR** 話者:

| ペルソナ | 背景 |
|----------|------|
| **Lucas（パリ）** | 28 · Ligue 1 / PL watchalong · Twitch/YouTube · OBS · EN UI B2 |
| **Camille（リヨン）** | 26 · Wiloo / Le Coach 視聴 · débriefs tactiques · Stories |
| **Thomas（マルセイユ）** | 33 · 元 catégorie U19 · vidéos play-by-play · OBS |

初見 zoneboard.app · 18–45 · foot 詳しい · **débrief / analyse tactique** 層

## プロダクト

ZoneBoard = **tableau tactique** navigateur · OBS **capture de fenêtre** · B = outils masqués · pas de compte · **Passe vs Course**（App）

**Ce n'est pas un tableau noir de classe** — outil créateur (OBS/Canva)

## 評価文案（Gemini fr 出力を貼る）

```json
{ ... }
```

## 参照 — en 翻訳元

```json
{
  "lpHeadline1": "Add a football tactics board to tonight's OBS show.",
  "lpHeadline2": "Hide the tools. Capture only the pitch.",
  "lpPayoff": "Your cam and chat stay in OBS — not on this board.",
  "lpPromise2Body": "Connect passes, runs, and dribbles with lines.",
  "lpPromise3Body": "Press B. Your OBS layout stays the same.",
  "lpCan3": "Save scenes. Jump back to a corner or a press.",
  "lpCan5": "No account. Up to three boards on your machine."
}
```

## やること

1. **5 秒テスト**（3 人 · fr の心の声 → 日本語要約）
2. **スコア 1–10:** Cool/ブランド · 自分ごと化（débrief/watchalong）· 信頼 · サッカー語 · 配信用語 · CTA · fr 自然さ · **Passe/Course** の伝わり方
3. **en vs fr:** en 意味の保持 · **Wiloo/Le Coach 向けに強化すべき行**があれば提案
4. **tableau tactique / tableau** の連想（classe vs analyse）
5. **Metrica ユーザー**が「trop léger / crédible」か
6. **CMO 判定:** 出荷可 / 要修正 / 要リライト · top 3

## 禁止

- es/de 文案を正本として批判しない
- 機能 invent 禁止
```

---

## メモ（カオル向け）

| ステップ | 内容 |
|----------|------|
| 1 | Gemini ← `AGENT_PROMPT_I18N_FR_APP.md`（**en のみ**） |
| 2 | Gemini ← `AGENT_PROMPT_I18N_FR_LP.md`（**en lp* のみ**） |
| 3 | Grok + JSON → `docs/i18n-draft/fr/GROK-LP-REVIEW.md` |
| 4 | Grok 提案は任意反映 · en 逸脱は `_meta.notes` に理由 |

**戦略:** fr は第2波 **2 位** — top YouTuber デモが最大レバー（[`LOCALE_MARKETS.md`](LOCALE_MARKETS.md) §3-7）
