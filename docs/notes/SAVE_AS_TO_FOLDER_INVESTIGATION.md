# Save As to folder — 調査メモ → Group 7 実装済

**日付:** 2026-11-06  
**状態:** Group 7 で実装（Handle 非永続・衝突確認付き）

## 実装サマリ

| 項目 | 実装 |
|------|------|
| API | `directory.getFileHandle(name, { create: true })` + 既存 `writeBoardToFileHandle` |
| 権限 | Save As 時にディレクトリへ `readwrite`（選択時は read のまま） |
| 衝突 | 既存名は `name_conflict` → UI で明示上書きチェック必須 |
| BoardStore | Store ボードは Store に残したままフォルダへ書き出し可（上限非消費） |
| File Session | 成功後に `directorySource` を新 Handle へ付け替え → 以降は通常 Save |
| Dashboard | `addOrReplaceDirectoryEntry` で一覧更新 |
| 空フォルダ | 「ボードを保存」CTA → `/board`（Save As は Editor 側） |

詳細 UX / 多言語ヘルプは Group 7 完了報告を参照。
