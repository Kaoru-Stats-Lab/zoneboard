# 実装プロンプト — 局面取込 W08: 可視ランドマークキャリブ（B-070 · Phase 1.5）

**索引:** [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md)  
**要件親:** [`CAPTURE_IMPORT_P1_REQUIREMENTS.md`](CAPTURE_IMPORT_P1_REQUIREMENTS.md)  
**境界:** [`AGENT_PROMPT_PRODUCT_BOUNDARY.md`](AGENT_PROMPT_PRODUCT_BOUNDARY.md) · PRODUCT_NOTE 2026-09-22  

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

## 0. 問題（なぜ直すか）

現行キャリブは **画像上4点 → フルピッチ四隅** `(0,0)(1,0)(1,1)(0,1)` 固定。

放送の実写寄り（片側ペナ・ゴール付近）では **ピッチ四隅が画角に入らない**。  
見えない四隅にハンドルを置くのは推測になり、下敷きがずれる。

**必要なのは:** ユーザが **見える線の交点・既知ランドマーク**を指定し、それぞれを FIFA 寸法の **既知 pitch-norm** に対応させること。

Homography 自体は「対応する4点」なら四隅でなくてよい（既存 `computeHomography(src, dst)` のまま）。

**やらない:** 自動線検出 · 自動ランドマーク当て（Phase 3）· Tracking · 5点以上の最小二乗（本 Wave は **ちょうど4点**）。

---

## 1. 先に読め

1. このファイル全文  
2. `src/capture/homography.ts` — `computeHomography` · `PITCH_CORNERS_NORM`  
3. `src/presets/soccerPitch.ts` — `SOCCER_PITCH_M` · `SOCCER_NORM`  
4. `src/components/CaptureCalibOverlay.tsx` — 現行4ハンドル UI  
5. `src/capture/session.ts` · `src/hooks/useAppState.ts` — calib 適用経路  
6. `src/capture/homographyWorker.ts` / `homographyAsync.ts` — Worker が dst 固定なら拡張  
7. `.cursor/rules/i18n-ui-guardrails.mdc` · `product-boundary.mdc`

触らない: W06 コマ抜き · Phase 2 自動駒 · LP · changelog · OBS 配信 chrome の大改修。

---

## 2. ゴール

### 2-1. ユーザフロー

```text
phase calib
  → （任意）プリセット「左ゴール側ペナ」/「右ゴール側ペナ」/「フル四隅」
  → ハンドル 1..4 それぞれ:
       画像上ドラッグ（src）
       + ランドマーク種別セレクト（dst を SOCCER_NORM から解決）
  → 適用 → computeHomography(src4, dst4) → place（下敷き）
```

- **フル四隅**プリセット = 現行互換（dst = `PITCH_CORNERS_NORM`）
- **左/右ゴール側**プリセット = よく使う4ランドマークを初期選択（ハンドル位置は画像インセットのまま · ユーザが線交点へドラッグ）

### 2-2. ランドマークカタログ（Must · 横フル soccer · x=長さ 0=左ゴール）

`src/capture/pitchLandmarks.ts`（新規）に **id → { x, y } pitch norm** を定義。  
座標はすべて `SOCCER_PITCH_M` / `SOCCER_NORM` から算出（マジックナンバー直書き禁止）。

**座標系:** 既存どおり x = 長さ（ゴール間）、y = 幅（タッチ間）、左上原点に合わせる（`PITCH_CORNERS_NORM` と同じ）。

| id（例） | 意味 | 算出の正本 |
|----------|------|------------|
| `corner_tl` `corner_tr` `corner_br` `corner_bl` | ピッチ四隅 | (0,0)(1,0)(1,1)(0,1) |
| `pen_near_*` / `pen_far_*` | ペナ四隅（ゴール側を near） | `penDepth` · `0.5 ± penHalfH` · 左ゴール x=`penDepth` 側 / 右ゴールは `1-penDepth` |
| `goal_near_*` / `goal_far_*` | ゴールエリア四隅 | `goalDepth` · `0.5 ± goalHalfH` |
| `pen_spot_l` / `pen_spot_r` | PK 点 | `penSpot` / `1-penSpot` · y=`0.5` |
| `pen_arc_apex_l` / `pen_arc_apex_r` | ペナアークのフィールド側頂点 | ペナ線と中心円弧の関係: ペナ外縁中心から `centerCircleR` 相当。`SOCCER_NORM.centerR` は **幅方向正規化**なので長さ方向は `centerCircleR/length` を別計算 |
| `post_l_bottom` `post_l_top` / `post_r_*` | ゴールポスト足元（ゴールライン上） | x=0 or 1、y = `0.5 ± goalWidth/(2*width)` |

**左ゴール側プリセット（推奨初期4点）:**

1. ペナ・ファーサイド角（タッチ寄り · ゴールライン交点側）  
2. ペナ・ニアサイド角  
3. ペナアーク頂点（またはペナボックスのフィールド側角のどちらか · 非共線を優先）  
4. ゴールエリア角 or ポスト足元  

右ゴール側は x を鏡映。

実装時に **退化しにくい4点**をプリセットに固定し、スクリプトで面積チェック。

### 2-3. セッション型拡張

`CaptureImportSession` に例えば:

```ts
calibSrc4: Point[] | null;           // 既存
calibLandmarkIds: [LandmarkId, LandmarkId, LandmarkId, LandmarkId] | null;
// homography 計算時: dst4 = calibLandmarkIds.map(id => landmarkNorm(id))
```

旧セッション（ids null）は四隅扱い。migrate 不要（メモリ短命）。

### 2-4. Worker / apply 経路

- `computeHomography(src, dst)` は **変更不要**（dst を可変で渡す）
- Worker が内部で `PITCH_CORNERS_NORM` 固定なら **dst4 を引数で渡す**よう修正
- `applyCaptureHomography` は session の landmark ids → dst4 → H

### 2-5. UI（`CaptureCalibOverlay`）

- 4ハンドルは維持（色分け · 番号 1–4）
- **各ハンドルに小さなセレクト**（またはタップでサイクル）でランドマーク id  
  - オーバーレイ内。ドロワー 300px に押し込めない  
  - Short ラベル（例: `Pen far` / `ペナ奥`）· フル名は `title`
- 上部にプリセット 3 セグメント: **Full corners** / **Left goal** / **Right goal**（Short）
- ヒント文を更新: 「見える線の交点に置く。四隅が見えなければペナ角・アーク・ポストを選ぶ」
- 適用前バリデーション:
  - 4 ids すべて解決可能  
  - dst が共線・面積ゼロ → `captureCalibFail`  
  - 同一 landmark の重複選択 → インラインエラー（新キー可）

i18n: 既存 `captureCalib*` を書き換え + landmark Short キー。**全ロケール同時**。`npm run test:i18n-chrome`

---

## 3. 受け入れ条件

- [ ] フル四隅プリセットで **現行どおり** 俯瞰スクショが取れる（回帰）
- [ ] **片側ペナ寄り**スクショ（四隅不可視）で、ペナ角＋アーク／ゴールエリア等4点 → 下敷きがペナ・ゴール線に **おおむね一致**
- [ ] 左/右プリセット切替で dst が鏡映される
- [ ] Homography 失敗時は place に進まない（恒等で進めない）
- [ ] ゲート・非送信・画像非永続・横フル soccer のみ — 維持
- [ ] `tsc --noEmit` · `test:i18n-chrome` · 既存 `homography-check` + **landmark dst の単体テスト**追加
- [ ] changelog / LP / 自動検出 — **やらない**

### 手動 UAT 素材

CL 寄り片側ペナ（Liverpool 型）1枚 + 高所フル寄り1枚。

---

## 4. ガードレール（Cursor Auto）

| # | 禁止 | 正しい行動 |
|---|------|------------|
| 1 | 自動でペナ角を検出 | 手動選択のみ |
| 2 | dst を画像サイズから推定 | 必ず `SOCCER_NORM` / m 寸法 |
| 3 | 5点+ RANSAC を本 Wave で入れる | 4点 DLT のまま |
| 4 | OpenCV / 新 deps | 純 TS |
| 5 | 縦ピッチ・ハーフ対応を広げある | Later · エラー維持 |
| 6 | Homography 行列式の全面書き直し | dst 供給だけ変える |
| 7 | ドロワーにセレクト4つ横並び | オーバーレイ · Short · スタック |
| 8 | 勝手 commit / 公開告知 | 報告のみ |

境界ゲート（チャットに4行）:

1. Idea→Explanation？ → Yes（実写寄りの摩擦削減）  
2. Game→Analysis？ → No  
3. Workstation 化？ → 手動ランドマークのまま  
4. 帯 → P0 Core の欠陥修正（B-070 Phase 1.5）

---

## 5. 検証コマンド

```bash
npx tsc --noEmit
npm run test:i18n-chrome
npx tsx scripts/homography-check.ts
# landmark → dst の単体（新規スクリプト or 既存に追加）
```

---

## 6. 完了報告

- ランドマーク id 一覧と dst 計算式（表）  
- プリセット3種の初期4 id  
- 触ったファイル  
- 回帰（フル四隅）と片側ペナの目視結果  
- やらなかったこと（自動検出 · 5点 · 縦）

---

## 7. コピペ用 — 別 Agent への渡し文

```text
docs/AGENT_PROMPT_CAPTURE_IMPORT_W08_LANDMARK_CALIB.md を正本に実装して。

局面取込の4点キャリブを「フルピッチ四隅固定」から
「可視ランドマーク（ペナ角・アーク・ゴールエリア・ポスト等）↔ SOCCER_NORM」に拡張する。

- Homography 数式は触らず dst 供給だけ変える。
- 自動検出はしない。フル四隅プリセットで回帰を守る。
- ゲート・非送信・横フル soccer のみ維持。
- changelog / commit はしない。日本語で報告。
```
