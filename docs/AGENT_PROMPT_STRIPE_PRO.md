# Agent Prompt — Stripe / Pro（B-023）

別 Agent に渡す実装・設計プロンプト。**正本は仕様側。** 矛盾したら仕様を勝ちにする。

| 順 | 読むもの |
|----|----------|
| 1 | [`.cursor/rules/product-boundary.mdc`](../.cursor/rules/product-boundary.mdc) |
| 2 | [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) — Pro = Local Library（2026-08-27）· Stripe セカンドオピニオン（2026-10-08） |
| 3 | **[`STRIPE_PRO_ARCHITECTURE.md`](STRIPE_PRO_ARCHITECTURE.md)** — 課金アーキテクチャ正本 |
| 4 | [`src/lib/plan.ts`](../src/lib/plan.ts) — entitlements 足場 |

---

## あなたが守ること

1. **Stripe-first ≠ SaaS-first。** Board / Scene / 座標をサーバに送らない。
2. **Pro = Local Library（引き出し）＋ BYO（封筒）。** Portability だけを Pro の核にしない。
3. **Board JSON Export は無料。** Storage full Recovery の Primary と矛盾させない。
4. **User Account を作らない。** Purchase Identity（Checkout email + signed license + Restore Pro）のみ。UI で Login と呼ばない。
5. Pitch / Broadcast に Upgrade バナーを常時出さない。
6. 機能を水増しして Pro 価値を人工的に増やさない。

## やらないこと

- Google Login / パスワードアカウント
- Board クラウド保存・同期
- Free からの Board JSON Export 全面禁止
- `/library` 第一ホーム化
- 自前 Billing ダッシュボード
- entitlement サーバ横の「ついで Board backup」

## 実装に入るとき

[`STRIPE_PRO_ARCHITECTURE.md`](STRIPE_PRO_ARCHITECTURE.md) §9 の順序に従う。先に Free Export/Import 楔と Recovery、次に Stripe webhook → entitlement、最後に Preset Library ゲート。

コミットはユーザ依頼までしない。ユーザー向け返答は日本語。
