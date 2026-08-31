# 実装プロンプト — 局面取込 W04: 実写下敷き描画（B-070 · Phase 1）

**索引:** [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md) · **Wave 4/5**  
**前提:** W01–W03 merge 済み · **capture import ゲート内のみ** underlay 描画。

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

**いまやるのは:** キャンバス上に **Homography ワープした実写** を半透明下敷きとして描画。**駒クリック配置 · 確定は W05。**

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

## 0. 先に読め

1. 索引 · PRODUCT_NOTE「見たまま PNG = スクショ＋駒」
2. `src/canvas/drawBoard.ts` — 描画順序
3. `src/canvas/drawPitch.ts` — 芝描画
4. `src/components/BoardCanvas.tsx` — rAF ループ
5. W01 `transformPoint` / `invertHomography`

---

## 1. ゴール

### 1-1. 見え方（Phase 1）

| モード | 描画 |
|--------|------|
| **取込配置中** (`phase place`) | 芝グリッド **の下** に実写ワープ · **上** に通常のピッチ線（半透明 or 通常 · **線は読める**）· 駒は W05 |
| **確定後** | W05 で `scene.captureUnderlay` 相当を **持たない** Phase 1 方針 — **確定後は下敷き OFF · 駒だけ残る**（PRODUCT_NOTE: 永続は座標。下敷き PNG 埋め込みは Phase 1 非） |

**Later:** 「見たまま Export」用に scene に underlay ref — **W04 では実装しない**。Export 焼き込みも W05 スコープ外なら報告に残す。

### 1-2. 描画方式（いずれか 1 つ · 散らかすな）

**推奨 A — 2 パス Canvas:**

1. offscreen: 画像を Homography で **ピッチ矩形にワープ**（ピクセルシェーダ不要 · 三角形分割 or `drawImage` + transform 近似）
2. `drawBoard` 先頭: ワープ結果を `fitField` 内に **opacity ~0.55** で draw
3. 既存 `drawPitch` · 駒

**推奨 B — DOM overlay:** キャンバス背面に `<img>` + CSS matrix — **OBS 窓キャプチャでズレやすいので Canvas 推奨**

新規: `src/capture/drawCaptureUnderlay.ts` — `drawCaptureUnderlay(ctx, layout, session, board)`

### 1-3. パフォーマンス

- ワープ結果は **キャッシュ**（homography / 画像 / layout 変化時のみ再計算）
- 再計算は **Worker 可**（W03 Worker 再利用）。メインスレッド >16ms 続けない
- `board` の pitchOrientation / viewport 変更中も **取込中は横フル固定**（W02 ガード）

### 1-4. UI 微調整

- 下敷き **不透明度スライダ** 1 本（0.3–0.8）— セッション内のみ · 永続化しない
- **4点に戻る** — `phase → calib`（homography クリア可）

---

## 2. やってはいけない

- `scene` / localStorage に PNG base64
- drawBoard 全体リファクタ
- 自動駒描画
- 縦ピッチ underlay
- Export PNG への焼き込み（W05 または Later）
- WebGL 必須化

---

## 3. ガードレール（Cursor Auto）

1. **drawBoard.ts に 300 行ベタ書きするな** — `drawCaptureUnderlay` 1 import
2. **ピッチ線を消して実写だけにするな** — 配置のため線は残す
3. **毎 rAF でフルワープするな** — キャッシュ
4. **確定後も巨大 ImageBitmap を state に残すな** — W05 clear と連携
5. **CSS rotate で「縦対応」するな**
6. **芝の色を実写に合わせてテーマ変更するな**

---

## 4. 検証

- [ ] `place` フェーズ: 実写がピッチ枠に roughly 一致（目視）
- [ ] 不透明度スライダが効く
- [ ] 通常編集（取込なし）の drawBoard **回帰なし**
- [ ] 配信モード · 取込セッションなし — underlay なし
- [ ] `tsc`
- [ ] OBS 窓キャプチャで **上下ズレなし**（Canvas 方式）

---

## 5. 完了報告

- 描画方式 A/B どちらか
- キャッシュキー
- W05 への引き継ぎ（クリック座標 → invert H）
