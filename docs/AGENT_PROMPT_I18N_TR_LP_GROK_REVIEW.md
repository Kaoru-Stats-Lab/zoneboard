# Grok プロンプト — tr LP ネイティブ受け止め（トルコ · 3 視点）

**用途:** **en ベース**で訳した `messages-lp.tr.json` の評価。  
**出力:** 日本語

**注意:** tr の正本は **en**。Grok には **en 原文と tr 訳を並べて**、Watchalong / Kadro-X 層の自然さ + Pas/Koşu 訴求を見てもらう。

Gemini ドラフト完成後、JSON を貼って Grok に渡す。

---

```
## ROLE

3 人のネイティブ **tr-TR** 話者:

| ペルソナ | 背景 |
|----------|------|
| **Emre（İstanbul）** | 27 · Süper Lig / UCL watchalong · Twitch/YouTube · OBS · EN UI B1 |
| **Ayşe（Ankara）** | 25 · büyük maç öncesi **kadro** görseli · X · Instagram Stories |
| **Can（İzmir）** | 31 · 3 büyükler tartışma yayınları · hızlı flip · OBS pencere yakalama |

初見 zoneboard.app · 18–45 · futbol bilgili · **canlı yayın / kadro tartışması** 層

## プロダクト

ZoneBoard = tarayıcı **taktik tahtası** · OBS **pencere yakalama** · B = araçlar gizli · hesap yok · **Pas vs Koşu**（App）· PNG export

**Sınıf tahtası değil** — yayıncı aracı (OBS/Canva)

## 評価文案（Gemini tr 出力を貼る）

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
  "lpCan4": "Save a PNG for Instagram, your Stories, or X. Drag the frame to crop.",
  "lpCan5": "No account. Up to three boards on your machine."
}
```

## やること

1. **5 秒テスト**（3 人 · tr の心の声 → 日本語要約）
2. **スコア 1–10:** Cool/ブランド · 自分ごと化（watchalong/kadro/X）· 信頼 · サッカー語 · 配信用語 · CTA · tr 自然さ · **Pas/Koşu** · **kadro görseli** の伝わり方
3. **en vs tr:** en 意味の保持 · **Kadro/X 向けに強化すべき行**があれば提案
4. **taktik tahtası / tahta** の連想（sınıf vs analiz）
5. **Metrica ユーザー**が「çok hafif / inandırıcı」か
6. **CMO 判定:** 出荷可 / 要修正 / 要リライト · top 3

## 禁止

- es/de/fr 文案を正本として批判しない
- 機能 invent 禁止
- 実在クラブ名を LP に入れる提案
```

---

## メモ（カオル向け）

| ステップ | 内容 |
|----------|------|
| 1 | Gemini ← `AGENT_PROMPT_I18N_TR_APP.md`（**en のみ**）→ `gemini-app-raw.json` + `howTo.tr.json` |
| 1b | `node scripts/build-tr-app-draft.mjs` → `messages-app.tr.json` |
| 2 | Gemini ← `AGENT_PROMPT_I18N_TR_LP.md`（**en lp* のみ**） |
| 3 | Grok + JSON → `docs/i18n-draft/tr/GROK-LP-REVIEW.md` |
| 4 | Grok 提案は任意反映 · en 逸脱は `_meta.notes` に理由 |

**戦略:** tr は第2波 **3 位（最終）** — バズは大きいが定着はブレやすい。**Kadro PNG + 軽量** が費用対効果高い（[`LOCALE_MARKETS.md`](LOCALE_MARKETS.md) §3-7）
