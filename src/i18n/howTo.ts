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

export const HOW_TO: Record<Locale, HowToDoc> = { ja, en, es, pt, pl };
