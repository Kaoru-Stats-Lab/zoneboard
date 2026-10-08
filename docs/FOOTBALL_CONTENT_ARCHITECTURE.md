# ZoneBoard — Football Content Layer アーキテクチャ

**更新:** 2026-10-08  
**ステータス:** **FINAL ADOPT** · 実装あり（生成は `npm run build` / `site:football`）  
**親インフラ:** [`INFRASTRUCTURE.md`](INFRASTRUCTURE.md)  
**Backlog:** B-080  
**境界:** Explanation Canvas を CMS/SaaS 化しない。Board データと混ぜない。

---

## 0. 最終形（採用）

Football Content Layer は、**既存 Cloudflare Pages プロジェクト内の静的生成レイヤー**として実装する。

- Markdown（`content/football/`）が **唯一の正本**
- 生成 HTML は **Git 管理しない**（`public/**/football/` · `sitemap-football.xml` は gitignore）
- `npm run build` が Football 生成 → `tsc` → Vite を一貫実行
- **GitHub への push だけで** Cloudflare Pages が本番公開
- **追加 CI · CMS · DB · Astro · 別 Pages プロジェクトは導入しない**

```text
Cursor を閉じる
  → content/football/**/*.md を commit / push
  → Cloudflare Pages: npm run build
       → site:football（不正 MD なら exit 1 → deploy されない）
       → vite build → dist/
  → zoneboard.app に公開
```

Cursor Token は開発に使い、公開は Git / Cloudflare の既存パイプラインに任せる。

---

## 0-1. Build 品質ゲート（必須）

| 入力 | 結果 |
|------|------|
| 正常な MD（必須 frontmatter 完備） | build 成功 → deploy |
| 必須項目欠落 / 不正 locale·slug·日付 | **Football generator がエラー終了** → build 失敗 → **deploy されない** |

必須 frontmatter: `translationGroup` · `locale` · `title` · `description` · `slug` · `publishedAt` · `updatedAt`  
加えて: folder 名 = `translationGroup`、ファイル名 `{locale}.md` = `locale`、slug/group は kebab-case、日付は `YYYY-MM-DD`。

実装: [`scripts/lib/football-md.ts`](../scripts/lib/football-md.ts) · [`scripts/write-football-pages.ts`](../scripts/write-football-pages.ts)

---

## 1. 役割分担

| 面 | 役割 |
|----|------|
| [Substack `@zoneboard`](https://substack.com/@zoneboard) | 英語原著 · editorial / discovery |
| `zoneboard.app/.../football/...` | localized evergreen · product entry |
| `/board` | 製品。広告なし |

英語全文ミラー禁止。機械翻訳パイプライン禁止。

---

## 2. URL / ソース

```text
content/football/{translationGroup}/{locale}.md

/football/                         # hub（build 生成）
/{locale}/football/{slug}/         # localized edition
/football/{slug}/                  # locale=en のときのみ
```

`/en/football/` は作らない。

---

## 3. Deploy 5問（確定）

| # | 問い | 答え |
|---|------|------|
| 1 | build に生成を組み込めるか | **済** · `vite build` の `footballPagesPlugin`（`closeBundle` → `dist/`）。CF は Node 20 でも Vite 経由で動く |
| 2 | 生成 HTML を Git 管理するか | **しない** |
| 3 | Pages 設定だけで完結するか | **する**（Dashboard は `npm run build` のまま） |
| 4 | 追加 CI が必要か | **不要** |
| 5 | 人間の npm は何回か | **公開経路は 0**（MD → commit → push） |

---

## 4. やらないこと

WordPress / Firebase / Supabase / Mongo / full CMS / D1 · 読者アカウント · コメント · Board クラウド · SPA 内記事レンダリング · Substack 丸ごとミラー · AI 翻訳パイプライン · 不要な Workers/R2 · GitHub Actions 追加

---

## 5. ローカル

| コマンド | 用途 |
|----------|------|
| `npm run site:football` | 生成のみ（preview 用） |
| `npm run build` | 本番と同じゲート付きビルド |
| `npm run preview` | `dist/` 確認 |
