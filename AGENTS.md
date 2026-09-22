# ZoneBoard — Agent 入口

別チャット / 別 Agent はここから入る。

| 順 | 読むもの | 役割 |
|----|----------|------|
| 1 | [`.cursor/rules/product-boundary.mdc`](.cursor/rules/product-boundary.mdc) | **常時適用** · プロダクト境界ゲート |
| 2 | [`docs/AGENT_PROMPT_PRODUCT_BOUNDARY.md`](docs/AGENT_PROMPT_PRODUCT_BOUNDARY.md) | 別 Agent に渡す境界プロンプト全文 |
| 3 | [`docs/PRODUCT_NOTE.md`](docs/PRODUCT_NOTE.md) | 方針正本（**2026-09-22 Explanation Canvas**） |
| 4 | [`docs/AGENT_HANDOFF.md`](docs/AGENT_HANDOFF.md) | 引き継ぎ · 作業の進め方 |
| 5 | [`docs/BACKLOG.md`](docs/BACKLOG.md) | 未着手 · §1-1 境界要約 |
| 6 | [`docs/UI_UX.md`](docs/UI_UX.md) | chrome / パネル |
| — | [`docs/CAPTURE_IMPORT_P1_REQUIREMENTS.md`](docs/CAPTURE_IMPORT_P1_REQUIREMENTS.md) | B-070 Phase 1 要件 |
| — | [`docs/CAPTURE_IMPORT_CALIB_UX_SPEC.md`](docs/CAPTURE_IMPORT_CALIB_UX_SPEC.md) | キャリブ UX 骨格（W09） |
| — | [`docs/CAPTURE_IMPORT_CALIB_UX_W10_SPEC.md`](docs/CAPTURE_IMPORT_CALIB_UX_W10_SPEC.md) | **キャリブ HCI · 一覧/ラベル（W10 · UI勝ち）** |
| — | [`docs/AGENT_PROMPT_CAPTURE_IMPORT_W10_CALIB_LIST.md`](docs/AGENT_PROMPT_CAPTURE_IMPORT_W10_CALIB_LIST.md) | W10 実装プロンプト |

**一言:** ZoneBoard = **Explain the idea**（Explanation Canvas）。Metrica 型 = **Analyze the game**（やらない）。OBS の中のピッチ。

ユーザー向け返答は日本語。コミットはユーザ依頼までしない。
