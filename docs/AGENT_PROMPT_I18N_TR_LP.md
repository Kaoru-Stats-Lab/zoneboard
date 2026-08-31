# 翻訳プロンプト — トルコ語 · LP（tr · 波 2）

**索引:** [`AGENT_PROMPT_I18N_TR.md`](AGENT_PROMPT_I18N_TR.md)  
**前提:** 波 1 と **別セッション**

## 正本: 英語 `en` の `lp*` のみ

- [`src/i18n/messages.ts`](../src/i18n/messages.ts) の **`en` LP キー**を翻訳する
- **es / pt / pl / de / fr の文案は使わない**
- [`docs/LP_COPY.md`](../LP_COPY.md) — **何を書かないか** のルールのみ

Gemini にそのまま渡してよい。JSON のみ · コード変更禁止。

---

## トルコ圏 LP 温度（波 2 追記）

**en 本番 LP の構造を守る**（2 行 H1 · payoff · 3 promise）。自然な範囲で以下を織り込む:

| 軸 | tr 方向（ invent キー禁止） |
|----|----------------------------|
| **即時 · Kadro** | saniyeler içinde · **kadro görseli** · maç öncesi X（`lpCanTitle` · `lpCan4`） |
| **watchalong** | canlı yayın · watchalong · büyük maç öncesi（`lpCanLead`） |
| **Pas vs Koşu** | `lpCan2` · `lpPromise2Body` — **pas** · **koşu** · **dripling** |
| **OBS** | pencere yakalama · kamera ve sohbet OBS'te kalır |
| **ローカル** | hesap yok · yerel kayıt（`lpCan5` · `lpBullet3`） |

**コアメッセージ参考（H1 を置き換えない）:**  
*10 saniyede harika 2D kadro görseli*

**注意:** en は **OBS 仕事ベース**（tactics board を tonight's show に足す）。tr でも **en の 2 行 H1 構造を維持**し、Kadro 訴求は **本文・lpCan* で上乗せ** — H1 を Kadro スローガン 1 文に置き換えない。

---

## en LP（翻訳元）

```text
lpHeadline1: Add a football tactics board to tonight's OBS show.
lpHeadline2: Hide the tools. Capture only the pitch.
lpPayoff: Your cam and chat stay in OBS — not on this board.
lpLede: No account. Open in the browser. Add the window in OBS.
lpHeroCaption: Tools hide. The pitch fills the window. Cam and chat stay in OBS.
lpPromise2Body: Connect passes, runs, and dribbles with lines.
lpPromise3Body: Press B. Your OBS layout stays the same.
lpCanLead: For streamers first. The same board works for coaches too.
lpCan3: Save scenes. Jump back to a corner or a press.
lpCan4: Save a PNG for Instagram, your Stories, or X. Drag the frame to crop.
lpCan5: No account. Up to three boards on your machine.
lpBullet3: No sign-up · saves locally · up to 3 boards
```

**注意:** **en を忠実に tr 化**。Grok で Kadro/X 向け Cool 寄せは **後段**。

---

## 読む

1. 本ファイル
2. `messages.ts` — **`en` の `lp*` + 共有 4 キー**
3. [`docs/LP_COPY.md`](../LP_COPY.md) · [`LP_STRUCTURE.md`](../LP_STRUCTURE.md)
4. 波 1: `docs/i18n-draft/tr/messages-app.tr.json` の `openBoard*` — **同じ訳を LP にコピー**

**触らない:** 他ロケール ドラフト · App 非 lp キー

---

## 成果物

`docs/i18n-draft/tr/messages-lp.tr.json`

- en の lp* 全キー + `openBoard` · `openBoardContinue` · `openBoardNew` · `brand`
- `_meta.source`: `"messages.ts en lp* ONLY"`

### 含めるキー（en と 1:1 · invent 禁止）

`lpHeadline1` … `lpSavedHint` + 共有 4 キー（fr/de LP プロンプトと同集合）

---

## コピールール

| en 概念 | tr 方向 |
|---------|---------|
| tactics board | **futbol taktik tahtası** / **taktik tahtası** |
| tonight's OBS show | **bu akşamki OBS yayının** / **bu geceki canlı yayının** |
| Hide the tools | **Araçları gizle** |
| Capture only the pitch | **Yalnızca sahayı yakala** |
| Press B | **B'ye bas** |
| pass / run / dribble | **pas** · **koşu** · **dripling** |
| streamers | **yayıncılar** / **canlı yayıncılar**（**1 ファイル内統一** · 推奨 **yayıncılar**） |
| coaches | **antrenörler** |
| Save a PNG … X | **Instagram · Hikayeler · X** — 固有名詞そのまま · **kadro görseli** を自然に |

- **taktik tahtası**（**kara tahta / tahta** 単独禁止）
- OBS · ZoneBoard · PNG · Instagram · X — 固有名詞そのまま
- Metrica / TacticalPad 等 — 書かない（LP_COPY）

### Grok 先取り（任意 · en 訳後）

| キー | 方針 |
|------|------|
| `lpCanLead` | **Önce yayıncılar için. Antrenörler de kullanır.** |
| `lpCanTitle` | **Watchalong'ler, kadro tartışmaları ve maç öncesi X görselleri için.** |
| `lpCloseCta` | **Tahtayı aç — hesap yok · OBS'e hazır** |
| `lpBullet3` | **Hesap yok · yerel kayıt · en fazla 3 tahta** |
| **saha** | **çim** を混ぜすぎない — UI/LP は **saha** 統一 |

---

## やってはいけない

- es `Tu directo. El campo…` 等を tr に移植
- ja LP を参照
- H1 を 1 文 Kadro スローガンに膨らませる（en と同じ **2 行 H1**）
- 存在しない lp キーを invent
- 実在クラブ名（3 büyükler等）を LP に入れる

---

## 検証

- [ ] `_meta.source` = en ONLY
- [ ] en lp と 1:1 キー
- [ ] openBoard 系 = 波 1 と一致
- [ ] kara tahta なし · JSON valid
- [ ] pas/koşu が lpCan2 または lpPromise2 に自然に入っている
- [ ] kadro/diziliş が lpCan4 または lpCanTitle に自然に入っている（無理なら `_meta.notes` に理由）

---

## 完了報告（日本語）

- H1/payoff の tr 一行要約
- en から離れた意訳と理由
- 他ロケールを参照しなかった旨
- Kadro/X 訴求を入れた行の一覧
