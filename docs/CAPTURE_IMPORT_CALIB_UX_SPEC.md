# 局面取込キャリブ UX — 要件 · 仕様（2026-09-22 確定）

**英名:** Capture Import Calibration UX  
**Backlog:** B-070 · Phase 1.5 UX  
**実装プロンプト:** [`AGENT_PROMPT_CAPTURE_IMPORT_W09_CALIB_UX.md`](AGENT_PROMPT_CAPTURE_IMPORT_W09_CALIB_UX.md)  
**境界:** [`AGENT_PROMPT_PRODUCT_BOUNDARY.md`](AGENT_PROMPT_PRODUCT_BOUNDARY.md) · PRODUCT_NOTE 2026-09-22  
**前段:** W08（ランドマーク dst）はエンジンとして残す。本仕様は **UI / コピー / フロー** の作り替え。

矛盾したら **本ファイル＋PRODUCT_NOTE** を勝ちにする。

---

## 0. CPO / CMO / CTO 合議（固定）

| 役割 | 決定 |
|------|------|
| **CPO** | ジョブは「Homography を設定」ではなく **「この画をピッチにしてすぐ置く」**。学習コストは表記と初期配置に集中。 |
| **CMO** | ユーザーにエンジニア略語・ヤード数値・画面座標系を見せない。**競技の大小エリア＋相対位置**のみ。 |
| **CTO** | エンジンは Camera-agnostic · Direction-agnostic。内部 id / FIFA m は維持。自動検出はしない。 |

**原則:** Human decides → ZoneBoard calculates。  
**やらない:** 線・交点の自動認識、攻守自動判定、カメラ位置の必須入力、ドローン専用モード、Metrica 型分析。

---

## 1. 要件（Requirements）

### 1.1 Must

1. **手動4点** — 画像上の src と Canonical Pitch の dst（既知ランドマーク）を人間が対応づける。  
2. **攻撃方向・画面の左右を前提にしない** — UI に「Left Goal / Right Goal」（画面・攻撃意味）を出さない。  
3. **Canonical Pitch** — dst は既存 `SOCCER_NORM` 固定座標系（ZB 内部の左右）。攻撃方向レイヤーとは分離。v1 で攻撃方向 UI は作らない。  
4. **見えるゴールの選択は絵で行う** — 片側ゴール画では、ミニ俯瞰図で「今見えているのはどちらのゴールか」をクリック。言葉の L/R で選ばせない。  
5. **プリセットはランドマーク集合** — Full Pitch / Penalty Area / Goal Area / Mixed（おすすめ）など「どの点が使えるか」。カメラ種別ではない。  
6. **初期配置** — 画像四隅インセットを廃止。プリセット確定後に **おすすめ4点の番号①–④** を画像上に出す（ドラッグ前提）。自動確定に見せない。  
7. **表記** — 主要ラベルから排除: `near/far`、`GA`、`TL/BR` 型、**ヤード／メートル数値**（18yd・6yd・16.5m 等）。  
8. **サポート条件（カメラ名で切らない）** — 「平面として写り、既知ランドマークを人間が4点視認できる画像」。メインスタンド限定にしない。  
9. **ゲート・非送信・横フル soccer・画像非永続** — 既存どおり維持。  
10. **隠しベータ** — changelog / LP / How-to に書かない。

### 1.2 Should

- プリセット後、変更候補は **その文脈の 6〜8 点**＋「その他」。28 項を初手に出さない。  
- 画像上は番号のみ。意味は **下部リスト**（①＝…）で確認・変更。  
- tooltip（title）だけ言語別慣用（EN yard、DE Sechzehner 等）を Later で足してよい。

### 1.3 Must not

| 禁止 | 理由 |
|------|------|
| 交点・線の自動検出 | Explanation Canvas 境界 |
| 「おすすめ」を検出結果として自動吸着 | Human decides を壊す |
| 攻撃方向から L/R を推定 | AI 推論＋時間で変わる |
| カメラ位置メタデータ必須 | ゴール選択の絵で足りる |
| 主要 Short にヤード／メートル数値 | 多言語で数値が一致しない |
| ドローン専用 Calibration UI | 同じ4点モデルで吸収 · 専用は Later |

### 1.4 v1 スコープ（画角）

| ケース | v1 |
|--------|-----|
| 通常中継・逆サイド・ゴール裏寄り・斜め（ランドマーク可視） | ✅ |
| 左右どちら攻め・画像回転 | ✅ |
| 両ゴールが同時に入る広角 | ✅（ゴール選択スキップ可 · Full / コーナー系） |
| 真上ドローン専用 UX | ❌（エンジンは同じ · 専用プリセットは Later） |
| 極端な共線・線が読めない画 | 失敗してよい（優しめエラー） |

---

## 2. 仕様（Specification）

### 2.1 座標系

| 層 | 正本 |
|----|------|
| Canonical Pitch dst | `src/capture/pitchLandmarks.ts` + `SOCCER_NORM`（内部 id は `pen_l_*` 等のままで可） |
| 画像 src | ピクセル · 既存 calibSrc4 |
| Homography | 既存 `computeHomography(src4, dst4)` · Worker 経由維持 |

**ゴール側の意味:**  
ミニ俯瞰で選んだゴール = Canonical の **x=0 側** または **x=1 側**。以降の相対語（エンドライン側／フィールド側、タッチ方向の上下）はそのゴール内で解釈し、内部 id の `*_l_*` / `*_r_*` にマップする。

### 2.2 ユーザフロー（正本）

```text
① 画像表示（phase image / calib 入口）
② 「＋ ピッチを取り込む」（中央。技術用語「キャリブ」を前面に出さない）
③ 見えるゴールをミニ俯瞰で選択
     — 両ゴールが明らかに見える Full 系を選ぶ場合はスキップ可
④ ランドマーク集合プリセット
     [ 全体に近い ] [ ペナ付近 ] [ ゴール付近 ] [ おまかせ ]
⑤ おすすめ4点が番号①–④で画像上に表示
     文言: 「線の交点にドラッグして合わせてください」
     ※自動検出ではないことを明示
⑥ ドラッグ微調整 · 下部リストで意味確認 / 変更
⑦ 適用 → Homography → place（下敷き）→ 手置き
```

### 2.3 プリセット → おすすめ4点（静的 · 幾何）

実装は `pitchLandmarks.ts` に **プリセット定義表**として持つ（マジック配置禁止 · SOCCER_NORM 由来）。

| プリセット（UI） | 意図 | おすすめ4点（意味） | 備考 |
|------------------|------|---------------------|------|
| **全体に近い** | 四隅が読める俯瞰寄り | ピッチ四隅 | 旧 Full corners |
| **ペナ付近** | 片側ペナが主 | ペナ角×2（エンドライン側＋フィールド側）· ゴールエリア角 · PK or アーク頂点 | ゴール選択後にその側の id へ |
| **ゴール付近** | 箱が主 | ゴールエリア角×2 · ポスト · PK or ペナ角 | 狭い画角向け |
| **おまかせ** | 片側実写の既定 | ペナ角（エンドライン）· ペナ角（フィールド）· ゴールエリア角 · PK | 本命放送画の既定候補 |

**初期ハンドル位置:**  
おすすめ4点の **意味に対応する「画面上の仮位置」**は、画像の四隅ではなく、**画像中央寄りに小さな十字／番号を置き、ユーザが交点へドラッグ**する。  
（自動で線にスナップしない。）任意: ゴール選択後、そのゴール側の半画面に軽く寄せた初期オフセットは可（検出ではない）。

### 2.4 ユーザー向けラベル（主要 · 数値なし）

内部 id はそのまま。`t()` の Short / Full のみ差し替え。

**相対軸（ゴール選択後・そのゴール内）:**

| 軸 | EN | JA（他ロケールは同等の意味役割） |
|----|----|------|
| ゴールラインに近いペナ／GA の角 | … — goal line | …・ゴールライン側 |
| フィールド側のペナ／GA の角 | … — field side | …・フィールド側 |
| タッチ方向 | 可能なら「近いタッチ／遠いタッチ」より **上タッチ／下タッチは Canonical か画面か曖昧なので、プリセット固定の2角を名前で区別**（例: ペナ角 A/B ではなく goal-line / field-side で足りる） |

**エリア名（ロケール写像 · Short）:**

| 意味役割 | EN 例 | JA 例 | 出さない |
|----------|-------|-------|----------|
| ペナルティエリアの角 | Penalty corner | ペナ角 | 18yd / Sechzehner を Short に |
| ゴールエリアの角 | Goal-area corner | ゴールエリア角 | 6yd / Fünfer を Short に |
| PK | Penalty spot | PKスポット | |
| ポスト | Goalpost | ゴールポスト | |
| コーナー | Pitch corner | コーナー | Corner TL |

title（任意・Later）: EN のみ "18-yard box" 等の現地慣用を足してよい。

### 2.5 UI 構造

| 要素 | 仕様 |
|------|------|
| 画像上 | 番号①–④のみ（小さいハンドル）。直下に28項 `<select>` **禁止** |
| 下部（またはオーバーレイ下部バー） | `① ペナ角・ゴールライン側` 一覧。タップでその点を選択・候補変更 |
| 候補変更 | 「おすすめ」グループ＋「その他」（文脈 6–8 → 展開で残り） |
| エラー | 重複・退化・H失敗。文言は責めない（交点へ動かして、など） |
| プリセットラベル | JA: 全体に近い / ペナ付近 / ゴール付近 / おまかせ。EN: Full pitch / Penalty area / Goal area / Suggested |

### 2.6 セッション型（概念）

既存に加え（名前は実装で調整可）:

```ts
calibGoalSide: "x0" | "x1" | null;  // Canonical: 左ゴール x=0 / 右 x=1
calibPreset: "full" | "penalty" | "goal" | "mixed";
calibLandmarkIds: LandmarkQuad;     // 内部 id 4つ
calibSrc4: Point[];
```

旧 `full | left | right` UI プリセットは **削除または内部エイリアスのみ**（ユーザー向け Left/Right 文言を出さない）。

### 2.7 i18n

- 全ロケール同時更新（既存 `captureLm*` / `captureCalib*` を書き換え or 新キー）  
- Short は chrome 長制限遵守 · `test:i18n-chrome`  
- 数値ヤードを Short に入れない（全言語）

---

## 3. 受け入れ条件

- [ ] 四隅インセット初期が消えている  
- [ ] UI に `Pen L near B` / `Align pitch corners` / Left Goal（攻撃・画面意味）が出ない  
- [ ] 主要 Short に 18yd / 6yd / メートル数値がない  
- [ ] ミニ俯瞰でゴール選択 → ペナ付近プリセット → ①–④表示 → ドラッグ → 適用で下敷きが片側ペナ画でおおむね一致  
- [ ] Full pitch プリセットで俯瞰四隅画が回帰  
- [ ] 自動検出・changelog・縦ピッチ拡張なし  
- [ ] `tsc` · `test:i18n-chrome` · `landmark-check` PASS  

---

## 4. 参照

- エンジン: [`AGENT_PROMPT_CAPTURE_IMPORT_W08_LANDMARK_CALIB.md`](AGENT_PROMPT_CAPTURE_IMPORT_W08_LANDMARK_CALIB.md)（dst カタログ）  
- 索引: [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md)  
- P1 親: [`CAPTURE_IMPORT_P1_REQUIREMENTS.md`](CAPTURE_IMPORT_P1_REQUIREMENTS.md)  
