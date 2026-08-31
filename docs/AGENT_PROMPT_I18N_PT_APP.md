# 翻訳プロンプト — ブラジリアン・ポルトガル語 · アプリ UI（pt-BR · 波 1）

**索引:** [`AGENT_PROMPT_I18N_PT.md`](AGENT_PROMPT_I18N_PT.md)  
このファイルを **Gemini**（Gemini 2.5 Pro / Flash 等）にそのまま渡してよい。

**成果物:** 翻訳データ **のみ** · **コード変更・コミット禁止**

**索引の §ROLE · §ネイティブ · §サッカー用語 · §es から学んだこと** — 本プロンプトより **優先**（矛盾時）。

---

## ROLE

索引 [`AGENT_PROMPT_I18N_PT.md`](AGENT_PROMPT_I18N_PT.md) §ROLE どおり。

**App 固有:** 読者は **配信中 · intervalo 前** に painel を触る。  
1 クリック先が分かる **動詞**（Colocar · Desenhar · Duplicar · Importar）。  
How-to は **初見 30 秒** で「peça を動かせる」ことが伝わる密度。

**参考（読むだけ · コピペ禁止）:** `docs/i18n-draft/es/messages-app.es.json` — Cool 軸の距離感 · Short の切り方。

---

## 読む（順）

1. 本ファイル全文
2. [`src/i18n/messages.ts`](../src/i18n/messages.ts) — **`en` オブジェクト全体**（翻訳元）
3. 同ファイル **`ja`** — トーン参考のみ
4. [`.cursor/rules/i18n-ui-guardrails.mdc`](../.cursor/rules/i18n-ui-guardrails.mdc) — `*Short` の意味
5. [`scripts/i18n-chrome-check.ts`](../scripts/i18n-chrome-check.ts) — Short ペア一覧（長さの参考）
6. [`src/i18n/howTo.ts`](../src/i18n/howTo.ts) — **`en` + `ja`**
7. [`docs/UI_UX.md`](../docs/UI_UX.md) §2 · [`docs/PRODUCT_NOTE.md`](../docs/PRODUCT_NOTE.md) §2（軽い · ウィザードなし）
8. （任意）`docs/i18n-draft/es/messages-app.es.json` — 波 1 完成例

**触らない:** `lp*` キー（**LP 波 2**）· [`docs/LP_COPY.md`](../LP_COPY.md)

---

## 成果物（2 ファイル）

### A. `docs/i18n-draft/pt/messages-app.pt.json`

```json
{
  "_meta": {
    "locale": "pt",
    "bcp47": "pt-BR",
    "source": "messages.ts en",
    "excludes": "lp*",
    "keyCount": 0
  },
  "brand": "ZoneBoard",
  "openBoard": "...",
  ...
}
```

- **含める:** `messages.en` の **すべてのキー except `lp` で始まるキー**
- **含める:** `openBoard` · `openBoardContinue` · `openBoardNew`（LP でも使うが正本は App）
- **除外:** `lpHeadline1` … `lpSavedHint` 等 **`lp` プレフィックス全部**

### B. `docs/i18n-draft/pt/howTo.pt.json`

`howTo.ts` の `en` と **同じ JSON 形**:

```json
{
  "_meta": { "locale": "pt", "bcp47": "pt-BR", "source": "howTo.ts en" },
  "intro": "...",
  "sections": [
    {
      "heading": "...",
      "paragraphs": ["..."],
      "keys": [
        { "combo": "Click", "meaning": "..." }
      ]
    }
  ]
}
```

- **`keys[].combo` は英語のまま**（`Click` · `Ctrl/Cmd+Z` 等）— **翻訳しない**
- **`heading` · `paragraphs` · `meaning` のみ** pt-BR 化

---

## 翻訳ルール

**共通:** 索引 §ネイティブ · §サッカー用語。**以下は App 追補。**

### ドロワー / 配信 chrome 向け

| 文脈 | 注意 |
|------|------|
| **局面タブ** | **cena** 統一（複製 · 削除 · メモ） |
| **試合タブ** | 得点 · cartão · substituição — 実況語（gol · amarelo · substituição） |
| **配信モード B** | **modo transmissão** / **modo live** — 1 ファイル内で **1 つに統一**（推奨 **modo live**） |
| **OBS 系 hint** | 「Window Capture」→ **captura de janela**（OBS は固有名詞のまま） |
| **capture import** | **importar cena** · **captura da transmissão** — 機能名は短く |

### トーン

- **en と同じ距離感:** 平易 · 短文 · 配信者が口にしそう
- **避ける:** 「O senhor deve…」· 「selecione o menu suspenso…」型マニュアル · **pt-PT**
- **サッカー:** 索引 §サッカー用語表を正本とする

| UI 概念 | pt-BR |
|---------|-------|
| scene | **cena** |
| piece（盤上） | **peça** |
| roster | **elenco** |
| broadcast mode | **modo live**（または modo transmissão — 統一） |
| drawer | **painel**（文中） |

### `*Short` キー（レイアウト固定 · 最重要）

Drawer / topbar / セグメント用。**~12 ラテン文字**（目安 6–14）。  
例: `newSceneShort` · `captureImportShort` · `sizeTacticsShort`

- 収まらない場合: **できるだけ短い pt-BR** + ファイル末尾 `_shortOverflow` 配列に `{ "key": "...", "value": "...", "chars": N, "alt": "..." }` を付記
- **full キー**（`title` / `aria-label` / hint）に説明を逃がしてよい

### プレースホルダ（中立 · 全言語共通）

**実在クラブ略称・リーグ名・スター選手は禁止。** 例: `LOC`/`VIS` · `Rodada 1` · `Silva`/`Santos`（よくある姓）— `FLA`/`PAL` · `LeBron` · `Libertadores` は不可。

- `rosterPlaceholder*` — `\n` 1 文字列 · hint/parseFail の例名と一致

### 空キー

- `""` のまま

### languageHint（Settings）

es 実装例: 「Cambia solo los menús del tablero. Las guías legales siguen en inglés…」  
pt 方向: **painel/quadro のメニューだけ切替 · 法務読み物は英語のまま · peça の名前はユーザー入力のまま** — `/pt/` LP がある前提で矛盾しない文にする。

---

## やってはいけない

- `messages.ts` / `howTo.ts` を直接編集
- `lp*` を含める
- キー名の変更 · キー追加
- `combo` 文字列の変更
- レイアウト分岐の提案（「ポルトガル語だけ幅を…」）
- pt-PT 語彙
- コミット · PR

---

## ガードレール（Gemini）

1. **en より ja/es を優先しない**
2. **1 回の出力で LP までやらない**
3. **JSON がパース可能であること**（trailing comma 禁止 · 改行 placeholder は `\n`）
4. **キー数を `_meta.keyCount` に記載** — en（lp 除外）と一致必須
5. **Product Hunt 日付行**（`lpPhLaunch` は LP 波）— App に含めない
6. **capture import / 隠し機能** のキーは **そのまま翻訳**（機能説明は hint に）

---

## 検証（翻訳 Agent 自己チェック）

- [ ] `lp` で始まるキーが **0 個**
- [ ] en（lp 除外）と **キーセット完全一致**
- [ ] howTo: セクション数 5 · 各 `combo` 変更なし
- [ ] JSON 2 ファイルが valid
- [ ] `_shortOverflow` に 12 文字超 Short を列挙（なければ `[]`）
- [ ] **cena · peça · elenco · quadro** がブレていない
- [ ] pt-PT 語（guarda-redes · bancada · telemóvel 等）が **0 個**
- [ ] How-to を **声に出して** 読んで自然

---

## 完了報告（日本語で）

- 2 ファイルのパス
- キー数
- Short オーバー一覧
- 判断が分かった語 3 件以内
- LP 波への依存（`openBoard` 等）
- modo live vs modo transmissão の採用
