# ZoneBoard — Backlog

**更新:** 2026-08-30  
**リポジトリ:** 本リポ専用（SUGUDASU / 他 GitHub プロジェクトとは分離）  
**正本の方針:** [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) · [`UI_UX.md`](UI_UX.md) · [`SPEC.md`](SPEC.md)

未着手・Later・方針メモをここに集約する。実装済みの詳細はコードと各 docs を正とする。

---

## 0. いまの状態（2026-07-04）

| 領域 | 状態 |
|------|------|
| コアボード（駒・描画・局面・名簿・配信モード） | 実装あり |
| UI/UX 指針・パネルタブ・ツールレール・意味色 | 実装あり |
| 設定（ロゴ・PNG プレビュー枠・ドラッグ移動） | 実装あり |
| 試合帯（スコア・得点者・配信表示） | **済** サッカー試合タブ |
| 駒カード（トリプルクリック / 右クリック） | 実装あり |
| フットサル・ビーチ（別競技ページ） | v1.1 最小構成。リサーチは [`FUTSAL_BEACH_RESEARCH.md`](FUTSAL_BEACH_RESEARCH.md) |
| Pro / 選手セット / 課金 | 未実装（方針のみ） |
| GitHub 専用リポ | https://github.com/Kaoru-Stats-Lab/zoneboard |

---

## 1. 決定済み方針（実装・設計の前提）

変更するときはこの節と PRODUCT_NOTE / UI_UX を同時に直す。

### 1-1. プロダクト境界

- 戦術ボード（空間＋駒＋動き）。選手 DB・スクレイピング・**試合全体の動画解析／連続トラッキング**はしない
- **局面取込（Broadcast Capture Import）** — **Go · Later 大型**（B-070）。P1 下敷き+Homography → P2 自動駒ドラフト。連続トラッキングではない
- 配信モードでピッチ最大化。運営ロゴではなく **ユーザロゴ**
- OBS がアバター・スコア・チャットを担う（ボード内に持たない）
- v1 競技: サッカー / バスケ / バレー。フットサル・ビーチは v1.1（サッカー派生ピッチ）

### 1-2. 学習コスト

- 単クリック / ドラッグ = 移動のみ
- ホットキー・局面・画角・曲線は任意加速
- ウィザード・強制チュートリアルはしない

### 1-3. 選手データ

| 層 | 方針 |
|----|------|
| カラム | `number`（必須）· `label` · `preferredFoot` · セットの `defaultColor` |
| 作成 | ユーザ任せ（貼り付け・手入力） |
| 公式 | ライブ取込しない。空テンプレ程度は可 |
| 駒カード | **背番号・名前・利き足のみ**。国籍・成績・プレースタイル文・身長は v1 非掲載 |
| 開き方 | **トリプルクリック** または **右クリック**（ダブルクリックは使わない） |
| 向き | カードに出さない。`R` と三角は任意加速として残置 |

### 1-4. Pro / 流通（Later）

- Pro 核: 名前付き選手セットの複数保有
- 流通は自ドメイン外。FAQ＋既存 SNS への軽い種まき。Reddit は EN 向けのみ
- FanCommunity は運営ホストしない

### 1-5. UI chrome

- パネル = 試合（局面 / 名簿 / 試合）。**常時3タブではない**（[`STUDIO.md`](STUDIO.md)）
- キット色 = 名簿。クラブ名 = 試合
- 設定 = 自分（ロゴ・書き出し・言語）
- chrome の地は LP と同じスタジオ黒。白バーに戻さない
- ツールはキャンバス縁レール。意味色はキャンバス描画色と一致
- サブ人数は大会カテゴリではなく **人数そのもの（0–15）**
- PNG 書き出しは範囲プレビュー＋設定ウィンドウ移動可

### 1-6. ボール

- フラット・ベタ塗り（[`BALL_DESIGN.md`](BALL_DESIGN.md)）
- `futsal.png` 処理済み。競技スコープ接続は v1.1

### 1-7. 描画の語彙（2026-08-23）

サッカー解説でよく出る「面」は意味が二つある。ツールは増やさない。

| 言いたいこと | 形 | ZoneBoard |
|---|---|---|
| 空き・ポケット・ハーフスペース | ◯ / 楕円 | ゾーン（P1: 楕円にする） |
| ブロックを敷く（ロー／ミドル／ハイ） | 横に長い薄い帯。高さ＝圧縮している区間 | **Pen で足りる**（横線2本、または囲む）。専用ツールは作らない |

ブロックはチームの塊が占領している**高さ**であり、空きの◯ではない。トーク・同時視聴は Pen と駒の並びで伝える。中を塗った帯が必要になったら Later（角丸の横長面）。ドラッグ縦横比で楕円と帯を自動切替しない。

重いアニメ / 局面の補間再生は P2（B-042）。トーク用「図を消す」（駒は残す）は P1。Ctrl+Z は Undo のまま残す。

Pen は解説用インクであり、液タブ＋描画アプリの域には合わせない。目標は丸と囲みが配信で角ばらないこと。手段は **合算イベント（`getCoalescedEvents`）＋中点二次ベジェ**。スタビライザー・筆圧・新規 npm はやらない。パス用 RDP 平滑は Pen に流用しない（[`PROMPT_PEN_SMOOTH.md`](PROMPT_PEN_SMOOTH.md)、B-047）。

### 1-8. 言語・市場（2026-08-24）

正本: [`LOCALE_MARKETS.md`](LOCALE_MARKETS.md)。

- 公開面は英語一本。同一 URL に第二言語を積まない
- UI の第1波 **es → pt-BR → pl は出荷済**（2026-08-31）。第2波 **de · fr 出荷済** → **tr**（[`LOCALE_MARKETS.md`](LOCALE_MARKETS.md) §3-7）。5大リーグ（英西伊独仏）を chrome で揃えない
- 5大向けに先にやるならキット・フォーメ。決済は言語と別
- **pl 翻訳正本は en のみ**（ja/es/pt 参照禁止）— [`AGENT_PROMPT_I18N_PL.md`](AGENT_PROMPT_I18N_PL.md)
- `messages.de` / `fr` / `tr` は第2波順。**it** は流入トリガーまで作らない

---

## 2. アクティブ Backlog（近い順の目安）

優先度は目安。着手時に並び替えてよい。

### P0 — 公開・品質

| ID | 項目 | メモ |
|----|------|------|
| B-001 | SPEC 未決事項 U1–U7 の承認 | [`SPEC.md`](SPEC.md) |
| B-002 | `zoneboard.app` DNS / 公開確認 | **取得済** · CF Pages 接続待ち |
| B-003 | 配信モードの最終確認（ピッチ≥80%） | PRODUCT_NOTE §2 |

### P1 — コア磨き

| ID | 項目 | メモ |
|----|------|------|
| B-014 | 試合帯（配信表示） | **済** 大会名・対戦・得点者。スコアは goals 自動 |
| B-015 | 得点者リスト UI | **済** 試合タブ・サッカー。アシストは Later |
| B-010 | 右クリック簡易カードのタッチ代替（長押し等） | トリプルクリックは PC 向け |
| B-011 | 旧黒線データの移行 or 案内 | LINE_COLORS 導入前の線は黒のまま |
| B-012 | コート色（VTuber 向け） | Later 寄りだが要望あり |
| B-013 | ホットキー一覧（`?` オーバーレイ） | 強制しない・任意 |
| B-047 | Pen の追従・滑らかさ | 合算イベント＋中点ベジェ。スタビライザ禁止。[`PROMPT_PEN_SMOOTH.md`](PROMPT_PEN_SMOOTH.md) |
| B-048 | スタジオ・トークン（LP＝ボード） | 地・字・角・Barlow。[`STUDIO.md`](STUDIO.md) 波1 |
| B-049 | キット色を Roster へ | Match から移す。クラブ名は Match。波2 |
| B-050 | パネルは局面既定＋準備 | 3タブ常時をやめる。波3 |
| B-051 | 配信 chrome から得点 | バナー ON のとき Match に潜らない。波4 |
| B-052 | 試合帯の文字（キット塗りをやめる） | チーム名は象牙。3文字強制なし。スコア字間。[`STUDIO.md`](STUDIO.md) §6–7 · [`AGENT_PROMPT_BANNER.md`](AGENT_PROMPT_BANNER.md) |
| B-053 | 名簿 Home/Away をキット色に | セグメント背景＝フィールド色。帯の名前とは逆。同プロンプト |
| B-054 | ズーム時の駒密度補正 | **済** ピッチと一緒に膨らませない。`pieceScale` は乗算のみ。[`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) 決定ログ 2026-08-25 |
| B-055 | チーム表示 Home/Away/Both | **済** 試合前・試合後。Scenes。`teamFocus`。配信 chrome に出さない |
| B-056 | 画角プリセットのランドマーク監査 | CK は教本面積まで **再定義済**。FT・ペナ・スロー・バスケ・Export 余白は [`VIEWPORT_RESEARCH.md`](VIEWPORT_RESEARCH.md) |
| B-057 | 局面ごとの画角（`scene.viewport`） | **済** 2026-08-25。Pro 画角テンプレは実装済・`FEATURE_PRO_VIEWPORT_TEMPLATES=false` |
| B-058 | Pass ＝ ボール軌道（ユーザ認知） | **済** 2026-08-25 `passHint` / `deleteHint` ja·en。ボタンラベルは Pass のまま |
| B-059 | `shot` 線種 | Later。Pass=配球・クロス vs Shot=ゴール向けの**意味分離**（山なり UI とは別） |
| B-060 | Pen + Shift = 直線 | **済** 2026-08-25。Figma 型。構造リンク・チャネル境界。第4線種は作らない |
| B-061 | 山なり（浮き球）3D 軌道 | **却下 v1** 2026-08-30。曲線破線で足りる。[`LOFTED_BALL_PATH_RESEARCH.md`](LOFTED_BALL_PATH_RESEARCH.md)。Later=Pass スムージングのみ |

### P2 — Pro / データ

| ID | 項目 | メモ |
|----|------|------|
| B-020 | 選手セット CRUD（ローカル） | `PlayerSet` 型は定義済み |
| B-021 | セットの import / export 形式公開 | コミュニティ流通の前提 |
| B-022 | FAQ「共有のしかた」 | 自ドメインにマーケットは置かない |
| B-023 | 課金・Pro ゲート | 相場メモのみ。実装未 |
| B-024 | PL 外部データセット調査 | 下記 §6。FPL は背番号欠落・データ権利に注意 |

### P3 — 競技拡張（v1.1+）

| ID | 項目 | メモ |
|----|------|------|
| B-030 | ビーチ射線ガイド | **済** ON/OFF |
| B-034 | フットサル／ビーチ現場 FB | [`FUTSAL_BEACH_RESEARCH.md`](FUTSAL_BEACH_RESEARCH.md) §6 の問い |
| B-035 | 海外事情（es/pt/pl · de/fr/tr 圏） | **調査済**。第1波 es→pt→pl **済**。第2波 **de→fr→tr**。[`LOCALE_MARKETS.md`](LOCALE_MARKETS.md) §3-7 |
| B-036 | UI 言語 es | **実装済** `/es/` |
| B-037 | UI 言語 pt-BR | **実装済** `/pt/` |
| B-074 | UI 言語 pl | **実装済** `/pl/` · en 正本。[`AGENT_PROMPT_I18N_PL.md`](AGENT_PROMPT_I18N_PL.md) |
| B-075 | UI 言語 de | **実装済** `/de/` · [`AGENT_PROMPT_I18N_DE.md`](AGENT_PROMPT_I18N_DE.md) |
| B-076 | UI 言語 fr | **実装済** `/fr/` · [`AGENT_PROMPT_I18N_FR.md`](AGENT_PROMPT_I18N_FR.md) |
| B-077 | UI 言語 tr | 第2波 **3位** · Kadro/PNG 軽量訴求 · `/tr/` |
| B-038 | バスケ補助線リサーチ | **済**。ハーフ＋Must補助線実装 |
| B-039 | バスケ スクリーンT字線種 | **済** バスケのみ・紫・T字先端 |
| B-040 | バスケ 5-Out / Horns テンプレ | Should |
| B-041 | バスケ 木目コート | **済** 試合タブトグル |
| B-031 | ビーチ専用ボールアセット | 当面サッカー球 |
| B-033 | サッカー thirds オーバーレイ | Gemini 提案。v1 は5レーンのみ |
| B-032 | 身長など任意カラム | カードは空欄だらけにしない。**セット／名簿側**に持つ。スカッド板: **チップ非表示 · クリック吹き出し** or 集計（§4）。配信 v1 駒カードには載せない |

### P4 — Later / 駐車場

| ID | 項目 | メモ |
|----|------|------|
| B-040 | コミュニティ流通の種まき（X / Discord / EN Reddit） | 自然発生＋軽い種 |
| B-041 | クラウド同期 | OBS 別プロファイル問題あり（[`OBS.md`](OBS.md)） |
| B-042 | アニメ / GIF | v1.1 候補 |
| B-043 | ラグビー・アメフト・野球・eSports | SPORTS_SCOPE Later |
| B-044 | es UI | 公開は en。ja は `/ja/` 用にソース残置。[`LOCALE_MARKETS.md`](LOCALE_MARKETS.md) |
| B-045 | 向き（facing）の完全削除 | 現状は任意加速として残置 |
| B-046 | ゾーンに横長の角丸帯（ブロックの塗り） | いまは Pen。専用「ブロック」ツールは作らない |
| B-061 | **製品 PV（短尺）** | 2026-08-27 ログ。つくった埋め込みは諦めた。本命は **置く→描く→B（〜8秒）**。lockup sting（`/materials/`）はエンドカード用で PV ではない。置き場: X / PH / LP。YouTube は限定公開でも可。公式 YT チャンネルは必須にしない |
| B-062 | **局面メモ（振り返り）** | **v1 済 2026-08-28** — `scene.notes` · ドロワー textarea · 配信/Export 非表示。Later: ボード内検索（B-063）· 芝上レイヤー · Library タグ（Pro） |
| B-063 | 局面メモのボード内検索 | B-062 の次。label + notes 部分一致フィルタ |
| B-064 | パス／ランの弱い密度補正（任意） | **Later。** ズーム寄りで線が太すぎる場合のみ `/ sqrt(zoom)` 等。ピッチ白線は対象外。[`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) 2026-08-28 |
| B-065 | **局面複製の案内＋配信中複製** | **済 2026-08-28** — Scenes hint · How-to · 配信 chrome の複製ボタン（`addScene`）。[`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) 決定ログ |
| B-066 | **配信コマンド表（印刷・PDF）** | **済 2026-08-28** — `/materials/shortcut-sheet/` · HOW_TO 同期 · How-to リンク。[`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) 2026-08-28 |
| B-067 | **PNG Export 契約（帯・キャプション）** | **済 2026-08-28** — 試合帯は PNG に非焼き。`bakeCaption` 既定 OFF。プレビュー WYSIWYG。[`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) 2026-08-28 |
| B-068 | **Pro: Export Post framing ゲート** | Later — Full / FT / 保存テンプレ Export を Pro 時短。Current + 比率は無料固定。B-023 と同時 |
| B-069 | **スカッド板モード（移籍窗向け）** | **Later · 2027夏マーケ本番想定。** 配信モードと分離。**縦横選択** · 監督フォーメ · 名簿→チップ（**利き足** チップ可 · **身長等** セットのみ · **クリック吹き出し** peek · Export 非焼き · B-032）· 空枠可視化 · Export 9:16/4:5/16:9。ジョブ: 「スカッドは足りるか」（[`OUTREACH_JP_CREATORS.md`](OUTREACH_JP_CREATORS.md) §4）。2026冬は検証のみ可 |
| B-070 | **Broadcast Capture Import / 局面取込** | **Go · Later 大型。** 本線=VODシーク→複数枚→HT。優先ソース **DAZN · Abema(DAZN) · SPOTV NOW(YT) · U-NEXT(YT)**。ゴチャつき全画面貼付は ROI 想定。P1手動4点 · P2自動駒+身元ピック。ジュニアコートは次期。ゴールド=複数フレーム。帯B |
| B-071 | **配信者 PC / モニター分布調査** | **Web 調査済 2026-08-30。** [`STREAMER_RIG_RESEARCH.md`](STREAMER_RIG_RESEARCH.md)。帯 A=Pro / B=Standard標的 / C=Budget。％は proxy。一次ヒアリングは任意。プロンプト: [`AGENT_PROMPT_STREAMER_RIG_RESEARCH.md`](AGENT_PROMPT_STREAMER_RIG_RESEARCH.md) |
| B-072 | **縦ピッチ（別データ）** | **Later · やる。** 正本 [`VERTICAL_PITCH.md`](VERTICAL_PITCH.md) · UI [`AGENT_PROMPT_PITCH_VIEW_UI.md`](AGENT_PROMPT_PITCH_VIEW_UI.md) · 描画 [`AGENT_PROMPT_VERTICAL_PITCH.md`](AGENT_PROMPT_VERTICAL_PITCH.md) |
| B-073 | **名前ピル（ボード単位）** | **実装済。** `showPlayerNames` · 新規 OFF · migrate true。[`AGENT_PROMPT_PLAYER_NAME_PILL.md`](AGENT_PROMPT_PLAYER_NAME_PILL.md) |

---

## 3. やらないこと（Backlog に載せない）

再掲。議論で戻さない。

- 選手 DB・公式ライブスクレイピング
- 試合全体の動画解析・連続トラッキング（**局面取込 B-070 とは別**）
- 予想スタメン専用機能
- ボード内 Webcam / アバター / スコア UI
- 自ドメイン上の FanCommunity / 公式マーケット
- 運営ロゴ強制
- 初回強制チュートリアル
- PL 百科レベルの駒カード（国籍・成績・プレースタイル長文）
- **ブロック専用ツール**（「ブロックを敷く」は Pen。面の塗りが要るなら B-046）
- **ピッチ／配信モードの広告**（2026-08-24。運営・ユーザ設定とも禁止。議論で戻さない）
- **視野角の扇形**（2026-08-25。Football の視線／視界は概念として認識。`facing` 一本で足りる。議論で戻さない）

---

## 4. GitHub 運用

| 方針 | 内容 |
|------|------|
| リポジトリ | **ZoneBoard 専用**の新規リポ。SUGUDASU や他ダッシュボードと混ぜない |
| Issues | 本 Backlog の ID（B-xxx）を Issue タイトル先頭に付けて切ってよい |
| Projects | 使うなら **このリポだけ**を紐づけた Project。他リポと共有ボードにしない |
| ドキュメント | `docs/BACKLOG.md` を駐車場の正本。Issue は作業チケット |

---

## 6. 調査メモ — Premier League 外部データ（2026-07-04）

対象:

- [vaastav/Fantasy-Premier-League](https://github.com/vaastav/Fantasy-Premier-League)（FPL 履歴 CSV）
- [kedarghule/Premier-League-Player-Statistics-Dashboard](https://github.com/kedarghule/Premier-League-Player-Statistics-Dashboard)（チーム別スタッツ CSV）

### ZoneBoard スキーマとの対応

| ZoneBoard カラム | FPL (`players_raw`) | kedarghule (例 Arsenal.csv) |
|------------------|---------------------|-----------------------------|
| `number`（**必須**） | `squad_number` 列はあるが **2024-25 / 2025-26 とも全件 `None`（0% 充填）** | **列なし** |
| `label` | `web_name` / 姓名 | `Player` |
| `preferredFoot` | **なし** | **なし** |
| チーム分割 | `team` ID | フォルダ名（クラブ単位） |
| その他 | FPL ポイント・xG 等（ボード不要） | Nation, Pos, Age, タックル・xG 等（百科寄り） |

### 結論

| 問い | 答え |
|------|------|
| **そのままインポート可能か** | **不可に近い。** 背番号ファーストの必須カラムが埋まらない |
| 名前だけのセットとして？ | 技術的には可（番号はプレースホルダ or ユーザ追記）。価値は薄い |
| Pro で「PL データセット同梱」？ | **そのまま再販は非推奨。** FPL リポ LICENSE はコード MIT だが、**データは fantasy.premierleague.com / understat のプロパティ**と明記。運営が公式データを売る形になる |
| 何ならアリか | Pro は **import/export 形式**と「ユーザ／コミュニティが作ったセット」。運営がやるなら **番号入りを自前でメンテした静的パック**（出典明記・更新責任あり）。ライブ同期パイプラインは「選手 DB」化で方針違反 |

### Pro への落とし込み（推奨）

1. **売らない:** FPL / FBref 系スクレイプのライブ同梱
2. **売る:** 複数セット保有 + ファイル import（CSV: `number,label,preferredFoot`）
3. **任意の付加価値:** シーズン頭に運営が手メンテした「PL 20 クラブ・番号＋名前」静的パック（権利クリアな出典のみ）。FPL は名前の下書き参考に留め、**背番号は別ソース必須**
4. kedarghule 側は **スタッツ可視化用の一季スナップショット**で、名簿インポート向きではない

---

## 7. 関連ドキュメント


| パス | 役割 |
|------|------|
| [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) | ジョブ・収益・流通 |
| [`UI_UX.md`](UI_UX.md) | chrome・カード・色 |
| [`STUDIO.md`](STUDIO.md) | LP＝ボードの世界・トークン・パネルフェーズ |
| [`AGENT_PROMPT_STUDIO.md`](AGENT_PROMPT_STUDIO.md) | スタジオ実装を別 Agent に渡すプロンプト |
| [`AGENT_PROMPT_BANNER.md`](AGENT_PROMPT_BANNER.md) | 試合帯・名簿セグメント（B-052/053） |
| [`SPEC.md`](SPEC.md) | 実装仕様 |
| [`SPORTS_SCOPE.md`](SPORTS_SCOPE.md) | 競技スコープ |
| [`BALL_DESIGN.md`](BALL_DESIGN.md) | ボールアイコン |
| [`AGENT_HANDOFF.md`](AGENT_HANDOFF.md) | Agent 引き継ぎ |
