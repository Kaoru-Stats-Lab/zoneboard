# 浮き球・クロス「山なり」軌道 — Deep Research

**更新:** 2026-08-30  
**プロンプト:** [`AGENT_PROMPT_LOFTED_BALL_PATH.md`](AGENT_PROMPT_LOFTED_BALL_PATH.md)  
**決定:** **v1 やらない** — 現状のパス（破線・自由曲線）維持。Later は描き心地（スムージング）のみ。

---

## エグゼクティブサマリ

**推奨: v1 では山なり（3D 放物線）専用 UI を入れない。** 浮き球・クロス・ロングは **曲線の破線矢印** が世界共通の 2D 図式。OBS 配信では 1 ストロークの速さが楔。最大リスクは、立体アーチが真上視点で **着地点を曖昧** にし、720p/1080p エンコードで **細線が潰れる** こと。

---

## 1. 誰のどんな場面か

| ペルソナ | 場面 | Must? | 現状の回避策 |
|----------|------|-------|----------------|
| **OBS 配信者（Watchalong）** | アーリークロス · CK · セットプレー | **No** | パス破線を曲線で 1 ストローク。口頭で「浮き球」 |
| **コーチ・指導者** | ドリル図 · 教材 | **No** | UEFA / FA / US Soccer / DFB 規格どおり **曲線破線** |
| **CK・クロス解説** | 着地点の明示 | **落地点優先** | 2D 山なりは頂点と着地点の座標が視覚的にズレやすい |

配信者が求めるのは「山なりボタン」ではなく **サッと曲線を引ける速さ**。トグル切替はテンポを落とす。

---

## 2. 業界の図式

### 2a 欧米コーチング記号

| 記号 | 意味 |
|------|------|
| 破線矢印 | パス |
| **曲線の破線矢印** | 浮き球 · ロブ · クロス · カーブパス |
| 実線矢印 | ラン |
| 波線矢印 | ドリブル |

**2D 図解に「山なり立体線」という独立記号はない。** 3D 的表現は 2D では曲線破線に統合される。

参考: [Soccer drill diagram symbols](https://hobbit.football/tools/soccer-drill-diagram-symbols-explained) · [Coaching American Soccer — diagramming](https://coachingamerisonsoccer.com/tactics-and-teamwork/soccer-diagramming/)

### 2b 放送・解説オーバーレイ

| 媒体 | 山なり / アーチ |
|------|------------------|
| **Piero / Vizrt 等（実写 AR）** | 3D アーチあり — **映像の奥行きに合わせる** |
| **Sky Sports 等 2D タッチパネル** | **フラットな 2D ベジェ曲線** |
| **KlipDraw / Piero（ビデオ解析）** | 3D — **2D キャンバスツールとは別ジャンル** |

ZB は 2D 真上視点 · OBS 窓キャプチャ。Piero 型 3D はスコープ外。

### 2c 日本語圏

Twitter 戦術クラスタ · note · YouTube 解説（Footballista / Number 等）の 2D 図解でも、クロス・ロングは **カーブした破線矢印** が主流。山なり立体線の文化は薄い。

### 2d 競合

| 製品 | path / loft / curve |
|------|---------------------|
| **TACTICALista** | 山なり専用線種なし。パス破線 + コントロールポイントで 2D ベジェ |
| **TacticalPad** | 2D = 曲線破線。3D モードのみ立体パス |
| **Excalidraw / Miro** | 汎用 2D ベジェ矢印 |
| **The Tactics App 等** | アニメ · path 点線 — **教材 MP4 席**（[`COMPETITIVE_LP.md`](COMPETITIVE_LP.md) §0d） |

---

## 3. 設計案の比較

| 案 | 概要 | コスト | OBS 読みやすさ | 判定 |
|----|------|--------|----------------|------|
| **0. 現状維持** | パス破線 + 自由曲線 | ゼロ | ◎ 太め破線は圧縮に強い | **v1 推奨** |
| **1. Pass 修飾アーチ** | Pass 時に Arc トグル | 低 | △ トグルでテンポ低下 | 見送り |
| **2. 新線種 Loft/Cross** | ツールレールに「浮き球」 | 中 | △ パスとの混乱 | 見送り |
| **3. 描画後ベジェ編集** | 中間ハンドルで曲げ | 中 | △ 2 度手間 | **Later 検討** |
| **4. 3D 放物線** | 疑似立体アーチ | 高 | × 着地点不明 · モアレ | **不可** |

**ツールレール:** 言葉のまま（パス / ラン …）。icon 化 · 線種増は楔（無学習 · 速さ）と衝突。

---

## 4. 視認性メモ（芝生 · OBS）

- **720p / 1080p · NVENC / x264:** 細い疑似 3D 放物線 · 二重線影付きアーチは **輪郭が潰れる · モアレ** の原因になりやすい。
- **最適:** 芝 `#1a5c2e` 上で **3–4px 程度の単色破線曲線**（ZB 既存パス色 · 影のみ）。フラット 2D なら圧縮後も視認性を維持。

---

## 5. 推奨決定

| 項目 | 内容 |
|------|------|
| **Verdict** | **v1 やらない** |
| **v1 でやること** | 現状のパス（破線 + `smoothLinePath`）を維持。ヒントで「クロス・浮き球含む」を明示（B-058 済） |
| **Later（条件付き）** | 新線種・山なりトグルは **入れない**。Pass 引き後の **スムージング改善** · **軽量カーブ微調整 UX** のみ検討（B-061） |
| **やらない** | 3D 放物線 · `loft` 線種 · ツールレール肥大 · Piero 型 AR · フレームアニメ path |

**理由（3点）**

1. **世界標準:** 2D では曲線破線 = 浮き球/クロス。別 UI 不要。
2. **楔:** 「開いて 3 秒」— トグル · 新ツールは学習コスト。
3. **配信実用:** ライブ中のモード切替より **1 ストローク曲線** が速い。

**B-059（`shot` 線種）との関係:** 本調査は **立体山なり** を却下。Shot を Pass から分離する件は **別論点**（ゴール向け軌道の意味分離）。山なり UI なしでも B-059 は独立に Later 検討可。

---

## 6. 成功指標 · UAT（Later が Pass UX 改善に入る場合）

- [ ] CK 局面でクロス軌道を **30 秒以内** · **追加トグルなし** で引ける
- [ ] 720p OBS キャプチャで曲線破線が **1 フレーム以上くっきり** 読める
- [ ] パス / ラン / リンクと **色・線種で混同しない**（既存 ink 規約）

---

## 7. 参照 URL

- https://coachingamerisonsoccer.com/tactics-and-teamwork/soccer-diagramming/
- https://hobbit.football/tools/soccer-drill-diagram-symbols-explained
- https://en.wikipedia.org/wiki/Association_football_tactics
- https://www.soccercoachlab.com/soccer-drills-tags/passes
- https://elitesoccercoaching.net/attacking/crossing-and-scoring-areas

---

## 8. 未確認 · 追加調査

- JFA 公認教材の **公式記号表 PDF**（一次ソース）は未照合。ブログ・コーチサイトの記述と一致。
- Sky Sports MNF タッチパネルの **静止キャプチャ** は未添付。業界常識として 2D ベジェと記載。
- TACTICALista の操作 UI は [`COMPETITIVE_LP.md`](COMPETITIVE_LP.md) 録画ベース。2026 版 UI 差分は未再確認。
