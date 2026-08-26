# Product Hunt — 準備ログ

**更新:** 2026-08-26（本番スモーク完了 · `/board` 直リンク修正済）  
**判定:** **Draft Ready + スモーク Ready。次は日程（火〜木 PT）。ギャラリー後回し。Launch / Schedule はまだ。**  
**本番:** https://zoneboard.app（Cloudflare Pages · `main` 自動デプロイ）  
**X:** [@usezoneboard](https://x.com/usezoneboard)（公式 · bio 更新済 · 旧 waitlist ピン解除）  
**PH Draft:** https://www.producthunt.com/products/zoneboard-for-obs · `product_id=1301976` · **未 Schedule · Launch しない**

---

## 0. いまの結論

| 項目 | 状態 |
|---|---|
| 製品の楔（OBS に足す・B でツール消す・芝に運営ロゴなし） | **Ready** |
| 公開面（英語一本・メタ・OGP PNG） | **Ready** |
| 貼れる Guide / FAQ アンカー | **Ready** |
| 認知 B/C（PNG クレジット任意 · 説明文コピー） | **Ready**（既定 OFF） |
| GA4（同意後 · `collect` · リアルタイム） | **Ready**（2026-08-26 確認） |
| Broadcast 交代 / PK 帯 / ライブ Undo | **Ready**（本番） |
| 公開 Updates（[`/updates/`](https://zoneboard.app/updates/)） | **Ready** |
| X 公式 [@usezoneboard](https://x.com/usezoneboard) | **Ready**（bio · ピン解除 · Launch 当日に1投稿） |
| PH Draft（Name · T1 · Free · Shoutouts · Maker） | **Ready**（Promo 欄の例文はプレースホルダ · 無視） |
| 本番スモーク | **Ready**（2026-08-26 · `/board` は `/board/` へ正規化して 200） |
| PH ギャラリー | **後回し**（仕様は §4 · Launch 直前で可） |
| 初日のつて / hunter | **なし**（必須にしない） |
| FAQ 大幅拡充 | **後**（実問が来てから） |
| Launch 日程 | **未定** — 火〜木 PT · 本人が最初の数時間貼れる日 |

---

## 1. 製品として揃っているもの

### LP / 製品
- OBS-first H1 · Hero → How → Can → Close
- エンドカードは LP に載せない · `/materials/`
- Press B · no account · cam/chat は OBS
- PNG 枠ドラッグ · 比率連動ズームは作らない（決定済）
- Post framing ラベルを正直化（全体ズーム ≠ 縦枠に芝全部）

### 認知 / SEO / Deep links
- B/C · OGP PNG · Guide `#place` `#draw` `#show` · FAQ 明示 id  
- Updates: [`CHANGELOG_PUBLIC.md`](CHANGELOG_PUBLIC.md) · `src/site/changelog.ts`
- X: [@usezoneboard](https://x.com/usezoneboard)
- `/board` ハードリンク: `board/index.html` をビルド出力（`4c7e70d`）

### GA4
- Consent 後のみ · Broadcast では送らない  
- バグ修正: `dataLayer.push(arguments)`（`e659e9a`）· リアルタイムで `/` 確認済

---

## 2. Launch 前チェック（残り · ギャラリー後回し）

1. [x] GA4 リアルタイム  
2. [x] Broadcast 最低限（交代記号 · PK 帯 · Undo）  
3. [x] **§3 文案確定**（**T1**）  
4. [x] **PH 下書き**（`ZoneBoard for OBS` · Free · Cursor/Vite/Cloudflare · Promo プレースホルダ無視 · **Launch しない**）  
5. [x] **X プロフィール**（§3.5 · bio 更新 · 旧 waitlist ピン解除）  
6. [x] 本番スモーク: LP → Open board → B → `/materials/` · `/updates/` · `/board`（→ `/board/`）· `/board/?broadcast=1`  
7. [ ] 日程決定（火〜木 PT · 起床〜半日空いている日）  
8. [ ] **ギャラリー撮影**（§4）— Launch 直前で可 · 下書き後でも差し替え可  
9. [ ] Launch 当日: first comment · **@usezoneboard で X 1投稿**（§3.5） · Guide `#show` 控え  

やらない（本文に書かない）: 有料予告 · 競合表 · upvote お願い連投

---

## 3. 文案キット（英語 · 確定）

URL は `https://zoneboard.app`。

### Name of the launch（≤40 · 確定推奨）

`ZoneBoard` 単体（9字）だと何の製品か伝わらない。**OBS を名前に載せる。**

```
ZoneBoard for OBS
```

（17/40）— 「これ」は OBS 用戦術ボード、と言い切る。Tagline と役割分担（Name=何 / Tagline=今夜のショーに足す）。

| 候補 | 字数 | メモ |
|---|---|---|
| **ZoneBoard for OBS**（推奨） | 17 | 最短で楔。PH でも探しやすい |
| ZoneBoard — OBS tactics board | 29 | 「tactics board」まで名前に入れる派 |
| ZoneBoard: tactics for OBS | 26 | やや説明的 |
| ZoneBoard for OBS streams | 25 | streams は冗長気味 |

避ける: `ZoneBoard` だけ · press B を Name に入れる（Tagline / First comment の仕事）

### Tagline（確定）

```
Add a tactics board to tonight's OBS show
```

（旧候補 T2 / T3 は不採用。LP H1 と同型。）

### Short description（一覧・カード用 · ≈260字）

```
Browser football tactics board for OBS. Place the XI, draw the move, press B — tools hide and the pitch fills the window. Cam and chat stay in OBS. Your badge on the grass, not ours. No account.
```

（約 198 字）

### Description of the launch（PH · **≤500** · 貼る用）

PH UI の「Description of the launch」は **500 字制限**。旧 Long（〜847）は入れない。詳細は First comment / Guide へ。

```
ZoneBoard is a football tactics board for the show you already run.

Place the lineup. Draw the move. Press B — tools hide and the pitch fills the window. Add that window in OBS. Cam and chat stay where they are.

• No account · local save (up to 3 boards)
• Your badge on the grass — not ours
• Scenes + PNG export for posts

Not a second studio. Just the pitch, ready for window capture.

https://zoneboard.app
Guide: https://zoneboard.app/guide/#show
```

（約 453 字 · 改行込み）

### First comment（maker · Launch 直後に貼る）

```
Maker here — thanks for looking.

I built ZoneBoard because watchalong / tactics streams need a pitch that can sit beside cam and chat in OBS — not another all-in-one overlay app, and not a vendor logo burned into the grass.

How to try in under a minute:
1. Open https://zoneboard.app (no account)
2. Open board → drop a few numbers → press B
3. Window-capture that browser in OBS (client area on)

If the pitch is blank in the encoder, you usually captured the wrong window — https://zoneboard.app/faq/#blank-encoder

Updates: https://zoneboard.app/updates/
X: https://x.com/usezoneboard

I’d love notes from anyone who already runs a match show: what’s missing before you’d trust it on a real kick-off?
```

### Launch tags（最大 3 · 推奨）

| 優先 | Tag | 理由 |
|---|---|---|
| 1 | **Football** | 楔そのもの（類似: Telestrator も Football） |
| 2 | **Streaming** | OBS / watchalong。無ければ **Sports** |
| 3 | **Design Tools** | ボード / 作図。無ければ **Video** |

避ける: Artificial Intelligence · Marketing · Productivity（刺さらない）  
Soccer と Football が両方あるなら **Football のみ**（二重にしない）。

### Shoutouts（「products that helped」· 推奨 3）

**嘘のないものだけ。** 使っていない人気枠は足さない。典型は 3 本。

| # | 製品（PH で検索） | 理由 | レビュー文（貼る用 · 短く） |
|---|---|---|---|
| 1 | **Cursor** | 実装・ドキュメント・反復の主戦場 | Built ZoneBoard end-to-end in Cursor — canvas, broadcast UI, and the English launch kit. Shipping speed without losing the OBS-first product line. |
| 2 | **Vite** | `vite` で build / HMR | Vite keeps a canvas-heavy React board snappy in local and small enough for Cloudflare Pages. |
| 3 | **Cloudflare Pages**（「Cloudflare」でも可） | 本番ホスト · Functions · 自動デプロイ | zoneboard.app runs on Cloudflare Pages — git push to main, global CDN, and a tiny feedback Function. Boring infra is the point. |

**4本目が要るときだけ:**

| 製品 | 使う条件 |
|---|---|
| **React** | Vite と二重に感じるならスキップ。UI ライブラリとして明示したいとき |
| **OBS Studio** | PH に製品ページがある場合のみ。製品の前提ソフトなので誠実 |
| **GitHub** | Issues 経由フィードバックを強調したいとき |

やらない: Canva / Figma（UX の「慣れ」参照のみ · ビルド依存ではない）· 未使用の AI SaaS · upvote 目当ての相互フォロー枠

**Draft 修正済（2026-08-26）:** Name=`ZoneBoard for OBS` · Pricing=Free · Shoutouts=Cursor/Vite/Cloudflare · Promo なし。Preview で Built with が一致していることだけ再確認。

### Embed / Follow badge

PH Embed タブの HTML（`product_id=1301976`）は **メモのみ。LP には今載せない**（Draft · フォロワー0 · ヒーローを汚す）。

- Launch 後（または Schedule 後）に LP フッターへ小さな Follow を足すか検討  
- サイトへ入れるなら **small + dark**（86×32）のみ。Hero / How には置かない  

```html
<a href="https://www.producthunt.com/products/zoneboard-for-obs?utm_source=badge-follow&utm_medium=badge&utm_source=badge-zoneboard-for-obs" target="_blank" rel="noopener noreferrer"><img src="https://api.producthunt.com/widgets/embed-image/v1/follow.svg?product_id=1301976&theme=dark&size=small" alt="ZoneBoard for OBS on Product Hunt" width="86" height="32" /></a>
```

### サムネ / アイコン

- 既定: [`public/brand/lockup-og.png`](../public/brand/lockup-og.png)（1200×630）  
- 正方形が要る場合: [`lockup-stack-og.svg`](../public/brand/lockup-stack-og.svg) を PNG 化（`npm run brand:og` と同様の手順で 1080²）

---

## 3.5 X — [@usezoneboard](https://x.com/usezoneboard)

**使う。** Launch 当日の告知はここから 1 本。個人垢との二重投稿はしない（スパム感を避ける）。

### 済（2026-08-26）

- [x] Bio を OBS-first に更新  
- [x] 旧 waitlist ピンを解除（タイムライン上の旧 β 投稿は残ってよい · ピンだけ外す）  
- Website リンクは bio 内 `zoneboard.app` で可（プロフィール URL 欄があれば `https://zoneboard.app`）

### Launch 当日投稿（1本 · 貼る用）

```
ZoneBoard is live on Product Hunt.

Add a tactics board to tonight’s OBS show. Press B — tools hide, the pitch fills the window. Cam and chat stay in OBS. No account.

→ https://zoneboard.app
PH: [paste Product Hunt link]
Guide: https://zoneboard.app/guide/#show
```

（PH URL は Launch 後に差し替え。ギャラリー GIF ができたら画像添付可 · 無くても本文だけで出す。）

### やらない

- upvote お願い連投  
- 「β受付中」系の旧コピーの再利用  
- waitlist Form の再リンク  

---

## 4. ギャラリー仕様（後回し · Launch 直前）

**目的:** 3 秒で「OBS に足すボード / B でツールが消える」が分かること。  
**禁止:** エンドカードをメインにする · 競合比較 · 長い設定ツアー。

| # | 素材 | 長さ | 内容 |
|---|---|---|---|
| G1 | **Hero GIF or MP4**（最重要） | 4–8 秒 | 編集 UI → **B** → ツール消えピッチ全面。可能なら画面端に OBS の窓シルエット or 実際の Window Capture プレビュー |
| G2 | Still | — | Broadcast モードのピッチ（番号が読める）。スタジオ黒 chrome |
| G3 | Still or short | — | Place → Draw（パス1本）のワンカット。短く |
| G4 | Logo | — | lockup-og.png |

### G1 撮影レシピ（OBS なしでも可）

1. Chrome を 1920×1080 付近に  
2. `/board` · 芝が見える配置を少し作る  
3. 画面録画開始 → **B** → 2 秒静止 → Esc → 停止  
4. 4–8 秒にカット · テキスト重ねは不要（PH が自動で騒がしくなる）  

OBS がある日: 同じ手順のあと、OBS プレビューに Window Capture が入っている状態を 2 秒足すと強い。

書き出し置き場（提案）: `docs/ph-assets/`（git に載せるなら小さい GIF。大きい MP4 は Drive / ローカルのみでも可）

---

## 5. 当日ランブック（Launch 日）

**TZ:** Product Hunt は太平洋時間。火〜木の 00:01 PT 前後が定石。

| 時刻感 | やること |
|---|---|
| Launch 直後 | First comment（§3）を投稿 |
| +10 分 | 自分で製品を開き直す · リンク切れ確認 |
| 午前中 | **@usezoneboard** で X 1投稿（§3.5）。Discord / 知り合いへのスパムはしない |
| 日中 | コメントに Guide `#show` / FAQ `#blank-encoder` で返す |
| 夕方 | GA4 リアルタイムと `open_board` を一度見る（数値を公開しない） |

つての有無: **初日の順位より、説明が刺さるかを見る。** hunter 探しは任意・後回し。

---

## 6. 関連

- LP: [`LP_STRUCTURE.md`](LP_STRUCTURE.md) · [`COMPETITIVE_LP.md`](COMPETITIVE_LP.md)  
- OBS: [`OBS.md`](OBS.md) · Guide: https://zoneboard.app/guide/#show  
- Updates: https://zoneboard.app/updates/ · [`CHANGELOG_PUBLIC.md`](CHANGELOG_PUBLIC.md)  
- X: https://x.com/usezoneboard  
- GA4: [`AGENT_PROMPT_GA4.md`](AGENT_PROMPT_GA4.md)  
