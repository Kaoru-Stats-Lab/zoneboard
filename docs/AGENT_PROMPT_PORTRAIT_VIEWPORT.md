# 実装プロンプト — 縦ピッチの画角プリセット（B-072 追補）

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

**前提:** 縦ピッチ描画（`pitchOrientation` · `drawPitch*` · `aspectFor`）と Pitch View UI は **実装済み**。局面タブの画角（カメラ）プリセットは **縦サッカー 3 種**に絞る。

仕様: [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) 決定ログ「縦ピッチの画角プリセット（2026-08-31）」· [`VERTICAL_PITCH.md`](VERTICAL_PITCH.md) §3（座標）· §5（左右ピラーは仕様）。矛盾したら PRODUCT_NOTE を勝ちにする。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

## 縦サッカーで UI に出すプリセット（3 種のみ）

| id | ラベル（ja） | 縦での意味 |
|---|---|---|
| `full` | 全体 | フルピッチ |
| `final-third-left` | FT上 | 上ゴール側ファイナルサード（cy≈0.17） |
| `final-third-right` | FT下 | 下ゴール側ファイナルサード（cy≈0.83） |

**縦では出さない:** ペナ · CK · スロー — 正方形カメラではペナと FT がほぼ同枠。ペナ寄りは FT + 手動ズーム。セットプレーは局面複製。

---

## 検証

- `npx tsc --noEmit` · `npm run test:i18n-chrome` · `npx tsx scripts/portrait-viewport-check.ts`
- 手動: 縦フルで画角グリッド **3 ボタン** · 横フル 13 プリセット回帰

---

## Later

- 非正方形カメラ · Export 画角 · 9:16 キャプチャ枠 · ゴールライン・ピン
