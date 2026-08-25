# Feedback inbox（GitHub Issues）

インページ Feedback は `POST /api/feedback` → `Kaoru-Stats-Lab/zoneboard` の Issue。  
ボード JSON は受け取らない。公開 UI にトークン期限は出さない。

セットアップ手順のナビは [`AGENT_PROMPT_FEEDBACK_GITHUB.md`](AGENT_PROMPT_FEEDBACK_GITHUB.md)。

## いまの PAT

| 項目 | 値 |
|------|-----|
| Cloudflare secret | `GITHUB_FEEDBACK_TOKEN`（Production · Encrypt） |
| 種類 | fine-grained PAT · このリポだけ · Issues: Read and write |
| 発行 | 2026-08-25 |
| **期限** | **2026-11-23**（90 日。無期限にしない） |
| 回し始め | 2026-11-16（7 日前） |

日付の正本は [`ops/feedback-token.json`](ops/feedback-token.json)。回したら **issued / expires を書き換える**。ICS の日付も合わせる。

## リマインド（3 経路）

1. **カレンダー** — [`ops/github-feedback-token.ics`](ops/github-feedback-token.ics) を Google / Outlook に取り込む（11-16 と 11-23）。
2. **GitHub Issue** — タイトル `[ops] Rotate GITHUB_FEEDBACK_TOKEN by …`。`feedback-inbox` は付けない（ユーザ FB と混ぜない）。
3. **Actions** — `.github/workflows/remind-feedback-token.yml` が週次で期限 14 日前以降なら、同じタイトルの open Issue が無ければ切る。公開リポは 60 日アイドルだと schedule が止まることがあるので、カレンダーを正とする。

チャット・Issue・コミットに PAT の値を書かない。

## 回す手順

1. GitHub → Settings → Developer settings → Fine-grained tokens → 新規。権限は発行時と同じ（zoneboard のみ · Issues R/W · 90 days）。
2. 値はパスワードマネージャへ。古いトークンは Revoke。
3. Cloudflare Pages → `zoneboard` → Production → `GITHUB_FEEDBACK_TOKEN` を新しい値に。
4. Production を **Retry deployment**（secret は再デプロイで Function に乗る）。
5. 本番で Feedback を 1 通送り、Issue が立つことを確認。確認用 Issue は Close。
6. このファイルと `docs/ops/feedback-token.json` の日付を更新。ICS を作り直してカレンダーに入れ直す。ops Issue は Close。
