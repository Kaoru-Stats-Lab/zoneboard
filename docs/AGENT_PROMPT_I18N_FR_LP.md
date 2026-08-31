# 翻訳プロンプト — フランス語 · LP（fr · 波 2）

**索引:** [`AGENT_PROMPT_I18N_FR.md`](AGENT_PROMPT_I18N_FR.md)  
**前提:** 波 1 と **別セッション**

## 正本: 英語 `en` の `lp*` のみ

- [`src/i18n/messages.ts`](../src/i18n/messages.ts) の **`en` LP キー**を翻訳する
- **es / pt / pl / de の文案は使わない**
- [`docs/LP_COPY.md`](../LP_COPY.md) — **何を書かないか** のルールのみ

Gemini にそのまま渡してよい。JSON のみ · コード変更禁止。

---

## 仏語圏 LP 温度（波 2 追記）

**en 本番 LP の構造を守る**（2 行 H1 · payoff · 3 promise）。自然な範囲で以下を織り込む:

| 軸 | fr 方向（ invent キー禁止） |
|----|----------------------------|
| **即時** | instantané · navigateur · sans installation lourde |
| **débrief / live** | débriefs · directs · watchalong（`lpCanTitle` · `lpCanLead`） |
| **Pass vs Course** | `lpCan2` · `lpPromise2Body` — **passes** · **courses** · **dribbles** |
| **OBS** | capture de fenêtre · cam et chat restent dans OBS |
| **ローカル** | pas de compte · enregistré localement（`lpCan5` · `lpBullet3`） |

**コアメッセージ参考（H1 を置き換えない）:**  
*Le tableau tactique instantané pour tes débriefs et live streams*

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
lpCan5: No account. Up to three boards on your machine.
lpBullet3: No sign-up · saves locally · up to 3 boards
```

**注意:** **en を忠実に fr 化**。Grok で Wiloo/Le Coach 向け Cool 寄せは **後段**。

---

## 読む

1. 本ファイル
2. `messages.ts` — **`en` の `lp*` + 共有 4 キー**
3. [`docs/LP_COPY.md`](../LP_COPY.md) · [`LP_STRUCTURE.md`](../LP_STRUCTURE.md)
4. 波 1: `docs/i18n-draft/fr/messages-app.fr.json` の `openBoard*` — **同じ訳を LP にコピー**

**触らない:** 他ロケール ドラフト · App 非 lp キー

---

## 成果物

`docs/i18n-draft/fr/messages-lp.fr.json`

- en の lp* 全キー + `openBoard` · `openBoardContinue` · `openBoardNew` · `brand`
- `_meta.source`: `"messages.ts en lp* ONLY"`

### 含めるキー（en と 1:1 · invent 禁止）

`lpHeadline1` … `lpSavedHint` + 共有 4 キー（pt/de LP プロンプトと同集合）

---

## コピールール

| en 概念 | fr 方向 |
|---------|---------|
| tactics board | **tableau tactique** / **tableau tactique de foot** |
| tonight's OBS show | **ton direct OBS ce soir** / **ton live OBS de ce soir** |
| Hide the tools | **Masque les outils** |
| Capture only the pitch | **Capture uniquement le terrain** |
| Press B | **Appuie sur B** |
| pass / run / dribble | **passe** · **course** · **dribble** |
| streamers | **créateurs en direct** / **streamers**（**1 ファイル内統一** · 推奨 **créateurs en direct**） |
| coaches | **entraîneurs** |

- **tableau tactique**（**tableau noir / tableau** 単独禁止）
- OBS · ZoneBoard · PNG · Instagram · X — 固有名詞そのまま
- Metrica / TacticalPad 等 — 書かない（LP_COPY）

### Grok 先取り（任意 · en 訳後）

| キー | 方針 |
|------|------|
| `lpCanLead` | **Pour les créateurs en direct. Les entraîneurs aussi.** |
| `lpCanTitle` | **Pensé pour les watchalongs et les débriefs tactiques.** |
| `lpCloseCta` | **Ouvrir le tableau — pas de compte · prêt pour OBS** |
| `lpBullet3` | **Pas de compte · enregistré localement · jusqu'à 3 tableaux** |
| **terrain** | **pelouse** を混ぜすぎない |

---

## やってはいけない

- es `Tu directo. El campo…` 等を fr に移植
- ja LP を参照
- H1 を 1 文スローガンに膨らませる
- 存在しない lp キーを invent

---

## 検証

- [ ] `_meta.source` = en ONLY
- [ ] en lp と 1:1 キー
- [ ] openBoard 系 = 波 1 と一致
- [ ] tableau noir なし · JSON valid
- [ ] passes/courses が lpCan2 または lpPromise2 に自然に入っている

---

## 完了報告（日本語）

- H1/payoff の fr 一行要約
- en から離れた意訳と理由
- 他ロケールを参照しなかった旨
