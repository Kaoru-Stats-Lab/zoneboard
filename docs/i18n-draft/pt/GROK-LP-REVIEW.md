# Grok LP レビュー — pt-BR Cool 軸（2026-08-31）

**対象:** Gemini 波 2 初稿 `messages-lp.pt.json`（LP_COPY 準備軸 · H1 が apito/escalação 寄り）  
**判定:** **要修正** → **Cool 軸反映後は出荷可想定**

---

## 5 秒テスト
### Lucas（SP）
H1とpayoffを声に出して読んだ瞬間の心の声：「Coloque a escalação antes do apito. Mostre passes no campo. Coloque o campo na tela que você já usa.」  
要約：キックオフ前にスタメンを置く戦術ボードで、OBSに足せる道具だと理解した。配信の夜の「画面が試合になる」感覚は弱い。

### Beatriz（RJ）
H1とpayoffを声に出して読んだ瞬間の心の声：「Coloca a escalação antes do apito. Mostra passes e movimentos. Coloca o campo na tela que eu já uso.」  
要約：ウォッチアロング用にフィールドを足すツールだと分かったが、H1が準備寄りの印象で、ライブのエネルギーが不足している。

### Rafael（POA）
H1とpayoffを声に出して読んだ瞬間の心の声：「Coloque a escalação antes do apito inicial. Mostre passes e movimentos. Coloque o campo na tela que você já usa.」  
要約：戦術解説・実況向けのquadroで、OBSキャプチャ前提だと理解した。ただし「試合の夜」のクールさより「事前準備」が前面に出ている。

## スコア表
| 軸 | Lucas | Beatriz | Rafael |
| --- | --- | --- | --- |
| Cool / ブランド | 5 | 5 | 6 |
| 自分ごと化 | 7 | 7 | 8 |
| 信頼 | 8 | 8 | 8 |
| サッカー語自然さ | 8 | 8 | 9 |
| 配信用語 | 8 | 8 | 8 |
| CTA | 8 | 8 | 8 |
| pt-BR 純度 | 9 | 9 | 9 |

**理由（各軸1文）**  
- Cool / ブランド：3人とも「H1がキックオフ前の準備に寄りすぎ、配信の夜のエネルギーと『画面が試合になる』感覚が弱い」。  
- 自分ごと化：Lucas・Beatrizは「使えるが、もっとライブ感が欲しい」、Rafaelは「戦術解説者として自分ごとに感じやすい」。  
- 信頼：3人とも「煽りがなく、機能を過大に言わず、バランスが取れている」。  
- サッカー語自然さ：Rafaelが最も高く「apito・escalação・escanteio・corridas・driblesが自然」、Lucas・Beatrizも大きな違和感はない。  
- 配信用語：3人とも「OBS・ao vivo・captura de janela・criadoresが自然で問題ない」。  
- CTA：「Abrir quadro — pronto para OBS」は押しやすく、ハードルが低い。  
- pt-BR 純度：3人とも「pt-PTっぽい語や翻訳調がほとんどなく、自然なpt-BR」。

## 地域差
### Lucas
- **違和感のある行**：「lpHeadline1: Coloque a escalação antes do apito inicial.」  
  なぜ：キックオフ前の準備に寄っており、配信の夜のCool感が弱い。es版の「Tu directo. El campo a pantalla llena.」のようなエネルギーがない。  
  代替案：「Sua live. O campo em tela cheia.」  
- **特に効いている行**：「lpCloseCta: Abrir quadro — pronto para OBS」  
- **quadroの連想**：中立〜サッカー寄り。教室連想はほぼない。  
- **apito inicial vs início do jogo**：apito inicialの方が自然。  
- **Ao vivo（Promise3見出し）**：意味は通るが、Coolさは中程度。

### Beatriz
- **違和感のある行**：「lpHeadline2: Mostre passes e movimentos no campo.」  
  代替案：「Sem menus. Só futebol na tela.」  
- **特に効いている行**：「lpLede: Sem conta. Abra no navegador. Capture a janela no OBS.」  

### Rafael
- **違和感のある行**：「lpCanTitle: Criado para transmissões e watchalongs.」  
  代替案：「Criado para transmissões ao vivo e análises.」  
- **特に効いている行**：「lpCan3: Salve cenas. Volte rápido para um escanteio ou para a pressão.」  

## 英語混在（Lucas）
- OBS・B・PNG・Instagram・live は**クール**。未翻訳感ではない。

## es 温度比較
es Cool軸と比べ、**熱量が明らかに低い**。H1・H2が準備寄り。  
criadores ao vivo · campo · pronto para OBS は先取り済み。**H1 Cool 軸だけ未反映**。

## CMO 判定（Grok）

**要修正**

優先修正 top 3：
1. **lpHeadline1** → `Sua live. O campo em tela cheia.`
2. **lpHeadline2** → `Sem menus. Só futebol na tela.`
3. **lpPromise3Body** → `Pressione B. Só o campo ao vivo.`

---

## 反映済み修正（2026-08-31）

| キー | 初稿 | 反映後 |
|------|------|--------|
| `lpHeadline1` | Coloque a escalação antes do apito inicial. | **Sua live. O campo em tela cheia.** |
| `lpHeadline2` | Mostre passes e movimentos no campo. | **Sem menus. Só futebol na tela.** |
| `lpPromise3Body` | Oculte as ferramentas no modo live… | **Pressione B. Só o campo ao vivo.** |
| `lpHeroCaption` | O quadro é uma janela separada. | **O campo preenche a janela. Rosto e chat ficam no lugar.** |
| `lpCanTitle` | …watchalongs. | **Para a noite do jogo ao vivo.** |
| `lpPromise1Body` | Coloque os titulares e suas posições… | **Titulares no campo. Antes do apito.** |
| `lpPromise2Body` | Conecte passes, corridas e dribles… | **Passes e movimento. Com linhas.** |
| `lpCloseCta` | …pronto para OBS | **Abrir quadro — sem conta · pronto para OBS** |
| `lpCloseBody` | …antes do jogo começar. | **…Pressione B antes do apito.** |
| `lpCan4` | …Arraste o quadro. | **Salve um PNG pronto para Instagram, Stories ou X.** |
| `lpStepsLabel` | Como funciona | **Como** |

App 波 1（`messages-app.pt.json` · `howTo.pt.json`）は Grok 対象外 · **そのまま採用**。
