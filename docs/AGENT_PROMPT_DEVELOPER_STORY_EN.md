# プロンプト — 開発者ストーリー英語版の推敲（About 掲載用）

このファイルをそのまま別 Agent に渡してよい。  
**入力正本:** [`DEVELOPER_STORY.md`](DEVELOPER_STORY.md) の「英語版（決定稿）」節 · 背景は [`DEVELOPER_STORY_DECIDED_JA.md`](DEVELOPER_STORY_DECIDED_JA.md)  
**掲載先候補:** [`public/about/index.html`](../public/about/index.html) に新セクション追加、または `/about/story/` 相当の長文ページ

日本語で報告する。コミットはユーザが頼むまでしない。

---

## 現状判断（2026-08-29）

**結論: 英語版はそのまま ZB サイトに掲載するには早い。推敲が必要。**

| 観点 | 現状ドラフト | About サイト要件 |
|------|--------------|------------------|
| **声** | 一人称エッセイ（note 向け） | 既存 About は **製品説明が主**、開発者の声は **短く具体的** |
| **語彙** | `learning cost` · `heat of the explanation` · `at the press of a button` | 正本は `broadcast mode` · `press B` · `tools hide` · `capture the window` |
| **長さ** | 約 600 語 · 1 ブロック | About 埋め込みは **250–350 語** が目安（全文は別 URL） |
| **構成** | 見出しなし · タイトル案が未確定 | `<h2 id="...">` 付き · meta description 用 1 文 |
| **トーン** | 「I received a great deal from football」等、やや文学調 | ESL-first · 短句 · 比喩控えめ（[`AGENT_PROMPT_HOWTO_COPY.md`](AGENT_PROMPT_HOWTO_COPY.md) と同系） |
| **事実** | 2026 W杯 · Google Slides · 未経験 · Under control の芯 | **維持**（改変禁止） |
| **en-GB** | `analysing` 等 UK 混在 | サイトは `lang="en-GB"` — **UK スペル統一** |

### ドラフトで特に直すフレーズ

| 現状 | 問題 | 方向 |
|------|------|------|
| learning cost | 英語として不自然 | *no training* / *no manual* / *you do not need a tutorial* |
| the heat of the explanation | 抽象 · 翻訳調 | *your energy on stream* / *what you are trying to show* |
| at the press of a button | 汎用 PR 文 | *press B* / *broadcast mode*（製品正本に合わせる） |
| That moment landed hard | 口語だが About と温度差 | 短く: *I could not unsee it.* / *That was the line.* |
| present in almost every chapter of my life | AI エッセイ定型 | 具体 1 つに置換（night bus / Juninho / monk） |
| digital products · market this large | ビジネス視点が長い | 1 文に圧縮。動機の **転換点**（Slides 事件）を前に |

---

## 推敲のゴール

**2 成果物**を出す（両方 Markdown。HTML 化は別タスク）。

### A) About 埋め込み版（必須 · ~250–350 words）

- 既存 About の `<article>` 末尾、または `Who operates the site` の **直前**に置く想定
- 見出し案: `Why I built it` / `Why ZoneBoard exists`
- 構成:
  1. **Hook** — 未経験ファン · 語る人を支えたい（2 文）
  2. **Turn** — 2026 配信で Google Slides（4–5 文 · **ここが核心**）
  3. **Stance** — プレイヤーでも解説者でもない → 渡せるものを作った（2–3 文）
  4. **Product tie-in** — 1 文だけ（broadcast mode · 学習不要 · pitch first）
- **書かない:** JFA · 2011 詳細 · なでしこ · イスタンブール · Number 誌

### B) フルストーリー版（任意 · ~500–700 words）

- outreach · Press kit · 将来の `/about/story/` 用
- 現ドラフトをベースに、上記語彙・トーンルールを適用
- 2011 · 旅 · futsal · monk 等は **短い場面**として残してよい
- 末尾の製品宣伝は **2 文以内**

---

## 読め（矛盾したら上から優先）

1. 英語ドラフト: [`DEVELOPER_STORY.md`](DEVELOPER_STORY.md) §英語版（決定稿）
2. 既存 About の声: [`public/about/index.html`](../public/about/index.html)
3. 製品トーン: [`docs/UI_UX.md`](UI_UX.md) §2–§2-3（軽い · 速い · ウィザードなし）
4. ESL 英語ルール: [`docs/AGENT_PROMPT_HOWTO_COPY.md`](AGENT_PROMPT_HOWTO_COPY.md) §英語のルール
5. 動機の事実: [`docs/PRODUCT_NOTE.md`](PRODUCT_NOTE.md) §0
6. EU 向け方針: [`DEVELOPER_STORY.md`](DEVELOPER_STORY.md) §ヨーロッパ向け調整メモ

---

## 英語のルール（About · ESL-first · en-GB）

### 読者像

- **主:** EU/UK のサッカー配信者 · 戦術系クリエイター（英語第二言語含む）
- **副:** コーチ · アナリスト · ジャーナリスト（Slides / PowerPoint で戦術を説明した経験あり）
- **不要:** 文学賞向け散文 · 日本サッカー史の詳説

### 文体

- **短い文。** 平均 12–18 語。1 文 1 アイデア。
- **能動態。** Passive の連続を避ける。
- **一人称 I** — About の他セクション（三人称）との差は **見出しで区切る**。
- **UK スペル:** analyse → analysing, colour 不要なら省略, centre/behaviour は必要時のみ。
- **football**（サイト正本）。soccer は使わない。

### 避ける語・構文

| 避ける | 使う |
|--------|------|
| learning cost | no training / no tutorial needed |
| heat of the explanation | your stream energy / what viewers came to see |
| at the press of a button | press **B** / enter broadcast mode |
| chrome（本文） | tools / menus / panels |
| passion/passionate の乱用 | care about / know the game |
| revolutionary / innovative | （使わない） |
| This is not a claim that… | 短く: *Better tools will not fix football. They can fix this one job.* |
| X is the result: | 最終文は *That is ZoneBoard.* 程度に |

### 製品語彙（ZB 正本 — 新造語禁止）

| 使う | 使わない |
|------|----------|
| broadcast mode (**B**) | on-air mode |
| tools hide | UI disappears |
| tactics board | coaching suite |
| place players · draw passes/runs | configure tokens |
| capture the window (OBS) | output the canvas |
| scenes | tabs / boards |

### 事実を変えない

- 本人は **ピッチ未経験**（子供時代も含め正式試合なし）
- きっかけは **2026 北中米 W杯 シーズン**の **ライブ配信**で、**有名記者（実名なし）** が **Google Slides** で戦術説明
- 反応は **This is not good enough** 相当（口語でよい）
- スタンス: プレイヤーでも解説者でもない → **Under control** · **hand something to others**
- **Associations / pathways** は個人では変えられない — 但し **JFA · 宮本** 等の固有名は **英語版に入れない**
- ZoneBoard: 開いて · 学習不要 · 数秒で綺麗な画面 · 配信向け

---

## タイトル · meta

About 埋め込み版には **H1 を増やさない**（既存 `About ZoneBoard` を維持）。

| 用途 | 案 |
|------|-----|
| **H2（About 内）** | Why I built it *(推奨)* / Why ZoneBoard exists |
| **長文ページ H1** | I never played the game. I built a board for people who explain it. |
| **og:description 用 1 文** | A lifelong fan who never kicked a ball built ZoneBoard after watching a journalist fight Google Slides on a World Cup stream. |

---

## 作業手順

1. [`DEVELOPER_STORY.md`](DEVELOPER_STORY.md) の英語版と [`public/about/index.html`](../public/about/index.html) を読む。
2. **診断表**（10 行以内）: そのまま掲載 NG の理由 · 直す優先順位。
3. **A) About 埋め込み版** を Markdown で出力（`## Why I built it` から開始）。
4. **B) フルストーリー版** を Markdown で出力。
5. 各版の末尾に **Word count** と **Suggested `<h2 id="...">`** を記載。
6. **Before / After** を代表 3 箇所（フック · Slides 段落 · 締め）。
7. ファイル更新は **`docs/DEVELOPER_STORY_EN.md`** に両版を書く（新規作成可）。`DEVELOPER_STORY.md` の英語節は **「推敲前ドラフト」** とラベル更新してリンクを張る。
8. HTML への反映は **しない**（文案のみ）。コミットしない。

---

## 完了報告に含めるもの

- A/B 各版の語数
- About 既存 4 セクションと **声の差** をどう吸収したか（3 行）
- 意図的に削った日本固有エピソード一覧
- Before / After 3 箇所
- カオルが最終判断する 3 点（トーン · 長さ · 実名の有無）

---

## コピペ用 — 下線より下を Agent に渡す

---

You are editing the **English developer story** for ZoneBoard (`c:\asl_dev\zoneboard`).

**Task:** The current English draft in `docs/DEVELOPER_STORY.md` (section "英語版（決定稿）") is **not ready to publish** on the site as-is. Produce two polished Markdown versions and save them to **`docs/DEVELOPER_STORY_EN.md`**.

**Read first**

1. `docs/DEVELOPER_STORY.md` — English draft + EU adjustment notes
2. `public/about/index.html` — match tone: direct, product-aware, en-GB, no marketing fluff
3. `docs/AGENT_PROMPT_HOWTO_COPY.md` — ESL-first English rules
4. `docs/UI_UX.md` §2 — light, fast, no wizard
5. `docs/PRODUCT_NOTE.md` §0 — motivation facts

**Deliverables**

### A) About embed (~250–350 words)

- Markdown starting with `## Why I built it` (no new H1)
- Structure: hook (never played) → **2026 World Cup stream / Google Slides turning point** → under my control / hand to others → **one sentence** tying to broadcast mode (B) and pitch-first
- Omit: JFA, Miyamoto, Nadeshiko details, Istanbul, Number magazine, long 2011 passage

### B) Full story (~500–700 words)

- Polish the existing draft; keep travel / futsal / 2011 as **short scenes** only
- Same fact constraints; no journalist name
- Product pitch: max 2 sentences at the end

**Style (mandatory)**

- en-GB spelling (`analysing`, not `analyzing`)
- ESL-first: short sentences (12–18 words), active voice, no slang
- Replace: `learning cost` → no training / no tutorial needed
- Replace: `heat of the explanation` → plain language about stream energy
- Replace: generic "press of a button" → **broadcast mode (B)** / tools hide — align with About page copy
- Avoid: passionate/revolutionary/innovative, AI essay openings ("every chapter of my life")
- Use **football**, not soccer
- Do **not** add JFA or Japanese federation names

**Facts (do not change)**

- Author never played football properly
- Trigger: 2026 World Cup cycle, live stream, respected journalist using **Google Slides** for tactics
- Author is not a player or pundit; builds what they can **hand to others** (under their control)
- Associations and pathways are out of scope for one person
- ZoneBoard: open, minimal learning, fast clean view for streams

**Also output**

1. Diagnosis table (why not publish as-is) — max 10 rows
2. Word counts for A and B
3. Suggested `h2 id` for HTML
4. Three Before/After pairs (hook, Slides paragraph, closing)
5. One-line og:description candidate

**Do not:** edit HTML, commit, invent new episodes, or name the journalist.

**Report in Japanese.**

---

## 人間パス（カオル · 推敲後）

1. About 埋め込み版を **声に出して** 読む — 既存 About の段落と並べて違和感がないか
2. **B キー / broadcast mode** が自然に 1 回入っているか
3. 実名 · 協会 · 2011 の濃さ — 公開媒体に合わせて最終調整
