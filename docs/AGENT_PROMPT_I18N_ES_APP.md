# 翻訳プロンプト — スペイン語 · アプリ UI（es · 波 1）

**索引:** [`AGENT_PROMPT_I18N_ES.md`](AGENT_PROMPT_I18N_ES.md)  
このファイルを **Gemini**（Gemini 2.5 Pro / Flash 等）にそのまま渡してよい。

**成果物:** 翻訳データ **のみ** · **コード変更・コミット禁止**

**索引の §ROLE · §ネイティブ · §サッカー用語** — 本プロンプトより **優先**（矛盾時）。

---

## ROLE

索引 [`AGENT_PROMPT_I18N_ES.md`](AGENT_PROMPT_I18N_ES.md) §ROLE どおり。

**App 固有:** 読者は **配信中・ハーフタイム前** にパネルを触る。  
1 クリック先が分かる **動詞**（Colocar · Dibujar · Duplicar · Importar）。  
How-to は **初見 30 秒** で「駒を動かせる」ことが伝わる密度。

---

## 読む（順）

1. 本ファイル全文
2. [`src/i18n/messages.ts`](../src/i18n/messages.ts) — **`en` オブジェクト全体**（翻訳元）
3. 同ファイル **`ja`** — トーン参考のみ
4. [`.cursor/rules/i18n-ui-guardrails.mdc`](../.cursor/rules/i18n-ui-guardrails.mdc) — `*Short` の意味
5. [`scripts/i18n-chrome-check.ts`](../scripts/i18n-chrome-check.ts) — Short ペア一覧（長さの参考）
6. [`src/i18n/howTo.ts`](../src/i18n/howTo.ts) — **`en` + `ja`**（How-to 別ブロック）
7. [`docs/UI_UX.md`](../docs/UI_UX.md) §2 · [`docs/PRODUCT_NOTE.md`](../docs/PRODUCT_NOTE.md) §2（軽い · ウィザードなし）

**触らない:** `lp*` キー（**LP 波 2**）· [`docs/LP_COPY.md`](../LP_COPY.md)

---

## 成果物（2 ファイル）

### A. `docs/i18n-draft/es/messages-app.es.json`

```json
{
  "_meta": {
    "locale": "es",
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

### B. `docs/i18n-draft/es/howTo.es.json`

`howTo.ts` の `en` と **同じ JSON 形**:

```json
{
  "_meta": { "locale": "es", "source": "howTo.ts en" },
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
- **`heading` · `paragraphs` · `meaning` のみ** スペイン語化

---

## 翻訳ルール

**共通:** 索引 §ネイティブ · §サッカー用語。**以下は App 追補。**

### ドロワー / 配信 chrome 向け

| 文脈 | 注意 |
|------|------|
| **局面タブ** | **escena** 統一（複製 · 削除 · メモ） |
| **試合タブ** | 得点 · tarjeta · cambio — 実況語（gol · amarilla · cambio） |
| **配信モード B** | **modo emisión** / **modo directo** — 1 ファイル内で統一 |
| **OBS 系 hint** | 「Window Capture」→ **captura de ventana**（OBS は固有名詞のまま） |
| **capture import** | **importar escena** · **captura de broadcast** — 機能名は短く |

### トーン

- **en と同じ距離感:** 平易 · 短文 · 配信者が口にしそう
- **避ける:** 「Usted」だらけ · 「seleccione el menú desplegable…」型マニュアル
- **サッカー:** 索引 §サッカー用語表を正本とする（下記は App でよく出るキー）

| UI 概念 | es |
|---------|-----|
| scene | **escena** |
| piece（盤上） | **ficha** |
| roster | **plantilla** |
| broadcast mode | **modo emisión** |
| drawer | **panel**（文中） |

### `*Short` キー（レイアウト固定 · 最重要）

Drawer / topbar / セグメント用。**~12 ラテン文字**（目安 6–14）。  
例: `newSceneShort` · `captureImportShort` · `sizeTacticsShort`

- 収まらない場合: **できるだけ短い es** + ファイル末尾 `_shortOverflow` 配列に `{ "key": "...", "value": "...", "chars": N, "alt": "..." }` を付記
- **full キー**（`title` / `aria-label` / hint）に説明を逃がしてよい

### プレースホルダ（中立 · 全言語共通）

**特定クラブ・リーグ・スター選手は入れない** — ライバル関係で避難される。

| 避ける | 代わりに |
|--------|----------|
| 実在クラブ略称（RMA, FCB, LIV, FLA…） | `HOM`/`AWY` または `LOC`/`VIS` |
| リーグ固有名（Premier League, LaLiga, Brasileirão…） | 汎用ラウンド（`Jornada 1` · `Round 1` · `Rodada 1`） |
| 大会名（UCL, Libertadores…） | `Notas del partido` 等 |
| 有名選手（Salah, Lewandowski, LeBron, Gasol…） | その言語の**よくある姓**（García, Smith, Silva, Kowalski） |

- `pieceNamePh` · `rosterPlaceholder*` · `matchLabelPh` · `homeTeamPh` · `titlePh` 等すべて対象
- **hint / parseFail の例も同じ名前** — `rosterHint` · `rosterParseFail` は `pieceNamePh` と一致

### 空キー

- `""` のまま

---

## やってはいけない

- `messages.ts` / `howTo.ts` を直接編集
- `lp*` を含める
- キー名の変更 · キー追加
- `combo` 文字列の変更
- レイアウト分岐の提案（「スペイン語だけ幅を…」）
- コミット · PR

---

## ガードレール（Gemini）

1. **en より ja を優先しない**
2. **1 回の出力で LP までやらない**
3. **JSON がパース可能であること**（trailing comma 禁止 · エスケープ正しい）
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
- [ ] 索引 §サッカー用語の **escena · ficha · plantilla** がブレていない
- [ ] How-to を **声に出して** 読んで自然

---

## 完了報告（日本語で）

- 2 ファイルのパス
- キー数
- Short オーバー一覧
- 判断が分かった語 3 件以内
- LP 波への依存（`openBoard` 等）
