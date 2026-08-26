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
| **TacticalPad / Hudl 系** | 多機能・高価・分析／練習。個人の配信机ではない |
| **薄い無料ボード** | 記号と配信最適化とブランディングが揃わない |

調査合意（SPEC）: 「chrome を消した配信モード」＋「ユーザーロゴ」のセットは、調査範囲で楔。

現場の敵（LP_COPY）: 専用ボード不在ではなく、**空の OBS に何を足すか** と **スライドで歪むコート**。比較表で TacticalPad を殴らない。

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
| 5 | Save a PNG for Instagram, Stories, or X. | Drag the frame so the right players stay in shot. Phone frames, not the live 16:9. |
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
