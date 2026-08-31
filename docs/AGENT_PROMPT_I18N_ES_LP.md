# 翻訳プロンプト — スペイン語 · LP（es · 波 2）

**索引:** [`AGENT_PROMPT_I18N_ES.md`](AGENT_PROMPT_I18N_ES.md)  
**前提:** 波 1 [`AGENT_PROMPT_I18N_ES_APP.md`](AGENT_PROMPT_I18N_ES_APP.md) と **別セッション**（混ぜない）

このファイルを **Gemini** にそのまま渡してよい。

**成果物:** 翻訳データ **のみ** · **コード変更・コミット禁止**

**索引の §ROLE · §ネイティブ · §サッカー用語** — 本プロンプトより **優先**（矛盾時）。

---

## ROLE

索引 §ROLE どおり。

**LP 固有:** 読者は **初見 5 秒** で「配信用の戦術ボード」と分かるコピーライター。  
機能一覧 · スペック表 · 競合比較は **書かない**（[`LP_COPY.md`](../LP_COPY.md)）。

**es ブランド温度（確定）:** **Cool 軸** — ja/en **本番 LP** のエネルギー（配信の夜 ·  campo が画面を取る · ツールが消える）。LP_COPY 決定稿の「仕事ベース」より **画面現象** を優先。観察ベースルール（OBS 内部心理を書かない）は維持。

**ネイティブチェック:** 母語話者が H1 を読んで **「今夜の配信で campo を画面に出す道具」** と取れるか。**教室・説明書** に聞こえたら NG。

---

## 読む（順）

1. 本ファイル全文
2. [`docs/LP_COPY.md`](../LP_COPY.md) — 骨格 · 判定ルール · **何を書かないか**
3. [`docs/LP_STRUCTURE.md`](../LP_STRUCTURE.md) — 各ブロックの役割（DOM は触らない）
4. [`src/i18n/messages.ts`](../src/i18n/messages.ts) — **`en` の `lp*` キー** + 下表の共有キー
5. [`src/components/Landing.tsx`](../src/components/Landing.tsx) — どのキーがどこに出るか
6. 波 1 ドラフト（あれば）: `docs/i18n-draft/es/messages-app.es.json` の `openBoard*` — **LP では同じ訳を使う**

**触らない:** lp 以外の App キー · How-to · `site/pages.ts`（Later）

---

## 成果物

### `docs/i18n-draft/es/messages-lp.es.json`

```json
{
  "_meta": {
    "locale": "es",
    "source": "messages.ts en lp* + landing shared",
    "keyCount": 0
  },
  "lpHeadline1": "...",
  ...
}
```

### 含めるキー（完全一致 · この集合だけ）

**`lp` プレフィックス全部** — `messages.en` から抽出:

`lpHeadline1` `lpHeadline2` `lpPayoff` `lpLede` `lpLedeNote` `lpPhLaunch`  
`lpHeroCaption`  
`lpPromise1Title` `lpPromise1Body` `lpPromise1Note`  
`lpPromise2Title` `lpPromise2Body` `lpPromise2Note`  
`lpPromise3Title` `lpPromise3Body` `lpPromise3Note`  
`lpStepsLabel` `lpStepsNote`  
`lpCanTitle` `lpCanLead`  
`lpCan1` … `lpCan6` · `lpCan1Note` … `lpCan6Note`  
`lpCloseTitle` `lpCloseBody` `lpCloseNote` `lpCloseCta`  
`lpMaterialsLink` `lpPriceBody` `lpPriceLink`  
`lpBullet1` `lpBullet2` `lpBullet3`  
`lpSavedHint`

**LP で使う共有キー（App 波 1 と同じ訳語にする）:**

| キー | 用途 |
|------|------|
| `openBoard` | メイン CTA |
| `openBoardContinue` | 続きから |
| `openBoardNew` | 新規試合 |
| `brand` | ZoneBoard（通常そのまま） |

→ 波 1 済みなら **同じ文字列をコピー**。未作成ならここで訳して、App 側と揃える旨を `_meta.notes` に書く。

**含めない:** `lpCreedTitle` 等 — **messages.en に無いキーを invent しない**

---

## コピールール（LP_COPY 準拠）

**共通:** 索引 §ネイティブ · §サッカー用語。

### LP で使うサッカー語（固定）

| 概念 | es |
|------|-----|
| lineup / starters | **alineación** · **titulares** |
| pass / run / dribble（本文） | **pase** · **carrera** · **regate** |
| corner / set piece | **córner** · **balón parado** |
| press | **presión** |
| both XIs | **ambos onces** / **las dos alineaciones** |
| pitch | **campo**（LatAm 中立 · **cancha** は使わない — App と統一） |
| board（UI/LP） | **tablero** | **pizarra 禁止**（教室連想） |

### 二本柱 + Cool 軸

1. **何が画面に起きるか** — **campo a pantalla llena** · **sin menús** · modo emisión（B）
2. **どう足すか** — **añadir el campo** a la pantalla que ya usas · captura de ventana en OBS

**参照:** ja 本番 `lpHeadline1/2` · `lpHeroCaption` · `lpCanTitle`（今夜の OBS · ツールが消える · ウォッチアロングの夜）

### 書いてよい / 書かない

| 書いてよい | 書かない |
|------------|----------|
| Tu directo. El campo a pantalla llena. | 「OBS 内部のシーン構造」 |
| Sin menús. Solo fútbol en pantalla. | **pizarra** · 教室・説明書トーン |
| Añade el campo a tu pantalla habitual | 競合ツールの名前 |
| Cara y chat siguen en su sitio | 視聴者心理の長文 |
| Sin cuenta · Abre · Captura en OBS | 機能リストの羅列 |

### 3 場面（Place / Draw / Show）

| en | es 方向 |
|----|---------|
| Place | **Coloca** — Titulares en el campo |
| Draw | **Dibuja** — Pases y movimiento |
| Show | **Directo** — Pulsa B · solo el campo（**Emite** は堅い · 避ける） |

見出しは **1 語〜2 語**。本文は **1 文**。

### トーン

- **en LP と同じリズム** — 宣言文 · 短文 · 能動態
- **ESL 配信者**（B2 英語）が英語 LP を読んだときと **同等の一読性**
- **ラテンアメリカ中立** — tú · スペイン固有表現は避ける

### 固有名詞

- **OBS · ZoneBoard · Product Hunt · Instagram · X** — そのまま
- `lpPhLaunch` の日付行 — **英語のまま可**（国際ローンチ）

---

## やってはいけない

- App キー（非 lp）を同ファイルに入れる
- `site/pages.ts`（about / pricing 長文）を今回翻訳
- HTML / React / CSS
- 見出しを長文化して 2 行 LP を壊す提案
- SEO キーワードの詰め込み
- コミット

---

## ガードレール（Gemini）

1. **LP_COPY の「敵」「心理」を書き入れない**
2. **H1 を 1 文のスローガンに膨らませない** — en と同じ **2 行 H1 構造**
3. **空の `lpCan6` 等は `""` 維持**
4. **キー数 = en の lp* + 共有 4 キー** と一致
5. **波 1 の JSON を上書きしない**

---

## 検証（自己チェック）

- [ ] lp 以外のキーが **共有 4 つのみ**
- [ ] en の lp キーと **1:1 対応**
- [ ] `lpHeadline1/2` が **配信者の仕事**を言っている（機能一覧ではない）
- [ ] JSON valid
- [ ] `_meta.notes` に openBoard 系の App 波との整合
- [ ] H1 を声に出して **配信者の仕事**として自然
- [ ] **campo** 統一（cancha なし）

---

## 完了報告（日本語で）

- ファイルパス · キー数
- H1 / payoff の es 一行要約
- LP_COPY ルールで避けた表現
- `/es/` 実装はしない旨
