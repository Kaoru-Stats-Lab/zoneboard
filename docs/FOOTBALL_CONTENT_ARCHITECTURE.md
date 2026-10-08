# ZoneBoard — Football Content Layer アーキテクチャ

**更新:** 2026-10-08  
**ステータス:** アーキテクチャ判断 · **CONDITIONAL ADOPT** · **実装未着手**  
**親インフラ:** [`INFRASTRUCTURE.md`](INFRASTRUCTURE.md)（必読）  
**Backlog:** B-080  
**境界:** Explanation Canvas を CMS/SaaS 化しない。Board データと混ぜない。

---

## 0. 一言

> Substack = 英語 editorial / discovery  
> zoneboard.app = 多言語 evergreen Football 読み物 → Product 入口  
> 実装は **既存の静的読み物パイプライン（`site:pages` 型）を拡張**する。React SPA・CMS・別プロジェクト・Astro 前提にしない。

**Executive Judgment:** CONDITIONAL ADOPT

---

## 1. 役割分担（壊すな）

| 面 | 役割 |
|----|------|
| [Substack `@zoneboard`](https://substack.com/@zoneboard) | 英語原著 · 連載 · community / discovery |
| `zoneboard.app/.../football/...` | localized edition · 検索 evergreen · Board への導線 |
| `/board` | 製品。広告なし |

- zoneboard.app に英語全文を **丸ごとミラーしない**
- 機械翻訳パイプラインを入れない（localized edition = 手書き）

---

## 2. 推奨構成（v1）

| 項目 | 決定 |
|------|------|
| リポジトリ | **同一** zoneboard リポ |
| ホスト | **同一** Cloudflare Pages プロジェクト |
| 記事ソース | **Markdown + Git**（`content/football/`） |
| 配信物 | **静的 HTML** → `public/{locale}/football/...`（Board JS を載せない） |
| 生成 | `npm run site:football`（新）または `site:pages` 拡張 · 生成物は現行 docs と同様 commit |
| CMS / D1 / R2 / Workers | **不要** |
| Astro / 別 content プロジェクト | **v1 非採用**（記事量・著者が増えたら再検討） |

### URL

```text
/football/                              # EN hub（索引・Substack 導線。全文ミラーではない）
/pl/football/{slug}/
/it/football/{slug}/
/de/football/{slug}/
```

- **`/en/football/` は作らない**（既存 `/en` → `/` と衝突）
- slug は translationGroup 間で揃えるのが運用簡単
- Board CTA: `/board?lang=pl` 等（既存 deep link）

### コンテンツ配置

```text
content/football/{translationGroup}/
  pl.md
  it.md          # ある言語だけ置く（疎でよい。PL 優先）
  de.md
```

### Frontmatter（最小）

必須: `translationGroup` · `locale` · `title` · `description` · `slug` · `publishedAt` · `updatedAt`  
推奨: `series` · `originalLocale` · `sourceUrl`（Substack）· `ogImage`（任意）

### SEO

- 各 edition: **自己 canonical**
- hreflang: **存在する edition のみ** + 英語は `sourceUrl`（Substack）を `hreflang="en"` / `x-default` 候補
- **既存 `hreflangLinks()`（LP 用）を記事に流用しない**
- sitemap に localized URL を追加
- JSON-LD `Article` は Football から導入してよい（現状サイト全体には無い）

### AdSense

- Football 読み物 = 既存「informational pages only」の延長で可（consent 後）
- Board / Broadcast / pitch = **禁止**（変更しない）

---

## 3. 棄却・後回し

### 絶対に入れない（v1）

- WordPress / Firebase / Supabase / Mongo / full CMS / D1 記事 DB
- 読者アカウント · コメント · ソーシャル
- Board クラウド保存 · 記事と Board JSON の混在
- React SPA 内クライアントのみの記事レンダリング
- 英語 Substack の丸ごとミラー
- 自動 AI 翻訳パイプライン
- 不要な Workers / R2 / サイト内検索エンジン

### 後回し

- 全 9 言語同時展開（PL 等を疎に）
- Decap 等 Git-based CMS UI
- Astro 分離 · 別 Pages プロジェクト
- シリーズ taxonomy の本格 DB 化
- AdSense 実装そのもの（ポリシーは既存）

---

## 4. 比較要約

| 案 | 判断 |
|----|------|
| 同一 app + 静的生成拡張 | **Adopt（推奨）** |
| Football だけ Astro | 後で再検討 · 今は過剰 |
| 別 content プロジェクト | 今は No（二重デプロイ） |
| Headless / DB CMS | No |
| SPA に MDX ルート | No（bundle / SEO / Broadcast） |

詳細調査メモはチャット履歴（2026-10-08）に残る。運用の正本は本ファイル + [`INFRASTRUCTURE.md`](INFRASTRUCTURE.md)。

---

## 5. 実装に入るとき（未着手チェック）

1. [`INFRASTRUCTURE.md`](INFRASTRUCTURE.md) の二層モデルを壊していないか
2. `_redirects` に football trailing-slash を足すか
3. `sitemap.xml` 生成を更新するか
4. React `App.tsx` に記事ルートを **足していない**か
5. PRODUCT_NOTE 境界（Analysis / CMS 化）を跨いでいないか
