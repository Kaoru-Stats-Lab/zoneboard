# OSS 戦術ボード調査（GitHub）

**実施:** 2026-07-04  
**目的:** ZoneBoard 実装前に、フォーク／流用可能な公開リポジトリがあるか確認する。  
**結論:** **採用可能な本命リポは見つからなかった。自前実装を継続する。**

---

## Token 経済圏での調査手順

巨大 clone・全文 README 貼り付けはしない。

| 手順 | 内容 |
|------|------|
| 1 | `gh search repos` を **JSON 要約のみ**（name / stars / language / license / url） |
| 2 | 有望候補だけ `gh api repos/... --jq` でメタ（更新日・SPDX） |
| 3 | 必要なら README / package.json を **API で先頭だけ** |
| 4 | 本ファイルに判定を残し、以後はここを SSOT（再検索しない） |

検索語（英語必須 + es/pt）:

- `tactics board`, `football tactics`, `tactical board`
- `pizarra tactica`, `tablero tactico`, `tablero futbol`
- `prancheta tatica`, `prancheta futebol`, `quadro tatico`
- code search: `"pizarra táctica"`, `"prancheta tática"`

---

## 判定基準（ZoneBoard 適合）

| 必須 | 理由 |
|------|------|
| **明確な OSS ライセンス**（MIT / Apache-2.0 等） | ライセンス無しは流用不可 |
| Web（できれば React/TS/Canvas or SVG） | 現行スタックと整合 |
| デスクトップ専用・動画解析特化でない | SPEC のボード領域 |
| クラウド必須でない、または切り離し容易 | v1 は登録不要・ローカル |
| GPL のみは非推奨 | 配布条件が重い |

ZoneBoard 楔（配信で chrome 消し・ユーザーロゴ・localStorage 3枚）を持つ OSS は **調査範囲でゼロ**。

---

## 英語圏（マスト調査）

| リポ | ★ | 言語 | ライセンス | 更新 | 判定 |
|------|---|------|------------|------|------|
| [gljubojevic/tactics-board](https://github.com/gljubojevic/tactics-board) | 21 | React / MUI / **Firebase** / SVG | **なし** | 2026-02 | **不採用**。星は最多級だがライセンス無し。クラウド前提。フットサル向け。参考 UI 程度 |
| [pespila/Soccer-Tactics](https://github.com/pespila/Soccer-Tactics) | 3 | Python | MIT | 2026-03 | **不採用**。スタック不一致 |
| [ModeenF/SportsTacticsBoard](https://github.com/ModeenF/SportsTacticsBoard) | 2 | C# | **GPL-2.0** | 2025-05 | **不採用**。デスクトップ + 伝染ライセンス |
| [maklad42/react-footy-tactics](https://github.com/maklad42/react-footy-tactics) | 2 | React | **なし** | 2022-05 | **不採用**。古い・ライセンス無し |
| [tjokimie/catenaccio](https://github.com/tjokimie/catenaccio) | 1 | JS | MIT | **2017-04** | **不採用**。メンテ断絶 |
| [adlani10/TacticsBoard](https://github.com/adlani10/TacticsBoard) | 1 | JS | **なし** | 2025-02 | **不採用**。ライセンス無し |
| [spyderkam/Tactics-Board](https://github.com/spyderkam/Tactics-Board) | 1 | Python | MIT | — | **不採用**。スタック不一致 |
| [halfbyte/mooves](https://github.com/halfbyte/mooves) | 2 | JS | なし | archived | **不採用** |
| その他 `*tactics-board*` 多数 | ≤1 | 雑多 | 多くがなし | — | 学習用個人リポ。流用価値なし |

**英語の示唆:** 公開 OSS は総じて **星が少なく、ライセンス欠落かスタック不一致**。商用に近い戦術ボード（TacticalPad 等）はクローズド。Web で一番「らしい」`gljubojevic/tactics-board` も **Firebase + ライセンス無し**で ZoneBoard 方針と逆。

---

## スペイン語圏

repo 名検索（`pizarra tactica` / `tablero tactico`）はほぼ空。**code search** でヒット。

| リポ | ★ | 内容 | ライセンス | 判定 |
|------|---|------|------------|------|
| [ioiotinez/tactical-soccer](https://github.com/ioiotinez/tactical-soccer) | 0 | React + dnd。「Pizarra táctica de fútbol」UI | **なし** | **不採用** |
| [nacholosasso/ataqueyjusticia](https://github.com/nacholosasso/ataqueyjusticia) | 0 | Vite。クラブ用プラント＋ピサラ（Firestore 連携） | **なし** | **不採用**。アプリ全体の一部 |
| [DisruptivoLab/tablero_futbolero](https://github.com/DisruptivoLab/tablero_futbolero) | 0 | JS | **なし** | **不採用** |
| [AlanTeixido/ProTactics-API](https://github.com/AlanTeixido/ProTactics-API) | 0 | 指導者向け API/ダッシュボードの一部にピサラ言及 | **なし** | **不採用**。ボード単体でない |

**スペイン語の示唆:** 予想どおり個人・授業・クラブ向けリポは存在するが、**星ゼロ・ライセンス無し・プロダクト全体の一部**が大半。フォーク基盤にはならない。

---

## ポルトガル語圏（ブラジル想定）

| リポ | ★ | 内容 | ライセンス | 判定 |
|------|---|------|------------|------|
| [josecastro29/PranchTatic](https://github.com/josecastro29/PranchTatic) | 0 | 「Prancheta Tática - Futebol」 | **なし** | **不採用** |
| [murilolucenaa/mais90](https://github.com/murilolucenaa/mais90) | 0 | ブラウザサッカーゲーム。FIFA 風プランチェタ言及 | **なし** | **不採用**。ゲーム本体 |
| [MateosPres/ancbprancheta](https://github.com/MateosPres/ancbprancheta) | — | バスケ用プランチェタ | 要確認・低星 | **不採用**（競技・範囲外） |

**ポルトガル語の示唆:** 「prancheta tática」はコード上よく出るが、**再利用可能な成熟 OSS ではない**。

---

## 総合判定

| 問い | 答え |
|------|------|
| 使える Repo はあるか？ | **実質なし**（ライセンス・スタック・方針のいずれかで落ちる） |
| 部分流用（ピッチ描画だけ等）は？ | ライセンス無しが多く法的に危険。MIT の Python/古い JS はコスト対効果が悪い |
| 参考にしてよいもの | UI の存在確認のみ（例: gljubojevic の SVG 方針、tactical-board.com 系の機能リスト）。**コードコピーはしない** |
| ZoneBoard への影響 | **現行の自前実装を継続**。OSS 待ちで止めない |

### やらないこと

- ライセンス無しリポの vendoring
- GPL リポのコア取り込み
- Firebase 前提ボードのフォーク（登録不要方針と衝突）

### 再調査トリガ

次のいずれかが起きたときだけ再検索する（Token 節約）:

- 明確な MIT/Apache の React 戦術ボードが話題になった
- 配信モード（chrome オフ）を売りにした OSS が現れた

---

## 関連

| パス | 内容 |
|------|------|
| [`SPEC.md`](SPEC.md) | 実装仕様（自前実装の正本） |
| [`TOKEN_ECONOMY.md`](TOKEN_ECONOMY.md) | 調査もトークン通貨で回す |
| [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) | 差別化（配信・ユーザロゴ） |

*End of OSS survey*
