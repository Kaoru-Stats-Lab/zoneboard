# Grok 貼り付け用 — ja App chrome + 公開 chrome 評価（このファイル全文を Grok に貼る）

> **使い方:** このファイルを **全文コピー** → Grok に 1 回貼る。  
> **出力の保存先:** `docs/i18n-draft/ja/GROK-APP-REVIEW.md`  
> **触らない:** FAQ / About / howTo 長文（Pending）

---

## ROLE

3 人のネイティブ日本語話者（LP レビューと同型）:

| ペルソナ | 見る場所 |
|----------|----------|
| **アキラ（東京）** | ツールレール · pass/run/dribble hint · 配信モード B |
| **ミユ（大阪）** | 設定 · languageHint · フィードバック · PNG 書き出し |
| **ケンジ（名古屋）** | 局面 · 確認ダイアログ · OBS 節 · Cookie / フッター注記 |

**自己チェック:** 「配信前にパネルを見て、辞書なしで何を押すか分かるか？」

## プロダクト

- **パス / ラン / ドリブル** = 線（ボール軌道 / 走るルート / 運ぶルート）
- **ペン / リンク / ゾーン**
- **配信モード（B）** = UI 隠れ · ピッチだけ OBS
- **選手** = 盤上マーカー（「駒」禁止）
- **ピッチ**（「芝」禁止）

## ボイス（正本要約）

- ボタン: 常体 · 短語
- hint: 常体 1–2 文
- 確認ダイアログだけ「〜しますか？」可
- Cookie / フッター: 公文体禁止 · 平易

## スコープ外

- FAQ · About · Guide / howTo 長文
- 新キー invent
- Short キーのレイアウト変更提案（長さ指摘は可）

---

## A. App chrome（ja · 現行ドラフト）

```json
{
  "_meta": {
    "locale": "ja",
    "scope": "app-chrome",
    "wave": "rewrite-2026-09-01"
  },
  "languageHint": "メニュー表示だけ切り替わります。ガイド・プライバシーなどは英語のまま。ピッチ上の名前は変わりません。",
  "drawer": "パネル",
  "pieceHome": "ホーム",
  "pieceAway": "アウェイ",
  "passHint": "パス＝ボールの軌道（クロス・シュート含む）。選手は動かない。",
  "runHint": "ラン＝走るルート。選手をドラッグ。",
  "dribbleHint": "ドリブル＝運ぶルート。選手をドラッグ。",
  "penHint": "ペン＝ピッチに固定する自由線。Shift+ドラッグで直線。追従はリンク。",
  "linkHint": "リンク＝選手をクリックして直線でつなぐ。同じ選手・空き・Enter で確定。Esc で取消。",
  "linkDraftStatus": "リンク中: {n}人 · Escで取消",
  "ballSnapHint": "ボールを選手に重ねて離すと吸着。選手を動かすと一緒に動く。",
  "pieceSwapHint": "ピッチの選手をベンチ側にドロップで交代。人数オーバー可（解説用）。",
  "feedbackHint": "任意。返信はしません。ボードの中身は書かないでください。",
  "feedbackSent": "送信しました。ありがとうございます。",
  "obsSection": "OBS で使う",
  "obsIntro": "推奨: ウィンドウキャプチャ + 配信モード + 1920×1080",
  "obsBrowserWarn": "ブラウザソースは別プロファイルのため、この Chrome のボードは映りません。使わないでください。",
  "obsSettingsWarn": "配信中は設定を開かないでください。モーダルがキャプチャに写ります。",
  "obsFocusCapture": "選手を動かすときは、キャプチャ中のブラウザをクリックしてフォーカスを戻す。",
  "obsFocusObs": "OBS のプレビューをクリックするとフォーカスが移り、選手が動きません。",
  "obsStep4": "60 fps 推奨（選手ドラッグが滑らか）",
  "deleteHint": "パス＝破線、ラン＝実線、ドリブル＝波線。選んで Delete。",
  "scenesHint": "動かす前に局面を複製。元は [ ] で戻せる。配信中は右下の複製ボタン。",
  "exportHint": "配信は横、SNS 投稿は縦が映える。",
  "presetIg45": "縦 4:5（IG / Threads · いちばん映える）",
  "bakeCaptionHint": "既定オフ。キャプションは投稿文で書く人がほとんど。PNG の下枠だけ。",
  "confirmSport": "競技を変えると配置がリセットされます。続けますか？",
  "confirmClear": "選手と描画をすべて消しますか？",
  "confirmBench": "サブ人数を変えると配置をやり直します。続けますか？",
  "confirmClearDrawings": "パス・ラン・ゾーンなどの描画をすべて消しますか？",
  "resetBoard": "選手と描画を全消去",
  "applyLineupHint": "名簿どおりに両チームを載せ直す（描画は消えます）。",
  "showPlayerNamesHint": "この試合だけ。名簿の名前をピッチ上に表示。サイズは選手マーカーに連動。",
  "matchBannerHint": "配信・編集プレビューで画面上部に表示。スコアは得点から自動。",
  "teamFocusHint": "試合前後の準備用。選手は残したまま表示だけ切替。",
  "viewFocusHint": "Ctrl+ホイールでズーム、Space+ドラッグまたは Alt+ドラッグでパン。画角は局面ごとに保存。",
  "exportPreviewHint": "暗い外側は書き出しに入りません。試合帯は配信用で PNG には入りません。ウィンドウをドラッグして確認。",
  "pieceProps": "選手",
  "pieceSize": "選手サイズ",
  "showPlayerNames": "名前ピル（ピッチ上）",
  "exportFocusHint": "縦・正方形はピッチをクロップします。全体を枠に入れるなら 16:9 かピッチ比。",
  "wipeDrawingHint": "最後の描画、または選択中の線・ゾーン。選手は残る。Ctrl+Z でも戻せます。",
  "newSceneHint": "選手・線・画角をコピー。元の局面は残り、[ ] で戻せる。",
  "captureImportPlaceHint": "下敷きを見ながら選手を置く。確定後は下敷きは消える。",
  "sceneMirrorEndsHint": "前後半のエンドチェンジ。この局面の選手・線・ボールをピッチ中心で180°回転。"
}
```

## B. 公開 chrome（フッター · Settings · Cookie · 404）

```json
{
  "siteNavEnTitle": "ガイドなどの長文は英語版です",
  "languageHint": "メニュー表示だけ切り替わります。ガイド・プライバシーなどは英語のまま。下のリンクから日本語 LP を開けます。ピッチ上の名前は変わりません。",
  "languageLandingLink": "日本語のトップへ",
  "localeSuggestBody": "ZoneBoard を{lang}で見ますか？",
  "localeSuggestGo": "開く",
  "localeSuggestDismiss": "English のまま",
  "cookieChoices": "Cookie の選択",
  "notFoundTitle": "ページが見つかりません",
  "notFoundCopy": "アドレスが違うか、ページが移動しました。戦術ボードは使えます。",
  "notFoundOpenBoard": "ボードを開く",
  "notFoundHome": "ホーム",
  "privacySummaryHeading": "各言語の要約",
  "consentTitle": "プライバシーの選択",
  "consentCopy": "計測と広告は、選ぶまでオフです。ボードはこの端末に残ります。",
  "consentReject": "任意の Cookie を拒否",
  "consentAnalytics": "計測を許可",
  "consentAds": "広告を許可",
  "consentPolicyLabel": "Cookie ポリシー",
  "consentChoices": "Cookie の選択"
}
```

## C. en 参照（App 主要キー）

```json
{
  "languageHint": "Switches board menus only. Guide, privacy, and other reading pages stay in English. Piece names on the pitch stay as you typed them.",
  "passHint": "Pass = ball path (includes crosses and shots). Pieces stay put.",
  "runHint": "Run = movement without the ball. Drag a piece.",
  "dribbleHint": "Dribble = movement with the ball. Drag a piece.",
  "penHint": "Pen = free line fixed on the grass. Shift+drag for straight. Use Link to follow pieces.",
  "linkHint": "Link = click pieces to join with a straight line. Same piece, empty grass, or Enter to finish. Esc cancels.",
  "obsBrowserWarn": "Browser Source is a different profile — the board you move in this Chrome will not show. Do not use it.",
  "confirmClear": "Clear all pieces and drawings?",
  "resetBoard": "Clear all pieces and drawings"
}
```

---

## やること

1. **パネル 5 秒テスト**（3 人 · 「何を押す？」）
2. **語彙:** 駒 / 芝 残存 · 「選手」の自然さ · 「選手サイズ」「名前ピル」のダサさ
3. **OBS 節:** 読めるか · 威圧的でないか
4. **確認ダイアログ:** 「続ける」の温度 · 怖すぎないか
5. **公開 chrome:** Cookie 文言 · フッター注記 · 404 のトーン
6. **ダサい箇所 top 10**（1 行代替）— 実装優先は **top 5** に絞る
7. **CMO:** 出荷可 / 要修正 · **優先修正 top 5**（必須）:

| # | キー | 現行 | 提案 | 理由（1 行） |
|---|------|------|------|--------------|

※ キー invent 禁止。FAQ/About/howTo は提案しない。

---

## 出力フォーマット（この順 · 日本語）

```
## 5 秒テスト
### アキラ
### ミユ
### ケンジ

## 語彙チェック
（駒/芝 · 選手まわり）

## OBS / 確認ダイアログ

## 公開 chrome（Cookie · フッター · 404）

## ダサい箇所 top 10
| # | キー | 現行 | 提案1行 |

## 優先修正 top 5（実装用）
| # | キー | 現行 | 提案 | 理由 |

## CMO 判定
出荷可 / 要修正 — 1 文
```
