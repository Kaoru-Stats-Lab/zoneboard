# 実装プロンプト — OGP P0（言語別メタを静的 HTML に焼く）

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

あなたは ZoneBoard（`c:\asl_dev\zoneboard`）の実装エージェントです。  
**いまやるのは:** 各言語 LP の **OGP / Twitter / canonical / html lang / hreflang** を、クローラが読める **静的 `index.html`** に焼く。

セカンドオピニオン済みの方針: **P0 のみ。言語別 OG 画像はやらない。** Cool 文案の再執筆もやらない。

---

## 0. 先に読め

1. `index.html` — いま英語一本の OG / Twitter
2. `vite-plugin-board-spa-shell.ts` — `board` · `ja` · `es` · … に **同一 `index.html` をコピー**している（ここが本丸の欠陥）
3. `src/components/LocaleDocumentHead.tsx` — ランタイムで OG 差し替え（**クローラには効きにくい**）
4. `src/site/localeNav.ts` — `LOCALE_META` · `landingPath` · `landingUrl` · `hreflangLinks` · `LP_LOCALES`
5. `src/site/siteMeta.ts` — 共有画像パス（`ogImagePath` 等）· en 既定文
6. `src/i18n/messages.ts` — 各 locale の `brand` · `lpHeadline1` · `lpLede` · `lpPayoff`

---

## 1. 問題（必須理解）

| 層 | 現状 |
|----|------|
| `/` · `/ja/` · `/es/` … の静的 HTML | **全部英語 OG**（シェルコピー） |
| `LocaleDocumentHead` | ブラウザ実行後だけ現地語 |
| `og:image` | 全言語共通 `lockup-og.png` ← **P0 では維持** |

X / Discord / Slack / Facebook 等はだいたい **生 HTML の meta だけ**見る。JS 差し替えはシェアカードに乗らない。

---

## 2. P0 スコープ（必須）

### やる

各 LP ロケール（`en` + `ja` · `es` · `pt` · `pl` · `de` · `fr` · `tr` · `it`）について、ビルド成果物の HTML に次を **その言語で**埋める:

| 項目 | 値の出し方 |
|------|------------|
| `<html lang>` | `LOCALE_META[locale].bcp47` |
| `<title>` | 下の title 式 |
| `meta name="description"` | 下の description 式 |
| `link rel="canonical"` | `landingUrl(locale)` |
| `og:title` · `twitter:title` | title と同じ |
| `og:description` · `twitter:description` | description と同じ |
| `og:url` | `landingUrl(locale)` |
| `og:locale` | `LOCALE_META[locale].ogLocale` |
| `og:locale:alternate` | **他ロケール全部**（自分以外の `ogLocale`） |
| `link rel="alternate" hreflang` | 既存 `hreflangLinks()` と同等（`x-default` → en） |
| `og:image` · twitter:image · 寸法 · alt | **現行共通**（`SITE_META` / 既存 PNG）。言語別画像は作らない |

### title / description 式（LocaleDocumentHead と一致）

```ts
title = `${messages[locale].brand} — ${messages[locale].lpHeadline1}`
description = `${messages[locale].lpLede} ${messages[locale].lpPayoff}`.trim()
```

- **新 MessageKey は作らない**（`ogTitle` / `ogDescription` 追加禁止）
- Cool のために文言を書き直さない。既存 LP キーをそのまま使う
- description が極端に長い場合のみ、**文末を落として ≈160–200 字程度に truncate** してよい（意味を変える言い換えは禁止）

### `/board/` シェル

- `dist/board/index.html` は **LP ではない**。英語既定のままでよい（または en と同じ meta）。locale パス用 OG は焼かない

### ルート

- `dist/index.html` = **en**
- `dist/ja/index.html` = ja … 以下同様

---

## 3. 実装方針（推奨）

1. **共有ヘルパ**を追加（例: `src/site/localeDocumentMeta.ts`）
   - `lpDocumentMeta(locale)` → `{ title, description, lang, ogLocale, canonical, … }`
   - `LocaleDocumentHead` はこのヘルパを使う（二重定義しない）
2. **ビルド時**にシェルを変換
   - `vite-plugin-board-spa-shell.ts` を拡張するか、同責務の小さなスクリプトを `closeBundle` から呼ぶ
   - 単純コピーをやめ、テンプレ（ビルド後の `dist/index.html`）を読み、meta / title / lang / link を置換・挿入して各 `dist/{locale}/index.html` に書く
   - HTML エスケープ必須（`"` · `&` · `<` 等）
3. `messages` / `localeNav` / `siteMeta` をビルドプラグインから読む方法はリポジトリの既存流儀に合わせる（`tsx` · 事前生成 · Vite の SSR バンドル等）。**値の正本は常に `messages.ts` + `LOCALE_META`**
4. `og:locale:alternate` が無いテンプレなら追加。既存タグは上書き

### 触ってよい

- `vite-plugin-board-spa-shell.ts`
- `src/components/LocaleDocumentHead.tsx`
- 新規 `src/site/localeDocumentMeta.ts`（または同等）
- 必要なら `src/site/siteMeta.ts` / `localeNav.ts` の小さな export 追加
- ビルド検証用の短いチェック（任意 · `scripts/` に1本まで）

### 触るな

- 言語別 `lockup-og-*.png` · `brand:og` の多言語化
- FAQ / About / privacy 等の静的読み物の全翻訳
- `messages.ts` の LP 文案リライト · 新 MessageKey
- `public/_redirects` のルーティング方針変更（壊さない）
- PRODUCT_NOTE / MATCHDAY の長文方針変更（必要なら PRODUCT_NOTE に **1段落**まで可）
- コミット / push

---

## 4. 受け入れ条件

1. `npm run build` 成功
2. `dist/index.html`（en）と `dist/ja/index.html` · `dist/es/index.html`（代表で可）を開き:
   - `og:title` / `og:description` / `og:locale` / `og:url` / `canonical` / `html lang` が **その言語**
   - `og:image` は共通 PNG のまま
3. 全 LP ロケールディレクトリに `hreflang`（＋ `x-default`）が入っている
4. `og:locale:alternate` が他言語分ある
5. `LocaleDocumentHead` が同じ title/description 式（ヘルパ共有）
6. `/board/` が壊れない（開けて SPA 起動）
7. 型チェック（build に含む `tsc`）PASS

手動確認コマンド例（Windows PowerShell 可）:

```powershell
Select-String -Path dist/ja/index.html -Pattern 'og:title|og:locale|og:url|lang='
Select-String -Path dist/es/index.html -Pattern 'og:title|og:locale'
Select-String -Path dist/index.html -Pattern 'og:title'
```

---

## 5. 完了報告フォーマット

```
## 完了報告 — OGP P0

### 変更ファイル
- …

### メタ式
- title: …
- description: …
- 画像: 共通のまま（パス）

### 確認
- [ ] npm run build
- [ ] dist/index.html (en)
- [ ] dist/ja/index.html
- [ ] dist/es/index.html（または他1）
- [ ] hreflang + og:locale:alternate
- [ ] LocaleDocumentHead 共有
- [ ] /board/ OK

### 触らなかったもの
- 言語別 OG 画像 · 新 MessageKey · …
```

---

## 6. やらないこと（再掲）

- P1（言語別 OG 画像）
- Cool のためのコピー書き換え
- セカンドオピニオン待ち
- コミット
