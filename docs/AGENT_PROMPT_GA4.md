# 実装プロンプト — GA4（別 Agent / Gemini 用）

このファイルをそのまま Gemini に渡してよい。矛盾したらこのファイルと Cookie/Privacy の正本を勝ちにする。  
**Measurement ID（`G-…`）はユーザが渡すまでプレースホルダ。リポジトリに実 ID をコミットしない。**  
管理画面での発行手順は別: [`AGENT_PROMPT_GA4_SETUP.md`](AGENT_PROMPT_GA4_SETUP.md)。このファイルはコード側。

---

あなたは ZoneBoard（`c:\asl_dev\zoneboard`）の実装エージェントです。  
日本語で報告する。コミットはユーザが頼むまでしない。公開コピーは英語（`APP_LOCALE = "en"`）。

ZoneBoard は配信向けキャンバス優先のサッカー戦術ボード（`zoneboard.app`）。アカウントなし、ボードは localStorage。本番は Cloudflare Pages。`npm run build` は `site:pages` を回さない。読み物 HTML を直したらローカルで `npm run site:pages`。

## 読め（この順）

1. `public/consent.js` — いまは **広告だけ**（`zb-consent` v1 `{ v, ads, at }`）。180日。既定オフ。
2. `scripts/write-site-pages.ts` の `consentBanner()` — 読み物ページのバー。芝には出さない。
3. `src/site/pages.ts` — Cookie / Privacy。**「first-party analytics cookie は今日ない」と書いてある。GA4 を入れたらここを直して再生成。**
4. `src/App.tsx` `src/components/Landing.tsx` `index.html` — SPA は `/` と `/board`。読み物は `public/*/index.html`。
5. `docs/STUDIO.md` — ピッチと配信モードに広告を置かない。バナーも芝の上に出さない。
6. `src/lib/feedbackClient.ts` — 既存の referrer / UTM はフィードバック用。GA4 と混ぜない。

## 目的

PH と欧州公開のために **GA4 で「誰が来て、ボードを開いたか」** を測る。  
戦術図の中身は測らない。キャプチャ面を汚さない。UK/EU では **Consent Mode v2**（既定 deny、同意後に update）。

## 測る / 測らない

| 測る | 測らない |
|------|----------|
| `page_view`: `/` `/pricing/` 読み物 `/board`（配信モード以外） | 局面名、名簿、駒の名前・番号、キット色、描画パス |
| イベント `open_board`（LP の Open board） | 配信モード（`?broadcast=1`）中のヒット |
| 任意で `feedback_open`（ボタン押下だけ） | スクロール深度の過剰、ヒートマップ、Google シグナル |
| | `/board` 上の同意バナー（出さない） |

GTM は使わない。`gtag.js` 直。タグマネの面を増やさない。

## 同意（ここが本体）

いまのバーは広告 Cookie だけ。GA4 は **別カテゴリ**。v1 の `ads: true` を analytics 同意に昇格させない。

`zb-consent` を **v2** にする:

```ts
{ v: 2, analytics: boolean, ads: boolean, at: number }
```

- v1 `{ ads: true }` → `ads: true`, `analytics: false`（広告の同意は計測の同意ではない）
- 期限切れ・欠落 → 両方 false。タグは Consent Mode の default denied のまま
- 180日は据え置き

バー（読み物 **と LP**。`/board` には出さない）:

- コピーは英語。Reject と Allow は同じ大きさ。Reject を先に置く
- 必要な保存（ボード + この選択）は同意不要、と一文
- **GA4** と **AdSense** を名前で書く
- 操作の最小セット（これ以上ボタンを増やさない）:
  1. **Reject optional** — analytics も ads も false
  2. **Allow analytics** — analytics true, ads は触らない（false のまま）
  3. **Allow advertising** — ads true。広告配信のため analytics も true にしてよい（AdSense の計測）。コピーでそう書く
- フッター **Cookie choices** で再表示。撤回は出すときと同じ簡単さ
- JS オフ / 未選択 = 拒否。`gtag` も AdSense も読まない（Consent Mode の default だけ先に置くなら、ストレージは denied）

Consent Mode v2（ページ最上部、タグより前）:

```
ad_storage, ad_user_data, ad_personalization, analytics_storage
```

全部 default `denied`。同意後に該当キーだけ `granted`。`wait_for_update` は短く（例 500ms）。地域ゲートで同意を省略しない（IP で EU 判定しない）。

Google シグナル、広告パーソナライズ、データ保持の延長はオンにしない（GA4 管理画面の話として報告に書く。コードで無理に触らない）。

## 置き場

| 面 | GA4 | 同意バー |
|----|-----|----------|
| 読み物（`public/*/index.html`、生成は `write-site-pages.ts`） | 同意後 | 既存バーを拡張 |
| LP `/` | 同意後 | **同じ見た目のバーを足す**（スタジオ黒・金マーカー。SaaS 白モーダルにしない） |
| `/board` 編集 | 同意済みなら page_view 可 | **バーなし**（LP で選んだ記録を読む） |
| `/board?broadcast=1` | **ヒットを送らない** | バーなし |
| 404 / maintenance | 送らない | バーなし |

SPA は `react-router` のパス変更で `page_view`（`send_page_view: false` にして自分で送る）。読み物は通常のページビューでよい。

Measurement ID は `import.meta.env.VITE_GA_MEASUREMENT_ID`（または同等）。未設定ならタグを挿さない。`.env.example` に空のキーだけ。実 ID は Cloudflare Pages の環境変数。コードに `G-` を直書きしない。

`open_board` は LP の CTA（`Landing.tsx` の `/board` リンク）だけ。クエリやハッシュに個人データを載せない。

## 法務コピー（英語正、JA はソースに残す）

`src/site/pages.ts` を直して `npm run site:pages`:

- Cookie: 「analytics は今日ない」を削除。**Google Analytics 4** と、何の Cookie / 類似技術か、同意が要ること、Reject でボードは残ること
- Privacy: 目的（利用状況の把握、LP→ボード）、根拠 Art. 6(1)(a)、米国等への移転、撤回（Cookie choices）、ボード内容は送らない
- バナー文言と矛盾させない

## やってはいけない

- 芝・配信モードにバナー、トースト、Cookie 壁
- ボード JSON / 駒ラベル / フィードバック本文を GA イベントに載せる
- GTM、ヒートマップ、追加マーケピクセル
- 同意なしで `gtag('config')` や AdSense を読む
- v1 の広告同意を計測同意に読み替える
- 巨大リファクタ、無関係ファイル
- コミット（ユーザが頼むまで）
- Measurement ID を git に入れる

## やれ（この順。波の終わりに `npx tsc --noEmit` とブラウザ）

1. Consent Mode 既定 deny + `zb-consent` v2 + バー文言/ボタン（`consent.js` と `write-site-pages.ts`）。LP 用に同じロジックを SPA からも使えるようにする（`consent.js` を使い回すか、薄い TS ラッパ。二重実装しない）。
2. GA4 ローダ（ID があるときだけ）。同意後に config。`open_board`。配信モードでは送らない。
3. Cookie / Privacy / バナーコピー。`npm run site:pages`。
4. ブラウザ:  
   - 読み物と LP でバーが出る。Reject → Network に googletagmanager / google-analytics の収集が出ない  
   - Allow analytics → LP の page_view、Open board で `open_board`、`/board` にバーが無い  
   - Broadcast（`/board?broadcast=1`）で追加ヒットが無い  
   - Cookie choices で撤回できる  
   - `/board` 直訪・未同意では GA が走らない

## 完了報告（日本語）

- 同意モデル（v2 の意味と v1 移行）
- 置いたヒット一覧
- ID の入れ方（Cloudflare env）
- 法務で直した箇所
- 配信モードと芝を汚していないこと
- 確認した URL
