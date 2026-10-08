# ZoneBoard — インフラ / デプロイ正本

**更新:** 2026-10-08（Football deploy DoD 注記）  
**役割:** 別 Agent が **実装を触る前に**読む本番・ビルド・ルーティングの事実一覧  
**調査根拠:** リポジトリ実装（`package.json` · `vite.config.ts` · `public/_redirects` · `functions/` · `scripts/write-site-pages.ts` 等）  
**関連:** [`FOOTBALL_CONTENT_ARCHITECTURE.md`](FOOTBALL_CONTENT_ARCHITECTURE.md)（多言語 Football 読み物 · CONDITIONAL ADOPT · **push-only DoD**） · [`SPEC.md`](SPEC.md) §10 · [`BACKLOG.md`](BACKLOG.md) §1-9 · B-080

矛盾したら **本ファイルの事実** を勝ちにする（SPEC / HANDOFF の古い「未確定」メモより優先）。

---

## 0. 一言

```text
GitHub (Kaoru-Stats-Lab/zoneboard)
  → Cloudflare Pages（Connect to Git · main）
  → npm run build → dist/
  → https://zoneboard.app
```

- **ホスト:** Cloudflare **Pages**（Workers 単体プロジェクトではない）
- **ドメイン:** `zoneboard.app` / `www.zoneboard.app`
- **アカウントなし · Board は localStorage** · サーバに Board を置かない
- **二層サイト:** Product SPA（React）＋ 静的読み物 HTML（`site:pages`）

---

## 1. Cloudflare Pages

| 項目 | 値 |
|------|-----|
| 種別 | **Cloudflare Pages** |
| Git | `Kaoru-Stats-Lab/zoneboard` · `main` 自動デプロイ |
| Build command | `npm run build` |
| Build output | `dist` |
| Node | 20 推奨（README） |
| wrangler.toml | **無し**（Pages Dashboard 設定が正本） |
| Pages Functions | `functions/api/feedback.js` のみ → `POST /api/feedback` |
| Workers（別） | 使っていない |
| Static | Vite が `public/` を `dist/` にコピー |
| CDN / HTTPS | Pages 既定（`.app` は HTTPS 必須） |

### 環境変数

| 名前 | 用途 | いつ必要 |
|------|------|----------|
| `VITE_GA_MEASUREMENT_ID` | GA4（クライアント bundle） | **ビルド時** · Cloudflare Pages Production |
| `GITHUB_FEEDBACK_TOKEN` | Feedback → GitHub Issues | **Function 実行時** · Encrypt |
| `GITHUB_FEEDBACK_OWNER` | 任意 · default `Kaoru-Stats-Lab` | runtime |
| `GITHUB_FEEDBACK_REPO` | 任意 · default `zoneboard` | runtime |

ローカル: [`.env.example`](../.env.example)。実 ID / トークンを git に書かない。

### Headers / Redirects

| ファイル | 役割 |
|----------|------|
| [`public/_headers`](../public/_headers) | nosniff · Referrer-Policy · Permissions-Policy · 404/maintenance の `noindex` |
| [`public/_redirects`](../public/_redirects) | locale LP · site docs trailing slash · `/board` → `board/index.html` · `/en` → `/` |

**重要:** 汎用 SPA fallback（`/* /index.html 200`）は **無い**。存在する実ファイル（または明示 rewrite）だけが返る。無いパスは `404.html`。

Preview: Cloudflare Pages の Preview deployments（Git branch）。専用 wrangler 環境ファイルはリポに無い。

---

## 2. Frontend / Build

| 層 | 選択 |
|----|------|
| UI | **React 19** + TypeScript |
| ビルド | **Vite 6**（`@vitejs/plugin-react`） |
| ルーティング | **react-router-dom 7**（`BrowserRouter`） |
| SSR | **無し** |
| キャンバス | HTML Canvas 2D（自前） |
| 永続化 | localStorage（Board）。サーバ Board storage なし |

### npm scripts（抜粋）

| コマンド | 内容 |
|----------|------|
| `npm run dev` | Vite dev |
| `npm run build` | `site:football` → `tsc --noEmit` → `vite build` → `dist/` · **`site:pages` は回さない** |
| `npm run site:pages` | [`scripts/write-site-pages.ts`](../scripts/write-site-pages.ts) → `public/**/index.html` · sitemap · robots |
| `npm run site:football` | [`scripts/write-football-pages.ts`](../scripts/write-football-pages.ts) → `public/**/football/**` · `sitemap-football.xml`（gitignore） |
| `npm run preview` | `vite preview` |

**既存読み物（About/Guide 等）:** ローカルで `npm run site:pages` → 生成物を同じ PR / コミットに含める（[`CHANGELOG_PUBLIC.md`](CHANGELOG_PUBLIC.md) と同型）。

**Football（B-080 · FINAL ADOPT）:** 生成は **`npm run build` 内**。MD 正本のみ commit。不正 frontmatter は generator が **exit 1**（deploy 阻止）。正本: [`FOOTBALL_CONTENT_ARCHITECTURE.md`](FOOTBALL_CONTENT_ARCHITECTURE.md)。

### Vite プラグイン（リポ直下）

| プラグイン | 役割 |
|------------|------|
| `vite-plugin-site-doc-routes.ts` | dev/preview で `/guide/` 等を `public/.../index.html` へ |
| `vite-plugin-site-consent.ts` | consent / GA define |
| `vite-plugin-board-spa-shell.ts` | build 後に `dist/{locale}/index.html` · `dist/board/index.html` を焼き（OG / canonical / hreflang） |

---

## 3. 二層ルーティング（壊すな）

### A. Product SPA（同一 JS bundle）

| URL | 内容 |
|-----|------|
| `/` | 英語 LP |
| `/{locale}/` | 非英語 LP（`ja` `es` `pt` `pl` `de` `fr` `tr` `it`） |
| `/board` · `/board/` | Editor（実体 `board/index.html`） |
| `/board?lang=pl` 等 | 起動時 locale（prefs へ） |
| `/board?broadcast=1` | 配信モード |
| `/en` · `/en/board` | **301 → `/` · `/board`**（`/en/` は使わない） |
| `/tools/frame` | Capture Import 用（ゲート付き） |

実装: [`src/App.tsx`](../src/App.tsx) · locale メタ [`src/site/localeNav.ts`](../src/site/localeNav.ts) · [`src/site/localeDocumentMeta.ts`](../src/site/localeDocumentMeta.ts)

### B. 静的読み物（React bundle を載せない）

| URL | 生成 |
|-----|------|
| `/about/` `/guide/` `/faq/` `/pricing/` `/materials/` `/updates/` … | `src/site/pages.ts` + `npm run site:pages` |
| `/materials/shortcut-sheet/` · `/materials/shortcut-sheet/{locale}/` | 多言語静的 HTML の先例 |
| `/consent.js` · `/site-doc.css` | `public/` |

シェル生成: [`scripts/write-site-pages.ts`](../scripts/write-site-pages.ts)。スタイルは読み物専用。**Board の `styles.css` と混ぜない。**

### C. API（唯一のサーバ実行）

| 経路 | 実装 |
|------|------|
| `POST /api/feedback` | [`functions/api/feedback.js`](../functions/api/feedback.js) → GitHub Issues |

Board JSON を受け取らない。オリジン制限あり（`zoneboard.app`）。

---

## 4. i18n / SEO（現状）

| 項目 | 現状 |
|------|------|
| UI locales | en（`/`）+ ja es pt pl de fr tr it |
| UI 文字列 | [`src/i18n/messages.ts`](../src/i18n/messages.ts) |
| 読み物本文 | **英語一本**（Privacy 先頭に各語1段落要約あり） |
| canonical / OG / Twitter | LP シェル焼き + 読み物 `documentShell` |
| hreflang | LP 用セット（[`localeNav.ts`](../src/site/localeNav.ts) `hreflangLinks`）。読み物にも同セットを貼っている（記事用に流用するな） |
| sitemap | [`public/sitemap.xml`](../public/sitemap.xml)（`site:pages` 再生成） |
| robots | [`public/robots.txt`](../public/robots.txt) |
| JSON-LD | **未実装** |
| 広告方針 | **読み物のみ**可 · **ピッチ / Broadcast 禁止**（About / FAQ / Privacy に明記） |

---

## 5. リポジトリ地図（インフラ関連）

```text
zoneboard/
  package.json              # scripts · deps
  vite.config.ts
  vite-plugin-*.ts
  index.html                # SPA シェル原典
  functions/api/feedback.js # Pages Function
  public/
    _headers · _redirects
    robots.txt · sitemap.xml
    about|guide|faq|.../index.html   # site:pages 生成物
    materials/shortcut-sheet/**      # 多言語静的先例
    consent.js · site-doc.css
  scripts/write-site-pages.ts
  src/
    App.tsx · main.tsx
    i18n/
    site/                   # 読み物・LP meta・changelog
    components/             # Board / LP UI
  docs/INFRASTRUCTURE.md    # 本ファイル
```

**無いもの（安易に足すな）:** wrangler.toml · Astro · Next · D1 · R2 · Headless CMS · Board 用 API · 汎用 SPA catch-all。

---

## 6. Agent チェックリスト

インフラやルーティングに触る前:

1. Board / Broadcast の JS bundle を重くしないか？
2. 新しい「ページ」は **静的 HTML（site:pages 型）** か **SPA ルート** か？ 混ぜない
3. `_redirects` と実ファイルのどちらで届くか？
4. `/en/` プレフィックスを新設していないか？（既存は潰している）
5. Functions / D1 / R2 が本当に必要か？（説明できなければ足さない）
6. 広告をピッチに出していないか？

Football 読み物を足す場合: **必ず** [`FOOTBALL_CONTENT_ARCHITECTURE.md`](FOOTBALL_CONTENT_ARCHITECTURE.md) を読む。
