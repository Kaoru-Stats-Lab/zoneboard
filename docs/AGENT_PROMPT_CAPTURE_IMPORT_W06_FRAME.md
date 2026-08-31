# 実装プロンプト — 局面取込 W06: コマ抜き（B-070 · Phase 1 後半 · 任意）

**索引:** [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md)  
**前提:** **W01–W05 ✅** · [**W07 ゲート ✅**](AGENT_PROMPT_CAPTURE_IMPORT_W07_GATE.md)（`/tools/frame` も gate 内）

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

**いまやるのは:** 別タブ `/tools/frame` · ローカル MP4/WebM · 1 フレーム PNG → ボード側 **`ingestCaptureImportDataTransfer` / `Ctrl+V`**。Homography 以降は **既存フロー再利用**。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

## 0. 先に読め

1. [`BROADCAST_CAPTURE_IMPORT_RESEARCH.md`](BROADCAST_CAPTURE_IMPORT_RESEARCH.md) §3
2. [`STREAMER_RIG_RESEARCH.md`](STREAMER_RIG_RESEARCH.md) — 帯 B
3. **W02 接続 API（正本）:**
   - `state.ingestCaptureImportDataTransfer(dt)` — paste/drop と同じ
   - `state.setCaptureImageFromBlob(blob)` — Blob 直渡し可
   - `state.startCaptureImport()` — セッション開始（gate + eligibility 内）
4. `src/lib/captureImportGate.ts` — **`isCaptureImportEnabled()` 必須**
5. **触らない:** `homography.ts` · `BoardCanvas` place ロジック · `applyCaptureToScene`

---

## 1. ゴール

### 1-1. 最小 MVP

```text
/tools/frame（gate ON のみ）
  → ファイル選択（MP4/WebM）
  → シークバー
  → 「このフレームをクリップボードにコピー」
  → ユーザが /board タブで Ctrl+V（既存 W02）
```

| 採る | 採らない |
|------|----------|
| `src/capture/frameExtract.ts` — canvas 1 枚 PNG Blob | BoardCanvas 内 `<video>` |
| `src/pages/FrameExtractPage.tsx`（または `components/`） | sugudasu iframe |
| Drawer place 中に **「コマ抜きを開く」**（gate ON · `window.open`） | postMessage / sessionStorage 共有 |
| i18n 3–5 キー | HLS/DASH · ffmpeg wasm |

### 1-2. 配信非干渉

- **別タブ** — ボード配信タブの rAF と decode を分離
- 4K 生 decode 禁止 · **720p プロキシ** or 表示サイズ cap
- 500MB 超 → 警告（ブロックは soft）

### 1-3. ポーズ UI

- i18n 1 行: 一時停止アイコンが映るときは ±1 秒で別フレーム（**自動除去 ML 禁止**）

---

## 2. ルーティング

`src/App.tsx`:

```tsx
<Route path="/tools/frame" element={
  isCaptureImportEnabled() ? <FrameExtractPage /> : <Navigate to="/board" replace />
} />
```

- LP · サイトマップ · Drawer 以外から **リンクしない**
- gate OFF → `/board` redirect

---

## 3. ガードレール（Cursor Auto）

1. **BoardCanvas に video を埋め込むな**
2. **W01–W05 をコピー改変するな** — 終端は Blob → 既存 ingest
3. **gate 忘れ** — W07 と同じ `isCaptureImportEnabled`
4. **LP / changelog 追加するな**（G17）
5. **複数フレーム一括 · 最良フレーム選定** — Phase 2

---

## 4. 検証

- [ ] gate OFF: `/tools/frame` → `/board`
- [ ] gate ON: MP4 シーク → PNG copy → `/board` paste → 4点フロー接続
- [ ] OBS 配信タブ開きっぱなしで別タブ decode — 目視カクつき許容内
- [ ] `tsc` · `test:i18n-chrome`

---

## 5. 完了報告

- ルート · ボード連携方式
- サイズ上限
- [本番 UAT](AGENT_PROMPT_CAPTURE_IMPORT_P1_UAT.md) へ: 動画経路 1 本追加テスト
