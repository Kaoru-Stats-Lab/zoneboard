# 公開更新履歴（SUGUDASU 式）

**正本:** [`src/site/changelog.ts`](../src/site/changelog.ts)  
**公開面:** https://zoneboard.app/updates/  
**生成:** `npm run site:pages`

SUGUDASU の `changelog.json` + `/updates` と同じ役割。ZoneBoard は公開 UI が英語一本なのでエントリも英語。

---

## 粒度（3段）

| 段 | 載せる？ | 基準 |
|---|---|---|
| **Ship** | **必ず** | 新しい操作・新設定・既定が変わる・配信 / PNG の見え方が変わる |
| **Notice** | **まとめて1行**（任意） | 直さないと困るが新機能ではない fix / improve |
| **Skip** | **載せない** | コピーだけ・内部・マーケ・微調整 |

**1エントリ = 1つの「ユーザーが言える変化」。** コミット単位ではなく **出荷単位** でまとめる。

### 載せる（Ship）

- Board: 新ツール / 新タブ項目 / 新トグル / 既定値変更 / 配信 (B) の見え方変更
- Export: PNG・比率・フッター・キャプチャ範囲の変更
- Match / Scenes: 帯・PK・交代・局面まわりの操作変更
- Site: Guide / FAQ / Materials に追記すべき **製品** 変更
- Plan: Free / Pro など課金・制限の変更

### 載せない（Skip · 固定）

| 載せない | 例 |
|---|---|
| 予定・ロードマップ | BACKLOG · SPEC の将来 |
| 内部 | チケット番号・リファクタ・Agent プロンプト |
| マーケ・読み物だけ | PH バッジ · About ストーリー · LP 文言調整 |
| 微調整 | ヒットテスト · ルーティング修正 · 色1箇所 |
| 決定ログ | PRODUCT_NOTE の議論のみ |

### Notice（圧縮して1本まで）

同じ週に Ship が多いときは、次を **1本の improve** にまとめてよい。

- PNG export の挙動修正
- 局面の回転 / ミラー修正
- 配信フレーミングのマット

---

## 必須トリガー（本番マージ時）

次のいずれかに当たったら **`changelog.ts` 更新は必須**（Skip リストに該当しないこと）。

1. **Board** — ツール・ドロワー・既定・ショートカットの追加 / 変更
2. **Export / capture** — PNG・配信キャプチャの出力が変わる
3. **Match / Scenes** — 帯・ライブ操作・局面モデルが変わる
4. **Plan** — Free / Pro・制限・Pricing 文言が製品と連動
5. **Materials / Guide** — ユーザー向け手順が変わる（doc だけの誤字は除く）

**運用:** 毎コミットではなく **出荷のまとまり**（PR マージ · Launch 日 · 週次）で追記。  
`npm run site:pages` → `/public/updates/` を **同じ PR か直後のコミット** に含める。

---

## 手順

1. `src/site/changelog.ts` の `entries` **先頭**に追加（`updatedAt` も更新）
2. `npm run site:pages`
3. コミットに `/public/updates/` を含める

### エントリの書き方

- **title:** 動詞または名詞句 · 一文（≤60 文字目安）
- **body:** 何ができて、既定はどうか · 2–3 文 · 過去形
- **type:** `feature` | `fix` | `improve`
- **id:** `kebab-topic-YYYYMMDD`（同日複数は suffix で区別）
- **date:** 本番に入った日（ISO `YYYY-MM-DD`）

---

## LP / Settings との関係

PNG「Full pitch」ラベル問題は Beta ではなく命名修正（`Zoom: full field (may crop)` + LP 細文）。履歴には improve として1行残す。

Guide / how-to に触れる Ship は、エントリ本文か Guide 更新の **どちらか一方で十分ならエントリ優先**（`/updates` が正本の要約）。
