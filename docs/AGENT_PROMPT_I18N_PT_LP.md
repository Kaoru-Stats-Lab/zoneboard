# 翻訳プロンプト — ブラジリアン・ポルトガル語 · LP（pt-BR · 波 2）

**索引:** [`AGENT_PROMPT_I18N_PT.md`](AGENT_PROMPT_I18N_PT.md)  
**前提:** 波 1 [`AGENT_PROMPT_I18N_PT_APP.md`](AGENT_PROMPT_I18N_PT_APP.md) と **別セッション**（混ぜない）

このファイルを **Gemini** にそのまま渡してよい。

**成果物:** 翻訳データ **のみ** · **コード変更・コミット禁止**

**索引の §ROLE · §ネイティブ · §サッカー用語 · §es から学んだこと** — 本プロンプトより **優先**（矛盾時）。

---

## ROLE

索引 §ROLE どおり。

**LP 固有:** 読者は **初見 5 秒** で「配信用の戦術 quadro」と分かるコピーライター。  
機能一覧 · スペック表 · 競合比較は **書かない**（[`LP_COPY.md`](../LP_COPY.md)）。

**pt ブランド温度（確定）:** **Cool 軸** — ja/en/es **本番 LP** のエネルギー（配信の夜 · **campo** が画面を取る · ツールが消える）。LP_COPY 決定稿の「仕事ベース」より **画面現象** を優先。観察ベースルール（OBS 内部心理を書かない）は維持。

**es Cool 軸を構造参考に（単語コピペ禁止）:**

| es（出荷済み Cool） | pt-BR 方向（Gemini が自然な BR 語に仕上げる） |
|---------------------|-----------------------------------------------|
| Tu directo. El campo a pantalla llena. | **Sua live. O campo em tela cheia.** |
| Sin menús. Solo fútbol en pantalla. | **Sem menus. Só futebol na tela.** |
| Añade el campo a la pantalla que ya usas. | **Coloque o campo na tela que você já usa.** |
| Pulsa B. Solo el campo en directo. | **Pressione B. Só o campo no ar.** |
| Abrir tablero | **Abrir quadro** |

**ネイティブチェック:** 母語話者が H1 を読んで **「live de futebol で campo を tela cheia に出す道具」** と取れるか。**教室 · 説明書** に聞こえたら NG。

---

## 読む（順）

1. 本ファイル全文
2. [`docs/LP_COPY.md`](../LP_COPY.md) — 骨格 · 判定ルール · **何を書かないか**
3. [`docs/LP_STRUCTURE.md`](../LP_STRUCTURE.md) — 各ブロックの役割（DOM は触らない）
4. [`src/i18n/messages.ts`](../src/i18n/messages.ts) — **`en` の `lp*` キー** + 下表の共有キー
5. [`src/components/Landing.tsx`](../src/components/Landing.tsx) — どのキーがどこに出るか
6. 波 1 ドラフト（あれば）: `docs/i18n-draft/pt/messages-app.pt.json` の `openBoard*` — **LP では同じ訳を使う**
7. **参考:** `docs/i18n-draft/es/messages-lp.es.json` · `docs/i18n-draft/es/GROK-LP-REVIEW.md`（Grok 指摘の先取り）

**触らない:** lp 以外の App キー · How-to · `site/pages.ts`（Later）

---

## 成果物

### `docs/i18n-draft/pt/messages-lp.pt.json`

```json
{
  "_meta": {
    "locale": "pt",
    "bcp47": "pt-BR",
    "source": "messages.ts en lp* + landing shared",
    "keyCount": 0,
    "notes": "Cool axis · es Grok lessons pre-applied"
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

## コピールール（LP_COPY 準拠 + es Grok 先取り）

**共通:** 索引 §ネイティブ · §サッカー用語。

### LP で使うサッカー語（固定）

| 概念 | pt-BR |
|------|-------|
| lineup / starters | **escalação** · **titulares** |
| pass / run / dribble（本文） | **passe** · **corrida** · **drible** |
| corner / set piece | **escanteio** · **bola parada** |
| press | **pressão** |
| both XIs | **os dois times** / **as duas escalações** |
| pitch | **campo**（**gramado** は本文 1 回まで · **campo 統一**） |
| board（UI/LP） | **quadro** | **quadro negro / lousa 禁止** |

### Grok（es）で直したパターン — pt で先取り

| キー | 方針 |
|------|------|
| `lpCanLead` | **Para criadores ao vivo. Treinadores também.**（裸の **streamers** だけは避ける） |
| `lpCan1` | escudo no **campo**（gramado 単独の揺れを避ける） |
| `lpCloseCta` | **Abrir quadro — sem conta · pronto para OBS** |
| `lpCan4` | **Salve um PNG pronto para Instagram, Stories ou X.**（操作説明書調を避ける） |
| `lpPromise3Title` | **Ao vivo** または **No ar**（**Transmitir** は堅い · 避ける） |

### 二本柱 + Cool 軸

1. **何が画面に起きるか** — **campo em tela cheia** · **sem menus** · modo live（B）
2. **どう足すか** — **colocar o campo** na tela que você já usa · captura de janela no OBS

**参照:** ja 本番 · es Cool 軸（`lpHeadline1/2` · `lpHeroCaption` · `lpCanTitle`）

### 書いてよい / 書かない

| 書いてよい | 書かない |
|------------|----------|
| Sua live. O campo em tela cheia. | 「OBS 内部の cena 構造」 |
| Sem menus. Só futebol na tela. | **quadro negro / lousa** · 教室トーン |
| Coloque o campo na tela que você já usa | 競合ツールの名前 |
| Rosto e chat ficam no lugar | 視聴者心理の長文 |
| Sem conta · Abra · Capture no OBS | 機能リストの羅列 |

### 3 場面（Place / Draw / Show）

| en | pt-BR 方向 |
|----|------------|
| Place | **Coloque** — Titulares no campo |
| Draw | **Desenhe** — Passes e movimento |
| Show | **Ao vivo** — Pressione B · só o campo |

見出しは **1 語〜2 語**。本文は **1 文**。

### トーン

- **en LP と同じリズム** — 宣言文 · 短文 · 能動態
- **você** — 配信者に語りかける
- **Brasil の live 文化** — Brasileirão · Libertadores · seleção の視聴者も想像できる中立 BR 語

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
- スペイン語の単語をそのまま流用（campo 等の同形語は可 · tablero/ficha 等は不可）
- pt-PT
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
- [ ] H1 を声に出して **live de futebol** として自然
- [ ] **campo** 統一 · **quadro**（lousa なし）
- [ ] pt-PT 語が混ざっていない

---

## 完了報告（日本語で）

- ファイルパス · キー数
- H1 / payoff の pt 一行要約
- LP_COPY ルールで避けた表現
- es Grok 先取りをどう反映したか
- `/pt/` 実装はしない旨

---

## 次のステップ（任意）

LP JSON 完成後 → [`AGENT_PROMPT_I18N_PT_LP_GROK_REVIEW.md`](AGENT_PROMPT_I18N_PT_LP_GROK_REVIEW.md) を **Grok** に渡し、結果を `docs/i18n-draft/pt/GROK-LP-REVIEW.md` に保存。
