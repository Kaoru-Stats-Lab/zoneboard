# Grok LP レビュー — de（DACH · 2026-08-31）

**判定:** **出荷可**

**入力:** `messages-lp.de.json`（en 正本 · Gemini ドラフト + Grok top-3 反映済）

---

## 5 秒テスト

### Jonas（ベルリン）
「Füge deiner heutigen OBS-Show ein Fußball-Taktikboard hinzu. Tools ausblenden. Nur das Spielfeld aufnehmen. Cam und Chat bleiben in OBS.」  
→ 今夜の OBS 配信に戦術ボードを足し、ツールを消してフィールドだけキャプチャする道具だと即理解。en 意図が明確。

### Lena（ミュンヘン）
「heutigen OBS-Show · Taktikboard · Tools aus · Nur das Spielfeld · Cam und Chat bleiben in OBS」  
→ Watchalong / 戦術動画向けの軽量 Taktikboard。「今夜の配信」に寄って自分ごと化しやすい。

### Markus（ハンブルク）
→ 戦術解説・ Jugendtraining 向け。OBS Fensteraufnahme 前提がはっきり。en 意味は失われていない。

---

## スコア（1–10）

| 軸 | Jonas | Lena | Markus |
|----|-------|------|--------|
| Cool / ブランド | 8 | 8 | 8 |
| 自分ごと化 | 9 | 9 | 9 |
| 信頼 | 9 | 9 | 9 |
| サッカー語 | 8 | 9 | 9 |
| 配信用語 | 9 | 9 | 9 |
| CTA | 8 | 8 | 8 |
| de 自然さ | 9 | 9 | 9 |
| server-frei / lokal | 9 | 9 | 9 |

---

## en vs de

- H1/H2/payoff/lpCan5/lpBullet3 — en 意味を保持。`server-frei` は DACH 向け強化。
- **Taktikboard** — 教室 Tafel 連想なし。分析ツール寄り。
- Metrica/TacticalPad ユーザー — 「軽すぎる」ではなく「今夜すぐ使える」がプラス。

---

## 反映した修正（top 3）

| キー | 変更 |
|------|------|
| `lpCloseCta` | `… kein Account · bereit für OBS` |
| `lpCanTitle` | `… und Taktik-Videos.` |
| `lpCan5` | 現状維持（server-frei 有効） |

---

## 任意（未採用）

- `lpCan2` に Halbraum 明示 — en 逸脱のため見送り。App の `lanes5` で訴求。

---

## App 波メモ

- `matchLabelPh` → **Spieltag 1**（Bundesliga 除去 · 中立プレースホルダ）
- `lanesOff` / `lanesOffShort` → **Keine Räume** / **Aus**（5 Räume と統一）
- `sceneMirrorEndsShort` → **Spiegeln**（13 文字 overflow 修正）
