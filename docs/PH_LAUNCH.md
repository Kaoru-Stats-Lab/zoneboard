# Product Hunt — 準備ログ

**更新:** 2026-08-26（GA4 リアルタイム確認済 · キット文案ドラフト）  
**判定:** **キット準備中。Launch ボタンはまだ押さない。**  
**本番:** https://zoneboard.app（Cloudflare Pages · `main` 自動デプロイ）

---

## 0. いまの結論

| 項目 | 状態 |
|---|---|
| 製品の楔（OBS に足す・B でツール消す・芝に運営ロゴなし） | **Ready** |
| 公開面（英語一本・メタ・OGP PNG） | **Ready** |
| 貼れる Guide / FAQ アンカー | **Ready** |
| 認知 B/C（PNG クレジット任意 · 説明文コピー） | **Ready**（既定 OFF） |
| GA4（同意後 · `collect` · リアルタイム） | **Ready**（2026-08-26 確認） |
| PH 文案（tagline · description · first comment） | **Draft 下記 §3** — カオルが最終選定 |
| PH ギャラリー | **未撮影** — 仕様は §4 |
| 初日のつて / hunter | **なし**（必須にしない） |
| FAQ 大幅拡充 | **後**（実問が来てから） |
| Launch 日程 | **未定** — 火〜木 PT · 本人が最初の数時間貼れる日 |
| **Broadcast 交代 / 負傷表示** | **研究済 · 実装最優先**（[`BROADCAST_SUBS.md`](BROADCAST_SUBS.md)）· PH より先 |

---

## 1. 製品として揃っているもの

### LP / 製品
- OBS-first H1 · Hero → How → Can → Close
- エンドカードは LP に載せない · `/materials/`
- Press B · no account · cam/chat は OBS
- PNG 枠ドラッグ · 比率連動ズームは作らない（決定済）

### 認知 / SEO / Deep links
- B/C · OGP PNG · Guide `#place` `#draw` `#show` · FAQ 明示 id  
- 詳細は前回ログのまま（[`shareCopy.ts`](../src/site/shareCopy.ts) · [`siteMeta.ts`](../src/site/siteMeta.ts)）

### GA4
- Consent 後のみ · Broadcast では送らない  
- バグ修正: `dataLayer.push(arguments)`（`e659e9a`）· リアルタイムで `/` 確認済

---

## 2. Launch 前チェック（残り）

1. [x] GA4 リアルタイム  
2. [ ] **ギャラリー撮影**（§4）を PH 下書きにアップロード  
3. [ ] **§3 文案の最終選定**（A/B から1本）  
4. [ ] PH 下書きを保存（Scheduled でも Draft でも可 · **Launch はしない**）  
5. [ ] 本番スモーク最終: LP → Allow analytics → Open board → B → `/materials/` コピー  
6. [ ] 日程決定（火〜木 PT · 起床〜半日空いている日）  
7. [ ] Launch 当日: first comment 投稿 · X に1投稿 · Guide `#show` を返信用に控える  

やらない（本文に書かない）: 有料予告 · 競合表 · upvote お願い連投

---

## 3. 文案キット（英語 · Draft）

PH の Name は **ZoneBoard**。URL は `https://zoneboard.app`。

### Tagline（≈60字以内 · 1本選ぶ）

| ID | 文 | 字数 |
|---|---|---|
| **T1（推奨）** | Add a tactics board to tonight's OBS show | 42 |
| T2 | Football tactics board for OBS — press B, tools hide | 52 |
| T3 | Watchalong tactics board. Press B. No account. | 47 |

**推奨 T1:** LP H1 と同型。OBS / tonight が先。

### Short description（一覧・カード用 · ≈260字）

```
Browser football tactics board for OBS. Place the XI, draw the move, press B — tools hide and the pitch fills the window. Cam and chat stay in OBS. Your badge on the grass, not ours. No account.
```

（約 198 字）

### Long description（PH 本文 · 貼る用）

```
ZoneBoard is a football tactics board built for the show you already run.

Place the lineup. Draw passes, runs, and dribbles. Press B — the tools hide and the pitch fills the window. Add that window in OBS. Your cam and chat stay where they are.

• No account. Saves on your machine (up to three boards).
• Your club badge as a watermark — no ZoneBoard logo on the grass.
• Scenes for a corner, a press, a rest-defence shape.
• PNG export for Instagram, Stories, or X (drag the frame).

Not a second studio. Not a webcam inside the board. Just the pitch, ready for window capture.

Try it: https://zoneboard.app
30-second path: open board → place a few pieces → press B.
Longer guide: https://zoneboard.app/guide/#show
```

### First comment（maker · Launch 直後に貼る）

```
Maker here — thanks for looking.

I built ZoneBoard because watchalong / tactics streams need a pitch that can sit beside cam and chat in OBS — not another all-in-one overlay app, and not a vendor logo burned into the grass.

How to try in under a minute:
1. Open https://zoneboard.app (no account)
2. Open board → drop a few numbers → press B
3. Window-capture that browser in OBS (client area on)

If the pitch is blank in the encoder, you usually captured the wrong window — https://zoneboard.app/faq/#blank-encoder

I’d love notes from anyone who already runs a match show: what’s missing before you’d trust it on a real kick-off?
```

### Topics（候補 · PH UI に合わせて 3 つ前後）

- Football  
- Streaming  
- Productivity（または Design Tools / Open Source が無ければ Streaming + Football を優先）

※ UI の一覧に合わせて差し替え。**Sports** があれば Football より Sports を検討。

### サムネ / アイコン

- 既定: [`public/brand/lockup-og.png`](../public/brand/lockup-og.png)（1200×630）  
- 正方形が要る場合: [`lockup-stack-og.svg`](../public/brand/lockup-stack-og.svg) を PNG 化（`npm run brand:og` と同様の手順で 1080²）

---

## 4. ギャラリー仕様（未撮影）

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
| 午前中 | X に1投稿（LP H1 短縮 + リンク）。Discord / 知り合いへのスパムはしない |
| 日中 | コメントに Guide `#show` / FAQ `#blank-encoder` で返す |
| 夕方 | GA4 リアルタイムと `open_board` を一度見る（数値を公開しない） |

つての有無: **初日の順位より、説明が刺さるかを見る。** hunter 探しは任意・後回し。

---

## 6. 関連

- LP: [`LP_STRUCTURE.md`](LP_STRUCTURE.md) · [`COMPETITIVE_LP.md`](COMPETITIVE_LP.md)  
- OBS: [`OBS.md`](OBS.md) · Guide: https://zoneboard.app/guide/#show  
- GA4: [`AGENT_PROMPT_GA4.md`](AGENT_PROMPT_GA4.md)  
