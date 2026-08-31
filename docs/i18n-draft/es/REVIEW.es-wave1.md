# es 波1 レビュー — messages-app + howTo

**日付:** 2026-08-31  
**ソース:** Gemini 出力（カオル貼付）  
**正本キー数:** 523（`messages.en` · `lp*` 除外） — 一致 ✓

---

## 総合

**マージ可（軽微修正後）.** キー欠落なし · Short 12 文字以内 · 用語の大半が索引と整合。実装前に下記 4 点だけ方針決定 or 1 行修正推奨。

---

## 要修正（実装前）

| 優先 | キー | 現状 | 提案 |
|------|------|------|------|
| P1 | `captureImportImageReady` | 「…alinear 4 puntos **(W03)**」 | 開発トークン除去 → 「Imagen cargada. Siguiente: alinear las 4 esquinas del campo.」 |
| P1 | `captureImportUnsupportedSport` | 「…**(Fase 1)**」 | ユーザー向け → 「Solo fútbol 11 horizontal por ahora.» |
| P1 | `captureImportUnsupportedPitch` | 「**(Próximamente)**」 | 「Vertical o medio campo: aún no disponible.» |
| P2 | howTo §Dibujar · `combo` | `Pass` / `Run / Dribble`（英語） | messages で **Pase/Desmarque/Regate** 採用なら combo も揃える（ja は combo=パス と一致） |

---

## 方針判断（どちらか選ぶ）

### 1. ツール名 — 方針 A vs B

| | 方針 A（索引推奨） | Gemini 現状（方針 B） |
|--|-------------------|----------------------|
| pass / run / dribble | Pass / Run / Dribble | Pase / Desmarque / Regate |
| 参照 | en · 国際配信者 | ja（カタカナ）に近い完全ローカル |
| howTo combo | en 維持で自然 | **不一致**（combo 英語 · 本文スペイン語） |

**推奨:** 方針 B を採るなら **messages + howTo combo + deleteHint** を一括でスペイン語化。方針 A ならツール 5 キー + howTo combo を en 揃えに戻す。

### 2. board 語彙 — pizarra vs tablero

索引は保存単位 **partido** · 盤面 **tablero** 推奨。Gemini は **pizarra**（openBoard · boards · exportHint 等）。

| 選択 | 例 |
|------|-----|
| pizarra 統一 | 配信者に馴染み · 現状のまま |
| tablero 統一 | 索引準拠 · `Abrir tablero` · `Tableros de partido` |

LP 波2 と合わせて決める（`openBoard` は App/LP 両方）。

---

## 良い点

- **modo emisión** · **escena** · **ficha** · **plantilla** · **córner** — 索引どおり一貫
- **Short キー** — `_shortOverflow: []` 妥当（`toolIndicator: Herr.` 等）
- **プレースホルダ** — García / RMA / FCB / LaLiga — LATAM+ES 中立
- **OBS 用語** — Browser Source · Window Capture 英語維持 ✓
- **howTo** — 5 セクション構造 · tú 調 · 配信者向け能動態

---

## 軽微メモ（ブロッカーではない）

- `feedbackOpen`: 「Feedback」英語 — ローンワードとして可
- `broadcast`: 「Modo emisión」— en「Broadcast」より長いが Short ではない
- `deleteHint`: Pase=… — 方針 B と整合 ✓
- en 側も `captureImportImageReady` に W03 残存 — es 修正時に en も揃えるとよい

---

## ファイル

| ファイル | 状態 |
|----------|------|
| `howTo.es.json` | リポジトリ保存済 |
| `messages-app.es.json` | Gemini 出力をこのパスへ配置（523 キー） |
| `messages-lp.es.json` | 波2 未着手（43 `lp*` キー） |

---

## 次ステップ

1. 上記 P1 文言修正 + ツール名方針 A/B 決定
2. `messages-app.es.json` を `docs/i18n-draft/es/` に保存
3. 波2 — `docs/AGENT_PROMPT_I18N_ES_LP.md`
4. 実装 Agent — `Locale` · `messages.ts` マージ · `test:i18n-chrome`
