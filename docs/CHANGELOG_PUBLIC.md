# 公開更新履歴（SUGUDASU 式）

**正本:** [`src/site/changelog.ts`](../src/site/changelog.ts)  
**公開面:** https://zoneboard.app/updates/  
**生成:** `npm run site:pages`

## 方針

| 載せる | 載せない |
|---|---|
| 本番に入った変更（過去形） | 予定・ロードマップ |
| 使い方が変わる feature / fix / improve | 内部チケット番号・実装メモ |
| 配信者・指導者が読む英語 | Beta バッジや「実験中」の常設ラベル |

SUGUDASU の `changelog.json` + `/updates` と同じ役割。ZoneBoard は公開 UI が英語一本なのでエントリも英語。

## 手順

1. `src/site/changelog.ts` の `entries` 先頭に追加（`updatedAt` も更新）
2. `npm run site:pages`
3. コミットに `/public/updates/` を含める

## LP / Settings との関係

PNG「Full pitch」ラベル問題は Beta ではなく命名修正（`Zoom: full field (may crop)` + LP 細文）。履歴には improve として1行残す。
