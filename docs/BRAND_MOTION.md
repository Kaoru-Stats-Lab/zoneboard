# Brand motion — ログ

ZoneBoard ロゴスティング（マーク / ロックアップ）の**使い方・背景・意図**を記録する。実装・書き出しの正本は [`public/brand/motion/`](../public/brand/motion/)。静的ブランドルールは [`STUDIO.md`](STUDIO.md)。

---

## デザインの背景

### なぜモーションが必要か

- 配信者が Clipchamp 等で **ウィンドウキャプチャした戦術ボード映像** の末尾に、短いブランドカードを載せたい需要がある。
- 静止 PNG だけでは「試合後の締め」として弱く、**記号がどう組み立てられるか**（2×3 格子・ゾーン線・first-marker）が伝わりにくい。
- SVG は既に [`src/brand/mark.ts`](../src/brand/mark.ts) で生成されている。**ラスタトレースではなく、ベクタを motion-ready 構造に分割**して振り付けする方針。

### プロダクト上の制約（載せない場所）

| 場所 | 方針 |
|---|---|
| **Broadcast / ピッチ上** | 載せない。解説・試合音声と競合する |
| **配信中の chrome** | 載せない（[`PRODUCT_NOTE.md`](PRODUCT_NOTE.md)、[`OBS.md`](OBS.md)） |
| **サウンドロジ** | 今回なし。将来 Native スプラッシュ以外は棚上げ |

モーションは **「試合後・収録後の VOD エンドカード」** に閉じる。ライブ中のブランド演出ではない。

### Sports signal との関係

[`STUDIO.md`](STUDIO.md) §1 Sports signal: ブランド MP4 は **Sports感の主力にしない**。  
LP では After 帯の **HTML/CSS ロックアップ 1-shot**（スクロールイン／Replay）。ヒーロー・Parallax は使わない。  
MP4 は Clipchamp 等の書き出しマスター。  
LP 全体の「サッカーの気配」は **ピッチデモの動き・局面切替・試合後の時間軸** で担う。

### 制作パイプライン

- ワークフロー参考: [Pixel2Motion](https://github.com/nolangz/pixel2motion)（ベクタ → CSS 振り付け → 書き出し）。
- ベクタフィットはスキップ（既存 SVG が正本）。
- 書き出し: `npm run brand:motion` → [`scripts/export-brand-motion.py`](../scripts/export-brand-motion.py)
- 詳細ファイル一覧: [`public/brand/motion/OUTPUTS.md`](../public/brand/motion/OUTPUTS.md)

---

## デザイン意図

### 性格（3語）

**precise / composed / intentional**

- スタジアム CM やバウンス多用の「スポーツアプリ感」は避ける。
- Trustworthy / Professional 寄りのタイミング。派手さより **因果の読める段階性**。

### 記号のストーリー（マーク）

マークは「戦術ボード上のマーカー格子＋ゾーン線＋ first-marker（真鍮）」の物語。

| 順序 | 要素 | 意図 |
|---|---|---|
| 1 | プレート待機 | 落ち着いた anticipation。全体バウンスなし |
| 2 | アイボリードット（読み順） | 2×3 格子が **意図的に** 置かれる |
| 3 | ビート | 斜線が「並行ノイズ」ではなく **結果** として読まれる |
| 4 | 斜線ドローオン | ゾーン／パスの接続 |
| 5 | 真鍮 `#c4a24a` ラスト | first-marker。opacity フェードは使わず **色を濁らせない**（暗地で茶褐色化するため hard-cut） |

### ロックアップの追加意図

- **知らない視聴者** は記号だけでは製品名が残らない → **マーク完成後に「ZoneBoard」ワードマーク**（LTR ワイプ、抑制的）。
- ストーリー: **記号 → 名称**。タイプライター・過度なフェードは使わない（[`STUDIO.md`](STUDIO.md): 字に金は塗らない）。

### マーク単体 vs ロックアップ

| 版 | 尺 | 役割 |
|---|---|---|
| **ロックアップ** | ~3.0s | **既定**。Discovery / VOD エンド |
| **マーク単体** | ~2.4s | 既知視聴者・短尺・正方形向け |

同一のドット／斜線／真鍮振り付けを共有し、ロックアップだけワードマーク段を追加。

### ビジュアルトークン

| 要素 | 値 |
|---|---|
| ステージ背景 | `#0c0d0e`（studio） |
| プレート | `#141516` + 細い縁 `#1c1d1f`（暗地でマークが埋もれない） |
| インク | `#f3f3f1`（ivory） |
| アクセント | `#c4a24a`（brass — first-marker のみ） |

### ピアレビューと確定版（2026-08）

外部 AI レビューを複数回実施。

- **マーク v4**: 斜線遅延・真鍮色忠実度・静かな定着 → **出荷可（Yes）**
- **ロックアップ**: 記号→名称の順序・3s 尺・16x9/1x1 一貫性 → **出荷可（Yes）**
- 任意の微調整（真鍮→ワード間隔、ホールド末フェード）は **現状触らない**。Clipchamp 実運用で違和感が出たときだけ。

---

## 使い方（MECE）

用途を **4 面** に分け、ファイルを混ぜない。

| ID | Surface | 何をする | 使うファイル |
|---|---|---|---|
| **A** | Standalone sting | 映像の**後**に画面を埋める | 下表「既定」 |
| **B** | Composite overlay | 映像の**上**に透明マーク | `exports/B/sting-clear-1x1.gif` 等 |
| **C** | Product / QA | ライブ HTML・タイミング確認 | `logo_motion.html`, `motion.css` |
| **D** | Reference | QA ストリップ（出荷しない） | `outputs/motion_strip.png` |
| **LP After** | ワークフロー例 | Sports signal — HTML/CSS 1-shot | `LpEndCardDemo` |

### Surface A — どれを使うか

| シナリオ | ファイル |
|---|---|
| **Clipchamp / YouTube 横長（既定）** | `exports/A/sting-lockup-plate-16x9.mp4` |
| 正方形タイムライン | `exports/A/sting-lockup-plate-1x1.mp4` |
| 視聴者が既にブランドを知っている・短く | `exports/A/sting-plate-1x1.mp4` または `sting-plate-16x9.mp4` |
| 静止ポスター / サムネ | `exports/A/final-lockup-plate-16x9.png` 等 |

### Clipchamp 手順

1. ボードのウィンドウキャプチャクリップを末尾まで編集する。
2. **`sting-lockup-plate-16x9.mp4`** を約 3 秒差し込む（クロスフェード可）。
3. 既知視聴者向け短尺: マーク単体 `sting-plate-1x1.mp4`（~2.4s）。
4. 収録映像の**最後 1 秒に重ねたい**場合のみ **B**（透明）。ロックアップは重ね用ではない。

### ループ・音

- **1 回再生 + ホールド** → エディタでカット。シームレスループではない。
- **音なし**。配信音声・BGMと衝突するため。

---

## ファイルマップ

```
public/brand/motion/
├── logo.svg              # マーク motion-ready SVG
├── logo-lockup.svg       # 横ロックアップ SVG
├── motion.css            # マーク振り付け（v4）
├── motion-lockup.css     # ロックアップ（+ ワードワイプ）
├── motion_spec.md        # 振り付け数値・ピアレビュー履歴
├── OUTPUTS.md            # MECE + ファイル一覧（運用向け短版）
├── logo_motion.html      # マーク showcase（C）
└── exports/
    ├── A/                # プレート付きスティング（出荷物）
    └── B/                # 透明オーバーレイ
```

再生成:

```bash
npm run brand:motion
```

---

## 関連

- 静的ロゴ・ロックアップ: [`STUDIO.md`](STUDIO.md)、[`public/brand/`](../public/brand/)
- アニメツール向けフラット SVG: [`public/brand/exports/`](../public/brand/exports/)
- 製品方針（Broadcast 無広告等）: [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md)
