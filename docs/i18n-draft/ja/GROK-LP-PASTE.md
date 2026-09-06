# Grok 貼り付け用 — ja LP 評価（このファイル全文を Grok に貼る）

> **使い方:** このファイルを **全文コピー** → Grok に 1 回貼る。  
> **出力の保存先:** `docs/i18n-draft/ja/GROK-LP-REVIEW.md`  
> **触らない:** FAQ / About / howTo 長文（Pending）

---

## ROLE

3 人のネイティブ日本語話者:

| ペルソナ | 背景 |
|----------|------|
| **アキラ（東京）** | 29 · Jリーグ / UCL 試合配信 · YouTube · OBS · 英語 UI B2 |
| **ミユ（大阪）** | 24 · 実況 VTuber · Stories / X · Canva 慣れ |
| **ケンジ（名古屋）** | 38 · 部活監督 · タブレット · ホットキー不要 |

初見 zoneboard.app · 18–45 · サッカー解説 / 配信

**自己チェック:** 「声に出して 15 秒。辞書なしで『何の道具か・何を押すか』分かるか？」

## プロダクト

ZoneBoard = ブラウザの戦術ボード · OBS ウィンドウキャプチャ · **B で UI 隠れ** · アカウント不要 · 端末に最大 3 枚

## ボイス（正本要約）

- 常体 · 短文 · LP は声に出して 15 秒以内
- **使う:** ピッチ · スタメン · 局面 · 配信モード · アカウント不要
- **避ける:** 芝 · 駒 · ウォッチアロング · 読み物 · ローカル保存 · 「〜を足す」直訳連発
- カタカナ 3 語連続は避ける（OBS / PNG / IG 単体は可）

## スコープ外（評価しない · 提案しない）

- FAQ · About · Guide / howTo 長文
- 新キー invent
- レイアウト変更

---

## A. 評価文案（ja LP · 現行ドラフト）

```json
{
  "_meta": {
    "locale": "ja",
    "source": "en",
    "voice": "docs/i18n-draft/ja/VOICE-JA.md",
    "wave": "lp-rewrite-2026-09-01"
  },
  "tagline": "OBS 向けの戦術ボード。B で UI が消える。",
  "openBoard": "ボードを開く",
  "lpHeadline1": "今夜の OBS に、戦術ボードを。",
  "lpHeadline2": "UI は隠す。ピッチだけ映す。",
  "lpPayoff": "カメラとチャットは OBS のまま。ここには載せない。",
  "lpLede": "アカウント不要。ブラウザで開いて、ウィンドウキャプチャ。",
  "lpHeroCaption": "UI が消える。ピッチが画面いっぱい。カメラとチャットは OBS。",
  "lpPromise1Title": "並べる",
  "lpPromise1Body": "スタメンと位置をピッチに置く。",
  "lpPromise2Title": "引く",
  "lpPromise2Body": "パス・ラン・ドリブルを線でつなぐ。",
  "lpPromise3Title": "配信",
  "lpPromise3Body": "B を押す。OBS のレイアウトはそのまま。",
  "lpCanTitle": "型ではなく、この試合のスタメン。",
  "lpCanLead": "配信者向け。指導でもそのまま使える。",
  "lpCan1": "クラブのエンブレムをピッチに載せられる。",
  "lpCan1Note": "ZoneBoard のロゴは出さない。",
  "lpCan2": "両チームのスタメン。パス・ラン・ドリブル・ゾーン。",
  "lpCan3": "局面を保存。CK やプレスにすぐ戻れる。",
  "lpCan4": "PNG で X·Story·IG 用に書き出し。枠はドラッグ。",
  "lpCan4Note": "縦投稿はピッチを切る。全体なら 16:9 かピッチ比。",
  "lpCan5": "アカウント不要。この端末に最大3枚まで。",
  "lpCloseTitle": "今の配信環境のまま試せる。",
  "lpCloseBody": "ブラウザで開く。OBS にウィンドウを追加。キックオフ前に B。",
  "lpCloseCta": "ボードを開く — アカウント不要 · OBS対応",
  "lpBullet3": "アカウント不要 · 端末に保存 · 最大3枚",
  "openBoardContinue": "続きから",
  "openBoardNew": "新しい試合",
  "lpSavedHint": "この端末に前回のボードがあります。"
}
```

## B. en 翻訳元（並べて読む）

```json
{
  "tagline": "Football tactics board for OBS. Broadcast mode hides the tools.",
  "openBoard": "Open board",
  "lpHeadline1": "Add a football tactics board to tonight's OBS show.",
  "lpHeadline2": "Hide the tools. Capture only the pitch.",
  "lpPayoff": "Your cam and chat stay in OBS — not on this board.",
  "lpLede": "No account. Open in the browser. Add the window in OBS.",
  "lpHeroCaption": "Tools hide. The pitch fills the window. Cam and chat stay in OBS.",
  "lpPromise1Title": "Place",
  "lpPromise1Body": "Put the starters and their spots on the pitch.",
  "lpPromise2Title": "Draw",
  "lpPromise2Body": "Connect passes, runs, and dribbles with lines.",
  "lpPromise3Title": "Show",
  "lpPromise3Body": "Press B. Your OBS layout stays the same.",
  "lpCanTitle": "Not a template — this match's XI.",
  "lpCanLead": "For streamers first. The same board works for coaches too.",
  "lpCan1": "Put your club badge on the grass.",
  "lpCan1Note": "No ZoneBoard logo on the pitch.",
  "lpCan2": "Set both XIs. Draw passes, runs, dribbles, and zones.",
  "lpCan3": "Save scenes. Jump back to a corner or a press.",
  "lpCan4": "Save a PNG for Instagram, Stories, or X. Drag the frame.",
  "lpCan4Note": "Portrait posts crop the pitch. For the whole field, use 16:9 or Pitch ratio.",
  "lpCan5": "No account. Up to three boards on your machine.",
  "lpCloseTitle": "Try it on the desk you already use.",
  "lpCloseBody": "Open in the browser. Add the window in OBS. Press B before kick-off.",
  "lpCloseCta": "Open board — no account",
  "lpBullet3": "No sign-up · saves locally · up to 3 boards",
  "openBoardContinue": "Continue",
  "openBoardNew": "New match",
  "lpSavedHint": "A board from last time is still on this device."
}
```

---

## やること

1. **5 秒テスト**（3 人 · H1 + payoff を声に出した心の声 → 日本語）
2. **スコア 1–10**（各軸に 1 文理由）:
   - Cool / ブランド
   - 自分ごと化（試合配信 · 解説）
   - 信頼（煽りすぎなし）
   - サッカー語
   - OBS / 配信用語
   - CTA（`lpCloseCta` · `openBoard`）
   - **ダサさ / 翻訳調**
   - カタカナ過多
3. **禁止語残存チェック:** 駒 · 芝 · ウォッチアロング · 読み物 · ローカル保存
4. **en vs ja:** 意味が弱まった行 · 直訳臭い行
5. **CMO 判定:** 出荷可 / 要修正 / 要リライト
6. **優先修正 top 5**（必須フォーマット）:

| # | キー | 現行 | 提案 | 理由（1 行） |
|---|------|------|------|--------------|

※ top 5 以外の全文リライトは不要。キー invent 禁止。

---

## 出力フォーマット（この順 · 日本語）

```
## 5 秒テスト
### アキラ
### ミユ
### ケンジ

## スコア表
| 軸 | 点 | 理由 |
|----|----|------|

## 禁止語チェック
（残っていればキー名）

## en vs ja（最大5行）

## 優先修正 top 5
| # | キー | 現行 | 提案 | 理由 |

## CMO 判定
出荷可 / 要修正 / 要リライト — 1 文
```
