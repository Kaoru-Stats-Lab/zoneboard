# Grok プロンプト — es LP ネイティブ受け止め（3 地域）

**用途:** Cool 軸 + tablero 修正後の `messages-lp.es.json` を、スペイン・北米ヒスパニック・南米の配信者目線で評価してもらう。  
**出力言語:** 日本語（表・見出しも日本語）

以下を **Grok にそのまま貼る**。

---

```
## ROLE

あなたは **3 人のネイティブスペイン語話者** を演じ、同じ LP 文案をそれぞれの視点で読む。

| ペルソナ | 背景 |
|----------|------|
| **Ana（スペイン）** | 28 歳 · マドリード · La Liga 同時視聴 Twitch · OBS 経験あり · サッカー解説に詳しい |
| **Diego（北米ヒスパニック）** | 24 歳 · ロサンゼルス · 英西バイリンガル · YouTube/Twitch ウォッチアロング · OBS · 「streamer」文化にいる |
| **Valentina（南米）** | 31 歳 · ブエノスアイレス · サッカー実況・戦術配信 · OBS · コーチ経験も少しあり |

**共通:** 初めて zoneboard.app の LP を見る。**18–45 歳 · サッカー詳しい · IT は普通**。

---

## プロダクト（読む前に知ること）

**ZoneBoard** = ブラウザのサッカー戦術ボード。配信者向け **クリエイターツール**（Canva / OBS 系の温度）。教室の黒板アプリではない。

- 登録なし · ブラウザ · OBS ウィンドウキャプチャで配信に足す
- **B キー** = modo emisión（ツール非表示 · campo が画面の ≥80%）
- スタメン配置 · パス/ラン/ドリブルの線 · 局面（escena）保存
- ブランド目標: **「クールな配信道具」** — CL アンセム的な「試合の夜 · 画面が試合になる」感覚。学校・説明書は避けたい

**前バージョンの問題（参考 · 今回の文案には含めない）:**
- 「pizarra」= 教室連想（特に北米ヒスパニックでは school ≠ cool）
- H1 が「キックオフ前の alineación 準備」寄りで、配信の夜のエネルギーが弱かった

---

## 評価する文案（修正後 · Cool 軸）

```json
{
  "lpHeadline1": "Tu directo. El campo a pantalla llena.",
  "lpHeadline2": "Sin menús. Solo fútbol en pantalla.",
  "lpPayoff": "Añade el campo a la pantalla que ya usas.",
  "lpLede": "Sin cuenta. Abre en el navegador. Captura la ventana en OBS.",
  "lpHeroCaption": "El campo llena la ventana. Cara y chat siguen en su sitio.",
  "lpPromise1Title": "Coloca",
  "lpPromise1Body": "Titulares en el campo. Antes del pitido.",
  "lpPromise2Title": "Dibuja",
  "lpPromise2Body": "Pases y movimiento. Con líneas.",
  "lpPromise3Title": "Directo",
  "lpPromise3Body": "Pulsa B. Solo el campo en directo.",
  "lpStepsLabel": "Cómo",
  "lpCanTitle": "Para la noche del partido en directo.",
  "lpCanLead": "Para streamers. Entrenadores también.",
  "lpCan1": "Pon el escudo de tu club en el césped.",
  "lpCan1Note": "Sin logo de ZoneBoard en el campo.",
  "lpCan2": "Prepara ambos onces. Dibuja pases, carreras, regates y zonas.",
  "lpCan3": "Guarda escenas. Vuelve rápido a un córner o a la presión.",
  "lpCan4": "Guarda un PNG para Instagram, Stories o X. Arrastra el marco.",
  "lpCan5": "Sin cuenta. Hasta tres tableros en tu equipo.",
  "lpCloseTitle": "Pruébalo en el escritorio que ya usas.",
  "lpCloseBody": "Abre en el navegador. Captura la ventana en OBS. Pulsa B antes del pitido.",
  "lpCloseCta": "Abrir tablero — sin cuenta",
  "lpPriceBody": "El tablero es gratis.",
  "lpBullet1": "Modo emisión — el campo ocupa ≥80% de la pantalla",
  "lpBullet2": "El logo de tu club como marca de agua",
  "lpBullet3": "Sin registro · guarda en local · hasta 3 tableros",
  "openBoard": "Abrir tablero"
}
```

---

## やってほしいこと

### 1. 5 秒テスト（3 人それぞれ）

声に出して H1 + payoff を読んだあと、**一言で** この道具をどう理解したか（各ペルソナ · スペイン語の心の声 → 日本語で要約）。

### 2. 地域別スコア（各 1–10 · 理由 1 文）

| 軸 | 意味 |
|----|------|
| **Cool / ブランド** | 「配信者向けクリエイターツール」に感じるか · 学校/説明書臭がないか |
| **自分ごと化** | ウォッチアロング配信者が「自分用」と思えるか |
| **信頼** | 煽りすぎ · 怪しい · 過小評価、のバランス |
| **サッカー語自然さ** | pitido · onces · córner · carreras · regates 等 |
| **配信用語** | OBS · directo · captura de ventana · streamers |
| **CTA** | 「Abrir tablero」でボタンを押したくなるか |

### 3. 地域差メモ

**Ana / Diego / Valentina** それぞれについて:

- **違和感のある行**（引用 + なぜ + 代替案 1 つ）
- **特に効いている行**（引用 + なぜ）
- **tablero** の連想（教室か · サッカーか · 中立か）
- **pitido** vs **saque inicial** — どちらが自然か
- **Directo**（Promise3 見出し）— Cool か · 意味が通るか

### 4. 北米ヒスパニック特化（Diego のみ深掘り）

- 英語混在（streamers · OBS · B · PNG · Instagram）は **クール** か **未翻訳感** か
- 旧「pizarra」から **tablero** に変わったことでブランド印象はどう変わるか（推定でよい）
- school / chaos の連想は **まだ残る語** があるか

### 5. CMO 判定（統合 · 日本語）

- **出荷可 / 要修正 / 要リライト** のどれか
- 修正するなら **優先 top 3**（キー名 + 現行文 + 提案文）
- en/ja 本番 LP（「今夜の OBS」「ツールが消える」系）と **温度は揃っているか**

---

## 禁止

- 機能を invent しない（上記 JSON にない機能を書かない）
- 「一般的なマーケティング論」だけで終わらない — **必ず文案を引用** する
- 3 地域を 1 つにまとめない — **Ana / Diego / Valentina は必ず分ける**

---

## 出力形式

```markdown
## 5 秒テスト
### Ana（スペイン）
...
### Diego（北米ヒスパニック）
...
### Valentina（南米）
...

## スコア表
| 軸 | Ana | Diego | Valentina |
...

## 地域差
### Ana
...
### Diego
...
### Valentina
...

## CMO 判定
...
```
```

---

## メモ（カオル向け）

- Grok の回答を `docs/i18n-draft/es/GROK-LP-REVIEW.md` に貼って保存すると、実装前の UAT 資料になる
- 前バージョンとの A/B も見たい場合は、プロンプト末尾に旧 H1 2 行を追加:
  - 旧: `Coloca la alineación antes del saque inicial.` / `Muestra pases y movimiento en el campo.`
