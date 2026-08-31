# 実装プロンプト — 局面取込 W05: 手置きと確定（B-070 · Phase 1）

**索引:** [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md) · **Wave 5/5 · ✅ 完了想定**  
**後続:** [**W07 ゲート**](AGENT_PROMPT_CAPTURE_IMPORT_W07_GATE.md)（Deploy 前）→ [W06](AGENT_PROMPT_CAPTURE_IMPORT_W06_FRAME.md) · [本番 UAT](AGENT_PROMPT_CAPTURE_IMPORT_P1_UAT.md)

---

## 実装正本（W05 完了時のコード map）

| 領域 | パス |
|------|------|
| セッション型 | `src/capture/session.ts` — `draftPieces` · `draftBall` · `toolBeforePlace` |
| state / API | `src/hooks/useAppState.ts` — 下表 |
| 配置 pointer | `src/components/BoardCanvas.tsx` — `inCapturePlace` · `capture-draft-*` drag |
| ゴースト描画 | `src/canvas/drawBoard.ts` — `draftPieces` + `drawPiece(..., ghost=true)` · `draftBall` α0.45 |
| 確定 UI | `src/components/Drawer.tsx` — `applyCaptureToScene` · 新局面 checkbox |
| Delete | `src/components/Editor.tsx` — draft 選択時 Delete/Backspace |
| 適用 | `applyCaptureHomography()` → `phase: "place"` · `toolBeforePlace` 保存 |

### useAppState API（W03–W05）

| 関数 | 役割 |
|------|------|
| `applyCaptureHomography()` | calib → place |
| `addCaptureDraftPiece(x,y,team)` | ゴースト追加 |
| `moveCaptureDraftPiece` / `setCaptureDraftBall` | ドラッグ |
| `selectCaptureDraftPiece` / `deleteCaptureDraftSelected` | 選択 · 削除 |
| `applyCaptureToScene(asNewScene)` | `captureUndo` → scene 反映 → `clearCaptureImport` |
| `clearCaptureImport()` | revoke URL · tool 復帰 |

### 配置座標

下敷きは **ピッチ矩形にワープ済み**（`drawCaptureUnderlay.ts`）。  
クリックは `getNorm` → `pitchToWorld` で world 0–1。**逆 Homography は不要**（ワープ後ピッチ上のクリック = 正規座標）。

### 確定後

- **下敷きは消える**（session 破棄 · scene に PNG 埋め込みなし）
- **駒だけ** `scene.pieces` / 新局面に残る

---

## 意図的に未実装（W05 スコープ外）

- 自動駒 · OCR · 身元ピック（Phase 2）
- Export 見たまま PNG（Later）
- **`isCaptureImportEnabled()`** → [**W07**](AGENT_PROMPT_CAPTURE_IMPORT_W07_GATE.md)
- 動画コマ抜き → [**W06**](AGENT_PROMPT_CAPTURE_IMPORT_W06_FRAME.md)

---

## 検証（完了時）

- [ ] draft 中 `scene.pieces` 不変
- [ ] 反映 · Undo · 新局面 · 破棄
- [ ] `place` 中 pass/pen 誤動作なし
- [ ] `tsc` · `test:i18n-chrome`

---

## 歴史用 — 当初ゴール（参照）

<details>
<summary>元プロンプト本文</summary>

手置きゴースト → 微調整 → 局面確定/取消。ツールは `piece-home` / `piece-away` / `ball` 流用。`place` 中は pass 等と半端共存禁止。i18n: `capturePlaceHint` · `captureApplyToScene` 等。

</details>
