# Token 経済圏 — RTK · CodeGraph（ZoneBoard 必須導入）

**更新:** 2026-07-04  
**思想:** Agent のコンテキストは有限。**トークンは通貨**。無駄な全文ダンプ・grep 連打・巨大シェル出力は赤字。索引と圧縮で **同じ仕事をより安く**回す。

| ツール | リポジトリ | 役割 |
|--------|------------|------|
| **RTK** | [rtk-ai/rtk](https://github.com/rtk-ai/rtk) | Shell 出力を圧縮（目安 60–90% 削減）。CLI プロキシ |
| **CodeGraph** | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | コードをローカルグラフ索引。grep/Read 連打の代わりに MCP 1 クエリ |

SUGUDASU での運用メモ（参考・別リポ）:  
`C:\asl_dev\sugudasu\docs\notes\RTK_CURSOR.md` · `CODEGRAPH_CURSOR.md`

---

## 1. 思想（Token 経済圏）

| 原則 | 意味 |
|------|------|
| **トークンは有限予算** | 長いセッションほど枯渇する。ZoneBoard は仕様→実装で会話が伸びる前提 |
| **入力を減らす** | 必要な記号・差分・エラー行だけを Agent に渡す（RTK） |
| **探索コストを下げる** | 「どこに何があるか」を毎回全文検索しない（CodeGraph） |
| **SSOT に知識を残す** | 製品知識は `docs/`。毎回チャットで再説明しない |
| **二重管理しない** | 索引・フックはリポ単位。sugudasu の `.codegraph` を流用しない |

**やらない:** ログ全文貼り付け · 無関係ファイルの一括 Read · 失敗コマンドの連打（RTK 圧縮前でも無駄）。

---

## 2. RTK（導入すること）

**正本:** https://github.com/rtk-ai/rtk · [README_ja](https://github.com/rtk-ai/rtk/blob/develop/README_ja.md)

### 何をするか

Agent が Shell で叩く `git` · `npm` · `rg` 等の出力を RTK が要約し、**コンテキストに載るトークンを削る**。

### ZoneBoard での導入手順（Agent / 提督）

マシンに未導入なら（SUGUDASU で導入済みなら CLI は共有可）:

```powershell
# 公式手順に従い rtk を PATH へ（バージョンは upstream に合わせる）
rtk init -g --agent cursor --auto-patch
```

| 項目 | 内容 |
|------|------|
| フック | Cursor `preToolUse` が Shell を `rtk …` に書き換え（global） |
| 依存 | Windows では `jq` · bash（Git Bash）がフックに必要な場合あり |
| 確認 | Agent に `git status` を任せ、出力が短文化されるか。統計は `rtk gain` |
| フォールバック | フック不調時は明示的に `rtk git status` 等 |

**ZoneBoard 作業中:** 大きな `npm` / `git log` / テスト出力は **必ず RTK 経由**（自動フック前提）。生の巨大ログをチャットに貼らない。

---

## 3. CodeGraph（導入すること）

**正本:** https://github.com/colbymchenry/codegraph

### 何をするか

リポジトリのシンボル・呼び出しを **ローカル SQLite グラフ**に索引。Agent は MCP で関連コードを取り、**ツール往復とトークンを減らす**（100% ローカル · API キー不要）。

### ZoneBoard リポでの導入手順（必須 · リポごと）

```powershell
cd C:\asl_dev\zoneboard
npx -y @colbymchenry/codegraph init
npx -y @colbymchenry/codegraph status
```

| 項目 | 内容 |
|------|------|
| MCP | `.cursor/mcp.json` に `codegraph`（`npx @colbymchenry/codegraph serve --mcp`） |
| 索引 | `.codegraph/`（**`.gitignore` に入れる**） |
| 同期 | ファイル変更で自動更新（デフォルト ON）。手動は `codegraph sync` |
| 確認 | Cursor → Settings → MCP で `codegraph` が緑 |

**注意:** sugudasu の索引とは **別**。ZoneBoard を Open Folder にしたワークスペースで `init` する。

### Agent の使い方

- 実装・リファクタ時は **先に CodeGraph でシンボル検索**し、当たりをつけてから Read
- 「全部読んでから考える」は禁止（Token 経済圏違反）

---

## 4. 導入チェックリスト（SPEC 着手前でも可）

- [x] `rtk` が PATH で動く（`rtk --version` → **0.36.0**）
- [x] Cursor フック or 明示 `rtk` でシェル出力が圧縮される（`hooks.json` · `rtk-rewrite.sh` · `rtk init -g --agent cursor --auto-patch` 再実行済 2026-07-04）
- [x] `C:\asl_dev\zoneboard` で `codegraph init` 済み（コード未着手のため Files: 0。実装後に自動同期）
- [x] `.codegraph/` が `.gitignore`
- [x] `.cursor/mcp.json` に codegraph（ワークスペース）
- [ ] MCP 緑ランプ確認（提督: **Developer: Reload Window** → Settings → MCP）

コードが増える前に索引を回しておくと、SPEC→実装の遷移が安い。

---

## 5. OSS 調査も Token 経済圏で

競合・流用候補の GitHub 探索は **clone しない・JSON 要約のみ・判定は SSOT に残す**。

正本: [`OSS_SURVEY.md`](OSS_SURVEY.md)（2026-07-04: **採用可能な本命リポなし → 自前実装継続**）。

---

## 6. 関連

| パス | 内容 |
|------|------|
| [`AGENT_HANDOFF.md`](AGENT_HANDOFF.md) | 別 Agent 引き継ぎ（本思想を必読に含む） |
| [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) | 製品方針 |
| [`OSS_SURVEY.md`](OSS_SURVEY.md) | GitHub 戦術ボード OSS 調査 |
| sugudasu `RTK_CURSOR.md` / `CODEGRAPH_CURSOR.md` | 同マシンでの導入実績（参考） |
