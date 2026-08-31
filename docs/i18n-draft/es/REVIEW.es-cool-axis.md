# es Cool 軸 + tablero — 変更メモ

**日付:** 2026-08-31  
**理由:** pizarra = 教室連想 · ZB ブランド（クリエイターツール / CL アンセム温度）と不一致

---

## 語彙

| 禁止 | 採用 |
|------|------|
| pizarra / pizarras | **tablero / tableros** |
| — | CTA: **Abrir tablero**（`openBoard` · `lpCloseCta`） |

---

## LP 訴求軸（Cool · ja/en 本番エネルギー）

| キー | 旧（LP_COPY 決定稿寄り） | 新 |
|------|-------------------------|-----|
| lpHeadline1 | Coloca la alineación antes del saque inicial. | **Tu directo. El campo a pantalla llena.** |
| lpHeadline2 | Muestra pases y movimiento en el campo. | **Sin menús. Solo fútbol en pantalla.** |
| lpHeroCaption | …La pizarra es una ventana aparte. | **El campo llena la ventana. Cara y chat siguen en su sitio.** |
| lpLede | …software de emisión… | **Sin cuenta. Abre en el navegador. Captura la ventana en OBS.** |
| lpPromise3Title | Emite | **Directo** |
| lpPromise3Body | Oculta las herramientas… | **Pulsa B. Solo el campo en directo.** |
| lpCanTitle | Creado para directos y watchalongs. | **Para la noche del partido en directo.** |
| lpCanLead | Pensado para streamers… | **Para streamers. Entrenadores también.** |

機能は英日と同一。LP_COPY §2（OBS 心理を書かない）は維持。

---

## 更新ファイル

- `messages-lp.es.json`
- `gemini-app-raw.json` → `messages-app.es.json`（rebuild）
- `AGENT_PROMPT_I18N_ES.md` · `AGENT_PROMPT_I18N_ES_LP.md`

---

## 未着手

- en/ja LP を Cool 軸 vs LP_COPY 決定稿のどちらに一本化するか（es 先行パイロット）
- `/es/` 実装（messages.ts マージ）
