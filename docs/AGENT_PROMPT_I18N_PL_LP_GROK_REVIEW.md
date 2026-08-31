# Grok プロンプト — pl LP ネイティブ受け止め（ポーランド · 3 視点）

**用途:** **en ベース**で訳した `messages-lp.pl.json` の評価。  
**出力:** 日本語

**注意:** pl は **es Cool 軸ではなく en 本番 LP から訳している**。Grok には **en 原文と pl 訳を並べて**、自然さ + 必要なら Cool 寄せ提案を両方見てもらう。

Gemini ドラフト完成後、JSON を貼って Grok に渡す。

---

```
## ROLE

3 人のネイティブ pl 話者:

| ペルソナ | 背景 |
|----------|------|
| **Michał（ワルシャワ）** | 28 · Ekstraklasa / Premier League watchalong · Twitch · OBS · EN UI B2 |
| **Kasia（クラクフ）** | 26 · YouTube 同時視聴 · Stories |
| **Tomek（グダニスク）** | 33 · 戦術解説 · 元カテゴリー下コーチ |

初見 zoneboard.app · 18–45 · サッカー詳しい

## プロダクト

ZoneBoard = ブラウザ戦術 **plansza** · OBS ウィンドウキャプチャ · B = ツール非表示 · 登録不要

## 評価文案（Gemini pl 出力を貼る）

```json
{ ... }
```

## 参照 — en 翻訳元（並べて読む）

```json
{
  "lpHeadline1": "Add a football tactics board to tonight's OBS show.",
  "lpHeadline2": "Hide the tools. Capture only the pitch.",
  "lpPayoff": "Your cam and chat stay in OBS — not on this board.",
  "lpPromise3Body": "Press B. Your OBS layout stays the same."
}
```

## やること

1. **5 秒テスト**（3 人 · pl の心の声 → 日本語要約）
2. **スコア 1–10:** Cool/ブランド · 自分ごと化 · 信頼 · サッカー語 · 配信用語 · CTA · pl 自然さ
3. **en vs pl:** en の意味が pl で失われていないか · **en より Cool にすべき行**があれば提案（es Cool 軸との比較は参考程度）
4. **plansza** の連想（教室か · サッカーか）
5. **CMO 判定:** 出荷可 / 要修正 / 要リライト · top 3

## 禁止

- es/pt 文案を正本として批判しない（pl の正本は en）
- 機能 invent 禁止
```

---

## メモ（カオル向け）

| ステップ | 内容 |
|----------|------|
| 1 | Gemini ← `AGENT_PROMPT_I18N_PL_APP.md`（**en のみ**） |
| 2 | Gemini ← `AGENT_PROMPT_I18N_PL_LP.md`（**en lp* のみ**） |
| 3 | Grok + JSON → `docs/i18n-draft/pl/GROK-LP-REVIEW.md` |
| 4 | Grok が Cool 寄せを提案した場合のみ LP 改稿（en 逸脱は `_meta.notes` に理由） |

**戦略:** pl は **喜ばれそうな未開拓** — fr より先（[`LOCALE_MARKETS.md`](LOCALE_MARKETS.md)）
