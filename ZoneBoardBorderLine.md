# ZoneBoardBorderLine → 統合済み

このメモの内容は **[`docs/PRODUCT_NOTE.md`](docs/PRODUCT_NOTE.md)** に統合した。

**正本:** 決定ログ **Explanation Canvas / プロダクト境界（2026-09-22）**

**別 Agent が必ず通る導線（仕組み）:**

| 層 | パス |
|----|------|
| 入口 | [`AGENTS.md`](AGENTS.md) |
| 常時ルール | [`.cursor/rules/product-boundary.mdc`](.cursor/rules/product-boundary.mdc)（`alwaysApply`） |
| 渡すプロンプト | [`docs/AGENT_PROMPT_PRODUCT_BOUNDARY.md`](docs/AGENT_PROMPT_PRODUCT_BOUNDARY.md) |
| 引き継ぎ | [`docs/AGENT_HANDOFF.md`](docs/AGENT_HANDOFF.md) §0 |
| BACKLOG 要約 | [`docs/BACKLOG.md`](docs/BACKLOG.md) §1-1 |

新規の境界・優先順位・Discovery 判断は PRODUCT_NOTE を更新し、上記ルール／プロンプト／BACKLOG を同期すること。このファイルはポインタのみ。
