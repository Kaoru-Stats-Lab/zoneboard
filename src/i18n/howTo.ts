import type { Locale } from "./messages";

export type HowToKeyRow = { combo: string; meaning: string };

export type HowToSection = {
  heading: string;
  paragraphs: string[];
  keys?: HowToKeyRow[];
};

export type HowToDoc = {
  intro: string;
  sections: HowToSection[];
};

const ja: HowToDoc = {
  intro:
    "配信モード（B）ではツールが消えます。駒はキーボードで動かします。配信前にここで一度試せば、本番でも同じキーが使えます。芝の上に初回チュートリアルは出しません。この画面と公開ガイドが説明書です。",
  sections: [
    {
      heading: "なぜキーボードなのか",
      paragraphs: [
        "視聴者が見たいのはピッチです。サイドパネルを開いたまま画面に映すと、戦術ではなくメニューが写ります。配信モード（B）でツールが消えます。残る操作は、選択・移動・向き、です。",
        "全部のショートカットを覚える必要はありません。ラインをまとめてずらす人も、ホームだけ選ぶ人も、局面を複製して比較する人もいます。使うキーだけで十分です。",
      ],
    },
    {
      heading: "駒を選択する",
      paragraphs: [
        "先に選択します。一本のライン、マークを貼ったブロック、ホームだけ、など。選んでから動かします。逆にすると、一人ずつ動かす手間になります。",
        "芝の空き地をドラッグすると、枠で囲んで選べます。駒に CB などの役割ラベルはないので、バックラインは枠で囲みます。Ctrl または Cmd を押したまま枠を引くと、いまの選択に足せます。",
        "ほとんど動かさないクリックは、選択解除です。Ctrl や Cmd を押したまま空き地をクリックしても、選択は消えません。",
      ],
      keys: [
        { combo: "Click", meaning: "その駒だけ選ぶ" },
        { combo: "Ctrl/Cmd+Click", meaning: "選択に足す／外す" },
        { combo: "Shift+Click", meaning: "選択に足す（外さない）" },
        { combo: "Drag empty grass", meaning: "枠で範囲選択" },
        { combo: "Alt+1 / Alt+2", meaning: "ホーム／アウェイ全員" },
        { combo: "Ctrl/Cmd+A", meaning: "見えている駒を全選択" },
        { combo: "Esc", meaning: "選択を解除" },
      ],
    },
    {
      heading: "選択を動かす",
      paragraphs: [
        "選んだ駒のどれかをドラッグすると、形を保ったままとめて動きます。ラインの上下、プレスの一段前、マークを貼ったままのスライドに使います。複数選択のまま置いても、シャツの入れ替えはしません。入れ替えは一人のときだけです。",
        "矢印キーで細かく動かします。Shift を足すと歩幅が大きくなります。配信中に「もう半歩」と言いながら使う想定です。",
        "R は向きだけ変えます。位置は動きません。ブロックの向きを揃えるときに使います。形ごと回したいときは Q / E です。選択の中心を軸に回します。二人以上選んでください。",
        "ハイラインを狭める、または広げるのは - と = です。中心からの距離を変えるので、選択の中心はあまり動きません。",
        "左右の攻撃方向を入れ替えるなら Shift+H。縦に折り返すなら Shift+V。向きも反転します。複製は Ctrl/Cmd+D。コピーが選ばれた状態になるので、すぐずらして対になる形にできます。",
      ],
      keys: [
        { combo: "Drag a selected piece", meaning: "選択した駒をまとめて動かす" },
        { combo: "Arrow / Shift+Arrow", meaning: "細かく／大きめに動かす" },
        { combo: "R", meaning: "向きだけ +45°" },
        { combo: "Q / E", meaning: "中心軸で形を回す" },
        { combo: "- / =", meaning: "狭める／広げる" },
        { combo: "Shift+H / Shift+V", meaning: "左右／上下に反転" },
        { combo: "Ctrl/Cmd+D", meaning: "複製（コピーが選択される）" },
        { combo: "Ctrl/Cmd+Shift+Arrow", meaning: "端または軸に整列" },
        { combo: "Alt+Shift+Arrow", meaning: "等間隔（左右＝横、上下＝縦）" },
        { combo: "Delete", meaning: "選んだ駒を消す" },
      ],
    },
    {
      heading: "準備で描く",
      paragraphs: [
        "配信前にパス・ラン・ペン・リンクを引くなら、ツールレールを使います。パスはボールの道（クロス・シュート含む）。ランは走る動き。ドリブルはボールを運ぶ人です。",
        "ペンはパスでもランでもない自由な線です。ブロックの線、チャネルの境界など。Shift を押したままドラッグすると直線になります。丸や囲みは Shift なしの自由描きです。リンクは駒をクリックしてつなぎ、駒を動かしても線が追従します。",
      ],
      keys: [
        { combo: "パス", meaning: "ボールの道" },
        { combo: "ラン / ドリブル", meaning: "走り／運び" },
        { combo: "ペン", meaning: "自由な線" },
        { combo: "リンク", meaning: "駒どうしのリンク" },
        { combo: "Shift+ペンドラッグ", meaning: "始点–終点の直線" },
        { combo: "Zone + Shift", meaning: "正円に近いゾーン" },
      ],
    },
    {
      heading: "画角を動かす",
      paragraphs: [
        "セットプレーに寄る、ハーフ全体を見る、など局面ごとの画角は Ctrl または Cmd + ホイールでズームします。Space を押したままドラッグでパンできます。Alt + ドラッグでも同じです。",
      ],
      keys: [
        { combo: "Ctrl/Cmd+Wheel", meaning: "カーソル位置でズーム" },
        { combo: "Space+Drag", meaning: "画角をパン" },
        { combo: "Alt+Drag", meaning: "画角をパン（代替）" },
      ],
    },
    {
      heading: "配信の前後",
      paragraphs: [
        "本番前に、ラインを上げて戻す、ホームだけ選んで狭める、まで一度やっておくと、配信中も手が止まりません。B で配信モードに入ります。使い方画面（? / F1）は配信中には開きません。画面に写ってしまうからです。",
        "局面の切り替えは [ ] です。セットプレーとレストディフェンスは一枚に重ねず、局面を分けて切り替えたほうが、視聴者には読みやすいです。",
        "形を試して元に戻したいときは、動かす前に局面を複製します。元の局面はそのまま残り、[ ] で戻れます。配信中は右下の複製ボタンからも同じ操作ができます。初期配置に戻すボタンはありません。局面の複製が正本です。",
      ],
      keys: [
        { combo: "B", meaning: "配信モードの入切" },
        { combo: "[ ] or PageUp/PageDown", meaning: "局面を切り替え" },
        { combo: "Duplicate (Scenes or bottom-right)", meaning: "局面を複製して試す" },
        { combo: "? or F1", meaning: "使い方（配信中は出さない）" },
      ],
    },
  ],
};

const en: HowToDoc = {
  intro:
    "Broadcast mode (B) hides the tools. You move pieces with the keyboard. Try the keys here before you go live — the same keys work during the stream. There is no first-run overlay on the pitch. This panel and the public guide are the manual.",
  sections: [
    {
      heading: "Why the keyboard",
      paragraphs: [
        "Viewers want to see the pitch. If the side panel stays open, they see menus, not tactics. Broadcast mode (B) hides the tools. What remains is select, move, and turn.",
        "You do not need every shortcut. Some hosts shift a whole line. Some select home only. Some copy a scene and compare two shapes. Learn only the keys you use.",
      ],
    },
    {
      heading: "Select pieces",
      paragraphs: [
        "Make a selection first — a line, a marked block, or home only — then move it. If you move first, you drag one piece at a time.",
        "Drag on empty grass to draw a box and select pieces inside. Pieces have no role labels like CB, so draw a box around the back line. Hold Ctrl or Cmd while you drag to add to the current selection.",
        "A tiny click with almost no movement clears the selection. Clicking empty grass with Ctrl or Cmd held does not clear it.",
      ],
      keys: [
        { combo: "Click", meaning: "Select one piece" },
        { combo: "Ctrl/Cmd+Click", meaning: "Add or remove" },
        { combo: "Shift+Click", meaning: "Add (keep rest)" },
        { combo: "Drag empty grass", meaning: "Box select" },
        { combo: "Alt+1 / Alt+2", meaning: "All home / all away" },
        { combo: "Ctrl/Cmd+A", meaning: "Select all visible" },
        { combo: "Esc", meaning: "Clear selection" },
      ],
    },
    {
      heading: "Move the selection",
      paragraphs: [
        "Drag any selected piece and the whole selection moves together. Use this for a line step, a press jump, or a slide with the mark still on. Dropping a multi-piece selection does not swap shirts. Swap works for one piece only.",
        "Arrow keys move in small steps. Shift + arrow takes a bigger step. Use this when you say \"half a step\" during the stream.",
        "R changes facing only. Positions stay the same. Use it to square a block. Q / E rotate the whole shape around the selection centre. Select two or more pieces.",
        "- moves pieces closer together. = moves them apart. The selection centre barely moves — good for a compact or open high line.",
        "Shift+H mirrors left and right, including facing. Shift+V flips top and bottom. Ctrl/Cmd+D copies pieces; the copies stay selected so you can slide them into a pair.",
      ],
      keys: [
        { combo: "Drag a selected piece", meaning: "Move the whole selection" },
        { combo: "Arrow / Shift+Arrow", meaning: "Nudge (fine / coarse)" },
        { combo: "R", meaning: "Facing +45° only" },
        { combo: "Q / E", meaning: "Rotate shape at centre" },
        { combo: "- / =", meaning: "Closer / wider" },
        { combo: "Shift+H / Shift+V", meaning: "Flip H / flip V" },
        { combo: "Ctrl/Cmd+D", meaning: "Duplicate (copies selected)" },
        { combo: "Ctrl/Cmd+Shift+Arrow", meaning: "Align to edge or axis" },
        { combo: "Alt+Shift+Arrow", meaning: "Even spacing (H / V)" },
        { combo: "Delete", meaning: "Remove selected pieces" },
      ],
    },
    {
      heading: "Draw before the stream",
      paragraphs: [
        "Before the stream, use the tool rail for Pass, Run, Pen, and Link. Pass is the ball path — pass, cross, or shot. Run is off-ball movement. Dribble is a player carrying the ball.",
        "Pen is a free line that is not Pass or Run — a block line or a channel edge. Hold Shift while dragging Pen for a straight line. Circles and loops stay freehand without Shift. Link connects pieces; the line follows when you move them.",
      ],
      keys: [
        { combo: "Pass", meaning: "Ball path (dashed)" },
        { combo: "Run / Dribble", meaning: "Run or dribble" },
        { combo: "Pen", meaning: "Freehand line" },
        { combo: "Link", meaning: "Piece link (follows)" },
        { combo: "Shift+Pen drag", meaning: "Straight line A to B" },
        { combo: "Zone + Shift", meaning: "Near-circular zone" },
      ],
    },
    {
      heading: "Move the view",
      paragraphs: [
        "Zoom in on a set piece or see the whole half — Ctrl or Cmd + wheel zooms toward the cursor. Hold Space and drag to pan. Alt + drag works too.",
      ],
      keys: [
        { combo: "Ctrl/Cmd+Wheel", meaning: "Zoom at cursor" },
        { combo: "Space+Drag", meaning: "Pan the view" },
        { combo: "Alt+Drag", meaning: "Pan (alternate)" },
      ],
    },
    {
      heading: "Before and during the stream",
      paragraphs: [
        "Before kick-off, practise raising a line and putting it back, or selecting home and moving them closer. Then those keys still work in broadcast mode. Press B for broadcast mode. Do not open this how-to (? / F1) during the stream — it appears on screen.",
        "Switch scenes with [ ]. Put a corner kick and a rest-defence shape on separate scenes, not one crowded drawing.",
        "To try a move and keep the original, copy the scene before you drag. The first scene stays — go back with [ ]. During the stream, use Duplicate in the bottom-right corner. There is no reset-to-start button. Copying the scene is how you keep a clean original.",
      ],
      keys: [
        { combo: "B", meaning: "Toggle broadcast mode" },
        { combo: "[ ] or PageUp/PageDown", meaning: "Switch scenes" },
        { combo: "Duplicate (Scenes or bottom-right)", meaning: "Copy scene, try a move" },
        { combo: "? or F1", meaning: "How-to (not live)" },
      ],
    },
  ],
};

const es: HowToDoc = {
  intro: "El modo emisión (B) oculta las herramientas. Mueves las fichas con el teclado. Prueba los atajos aquí antes de emitir — funcionarán igual en directo. No hay tutorial inicial en el césped. Este panel y la guía pública son el manual.",
  sections: [
    {
      heading: "Por qué usar el teclado",
      paragraphs: [
        "Los espectadores quieren ver el campo. Si dejas el panel lateral abierto, verán menús, no táctica. El modo emisión (B) oculta las herramientas. Solo queda seleccionar, mover y girar.",
        "No necesitas aprenderte todos los atajos. Algunos mueven líneas enteras. Otros seleccionan solo al equipo local. Otros copian una escena y comparan dos dibujos. Aprende solo las teclas que necesites.",
      ],
    },
    {
      heading: "Seleccionar fichas",
      paragraphs: [
        "Haz la selección primero —una línea, un bloque al hombre, o solo el local— y luego muévela. Si mueves directamente, arrastrarás una por una.",
        "Arrastra sobre el césped para hacer un recuadro y seleccionar las fichas de dentro. Las fichas no tienen etiquetas como DFC, así que envuelve la línea defensiva en un recuadro. Mantén pulsado Ctrl o Cmd mientras arrastras para añadir a la selección actual.",
        "Un pequeño clic sin apenas movimiento anula la selección. Hacer clic en el césped manteniendo Ctrl o Cmd no la anula.",
      ],
      keys: [
        { combo: "Click", meaning: "Seleccionar una ficha" },
        { combo: "Ctrl/Cmd+Click", meaning: "Añadir o quitar" },
        { combo: "Shift+Click", meaning: "Añadir (mantener el resto)" },
        { combo: "Drag empty grass", meaning: "Selección en recuadro" },
        { combo: "Alt+1 / Alt+2", meaning: "Todo el local / todo el visitante" },
        { combo: "Ctrl/Cmd+A", meaning: "Seleccionar todo lo visible" },
        { combo: "Esc", meaning: "Anular selección" },
      ],
    },
    {
      heading: "Mover la selección",
      paragraphs: [
        "Arrastra cualquier ficha seleccionada y toda la selección se moverá junta. Úsalo para adelantar la línea, saltar a la presión o vascular manteniendo las marcas. Soltar varias fichas a la vez no intercambia camisetas. El intercambio funciona solo de una en una.",
        "Las flechas mueven paso a paso. Shift + flecha da un paso más grande. Úsalo cuando digas \"un pasito más\" durante el directo.",
        "R solo cambia la orientación. Las posiciones se mantienen. Úsalo para cuadrar un bloque. Q / E giran toda la forma sobre el centro de la selección. Debes seleccionar dos o más fichas.",
        "- junta las fichas. = las separa. El centro de la selección apenas se mueve — perfecto para un bloque compacto o una línea alta abierta.",
        "Shift+H invierte de izquierda a derecha, incluida la orientación. Shift+V voltea de arriba a abajo. Ctrl/Cmd+D duplica fichas; las copias se quedan seleccionadas para que puedas moverlas y armar pares.",
      ],
      keys: [
        { combo: "Drag a selected piece", meaning: "Mover toda la selección" },
        { combo: "Arrow / Shift+Arrow", meaning: "Mover a toques (corto / largo)" },
        { combo: "R", meaning: "Girar +45° en el sitio" },
        { combo: "Q / E", meaning: "Girar forma sobre el centro" },
        { combo: "- / =", meaning: "Juntar / separar" },
        { combo: "Shift+H / Shift+V", meaning: "Voltear H / voltear V" },
        { combo: "Ctrl/Cmd+D", meaning: "Duplicar (copias seleccionadas)" },
        { combo: "Ctrl/Cmd+Shift+Arrow", meaning: "Alinear al borde o eje" },
        { combo: "Alt+Shift+Arrow", meaning: "Distribuir (H / V)" },
        { combo: "Delete", meaning: "Eliminar fichas seleccionadas" },
      ],
    },
    {
      heading: "Dibujar antes del directo",
      paragraphs: [
        "Antes del directo, usa las herramientas Pase, Carrera, Regate, Lápiz y Enlazar. Pase es la ruta del balón (pase, centro o tiro). Carrera es movimiento sin balón. Regate es un jugador conduciendo el balón.",
        "Lápiz es una línea libre que no es Pase o Carrera — una línea de bloque o pasillo. Mantén pulsado Shift al arrastrar el Lápiz para hacer una recta. Los círculos y formas se hacen a mano alzada sin Shift. Enlazar une fichas; la línea las sigue cuando las mueves.",
      ],
      keys: [
        { combo: "Pase", meaning: "Ruta del balón (punteada)" },
        { combo: "Carrera / Regate", meaning: "Movimiento sin balón o conducción" },
        { combo: "Lápiz", meaning: "Línea a mano alzada" },
        { combo: "Enlace", meaning: "Une fichas (las sigue)" },
        { combo: "Shift+Lápiz", meaning: "Línea recta A a B" },
        { combo: "Zona + Shift", meaning: "Zona casi circular" },
      ],
    },
    {
      heading: "Mover la cámara",
      paragraphs: [
        "Haz zoom a un córner o mira toda la mitad del campo — Ctrl o Cmd + rueda hace zoom hacia el cursor. Mantén Espacio y arrastra para moverte por el campo. Alt + arrastrar también funciona.",
      ],
      keys: [
        { combo: "Ctrl/Cmd+Wheel", meaning: "Zoom en el cursor" },
        { combo: "Space+Drag", meaning: "Mover la cámara" },
        { combo: "Alt+Drag", meaning: "Mover la cámara (alternativa)" },
      ],
    },
    {
      heading: "Antes y durante el directo",
      paragraphs: [
        "Antes del pitido inicial, practica adelantar una línea y devolverla, o seleccionar al local y juntarlos. Esas teclas seguirán funcionando en modo emisión. Pulsa B para activar el modo emisión. No abras este panel de ayuda (? / F1) durante el directo — saldrá en pantalla.",
        "Cambia de escena con [ ]. Pon un córner y un dibujo de vigilancia (rest-defence) en escenas separadas, no apelotonados en la misma.",
        "Para probar un movimiento y conservar el original, copia la escena antes de arrastrar. La primera escena se mantendrá — vuelve a ella con [ ]. Durante el directo, usa Duplicar abajo a la derecha. No hay botón para restaurar al estado inicial. Copiar la escena es la forma de mantener limpio tu original.",
      ],
      keys: [
        { combo: "B", meaning: "Activar/desactivar modo emisión" },
        { combo: "[ ] or PageUp/PageDown", meaning: "Cambiar de escena" },
        { combo: "Duplicate (Scenes or bottom-right)", meaning: "Copiar escena, probar movimiento" },
        { combo: "? or F1", meaning: "Ayuda (no en directo)" },
      ],
    },
  ],
};

const pt: HowToDoc = {
  intro: "O modo live (B) oculta as ferramentas. Você move as peças com o teclado. Teste os atalhos aqui antes de entrar ao vivo — as mesmas teclas funcionam durante a live. Não há um tutorial inicial no gramado. Este painel e o guia público são o manual.",
  sections: [
    {
      heading: "Por que usar o teclado",
      paragraphs: [
        "Os espectadores querem ver o campo. Se você deixar o painel lateral aberto, eles verão menus, não tática. O modo live (B) oculta as ferramentas. O que resta é selecionar, mover e girar.",
        "Você não precisa memorizar todos os atalhos. Alguns movem a linha inteira. Outros selecionam apenas o time da casa. Alguns copiam a cena para comparar dois desenhos. Aprenda apenas as teclas que usar.",
      ],
    },
    {
      heading: "Selecionar peças",
      paragraphs: [
        "Faça a seleção primeiro — uma linha, um bloco de marcação, ou apenas o time da casa — e então mova. Se tentar mover primeiro, você arrastará uma peça de cada vez.",
        "Arraste na grama vazia para criar uma caixa e selecionar as peças dentro dela. As peças não têm posições como ZAG, então crie a caixa ao redor da linha defensiva. Segure Ctrl ou Cmd enquanto arrasta para adicionar à seleção atual.",
        "Um clique rápido quase sem movimento limpa a seleção. Clicar na grama vazia segurando Ctrl ou Cmd não limpa a seleção.",
      ],
      keys: [
        { combo: "Click", meaning: "Selecionar uma peça" },
        { combo: "Ctrl/Cmd+Click", meaning: "Adicionar ou remover" },
        { combo: "Shift+Click", meaning: "Adicionar (manter o resto)" },
        { combo: "Drag empty grass", meaning: "Selecionar em caixa" },
        { combo: "Alt+1 / Alt+2", meaning: "Todos do Casa / Fora" },
        { combo: "Ctrl/Cmd+A", meaning: "Selecionar todos visíveis" },
        { combo: "Esc", meaning: "Limpar seleção" },
      ],
    },
    {
      heading: "Mover a seleção",
      paragraphs: [
        "Arraste qualquer peça selecionada e toda a seleção se moverá junto. Use isso para avançar a linha, pular para a pressão ou bascular mantendo a marcação. Soltar uma seleção de várias peças não troca as camisas. A troca funciona apenas para uma peça de cada vez.",
        "As setas movem em pequenos toques. Shift + seta dá um passo maior. Use isso quando disser \"só mais um passinho\" durante a transmissão.",
        "R altera apenas a direção que o jogador olha. As posições continuam as mesmas. Use para enquadrar o bloco. Q / E giram a forma inteira em torno do centro da seleção. Selecione duas ou mais peças.",
        "- aproxima as peças. = afasta as peças. O centro da seleção quase não se move — ótimo para compactar ou abrir a linha alta.",
        "Shift+H inverte esquerda e direita, incluindo para onde olham. Shift+V inverte cima e baixo. Ctrl/Cmd+D duplica as peças; as cópias permanecem selecionadas para você posicioná-las.",
      ],
      keys: [
        { combo: "Drag a selected piece", meaning: "Mover toda a seleção" },
        { combo: "Arrow / Shift+Arrow", meaning: "Mover (curto / longo)" },
        { combo: "R", meaning: "Girar olhar +45°" },
        { combo: "Q / E", meaning: "Girar forma pelo centro" },
        { combo: "- / =", meaning: "Aproximar / afastar" },
        { combo: "Shift+H / Shift+V", meaning: "Inverter H / inverter V" },
        { combo: "Ctrl/Cmd+D", meaning: "Duplicar (cópias selecionadas)" },
        { combo: "Ctrl/Cmd+Shift+Arrow", meaning: "Alinhar à borda ou eixo" },
        { combo: "Alt+Shift+Arrow", meaning: "Distribuir (H / V)" },
        { combo: "Delete", meaning: "Remover peças selecionadas" },
      ],
    },
    {
      heading: "Desenhar antes da live",
      paragraphs: [
        "Antes de entrar ao vivo, use as ferramentas Passe, Corrida, Caneta e Vincular. Passe é a rota da bola — passe, cruzamento ou chute. Corrida é o movimento sem a bola. Drible é um jogador conduzindo a bola.",
        "Caneta é uma linha livre que não é Passe ou Corrida — uma linha de bloco ou um corredor. Segure Shift enquanto arrasta a Caneta para uma linha reta. Círculos e zonas continuam à mão livre sem o Shift. Vincular conecta as peças; a linha as segue quando você as move.",
      ],
      keys: [
        { combo: "Pass", meaning: "Rota da bola (tracejada)" },
        { combo: "Run / Dribble", meaning: "Corrida ou drible" },
        { combo: "Pen", meaning: "Linha à mão livre" },
        { combo: "Link", meaning: "Vínculo entre peças (segue)" },
        { combo: "Shift+Pen drag", meaning: "Linha reta A para B" },
        { combo: "Zone + Shift", meaning: "Zona quase circular" },
      ],
    },
    {
      heading: "Mover a câmera",
      paragraphs: [
        "Dê zoom em uma bola parada ou veja o meio-campo inteiro — Ctrl ou Cmd + roda do mouse dá zoom em direção ao cursor. Segure Espaço e arraste para mover a visão. Alt + arrastar também funciona.",
      ],
      keys: [
        { combo: "Ctrl/Cmd+Wheel", meaning: "Zoom no cursor" },
        { combo: "Space+Drag", meaning: "Mover a câmera" },
        { combo: "Alt+Drag", meaning: "Mover a câmera (alternativa)" },
      ],
    },
    {
      heading: "Antes e durante a transmissão",
      paragraphs: [
        "Antes do apito inicial, pratique subir e voltar a linha, ou selecionar os donos da casa e aproximá-los. Essas teclas continuam funcionando no modo live. Pressione B para ativar o modo live. Não abra este painel de ajuda (? / F1) durante a transmissão — ele aparecerá na tela.",
        "Troque de cenas com [ ]. Coloque um escanteio e um bloco de vigilância preventiva em cenas separadas, e não tudo em um único desenho amontoado.",
        "Para testar um movimento e manter o original, copie a cena antes de arrastar. A cena original fica — volte para ela com [ ]. Durante a live, use Duplicar no canto inferior direito. Não há um botão para restaurar ao início. Copiar a cena é a maneira de manter o seu original limpo.",
      ],
      keys: [
        { combo: "B", meaning: "Ativar/desativar modo live" },
        { combo: "[ ] or PageUp/PageDown", meaning: "Trocar de cena" },
        { combo: "Duplicate (Scenes or bottom-right)", meaning: "Copiar cena, testar movimento" },
        { combo: "? or F1", meaning: "Ajuda (não na live)" },
      ],
    },
  ],
};

const pl: HowToDoc = {
  intro: "Tryb transmisji (B) ukrywa narzędzia. Figurkami poruszasz za pomocą klawiatury. Wypróbuj klawisze tutaj przed rozpoczęciem transmisji — te same klawisze działają podczas relacji na żywo. Na boisku nie ma nakładki samouczka. Ten panel oraz publiczny przewodnik stanowią instrukcję.",
  sections: [
    {
      heading: "Dlaczego klawiatura",
      paragraphs: [
        "Widzowie chcą widzieć boisko. Jeśli panel boczny pozostanie otwarty, zobaczysz menu, a nie taktykę. Tryb transmisji (B) ukrywa narzędzia. Pozostaje zaznaczanie, przesuwanie i obracanie.",
        "Nie musisz znać każdego skrótu. Niektórzy przesuwają całą linię. Niektórzy zaznaczają tylko gospodarzy. Niektórzy kopiują scenę i porównują dwa ustawienia. Ucz się tylko tych klawiszy, z których korzystasz.",
      ],
    },
    {
      heading: "Zaznaczanie figurek",
      paragraphs: [
        "Najpierw dokonaj zaznaczenia — linii, bloku krycia lub tylko gospodarzy — a następnie przesuń. Jeśli najpierw zaczniesz przesuwać, będziesz przeciągać figurki po jednej.",
        "Przeciągnij po pustej trawie, aby narysować ramkę i zaznaczyć figurki w środku. Figurki nie mają etykiet ról (np. ŚBO), więc obrysuj ramką linię obrony. Przytrzymaj Ctrl lub Cmd podczas przeciągania, aby dodać do bieżącego zaznaczenia.",
        "Szybkie kliknięcie bez ruchu czyszcza zaznaczenie. Kliknięcie pustej trawy z przytrzymanym Ctrl lub Cmd nie czyści go.",
      ],
      keys: [
        { combo: "Click", meaning: "Zaznacz jedną figurkę" },
        { combo: "Ctrl/Cmd+Click", meaning: "Dodaj lub usuń" },
        { combo: "Shift+Click", meaning: "Dodaj (zachowaj resztę)" },
        { combo: "Drag empty grass", meaning: "Zaznacz ramką" },
        { combo: "Alt+1 / Alt+2", meaning: "Wszyscy gospodarze / goście" },
        { combo: "Ctrl/Cmd+A", meaning: "Zaznacz wszystkie widoczne" },
        { combo: "Esc", meaning: "Anuluj zaznaczenie" },
      ],
    },
    {
      heading: "Przesuwanie zaznaczenia",
      paragraphs: [
        "Przeciągnij dowolną zaznaczoną figurkę, a całe zaznaczenie przesunie się razem. Użyj tego do wyjścia linią, skoku w pressing lub przesunięcia z zachowaniem krycia. Upuszczenie zaznaczenia złożonego z wielu figurek nie zamienia koszulek. Zamiana działa tylko dla pojedynczej figurki.",
        "Klawisze strzałek przesuwają w małych krokach. Shift + strzałka robi większy krok. Użyj tego, gdy mówisz „jeszcze pół kroku” podczas transmisji.",
        "R zmienia tylko kierunek patrzenia. Pozycje pozostają bez zmian. Użyj, aby wyrównać blok. Q / E obracają cały kształt wokół środka zaznaczenia. Zaznacz dwie lub więcej figurek.",
        "- przybliża figurki do siebie. = oddala je. Środek zaznaczenia prawie się nie porusza — dobre dla zwartej lub szerokiej wysokiej linii.",
        "Shift+H odbija w lewo i prawo, łącznie z kierunkiem patrzenia. Shift+V odbija w górę i w dół. Ctrl/Cmd+D kopiuje figurki; kopie pozostają zaznaczone, więc możesz je od razu przesunąć.",
      ],
      keys: [
        { combo: "Drag a selected piece", meaning: "Przesuń całe zaznaczenie" },
        { combo: "Arrow / Shift+Arrow", meaning: "Koryguj (drobne / duże)" },
        { combo: "R", meaning: "Kierunek +45°" },
        { combo: "Q / E", meaning: "Obróć kształt wokół środka" },
        { combo: "- / =", meaning: "Bliżej / szerzej" },
        { combo: "Shift+H / Shift+V", meaning: "Odbij w poziomie / w pionie" },
        { combo: "Ctrl/Cmd+D", meaning: "Duplikuj (kopie zaznaczone)" },
        { combo: "Ctrl/Cmd+Shift+Arrow", meaning: "Wyrównaj do krawędzi lub osi" },
        { combo: "Alt+Shift+Arrow", meaning: "Równe odstępy (poziomo / pionowo)" },
        { combo: "Delete", meaning: "Usuń zaznaczone figurki" },
      ],
    },
    {
      heading: "Rysowanie przed transmisją",
      paragraphs: [
        "Przed transmisją użyj paska narzędzi do rysowania Podania, Biegu, Pióra i Połączenia. Podanie to ścieżka piłki — podanie, dośrodkowanie lub strzał. Bieg to ruch bez piłki. Drybling to zawodnik prowadzący piłkę.",
        "Pióro to swobodna linia, która nie jest Podaniem ani Biegiem — linia bloku lub krawędź korytarza. Przytrzymaj Shift podczas przeciągania Pióra, aby uzyskać linię prostą. Koła i pętle bez Shift pozostają rysowane od ręki. Połączenie łączy figurki; linia podąża za nimi, gdy je przesuwasz.",
      ],
      keys: [
        { combo: "Pass", meaning: "Ścieżka piłki (przerywana)" },
        { combo: "Run / Dribble", meaning: "Bieg lub drybling" },
        { combo: "Pen", meaning: "Linia swobodna" },
        { combo: "Link", meaning: "Połączenie figurek (podąża)" },
        { combo: "Shift+Pen drag", meaning: "Prosta linia A do B" },
        { combo: "Zone + Shift", meaning: "Strefa bliska koła" },
      ],
    },
    {
      heading: "Przesuwanie widoku",
      paragraphs: [
        "Zrób przybliżenie na stały fragment lub zobacz całą połowę — Ctrl lub Cmd + kółko myszy przybliża w stronę kursora. Przytrzymaj Spację i przeciągnij, aby przesuwać widok. Alt + przeciągnięcie również działa.",
      ],
      keys: [
        { combo: "Ctrl/Cmd+Wheel", meaning: "Zoom w miejscu kursora" },
        { combo: "Space+Drag", meaning: "Przesuń widok" },
        { combo: "Alt+Drag", meaning: "Przesuń widok (alternatywa)" },
      ],
    },
    {
      heading: "Przed i podczas transmisji",
      paragraphs: [
        "Przed rozpoczęciem meczu przećwicz podnoszenie i cofanie linii lub zaznaczanie gospodarzy i przybliżanie ich. Wtedy te klawisze będą działać w trybie transmisji. Naciśnij B, aby wejść w tryb transmisji. Nie otwieraj tej instrukcji (? / F1) podczas transmisji — pojawi się ona na ekranie.",
        "Przełączaj sceny za pomocą [ ]. Umieść rzut rożny i ustawienie asekuracji na osobnych scenach, a nie na jednym zatłoczonym rysunku.",
        "Aby wypróbować ruch i zachować oryginał, skopiuj scenę przed przesunięciem. Pierwsza scena pozostanie — wróć do niej za pomocą [ ]. Podczas transmisji użyj Duplikuj w prawym dolnym rogu. Nie ma przycisku resetowania do stanu początkowego. Kopiowanie sceny to sposób na zachowanie czystego oryginału.",
      ],
      keys: [
        { combo: "B", meaning: "Przełącz tryb transmisji" },
        { combo: "[ ] or PageUp/PageDown", meaning: "Przełącz sceny" },
        { combo: "Duplicate (Scenes or bottom-right)", meaning: "Kopiuj scenę, wypróbuj ruch" },
        { combo: "? or F1", meaning: "Instrukcja (nie na żywo)" },
      ],
    },
  ],
};

const de: HowToDoc = {
  intro: "Der Sendemodus (B) verbirgt die Werkzeuge. Du bewegst die Figuren mit der Tastatur. Teste die Shortcuts hier, bevor du live gehst — die Tasten funktionieren im Stream genauso. Es gibt kein Overlay-Tutorial auf dem Rasen. Dieses Panel und das öffentliche Handbuch sind die Anleitung.",
  sections: [
    {
      heading: "Warum Tastatur?",
      paragraphs: [
        "Die Zuschauer wollen das Spielfeld sehen. Wenn das Seitenpanel offen bleibt, sehen sie Menüs, keine Taktik. Der Sendemodus (B) verbirgt die Werkzeuge. Es bleiben nur noch: Auswählen, Bewegen und Drehen.",
        "Du musst nicht jeden Shortcut kennen. Manche verschieben die ganze Abwehrkette. Andere wählen nur das Heimteam aus. Wieder andere kopieren eine Szene, um zwei Formationen zu vergleichen. Lerne nur die Tasten, die du auch brauchst.",
      ],
    },
    {
      heading: "Figuren auswählen",
      paragraphs: [
        "Wähle zuerst aus — eine Kette, einen Pressing-Block oder nur Heim — und bewege sie dann. Wenn du zuerst ziehst, bewegst du nur eine Figur auf einmal.",
        "Ziehe auf dem freien Rasen, um eine Box aufzuziehen und die Figuren darin auszuwählen. Da es keine Positionsbezeichnungen wie IV gibt, ziehe einfach einen Rahmen um die Abwehrkette. Halte Ctrl oder Cmd beim Ziehen gedrückt, um der aktuellen Auswahl etwas hinzuzufügen.",
        "Ein kurzer Klick (ohne Mausbewegung) hebt die Auswahl auf. Klickst du mit gedrückter Ctrl- oder Cmd-Taste auf freien Rasen, bleibt die Auswahl bestehen.",
      ],
      keys: [
        { combo: "Click", meaning: "Eine Figur auswählen" },
        { combo: "Ctrl/Cmd+Click", meaning: "Hinzufügen oder entfernen" },
        { combo: "Shift+Click", meaning: "Hinzufügen (Rest behalten)" },
        { combo: "Drag empty grass", meaning: "Rahmen-Auswahl" },
        { combo: "Alt+1 / Alt+2", meaning: "Alle Heim / alle Auswärts" },
        { combo: "Ctrl/Cmd+A", meaning: "Alle sichtbaren auswählen" },
        { combo: "Esc", meaning: "Auswahl aufheben" },
      ],
    },
    {
      heading: "Auswahl bewegen",
      paragraphs: [
        "Ziehe eine beliebige ausgewählte Figur und die ganze Gruppe bewegt sich mit. Nutze das fürs Aufrücken, fürs Anlaufen oder fürs Verschieben, während die Deckung bestehen bleibt. Das Loslassen mehrerer Figuren führt nicht zum Spielerwechsel. Einwechslungen funktionieren nur mit einzelnen Figuren.",
        "Die Pfeiltasten bewegen in kleinen Schritten. Shift + Pfeiltaste macht einen größeren Schritt. Nutze das, wenn du im Stream sagst: \"Nur noch einen halben Schritt rüber\".",
        "R ändert nur die Blickrichtung. Die Positionen bleiben gleich. Ideal, um einen Block auszurichten. Q / E rotieren die ganze Form um die Mitte der Auswahl. Wähle dazu mindestens zwei Figuren aus.",
        "- schiebt die Figuren zusammen. = zieht sie auseinander. Die Mitte der Auswahl bewegt sich dabei kaum — gut für das Kompaktmachen oder Auseinanderziehen einer Kette.",
        "Shift+H spiegelt horizontal (links/rechts), inklusive Blickrichtung. Shift+V spiegelt vertikal (oben/unten). Ctrl/Cmd+D kopiert die Figuren; die Kopien bleiben ausgewählt, sodass du sie gleich an die richtige Stelle ziehen kannst.",
      ],
      keys: [
        { combo: "Drag a selected piece", meaning: "Die ganze Auswahl bewegen" },
        { combo: "Arrow / Shift+Arrow", meaning: "Bewegen (fein / grob)" },
        { combo: "R", meaning: "Nur Blickrichtung +45°" },
        { combo: "Q / E", meaning: "Form um das Zentrum rotieren" },
        { combo: "- / =", meaning: "Enger / breiter" },
        { combo: "Shift+H / Shift+V", meaning: "Horizontal / vertikal spiegeln" },
        { combo: "Ctrl/Cmd+D", meaning: "Duplizieren (Kopien sind ausgewählt)" },
        { combo: "Ctrl/Cmd+Shift+Arrow", meaning: "Am Rand oder der Achse ausrichten" },
        { combo: "Alt+Shift+Arrow", meaning: "Gleiche Abstände (H / V)" },
        { combo: "Delete", meaning: "Ausgewählte Figuren entfernen" },
      ],
    },
    {
      heading: "Vor dem Stream zeichnen",
      paragraphs: [
        "Nutze vor dem Stream die Werkzeuge für Pass, Lauf, Stift und Verbindung. Pass ist der Weg des Balls — Pass, Flanke oder Schuss. Lauf ist die Bewegung ohne Ball. Dribbling bedeutet, ein Spieler führt den Ball.",
        "Stift ist eine freie Linie, die weder Pass noch Lauf ist — z. B. eine Block-Linie oder die Begrenzung eines Halbraums. Halte Shift beim Zeichnen gedrückt, um eine gerade Linie zu erhalten. Kreise und freie Formen zeichnest du ohne Shift. Verbindung verknüpft Figuren; die Linie folgt ihnen, wenn du sie bewegst.",
      ],
      keys: [
        { combo: "Pass", meaning: "Weg des Balls (gestrichelt)" },
        { combo: "Run / Dribble", meaning: "Lauf oder Dribbling" },
        { combo: "Pen", meaning: "Freihandlinie" },
        { combo: "Link", meaning: "Figuren verbinden (folgt)" },
        { combo: "Shift+Pen drag", meaning: "Gerade Linie A nach B" },
        { combo: "Zone + Shift", meaning: "Kreisförmige Zone" },
      ],
    },
    {
      heading: "Kamera bewegen",
      paragraphs: [
        "Zoome an eine Standardsituation heran oder zeige die ganze Spielfeldhälfte — Ctrl oder Cmd + Mausrad zoomt dorthin, wo der Mauszeiger ist. Halte die Leertaste gedrückt und ziehe, um die Ansicht zu verschieben. Alt + Ziehen funktioniert genauso.",
      ],
      keys: [
        { combo: "Ctrl/Cmd+Wheel", meaning: "Zum Mauszeiger zoomen" },
        { combo: "Space+Drag", meaning: "Ansicht verschieben" },
        { combo: "Alt+Drag", meaning: "Ansicht verschieben (Alternativ)" },
      ],
    },
    {
      heading: "Vor und während des Streams",
      paragraphs: [
        "Übe vor dem Anpfiff kurz, eine Linie aufrücken zu lassen oder nur das Heimteam auszuwählen und enger zusammenzuschieben. Dann klappen diese Tasten auch im Sendemodus. Drücke B, um in den Sendemodus zu wechseln. Öffne dieses Handbuch (? / F1) nicht während des Streams — es wird sonst im Bild angezeigt.",
        "Wechsle die Szenen mit [ ]. Lege eine Ecke und das Gegenpressing auf zwei verschiedene Szenen, statt alles unübersichtlich in ein einziges Bild zu packen.",
        "Um eine Bewegung zu zeigen, aber das Original zu behalten, kopiere die Szene vor dem Ziehen. Die erste Szene bleibt erhalten — kehre mit [ ] zu ihr zurück. Nutze im Stream die Schaltfläche 'Duplizieren' unten rechts. Es gibt keinen Button, der alles auf Anfang zurücksetzt. Das Kopieren der Szene ist der Weg, um ein sauberes Original zu behalten.",
      ],
      keys: [
        { combo: "B", meaning: "Sendemodus umschalten" },
        { combo: "[ ] or PageUp/PageDown", meaning: "Szenen wechseln" },
        { combo: "Duplicate (Scenes or bottom-right)", meaning: "Szene kopieren, Aktion zeigen" },
        { combo: "? or F1", meaning: "Anleitung (nicht live öffnen)" },
      ],
    },
  ],
};

const fr: HowToDoc = {
  intro: "Le mode diffusion (B) masque les outils. Tu déplaces les figurines au clavier. Essaie les raccourcis ici avant de lancer ton live — ils fonctionneront à l'identique à l'écran. Il n'y a pas de tutoriel qui s'affiche sur le terrain. Ce panneau et le guide public servent de mode d'emploi.",
  sections: [
    {
      heading: "Pourquoi le clavier ?",
      paragraphs: [
        "Tes spectateurs veulent voir le terrain. Si tu laisses le panneau latéral ouvert, ils verront des menus, pas de la tactique. Le mode diffusion (B) masque les outils. Il ne te reste qu'à sélectionner, déplacer et pivoter.",
        "Tu n'as pas besoin de retenir tous les raccourcis. Certains bougent toute la ligne de défense. D'autres sélectionnent uniquement l'équipe à domicile. Certains copient une scène pour comparer deux animations. Apprends juste les touches dont tu as besoin.",
      ],
    },
    {
      heading: "Sélectionner des figurines",
      paragraphs: [
        "Fais d'abord ta sélection — une ligne, un bloc défensif, ou juste l'équipe à domicile — et ensuite déplace-la. Si tu commences par déplacer, tu glisseras les figurines une par une.",
        "Glisse sur la pelouse vide pour dessiner un cadre et sélectionner les joueurs à l'intérieur. Les figurines n'ont pas de rôle comme DC, donc encadre simplement la ligne arrière. Maintiens Ctrl ou Cmd en glissant pour ajouter à la sélection actuelle.",
        "Un petit clic rapide sans bouger annule la sélection. Cliquer sur la pelouse en maintenant Ctrl ou Cmd ne l'annule pas.",
      ],
      keys: [
        { combo: "Click", meaning: "Sélectionner une figurine" },
        { combo: "Ctrl/Cmd+Click", meaning: "Ajouter ou retirer" },
        { combo: "Shift+Click", meaning: "Ajouter (garder le reste)" },
        { combo: "Drag empty grass", meaning: "Sélection en cadre" },
        { combo: "Alt+1 / Alt+2", meaning: "Tous les joueurs Domicile / Extérieur" },
        { combo: "Ctrl/Cmd+A", meaning: "Sélectionner tout ce qui est visible" },
        { combo: "Esc", meaning: "Annuler la sélection" },
      ],
    },
    {
      heading: "Déplacer la sélection",
      paragraphs: [
        "Glisse n'importe quelle figurine sélectionnée et tout le groupe se déplacera ensemble. Pratique pour faire monter la ligne, déclencher le pressing ou faire coulisser le bloc avec les marquages. Lâcher une sélection multiple sur le banc ne remplace pas les maillots. Le changement de joueur ne fonctionne qu'un par un.",
        "Les flèches déplacent par petits pas. Maj + flèche fait un plus grand pas. Utilise ça quand tu dis \"juste un demi-mètre\" en plein live.",
        "R ne change que l'orientation. Les positions restent les mêmes. Parfait pour réorienter un bloc. Q / E font pivoter toute la forme autour du centre de la sélection. Sélectionne au moins deux joueurs.",
        "- resserre les joueurs. = les écarte. Le centre de la sélection bouge à peine — idéal pour compacter ou écarter une ligne haute.",
        "Maj+H inverse la gauche et la droite, y compris l'orientation. Maj+V inverse le haut et le bas. Ctrl/Cmd+D copie les figurines ; les copies restent sélectionnées pour pouvoir les aligner facilement.",
      ],
      keys: [
        { combo: "Drag a selected piece", meaning: "Déplacer toute la sélection" },
        { combo: "Arrow / Shift+Arrow", meaning: "Ajuster (petit / grand pas)" },
        { combo: "R", meaning: "Orientation +45° uniquement" },
        { combo: "Q / E", meaning: "Faire pivoter la forme depuis le centre" },
        { combo: "- / =", meaning: "Resserrer / écarter" },
        { combo: "Shift+H / Shift+V", meaning: "Inverser Horizontalement / Verticalement" },
        { combo: "Ctrl/Cmd+D", meaning: "Dupliquer (copies sélectionnées)" },
        { combo: "Ctrl/Cmd+Shift+Arrow", meaning: "Aligner sur le bord ou l'axe" },
        { combo: "Alt+Shift+Arrow", meaning: "Espacement égal (H / V)" },
        { combo: "Delete", meaning: "Supprimer les figurines sélectionnées" },
      ],
    },
    {
      heading: "Dessiner avant le direct",
      paragraphs: [
        "Avant ton live, utilise la barre d'outils pour Passe, Course, Stylo et Lien. La passe est la trajectoire du ballon — passe, centre ou tir. La course est un appel de balle. Le dribble est un joueur qui porte le ballon.",
        "Stylo est une ligne libre (ni Passe ni Course) — pour dessiner un bloc ou une zone. Maintiens Maj en glissant le Stylo pour faire une ligne droite. Les ronds restent tracés à la main (sans Maj). Lien connecte les figurines ; le trait les suit quand tu les déplaces.",
      ],
      keys: [
        { combo: "Pass", meaning: "Trajectoire du ballon (pointillés)" },
        { combo: "Run / Dribble", meaning: "Appel de balle ou dribble" },
        { combo: "Pen", meaning: "Ligne libre" },
        { combo: "Link", meaning: "Lien entre figurines (suit le mouvement)" },
        { combo: "Shift+Pen drag", meaning: "Ligne droite A vers B" },
        { combo: "Zone + Shift", meaning: "Zone quasi-circulaire" },
      ],
    },
    {
      heading: "Déplacer la vue",
      paragraphs: [
        "Zoome sur un coup de pied arrêté ou regarde toute la moitié de terrain — Ctrl ou Cmd + molette zoome vers le pointeur. Maintiens la barre Espace et glisse pour déplacer la caméra. Alt + glisser marche aussi.",
      ],
      keys: [
        { combo: "Ctrl/Cmd+Wheel", meaning: "Zoom sur le curseur" },
        { combo: "Space+Drag", meaning: "Déplacer la caméra" },
        { combo: "Alt+Drag", meaning: "Déplacer la caméra (alternatif)" },
      ],
    },
    {
      heading: "Avant et pendant le live",
      paragraphs: [
        "Avant le coup d'envoi, entraîne-toi à monter et redescendre la ligne, ou à sélectionner l'équipe à domicile pour resserrer l'axe. Ensuite, ces touches marcheront en mode diffusion. Appuie sur B pour passer en mode diffusion. N'ouvre pas ce guide (? / F1) pendant le direct — ça se verra à l'écran.",
        "Change de scène avec [ ]. Mets un corner et une animation de contre-pressing sur deux scènes différentes, au lieu de surcharger un seul dessin.",
        "Pour tester un mouvement en gardant l'original, copie la scène avant de glisser. La première scène restera intacte — reviens-y avec [ ]. Pendant le direct, utilise Dupliquer en bas à droite. Il n'y a pas de bouton pour revenir au tout début. Copier la scène est le meilleur moyen de garder un original propre.",
      ],
      keys: [
        { combo: "B", meaning: "Basculer en mode diffusion" },
        { combo: "[ ] or PageUp/PageDown", meaning: "Changer de scène" },
        { combo: "Duplicate (Scenes or bottom-right)", meaning: "Copier la scène, tester un mouvement" },
        { combo: "? or F1", meaning: "Mode d'emploi (pas en direct)" },
      ],
    },
  ],
};

const tr: HowToDoc = {
  intro: "Yayın modu (B) araçları gizler. Figürleri klavyeyle hareket ettirirsin. Yayına girmeden önce kısayolları burada test et — aynı tuşlar yayında da çalışır. Çim üzerinde başlangıç rehberi yoktur. Bu panel ve açık rehber kullanım kılavuzundur.",
  sections: [
    {
      heading: "Neden klavye?",
      paragraphs: [
        "Seyirciler sahayı görmek ister. Eğer yan panel açık kalırsa, taktiği değil menüleri görürler. Yayın modu (B) araçları gizler. Geriye sadece seçmek, hareket ettirmek ve döndürmek kalır.",
        "Tüm kısayolları bilmen gerekmez. Bazıları tüm hattı kaydırır. Bazıları sadece ev sahibi takımı seçer. Bazıları ise iki şekli karşılaştırmak için sahneyi kopyalar. Sadece kullandığın tuşları öğrenmen yeterli.",
      ],
    },
    {
      heading: "Figürleri seçmek",
      paragraphs: [
        "Önce seçimi yap — bir savunma hattı, markaj bloğu veya sadece ev sahibi — ve sonra hareket ettir. Eğer önce hareket ettirmeye başlarsan, figürleri tek tek sürüklemiş olursun.",
        "Boş çim üzerinde sürükleyerek bir kutu oluştur ve içindeki figürleri seç. Figürlerin STP gibi rol etiketleri yoktur, bu yüzden savunma hattının etrafını kutuyla çiz. Sürüklerken Ctrl veya Cmd tuşunu basılı tutarak mevcut seçime ekleme yapabilirsin.",
        "Neredeyse hiç hareket etmeden yapılan küçük bir tıklama seçimi temizler. Boş çime Ctrl veya Cmd basılıyken tıklamak ise seçimi temizlemez.",
      ],
      keys: [
        { combo: "Click", meaning: "Bir figürü seç" },
        { combo: "Ctrl/Cmd+Click", meaning: "Ekle veya çıkar" },
        { combo: "Shift+Click", meaning: "Ekle (diğerlerini tut)" },
        { combo: "Drag empty grass", meaning: "Kutuyla seç" },
        { combo: "Alt+1 / Alt+2", meaning: "Tüm Ev / Tüm Deplasman" },
        { combo: "Ctrl/Cmd+A", meaning: "Görünür tüm figürleri seç" },
        { combo: "Esc", meaning: "Seçimi temizle" },
      ],
    },
    {
      heading: "Seçimi hareket ettirmek",
      paragraphs: [
        "Seçili figürlerden herhangi birini sürüklediğinde tüm grup birlikte hareket eder. Bunu hattı çıkarmak, prese kalkmak veya markajları koruyarak kaymak için kullan. Birden fazla figür seçiliyken bırakmak formaları değiştirmez. Değişiklik sadece tek bir figür için çalışır.",
        "Yön tuşları küçük adımlarla hareket ettirir. Shift + yön tuşu daha büyük bir adım atar. Yayında \"yarım adım daha\" dediğin zamanlarda bunu kullan.",
        "R sadece baktığı yönü değiştirir. Konumlar aynı kalır. Bir bloğu hizalamak için bunu kullan. Q / E tüm şekli seçimin merkezine göre döndürür. İki veya daha fazla figür seçin.",
        "- figürleri birbirine yaklaştırır. = onları uzaklaştırır. Seçimin merkezi pek hareket etmez — sıkı veya geniş bir savunma hattı için idealdir.",
        "Shift+H baktığı yön de dahil sağ-sol olarak aynalar. Shift+V alt-üst olarak çevirir. Ctrl/Cmd+D figürleri kopyalar; kopyalar seçili kalır, böylece eşleştirmek için hemen kaydırabilirsin.",
      ],
      keys: [
        { combo: "Drag a selected piece", meaning: "Tüm seçimi hareket ettir" },
        { combo: "Arrow / Shift+Arrow", meaning: "Kalkındır (kısa / uzun)" },
        { combo: "R", meaning: "Sadece yönü +45°" },
        { combo: "Q / E", meaning: "Şekli merkez etrafında döndür" },
        { combo: "- / =", meaning: "Yaklaştır / uzaklaştır" },
        { combo: "Shift+H / Shift+V", meaning: "Yatay çevir / Dikey çevir" },
        { combo: "Ctrl/Cmd+D", meaning: "Çoğalt (kopyalar seçili kalır)" },
        { combo: "Ctrl/Cmd+Shift+Arrow", meaning: "Kenara veya eksene hizala" },
        { combo: "Alt+Shift+Arrow", meaning: "Eşit aralıkla (Yatay / Dikey)" },
        { combo: "Delete", meaning: "Seçili figürleri sil" },
      ],
    },
    {
      heading: "Yayından önce çizmek",
      paragraphs: [
        "Yayından önce araç çubuğunu kullanarak Pas, Koşu, Kalem ve Bağlantı araçlarını kullan. Pas topun yoludur — pas, orta veya şut. Koşu topsuz harekettir. Dripling ise oyuncunun topla hareket etmesidir.",
        "Kalem, Pas veya Koşu olmayan serbest bir çizgidir — bir blok çizgisi veya koridor kenarı. Düz bir çizgi çekmek için Kalem ile sürüklerken Shift tuşuna basılı tut. Daireler ve kavisler Shift olmadan serbest çizilir. Bağlantı figürleri birbirine bağlar; figürleri hareket ettirdiğinde çizgi de onları izler.",
      ],
      keys: [
        { combo: "Pass", meaning: "Top yolu (kesik çizgi)" },
        { combo: "Run / Dribble", meaning: "Koşu veya dripling" },
        { combo: "Pen", meaning: "Serbest çizgi" },
        { combo: "Link", meaning: "Figür bağlantısı (izler)" },
        { combo: "Shift+Pen drag", meaning: "A'dan B'ye düz çizgi" },
        { combo: "Zone + Shift", meaning: "Daireye yakın bölge" },
      ],
    },
    {
      heading: "Kamerayı hareket ettirmek",
      paragraphs: [
        "Bir duran topa yaklaş veya yarı sahanın tamamını gör — Ctrl veya Cmd + tekerlek, imlece doğru yakınlaştırır. Boşluk tuşuna basılı tutarak sürüklemek görünümü kaydırır. Alt + sürükle de aynı işi görür.",
      ],
      keys: [
        { combo: "Ctrl/Cmd+Wheel", meaning: "İmleç konumuna yakınlaştır" },
        { combo: "Space+Drag", meaning: "Görünümü kaydır" },
        { combo: "Alt+Drag", meaning: "Kaydır (alternatif)" },
      ],
    },
    {
      heading: "Yayın öncesi ve sırası",
      paragraphs: [
        "Başlama vuruşundan önce bir hattı ileri alıp geri getirmeyi veya sadece ev sahibini seçip yaklaştırmayı pratik et. O zaman bu tuşlar yayın modunda da çalışacaktır. Yayın moduna geçmek için B'ye bas. Yayındayken bu rehberi (? / F1) açma — ekranda görünür.",
        "Sahneleri [ ] ile değiştir. Bir korneri ve karşı pres pozisyonunu tek bir karmaşık çizim yerine ayrı sahnelere yerleştir.",
        "Bir hareketi denemek ama orijinalini korumak için kaydırmadan önce sahneyi kopyala. İlk sahne kalır — [ ] ile geri dönebilirsin. Yayındayken sağ alttaki Çoğalt butonunu kullan. Başlangıca dön diye bir buton yoktur. Orijinali temiz tutmanın yolu sahneyi kopyalamaktır.",
      ],
      keys: [
        { combo: "B", meaning: "Yayın modunu aç/kapat" },
        { combo: "[ ] or PageUp/PageDown", meaning: "Sahneleri değiştir" },
        { combo: "Duplicate (Scenes or bottom-right)", meaning: "Sahneyi kopyala, bir hareket dene" },
        { combo: "? or F1", meaning: "Nasıl kullanılır (yayında olmaz)" },
      ],
    },
  ],
};

export const HOW_TO: Record<Locale, HowToDoc> = { ja, en, es, pt, pl, de, fr, tr };
