# ZoneBoard

配信・解説向けのキャンバス最大化戦術ボード（`zoneboard.app`）。

登録不要 · ローカル保存 · ユーザーロゴ透かし · 配信モード。

## 開発

```powershell
cd C:\asl_dev\zoneboard
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

| コマンド | 内容 |
|----------|------|
| `npm run dev` | 開発サーバ |
| `npm run build` | 本番ビルド（`dist/`） |
| `npm run preview` | ビルド結果のプレビュー |

## 本番（Cloudflare Pages）

| 項目 | 値 |
|------|-----|
| Build command | `npm run build` |
| Build output | `dist` |
| Node | 20 推奨 |

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → `Kaoru-Stats-Lab/zoneboard`
2. 上記 Build 設定でデプロイ（`public/_redirects` で SPA ルーティング）
3. **Custom domains** → `zoneboard.app` / `www.zoneboard.app` を追加
4. お名前.com で DNS を Cloudflare に向ける（**ネームサーバー移管** または **CNAME**）

公開 URL: `https://zoneboard.app/ja/board`

## ドキュメント

| パス | 内容 |
|------|------|
| [`docs/SPEC.md`](docs/SPEC.md) | 実装仕様 |
| [`docs/PRODUCT_NOTE.md`](docs/PRODUCT_NOTE.md) | プロダクト方針 |
| [`docs/TOKEN_ECONOMY.md`](docs/TOKEN_ECONOMY.md) | RTK · CodeGraph |
| [`docs/AGENT_HANDOFF.md`](docs/AGENT_HANDOFF.md) | Agent 引き継ぎ |
| [`docs/OSS_SURVEY.md`](docs/OSS_SURVEY.md) | GitHub OSS 調査（流用候補なし） |
| [`docs/OBS.md`](docs/OBS.md) | OBS キャプチャ手順 |
| [`docs/SOCIAL_OUTPUT.md`](docs/SOCIAL_OUTPUT.md) | SNS 投稿向け出力の逆算 |
| [`docs/BALL_DESIGN.md`](docs/BALL_DESIGN.md) | ボールアイコンのデザイン言語（Nanobanana 用） |
| [`docs/SPORTS_SCOPE.md`](docs/SPORTS_SCOPE.md) | スポーツ市場 MECE と v1 対象競技 |
| [`docs/UI_UX.md`](docs/UI_UX.md) | chrome・パネル・カードの指針 |
| [`docs/BACKLOG.md`](docs/BACKLOG.md) | 未着手・Later・決定済み方針の駐車場 |
| [`docs/FUTSAL_BEACH_RESEARCH.md`](docs/FUTSAL_BEACH_RESEARCH.md) | フットサル・ビーチの戦術ボード／配信リサーチ |
| [`docs/FUTSAL_BEACH_OVERSEAS_BRIEF.md`](docs/FUTSAL_BEACH_OVERSEAS_BRIEF.md) | 海外強豪国・言語圏（Gemini 用プロンプト） |
| [`docs/BASKETBALL_RESEARCH_BRIEF.md`](docs/BASKETBALL_RESEARCH_BRIEF.md) | バスケ戦術ボード／配信リサーチ用プロンプト |
| [`docs/BASKETBALL_RESEARCH.md`](docs/BASKETBALL_RESEARCH.md) | バスケ調査統合・実装対応 |

## 主な操作

| キー | 動作 |
|------|------|
| `B` | 配信モード トグル |
| `Esc` | 設定を閉じる / 配信解除 |
| `1` / `2` / `3` | パス / ラン / ドリブル |
| `V` | 選択 |
| `Ctrl+Z` | UNDO |
| `Ctrl+S` | 保存 flush |

SUGUDASU とは別プロダクトです。
