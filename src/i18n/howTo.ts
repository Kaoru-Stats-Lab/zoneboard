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
        "配信前に Pass・Run・Pen・Link を引くなら、ツールレールを使います。Pass はボールの道（パス・クロス・シュート）。Run は走る動き。Dribble はボールを運ぶ人です。",
        "Pen は Pass でも Run でもない自由な線です。ブロックの線、チャネルの境界など。Shift を押したままドラッグすると直線になります。丸や囲みは Shift なしの自由描きです。Link は駒をクリックしてつなぎ、駒を動かしても線が追従します。",
      ],
      keys: [
        { combo: "Pass", meaning: "ボールの道（破線）" },
        { combo: "Run / Dribble", meaning: "走り／ドリブル" },
        { combo: "Pen", meaning: "自由な線" },
        { combo: "Link", meaning: "駒どうしのリンク" },
        { combo: "Shift+Pen drag", meaning: "始点–終点の直線" },
        { combo: "Zone + Shift", meaning: "正円に近いゾーン" },
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
        { combo: "Duplicate (Scenes or broadcast chrome)", meaning: "局面を複製して試す" },
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
      heading: "Before and during the stream",
      paragraphs: [
        "Before kick-off, practise raising a line and putting it back, or selecting home and moving them closer. Then those keys still work in broadcast mode. Press B for broadcast mode. Do not open this how-to (? / F1) during the stream — it appears on screen.",
        "Switch scenes with [ ]. Put a corner kick and a rest-defence shape on separate scenes, not one crowded drawing.",
        "To try a move and keep the original, copy the scene before you drag. The first scene stays — go back with [ ]. During the stream, use Duplicate in the bottom-right corner. There is no reset-to-start button. Copying the scene is how you keep a clean original.",
      ],
      keys: [
        { combo: "B", meaning: "Toggle broadcast mode" },
        { combo: "[ ] or PageUp/PageDown", meaning: "Switch scenes" },
        { combo: "Duplicate (Scenes or broadcast chrome)", meaning: "Copy scene, try a move" },
        { combo: "? or F1", meaning: "How-to (not live)" },
      ],
    },
  ],
};

export const HOW_TO: Record<Locale, HowToDoc> = { ja, en };
