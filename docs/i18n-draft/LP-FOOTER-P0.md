# LP フッター P0 — 実装ログ

**Date:** 2026-09-01  
**Scope:** P0 のみ（P1–P3 は Pending）  
**根拠:** フッター UX 評価（言語帯 · サイトリンク · 認知負荷）

---

## 採用した優先度（全体）

| 優先 | 施策 | 状態 |
| --- | --- | --- |
| **P0** | `(EN)` 集約 + 2 行レイアウト | **実装済** |
| **P0** | Privacy / ショートカットの深いリンク | **実装済** |
| P1 | About/FAQ 母語化、リンク 3 グループ化 | Pending（FAQ 等は変更可能性大） |
| P1 | LP 言語 `<select>` 化 | Pending |
| P2 | `/xx/help/` ハブ or 正直フッター | Pending |
| P3 | 読み物本体翻訳 | Pending |

---

## P0 で実装した内容

### 1. `(EN)` をリンク単位 → セクション注記 1 行に集約

- **Before:** 各リンク `プライバシー (EN)` … 10 回繰り返し
- **After:** リンク行の直前に 1 行のみ（例 ja: `読み物ページは英語です`）
- キー: `localePublicCopy.siteNavEnTitle`（既存）
- EN-only リンクは `title` 属性で同内容を保持（ホバー / SR 用）

### 2. 2 行（実質 3 段）レイアウト

```
© 2026
[言語ピッカー — 1 行]
[読み物は英語 — 注記 1 行]
[サイトリンク + フィードバック + Cookie 選択 — 1 行]
```

- DOM: `.lp-footer-stack` 縦積み（`flex-direction: column`）
- 言語帯とリンク帯の視覚的分離

### 3. ローカライズ済み入口への深いリンク

| Slug | href（非 en 例） | `(EN)` タグ |
| --- | --- | --- |
| `privacy` | `/privacy/#privacy-summary-ja` | 不要（母語要約へ） |
| `materials` | `/materials/shortcut-sheet/ja/` | 不要（母語シートへ） |
| その他 | `/{slug}/` | 注記行でカバー |

- Privacy: `write-site-pages.ts` で各要約 `<section id="privacy-summary-{locale}">` を付与 → `npm run site:pages` 再生成済
- Materials: `shortcutSheetPath(locale)` へ直リンク（素材ハブ EN は迂回 — 配慮優先）

### 変更ファイル

| ファイル | 変更 |
| --- | --- |
| `src/site/siteFooterNav.ts` | **新規** — href / localized entry 判定 |
| `src/components/Landing.tsx` | フッター構造 |
| `src/styles.css` | stack / reading-note / lang 色 |
| `scripts/write-site-pages.ts` | privacy summary `id` |

---

## 意図的に **やらなかった** こと（Pending）

- About / FAQ / Guide 等のラベル母語化（P1 — 文案変更の可能性）
- リンクの Product / Legal グループ分け（P1）
- 言語 `<select>` 化（P1）
- `/ja/help/` ハブ（P2）
- 読み物ページ本体の翻訳（P3）
- Cookie 選択のフッターからの削除（P1 候補）

---

## 検証

- `npm run test:i18n-chrome` — PASS
- `npm run site:pages` — privacy / shortcut-sheet 再生成済

---

## ユーザーへの配慮（P0 の狙い）

1. **繰り返し `(EN)` 削除** → 「壊れた i18n」感の低減  
2. **プライバシー** → 日本語要約段落へ直接（英語全文の前に着地）  
3. **素材** → 母語ショートカットシートへ直接（OBS 配信者の実用導線）  
4. **正直さ維持** → 注記 1 行で「読み物は英語」を明示  

---

## 再確認（手動 UAT 推奨）

- [ ] `/ja/` フッター — 注記 1 行 · リンクに `(EN)` なし  
- [ ] `プライバシー` → `/privacy/#privacy-summary-ja` で要約が見える  
- [ ] `素材` → `/materials/shortcut-sheet/ja/`  
- [ ] 他ロケール（de, it 等）も同型  
