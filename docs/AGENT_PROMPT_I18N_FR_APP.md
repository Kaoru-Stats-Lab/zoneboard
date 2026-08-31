# 翻訳プロンプト — フランス語 · アプリ UI（fr · 波 1）

**索引:** [`AGENT_PROMPT_I18N_FR.md`](AGENT_PROMPT_I18N_FR.md)

**正本: 英語 `en` のみ。** `ja` · `es` · `pt` · `pl` · `de` は **読まない · 参照しない · コピーしない。**

Gemini にそのまま渡してよい。成果物は JSON のみ · コード変更禁止。

---

## 読む（この順だけ）

1. 本ファイル
2. [`src/i18n/messages.ts`](../src/i18n/messages.ts) — **`en` オブジェクト**（`lp*` 除く翻訳元）
3. [`src/i18n/howTo.ts`](../src/i18n/howTo.ts) — **`en` ブロックのみ**
4. [`.cursor/rules/i18n-ui-guardrails.mdc`](../.cursor/rules/i18n-ui-guardrails.mdc)
5. [`scripts/i18n-chrome-check.ts`](../scripts/i18n-chrome-check.ts) — Short ペア

**触らない:** 他ロケール · `docs/i18n-draft/*/` · `lp*`

---

## 成果物

### A. `docs/i18n-draft/fr/messages-app.fr.json`

```json
{
  "_meta": {
    "locale": "fr",
    "bcp47": "fr-FR",
    "source": "messages.ts en ONLY",
    "excludes": "lp*",
    "keyCount": 0,
    "toolNames": "Passe / Course / Dribble"
  },
  ...
}
```

- `messages.en` の全キー except `lp*`
- `openBoard` · `openBoardContinue` · `openBoardNew` を含む

### B. `docs/i18n-draft/fr/howTo.fr.json`

- `howTo.en` と同形
- **`keys[].combo` は英語のまま**
- `heading` · `paragraphs` · `meaning` のみ fr 化

---

## 翻訳ルール

- **en の意味・役割・長さ**を保つ
- **Passe / Course / Dribble** — Pass/Run/Dribble と同役割
- 配信モード B → **mode diffusion** または **mode direct**（**1 ファイル内で統一** · 推奨 **mode diffusion**）
- OBS → **capture de fenêtre**（Window Capture · OBS 固有名詞）
- `languageHint`: ボードメニューのみ fr · 法務読み物は英語 · noms des joueurs = saisie utilisateur

### 仏語圏固有（App）

| キー群 | 注意 |
|--------|------|
| **`passHint` / `runHint` / `dribbleHint`** | **Passe** = trajectoire du ballon · **Course** = déplacement sans ballon（**appel de balle** を hint に自然に）· **Dribble** = avec ballon |
| **`lanes5` / `lanes5Hint` / `lanesOff*` / `lanesOn*`** | **5 couloirs** · hint で **demi-espaces** / largeur surface / cercle central |
| **局面 · 試合タブ** | **Scène** · **Match** — 1 ファイル内統一 |
| **capture import** | **importer une scène** · **capture du direct** |
| **press / corner** | **pressing** · **corner** |

### `*Short`

~12 ラテン文字。超えたら `_shortOverflow` に列挙。

例（参考）:

| en Short | fr 方向 |
|----------|---------|
| No lanes | **Sans** / **Off** |
| 5 lanes | **5 couloirs** |
| Broadcast | **Direct** / **Live** |

### プレースホルダ（中立 · 全言語共通）

**実在クラブ（PSG, OM, OL…）・リーグ名（Ligue 1 固有）・スター（Mbappé, Griezmann…）は禁止。**

| 用途 | 例 |
|------|-----|
| チーム | `LOC` / `VIS` または `DOM` / `EXT` |
| リーグ/節 | **Journée 1** · **Tour 1** |
| 選手姓 | **Martin** · **Bernard** · **Dubois** · **Petit** |

`rosterPlaceholder*` → 改行は `\n` 1 文字列（例: `"10,Martin,R\n7,Bernard\n4,Dubois\n11,Petit,L"`）

---

## やってはいけない

- 他ロケールを入力に使う
- `messages.ts` / `howTo.ts` を編集
- `lp*` を含める
- キー名変更 · combo 変更
- **tableau noir / tableau** 単独で board

---

## 検証

- [ ] ソースは **en のみ**（`_meta.source` に明記）
- [ ] lp キー 0
- [ ] en 非 lp キー数と **完全一致**
- [ ] howTo 5 セクション · combo 不変
- [ ] JSON valid · `\n` placeholder 正しい
- [ ] Passe/Course の役割が hint で明確

---

## 完了報告（日本語）

- パス · キー数 · Short オーバー · en から判断が分かった語 3 件以内
- **mode diffusion vs mode direct** · **tableau tactique** の統一
- fr-FR / fr-CA 混在が無いか
