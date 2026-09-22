# Agent 必須 — ZoneBoard プロダクト境界

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。  
機能実装・リサーチ・AGENT_PROMPT 起草の **冒頭に読ませる**。

日本語で報告する。**コミットはユーザが頼むまでしない。**  
矛盾したら [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) を勝ちにする。

---

あなたは ZoneBoard（`c:\asl_dev\zoneboard`）のエージェントです。

## 0. 先に読め

1. [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) — **決定ログ Explanation Canvas / プロダクト境界（2026-09-22）**（全文）
2. このファイル
3. 作業対象の AGENT_PROMPT / BACKLOG 項目（あれば）
4. Cursor ルール `.cursor/rules/product-boundary.mdc`（alwaysApply · 要約）

---

## 1. 製品定義（固定）

ZoneBoard は **Explanation Canvas** である。

> Explain the idea.  
> Human Idea → Pitch → Visual Explanation  
> OBS の中のピッチ。

**ではないもの:**

> Analyze the game.  
> Game → Analysis → Tracking → Visualization → Presentation  
> Metrica Nexus 型 Analysis / Production Workstation（およびその縮小版）

原則: **人間が決める。ZB は可視化と面倒な座標・操作だけ減らす。**

---

## 2. 新機能ゲート（実装前に必ず答える）

作業開始前にチャットへ **4行で書け**（スキップ禁止）:

1. これは Idea→Explanation を速くするか？ / Game→Analysis か？
2. 「今、説明したい」摩擦を減らすか？
3. Workstation 化に変質しないか？
4. P0 / P1 Discovery / P2 需要後 / P3 やらない — のどれか？

**P3 なら実装せず止める。** P1/P2 なら「実装決定ではない」と明記し、勝手に本線化しない。

---

## 3. 優先順位クイック表

| 優先 | 例 | Agent の態度 |
|------|-----|----------------|
| **P0 Core** | Pitch-first · OBS · 手動コマ · **画像4点 Calibration → 配置**（B-070） | 壊さない · 強化してよい |
| **P1 Discovery** | Scene A→B · 軽量 Play | 仮説・調査のみ。Timeline/Keyframe にしない |
| **P2** | GIF/MP4 Export | 需要確認後のみ。Production Tool 化しない |
| **P3** | Tracking · AI Analysis · Coding · 本格 Animation Editor | **やらない** |

---

## 4. 局面取込との関係

B-070（4点 Calibration）は **Analysis ではない。** Explanation 空間へピッチを持ち込むためのコア。  
Player Recognition / Tracking / Tactical AI を足して「完成」させない。

索引: [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md)

---

## 5. 境界を変えるとき

1. ユーザに提案し確認を取る  
2. [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) 決定ログを更新  
3. [`BACKLOG.md`](BACKLOG.md) §1-1 と `.cursor/rules/product-boundary.mdc` を同期  
4. その後にコード

コードだけ・チャット合意だけで境界を書き換えない。

---

## 6. やらないこと（本プロンプト範囲）

- 本ファイルを無視して「便利そう」な分析・Tracking・動画編集機能を実装すること
- PRODUCT_NOTE に無い境界例外を発明すること
- SUGUDASU 本線タスクへの手の出し（別プロダクト）
