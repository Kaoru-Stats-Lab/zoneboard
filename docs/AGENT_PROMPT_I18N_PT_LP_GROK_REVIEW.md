# Grok プロンプト — pt-BR LP ネイティブ受け止め（3 地域 · ブラジル）

**用途:** Cool 軸 + quadro 方針の `messages-lp.pt.json` を、**ブラジル国内 3 視点**の配信者目線で評価してもらう。  
**出力言語:** 日本語（表 · 見出しも日本語）

**前提:** es 版 [`AGENT_PROMPT_I18N_ES_LP_GROK_REVIEW.md`](AGENT_PROMPT_I18N_ES_LP_GROK_REVIEW.md) と同型。Gemini ドラフト完成 **後** に使う。

以下を **Grok にそのまま貼る**（`messages-lp.pt.json` の内容に差し替える）。

---

```
## ROLE

あなたは **3 人のネイティブ pt-BR 話者** を演じ、同じ LP 文案をそれぞれの視点で読む。

| ペルソナ | 背景 |
|----------|------|
| **Lucas（サンパウロ）** | 27 歳 · SP · Brasileirão / Premier League 同時視聴 Twitch · OBS 経験あり · 英語 UI も B2 |
| **Beatriz（リオ）** | 25 歳 · RJ · YouTube/Twitch ウォッチアロング · 「live de futebol」文化 · Instagram Stories も使う |
| **Rafael（南）** | 32 歳 · POA · 戦術解説 · 元カテゴリー下コーチ · OBS · Libertadores 実況も |

**共通:** 初めて zoneboard.app の LP を見る。**18–45 歳 · サッカー詳しい · IT は普通** · **pt-BR のみ**（pt-PT 視点は不要）。

---

## プロダクト（読む前に知ること）

**ZoneBoard** = ブラウザのサッカー戦術 quadro。配信者向け **クリエイターツール**（Canva / OBS 系の温度）。教室の黒板アプリではない。

- 登録なし · ブラウザ · OBS ウィンドウキャプチャで配信に足す
- **B キー** = modo live（ツール非表示 · campo が画面の ≥80%）
- スタメン配置 · passe/corrida/drible の線 · cena 保存
- ブランド目標: **「クールな配信道具」** — CL アンセム的な「試合の夜 · 画面が試合になる」感覚。学校 · 説明書は避けたい

**es 版で学んだこと（pt で先取り済みか確認してほしい）:**
- **quadro negro / lousa** = 教室連想 → **quadro** のみ
- H1 は **live + campo em tela cheia** の Cool 軸（キックオフ前の escalação 準備だけにしない）
- **streamers** 裸語より **criadores ao vivo**
- **campo** 統一（gramado の揺れを避ける）
- CTA: **pronto para OBS**

---

## 評価する文案（Gemini 波 2 出力をここに貼る）

```json
{
  "lpHeadline1": "（Gemini 出力）",
  "lpHeadline2": "（Gemini 出力）",
  "lpPayoff": "（Gemini 出力）",
  "lpLede": "（Gemini 出力）",
  "lpHeroCaption": "（Gemini 出力）",
  "lpPromise1Title": "（Gemini 出力）",
  "lpPromise1Body": "（Gemini 出力）",
  "lpPromise2Title": "（Gemini 出力）",
  "lpPromise2Body": "（Gemini 出力）",
  "lpPromise3Title": "（Gemini 出力）",
  "lpPromise3Body": "（Gemini 出力）",
  "lpStepsLabel": "（Gemini 出力）",
  "lpCanTitle": "（Gemini 出力）",
  "lpCanLead": "（Gemini 出力）",
  "lpCan1": "（Gemini 出力）",
  "lpCan1Note": "（Gemini 出力）",
  "lpCan2": "（Gemini 出力）",
  "lpCan3": "（Gemini 出力）",
  "lpCan4": "（Gemini 出力）",
  "lpCan5": "（Gemini 出力）",
  "lpCloseTitle": "（Gemini 出力）",
  "lpCloseBody": "（Gemini 出力）",
  "lpCloseCta": "（Gemini 出力）",
  "lpPriceBody": "（Gemini 出力）",
  "lpBullet1": "（Gemini 出力）",
  "lpBullet2": "（Gemini 出力）",
  "lpBullet3": "（Gemini 出力）",
  "openBoard": "（Gemini 出力）"
}
```

**参考（es 出荷済み · 温度比較用 · pt 文案と並べて読んでもよい）:**

```json
{
  "lpHeadline1": "Tu directo. El campo a pantalla llena.",
  "lpHeadline2": "Sin menús. Solo fútbol en pantalla.",
  "lpCloseCta": "Abrir tablero — sin cuenta · listo para OBS"
}
```

---

## やってほしいこと

### 1. 5 秒テスト（3 人それぞれ）

声に出して H1 + payoff を読んだあと、**一言で** この道具をどう理解したか（各ペルソナ · pt-BR の心の声 → 日本語で要約）。

### 2. 地域別スコア（各 1–10 · 理由 1 文）

| 軸 | 意味 |
|----|------|
| **Cool / ブランド** | 「配信者向けクリエイターツール」に感じるか · 学校/説明書臭がないか |
| **自分ごと化** | ウォッチアロング配信者が「自分用」と思えるか |
| **信頼** | 煽りすぎ · 怪しい · 過小評価、のバランス |
| **サッカー語自然さ** | apito · escalação · escanteio · corridas · dribles 等 |
| **配信用語** | OBS · ao vivo / no ar · captura de janela · criadores |
| **CTA** | 「Abrir quadro」でボタンを押したくなるか |
| **pt-BR 純度** | pt-PT っぽい語 · 翻訳調が混ざっていないか |

### 3. 地域差メモ

**Lucas / Beatriz / Rafael** それぞれについて:

- **違和感のある行**（引用 + なぜ + 代替案 1 つ）
- **特に効いている行**（引用 + なぜ）
- **quadro** の連想（教室か · サッカーか · 中立か · **prancheta tática** の方がよいか）
- **apito inicial** vs **início do jogo** — どちらが自然か
- **Ao vivo / No ar**（Promise3 見出し）— Cool か · 意味が通るか

### 4. 英語混在（Lucas のみ深掘り）

- OBS · B · PNG · Instagram · live · streamer — **クール** か **未翻訳感** か
- 英語 UI（B2）を普段使う Lucas が、pt LP を **en LP と同等速度**で読めるか

### 5. es 版との温度比較

- es Cool 軸（`Tu directo. El campo a pantalla llena.`）と **熱量は揃っているか**
- es Grok 指摘（streamers · césped→campo · pronto para OBS）が pt で **十分先取り**できているか

### 6. CMO 判定（統合 · 日本語）

- **出荷可 / 要修正 / 要リライト** のどれか
- 修正するなら **優先 top 3**（キー名 + 現行文 + 提案文）
- en/ja/es 本番 LP（「今夜の OBS」「ツールが消える」系）と **温度は揃っているか**

---

## 禁止

- 機能を invent しない（上記 JSON にない機能を書かない）
- 「一般的なマーケティング論」だけで終わらない — **必ず文案を引用** する
- 3 ペルソナを 1 つにまとめない — **Lucas / Beatriz / Rafael は必ず分ける**
- pt-PT 向けの修正案を主提案にしない

---

## 出力形式

```markdown
## 5 秒テスト
### Lucas（SP）
...
### Beatriz（RJ）
...
### Rafael（POA）
...

## スコア表
| 軸 | Lucas | Beatriz | Rafael |
...

## 地域差
### Lucas
...
### Beatriz
...
### Rafael
...

## es 温度比較
...

## CMO 判定
...
```
```

---

## メモ（カオル向け）

| ステップ | やること |
|----------|----------|
| 1 | Gemini に [`AGENT_PROMPT_I18N_PT_APP.md`](AGENT_PROMPT_I18N_PT_APP.md) → `gemini-app-raw.json` → `node scripts/build-pt-app-draft.mjs` → `messages-app.pt.json` · `howTo.pt.json` |
| 2 | Gemini に [`AGENT_PROMPT_I18N_PT_LP.md`](AGENT_PROMPT_I18N_PT_LP.md) → `messages-lp.pt.json` |
| 3 | 上プロンプト + **完成 JSON** を Grok に貼る → 回答を `docs/i18n-draft/pt/GROK-LP-REVIEW.md` に保存 |
| 4 | Grok top 3 を `messages-lp.pt.json` に反映 → 実装は **別フェーズ** |

**es との差:** ペルソナは **BR 国内 3 地域**（スペイン/NA/南米 の代わり）。pt-PT チェック列を追加。

**BACKLOG:** B-037 · [`LOCALE_MARKETS.md`](LOCALE_MARKETS.md) es → **pt-BR** → fr
