# 実装プロンプト — サッカー・ピッチ面「スレート」（ダークグレー）＋インク可読性

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

あなたは ZoneBoard（`c:\asl_dev\zoneboard`）の実装エージェントです。  
**いまやるのは:** サッカー配信向けに **スレート（ダークグレー）ピッチ面**を追加し、Pass / Run / Dribble / Screen / Zone / Pen / Link / ピッチ線が **読める**ようにインク規則を確定実装する。

テーマ商店・クラブカラー芝・写真テクスチャは **禁止**。面は **白 / 芝 / スレートの3種**まで。

---

## 0. 先に読め

1. `src/canvas/drawingInk.ts` — `LINE_COLORS` / `LINE_COLORS_GRASS` · `usesGrassInk` · ハロー
2. `src/canvas/drawPitch.ts` — `drawPitchSurface` · `outerFillForBoard` · `pitchInk` · 芝縞
3. `src/canvas/drawBoard.ts` — `usesGrassInk` 分岐の線・ゾーン・リンク・ハロー
4. `src/components/SettingsModal.tsx` — `pitchSurface` 二択（白 / 芝）
5. `src/models/types.ts` · `defaults.ts` — `showGrassPitch`
6. `.cursor/rules/i18n-ui-guardrails.mdc`
7. （任意）`docs/BALL_DESIGN.md` は触らなくてよい

---

## 1. 可読性判断（確定・議論し直さない）

### 既存パレット

| 面 | Pass | Run | Dribble | Screen | Pen/Text | Link | ピッチ線 |
|----|------|-----|---------|--------|----------|------|----------|
| **白（paper）** | `#2563eb` | `#059669` | `#ea580c` | `#7c3aed` | `#111` | `#111` | `#1a1a1a` |
| **芝（grass）** | `#93c5fd` | `#fde047` | `#fdba74` | `#d8b4fe` | `#fff` | `#959b95` | 白系 |

### スレート（目安地色 `#2c3038` 前後）に載せたときの判定

| インク | 白パレットをそのまま | 芝パレットを流用 |
|--------|---------------------|------------------|
| Pass/Run/Dribble/Screen | 暗め彩度で沈む · Run緑は特に弱い | **可**（明色で暗面向けに既チューニング） |
| Pen / ピッチ線 `#111` | **不可**（消える） | 白系 **可** |
| Link `#959b95` | — | 芝よりスレートで **弱い**（グレー on グレー）→ **スレート専用で一段明るく** |
| 芝の白ハロー | — | スレートではピッチ白線と被りやすい → **スレートは暗ハロー** |

**結論:**

- スレートは **暗面インク系統**（芝と同系の明色戦術線）を使う
- **芝インクを無改造コピーだけでは不足**（Link・ハロー）
- 白パレットをスレートに載せない

---

## 2. 仕様（ロック）

### 2-1. データモデル

`showGrassPitch: boolean` をサッカー用の面に拡張する。推奨:

```ts
/** soccer のみ意味を持つ。他競技は無視（現行どおり各スポーツの面） */
export type SoccerPitchSurface = "paper" | "grass" | "slate";
```

- `BoardDocument` に `soccerPitchSurface?: SoccerPitchSurface` を足す **または**  
  `showGrassPitch` を廃止して `soccerPitchSurface` に一本化（マイグレーション必須）

**マイグレーション（必須）:**

| 旧 | 新 |
|----|-----|
| `showGrassPitch === true` | `"grass"` |
| `showGrassPitch === false` / 欠落（soccer） | `"paper"`（既存白の挙動を維持） |
| 新規 soccer ボード | 既定 **`"grass"`**（現行 `createBoard` と同様） |

他競技の `showGrassPitch` フィールドが残るなら触らない／無視。

### 2-2. 面の見た目（スレート）

| 項目 | 仕様 |
|------|------|
| ピッチ塗り | マットなダークグレー（例: `#2c3038`）。芝の緑縞は **出さない** |
| 外周 / outer | 同系やや暗め（例: `#242830`） |
| ピッチ線 | **白系**（芝と同じ `GRASS_INK` 相当で可） |
| ノイズ | 任意で微細（芝ノイズのグレー版）。やりすぎ禁止 |
| 既定 | 芝のまま。スレートはユーザが選ぶ |

### 2-3. インク（スレート確定値）

戦術線は芝と同色でよい（意味色の一貫性）:

```ts
// 芝と同じでよい
pass / run / dribble / screen → LINE_COLORS_GRASS
zone → ZONE_COLORS_GRASS（または fill をスレート向けにわずかに不透明寄りでも可）
pen / text → #ffffff
```

スレート専用:

```ts
LINK_INK_SLATE = "#c5cbc5"   // 芝の #959b95 より明瞭。Pen白・Pass水色と区別
HALO_INK_SLATE = "rgba(0, 0, 0, 0.62)"  // 白ハロー禁止（ピッチ線と干渉）
```

ハロー幅は `grassHaloWidth` 流用可。  
**Run:** 芝と同様、黄はコントラスト十分なためハロー省略してよい（現行芝ロジック踏襲）。

### 2-4. コード構造（推奨）

`usesGrassInk` を「暗面用インクか」に一般化する:

```ts
usesDarkPitchInk(board) // soccer && (grass | slate)
usesGrassPitch(board)   // 面描画・縞用
usesSlatePitch(board)
```

- `lineColorForBoard` / `toolColorForBoard` / `penColorForBoard` / `textColorForBoard`  
  → 暗面なら芝パレット（Link だけ slate 分岐）
- `drawBoard` のハロー: grass → 白ハロー、slate → 暗ハロー、paper → なし（現行）
- `drawPitch` / `outerFillForBoard`: slate 分岐を追加

既存の `usesGrassInk` 呼び出しを機械的に `usesDarkPitchInk` へ置換し、**面そのものの分岐が必要なところだけ** grass/slate を分ける。

### 2-5. UI

`SettingsModal` のピッチ面を **3セグメント**:

| キー（例） | 表示 |
|------------|------|
| `pitchSurfaceWhite` | 既存「白」 |
| `pitchSurfaceGrass` | 既存「芝生」 |
| `pitchSurfaceSlate`（新） | スレート / Slate / … 全9ロケール |

- Short が必要ならガードレールどおり全ロケール同時
- Drawer に無理に増やさない（設定の既存位置で可）
- ロケール別レイアウト禁止

### 2-6. やらないこと

- 4つ目以降の面・ユーザ任意 HEX 芝
- CL 公式芝テクスチャ写真
- Pass 等の意味色を紙面と暗面で別意味にする（色相族は維持）
- バスケ木目・ビーチ砂をスレート化
- コミット

---

## 3. 受け入れ条件

1. サッカーで白 / 芝 / スレートを切り替えられる
2. スレートで Pass・Run・Dribble・Screen・Zone・Pen・Link・ピッチ線が **一眼で区別**できる（特に Link≠Pen、Run≠芝の黄衝突なし）
3. 旧セーブ: 芝→芝、白→紙。回帰なし
4. スレートに緑縞が出ない
5. PNG 書き出し・局面サムネも面色に追従
6. `tsc --noEmit` PASS · Short 追加時は `test:i18n-chrome`
7. 目視: スレート＋ホーム赤/アウェイ青駒＋パス水色＋ラン黄が同時に読める

---

## 4. 完了報告フォーマット

```
## 完了報告 — スレートピッチ

### 変更ファイル
- …

### モデル
- 旧 showGrassPitch → …

### スレート
- 面色: …
- outer: …
- Link: …
- Halo: …

### 確認
- [ ] 白 / 芝 / スレート切替
- [ ] 線種可読性（Pass/Run/Dribble/Link/Pen）
- [ ] マイグレーション
- [ ] export / scene thumb
- [ ] tsc / i18n-chrome

### 触らなかったもの
- …
```

---

## 5. やらないこと（再掲）

- 面カタログの肥大化
- 白パレットをスレートに無理載せ
- コミット
