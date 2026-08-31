# Grok LP レビュー — es Cool 軸（2026-08-31）

**対象:** `messages-lp.es.json`（Cool 軸 + tablero 修正後）  
**判定:** **出荷可（軽微な調整推奨）**

---

## 5 秒テスト
### Ana（スペイン）
H1とpayoffを声に出して読んだ瞬間の心の声：「配信の夜に、フィールドが画面いっぱいに広がる道具だ。メニューは邪魔にならない。自分のOBSにすぐ足せる。」  
要約：配信画面を試合そのものに変える、クールな戦術ボードだと即座に理解した。

### Diego（北米ヒスパニック）
H1とpayoffを声に出して読んだ瞬間の心の声：「My stream, the pitch full screen. No menus, just soccer on the screen. Add the field to the setup I already use.」  
要約：ウォッチアロング配信で今使っている画面にフィールドを足す、streamer向けツールだと一瞬で掴めた。

### Valentina（南米）
H1とpayoffを声に出して読んだ瞬間の心の声：「直配信の夜に、フィールドが画面を埋める。メニューなし、サッカーだけ。すでに使っている画面に足すだけ。」  
要約：試合の夜の実況・戦術配信に、フィールドをフルで映すためのシンプルな道具だと理解した。

## スコア表
| 軸 | Ana | Diego | Valentina |
| --- | --- | --- | --- |
| Cool / ブランド | 8 | 9 | 8 |
| 自分ごと化 | 8 | 9 | 8 |
| 信頼 | 8 | 8 | 8 |
| サッカー語自然さ | 9 | 8 | 9 |
| 配信用語 | 8 | 9 | 8 |
| CTA | 8 | 8 | 8 |

**理由（各軸1文）**  
- Cool / ブランド：Anaは「学校っぽさがないが、まだ少し説明的」、Diegoは「stream文化に完全にフィットしてクール」、Valentinaは「試合の夜の緊張感は出ているが、もう一歩研ぎ澄ませるとさらに良い」。  
- 自分ごと化：Anaは「Twitch同時視聴者として使える」、Diegoは「自分のウォッチアロングにすぐ想像できる」、Valentinaは「実況・戦術配信の準備に直結する」。  
- 信頼：3人とも「煽りすぎず、機能を過大に言わず、バランスが取れている」。  
- サッカー語自然さ：Ana・Valentinaは「pitido・onces・córner・carreras・regatesが自然」、Diegoは「全体に自然だが英語混在で若干の距離を感じる箇所がある」。  
- 配信用語：Diegoが最も高く「OBS・directo・captura・streamersが日常語として馴染む」、Ana・Valentinaは「問題ないが、もう少しスペイン語圏配信者の言い回しに寄せてもよい」。  
- CTA：3人とも「『Abrir tablero — sin cuenta』でハードルは低いが、もう少し『今夜すぐ』の感覚があると押したくなる」。

## 地域差
### Ana
- **違和感のある行**：「lpCanLead: Para streamers. Entrenadores también.」  
  なぜ：スペインでは「streamer」より「creador de contenido」や「streamer de fútbol」の方が自然で、突然の英語が少し浮く。  
  代替案：「Para creadores de contenido en directo. También para entrenadores.」  
- **特に効いている行**：「lpHeadline1: Tu directo. El campo a pantalla llena.」  
- **tableroの連想**：中立〜サッカー寄り。教室連想はほぼ消えている。  
- **pitido vs saque inicial**：pitidoの方が自然。  
- **Directo**：Coolで意味も通る。

### Diego
- **違和感のある行**：「lpCan1: Pon el escudo de tu club en el césped.」→ **campo** 推奨  
- **特に効いている行**：「lpLede: Sin cuenta. Abre en el navegador. Captura la ventana en OBS.」  
- **tablero**：旧 pizarra から改善。  
- **英語混在**：クール · 未翻訳感ではない。

### Valentina
- **違和感のある行**：「lpCan4」操作説明っぽい  
- **特に効いている行**：「lpCanTitle: Para la noche del partido en directo.」  

## CMO 判定（Grok）

**出荷可（軽微な調整推奨）**

優先修正 top 3 → **下記「反映済み修正」参照**

en/ja 本番 LP 温度：**概ね揃っている**

---

## 反映済み修正（2026-08-31）

| キー | 変更 |
|------|------|
| `lpCanLead` | Para creadores en directo. También para entrenadores. |
| `lpCloseCta` | Abrir tablero — sin cuenta · listo para OBS |
| `lpCan4` | Guarda un PNG listo para Instagram, Stories o X. |
| `lpCan1` | Pon el escudo de tu club en el **campo**.（Diego · campo 統一） |

`openBoard` は LP ヒーロー CTA 用に **短く** `Abrir tablero` のまま。
