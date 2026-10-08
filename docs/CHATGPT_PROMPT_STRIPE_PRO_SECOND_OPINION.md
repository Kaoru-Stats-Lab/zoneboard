# ChatGPT 渡し用プロンプト — Stripe / Pro セカンドオピニオン（未確定）

下の「ここからコピー」〜「ここまで」をそのまま ChatGPT に貼る。  
**これは確定決定ではない。** 別モデルによる批判・補強・穴探し用。

---

## ここからコピー

あなたはプロダクトアーキテクト、SaaS課金設計者、UX/HCI専門家、プロダクトマネージャーの複合視点を持つシニアレビュー担当です。

以下は、ブラウザ完結の Football Tactics Board「ZoneBoard」について、

1. 当初の Stripe Subscription 導入案
2. 別レビュアー（Cursor上のシニア意見）によるセカンドオピニオン

です。

**重要:** セカンドオピニオンも、それを反映した社内メモも **まだ確定ではありません。**  
一般的な SaaS の「あるべき論」を当てはめず、ZoneBoard 固有の思想との整合を最優先してください。  
必要ならセカンドオピニオンにも明確に反対してください。

---

# ZoneBoard の前提（動かさない）

- Positioning: 「OBSの中のピッチ」 / Explain the idea（Explanation Canvas）
- Coach向け戦術管理 SaaS・Analysis Workstation ではない
- アカウント不要 · Login不要 · Boardデータをサーバに保存しない
- localStorage 中心 · 軽量 · Browser完結 · OBS前提
- Cloud Sync は現時点で提供しない
- UIを複雑な SaaS Dashboard / Chat UI にしない
- 価値は「すぐピッチを使えること」であり「クラウドでボードを管理すること」ではない

Board: 最大3（Free想定）· 1 Board 最大8 Scenes。Finder的なファイル名管理は避け、プレビューで認識したい。

既存の社内方針メモ（2026-08-27）には既に次がある:

> Pro は「クラウドの机」ではなく「端末の引き出し」を売る。  
> Pro = Local Library（選手セット・画角テンプレ・上限緩和・JSON）  
> JSON export は無料でも出せる方向を優先  
> 月額サブスクを本線にしない（一回買い or 低額年額仮説）  
> ユーザ ID ログインは本線にしない

---

# 1. 当初案（レビュー対象ドラフト）

## Free

- 通常利用 · Board作成/編集/保存 · Board Library · localStorage
- 最大3 Boards · 1 Board最大8 Scenes
- **Export不可 · Import不可**

## Pro

- Free + **Board Export / Import / portability / 別PC移動 / backup / reuse**
- 思想: **Pro = Board Portability**（大量機能追加ではない）

## Board Library

- Free/Pro **必ず表示**（課金機能ではなく複数Boardの標準UI）
- Freeでも Export/Import ボタンは見えるが **disabled/locked** + Upgrade導線
- Proでは Export/Import が通常操作
- 「Libraryは共通。PortabilityだけPro」

## UI影響

- Main Board / Pitch / Scene / OBS / Broadcast は大きく変えない
- 追加は Library · Free/Pro status · Upgrade · Export/Import · Restore Pro · Billing · Recovery 程度
- Stripe Checkout / Customer Portal を使い、自前Billing UIは作らない

## Accountless Pro

- Google Account等のUser Accountは作らない
- 別Chrome Profile / 別PC / 別ブラウザ向けに **Restore Pro**（購入済みentitlementを現ブラウザに復元）
- Loginではなく entitlement 復元

## 解約後

- Boardは消さない（localStorageに残す）
- Export/Importは再ロック

## Recovery

- Error Page量産ではなく Recovery State
- What happened / Is data safe / What now / Primary / Fallback
- 内部用語（localStorage, webhook等）をユーザに見せない

## Support

- Problem Reportに browser/OS/version/counts/error class 等（Board中身・座標は送らない）

## 当初の基本判断

> Stripe-first だが SaaS-first ではない。  
> Subscription → Entitlement → Board Portability

---

# 2. セカンドオピニオン（未確定・批判歓迎）

## Executive Judgment

**CONDITIONAL ADOPT**

方向（Stripe-first≠SaaS-first、Board非送信、Account必須にしない）は正しい。  
ただし次の3つを直さない限り ADOPT しない:

1. **Pro = Board Portability のみ**
2. **Free で Board JSON Export/Import 不可**
3. **月額 Subscription を価格本線とみなす**

## 主な主張

### A. Architecture

- 隠れたSaaS化は「アカウント作成」だけではない。「**データ存続を課金状態に依存させること**」もSaaS化。
- Free=Export不可は local-first の人質課金になり、privacy/trustを壊す。
- 薄い entitlement backend は許容。Boardクラウド化への成長が危険。

### B. Board Library

- Libraryを Free/Pro 共通にする判断は **正しい**。Pro専用は棄却。
- ただし「Export全体をロック表示」は不適切。
- Board切替UI（Board Library）と、選手セット/画角の Preset Library を混同しない。後者の複数保有がPro核。

### C. Monetization

- Portability単独は月額を払う理由として弱い（一回買いなら成立しうる）。
- 推奨の一文: **Pro = 端末上の Local Library（引き出し）＋ BYO Portability（封筒）**
- Portabilityは核ではなく手段。
- Freeには少なくとも **Board JSON Export（バックアップ逃げ道）を無料**で残す。
- Importは単発取込まで無料、またはImport自体無料で上限超過・複数セットだけPro。
- 価格本線は **年額 or 一回買い**。月額は補助。機能の水増しでPro価値を作るな。

### D. Accountless / Restore

- Accountは作るべきでない。必要のは **Purchase Identity**。
- Checkout email → entitlement record → signed device license → Restore（短命magic link / Portal）
- UIでは「Login」と呼ばず「Restore Pro with purchase email」
- success URL aloneを永久鍵にしない。email平文だけで誰でもRestoreしない。

### E. UX

- 差をLibrary/Settingsに閉じるのは良い。
- BroadcastにFREE/PRO・Upgradeを出さない。
- 起動をLibraryダッシュボードにしない（最後のBoard/すぐピッチ）。

### F. Recovery

- Recovery Stateは妥当。
- **決定的矛盾:** Storage full の Primary Action を Export にする設計と、Export有料ゲートは共存できない。

### G. 推奨最小構成

Client(Pitch + localStorage) · Stripe(Checkout/Portal/Webhooks) · Thin backend(entitlementのみ) · signed license · Board切替Library共通 · Recovery

### What NOT to Build（セカンド意見）

User Account / Google Login / Boardクラウド / Workspace / `/library`第一ホーム / 自前Billingダッシュボード / FreeからのBoard JSON Export全面禁止 / Pitch上の常時Upgrade / 空のChatbot起点 / Proの機能水増し / entitlement横のBoard backup

### 最終問いへの答え（セカンド意見）

- 当初案のまま: **No**（逃げ道が課金ゲートになり人質契約化）
- 直した後: **条件付き Yes**（Stripeは引き出しの鍵、机＝ピッチはそのまま）

---

# あなた（ChatGPT）への依頼

次を厳しくレビューしてください。日本語で。

1. **Executive Judgment** を一つ選べ: ADOPT / CONDITIONAL ADOPT / REDESIGN / REJECT  
   （セカンド意見の CONDITIONAL ADOPT に賛否を明記）

2. セカンド意見が **正しすぎて見逃している穴**、または **過剰に厳しい点** を指摘

3. 特に次を深掘り:
   - FreeでBoard JSON Exportを残すと、Proの転換率は致命的に落ちるか？
   - 「Local Library（選手セット・画角）＋BYO」は、watchalong/OBS配信者にとって本当に払う価値か？
   - Purchase Identity（メールRestore）は、実質Accountなのか？境界の書き方は十分か？
   - 一回買い vs 年額 vs 月額のどれがZoneBoardに合うか（一般論ではなくこのプロダクトで）

4. **Revised Free/Pro表** を、機能を増やさずに1つ提案（セカンド意見の表をベースに修正可）

5. 実装前に決めるべき **未決事項トップ5**（優先度付き）

6. 最後に一言で:
   > 「この方向ならStripeを入れてもZoneBoardはZoneBoardのままでいられるか？」  
   Yes / No と理由。

禁止:
- 「一般的なSaaSではこうする」だけで結論を出すこと
- User Account / Cloud Board Sync を安易に本線推奨すること（するならZoneBoard思想との衝突を明示）
- 機能を大量追加してPro価値を作ること

## ここまで
