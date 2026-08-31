# 翻訳プロンプト — トルコ語 · アプリ UI（tr · 波 1）

**索引:** [`AGENT_PROMPT_I18N_TR.md`](AGENT_PROMPT_I18N_TR.md)

**正本: 英語 `en` のみ。** `ja` · `es` · `pt` · `pl` · `de` · `fr` は **読まない · 参照しない · コピーしない。**

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

### A. `docs/i18n-draft/tr/gemini-app-raw.json`

**フラット JSON**（`_meta` なし · de/fr の raw と同型）:

```json
{
  "brand": "ZoneBoard",
  "tagline": "...",
  "openBoard": "...",
  ...
}
```

- `messages.en` の全キー except `lp*`
- `openBoard` · `openBoardContinue` · `openBoardNew` を含む
- 完了後: `node scripts/build-tr-app-draft.mjs` → `messages-app.tr.json`（`_meta` 付き）

### B. `docs/i18n-draft/tr/howTo.tr.json`

- `howTo.en` と同形
- **`keys[].combo` は英語のまま**
- `heading` · `paragraphs` · `meaning` のみ tr 化

---

## 翻訳ルール

- **en の意味・役割・長さ**を保つ
- **Pas / Koşu / Dripling** — Pass/Run/Dribble と同役割
- 配信モード B → **yayın modu**（**1 ファイル内で統一** · **Broadcast modu** も可だが混在禁止）
- OBS → **pencere yakalama**（Window Capture · OBS 固有名詞）
- `languageHint`: ボードメニューのみ tr · 法務読み物は英語 · oyuncu adları = kullanıcı girişi

### トルコ圏固有（App）

| キー群 | 注意 |
|--------|------|
| **`passHint` / `runHint` / `dribbleHint`** | **Pas** = top yolu · **Koşu** = topsuz hareket / boş koşu · **Dripling** = topu sürerek |
| **`lanes5` / `lanes5Hint` / `lanesOff*` / `lanesOn*`** | **5 koridor** · hint で **yarı alanlar** / ceza sahası genişliği / orta daire |
| **局面 · 試合タブ** | **Sahne** · **Maç** — 1 ファイル内統一 |
| **capture import / export** | **sahne içe aktar** · **yayın görüntüsü** · Export → **PNG** · **kadro görseli** を hint で自然に（ invent キー禁止） |
| **press / corner** | **pres** · **korner** |
| **roster 系** | **kadro** · **diziliş** · **ilk 11** — 名簿 UI で統一 |

### `*Short`

~12 ラテン文字。超えたら `build-tr-app-draft.mjs` が `_shortOverflow` に列挙。

例（参考）:

| en Short | tr 方向 |
|----------|---------|
| No lanes | **Kapalı** / **Yok** |
| 5 lanes | **5 koridor** |
| Broadcast | **Yayın** / **Canlı** |
| Mirror | **Ayna** / **Yansı** |

### プレースホルダ（中立 · 全言語共通）

**実在クラブ（GS, FB, BJK, TS…）・リーグ名（Süper Lig 固有）・スター（Arda, Hakan…）は禁止。**

| 用途 | 例 |
|------|-----|
| チーム | `EV` / `DEP` または `EVS` / `MIS` |
| リーグ/節 | **Hafta 1** · **1. Hafta** |
| 選手姓 | **Yılmaz** · **Kaya** · **Demir** · **Çelik** |

`rosterPlaceholder*` → 改行は `\n` 1 文字列（例: `"10,Yılmaz,K\n7,Kaya\n4,Demir\n11,Çelik,K"`）

---

## やってはいけない

- 他ロケールを入力に使う
- `messages.ts` / `howTo.ts` を編集
- `lp*` を含める
- キー名変更 · combo 変更
- **kara tahta / tahta** 単独で board

---

## 検証

- [ ] ソースは **en のみ**（`build-tr-app-draft` 後 `_meta.source` = en ONLY）
- [ ] lp キー 0（gemini-app-raw）
- [ ] en 非 lp キー数と **完全一致**
- [ ] howTo 5 セクション · combo 不変
- [ ] JSON valid · `\n` placeholder 正しい
- [ ] Pas/Koşu の役割が hint で明確

---

## 完了報告（日本語）

- パス · キー数 · Short オーバー · en から判断が分かった語 3 件以内
- **yayın modu** · **taktik tahtası** · **kadro** の統一
- tr-TR / Azeri 混在が無いか
