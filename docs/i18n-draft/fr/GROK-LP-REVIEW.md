# Grok LP レビュー — fr（フランス · 2026-09-01）

**判定:** **出荷可**

**入力:** `messages-lp.fr.json`（en 正本 · Gemini ドラフト + Grok top-1 反映済）

---

## 5 秒テスト

### Lucas（パリ）
「Ajoute un tableau tactique de foot à ton live OBS de ce soir. Masque les outils. Capture uniquement le terrain.」  
→ 今夜の OBS に戦術ボードを足し、ツールを消して terrain だけキャプチャする道具だと即理解。

### Camille（リヨン）
→ Wiloo / Le Coach 系の débrief · watchalong 向け。自分ごと化しやすい。

### Thomas（マルセイユ）
→ play-by-play / U19 解説。OBS capture de fenêtre 前提が明確。en 意味は保持。

---

## スコア（1–10）

| 軸 | Lucas | Camille | Thomas |
|----|-------|---------|--------|
| Cool / ブランド | 8 | 8 | 8 |
| 自分ごと化 | 9 | 9 | 9 |
| 信頼 | 9 | 9 | 9 |
| サッカー語 | 8 | 9 | 9 |
| 配信用語 | 9 | 9 | 9 |
| CTA | 9 | 9 | 9 |
| fr 自然さ | 9 | 9 | 9 |
| Passe/Course | 8 | 9 | 9 |

---

## en vs fr

- H1/H2/payoff/lpPromise2/lpCan5 — en 意味を保持。
- **tableau tactique** — 教室の tableau noir 連想なし。
- Metrica ユーザー — trop léger ではなく「今夜すぐ使える」がプラス。

---

## 反映した修正

| キー / 項目 | 変更 |
|-------------|------|
| `lpCanTitle` | `… débriefs et les analyses tactiques.`（Grok top-1） |
| `matchLabelPh` | **Journée 1**（Ligue 1 除去） |
| basket/volley placeholders | スター名 → Martin/Bernard/Dubois/Petit |
| `titlePh` | LDC 除去 |

---

## 任意（未採用以外）

- lpCloseCta / lpPromise2Body — Grok 通り現状維持。
