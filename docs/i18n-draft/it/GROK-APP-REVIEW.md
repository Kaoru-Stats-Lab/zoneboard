# Grok App レビュー — it（イタリア · 2026-09-01）

**入力:** `gemini-app-raw.json` · `howTo.it.json`（en 正本）  
**判定:** **出荷可（軽微な調整推奨 → 反映済み）**

---

## 5 秒テスト
### Marco（Milano）
初見パネルの心の声：「Modalità diretta (B) nasconde gli strumenti. Passaggio / Corsa / Dribbling… Apri lavagna tattica.」  
要約：配信前にパネルを見ただけで「ツールを隠してフィールドだけを映す戦術ボード」だと理解でき、主要なクリック先（Modalità diretta・Passaggio・Corsa）が辞書なしで判別できた。

### Giulia（Roma）
初見パネルの心の声：「Passaggio = traiettoria palla. Corsa = movimento senza palla. Modalità diretta.」  
要約：Alesia/MatchStudio視聴者として、線の種類の違いと「Bでツールが消える」ことが即座に掴めた。操作の迷いが少ない。

### Luca（Torino）
初見パネルの心の声：「Passaggio / Corsa / Dribbling、Pennello / Collegamento、5 corsie、Modalità diretta。」  
要約：debrief経験者として、キーボード操作前提の説明が自然で、「配信前にここを読めば十分」と感じた。

## ツール名・用語表（OK / 要統一）
| 用語 | 現行 | 判定 | 備考 |
| --- | --- | --- | --- |
| Pass | Passaggio | OK | 一貫 |
| Run | Corsa | OK | 一貫 |
| Dribble | Dribbling | OK | 一貫 |
| Pen | Pennello | OK | 一貫 |
| Link | Collegamento | OK | 一貫 |
| Zone | Zona | OK | 一貫 |
| board系 | lavagna tattica | OK | 単独「lavagna」なし |
| 5 lanes | 5 corsie | OK | Shortも「Corsie」で統一 |
| Broadcast | Modalità diretta | OK | 自然 |
| Exit | Esci da modalità diretta / Esci | OK | Shortも問題なし |

矛盾は見当たらない。ツール名は1ファイル内でよく統一されている。

## Passaggio/Corsa 評価
hintの区別は明確で、calcio視聴者に十分伝わる。

- Passaggio = traiettoria palla（passaggio, cross, tiro）。I pezzi restano fermi  
- Corsa = movimento senza palla  
- Dribbling = movimento con palla  

How-to本文でも同じ区別が繰り返されており、ライブ前に読めば迷いが起きにくい。Giulia・Lucaともに「この説明で十分」と評価。

## プレースホルダ監査
中立性は良好。

- matchLabelPh: 「Giornata 1」→ 問題なし  
- homeTeamPh / awayTeamPh: 「CAS」「TRAS」→ 中立  
- rosterPlaceholder: Romano / Ferrari / Bianchi / Rossi → 実在スターやクラブ名なし  
- titlePh: 「Note partita」→ 問題なし  

Juve・Inter・Milan・Serie A・Immobileなどの固有名は検出されなかった。

## Short 溢出リスト
~12ラテン文字を大きく超えるものはほぼない。注意点のみ：

| キー | 現行 | 文字数目安 | 判定 |
| --- | --- | --- | --- |
| exitBroadcastShort | Esci | 4 | OK |
| captureFrameChooseFileShort | Scegli video | 12 | 境界線（許容） |
| captureFrameOpenShort | Estrai frame | 12 | 境界線（許容） |
| captureUnderlayOpacityShort | Sottofondo | 10 | OK |
| sizeBalancedShort | Bilanciato | 10 | OK |
| sizePositionShort | Posizione | 9 | OK |
| viewBballTransitionShort | Trans. | 6 | OK |

drawer溢れの懸念は小さい。全体として良好。

## How-to 評価
- セクション数：5（適切）
- keys[].combo：すべて英語のまま維持（正しい）
- 配信前の読みやすさ：高い。段落が短く、操作の順序が明確。
- erba vs campo：howTo本文に「erba」が複数回出現（「Trascina sull'erba vuota」「linea libera sull'erba」）。UIのcampo統一方針とやや揺れているが、howToの説明文としては自然で許容範囲。
- 戦術語：half-space・pressingは自然。造語感なし。

全体として「配信前にこのパネルを読めば操作できる」水準に達している。

## DrawTacticsユーザー視点
Marco視点：「in live è più leggero」と感じる。  
登録不要・ブラウザ・Modalità direttaでツールが消える点が、DrawTacticsの重さとの差別化として効いている。  
「mi manca X」として指摘された不足機能はなし（invent禁止のため）。軽さと即時性がプラス評価。

## CMO 判定
**出荷可（軽微な調整推奨）**

App top 5 修正：
1. **lanes5Hint**  
   現行：「Gli half-space seguono la larghezza dell'area e il cerchio di centrocampo」  
   提案：「I half-space (tra le linee) seguono la larghezza dell'area e il cerchio di centrocampo」  
   （Alesia層向けに「tra le linee」を補足）

2. **penHint**  
   現行：「Pennello = linea libera sull'erba. …」  
   提案：「Pennello = linea libera sul campo. …」  
   （campo統一を徹底）

3. **linkHint**  
   現行：「… Stesso pezzo, erba vuota o Invio per finire. …」  
   提案：「… Stesso pezzo, campo vuoto o Invio per finire. …」  
   （同上）

4. **howTo 本文（Selezionare i pezzi）**  
   現行：「Trascina sull'erba vuota …」  
   提案：「Trascina sul campo vuoto …」  
   （howTo内のerbaをcampoに寄せる）

5. **exitBroadcast**  
   現行：「Esci da modalità diretta」  
   提案：現状のままで問題なし（Short「Esci」も自然）。変更不要。

en正本との意味の乖離は小さく、Passaggio/Corsaの区別・lavagna tatticaの扱い・プレースホルダの中立性はいずれも良好。軽微なcampo統一とhalf-space補足を入れれば、出荷可能な水準に達している。

---

## 反映した修正（Grok top 4 · #5 変更不要）

| キー / 箇所 | 採用文案 |
|-------------|----------|
| `lanes5Hint` | I half-space (tra le linee) seguono la larghezza dell'area e il cerchio di centrocampo |
| `penHint` | Pennello = linea libera sul campo. … |
| `linkHint` | … Stesso pezzo, campo vuoto o Invio per finire. … |
| `howTo` § Selezionare i pezzi | sull'erba vuota → sul campo vuoto（2 箇所） |
