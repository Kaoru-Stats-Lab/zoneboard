# 言語市場とローカライズ — 決定ログ

**更新:** 2026-09-01（**es · pt · pl · de · fr · tr 出荷済** · 第2波完了）  
**きっかけ:** PH 公開面を英語一本にしたあと、「5大リーグ分（英西伊独仏）の UI 翻訳が要るか」→ 天皇杯同時視聴の壁打ち用に **ボード chrome だけ JA** を開放。  
**結論:** 市場は広い。ただし **リーグ ≠ 言語**。公開デフォルトは英語。**第1波** es → pt-BR → pl は **出荷済**（2026-08-31）。**第2波** **de · fr · tr 出荷済**（2026-09-01）。イタリア語（it）は流入トリガーまで保留。

関連: [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) §4-3 · [`SPEC.md`](SPEC.md) §9 · [`BACKLOG.md`](BACKLOG.md) B-035–037 · [`FUTSAL_BEACH_RESEARCH.md`](FUTSAL_BEACH_RESEARCH.md) · [`OUTREACH_EU_STREAM.md`](OUTREACH_EU_STREAM.md) §2F

---

## 0. 一言で

5大リーグは **中身の地図**（キット・フォーメ・大会の見え方）で、プロダクト言語の単位ではない。配信者がボードに書く名前はすでに多言語。足りないのは chrome の翻訳ではなく、あとで足す **別パスのロケール** と、課金とは独立した **決済レイヤ**。

公開面に FR/DE/ES/IT を同じ URL へ積むのはやらない。**ボード chrome の JA** は同じ `/board` 上の prefs 切替（下記 §1）。

---

## 1. いまの実装（2026-09-01）

| 面 | 言語 |
|----|------|
| LP・法務・Guide・静的ページ | **英語**（`APP_LOCALE = "en"`）＋ **`/es/` `/pt/` `/pl/` `/de/` `/fr/` `/tr/`** 各ロケール LP |
| ボード chrome（メニュー・Settings・How-to・Feedback） | **デフォルト EN。** Settings · `?lang=` · `/ja/board` … `/tr/board` |
| 永続化 | `localStorage` の `zoneboard:v1:prefs` に `locale: "en" \| "ja" \| "es" \| "pt" \| "pl" \| "de" \| "fr" \| "tr"`。**ボード JSON（駒・局面）とは別** |
| ピッチ上の駒名・クラブ名 | ユーザ入力のまま（切替しても上書きしない）。フォントはラテン拡張・キリル・日本語を守る（[`STUDIO.md`](STUDIO.md)） |
| 選手・ロスター DB | **持たない。** 贔屓クラブの「完璧データ」は配信者の頭と駒上の手入力。製品として J リーグ/選手マスタは載せない |
| アラビア語・ヘブライ語（RTL） | Later（同） |

### URL

| 入口 | 挙動 |
|------|------|
| `/board` | prefs の locale（未設定なら EN） |
| `/board?lang=ja` | 一度 JA を prefs に保存し、クエリから `lang` を消す（URL は `/board` に戻る） |
| `/ja/board` · … · `/tr/board` | `/board/?lang=<locale>` へ 301 |
| `/es/` · … · `/tr/` | 各ロケール LP（`dist/<locale>/index.html`） |
| `/` · `/ja` · `/ja/` | LP は英語。`/ja` `/ja/` は `/` へ 301（**日本語 LP 面はまだ無い**） |

OBS は **ウィンドウキャプチャ**（Browser Source ではない）。言語は配信者マシンの prefs。配信モードでも **最小 chrome**（局面・ツール・試合操作）はタッチ向けに残る（[`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) 決定ログ 2026-08-28）。OBS で芝だけ取るのはキャプチャ領域の運用。

PH と欧州戦術・OBS まわりの共通語は英語。同じ LP URL に第二言語を載せない。

---

## 2. 層を分ける

| 層 | 何か | 5大リーグとの関係 | 今やること |
|----|------|-------------------|------------|
| **A. ピッチの字** | 背番号・名前・クラブ | どのリーグでもユーザが書く | 済（フォント） |
| **B. 中身プリセット** | キット色・フォーメ・画角 | ここが「5大」の本体 | 需要があれば翻訳より先 |
| **C. プロダクト chrome** | ツール名・How-to・LP・法務 | 配信者の**言語市場** | 英語一本。次はデータ |
| **D. 決済・税・価格** | Stripe 国、通貨、VAT、無料/Pro | 言語と独立 | UI 翻訳より後でも先でも切れる |

C を5本半訳で出すコストは、ガイドを直すたびに5倍。D は英語 UI のまま欧州課金できる。逆に FR だけ先に出しても決済が USD だけならアフリカ仏語圏には届きにくい。

---

## 3. 調査で分かったこと（代理指標）

**戦術ボード配信者の言語分布は公開データがない。** 母語人口・YouTube 国別ユーザ・権利者の言語戦略で切る。推測は推測と書く。

### 3-1. 話者（おおよそ 2024–2026）

出典の数字は年次・L1/L2 定義で揺れる。順位だけ使う。

| 言語 | L1 の目安 | 合計の目安 | サッカーで効く地理 |
|------|-----------|------------|-------------------|
| 英語 | ~3.8億 | ~14億+ | プレミア＋世界の戦術・OBS・PH |
| スペイン語 | ~4.8億 | ~5.5億 | スペイン＋中南米。リーガより大きい |
| ポルトガル語 | ~2.4億 | ~2.6億 | **ほぼブラジル**。伊語より先 |
| フランス語 | L1 は独語並み (~0.7–0.8億) | ~3億（L2 が本体） | フランス＋**アフリカ仏語圏** |
| ドイツ語 | ~0.76億 | ~1.3億 | 主に DACH。国外は英語フィードが多い |
| イタリア語 | ~0.64億 | それ以下 | ほぼ国内＋ディアスポラ |
| **ポーランド語** | **~0.39億** | **~0.45億** | **Ekstraklasa · 代表 · CEE ハブ。** 英語 UI でも回るが **未ローカライズの niche ツールは珍しい → 感謝度が高い**（推測 · 現場未検証） |

仏語の広がりは L1 ではなく L2。アフリカ仏語は L1+L2 で **約 1.67億**（2024、Wikipedia *African French* / Ethnologue 系）。本国フランスの延長ではない。**本国フランス配信者は英語 SaaS に慣れており、fr chrome の wow  factor は pl より低い可能性**（推測 · CPO 判断 2026-08-31）。

### 3-2. YouTube 国別ユーザ（配信面の粗い代理）

World Population Review 2025 前後。言語推定より国のほうが硬い。

| 国 | ユーザ目安 | 言語 |
|----|------------|------|
| ブラジル | ~1.44億（世界3位級） | pt-BR |
| メキシコ | ~0.84億 | es |
| ドイツ | ~0.66億 | de |
| フランス | ~0.50億 | fr |
| イタリア | ~0.42億 | it |
| スペイン | ~0.40億 | es |
| アルゼンチン + コロンビア | ~0.63億 | es |
| **ポーランド** | **~0.28億**（推計） | **pl** |

スペイン本国より **es の中南米合計**が大きい。イタリアはスペイン本国と同規模だが、西語は国が複数ある。**ポーランドは単一国 ~3800万人だが、サッカー消費・配信文化は厚い**（推測）。

サッカー消費の例（言語市場の厚さ。ボード需要そのものではない）:

- ブラジル: 2024 に YouTube ブラジルでサッカー関連 **20億時間**超（Lance! / Google 発表系）
- アフリカ: CAN 2025 の権利は Canal+（仏）＋ SuperSport（英・葡＋現地語）。大陸は **多言語** であって Ligue 1 の仏語化ではない
- ブンデス: 国際向けは **英語 world feed** が既定。UK では YouTube 無料枠。AI で西語・アラビア語グラフィックも試している（リーグ自身が「独語一本」ではない）

### 3-3. ウェブサイト言語シェア（参考、弱い）

英語が約半分。西語と独語がサイト数では近い（Statista / W3Techs 系、2025）。**サイト数 ≠ サッカー配信者**。独語圏は文書が多く、西語圏は視聴が多い、が起きうる。

### 3-4. 測れていないこと

- 戦術図＋OBS を使う人数の言語内訳
- 仏語アフリカの **課金可能な** 配信者数（視聴熱と決済は別）
- 独語の SaaS 支払い意欲（話者は少ないが CPM・B2B は高い、という一般論はボードに未検証）
- アラビア語・ヒンディー: YouTube は大きいが RTL / 別ジョブ。5大の話ではない。STUDIO どおり Later

### 3-5. 現場メモ（在独 YouTuber · 2026-08-26）

**英語ができる ≠ 仕事のやり取りも英語でよい。** 製品 UI・LP は英語のままでも、独圏への DM / 壁打ち文面は **ドイツ語優先**（[`OUTREACH_EU_STREAM.md`](OUTREACH_EU_STREAM.md) §1 · §2-D）。これは **UI の de を es より先に切る理由にはしない** — 営業言語と chrome ローカライズは別チケット。

---

### 3-6. ローカライズ ROI — 人口 vs 喜ばれ度（2026-08-31 · CPO）

| 軸 | fr | pl |
|----|----|-----|
| L1 人口 | 大きい | **小さい（~3900万）** |
| 英語 UI で足りる層 | **厚い**（本国 · 配信ツール） | 中程度（若い streamer は EN 可 · UI は母語が嬉しい） |
| 同種 niche ツール | 英語 + 仏語 SaaS が多い | **戦術ボード配信向け pl は希少** |
| 期待反応 | 「ふーん」（L2 含むと薄い） | **「ついに pl 版」感**（推測 · 要 Grok/現場） |
| ZoneBoard の楔 | OBS · B · 無登録 — 言語以前の差 | 同左 · **母語 LP が口コミの点火剤になりやすい** |

**決定（第1波 · 2026-08-31 まで）:** 第 3 ロケールは **pl**（fr より先 — niche の感謝度）。**出荷済。**

### 3-7. Deep Research — DACH · フランス · トルコ（2026-08-31）

**出典:** 社内 Deep Research（クリエイター市場 · 既存ツール · シミュレーション）。一次検証前。**推測は推測と書く。**

#### 市場の厚さ（戦術ボード需要の代理）

| 語圏 | 熱量 | 代表クリエイター / メディア | コンテンツスタイル |
|------|------|------------------------------|-------------------|
| **DACH（de）** | **極めて高** — 「Taktik-Nerd」文化 | Spielverlagerung · Bohndesliga · Calcio Berlin · Manu Thiele · Tobias Escher | 試合前後の**本格戦術解剖** · Halbraum · Gegenpressing 等の用語体系 |
| **fr** | **非常に高** — YouTube 戦術解説成熟期 | Wiloo（60万+）· Le Coach · Piotr Foot | ピッチを動かす Play-by-Play · ディープ分析＋トーク |
| **tr** | **熱量最大級** — SNS 拡散主体 | Uğur Karakullukçu · Emre Özcan · MertAbi · 3大クラブ Watchalong 多数 | **リアルタイム感情・討論** ＞ 静かな戦術解剖。試合前 **Kadro（予想スタメン）** の X 拡散 |

#### 既存ツールと ZB の隙間

| 語圏 | 主な利用 | 不満 / 隙間 |
|------|----------|-------------|
| **de** | TACTICALista · TacticalPad · Metrica · PPT | プロ向け 3D は**重い**。個人 YouTuber は「配信中にさっと動かせない」 |
| **fr** | Metrica · TacticalPad · スライド / 紙 | アナリスト層は Metrica。ライト層は画像代用 → **ブラウザ即起動** の潜在需要 |
| **tr** | 簡易 Web ボード · 画像ペースト · 物理板 | Metrica 率低。**10 秒で綺麗な Kadro 画像 → X** が最優先 |

#### 語圏別 Must（UI 翻訳以外）

| 語圏 | 必須要件 | ZB 現状 |
|------|----------|---------|
| **de** | Halbraum 用 **5 レーン分割** · Gegenpressing 等の用語 · GDPR/ローカル訴求 | **5 レーン実装済**（`lanes5`）。de UI と LP で Halbraum を前面訴求可 |
| **fr** | 直感的戦術用語（Bloc bas/haut · Relance · Coup franc）· Pass vs Run の線種明確化 | Pass/Run 線種 **済**。fr UI が主タスク |
| **tr** | Kadro/Diziliş 用語 · **ロゴなし PNG 即 Export** · スタメン議論向け軽量さ | Broadcast + Export **済**。tr UI は軽量アプローチで可 |

#### シミュレーション（カテゴリ内シェア最大化の粗い確率）

モデル: \(P = F \times (1-S) \times \beta\)（Fit · 乗換障壁 · 口コミ係数）。**ZoneBoard 固有の検証ではない。**

| パラメータ | DACH | fr | tr |
|------------|------|-----|-----|
| ニーズ一致度 \(F\) | **95%** | 85% | 70% |
| 乗換障壁 \(S\) | **15%** | 30% | **10%** |
| 口コミ \(\beta\) | 1.4 | 1.2 | **1.8** |
| 推定アクティブシェア | **35–45%** | 25–35% | 15–25% |
| シェア最大化確率 | **78%** | 62% | 45% |

**解釈:** de はプロダクト思想（軽量 · ローカル · 5 レーン）との **Fit が最高**。fr はトップ YouTuber 1–2 名の画面露出で一気に伸びうる。**tr** はバズは最大だが **戦術ツールとしての定着はブレやすい** — フル UI より「10 秒 Kadro 画像ジェネレーター」訴求が費用対効果高い。

#### マーケティングの芯（第2波）

| 語圏 | コアメッセージ | アクション例 |
|------|----------------|--------------|
| **de** | *Die schnellste 2D-Taktiktafel — server-frei & sofort bereit* | r/fussball · Spielverlagerung 読者 · **Halbraum ワンクリック** · GDPR/アカウント不要 |
| **fr** | *Le tableau tactique instantané pour vos débriefs et live streams* | Wiloo / Le Coach へのデモ · Pass vs Appel de balle 訴求 |
| **tr** | *10 saniyede harika 2D kadro görseli* | ビッグマッチ前の X 画像 · Twitch Watchalong 向けフリップ |

詳細 DM 文面: [`OUTREACH_EU_STREAM.md`](OUTREACH_EU_STREAM.md) §2-D（de は **営業文面を DE 優先** — UI ローカライズとは別）。

**第2波ローカライズ決定:** **de → fr → tr**。it は触らない。

---

## 4. 決定（2026-08-24 · 2026-08-31 改定）

1. **公開デフォルトは英語。** `/` と静的ドキュメントは EN。Accept-Language で JA に飛ばさない（SPEC 旧稿を廃止）。
2. **同じ LP URL に第二言語を積まない。** 公開面を足すときは `/es/` `/pt/` `/pl/` **`/de/` `/fr/` `/tr/`** のように面を分ける。**ボード chrome の JA** は同じ `/board` 上の prefs / `?lang=`（§1）で足りる。`/ja/` のフル LP はまだ切らない。
3. **UI ローカライズは2波。** **第1波（済）:** es → pt-BR → pl。**第2波（次）:** **de → fr → tr**（§3-7 Deep Research）。5大リーグ順ではない。it は流入トリガーまで。
4. **日本語**はボード chrome で Settings / deep link 可。PH・LP には出さない。フル `/ja/` LP は流入を見てから。
5. **5大リーグ向けに先にやるなら C ではなく B。** キットとフォーメ。翻訳の代用にしない。**選手ロスター DB も C の代用にしない**（ユーザ入力）。
6. **決済・税・価格は C と同時にやらなくてよい。** 英語のまま欧州課金は可。現地通貨は言語面とは別チケット。
7. **半訳を5本出さない。** PH 後に Analytics / フィードバックの `locale` / 国を見て、1言語ずつ。

トリガー（次の1本を切る目安）:

- 公開面の参照が特定言語圏に偏る
- フィードバックや問い合わせが特定言語で続く
- 英語 UI のまま使われているが、How-to が読まれない国が厚い

第2波 **完了**（de · fr · tr）。**it** の `messages` は触らない。

既存メモ: [`BACKLOG.md`](BACKLOG.md) B-035–037 · B-074（pl **済**）· **B-075–077（de/fr/tr 済）**。2026-09-01: 第1波 · 第2波 **出荷完了**。

---

## 5. ソース（調査日 2026-08-24）

話者: Ethnologue 系の二次整理（Wikipedia *List of languages by total number of speakers* / *native speakers*、Babbel 2026 まとめ）。アフリカ仏語: Wikipedia *African French*（L1+L2 ~1.67億, 2024）。

YouTube 国別: World Population Review *YouTube Users by Country*（2025 推計）。ブラジルサッカー時間: Lance!（Google イベント、2024）。CAN 権利: Canal+ Group / SuperSport 発表（2025-11、仏英葡＋現地語）。ブンデス国際フィード: SVG Europe / Bundesliga International。

SaaS の「英語で出して、需要が出てから1言語ずつ」は一般論。ZoneBoard 固有の検証ではない。

Deep Research（2026-08-31）参照 URL:

- [Breaking the Lines — tactics YouTubers](https://breakingthelines.com/@btl/some-tactics-obsessed-football-youtubers-to-watch)
- [YouTube — Wiloo 系](https://www.youtube.com/watch?v=eiNQziewt4s) · [Le Coach 系](https://www.youtube.com/watch?v=qhJtEz1DdSg) · [DACH 戦術](https://www.youtube.com/watch?v=YxK4j9XujzY)
- [r/footballtactics — channel recommendations](https://www.reddit.com/r/footballtactics/comments/1udcum2/recommendations_for_best_youtube_channel_for/)
