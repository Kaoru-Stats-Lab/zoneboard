# 配信者 PC / モニター構成 — Deep Research

**更新:** 2026-08-30  
**プロンプト:** [`AGENT_PROMPT_STREAMER_RIG_RESEARCH.md`](AGENT_PROMPT_STREAMER_RIG_RESEARCH.md)  
**利用先:** B-070 局面取込のハード境界 · [`BROADCAST_CAPTURE_IMPORT_RESEARCH.md`](BROADCAST_CAPTURE_IMPORT_RESEARCH.md) §3e · [`SPORTS_SCOPE.md`](SPORTS_SCOPE.md)

---

## エグゼクティブサマリ

**スポーツ watchalong / 戦術解説の机は、eSports・3D ゲーム実況の机と同じではない。** 前者は GPU 余力があり、**RAM（Chrome 多重 + OBS）がボトルネック**。ZB の設計標的は **帯 B（Standard · RAM 16GB · Single PC · 2画面）**。帯 C（8GB / 1画面）では自動 AI 抽出を制限。公式全数調査は無く、Single/Dual 比率は **proxy 推定**（確信度: 低〜中）。

**旧 §3e の帯ラベル（A=下限 16GB）は本調査で廃止。** 新定義: **A=Pro · B=Standard（下限標的）· C=Budget**。

---

## 1. データの性質

### 1a 定量調査の有無

配信者全体の Single/Dual PC · RAM · モニター枚数の **公式全数調査は未確認（実質なし）**。

### 1b 使える proxy とバイアス

| Proxy | 使える点 | バイアス |
|-------|----------|----------|
| Twitch/YouTube · OBS コミュニティの機材議論 | 1PC vs 2PC の空気感 | ゲーム実況に偏る |
| Dual-PC / 単一PC ガイド（2023–2026） | NVENC 後は単一PC主流の論拠 | スポーツ解説を対象にしていない |
| モニター構成ブログ | 2画面推奨の実務 | 販売・アフィ寄り |
| OBS 推奨スペック | エンコード下限の目安 | ブラウザ多重を織り込ない |
| 有名 VTuber / プロの機材公開 | 上限の存在証明 | **中央値ではない** |

本レポートの Dual 20–30% / Single 70–80%（ゲーム）および watchalong Single 90%+ は **proxy 推定**。一次ソースのセンサスではない。

---

## 2. 机と負荷構造の差

| 項目 | eSports / 3D ゲーム実況 | スポーツ Watchalong / 戦術解説 |
|------|-------------------------|--------------------------------|
| **負荷の主因** | ローカル 3D（144–240fps）+ OBS エンコード | 映像受信（DAZN/YouTube/キャプチャ）+ **ブラウザ多重** + OBS |
| **GPU / VRAM** | 高占有（ゲーム） | 相対的に余裕（ブラウザ + NVENC 程度） |
| **RAM の主因** | ゲーム本体 | Chrome 多重（映像 · Stats · X · Discord · **ZB**） |
| **PC 構成（推定）** | Dual 20–30% / Single 70–80% | **Single 90%+** / Dual 10%未満 |
| **モニター** | 2–3（メイン高Hz ゲーム · サブ OBS/Chat） | **2画面が標準**（映像/ZB · OBS/Chat/Stat） |

**含意:** 局面取込の危険は「GPU が足りない」より **16GB でタブ + OBS + デコード/検出がぶつかる**こと。

---

## 3. 競技別の机と ZB 展開

| 競技 | 机・テンポ | 局面取込との関係 | ZB 展開の視点 |
|------|------------|------------------|---------------|
| サッカー / フットサル（基準） | 90分連続。**ライブ中の即配置は稀**（シーンが変わる）。本線は **シーク複数キャプチャ → HT で配置・解説** | **静的 1フレーム × 複数枚**。コマ抜き需要大。ポーズ UI が精度を落とす | B-070 の主ジョブ（HT / VOD） |
| **バスケ（NBA / B.League）** | 攻守 14–24 秒。iPad + タッチペン即描画が多い | 配信中の画像取込より **ATO / フォーメ切替 ≤1秒** が先 | テンプレ・局面スイッチ優先。取込は副 |
| **バレー** | ローテ Position 1–6 など定型配置 | 6人定形は **検出精度を出しやすい** | 取込の精度パイロット向き |
| **eSports（MOBA / FPS）** | ゲーム実況机に近い | カスタムマップ画像の要求が強い | [`SPORTS_SCOPE.md`](SPORTS_SCOPE.md) Later。ハード境界はゲーム実況帯を別途 |

---

## 4. スペック帯の改訂（決定用）

| 帯 | 層 | スペック目安 | モニター · 机 | 局面取込の挙動 |
|----|-----|--------------|---------------|----------------|
| **A · Pro Desk** | 専業アナリスト · 大手 watchalong | Single/Dual · **RAM 32–64GB** · RTX 3070 / 4070 級+ | 3画面 or UW+サブ。常時全体表示 | Homography + AI 抽出を **約1秒**でも配信影響を狙える（目標） |
| **B · Standard Desk** | **一般スポーツ配信 · 個人解説（下限標的）** | **Single** · **RAM 16GB** · i5 / Ryzen 5 · GTX 1660 / RTX 3060 級 | **2×1080p60** or ノート+外付け1 | 空き RAM わずか。重いブラウザ処理で **OBS 落ちリスク**。ルール §5 必須 |
| **C · Budget Desk** | モバイル / テキスト寄り | M1/M2 · 一般ノート · **RAM 8GB** · iGPU | **1画面**（Alt+Tab / 分割） | **自動 AI 抽出は制限**。手動 4点（Phase 1）中心 |

### 旧 §3e との対応

| 旧（仮） | 新 |
|----------|-----|
| 旧 A（設計下限 16GB） | **新 B** |
| 旧 B（主ペルソナ dGPU） | 新 B〜A のあいだ（明確化） |
| 旧 C（余裕 32GB+） | **新 A** に近い |
| （なし） | **新 C** = 8GB / 1画面を明示し、自動抽出を制限 |

**北極星:** 新 **帯 B** で配信が死なない。新 A 向けに重い処理を本線化しない。新 C で自動抽出をデフォルト ON にしない。

---

## 5. 配信中コマ抜き — 4 ルール（帯 B 前提）

1. **Web Worker 絶対化** — Homography · 画素解析はメインスレッドから外す。ボード描画 / 駒操作を凍らせない。  
2. **ダウンスケール・プロキシ** — 1080p/4K 生フレームをそのまま推論に入れない。**640×640 または 720p 相当**に落として計算し、相対座標だけをボードへ戻す。  
3. **オンメモリ・短命** — 一時 Canvas / Blob は計算後すぐ破棄。大きな画像を localStorage / IDB に残さない。永続は **座標 JSON（数 KB）**。占有目標 **≤200MB 級**（目安）。  
4. **非同期ドラフト（約 3 秒 UX）** — 押下直後は「解析中」。トーク継続可。数秒後にゴースト駒 → 微調整 → 確定。

エスカレーション（帯 B でも落ちる / 帯 C）: 別タブ · 配信前のみ · AI OFF（Phase 1 のみ）。サーバ処理は最終手段（非送信と衝突）。

---

## 6. 一次調査（ヒアリング項目）

### PC · モニター

- 配信は PC 1台か 2台か。  
- 画面は何枚か。何をどの画面に置いているか（試合 / OBS / チャット / ボード）。

### メモリ · ブラウザ

- 配信中のブラウザタブ数（映像 · X · Stats · Discord 等）。  
- 配信中に重いページでカクついた経験の有無。

### 局面ワークフロー

- 失点等の説明を今どうしているか（手置き / 口頭 / スクショ）。  
- 「スクショ → 約3秒で駒が並ぶ」を **配信中**に使いたいか、**配信前準備**か。

---

## 7. 他スポーツ展開への含意

- **サカ基準の帯 B** を全球スポーツ解説の下限にしてよい（机が watchalong 型である限り）。  
- **バスケ**は取込より **局面/テンプレ切替速度**を先に見る（B-070 と並行で Scenes UX）。  
- **バレー**は取込精度の検証競技に向く。  
- **eSports** はマップ差し替え + **ゲーム実況帯の別ハード境界**が必要（本調査の帯 B をそのまま当てない）。

---

## 8. 推奨決定（B-070 / B-071）

| 項目 | 内容 |
|------|------|
| **Verdict** | 帯定義を本表に **更新**。B-071 完了（Web 調査）。一次ヒアリングは任意フォロー |
| **設計標的** | **帯 B（16GB · Single · 2画面）** |
| **帯 C** | 自動抽出デフォルト制限 · Phase 1 手動優先 |
| **確信度** | 机の質的差: **高** · ％分布: **低〜中（proxy）** |

---

## 9. 参照 URL

- https://www.cclonline.com/article/5156/blog/cclonline/the-ultimate-guide-to-dual-pc-streaming-why-twitch-streamers-use-two-pcs/
- https://www.pcworld.com/article/399223/how-to-set-up-a-dual-pc-stream-for-twitch-or-youtube.html
- https://www.nearstream.us/blog/single-vs-dual-pc-capture-card-streaming-pro
- https://staged.gg/blog/single-monitor-streaming-setup-obs
- https://us.ktcplay.com/blogs/desk-setups/dual-monitor-topologies-twitch-youtube-creators
- https://obs-studio-app.github.io/obs-studio-system-requirements-windows.html
- https://labs.moongy.group/articles/real-time-player-tracking-and-2d-field-mapping-using-homography-for-football-analytics
- https://medium.com/@rod_alenton/the-art-of-perspective-applying-homography-to-the-soccer-world-cup-ed2cf92e47a

---

## 10. 未確認

- Single/Dual · RAM 分布の **一次センサス**（地域別 · スポーツ限定）。  
- 日本のスポーツ実況者に特化したモニター枚数。  
- 帯 B 実機での Worker + 720p プロキシの **OBS 同時エンコード実測**。  
- バスケ配信者の「iPad 即描画」比率（取込需要の上限）。
