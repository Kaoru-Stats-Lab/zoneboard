# Grok LP レビュー — tr（トルコ · 2026-09-01）

**判定:** **出荷可**

**入力:** `messages-lp.tr.json`（en 正本 · Gemini ドラフト + Grok レビュー反映済）

---

## 5 秒テスト

### Emre（İstanbul）
「Bu akşamki OBS yayınına bir futbol taktik tahtası ekle. Araçları gizle. Yalnızca sahayı yakala. Kameran ve sohbetin OBS'te kalır.」  
→ 今夜の OBS 配信に戦術ボードを足し、ツールを消して saha だけキャプチャする道具だと即理解。

### Ayşe（Ankara）
→ kadro 議論 · X PNG · watchalong 向け tahta。準備感より「今夜の配信・試合前」に寄り自分ごと化しやすい。

### Can（İzmir）
→ 3 大クラブ議論配信 · hızlı flip · OBS pencere yakalama前提が明確。en 意味は保持。

---

## スコア（1–10）

| 軸 | Emre | Ayşe | Can |
|----|------|------|-----|
| Cool / ブランド | 8 | 8 | 8 |
| 自分ごと化 | 9 | 9 | 9 |
| 信頼 | 9 | 9 | 9 |
| サッカー語 | 8 | 9 | 9 |
| 配信用語 | 9 | 9 | 9 |
| CTA | 9 | 9 | 9 |
| tr 自然さ | 9 | 9 | 9 |
| Pas/Koşu | 8 | 9 | 9 |
| kadro görseli | 8 | 9 | 9 |

---

## en vs tr

- H1/H2/payoff/lpPromise2/lpCan5 — en 意味を保持。
- **taktik tahtası** — sınıf tahtası 連想なし。
- lpCan4「şık bir kadro görseli (PNG)」— X · Stories 層に効く。
- lpCanTitle — watchalong · kadro · maç öncesi X — 変更不要。

---

## 反映した修正（実装 Agent）

| キー / 項目 | 変更 |
|-------------|------|
| `matchLabelPh` | **Hafta 1**（Süper Lig 除去 · 中立化） |
| `titlePh` | **İlk maç notları**（ŞL YF 除去） |
| basket/volley placeholders | スター名 → Yılmaz/Kaya/Demir/Çelik |

---

## CMO 判定

**出荷可** — Grok top 3 修正提案はすべて現状維持で問題なし。
