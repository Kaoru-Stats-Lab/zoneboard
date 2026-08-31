# Grok LP レビュー — it（イタリア · 2026-09-01）

**入力:** `messages-lp.it.json`（en 正本 · Gemini ドラフト）  
**判定:** **出荷可（軽微な調整推奨 → 反映済み）**

---

## 5 秒テスト
### Marco（Milano）
H1とpayoffを声に出して読んだ瞬間の心の声：「Aggiungi una lavagna tattica calcio alla diretta OBS di stasera. Nascondi gli strumenti. Cattura solo il campo. Webcam e chat restano in OBS.」  
要約：今夜のOBS配信に戦術ボードを足し、ツールを消してフィールドだけをキャプチャする道具だと即座に理解した。en原文の意図が明確に伝わる。

### Giulia（Roma）
H1とpayoffを声に出して読んだ瞬間の心の声：「Aggiungi una lavagna tattica alla diretta OBS di stasera. Nascondi gli strumenti. Cattura solo il campo.」  
要約：AlesiaやMatchStudioのようなanalisi tattica・debrief用に、OBSに軽く足せるlavagna tatticaだと分かった。準備感より「今夜の配信」に寄っており、自分ごとに感じやすい。

### Luca（Torino）
H1とpayoffを声に出して読んだ瞬間の心の声：「Aggiungi una lavagna tattica calcio alla diretta OBS di stasera. Nascondi gli strumenti. Cattura solo il campo.」  
要約：debrief動画やgiovanile解説向けのlavagna tatticaで、OBS cattura finestra前提の使い方がはっきり伝わる。enの意味が失われていない。

## スコア表
| 軸 | Marco | Giulia | Luca |
| --- | --- | --- | --- |
| Cool / ブランド | 8 | 8 | 8 |
| 自分ごと化（watchalong · debrief · analisi tattica） | 8 | 9 | 9 |
| 信頼 | 9 | 9 | 9 |
| サッカー語 | 8 | 9 | 9 |
| 配信用語 | 9 | 9 | 9 |
| CTA | 8 | 8 | 8 |
| it 自然さ | 9 | 9 | 9 |
| Passaggio/Corsa/Dribbling | 8 | 9 | 9 |
| lavagna tattica | 8 | 9 | 9 |

**理由（各軸1文）**  
- Cool / ブランド：3人とも「enの『今夜のOBS』感が保たれ、教室・lavagna scuola臭がなく、strumento creatorとして自然」。  
- 自分ごと化：Giulia・Lucaは「analisi tatticaやdebriefに直結」、Marcoは「watchalongとして使えるが、もう少しMatch Analysis寄りの表現があるとさらに良い」。  
- 信頼：3人とも「煽りがなく、機能を過大に言わず、en原文のバランスを正しく引き継いでいる」。  
- サッカー語：Giulia・Lucaが特に高く「titolari・angolo・pressing・passaggi・corse・dribblingが自然」、Marcoも問題なし。  
- 配信用語：3人とも「OBS・cattura finestra・modalità diretta・strumenti nascostiが日常的で自然」。  
- CTA：「Apri lavagna tattica — nessun account」は押しやすいが、「pronta per OBS」を加えるとさらに明確。  
- it 自然さ：3人とも「翻訳調がほぼなく、ネイティブとして自然なイタリア語」。  
- Passaggio/Corsa/Dribbling：lpPromise2Bodyで「passaggi, corse e dribbling」と明確に区別されており、App内のツール名と一致して伝わる。  
- lavagna tattica：教室連想はほぼなく、「lavagna tattica」として分析ツールの印象が強い。

## en vs it
en原文の意味はほぼ失われていない。特に以下の対応が正確：

- en「Add a football tactics board to tonight's OBS show.」→ it「Aggiungi una lavagna tattica calcio alla diretta OBS di stasera.」（「今夜」の感覚が「di stasera」で保たれている）
- en「Hide the tools. Capture only the pitch.」→ it「Nascondi gli strumenti. Cattura solo il campo.」
- en「Your cam and chat stay in OBS — not on this board.」→ it「Webcam e chat restano in OBS — non su questa lavagna tattica.」
- en「Connect passes, runs, and dribbles with lines.」→ it「Collega passaggi, corse e dribbling con le linee.」（Passaggio/Corsaの区別が正確）
- en「No account. Up to three boards on your machine.」→ it「Nessun account. Fino a tre lavagne tattiche sul tuo dispositivo.」

**Alesia/MatchStudio向けに強化すべき行（参考·必須ではない）**  
- lpCanTitleを少し具体化する案：「Pensato per watchalong, analisi tattica e debrief post-partita.」  
  （Alesia/MatchStudio視聴層への訴求を強化。en正本から逸脱するため、採用時は`_meta.notes`に理由を記載）
- lpCloseCtaに「pronta per OBS」を加える案：「Apri lavagna tattica — nessun account · pronta per OBS」

## lavagna tattica / lavagna scuola 連想
3人共通で**analisi寄り**。教室のlavagna scuola連想はほぼない。  
「lavagna tattica」はMatch Analysis層に自然で、strumento creatorとしての印象を損なわない。Lucaは「ex settore giovanileでも違和感なし」と評価。  
lpCan1の「sull'erba」は若干の揺れがあるが、全体としてcampo統一の方向は保たれている。

## campo vs erba/prato
- lpCan1で「sull'erba」が使われている点のみやや揺れがある。  
- その他のキー（lpHeadline2・lpHeroCaption・lpBullet1など）は「campo」で統一されており、UI/LP全体としては問題ない水準。  
- 推奨：lpCan1を「sul campo」に寄せるとさらに一貫する。

## DrawTactics / TacticalPadユーザーの印象
3人とも「troppo leggero」とは感じない。  
「nessun account・browser・cattura finestra・salvataggio locale」という点が、重いデスクトップアプリ（DrawTactics）との差別化としてcredibileな印象を与える。Giuliaは「Stories用にすぐPNGが出せる点が魅力」、Lucaは「liveでの軽さが強み」と評価。機能の浅さを指摘する声はなく、むしろ「stasera subito usable」な軽さがプラスに働いている。

## CMO 判定
**出荷可（軽微な調整推奨）**

優先修正 top 3：
1. **lpCanTitle**  
   現行：「Pensato per lo stream watchalong.」  
   提案：「Pensato per watchalong, analisi tattica e debrief post-partita.」  
   （Alesia/MatchStudio層への訴求を強化）

2. **lpCloseCta**  
   現行：「Apri lavagna tattica — nessun account」  
   提案：「Apri lavagna tattica — nessun account · pronta per OBS」  
   （en/ja/es/de/frとの一貫性を高める）

3. **lpCan1**  
   現行：「Metti lo stemma del tuo club sull'erba.」  
   提案：「Metti lo stemma del tuo club sul campo.」  
   （campo統一を徹底）

en/ja/es/de/fr/tr本番LP（「今夜のOBS」「ツールが消える」系）との温度は十分揃っている。itはen正本からの直訳として自然で、Passaggio/Corsa・lavagna tatticaの訴求も適切に反映されており、軽微な調整を入れれば出荷可能な水準に達している。

---

## 反映した修正（Grok top 3）

| キー | 採用文案 |
|------|----------|
| `lpCanTitle` | Pensato per watchalong, analisi tattica e debrief post-partita. |
| `lpCloseCta` | Apri lavagna tattica — nessun account · pronta per OBS |
| `lpCan1` | Metti lo stemma del tuo club sul campo. |

**`_meta.notes`:** lpCanTitle は en より Alesia/MatchStudio 層向けに具体化（Grok 2026-09-01）。
