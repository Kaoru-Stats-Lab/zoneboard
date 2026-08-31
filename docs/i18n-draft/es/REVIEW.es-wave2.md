# es 波2 レビュー — LP（messages-lp）

**日付:** 2026-08-31  
**キー数:** 47（`lp*` 43 + 共有 4）— 一致 ✓

---

## 総合

**採用可.** `LP_COPY.md` 決定稿（キックオフ前の仕事 · 二本柱）に沿った訳。プロンプトどおり OBS 内部構造の断定や視聴者心理は避けている。

---

## 重要: en 正本とのズレ

`messages.ts` の **en LP は旧文案**（例: H1「Add a football tactics board…」）。Gemini の es は **LP_COPY 決定稿**ベース:

| キー | messages.en（現行） | es（Gemini） | LP_COPY 決定 |
|------|---------------------|--------------|--------------|
| lpHeadline1 | Add a football tactics board… | Coloca la alineación… | Set the lineup… ✓ |
| lpPayoff | Your cam and chat stay in OBS… | Suma el campo… | Add the pitch… ✓ |
| lpPromise3Body | Press B. Your OBS layout… | Oculta herramientas… modo emisión | Hide tools… broadcast ✓ |

**実装時:** en/ja を LP_COPY に揃えるか、es だけ先行するか方針決定。es 単体では問題なし。

---

## 良い点

- H1 / payoff — 配信者の**仕事**と「画面に足す」二本柱 ✓
- `campo` 統一 · `cancha` なし ✓
- `lpHeroCaption` — 顔・チャットはそのまま · 別ウィンドウ ✓
- 共有 4 キー — 波1と同一（pizarra） ✓
- `lpPhLaunch` — 英語維持 ✓

---

## 軽微メモ

- **pizarra** — 波1 App と統一（索引 tablero 推奨とは未決定のまま）
- **lpCan2** — 「carreras」（LP 用語表）· App ツール名 Desmarque とは役割分担で OK
- **lpCloseBody** — OBS 言及は lede/close 手順として可（H1 には載せていない ✓）

---

## ドラフト一式

| ファイル | 状態 |
|----------|------|
| `messages-lp.es.json` | 保存済 |
| `messages-app.es.json` | 未保存（波1 Gemini 出力待ち） |
| `howTo.es.json` | 保存済 |
