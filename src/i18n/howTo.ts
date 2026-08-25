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
    "配信モードではツールが消えます。だから駒の操作はキーボードが本体です。本番の前にここで一度動かしておくと、オンエアでも同じ手が使えます。芝の上に初回チュートリアルは出しません。この画面と公開ガイドが説明書です。",
  sections: [
    {
      heading: "なぜキーボードなのか",
      paragraphs: [
        "視聴者が見ているのはピッチです。パネルを開いたままキャプチャすると、解説ではなくソフトの枠が写ります。配信モードは枠を消すためのモードです。消えたあとに残る操作が、選択・移動・回転です。",
        "使わないコマンドがあっても構いません。ラインを一塊でずらす人、ホームだけ選ぶ人、複製して対になる形を残す人。必要なものだけ覚えれば足ります。",
      ],
    },
    {
      heading: "駒を選ぶ",
      paragraphs: [
        "一本のライン、マークを貼ったままのブロック、ホームだけ、という塊を先に選びます。選んだあとで動かす。順番を逆にすると、一人ずつ運ぶことになります。",
        "芝の空き地をドラッグすると範囲選択になります。CBだけ、という役割ラベルは駒に無いので、バックラインは枠で囲みます。Ctrl または Cmd を押しながら枠を引くと、今の選択に足します。",
        "小さなクリック（ほとんど動かさない）は選択解除です。修飾キーを押したままの空き地クリックでは、選択は消えません。",
      ],
      keys: [
        { combo: "Click", meaning: "その駒だけ選ぶ" },
        { combo: "Ctrl/Cmd+Click", meaning: "選択に足す／外す" },
        { combo: "Shift+Click", meaning: "選択に足す（外さない）" },
        { combo: "Drag empty grass", meaning: "範囲選択" },
        { combo: "Alt+1 / Alt+2", meaning: "ホーム／アウェイ全員" },
        { combo: "Ctrl/Cmd+A", meaning: "見えている駒を全選択" },
        { combo: "Esc", meaning: "選択を解除" },
      ],
    },
    {
      heading: "塊のまま動かす",
      paragraphs: [
        "選んだ駒のどれかをドラッグすると、相対位置を保ったまま平行移動します。ラインの上げ下げ、プレスの一段前、マークを貼ったままスライド、がこの操作です。複数のままドロップしたときは入れ替えません。入れ替えは一人のときだけです。",
        "矢印は細かい位置。Shift を足すと歩幅が上がります。配信中に「もう半歩」と言いながら使う想定です。",
        "R は向きだけです。位置は変わりません。ブロックの向きを揃えるときに使います。形そのものを斜めにしたいときは Q / E です。塊の重心を軸に回します。二人以上選んでください。",
        "ハイラインをコンパクトにする、あるいは開くのは - と = です。重心からの距離を縮める／伸ばすので、中心はあまり動きません。",
        "左右の攻撃方向を入れ替えるなら Shift+H。縦に折り返すなら Shift+V。向きも反転します。複製は Ctrl/Cmd+D。コピーが選ばれた状態になるので、すぐずらして対になる絵にできます。",
      ],
      keys: [
        { combo: "Drag a selected piece", meaning: "選択全員を平行移動" },
        { combo: "Arrow / Shift+Arrow", meaning: "ナッジ（細かい／大きめ）" },
        { combo: "R", meaning: "向きだけ +45°" },
        { combo: "Q / E", meaning: "重心まわりに形を回す" },
        { combo: "- / =", meaning: "コンパクト／開く" },
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
        "配信前にパス・ラン・ペンを引くなら、ツールレールを使います。Pass はボールの軌道（パス・クロス・シュート）。Run は走り。Dribble は運ぶ人です。",
        "ペンはパスでもランでもない一本です。ブロックの線、守備チェーン、チャネルの境界。Shift を押したままドラッグすると直線になります（Figma と同じ）。丸や囲みは Shift なしの自由描きです。",
      ],
      keys: [
        { combo: "Pass", meaning: "ボールの軌道（破線）。駒は動かない" },
        { combo: "Run / Dribble", meaning: "走り／ドリブル（駒からドラッグ可）" },
        { combo: "Pen", meaning: "自由記述のインク" },
        { combo: "Shift+Pen drag", meaning: "始点–終点の直線" },
        { combo: "Zone + Shift", meaning: "正円に近いゾーン" },
      ],
    },
    {
      heading: "配信の前後",
      paragraphs: [
        "本番前に、ラインを上げて戻し、ホームだけ選んでコンパクトにする、まで一度やっておくと、オンエアで手が止まりません。B で配信モードに入ります。この使い方画面は配信中には出しません。キャプチャを食うからです。",
        "局面の切り替えは [ ] です。セットプレーとレストディフェンスは一枚に重ねず、局面を分けて切り替えたほうが視聴者は読めます。",
      ],
      keys: [
        { combo: "B", meaning: "配信モードの入切" },
        { combo: "[ ] or PageUp/PageDown", meaning: "局面を切り替え" },
        { combo: "? or F1", meaning: "この使い方（配信中は出さない）" },
      ],
    },
  ],
};

const en: HowToDoc = {
  intro:
    "Broadcast mode hides the tools. Piece work is then a keyboard job. Rehearse here before you go live and the same hands work on air. There is no first-run overlay on the grass. This panel and the public guide are the manual.",
  sections: [
    {
      heading: "Why the keyboard",
      paragraphs: [
        "Viewers came for the pitch. Capture a panel and you are showing chrome, not the pattern. Broadcast mode exists to hide that chrome. What remains is select, move, and turn.",
        "You do not have to use every command. Some hosts only shift a line. Some only grab home. Some duplicate a shape and keep the pair. Learn the ones you will actually press.",
      ],
    },
    {
      heading: "Select a group",
      paragraphs: [
        "Pick the block first — a line, a marking pair, home only — then move it. The other way around is ferrying people one by one.",
        "Drag empty grass for a marquee. Pieces do not carry a CB label, so a back line is a box you draw. Hold Ctrl or Cmd while you drag to add to the current selection.",
        "A tiny click (almost no movement) clears the selection. A click on empty grass with a modifier does not.",
      ],
      keys: [
        { combo: "Click", meaning: "Select that piece only" },
        { combo: "Ctrl/Cmd+Click", meaning: "Add or remove" },
        { combo: "Shift+Click", meaning: "Add (do not remove)" },
        { combo: "Drag empty grass", meaning: "Marquee select" },
        { combo: "Alt+1 / Alt+2", meaning: "All home / all away" },
        { combo: "Ctrl/Cmd+A", meaning: "Select every visible piece" },
        { combo: "Esc", meaning: "Clear the selection" },
      ],
    },
    {
      heading: "Move the block",
      paragraphs: [
        "Drag any selected piece and the group translates together. That is a line step, a press jump, or a slide with the mark still on. A group drop does not swap. Swap is for a single piece.",
        "Arrows nudge. Shift makes a larger step. The intended use is the half-yard you mention while talking.",
        "R turns facing only. Positions stay. Use it to square a block. To rotate the shape itself, use Q / E around the group’s centre. Select two or more.",
        "- packs toward the centre. = spreads. The centroid barely moves, which is what you want for a high line that gets compact.",
        "Shift+H mirrors left-right, including facing. Shift+V flips vertically. Ctrl/Cmd+D duplicates; the copies become the selection so you can slide them into a pair.",
      ],
      keys: [
        { combo: "Drag a selected piece", meaning: "Translate the whole selection" },
        { combo: "Arrow / Shift+Arrow", meaning: "Nudge (fine / coarse)" },
        { combo: "R", meaning: "Facing +45° only" },
        { combo: "Q / E", meaning: "Rotate the shape around its centre" },
        { combo: "- / =", meaning: "Pack / spread" },
        { combo: "Shift+H / Shift+V", meaning: "Flip horizontal / vertical" },
        { combo: "Ctrl/Cmd+D", meaning: "Duplicate (copies stay selected)" },
        { combo: "Ctrl/Cmd+Shift+Arrow", meaning: "Align to an edge or axis" },
        { combo: "Alt+Shift+Arrow", meaning: "Even spacing (left-right = x, up-down = y)" },
        { combo: "Delete", meaning: "Remove the selected pieces" },
      ],
    },
    {
      heading: "Draw in prep",
      paragraphs: [
        "Before broadcast, use the tool rail for passes, runs, and pen marks. Pass is the ball path — pass, cross, or shot. Run is off-ball movement. Dribble is a carrier.",
        "Pen is the mark that is not a pass or a run: a block line, a defensive chain, a channel edge. Hold Shift while dragging Pen for a straight segment (same as Figma). Circles and loops stay freehand without Shift.",
      ],
      keys: [
        { combo: "Pass", meaning: "Ball path (dashed). Players stay put" },
        { combo: "Run / Dribble", meaning: "Run or dribble (drag from a piece)" },
        { combo: "Pen", meaning: "Freehand ink" },
        { combo: "Shift+Pen drag", meaning: "Straight line from start to end" },
        { combo: "Zone + Shift", meaning: "Near-circular zone" },
      ],
    },
    {
      heading: "Before and on air",
      paragraphs: [
        "Before kick-off, raise a line and put it back, select home and pack them. If that is in the hands, it will still be there in broadcast. B enters broadcast. This how-to does not open on air; it would eat the capture.",
        "Scenes switch with [ ]. A corner and a rest-defence shape belong on two frames, not one crowded drawing.",
      ],
      keys: [
        { combo: "B", meaning: "Enter or leave broadcast" },
        { combo: "[ ] or PageUp/PageDown", meaning: "Cycle scenes" },
        { combo: "? or F1", meaning: "This how-to (not during broadcast)" },
      ],
    },
  ],
};

export const HOW_TO: Record<Locale, HowToDoc> = { ja, en };
