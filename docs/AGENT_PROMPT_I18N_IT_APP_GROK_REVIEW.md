# Grok プロンプト — it App UI ネイティブ受け止め（イタリア · 3 視点）

**用途:** **en ベース**で訳した **App chrome**（`gemini-app-raw.json` / `howTo.it.json`）の評価。  
**出力:** 日本語（`docs/i18n-draft/it/GROK-APP-REVIEW.md` に保存）

**注意:** 正本は **en**。Grok には **en 原文と it 訳を並べて**、配信者がライブ前にパネルを読んで操作できるか · **Passaggio/Corsa** · **lavagna tattica** · **modalità diretta** を見てもらう。

**⚠️ プロンプト枠だけ貼ると Grok は評価不可。** 必ず以下の **貼り付けバンドル全文** を 1 回で貼る:

→ **[`docs/i18n-draft/it/GROK-APP-PASTE.md`](i18n-draft/it/GROK-APP-PASTE.md)**（評価指示 + 必須キー it 実データ + *Short 一覧 + howTo 全文 + en 参照）

手動で分割する場合のみ、以下 3 ブロックを同じメッセージに含める:

1. `docs/i18n-draft/it/gemini-app-raw.json` — 必須キー（下記 A）+ *Short 一覧（A2）
2. `docs/i18n-draft/it/howTo.it.json` — **全文**
3. en 参照サンプル（下記 C）

---

```
## ROLE

3 人のネイティブ **it-IT** 話者（LP レビューと同じペルソナ可）:

| ペルソナ | 背景 |
|----------|------|
| **Marco（Milano）** | Watchalong · OBS · usa DrawTactics occasionalmente |
| **Giulia（Roma）** | Alesia / MatchStudio · analisi tattica · YouTube |
| **Luca（Torino）** | Debriefer · ex settore giovanile · scorciatoie tastiera |

**自己チェック目標:** « Leggo il pannello prima della diretta e so **senza dizionario** cosa cliccare? »

## プロダクト

- **Passaggio / Corsa / Dribbling** = linee (palla vs senza palla vs con palla)
- **Pennello / Collegamento / Zona**
- **Modalità diretta (B)** = strumenti nascosti · solo campo in OBS
- **5 corsie / corridoi** = half-space / tra le linee (hint)
- **lavagna tattica** — mai **lavagna** sola (scuola)

## 評価文案

### A. App（it JSON を貼る — 全文 or 下記必須キー含む）

必須キー（en と並べて評価）:

```json
{
  "tagline": "...",
  "openBoard": "...",
  "broadcast": "...",
  "exitBroadcast": "...",
  "pass": "...",
  "run": "...",
  "dribble": "...",
  "passHint": "...",
  "runHint": "...",
  "dribbleHint": "...",
  "deleteHint": "...",
  "pen": "...",
  "link": "...",
  "zone": "...",
  "lanes5": "...",
  "lanes5Hint": "...",
  "lanesOffShort": "...",
  "lanesOnShort": "...",
  "matchLabelPh": "...",
  "titlePh": "...",
  "homeTeamPh": "...",
  "awayTeamPh": "...",
  "rosterPlaceholder": "...",
  "obsIntro": "...",
  "obsStep2": "...",
  "obsStep3": "...",
  "languageHint": "..."
}
```

### B. How-to（howTo.it.json 全文）

`keys[].combo` は **英語のまま** — combo を it 化していたら **要修正** と指摘。

### C. en 参照（並べて読む）

```json
{
  "broadcast": "Broadcast mode",
  "pass": "Pass",
  "run": "Run",
  "passHint": "Pass = ball path (pass, cross, shot). Pieces stay put.",
  "runHint": "Run = off-ball movement. Drag a piece.",
  "dribbleHint": "Dribble = ball-carrying run. Drag a piece.",
  "lanes5Hint": "Half-spaces align to penalty-box width and the centre circle.",
  "matchLabelPh": "Matchday 1",
  "rosterPlaceholder": "10,Müller,R\\n7,Schmidt\\n4,Schneider\\n11,Weber,L"
}
```

## やること

1. **パネル 5 秒テスト**（3 人 · 初見で「cos'è / cosa clicco」→ 日本語要約）
2. **ツール名一貫性:** Passaggio / Corsa / Dribbling · Pennello / Collegamento / Zona — 矛盾があれば列挙
3. **Passaggio vs Corsa:** hint で区別が **calcio 視聴者に明確**か
4. **lavagna tattica:** board 系キーで **lavagna scuola** 連想が出ないか · **lavagna** 単独の残存
5. **戦術語（hint/LP 本文のみ）:** Costruzione dal basso · Braccetto · tra le linee · pressing — 自然か · 造語っぽくないか
6. **プレースホルダ中立:** 実在クラブ/リーグ/スター（Juve, Inter, Milan, Serie A, Immobile…）が **Ph / Placeholder** に無いか
7. ***Short キー:** ~12 文字超えで drawer が溢れそうなもの（例: `exitBroadcastShort`, `captureImportShort`）
8. **How-to:** 5 セクション · combo 英語維持 · 配信前の読みやすさ
9. **DrawTactics ユーザー視点:** 「in live è più leggero / mi manca X» — X は invent 禁止
10. **CMO 判定:** 出荷可 / 要修正 / 要リライト · **App top 5 修正**（キー · 現行 · 提案）

## 出力フォーマット（日本語）

- 5 秒テスト
- ツール名・用語表（OK / 要統一）
- Passaggio/Corsa 評価
- プレースホルダ監査
- Short 溢出リスト
- How-to 評価
- CMO 判定 + top 5

## 禁止

- de/fr/es/tr ドラフトを正本にしない
- 新キー invent · combo を it 化する提案
- 3-back 可変 preset など **未実装機能**を「翻訳不足」としない（別チケット）
```

---

## メモ（カオル向け）

| ステップ | 内容 |
|----------|------|
| 1 | Grok ← **[`GROK-APP-PASTE.md`](i18n-draft/it/GROK-APP-PASTE.md) 全文**（枠だけ不可） |
| 2 | 出力 → `docs/i18n-draft/it/GROK-APP-REVIEW.md` |
| 3 | LP と **別セッション**推奨（LP は [`AGENT_PROMPT_I18N_IT_LP_GROK_REVIEW.md`](AGENT_PROMPT_I18N_IT_LP_GROK_REVIEW.md)） |
| 4 | 修正は raw に反映 → `node scripts/build-it-app-draft.mjs` → 本番 merge 前 |

**よくある it 修正:**

| キー | 注意 |
|------|------|
| `lpCan1` / `pitch` 系 | **campo** 統一（`erba`/`prato` 混在） |
| `lanes5` | **5 corsie** vs **5 corridoi** — 1 ファイル内統一 |
| `openBoard` / LP | 同じ訳（**Apri lavagna tattica** 等） |

**索引:** [`AGENT_PROMPT_I18N_IT.md`](AGENT_PROMPT_I18N_IT.md)
