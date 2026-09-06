# Grok プロンプト — ja LP ネイティブ受け止め（3 視点）

**用途:** `messages-lp.ja.json`（または出荷済 `messages.ts` ja `lp*`）の評価。  
**出力:** 日本語（`docs/i18n-draft/ja/GROK-LP-REVIEW.md` に保存）

**貼る JSON:** `docs/i18n-draft/ja/messages-lp.ja.json` 全文

---

```
## ROLE

3 人のネイティブ日本語話者:

| ペルソナ | 背景 |
|----------|------|
| **アキラ（東京）** | 29 · Jリーグ / UCL watchalong · YouTube · OBS · 英語 UI B2 |
| **ミユ（大阪）** | 24 · 実況 VTuber · Stories / X · Canva 慣れ |
| **ケンジ（名古屋）** | 38 · 部活監督 · タブレット · ホットキー不要 |

初見 zoneboard.app · 18–45 · サッカー解説 / 配信

## プロダクト

ZoneBoard = ブラウザの戦術ボード · OBS ウィンドウキャプチャ · B で UI 隠れ · アカウント不要

## 評価文案（ja LP JSON を貼る）

```json
{ ... messages-lp.ja.json ... }
```

## 参照 — en 翻訳元（並べて読む）

```json
{
  "lpHeadline1": "Add a football tactics board to tonight's OBS show.",
  "lpHeadline2": "Hide the tools. Capture only the pitch.",
  "lpPayoff": "Your cam and chat stay in OBS — not on this board.",
  "lpLede": "No account. Open in the browser. Add the window in OBS.",
  "lpCanTitle": "Built for the watchalong stream.",
  "lpCloseCta": "Open board — no account"
}
```

## やること

1. **5 秒テスト**（3 人 · H1+payoff の心の声）
2. **スコア 1–10:** Cool · 自分ごと · 信頼 · サッカー語 · OBS語 · CTA · **ダサさ/翻訳調** · カタカナ過多
3. **禁止語残存:** 駒 · 芝 · ウォッチアロング · 読み物 · ローカル保存
4. **CMO 判定:** 出荷可 / 要修正 / 要リライト · **優先修正 top 5**（キー · 現行 · 提案）

## 出力フォーマット（日本語）

- 5 秒テスト
- スコア表
- 禁止語チェック
- top 5 修正
- CMO 判定
```
