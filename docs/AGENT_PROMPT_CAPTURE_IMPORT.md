# 実装プロンプト — 局面取込 Phase 1（B-070 · 索引）

このファイルは **実行順の索引**。各 Wave を **1 ファイルずつ** 別 Agent に渡す。  
**1 回で全部やらせない。** 前 Wave の受け入れが通ってから次へ。

**前提:** 縦ピッチ · Pitch View · ツールモード · 画角プリセットは **実装済み**。触らない。

仕様正本: [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) 決定ログ「Broadcast Capture Import（2026-08-30）」· [`BROADCAST_CAPTURE_IMPORT_RESEARCH.md`](BROADCAST_CAPTURE_IMPORT_RESEARCH.md)。矛盾したら **PRODUCT_NOTE** を勝ちにする。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

## ロールアウト — 隠し機能（2026-08-31 · 全 Wave 共通）

**Deploy するが一般公開しない。** 本番 `zoneboard.app` で帯 B/OBS 込みの品質チェックをじっくりやる。

| 層 | 方針 |
|----|------|
| **一般ユーザ** | 局面取込 UI · paste 取込 · `/tools/frame` は **一切見えない** |
| **QA（カオル）** | `https://zoneboard.app/board?captureImport=1` で **そのブラウザだけ** 有効化 |
| **解除** | `localStorage.removeItem("zoneboard:v1:captureImportBeta")` または DevTools |
| **公開時** | ゲート削除 or 常時 ON に切替 · changelog / How-to を **その時点で** 追加 |

### 実装契約（W02 で入れる · 以降すべてこのゲートを通す）

新規: `src/lib/captureImportGate.ts`（名前調整可）

```ts
const QUERY = "captureImport";
const LS_KEY = "zoneboard:v1:captureImportBeta";

/** DEV: 常時 true（ローカル実装用）。PROD: query または LS のみ。 */
export function isCaptureImportEnabled(search = window.location.search): boolean {
  if (import.meta.env.DEV) return true;
  const params = new URLSearchParams(search);
  if (params.get(QUERY) === "1") {
    try { localStorage.setItem(LS_KEY, "1"); } catch { /* ignore */ }
    return true;
  }
  try { return localStorage.getItem(LS_KEY) === "1"; } catch { return false; }
}
```

**ゲートが false のとき:**

- ドロワーに「局面取込」ボタン **出さない**
- `paste` / `drop` ハンドラ **登録しない**（通常 paste はブラウザデフォルト）
- `captureImport` state は触らない
- W06 `/tools/frame` も **404 または board へ redirect**（ルート自体を gate 内に）

**ゲートが true のときのみ** W02–W06 の UI・入力を有効化。

### やらない（隠し期間）

- LP · changelog · How-to · `/updates/` 告知
- 設定画面に「ベータ」トグル（将来の Pro ゲートとは別）
- `VITE_CAPTURE_IMPORT=1` だけに依存（**同一バンドルで prod QA** したいので query/LS 正本）

### ガードレール追加

| G16 | **ゲートなしで局面取込 UI を出す** | `isCaptureImportEnabled()` で **入口・paste・route 全部** |
| G17 | **changelog / LP に書く** | 公開決定まで **コード内コメント + この索引のみ** |

---

## Phase 1 のゴール（W01–W05 ✅ · 残り W07 + 任意 W06）

**放送スクショ 1 枚 → 手動4点 Homography → 下敷き → 手置き → 局面確定** — **コアは W05 まで完了想定。**

| 含む（実装済） | 残タスク |
|----------------|----------|
| W01 Homography · W02 貼付 · W03 4点 · W04 下敷き · W05 手置き確定 | **W07 隠しゲート**（Deploy 前必須） |
| `Ctrl+V` / ドロップ · draft · 局面反映 | W06 コマ抜き（任意） |
| Web Worker · 非永続 | [本番 UAT](AGENT_PROMPT_CAPTURE_IMPORT_P1_UAT.md) |

| 含まない（Later / Phase 2+） |
|------------------------------|
| 自動駒 · OCR · 身元ピック · ピッチ線自動 · 連続トラッキング · サーバ Vision |

---

## 実行順（更新 2026-08-31）

| 順 | ファイル | 状態 |
|----|----------|------|
| W01 | [`W01_HOMOGRAPHY`](AGENT_PROMPT_CAPTURE_IMPORT_W01_HOMOGRAPHY.md) | **✅** |
| W02 | [`W02_PASTE`](AGENT_PROMPT_CAPTURE_IMPORT_W02_PASTE.md) | **✅** |
| W03 | [`W03_CALIB`](AGENT_PROMPT_CAPTURE_IMPORT_W03_CALIB.md) | **✅** |
| W04 | [`W04_UNDERLAY`](AGENT_PROMPT_CAPTURE_IMPORT_W04_UNDERLAY.md) | **✅** |
| W05 | [`W05_PLACEMENT`](AGENT_PROMPT_CAPTURE_IMPORT_W05_PLACEMENT.md) | **✅**（コード map 記載） |
| **W07** | [**`W07_GATE`**](AGENT_PROMPT_CAPTURE_IMPORT_W07_GATE.md) | **Deploy 前必須** — gate 未実装なら最優先 |
| W06 | [`W06_FRAME`](AGENT_PROMPT_CAPTURE_IMPORT_W06_FRAME.md) | 任意 · W07 後 |
| UAT | [`P1_UAT`](AGENT_PROMPT_CAPTURE_IMPORT_P1_UAT.md) | W07 merge 後 · 本番手動 |

**推奨 Deploy 順:** W05 merge → **W07 merge & deploy** → 本番 UAT →（必要なら）W06 → Phase 2 設計

---

## 座標の正本（全 Wave 共通）

| 層 | 正本 |
|----|------|
| **Homography ターゲット** | FIFA **105×68 m** · `src/presets/soccerPitch.ts` · `SOCCER_NORM` |
| **駒の world 座標** | `BoardDocument` の 0–1（`worldToPitch` / `pitchToWorld` · `src/canvas/drawBoard.ts`） |
| **画角・向き** | 取込 Phase 1 は **横フル `soccer` のみ**。縦 · ハーフ · バスケは **エラーまたは Later** |

Homography は **画像ピクセル → pitch 正規化 (0–1)** を返し、配置時に **既存 `pitchToWorld`** で world に載せる。座標系を新 invent しない。

---

## ハード境界（全 Wave 共通 · 破ったら不合格）

1. **非送信** — 画像をサーバに POST しない。外部 Vision API 禁止。
2. **OBS 非干渉** — メインスレッドを秒単位で凍結しない。重い処理は Worker · プロキシ解像度。
3. **非永続画像** — 大きな Bitmap を localStorage / IndexedDB に残さない。永続は **座標 JSON のみ**（確定後）。
4. **ドラフト** — 確定前に `scene.pieces` を上書きしない。
5. **サッカー横フルのみ** — 他競技・縦ピッチ対応を勝手に広げない。
6. **SUGUDASU ブランド非掲出** — sugudasu.com へのリンク・iframe 禁止。

---

## グローバル・ガードレール（Cursor Auto · 全 Wave）

**以下を破った PR は却下。各 Wave ファイルにも繰り返す。**

| # | 悪癖 | 正しい行動 |
|---|------|------------|
| G1 | **1 プロンプトで Phase 2 まで実装** | 当該 Wave の「含む／含まない」だけ |
| G2 | **OpenCV.js / TensorFlow / 新 heavy deps** | 純 TS + Canvas。deps 追加はユーザ承認が必要なので **追加しない** |
| G3 | **自動4点・線検出を P1 に混ぜる** | Phase 3 研究。P1 は手動4点のみ |
| G4 | **背番号 OCR · 顔 · 選手 DB** | Phase 2 付帯でも本線外。触らない |
| G5 | **画像を localStorage に save** | メモリ短命。確定後も下敷き PNG は scene に埋め込まない（Phase 1） |
| G6 | **必須ウィザード 5 ステップ** | ドロワー 1 入口 + オーバーレイ。スキップ可能 |
| G7 | **LP · How-to · docs 大量追加** | 各 Wave は **コード + 必要最小 i18n** のみ |
| G8 | **`if (locale === "ja")` レイアウト分岐** | `.cursor/rules/i18n-ui-guardrails.mdc` 遵守 |
| G9 | **drawBoard を 500 行コピペ** | 下敷きは **1 描画フック** + 小モジュール |
| G10 | **配信モード B のツール非表示を壊す** | 取込 UI は編集モード中心。配信は下敷き結果だけ見える |
| G11 | **勝手 commit / push** | 報告のみ |
| G12 | **「とりあえず動く」で tsc / i18n 省略** | 各 Wave の検証コマンド必須 |
| G13 | **縦ピッチ · Pitch View · 画角を「ついでに直す」** | 触らない |
| G14 | **scene 確定なしで pieces 書き換え** | ドラフト state → 明示確定 |
| G15 | **コマ抜きを BoardCanvas にベタ結合** | W06 まで分離。W01–05 では import 経路だけ |

---

## ゴールド UAT（W07 deploy 後 · [`P1_UAT`](AGENT_PROMPT_CAPTURE_IMPORT_P1_UAT.md)）

本番 `?captureImport=1` · DAZN 級スクショ:

1. `Ctrl+V` → 4点 → 下敷き目視 OK  
2. 手置き 11+1 · **1 分以内**参考  
3. 確定 → **駒のみ残る**（下敷き消える）· Undo  
4. OBS 窓キャプチャが取込中も落ちない

---

## 完了報告テンプレ（各 Wave）

- 触ったファイル一覧  
- 前 Wave からの接続点（型 · state 名）  
- チェックリスト結果  
- **意図的にやらなかったこと**（Phase 2 · 自動 · 動画 · 縦）  
- 次 Wave への引き継ぎ（未実装スタブがあれば明記）
