# 局面取込 Phase 1 — 要件 · 仕様 · 手順（別 Agent 用）

**英名:** Broadcast Capture Import · Image 4-point Calibration → Piece Placement  
**Backlog:** B-070  
**ステータス（2026-09-22）:** W01–W05 コア実装済 · W07 ゲート実装済 · **ギャップ埋め済**（object URL revoke · dragOver ゲート · draft ball Delete · i18n「W03」除去）· **一般公開前** · **次 = カオル本番 UAT**（[`P1_UAT`](AGENT_PROMPT_CAPTURE_IMPORT_P1_UAT.md)）  
**正本矛盾時の勝ち:** [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md)（境界 2026-09-22 · 局面取込 2026-08-30）  
**境界:** [`AGENT_PROMPT_PRODUCT_BOUNDARY.md`](AGENT_PROMPT_PRODUCT_BOUNDARY.md)  
**Wave 索引:** [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md)

このファイルをそのまま **別 Agent** に渡してよい。  
**実装の新規着手ではなく、完成度・ギャップ埋め・受け入れ・公開準備**が主務。ゼロから作り直さない。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

## 0. CPO / CMO / CTO 合議（固定）

### CPO（何を・誰に・なぜ今）

| 判断 | 内容 |
|------|------|
| **ジョブ** | 放送スクショ 1 枚から、ピッチ上に局面を再現して **説明する**。分析しない |
| **本線ユーザ** | Watchalong / VOD 解説者。シーク → キャプチャ → HT で配置・解説 |
| **本線にしない** | ライブ中の連打取込 · 自動戦術推定 · Tracking |
| **価値の芯** | **Human decides（4点＋誰を置く）→ ZB calculates（Homography＋座標）** |
| **優先** | マーケ用無制限ボードより **本機能**（ユーザ楔） |
| **公開** | 品質 UAT 通過まで **隠し機能のまま**。changelog / LP / How-to は公開決定まで書かない |

### CMO（言い方・見せ方）

| 判断 | 内容 |
|------|------|
| **コピー** | 「Import scene」「局面取込」。**AI 分析・自動戦術・トラッキング**とは言わない |
| **デモ** | DAZN 級 1 枚 → 4点 → 下敷き → 手置き → 確定で駒だけ残る、の 30 秒 |
| **公開前** | 一般 UI・`/updates`・LP に出さない。`?captureImport=1` を公式に宣伝しない |
| **公開後（Later）** | 「スクショからピッチへ」「手で合わせて置く」— Workstation 語彙を使わない |

### CTO（どう作る・守る）

| 判断 | 内容 |
|------|------|
| **既存コード正本** | `src/capture/*` · `captureImportGate.ts` · BoardCanvas / Drawer / useAppState 配線 |
| **新規 deps** | OpenCV / TF / Vision API **禁止**。純 TS + Canvas + Worker |
| **非送信** | 画像をサーバに送らない |
| **非永続画像** | Bitmap / object URL はメモリ短命。localStorage に画像を残さない。確定後の永続は **座標 JSON のみ** |
| **OBS** | メインスレッドを秒単位凍結しない。重い行列は Worker / プロキシ解像度 |
| **座標系** | Homography dst = FIFA 105×68 pitch norm。駒は既存 world 0–1。新座標系を invent しない |
| **スコープ** | Phase 1 = **サッカー横フルのみ**。縦 · ハーフ · 他競技は Later |

---

## 1. 要件（Requirements）

### 1.1 Must（Phase 1 受け入れ）

1. **入口（ゲート付き）**  
   - DEV: 常時利用可  
   - PROD: `?captureImport=1` または LS `zoneboard:v1:captureImportBeta` のみ  
   - ゲート OFF 時: 取込 UI · 画像 paste/drop · 進行中セッションが **存在しないのと同じ**

2. **入力**  
   - `Ctrl+V` 画像 · キャンバスへのドロップ  
   - サッカー **横フル** ボードのみ開始可。他はインライン拒否

3. **手動4点 Calibration**  
   - ユーザが画像上に TL/TR/BR/BL を置く  
   - 適用で Homography 成功 → 配置フェーズ  
   - 失敗はインラインエラー（適当な恒等行列で進めない）

4. **下敷き**  
   - Homography 後、ピッチ矩形にワープした半透明画像  
   - 不透明度調整可  
   - **確定後は消える**（scene に PNG 埋め込みなし）

5. **コマ配置**  
   - 下敷きを見ながらホーム / アウェイ / ボールを **手置き**（ゴースト）  
   - ドラッグ微調整 · Delete  
   - 確定前は `scene.pieces` を上書きしない（ドラフト分離）

6. **確定**  
   - 現局面へ反映 **または** 新局面  
   - Undo で戻せる  
   - 残るのは **駒（とボール）座標のみ**

7. **非機能**  
   - 非送信 · OBS 非干渉 · リロードで画像セッション消滅

### 1.2 Should（Phase 1 で望ましい）

- ゴチャつき全画面スクショでも手動4点で使える（任意 ROI / クロップがあれば尚）
- 手置き 11+1 が **おおよそ 1 分以内**（UAT 参考）
- i18n 全ロケールキー揃い · `test:i18n-chrome` 通過

### 1.3 Must not（Phase 1 禁止）

| 禁止 | 理由 |
|------|------|
| 自動4点 · 線検出 | Phase 3 |
| 自動駒 · OCR · 顔 · 選手 DB · 身元マジック | Phase 2 付帯でも本線外 |
| 連続トラッキング · 動画本線（W06 は任意別 Wave） | 境界外 / 別チケット |
| Timeline / Animation Editor | P3 |
| changelog / LP / How-to 告知 | 公開決定まで |
| サーバ Vision · 画像の永続保存 | 非送信 · 非永続 |
| UID / ログイン必須化 | プロダクト方針 |

### 1.4 ユーザフロー（正本）

```text
[ゲート ON]
  → 局面タブ「取込」or Ctrl+V / drop
  → phase: image
  → 「4点を合わせる」→ phase: calib（ハンドル TL/TR/BR/BL）
  → 「適用」→ Homography OK → phase: place（下敷き）
  → piece-home / piece-away / ball でゴースト配置
  → 「反映」（上書き or 新局面）
  → session 破棄 · 駒のみ残る
```

取消はいつでも session clear · tool 復帰。

---

## 2. 仕様（Specification）

### 2.1 モジュールマップ（触る前に Read）

| 領域 | パス |
|------|------|
| ゲート | `src/lib/captureImportGate.ts` |
| Homography | `src/capture/homography.ts` · `homographyAsync.ts` · `homographyWorker.ts` |
| セッション型 | `src/capture/session.ts` |
| 下敷き描画 | `src/capture/drawCaptureUnderlay.ts` |
| 4点 UI | `src/components/CaptureCalibOverlay.tsx` |
| 入口 · 確定 UI | `src/components/Drawer.tsx` |
| paste / drop · overlay マウント | `src/components/Editor.tsx` |
| 配置 pointer · 下敷き paint | `src/components/BoardCanvas.tsx` |
| state API | `src/hooks/useAppState.ts`（`startCaptureImport` · `applyCaptureHomography` · `addCaptureDraftPiece` · `applyCaptureToScene` · `clearCaptureImport` 等） |
| ゴースト描画 | `src/canvas/drawBoard.ts`（`draftPieces` / `draftBall`） |
| 対象ピッチ | `src/presets/soccerPitch.ts`（105×68 · `SOCCER_NORM`） |

詳細 Wave 履歴: W01–W05 / W07 各 `AGENT_PROMPT_CAPTURE_IMPORT_W*.md`

### 2.2 座標契約

| 層 | 正本 |
|----|------|
| Homography **dst4** | pitch norm: TL(0,0) TR(1,0) BR(1,1) BL(0,1) — ゴール左・タッチ上 |
| Homography **src4** | 画像ピクセル（順序は dst と対応） |
| 下敷き後のクリック | ピッチ上 norm → 既存 `pitchToWorld` → world 0–1。**逆 H は配置に不要**（ワープ済み前提） |
| 永続 | `scene.pieces` / ball の world 座標のみ |

### 2.3 セッション（永続しない）

`CaptureImportSession`（`session.ts`）:

- `phase`: idle | image | calib | place | confirm  
- `image`: object URL（clear で revoke）  
- `calibSrc4` · `homography`  
- `draftPieces` · `draftBall` · `selectedDraftPieceId`  
- `toolBeforePlace` · `underlayOpacity`

### 2.4 UI / i18n

- 4点 UI は **フルスクリーンオーバーレイ**（ドロワーに押し込めない）
- Short キーは chrome 用（i18n ガードレール）
- 配信モード（B）中は取込開始しない。確定済み局面の表示のみ

### 2.5 受け入れチェックリスト（Agent が埋める）

**ゲート**

- [ ] PROD 相当（または preview）で query/LS なし → 取込 UI・paste なし  
- [ ] `?captureImport=1` → 取込可 · LS 永続  
- [ ] LS 削除 → 再び不可  

**コア**

- [ ] 横フル soccer · Ctrl+V → calib → 適用 → 下敷き一致（目視）  
- [ ] ゴースト手置き · Delete · 反映で下敷き消滅 · 駒残存  
- [ ] 新局面チェックで scenes +1  
- [ ] Undo  
- [ ] 縦 / ハーフ / 非 soccer で開始拒否  

**非機能**

- [ ] ネットワークタブに画像アップロードなし  
- [ ] `tsc --noEmit` · `npm run test:i18n-chrome`  
- [ ] localStorage に巨大画像なし  

**やらない確認**

- [ ] 自動駒 · OCR · changelog 未追加  

---

## 3. 手順（別 Agent の実行順）

### Step 0 — 境界ゲート（チャットに4行）

1. Idea→Explanation を速くするか？ → **Yes（座標変換の摩擦削減）**  
2. Game→Analysis か？ → **No**  
3. Workstation 化しないか？ → **手動4点・手置きを崩さない**  
4. 優先帯 → **P0 Core（B-070）**

### Step 1 — 監査（実装し直さない）

1. 上表モジュールを Read / 動作確認（`npm run dev` · 横フル soccer）  
2. Wave 索引の「✅」と実コードの差分を列挙（欠け · バグ · 文言の W03 残り等）  
3. **ギャップ一覧**を先に報告。ユーザ確認なしで大規模リライトしない  

### Step 2 — ギャップ埋めのみ

優先順:

1. ゲート穴（UI 隠れても paste が生きている等）→ W07 契約  
2. フロー破損（calib 失敗時 · clear · tool 復帰）  
3. 下敷き / 配置の座標ずれ  
4. i18n · a11y の最小修正  
5. **W06 コマ抜きは触らない**（別チケット・任意）  

各修正は最小 diff。Homography 数式の「ついで書き直し」禁止。

### Step 3 — ローカル受け入れ

```bash
npx tsc --noEmit
npm run test:i18n-chrome
# 手動: ?captureImport=1 相当（DEV は常時 ON）で §2.5
```

### Step 4 — 報告（実装 Agent）

- 触ったファイル  
- ギャップ → 対応 / 未対応  
- §2.5 チェック結果  
- 意図的にやらなかったこと（Phase 2 · W06 · 公開告知）  
- カオル向け: 本番 UAT は [`AGENT_PROMPT_CAPTURE_IMPORT_P1_UAT.md`](AGENT_PROMPT_CAPTURE_IMPORT_P1_UAT.md)

### Step 5 — 人間（カオル）· Agent はコードを書かない

1. Deploy（ゲート付き）  
2. [`P1_UAT`](AGENT_PROMPT_CAPTURE_IMPORT_P1_UAT.md) を本番で実行  
3. 公開可否を CPO が判断 → その時点で changelog / How-to  

---

## 4. 成果物の定義（Done）

| Done | 未 Done |
|------|---------|
| 隠しゲート下で §1.1 Must を満たす | 一般公開・告知 |
| 監査ギャップがチケット化 or 修正済 | Phase 2 自動駒 |
| UAT 手順がカオル実行可能 | 縦ピッチキャリブ |
| 境界・非送信を破っていない | 無制限ボード特権・UID |

---

## 5. 参照（深掘り時のみ）

| 文書 | 用途 |
|------|------|
| [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) | 方針 · やらない |
| [`BROADCAST_CAPTURE_IMPORT_RESEARCH.md`](BROADCAST_CAPTURE_IMPORT_RESEARCH.md) | 調査根拠 |
| [`AGENT_PROMPT_CAPTURE_IMPORT.md`](AGENT_PROMPT_CAPTURE_IMPORT.md) | Wave 索引 · G1–G17 |
| W01–W05 · W07 各ファイル | 歴史的実装契約 |
| [`AGENT_PROMPT_CAPTURE_IMPORT_P1_UAT.md`](AGENT_PROMPT_CAPTURE_IMPORT_P1_UAT.md) | 本番手動 UAT |

---

## 6. コピペ用 — 別 Agent への渡し文

```text
docs/CAPTURE_IMPORT_P1_REQUIREMENTS.md を正本に、局面取込 Phase 1
（4点キャリブレーション＆コマ配置）を進めて。

- ゼロから作り直さない。既存 src/capture とゲートを監査し、ギャップだけ埋める。
- PRODUCT_NOTE 境界（Explanation Canvas）と AGENT_PROMPT_PRODUCT_BOUNDARY を先に読む。
- Phase 2（自動駒・OCR）・W06・changelog はしない。
- コミットは頼むまでしない。日本語で報告。
```
