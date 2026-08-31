# 実装プロンプト — 局面取込 W07: 隠し機能ゲート（B-070 · Deploy 前必須）

**索引:** [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md) · **W01–W05 完了後 · W06 より先**  
**前提:** 局面取込フロー全体 merge 済み。**いま UI は全ユーザに見えている可能性あり — 本番 Deploy 前に必ず直す。**

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

**いまやるのは:** `isCaptureImportEnabled()` の **1 モジュール + 既存入口への配線のみ**。Homography · 下敷き · 配置ロジックは **触らない**。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

## 0. 先に読め

1. 索引 §ロールアウト · G16 · G17
2. 既存取込の **入口一覧**（全部 gate 必須）:
   - `src/components/Drawer.tsx` — 「取込」ボタン · `capture-import-status` ブロック
   - `src/components/Editor.tsx` — `paste` リスナー · `onCaptureDrop`
   - `src/hooks/useAppState.ts` — `startCaptureImport` · `setCaptureImageFromBlob` · `ingestCaptureImportDataTransfer`（**内部 guard も可**）
   - （W06 後）`/tools/frame` ルート

---

## 1. ゴール

### 1-1. 新規モジュール

`src/lib/captureImportGate.ts`:

```ts
const QUERY = "captureImport";
export const CAPTURE_IMPORT_LS_KEY = "zoneboard:v1:captureImportBeta";

export function isCaptureImportEnabled(search = window.location.search): boolean {
  if (import.meta.env.DEV) return true;
  const params = new URLSearchParams(search);
  if (params.get(QUERY) === "1") {
    try { localStorage.setItem(CAPTURE_IMPORT_LS_KEY, "1"); } catch { /* ignore */ }
    return true;
  }
  try { return localStorage.getItem(CAPTURE_IMPORT_LS_KEY) === "1"; } catch { return false; }
}
```

- **DEV:** 常時 true（ローカル開発を止めない）
- **PROD:** `?captureImport=1` 1 回 → LS 永続（QA 用）· 一般ユーザは false

### 1-2. 配線（gate false = 取込が存在しないのと同じ）

| 箇所 | gate false |
|------|------------|
| Drawer「取込」ボタン | **非表示**（soccer でも） |
| `capture-import-status` 全体 | 非表示 |
| Editor `paste`（image/*） | **リスナー登録しない** |
| Editor `onCaptureDrop` | early return |
| Topbar「取込取消」 | 非表示 |
| `startCaptureImport()` | `null` 返却（呼ばれても no-op 可） |
| 進行中セッション + prod で gate OFF | `clearCaptureImport()` で安全に落とす（useEffect 1 本可） |

**二重 guard 推奨:** UI 非表示 + `ingestCaptureImportDataTransfer` 先頭で gate チェック（DevTools からの直呼び対策）。

### 1-3. やらない

- changelog · LP · How-to
- 設定画面のベータトグル
- `VITE_*` ビルドフラグだけでの出し分け（**同一 prod バンドル**が要件）
- 取込ロジックのリファクタ

---

## 2. ガードレール（Cursor Auto）

1. **gate を Drawer だけに付けて paste を残すな**
2. **DEV を false にするな**
3. **Homography / session 型を触るな**
4. **「ベータ」バナーを画面に出すな** — 完全非表示
5. **LP に `?captureImport=1` のリンクを書くな**

---

## 3. 検証

- [ ] prod ビルド相当（`import.meta.env.DEV` false 想定）: 通常 URL → 取込 UI **ゼロ**
- [ ] `?captureImport=1` → 取込ボタン · paste 有効
- [ ] リロード（LS あり）→ まだ有効
- [ ] LS 削除 → 無効
- [ ] DEV: ゲートなしで従来どおり
- [ ] `npx tsc --noEmit` · `npm run test:i18n-chrome`

---

## 4. 完了報告

- 配線したファイル一覧
- QA 手順（本番 URL 例）
- W06 へ: `/tools/frame` も同 gate を import
