# 競合比較（内部）と LP 用の言い方

**更新:** 2026-08-26  
**役割:** CPO / CMO / CTO / シニア UIUX  
**正本の楔:** [`SPEC.md`](SPEC.md) §0 · [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) §5  
**LP 構成制約:** [`LP_STRUCTURE.md`](LP_STRUCTURE.md) — **比較表は LP に出さない**

このファイルは (1) 機能の横並びログ、(2) LP に載せる短い言い方、の二層。

---

## 0. 決定ログ — Export 画角と比率連動ズーム（2026-08-26）

**判定: 4:5 / Story / Square に連動してズームイン・アウトする機能は作らない。**

| プリセット | 比率 | 主に載る媒体 |
|---|---|---|
| **4:5** | 1080×1350 | IG Feed / Threads 縦 / カルーセル |
| **Story** | 9:16 · 1080×1920 | IG Stories / Reels |
| **Square** | 1:1 · 1080×1080 | X / Threads / 跨媒体の無難札 |

- **媒体が欲しいもの:** キャンバスの形（画面占有）。カメラ距離ではない
- **芝は約 1.54:1:** どの縦・正方形とも一致しない → プリセットは「細い窓で切る」だけ
- **寄る／引く:** 既存のホイールズーム · 投稿フォーカス（現在／全体／FT）· 局面 `viewport`
- **パン:** PNG 枠のドラッグ（クロップ位置）。プレビュー＝書き出し
- **四役:** CPO / CMO / CTO / Senior UIUX とも **No**（比率ボタンにズームを結ぶと局面が勝手に変わる）
- **やらない:** 比率ごとの秘密ズーム表、ピッチ歪み、駒の自動巨大化
- **任意・後:** Story 上下セーフゾーンの薄いガイドのみ

詳細キャンバス: `aspect-zoom-verdict.canvas.tsx`（Cursor）。実装指針は [`SOCIAL_OUTPUT.md`](SOCIAL_OUTPUT.md)。

---

## 0b. 決定ログ — 認知（ライブ透かしなし）（2026-08-26）

**判定: 配信中ピッチ上の運営ロゴ（競合の pitch watermark）は載せない。代わりに B+C を実装。**

| 面 | 内容 | 既定 |
|---|---|---|
| **B** | PNG 書き出しフッタに任意 `zoneboard.app`（枠外・芝に焼かない） | **OFF** |
| **C** | YouTube / Discord 用コピー文 — `/materials/` と Settings→OBS | 貼るだけ |

- **やらない:** 配信キャプチャ／Broadcast への運営透かし強制
- **ユーザー透かし:** 既存の bake watermark（自分のブランド）は別物

---


## 1. ZoneBoard が今あるもの（事実）

LP に並べるカタログではない。比較の軸。

| 層 | 機能 |
|---|---|
| **配信** | Broadcast（`B`）で chrome 消す・ピッチ ≥80% · OBS はウィンドウキャプチャ · Webcam はボードに足さない |
| **ブランド** | ユーザーロゴ透かし · 運営ロゴなし · 焼き込み ON/OFF · ブランド素材は `/materials/`（エンドカードはライブに載せない） |
| **描画** | 両軍 · 向き · パス／ラン／ドリブル · ゾーン · Pen · 局面切替 · 画角プリセット（CK 等） |
| **投稿** | PNG · 4:5 / Story / Square / 16:9 / Pitch · 枠ドラッグでクロップ · キャプション焼き込み |
| **運用** | 登録不要 · localStorage · ボード最大 3 · 競技: サカ／バス／バレ（＋将来フットサル等） |
| **出さない** | 選手 DB · 動画解析 · ボード内 Webcam · 比率連動ズーム · クラウド必須 |

---

## 2. 競合との横並び（内部表）

記号: ● 強い / △ 弱い・別物 / — なし・非主眼。公開 LP には載せない。

| 軸 | ZoneBoard | Google スライド | TACTICALista | TacticalPad 系 | 軽量 Web ボード群 |
|---|---|---|---|---|---|
| **配信用に chrome を消す契約** | ●（≥80%） | — | △（全画面でもツール残） | △（分析・練習寄り） | —〜△ |
| **自分のロゴ透かし** | ● | 手作業 | △（運営寄り） | △ | — |
| **登録不要・ローカル** | ● | Google 前提 | クラウド前提 | アプリ課金 | まちまち |
| **OBS 前提の境界** | ●（顔は OBS） | 共有画面全体 | 編集机 | コーチ机 | 図だけ |
| **戦術記号の厚さ** | 必要十分 | 弱い | ● | ●● | △ |
| **アニメ / 動画解析** | —（Avoid） | — | △〜● | ● | — |
| **投稿用 SNS 画角** | ●（4:5 / Story / Square） | 手切り | 画像書き出し中心 | まちまち | △ |
| **価格の入り方** | 今は無料コア | 無料＋アカウント | Freemium | 年額アプリ | 無料〜広告 |

### 一文の差（内部）

| 相手 | ZoneBoard の差 |
|---|---|
| **スライド** | 最初から戦術ボード。コート比が崩れない |
| **TACTICALista** | 全画面はある。差は **配信契約（ツール消す）** と **自分のロゴ** と **登録不要** |

**現場証拠（2026-08-26 · 天皇杯同時視聴）:** 柚比ゆずる配信のピッチに **TACTICALista 透かし**が載っていた。同時視聴で Web 戦術板は既に使われている。詳細レイアウト型は [`OUTREACH_EU_STREAM.md`](OUTREACH_EU_STREAM.md) §2F。LP には出さない。

| **TacticalPad / Hudl 系** | 多機能・高価・分析／練習。個人の配信机ではない |
| **薄い無料ボード** | 記号と配信最適化とブランディングが揃わない |

調査合意（SPEC）: 「chrome を消した配信モード」＋「ユーザーロゴ」のセットは、調査範囲で楔。

現場の敵（LP_COPY）: 専用ボード不在ではなく、**空の OBS に何を足すか** と **スライドで歪むコート**。比較表で TacticalPad を殴らない。

### 0c. tactical-board.com — ZB が埋められない席（決定 · 2026-08-28）

**現場:** カオル録画 `レコーディング 2026-08-28`（tactical-board デモ）· Doctor Gotti 等の Shorts 縦ピッチ運用。  
**判定:** 以下は **v1 では意図的に持たない**（[`SPEC.md`](SPEC.md) §12 · アニメ v1.1 Later）。**tactical-board ユーザーへの冷 DM は §0b どおり送らない。**

| tactical-board.com | ZoneBoard v1 | 方針 |
|---|---|---|
| **キーフレームアニメ** → **MP4 / HTML 書き出し** | なし（PNG のみ） | v1.1 Later · 配信は手動かしが主流 |
| **ピッチ 3 视图**（horizontal / half / **vertical**） | 横ピッチのみ · Story は**クロップ** | ネイティブ縦ピッチは作らない（[`SOCIAL_OUTPUT.md`](SOCIAL_OUTPUT.md)） |
| 駒・矢印の**時間軸再生** | 局面切替 · 手動ドラッグ | 別ジョブ（編集ソフト領域に近い） |
| アニメ**共有リンク** · コレクション | localStorage · 登録不要 | 楔は逆（クラウド不要） |
| 多競技 40+ | サカ/バス/バレ v1 | スコープ差 |

**ZB が勝てる席（再掲）:** OBS ライブ · **B で chrome 消し** · **vendor 透かしなし** · 登録不要 — **講義 MP4 制作の代替ではない。**

### 0d. TACTICALista — アニメーション席（現場 · 2026-08-28）

**現場:** カオル録画 `レコーディング 2026-08-28 234750` · YouTube「Curve animation」（TACTICALista UI）。

| 機能（録画で確認） | ZB v1 | コーチングで必要？ |
|---|---|---|
| **フレームアニメ**（2/2 frame · タイムライン · REC） | × | **教材 MP4 派には必要** · ライブ口頭派には不要 |
| **path 表示**（点線の曲線軌道 · 開始位置グレー丸） | × | 同上 · 「動きの説明」向き |
| **Curve animation**（直線以外の走り） | ×（Run は直線/自由曲線 Pen） | ファンシーだが Must ではない |
| **Delaunay Home**（三角分割・構造可視化） | × | **分析コーチ向けニッチ** · v1 非対象 |
| 役割ラベル（GK / LCB …） | ×（背番号・名前） | 一部コーチは欲しい · ZB は背番号正本 |

**判定:** コーチング**全体**に必要なわけではない。**「事前に動画教材を1本出す」コーチ**には TACTICALista / tactical-board クラスが適切。ZB のコーチ向け席は **練習前に PNG · タブレットで駒を動かす · 口頭**（[`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) §1 部活監督）。

| **tactical-board.com** | MP4 アニメ · 縦ピッチ · 教材向け完成映像 | **差し替え不可** · 透かし除去だけでは足りない |
| **TACTICALista** | フレームアニメ · path · Delaunay · ツールバー残 | **配信楔（B）のみ差** · アニメ席は **別プロダクト** |

### 0e. TACTICALista — 名簿・フォーメ配置（現場 · 2026-08-28 235213）

**現場:** 約84秒 · Man City 例 · Numbers からコピー想定のワークフロー含む。

| 機能（録画） | ZB v1 | メモ |
|---|---|---|
| **フォーメ一覧**（4-4-2 · 4-1-2-3 · 4-2-3-1 · 3-4-2-1 …）+ **Place** | サッカーは **4-4-2 のみ**（[`formations.ts`](../src/presets/formations.ts)） | コーチ向けギャップ · 配信者は手置きでも可 |
| 名簿 + **戦術ポジション**（RIH / LIH / DM …） | 背番号 + 名前（任意）· 役割ラベルなし | 分析コーチ向け |
| **Substitutes → Place the list in text**（ベンチ一覧をピッチ中央テキスト） | ベンチは **ピッチ外の駒** · テキスト一覧焼き込みなし | 放送用ベンチ表グラフィック |
| Numbers 等スプレッドシート → コピー | 名簿ペースト対応（`rosterPaste`） | **同等に近い** |

**判定:** コーチングの「**スタメンを一発で載せる**」には有用。ZB は **442 + 名簿**で最低限はカバー。**複数フォーメ・ベンチテキスト板**まで追うと TACTICALista 追従 — v1 非目標。

### 0f. TACTICALista — マーク分析・Delaunay・楕円ゾーン（現場 · 2026-08-28 235742）

**現場:** 約95秒 · 赤青両軍 · 役割ラベル（LSB/RDM/DFM…）· ペアマーク用**破線楕円**複数。

| 機能（録画） | ZB v1 | メモ |
|---|---|---|
| **Delaunay Away / Home**（三角分割） | × | §0d と同 · 構造分析コーチ向け |
| 両軍 + **戦術ポジション**表記 | 両軍 ○ · 役割ラベル × | マーク図解向け |
| **楕円ツール**（fill/border · 破線 · **半径 8m**） | Zone ○ · **メートル半径** × | 距離感のあるゾーン |
| ペアごと破線オーバーレイ（LSB–RW 等） | Pen/Zone で近似 · 専用ワークフロー × | 学院分析の主画面 |
| Arrow / Arm · Number/Name サイズ 1–5 | 向き ○ · Arm × · 名前サイズ調整 △ | |
| Placed objects ツリー（Home/Away/Players） | 局面・選択 ○ · レイヤーツリー × | |

**判定:** **「誰が誰をマークするか」「構造を幾何で見せる」**コーチング教材向け。**配信ライブ · 手で駒を動かす**席とは別ジョブ。v1 非対象。

### 0g. tactical-board.com — マーカー・コーン・記号ライブラリ（現場 · 2026-08-29 000029）

**現場:** 約34秒 · **tactical-board.com**（透かし）· 2/2 フレーム · **Marker** パネル。

| 機能（録画） | ZB v1 | メモ |
|---|---|---|
| **Marker ライブラリ**（矢印 · X/O · 三角 · 星 · 棒人間 · 絵文字 · コーン等） | ×（Pass/Run/Pen/Zone のみ） | **練習ドリル図**向け |
| **Add the ball** ワンタップ | ボール駒 ○ · 専用ボタン △ | |
| コーン等の **色 · サイズ** スライダー | キット色 ○ · 汎用マーカー × | |
| 記号の複数選択 · グループ移動 | 駒マルチ選択 ○ · 記号 × | |
| 2/2 フレーム（アニメ） | × | §0c |

**判定:** **トレーニングコーン配置 · ユース向け記号** — 試合戦術解説（ZB 主戦場）とは別。**部活ドリル図**には有用だが v1 非目標。末尾は YouTube 無関係（録画ノイズ）。

### 0h. TACTICALista — 設定・縦ピッチ・ボール追従（現場 · 2026-08-29 000428）

**現場:** 約73秒 · **v2.5.0** · EN 設定パネル · Man City 名簿配置 · 後半は Cancelo / Sterling を手描き丸。末尾は YouTube 無関係。

| 機能（録画） | ZB v1 | メモ |
|---|---|---|
| **縦／攻撃方向上** のハーフ寄りピッチ（1/2） | × · 横のみ | §0c と同 · Shorts / タブレット縦持ち |
| **Fit mode** overlay / contain | × | 映像に重ねる席（テロスト寄り）· ZB は OBS 別ソース |
| **Create animation data** | × | §0d アニメ出力 |
| **Logo Display** トグル | 運営ロゴなし · 自ロゴは Settings | 競合は「消せる」が既定で出る |
| **Scaling up on the move** | ドラッグ中の拡大なし | 操作フィードバック |
| **Ball moving** off / on / **with orientation** | 吸着は ○ · 向き連動の専用モード △ | |
| 手描き丸で選手を指す | Pen ○ | ライブ解説は ZB でも可 |

**判定:** 設定面でも **映像オーバーレイ · アニメデータ · 縦ピッチ** が本線。ZB が埋めなくてよい席。手描きハイライトだけは Pen で足りる。

---

## 3. LP に入れる前提の言い方

[`LP_STRUCTURE.md`](LP_STRUCTURE.md): **競合比較表・アイコン機能グリッドは入れない。**  
**できることの短文リストは入れる**（手順のあと）。楔はヒーロー＋手順＋能力リスト＋クローズ。

### 3-1. ブロック役割（2026-08-26）

| 順 | スロット | 方針 |
|---|---|---|
| 1 | ヒーロー | 仕事＋ピッチ。lede＋OBS 境界の細文 |
| 2 | **できること** | リード（誰向け）＋6×（主文＋細文） |
| 3 | 手順 | Place / Draw / Show＋各細文 |
| 4 | クローズ | キャプチャ主文＋エンドカード細文＋ materials / pricing ＋ CTA |
| — | ヒーロー | ピッチ 1 枚 · OBS シルエット |

**英語のみで通す:** 主文だけでは OBS・scenes・投稿枠が足りない → 細文必須。公開は EN。

### 3-2. できること（決定稿 · 主文 / 細文）

| # | 主文 (en) | 細文 (en) |
|---|---|---|
| 見出し | For stream night — and the talk after | — |
| リード | For watchalong streamers, coaches, and pundits. Different jobs. Same board. | — |
| 1 | Hide the tools and capture the pitch. It fills the window. | Clean in OBS, Zoom, or a team call. Press B on the board. |
| 2 | Put your club badge on the board. The show stays yours. | No ZoneBoard logo on the grass. |
| 3 | Set both XIs. Draw passes, runs, dribbles, and zones. | Show the shape to viewers or to players — not only with words. |
| 4 | Save moments as scenes. Jump back without drawing again. | A corner, a press, a kick-off shape — for coaches and pundits too. |
| 5 | Save a PNG for Instagram, Stories, or X. Drag the frame. | Portrait posts crop the pitch. For the whole field, use 16:9 or Pitch ratio. |
| 6 | No account. Open in the browser. Up to three boards on your machine. | Ready to add to the stream when you need it. |

ja は `messages.ts` に並行。公開 UI は EN。

### 3-3. クローズ

**en 主文:** Made for the capture. / Press B. Tools go away. The pitch fills the window for OBS.  
**en 細文:** End cards for YouTube or Clipchamp are on the materials page — not on the live pitch.

### 3-4. LP に書いてはいけない言い方

- 「唯一の戦術ボード」「競合にない全画面」
- **競合比較表**、料金表、お客様の声、**アイコン機能列**
- 「比率を選ぶと自動でズーム」
- エンドカード／モーションをヒーローや第二ピッチに載せる
- TacticalPad / TACTICALista の社名を並べた表
- Snob 英語（utilise / leverage / seamless / vendor）

### 3-5. 反映

| 場所 | 状態 |
|---|---|
| `Landing.tsx`（順: hero → can → steps → close） | 反映済 |
| `lpCan*` / `*Note` / ledeNote / closeNote | 反映済 |
| [`LP_STRUCTURE.md`](LP_STRUCTURE.md) | 反映済 |

---

## 4. 四役の要約（LP 向け）

| 役 | 言うこと | 言わないこと |
|---|---|---|
| **CPO** | ジョブは置く・描く・出す。能力は短く地図にする | 競合表・機能カタログの山で勝つ |
| **CMO** | 証拠はピッチが OBS に載ること。できることは自社の事実 | 競合表で殴る |
| **CTO** | Broadcast・ロゴ・ローカル・SNS 画角は実装済み楔 | 比率連動ズーム等の曖昧自動化 |
| **UIUX** | ヒーロー1・手順3・能力リスト・クローズ | 比較表・第二ピッチ・アイコングリッド |

---

## 関連

- [`SPEC.md`](SPEC.md) §0 ポジショニング
- [`SOCIAL_OUTPUT.md`](SOCIAL_OUTPUT.md) SNS 画角
- [`LP_COPY.md`](LP_COPY.md) · [`LP_STRUCTURE.md`](LP_STRUCTURE.md)
- [`OBS.md`](OBS.md)
- [`BRAND_MOTION.md`](BRAND_MOTION.md) · `/materials/`
