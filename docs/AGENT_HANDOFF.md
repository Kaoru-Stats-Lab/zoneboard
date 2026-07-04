# 引き継ぎ — ZoneBoard（別 Agent 用）

**作成:** 2026-07-04  
**理由:** SUGUDASU セッションが長く、戦術ボードは別プロダクトとして切り出した。別 Agent / 別チャットで仕様から再開する。  
**ワークスペース:** `C:\asl_dev\zoneboard`（**sugudasu リポジトリではない**）

---

## 0. 次 Agent への指示（最短）

1. 本ファイルと [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md)、chrome は [`UI_UX.md`](UI_UX.md)、未着手は [`BACKLOG.md`](BACKLOG.md) を読む。
2. **[`TOKEN_ECONOMY.md`](TOKEN_ECONOMY.md) を読み、RTK · CodeGraph を導入する**（未導入なら着手前にセットアップ）。思想: **トークンは通貨**。
3. **次の成果物は `docs/SPEC.md`（実装可能な仕様）**。コード実装・デプロイは SPEC 承認後。
4. SUGUDASU（`C:\asl_dev\sugudasu`）の本線タスク（Schedule / Sync / SHIFT-METER 等）には手を出さない。
5. ユーザー向け返答は日本語。

**今やることの答え:** はい、**仕様を決めることから進める**。PRODUCT_NOTE は方針メモであり、画面・データモデル・非機能・受け入れ条件までは落ちていない。並行して Token 経済圏ツールを入れる。

### 0-1. Token 経済圏（必須）

| ツール | URL | 役割 |
|--------|-----|------|
| **RTK** | https://github.com/rtk-ai/rtk | Shell 出力圧縮（トークン 60–90% 削減目安） |
| **CodeGraph** | https://github.com/colbymchenry/codegraph | ローカルコードグラフ · MCP · grep/Read 連打を減らす |

詳細手順・チェックリスト: [`TOKEN_ECONOMY.md`](TOKEN_ECONOMY.md)

- 巨大ログをチャットに貼らない
- 実装時は CodeGraph → 当たりをつけてから Read
- sugudasu の `.codegraph` は流用しない（**本リポで `codegraph init`**）

---

## 1. 背景（なぜこのプロダクトか）

### 1-1. 発端

- 提督が W杯解説 YouTube 等で、戦術説明を **Googleスライド**でやっているのを見た。
- サッカー・バスケ・バレーなど **俯瞰して戦術を指示**するなら、長時間使う。
- 既存Web戦術ボード（TacticsLista 等）は機能はあるが:
  - ツールバーが厚く **配信でピッチが小さい**
  - 隅の透かしが **運営ロゴ**で、YouTuber のオリジナル感が出ない

### 1-2. SUGUDASU セッションとの関係（長い文脈）

同じ長セッションで、SUGUDASU Sync のマイクロSaaS比較デューデリ・組み合わせ探索（押し引きメーター等）をやっていた。その流れで:

| 話題 | 結論（ZoneBoard に関係する部分） |
|------|----------------------------------|
| Privnote 型（使い捨てメモ） | 浅いPVで広告ROIが弱い。Universalでも単価は変わらない |
| 戦術ボード | **セッションが長い**ので単位経済は別物。欲しい |
| SUGUDASU Sports | **不採用**。「すぐだす」（3分実務）と長時間作業机は逆 |
| 別ドメイン | **採用**。ブランドを分けた |

SUGUDASU 側の Sync 楔（SHIFT-METER / INV-ARCHIVE / EVENT-ROOM）とは **無関係**。混同しないこと。

### 1-3. なぜ別フォルダか

- コンセプト・ペルソナ・ドメインが SUGUDASU と別
- 実装・Git・デプロイを独立させたい
- SUGUDASU リポジトリを汚さない

**ポインタのみ SUGUDASU に残してある**（§6）。

---

## 2. 決定済み事項（触らない）

| 項目 | 決定 |
|------|------|
| ブランド名 | **ZoneBoard** |
| 本拠ドメイン | **`zoneboard.app`** |
| `zoneboard.com` | プレミアム約 **64万円** → **買わない** |
| ハイフン `zone-board.com` | 本拠にしない（口頭・入力で負ける） |
| FormaBoard / PieceBoard | `.com` 取れず。見送り |
| KomaBoard | 海外で弱い（「駒」が通じない）→ 却下 |
| pitch* / field* | 屋外バイアス → 却下 |
| SUGUDASU / SUGUDASU Sports ブランド | **付けない** |
| 海外 | やる前提で設計。**1ドメイン + `/ja` `/en`**。DNS国別振り分けは初期やらない |
| 差別化の芯 | **配信モードでキャンバス最大化（≥80%）** + **ユーザーロゴ透かし** |
| Webcam | ボードに埋め込まない（OBS側） |
| お名前.com | レンタルサーバーアップセルは断る。ドメインのみ |

---

## 3. プロダクト要約（1分）

**ZoneBoard** = 競技コート俯瞰の戦術ボードWebアプリ。

- 駒・矢印・フォーメ・タイトル帯・**自分のロゴ透かし**
- **配信モード**でツールバーを消し、ピッチを最大化
- 登録不要・ローカル保存を初期方針（クラウド同期は後続可）
- 対象: 解説 YouTuber、部活・アマ監督、多競技（サカ/バス/バレ）

正本の詳細: [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) · UI/UX: [`UI_UX.md`](UI_UX.md)

---

## 4. 次の作業 — SPEC.md に落とすこと

`docs/SPEC.md` を新規作成。最低限含める節:

1. **ゴール / Non-goals（v1）**
2. **ペルソナと主要シナリオ**（配信画面共有 / 部活ホワイトボード代替）
3. **画面一覧**（編集・配信モード・設定オーバーレイ）
4. **配信モードのレイアウト契約**（ピッチ面積比、残すUI、ホットキー）
5. **ロゴ透かし**（入力・位置・不透明度・PNG焼き込み・永続化）
6. **競技プリセット**（寸法比の数値表 — 要調査 or 仮置き明記）
7. **データモデル**（ボードJSON、駒、描画オブジェクト、localStorageキー）
8. **Export**（PNG）
9. **i18n**（ja/en、パス、翻訳対象外）
10. **技術方針案**（静的ホスト想定・フレームワーク未決なら選択肢と推奨1つ）
11. **受け入れ条件（チェックリスト）**
12. **やらないこと（v1）**

PRODUCT_NOTE と矛盾させない。矛盾する場合は SPEC 側で「変更提案」と明示し、勝手に方針を覆さない。

---

## 5. やってはいけないこと

- SUGUDASU リポジトリへの機能実装・registry 登録
- `zoneboard.com` プレミアム購入の再提案
- 運営ロゴ強制ウォーターマーク
- ボード内 Webcam
- 国別ドメイン・GeoDNS の初期設計
- SPEC なしの本実装・本番デプロイ
- SUGUDASU Sync の旗艦タスクとの優先度混同

---

## 6. SUGUDASU 側のリンク（残置）

| パス | 内容 |
|------|------|
| `C:\asl_dev\sugudasu\docs\notes\TACTICS_BOARD_PRODUCT_NOTE.md` | **ポインタのみ** → 本リポジトリ |
| `C:\asl_dev\sugudasu\docs\notes\PRODUCT_IDEA_JUDGMENT_LEDGER.md` §16 | 別プロダクト候補の要約 + リンク |

ZoneBoard の文書更新は **`C:\asl_dev\zoneboard`** のみ。SUGUDASU ポインタの文言が古くなったらポインタ側を1行更新。

---

## 7. 技術・インフラメモ（未確定）

- ホスト候補: Cloudflare Pages 等（SUGUDASU と同系統は可だが **別プロジェクト**）
- DNS: `zoneboard.app` 取得済み/取得中想定。未接続でよい
- `.app` は **HTTPS必須**（HSTS）。ローカル開発は `localhost` 例外に注意
- Git: 未初期化なら SPEC 後でも可。SUGUDASU の remote に載せない

---

## 8. ユーザーへの返し方

- 仕様ドラフトができたら **表1枚 + 未決事項リスト** で確認を取る
- 実装に入る前に提督承認を待つ（明示依頼があるまでデプロイしない）

---

## 9. チェックリスト

- [x] 方針メモ（PRODUCT_NOTE）
- [x] ブランド・ドメイン方針
- [x] SUGUDASU から分離・ポインタ残置
- [x] Token 経済圏ドキュメント（TOKEN_ECONOMY.md）
- [x] **RTK 導入確認**（マシン / フック · `rtk` 0.36.0）
- [x] **CodeGraph init**（本リポ · `.cursor/mcp.json`。MCP 緑は Reload 後に提督確認）
- [x] **SPEC.md**（実装中）
- [x] **OSS_SURVEY.md**（GitHub 流用候補なし · 自前継続）
- [ ] ワイヤー / 寸法比表（SPEC §6 に寸法比表あり。ワイヤーは任意）
- [ ] 実装（SPEC 承認後）
- [ ] `zoneboard.app` 公開

---

*End of handoff*
