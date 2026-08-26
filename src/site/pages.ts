import { PUBLISHER, type SiteSlug } from "./publisher.ts";

/** Japanese fields stay for a later /ja/ surface. The public HTML is English only. */

export type SiteSection = {
  /** Stable deep-link fragment. Defaults from headingEn via slugify. */
  id?: string;
  headingEn: string;
  headingJa: string;
  en: string[];
  ja: string[];
};

export type SitePage = {
  slug: SiteSlug;
  titleEn: string;
  titleJa: string;
  descriptionEn: string;
  descriptionJa: string;
  ledeEn: string;
  ledeJa: string;
  sections: SiteSection[];
  showContactForm?: boolean;
};

export const SITE_PAGES: SitePage[] = [
  {
    slug: "about",
    titleEn: "About ZoneBoard",
    titleJa: "ZoneBoard について",
    descriptionEn:
      "Football tactics board for OBS streams. Place an XI, draw the move, press B — tools hide, the pitch fills the window. Cam and chat stay in OBS.",
    descriptionJa:
      "OBS 配信向けのサッカー戦術ボード。スタメンを置き、動きを描き、B でツールを消す。ピッチが窓を埋め、顔とチャットは OBS のまま。",
    ledeEn:
      "ZoneBoard is a browser tactics board built for people who explain football on a stream. The pitch is the product. Tools stay out of the way. Nothing is stored on our servers unless you send optional feedback.",
    ledeJa:
      "ZoneBoard は、サッカーを配信で説明する人のためのブラウザ戦術ボードです。商品はピッチです。ツールは脇に置きます。任意のフィードバック以外、サーバにボードを送りません。",
    sections: [
      {
        headingEn: "What it is",
        headingJa: "何をする道具か",
        en: [
          "Most tactics tools are built like office software. They fill the screen with panels, icons, and menus, then leave a small court in the middle. That is fine for a coaching room. It fails on a stream, where the viewer came to see the pitch, the numbers, and the run — not the chrome around it.",
          "ZoneBoard inverts that. You place players, draw passes, runs, and dribbles, mark a zone, and write a short label. When you enter broadcast mode, the tools hide. The pitch stays. You capture the window in your broadcast software and keep the face camera and chat where they already are.",
          "There is no sign-up. The board lives in this browser. You can keep a few scenes, a roster, and a match banner. That is the job: set the lineup before kick-off, show the pattern during the match, and keep a diagram after the whistle if you need it for a recap.",
        ],
        ja: [
          "多くの戦術ツールはオフィスソフトの形をしています。パネルとアイコンとメニューが画面を占め、中央に小さいコートが残る。会議室ならそれでもよい。配信では失敗します。視聴者が見たいのはピッチと背番号と動きであり、周囲の枠ではないからです。",
          "ZoneBoard はその逆です。選手を置き、パス・ラン・ドリブルを描き、ゾーンを塗り、短い文字を置きます。配信モードに入るとツールは消えます。ピッチは残ります。配信ソフトでウィンドウキャプチャし、顔カメラとチャットは今の位置のままにできます。",
          "登録はありません。ボードはこのブラウザの中にあります。局面、名簿、試合帯を残せます。仕事はこれです。キックオフ前にスタメンを置く。試合中に型を見せる。必要なら笛のあとにも図を残す。",
        ],
      },
      {
        headingEn: "Who it is for",
        headingJa: "誰のためのものか",
        en: [
          "The first audience is the mid-size football stream: a host who already has a camera, a score bug, and a chat overlay, and who needs a pitch that does not force a new scene. Set-piece explainers, post-match recaps, and watch-along shows all use the same three moves — place, draw, show.",
          "Coaches and analysts can use the same board without streaming. The local save and the roster paste are there so a session can start from numbers, not from a blank cartoon. We do not run a player database. You type the numbers you actually have.",
          "We do not try to be a video editor, a scoreboard, or a community network. Those jobs belong to the rest of your stack. ZoneBoard stays a board.",
        ],
        ja: [
          "最初の利用者は、中規模のサッカー配信です。カメラ、スコア、チャットはすでにあり、新しいシーンを強制しないピッチが欲しい人。セットプレー解説、試合後の振り返り、同時視聴も、やることは同じです。置く、描く、出す。",
          "監督やアナリストも、配信せずに同じボードを使えます。ローカル保存と名簿の貼り付けがあるので、空のイラストではなく背番号から入れます。選手データベースは持ちません。実際に使う番号を自分で入れます。",
          "動画編集、スコアボード、コミュニティ運営にはなりません。それは他の道具の仕事です。ZoneBoard はボードのままです。",
        ],
      },
      {
        headingEn: "What we refuse to put on the pitch",
        headingJa: "ピッチに載せないもの",
        en: [
          "Advertising does not belong on the grass, and it does not belong in broadcast mode. The capture surface — court, pieces, match banner, and your own logo — stays an explanation surface. ZoneBoard will not insert an operator ad there. We will not add a user-configured ad slot there either.",
          "If we run Google AdSense, it will only appear on the site pages around the product: this about page, the guide, the FAQ, and similar reading pages. The landing page may carry ads later. The board window used on stream will not.",
          "We also do not force an operator watermark. If a logo sits on the pitch, it is the one you chose.",
        ],
        ja: [
          "広告は芝の上にも、配信モードにも置きません。キャプチャに乗る面（コート、駒、試合帯、あなたが選んだロゴ）は解説の面です。ZoneBoard 側の広告も、利用者が設定する広告枠も、そこには出しません。",
          "Google AdSense を載せる場合も、商品の周囲の読み物ページに限ります。この About、使い方、FAQ、同種の文書です。ランディングに広告を出すことはあります。配信で使うボード窓には出しません。",
          "運営の透かしも強制しません。ピッチ上のロゴは、あなたが選んだものだけです。",
        ],
      },
      {
        headingEn: "Who operates the site",
        headingJa: "運営者",
        en: [
          `${PUBLISHER.product} is operated by ${PUBLISHER.legalName}, based in ${PUBLISHER.countryEn}. The public site is ${PUBLISHER.siteUrl}. For privacy requests, legal notices, and product questions, use the contact page or ${PUBLISHER.email}.`,
          "This is a small product. There is no separate legal department and no player-data desk. If something on these pages is wrong, write to us and we will correct the text. The board itself is a client-side tool; we cannot see a diagram unless you paste it into feedback, which we ask you not to do.",
        ],
        ja: [
          `${PUBLISHER.product} の運営者は ${PUBLISHER.legalNameJa}（所在地: ${PUBLISHER.countryJa}）です。公開サイトは ${PUBLISHER.siteUrl}。プライバシーに関する請求、法的な通知、製品の質問は、連絡先ページまたは ${PUBLISHER.email} へ。`,
          "小さいプロダクトです。法務部も選手データ窓口もありません。これらのページの記述が間違っていれば書いてください。直します。ボード自体は端末側の道具です。図をフィードバックに貼らない限り、こちらから局面は見えません。貼らないでください。",
        ],
      },
    ],
  },
  {
    slug: "guide",
    titleEn: "How to show a move on stream",
    titleJa: "配信で動きを見せる",
    descriptionEn:
      "How to use ZoneBoard on stream: place the XI, draw the pattern, press B to hide tools, and window-capture beside the camera you already use.",
    descriptionJa:
      "配信での使い方。スタメンを置き、パターンを描き、B でツールを消し、いつものカメラの横でウィンドウキャプチャする。",
    ledeEn:
      "The board is not a second show. It is the pitch you add to a show you already run. This page is the long version of place, draw, and show.",
    ledeJa:
      "ボードは第二の番組ではありません。いま走っている番組に足すピッチです。このページは、置く・描く・出すの長い版です。",
    sections: [
      {
        id: "place",
        headingEn: "Before kick-off: place",
        headingJa: "キックオフ前: 置く",
        en: [
          "Open the board from the homepage. You do not create an account. Pick the football pitch if it is not already selected. Paste or type a roster if you have numbers ready. A line with a number is enough. A name and a preferred foot are optional. ZoneBoard will not invent a squad for you, and it will not scrape a league site.",
          "Put the starting eleven on the grass. The number on the piece is the number viewers can read from a distance. If you know a name, add it under the piece. If you do not, leave it. Plenty of regional matches are number-first. That is a product choice, not a missing feature.",
          "Use scenes when the first picture is not the only picture. A corner from the right, a corner from the left, and a rest-defence shape can live as three scenes instead of one crowded drawing. Switch with the scene list. Do not stack every arrow on a single frame unless that is the point of the graphic.",
        ],
        ja: [
          "ホームページからボードを開きます。アカウントは作りません。サッカーのピッチを選びます。番号が手元にあれば名簿を貼るか入力します。番号だけの行で足ります。名前と利き足は任意です。ZoneBoard がスタメンを代行作成することはなく、リーグサイトを取りに行くこともありません。",
          "芝の上にスタメンを置きます。駒の番号は、離れて見ても読める番号です。名前が分かるなら駒の下に足します。分からなければ空です。地方の試合は番号が先、ということがよくあります。欠けではなく、製品の選択です。",
          "最初の絵が唯一の絵でないなら局面を使います。右CK、左CK、レストディフェンスは、一枚に全部重ねず三局面に分けられます。局面リストで切り替えます。一枚に全部の矢印を載せるのは、それがその図の意図であるときに限ります。",
        ],
      },
      {
        id: "draw",
        headingEn: "During the pattern: draw",
        headingJa: "型を見せるとき: 描く",
        en: [
          "Pass, run, and dribble are different lines because they mean different things on a football graphic. A pass is a ball. A run is a body without the ball. A dribble is a carrier moving with it. If you use one colour for all three, the viewer has to guess. Use the labelled tools. Do not turn the pitch into a highlighter pack.",
          "Zones are for space, not for decoration. A pressing trap, a box to attack, or a rest-defence block should be large enough to read and transparent enough that the grass and the numbers still show. If a zone hides a player, the zone is wrong.",
          "Pen is for the one mark that is not a pass or a run: a block line, a cover shadow, a defensive chain between players, or a channel edge. Hold Shift while dragging Pen for a straight segment—the same habit as Figma. Circles and freehand loops stay unmodified. Text is for a short title on the picture, not for a paragraph. If you need a paragraph, say it with your voice. The board is the diagram.",
        ],
        ja: [
          "パス、ラン、ドリブルは線が違います。意味が違うからです。パスはボール。ランはボールを持たない体。ドリブルは運ぶ人です。三本を同じ色にすると、視聴者は推測します。名前のついたツールを使ってください。ピッチを蛍光ペンの束にしないでください。",
          "ゾーンは空間用であり、飾りではありません。プレスの罠、攻める箱、レストディフェンスの塊は、読める大きさで、芝と番号が残る透明度にします。ゾーンが選手を隠すなら、そのゾーンは失敗です。",
          "ペンは、パスでもランでもない一本です。ブロックの線、カバーシャドウ、選手どうしを結ぶ守備チェーン、チャネルの境界。Pen 使用中に Shift を押したままドラッグすると直線になります（Figma と同じ）。丸や囲みは Shift なしの自由描きです。文字は絵の短い題であり、段落ではありません。段落が必要なら声で言ってください。ボードは図です。",
        ],
      },
      {
        id: "show",
        headingEn: "On air: show",
        headingJa: "オンエア: 出す",
        en: [
          "Broadcast mode hides the tool rail and the side panel. That is the window you capture. Keep the board in its own window rather than replacing the whole scene. The usual layout — face, match, chat — stays. The pitch is an extra source.",
          "Window capture is the reliable path. A browser source that loads a different origin will not see the board you just built, because the board is local to this browser. If the grass goes blank in the encoder, you captured the wrong window.",
          "Zoom when the story is a corner or a box, not when you want the picture to feel expensive. A full pitch with readable numbers is better than a cropped fragment that loses the far-side runner. If you zoom, pan so the relevant penalty area sits in the frame, and leave the runoff green instead of a white letterbox.",
        ],
        ja: [
          "配信モードはツールレールとサイドパネルを消します。キャプチャするのはその窓です。シーン全体を置き換えず、ボードは別窓のままにします。いつもの顔・試合・チャットは残ります。ピッチは足すソースです。",
          "確実なのはウィンドウキャプチャです。別オリジンのブラウザソースは、いま組んだボードを見ません。ボードはこのブラウザのローカルだからです。エンコーダで芝が空白なら、窓を間違えています。",
          "ズームは、コーナーやボックスが話の中心であるときに使います。高級に見せるためではありません。読める番号の全体図のほうが、遠いランナーを切ったトリミングより正しいことが多いです。ズームするなら、関係するペナルティエリアを枠に入れ、余白は白のレターボックスではなく緑のランオフにします。",
        ],
      },
      {
        id: "after",
        headingEn: "After the match",
        headingJa: "試合のあと",
        en: [
          "A whiteboard is wiped. A ZoneBoard scene can stay. Export a still if you need a post, a community graphic, or a note for the next training. The export is a picture of the board you already made. It is not a second design tool.",
          "If you talk through a goal the next day, duplicate the scene rather than dragging the original out of shape. Keep the live graphic and the recap graphic as two pictures. Viewers who saw the stream will recognise the first; the second can be slower and labelled.",
        ],
        ja: [
          "白板は消えます。ZoneBoard の局面は残できます。投稿、コミュニティの図、次の練習のメモが必要なら、静止画を書き出します。書き出しは、すでに作ったボードの絵です。第二のデザインツールではありません。",
          "翌日に得点を話すなら、元の局面を崩さず複製します。ライブ用と振り返り用を二枚にします。配信を見た人は一枚目を覚えている。二枚目は遅く、文字を足してよい。",
        ],
      },
      {
        id: "rehearse",
        headingEn: "Rehearse the pieces before you go live",
        headingJa: "本番の前に、駒を動かす練習をする",
        en: [
          "Broadcast mode hides the rail and the drawer. That is the point: the capture should be the pitch. After the chrome is gone, the language for the pieces is the keyboard. If you have not pressed those keys in the editor, you will not have them on air. Practice is not a separate product. It is the same board, before B.",
          "Select a group first, then move it. Click one piece. Ctrl or Cmd-click to add or remove. Shift-click only adds. Drag empty grass for a marquee. There is no “CB” label on a piece, so a back line is a box you draw. Alt+1 and Alt+2 grab home and away. Ctrl or Cmd+A takes everyone still on the picture. Esc clears.",
          "Drag any selected piece and the group keeps its spacing. That is a line step, a press jump, or a slide with the mark still attached. Arrow keys nudge; Shift makes a larger step. R turns facing only. Q and E rotate the shape around its centre — two or more pieces. Minus packs toward that centre; equals spreads. Shift+H and Shift+V mirror. Ctrl or Cmd+D duplicates and leaves the copies selected. Ctrl or Cmd+Shift+arrows align. Alt+Shift+arrows even the gaps. A group drop does not swap shirts; swap is for one piece.",
          "In the editor, ? or F1 opens the same how-to. It is chrome, not grass, and it stays closed in broadcast so it cannot eat the capture. The public guide you are reading is the long copy. The in-app page is the one you can open between scenes.",
        ],
        ja: [
          "配信モードはレールと引き出しを消します。それが目的です。キャプチャに乗るのはピッチです。枠が消えたあと、駒の言葉はキーボードです。エディタで押していないキーは、オンエアでも出ません。練習は別プロダクトではありません。同じボードで、B の前にやることです。",
          "塊を先に選び、それから動かします。クリックは一人。Ctrl または Cmd クリックは足す／外す。Shift クリックは足すだけ。芝の空き地をドラッグすると範囲選択です。駒に CB というラベルは無いので、バックラインは枠で囲みます。Alt+1 と Alt+2 はホームとアウェイ。Ctrl または Cmd+A は絵に残っている全員。Esc で解除。",
          "選んだ駒のどれかをドラッグすると、間隔を保ったまま動きます。ラインの上げ下げ、プレスの一段、マークを貼ったままのスライドです。矢印はナッジ。Shift で歩幅が上がります。R は向きだけ。Q と E は重心まわりに形を回します。二人以上。マイナスは重心へ寄せ、イコールは開きます。Shift+H と Shift+V は反転。Ctrl または Cmd+D は複製し、コピーが選ばれます。Ctrl または Cmd+Shift+矢印は整列。Alt+Shift+矢印は間隔。複数のままドロップしても入れ替えません。入れ替えは一人のときです。",
          "エディタでは ? または F1 で同じ使い方が開きます。芝ではなく枠の側です。配信中は出さないので、キャプチャを食いません。いま読んでいる公開ガイドが長い版。アプリ内の画面は、局面と局面のあいだで開く版です。",
        ],
      },
      {
        id: "limits",
        headingEn: "What this guide will not promise",
        headingJa: "このガイドが約束しないこと",
        en: [
          "We will not promise a thirty-second setup for every match. A clean XI still takes the time the numbers take. We will not promise that a slide habit disappears. Some hosts will keep slides for tables and use ZoneBoard only for the pitch. That is a valid split.",
          "We will not put a tutorial overlay on the board the first time you open it. The tools are words. If a word is unclear, read this guide, the FAQ, or How to in the editor chrome (? / F1). That panel is not on the grass, and it does not open in broadcast.",
        ],
        ja: [
          "どの試合でも30秒で組める、とは言いません。きれいな XI は、番号の数だけ時間が要ります。スライド癖が消えるとも言いません。表はスライド、ピッチだけ ZoneBoard、という分け方は成立します。",
          "初回にボードへチュートリアルを重ねません。ツールは言葉です。言葉が分からなければ、このガイドと FAQ、またはエディタ枠の使い方（? / F1）を読んでください。あの画面は芝の上ではなく、配信中には開きません。",
        ],
      },
    ],
  },
  {
    slug: "faq",
    titleEn: "Frequently asked questions",
    titleJa: "よくある質問",
    descriptionEn:
      "FAQ: no account, local save, OBS window capture, sports, ads on info pages only, and how to contact the ZoneBoard operator.",
    descriptionJa:
      "FAQ。アカウントなし、端末内保存、OBS ウィンドウキャプチャ、競技、読み物ページのみの広告、運営への連絡方法。",
    ledeEn:
      "Short answers. If yours is missing, the contact page reaches the operator. Do not paste a full board into the form.",
    ledeJa:
      "短い回答です。ここに無いことは連絡先ページから運営へ。フォームにボード全体を貼らないでください。",
    sections: [
      {
        id: "account",
        headingEn: "Do I need an account?",
        headingJa: "アカウントは必要か",
        en: [
          "No. ZoneBoard does not create logins. The board you build stays in the browser you built it in, using local storage. If you clear site data, the board goes with it. Export a picture when you need a copy that survives a clear.",
        ],
        ja: [
          "不要です。ZoneBoard はログインを作りません。作ったボードは、作ったブラウザのローカル保存に残ります。サイトデータを消すとボードも消えます。残したいコピーが必要なら、絵を書き出してください。",
        ],
      },
      {
        id: "free",
        headingEn: "Is it free?",
        headingJa: "無料か",
        en: [
          "Yes. The board is free. No account, no card. If a paid plan appears later, it will be for named squads you reuse across matches — not for drawing, broadcast, or your logo. Details stay on the pricing page. There is no checkout today.",
        ],
        ja: [
          "はい。ボードは無料です。アカウントもカードも要りません。あとから有料プランが出るなら、試合をまたいで使う名前付きセット用であり、描画・配信・ロゴではありません。詳細は料金ページ。いま決済はありません。",
        ],
      },
      {
        id: "blank-encoder",
        headingEn: "Why is the pitch blank in my encoder?",
        headingJa: "エンコーダでピッチが空白になる",
        en: [
          "Capture the ZoneBoard window after you open the board in this browser. A browser source pointed at the homepage will not include a board that exists only as local data. Display capture can work, but it may pick up other windows. Window capture of the board in broadcast mode is the intended path.",
        ],
        ja: [
          "このブラウザでボードを開いたあと、その ZoneBoard の窓をキャプチャしてください。ホームページを向いたブラウザソースには、ローカルにしかないボードは含まれません。ディスプレイキャプチャでも写りますが、他の窓まで入ることがあります。配信モードのボード窓をウィンドウキャプチャするのが想定経路です。",
        ],
      },
      {
        id: "other-sports",
        headingEn: "Can I use this for futsal, basketball, or volleyball?",
        headingJa: "フットサル、バスケ、バレーでも使えるか",
        en: [
          "Football is the v1 surface. A futsal or beach pitch is a later football-family preset. Basketball and volleyball exist as related presets in the product plan, but the public site and the default board are football. Do not expect a full multi-sport suite on day one.",
        ],
        ja: [
          "v1 の面はサッカーです。フットサルやビーチは、あとのサッカー派生プリセットです。バスケとバレーは計画上の関連プリセットですが、公開サイトと既定ボードはサッカーです。初日に総合競技スイートを期待しないでください。",
        ],
      },
      {
        id: "ads-on-pitch",
        headingEn: "Will ads appear on the pitch?",
        headingJa: "ピッチに広告は出るか",
        en: [
          "No. Ads are not shown on the pitch and not shown in broadcast mode. If AdSense is enabled, it is limited to informational pages such as About, this FAQ, the guide, and possibly the landing page. The capture surface used on stream is kept clear on purpose.",
        ],
        ja: [
          "出ません。ピッチにも配信モードにも広告は出しません。AdSense を有効にする場合も、About、この FAQ、使い方、場合によってランディングなど、読み物のページに限ります。配信でキャプチャする面は、意図して空です。",
        ],
      },
      {
        id: "sell-data",
        headingEn: "Do you sell my roster or diagrams?",
        headingJa: "名簿や図は売られるか",
        en: [
          "No. Rosters and diagrams are not uploaded as part of normal use. Optional feedback is a short text message. We ask you not to paste personal data or a full tactical board into that form. See the privacy policy for what little we do receive.",
        ],
        ja: [
          "売りません。通常利用では名簿も図もアップロードしません。任意のフィードバックは短い文章です。個人情報や戦術ボード一式をそのフォームに貼らないでください。こちらが受け取るわずかな情報はプライバシーポリシーに書いてあります。",
        ],
      },
      {
        id: "contact",
        headingEn: "How do I contact you?",
        headingJa: "連絡方法",
        en: [
          `Use the contact page or email ${PUBLISHER.email}. There is also a feedback control on the landing page and in the editor. We read product notes. We do not run a live chat.`,
        ],
        ja: [
          `連絡先ページ、または ${PUBLISHER.email} へ。ランディングとエディタにもフィードバックがあります。製品のメモは読みます。ライブチャットはありません。`,
        ],
      },
      {
        id: "share-link",
        headingEn: "Can I share a link to the board I just built?",
        headingJa: "いま組んだボードを URL で共有できるか",
        en: [
          "Not as a live cloud document. There is no account and no server copy of your scenes. What you can share is a picture you export, or the same setup rebuilt on another machine. A shareable link would mean we hosted your diagram. We do not do that in this version, on purpose: the stream capture is a window, not a URL.",
        ],
        ja: [
          "クラウドのライブ文書としてはできません。アカウントも、局面のサーバコピーもありません。共有できるのは書き出した絵か、別の端末で同じ配置を組み直すことです。共有リンクは図をこちらが預かる、ということです。この版ではしません。配信キャプチャは URL ではなく窓です。",
        ],
      },
      {
        id: "tablet",
        headingEn: "Does it work on a tablet?",
        headingJa: "タブレットで使えるか",
        en: [
          "Yes. Place and drag with one finger. Pinch to zoom. Two-finger pan. Hotkeys are a PC extra, not a requirement. If a control is too small to hit, that is a product defect worth reporting. We are not shipping a separate app store package.",
        ],
        ja: [
          "使えます。1本指で置いてドラッグ。ピンチでズーム。2本指でパン。ホットキーは PC の加速であり、必須ではありません。当たりが小さすぎる操作があれば、それは欠陥なので報告してください。別のアプリストア版は出しません。",
        ],
      },
      {
        id: "word-tools",
        headingEn: "Why are the tools words instead of icons?",
        headingJa: "ツールがアイコンではなく言葉なのはなぜか",
        en: [
          "A streamer glancing at the rail needs to hit Pass, Run, or Dribble without decoding a pictogram. Those three lines mean different things on a football graphic. Words stay in the language of the show. Icons would save a few pixels and cost a second of hesitation. The rail is meant to disappear in broadcast mode anyway.",
        ],
        ja: [
          "レールを一目した配信者が、絵文字を解読せずにパス・ラン・ドリブルを押せることが必要です。三本の線はサッカーの図で意味が違います。言葉は番組の言語のままです。アイコンは数ピクセルを節約して、一秒の迷いを買います。配信モードではレールは消える前提です。",
        ],
      },
      {
        id: "player-db",
        headingEn: "Will you add a player database or predicted XIs?",
        headingJa: "選手 DB や予想スタメンは入るか",
        en: [
          "No. You paste numbers you actually have. A predicted-XI product is a different job, with different rights problems. ZoneBoard stays a board. If you want names under the pieces, type them. If you do not know the name, the number is enough.",
        ],
        ja: [
          "入れません。実際に使う番号を貼ります。予想スタメンは別の仕事で、権利の問題も違います。ZoneBoard はボードのままです。駒の下に名前が欲しければ自分で入れます。名前が分からなければ番号で足ります。",
        ],
      },
    ],
  },
  {
    slug: "pricing",
    titleEn: "Pricing",
    titleJa: "料金",
    descriptionEn:
      "ZoneBoard is free today. A future paid plan would be for named squads — not for the pitch, broadcast mode, or your logo.",
    descriptionJa:
      "いまは無料。将来の有料があれば名簿付きスクワッド向けで、ピッチ・配信モード・ロゴは対象外の方針です。",
    ledeEn: `Last updated ${PUBLISHER.updatedEn}. There is no checkout on this site today.`,
    ledeJa: `最終更新 ${PUBLISHER.updatedJa}。いまこのサイトに決済はありません。`,
    sections: [
      {
        headingEn: "Now",
        headingJa: "いま",
        en: [
          "The board is free. You do not create an account. You do not enter a card. Drawing, broadcast mode, local save, and your own logo watermark are part of that free board.",
          "We do not publish a price list until a payment form exists. A table of plans with no button that charges you would be a promise we cannot keep.",
        ],
        ja: [
          "ボードは無料です。アカウントは作りません。カードは使いません。描画、配信モード、ローカル保存、自分のロゴ透かしは、その無料のボードの一部です。",
          "決済フォームができるまで、価格表は出しません。課金できないプラン表は、守れない約束になります。",
        ],
      },
      {
        headingEn: "If we charge later",
        headingJa: "あとから課金する場合",
        en: [
          "If a paid plan appears, it will be for named squads: the lists of numbers and optional names you reuse from one match to the next. The free board will still let you paste a roster for the match you are on.",
          "The wedge is extra sets, not a locked pitch. Broadcast mode, drawing tools, and the logo you choose stay available without paying. We will not sell a free tier that cannot draw.",
          "Currency, tax, and the exact fee come with checkout — not before. English copy can sit next to a euro charge. That decision is separate from this page.",
        ],
        ja: [
          "有料プランが出るなら、名前付きセット用です。試合をまたいで使う背番号と任意の名前のリストです。無料ボードでも、いまの試合の名簿は貼れます。",
          "楔はセットの数であり、閉じたピッチではありません。配信モード、描画、選んだロゴは、払わなくても使えます。描けない無料枠は売りません。",
          "通貨、税、金額は決済と同時に出します。その前には出しません。英語の文面のままユーロ課金はできます。その判断はこのページとは別です。",
        ],
      },
      {
        headingEn: "What we will not sell",
        headingJa: "売らないもの",
        en: [
          "We will not put ads on the grass or in broadcast mode, as a free extra or as a paid extra. The window you capture for a stream is not a commercial break.",
          "We will not invent three product names to fill a pricing table. When checkout exists, the plans on this page will match the plans you can actually buy.",
        ],
        ja: [
          "芝の上と配信モードに、無料の特典としても有料の特典としても広告は出しません。配信でキャプチャする窓は、コマーシャルではありません。",
          "料金表を埋めるためだけの商品名は作りません。決済ができたとき、このページのプランは実際に買えるプランと一致します。",
        ],
      },
    ],
  },
  {
    slug: "materials",
    titleEn: "Brand materials",
    titleJa: "ブランド素材",
    descriptionEn:
      "End-card stings, brand files, and a stream-description blurb for Clipchamp and YouTube — after the capture, not on the live pitch.",
    descriptionJa:
      "Clipchamp / YouTube 用のエンドカード、ブランドファイル、配信説明用コピー。ライブのピッチ上ではなく、キャプチャのあとに使うもの。",
    ledeEn:
      "These files are for the end of a recording or VOD. They are not broadcast chrome. On stream, press B and capture the pitch. Use the stings when the board segment is over.",
    ledeJa:
      "これらのファイルは収録や VOD の末尾用です。配信中の chrome ではありません。配信中は B を押してピッチをキャプチャします。ボード区間が終わったあとにスティングを使います。",
    sections: [
      {
        headingEn: "Default end card",
        headingJa: "既定のエンドカード",
        en: [
          "Lockup sting (16:9) — the default for landscape timelines: https://zoneboard.app/brand/motion/exports/A/sting-lockup-plate-16x9.mp4",
          "Lockup sting (1:1) — square cuts: https://zoneboard.app/brand/motion/exports/A/sting-lockup-plate-1x1.mp4",
          "Still posters if you only need a freeze frame: https://zoneboard.app/brand/motion/exports/A/final-lockup-plate-16x9.png and https://zoneboard.app/brand/motion/exports/A/final-lockup-plate-1x1.png",
        ],
        ja: [
          "ロックアップスティング（16:9）— 横長タイムラインの既定: https://zoneboard.app/brand/motion/exports/A/sting-lockup-plate-16x9.mp4",
          "ロックアップスティング（1:1）— 正方形: https://zoneboard.app/brand/motion/exports/A/sting-lockup-plate-1x1.mp4",
          "静止ポスター: https://zoneboard.app/brand/motion/exports/A/final-lockup-plate-16x9.png と https://zoneboard.app/brand/motion/exports/A/final-lockup-plate-1x1.png",
        ],
      },
      {
        headingEn: "Mark-only (secondary)",
        headingJa: "マークのみ（副）",
        en: [
          "Shorter stings when the audience already knows the mark: https://zoneboard.app/brand/motion/exports/A/sting-plate-16x9.mp4 and https://zoneboard.app/brand/motion/exports/A/sting-plate-1x1.mp4",
          "Transparent overlay for compositing on footage (not a full-screen end card): https://zoneboard.app/brand/motion/exports/B/sting-clear-1x1.gif",
        ],
        ja: [
          "マークを知っている視聴者向けの短尺: https://zoneboard.app/brand/motion/exports/A/sting-plate-16x9.mp4 と https://zoneboard.app/brand/motion/exports/A/sting-plate-1x1.mp4",
          "映像に重ねる透明版（全画面エンドカードではない）: https://zoneboard.app/brand/motion/exports/B/sting-clear-1x1.gif",
        ],
      },
      {
        headingEn: "Clipchamp recipe",
        headingJa: "Clipchamp での使い方",
        en: [
          "1. Capture the ZoneBoard window in broadcast mode (tools hidden).",
          "2. When that segment ends, drop the lockup 16:9 MP4 for about three seconds.",
          "3. Do not loop the sting on the live show. Do not put it on the pitch during play.",
          "Interactive choreography preview (mark only): https://zoneboard.app/brand/motion/logo_motion.html",
          "Flat SVGs for other animation tools: https://zoneboard.app/brand/exports/",
        ],
        ja: [
          "1. 配信モード（ツール非表示）の ZoneBoard 窓をキャプチャする。",
          "2. その区間のあとに、ロックアップ 16:9 の MP4 を約3秒置く。",
          "3. 生放送でスティングをループしない。プレー中のピッチにも載せない。",
          "振り付けのインタラクティブ確認（マークのみ）: https://zoneboard.app/brand/motion/logo_motion.html",
          "他ツール向けフラット SVG: https://zoneboard.app/brand/exports/",
        ],
      },
      {
        headingEn: "PNG posts (optional credit)",
        headingJa: "PNG 投稿（任意クレジット）",
        en: [
          "When you export a still for social, Settings can add a small zoneboard.app line under the image frame. Off by default. It never appears on broadcast capture or the live pitch.",
        ],
        ja: [
          "SNS 用の PNG 書き出しでは、設定から画像枠の下に小さい zoneboard.app 行を足せます。既定オフ。配信用キャプチャやライブのピッチには入りません。",
        ],
      },
      {
        headingEn: "What this page is not",
        headingJa: "このページではないもの",
        en: [
          "It is not the landing pitch demo. The home page shows one board — broadcast capture — and stops there.",
          "It is not a license to put ZoneBoard chrome over someone else’s match feed. The sting brands your own board segment after you stop drawing.",
        ],
        ja: [
          "ランディングのピッチデモではありません。ホームはボードを一つだけ見せます。配信キャプチャです。",
          "他人の試合映像の上に ZoneBoard の枠を載せる許可でもありません。スティングは、あなたが描き終えたボード区間のあとにブランドを置くためのものです。",
        ],
      },
    ],
  },
  {
    slug: "updates",
    titleEn: "Updates",
    titleJa: "更新履歴",
    descriptionEn:
      "Shipped ZoneBoard changes in past tense. Broadcast, match banner, PNG export, and site pages — what already landed in production.",
    descriptionJa:
      "本番に入った ZoneBoard の変更を過去形で。配信、試合帯、PNG、公開ページ。",
    ledeEn:
      "This page lists changes that are already live. It is not a roadmap. Upcoming work stays elsewhere. Feedback still goes through Contact or the in-app form.",
    ledeJa:
      "すでに本番に入った変更だけを載せます。ロードマップではありません。予定はここには書きません。フィードバックは Contact かアプリ内フォームから。",
    sections: [
      {
        headingEn: "How we write this",
        headingJa: "書き方",
        en: [
          "Past tense only. If a change would not change how you use the board or the site, it does not belong here.",
          "The source of truth is the changelog module in the repo. Editors run the site page build after updating it.",
        ],
        ja: [
          "過去形のみ。ボードやサイトの使い方が変わらない変更は載せません。",
          "正本はリポジトリの changelog モジュールです。更新後にサイトページ生成を回します。",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    titleEn: "Privacy policy",
    titleJa: "プライバシーポリシー",
    descriptionEn:
      "Privacy on ZoneBoard: local board data, optional feedback, cookies, Google Analytics 4, Google Fonts, Cloudflare, and AdSense on informational pages only.",
    descriptionJa:
      "プライバシー。ローカルのボード、任意フィードバック、Cookie、GA4、Google Fonts、Cloudflare、読み物ページのみの AdSense。",
    ledeEn: `Operator: ${PUBLISHER.legalName} (${PUBLISHER.countryEn}). Site: ${PUBLISHER.siteUrl}. Last updated ${PUBLISHER.updatedEn}.`,
    ledeJa: `運営者: ${PUBLISHER.legalNameJa}（${PUBLISHER.countryJa}）。サイト: ${PUBLISHER.siteUrl}。最終更新 ${PUBLISHER.updatedJa}。`,
    sections: [
      {
        headingEn: "1. Who we are",
        headingJa: "1. 事業者",
        en: [
          `This policy describes how ${PUBLISHER.legalName} (“we”) handles information when you use ${PUBLISHER.product} at ${PUBLISHER.siteUrl}. For requests about this policy, email ${PUBLISHER.email} or use the contact page.`,
          "We are a small operator in Japan. We do not run a player database and we do not create user accounts. Most of the product runs in your browser.",
        ],
        ja: [
          `本ポリシーは、${PUBLISHER.legalNameJa}（以下「当方」）が ${PUBLISHER.siteUrl} の ${PUBLISHER.product} 利用時に情報をどう扱うかを定めます。本ポリシーに関する請求は ${PUBLISHER.email} または連絡先ページへ。`,
          "日本の小さい運営者です。選手データベースは持たず、会員アカウントも作りません。製品の大半は利用者のブラウザ内で動きます。",
        ],
      },
      {
        headingEn: "2. What the board stores on your device",
        headingJa: "2. 端末に残るボード",
        en: [
          "Scenes, pieces, drawings, roster text, kit colours, match banner fields, and similar board state are stored locally in your browser (for example localStorage). That data is not sent to us when you draw, move a piece, or enter broadcast mode.",
          "If you use another computer, another browser, or you clear site data, that local board is not there. Exporting a PNG creates a file on your device. We do not receive the export unless you later attach it to a message yourself.",
        ],
        ja: [
          "局面、駒、描画、名簿、キット色、試合帯などボードの状態は、ブラウザ内（例: localStorage）に保存します。描く、駒を動かす、配信モードに入る、といった操作では当方へ送信しません。",
          "別のパソコン、別のブラウザ、サイトデータの削除では、そのローカルボードはありません。PNG 書き出しは端末上のファイルです。あとからメッセージに添付しない限り、当方は書き出しを受け取りません。",
        ],
      },
      {
        headingEn: "3. Information you send on purpose",
        headingJa: "3. 意図して送る情報",
        en: [
          "The optional feedback form sends a short message plus coarse technical context (browser family, viewport size, locale, timezone, referrer, and similar). We use it to fix the product. Do not include passwords, identity documents, or a full tactics board.",
          "If you email us, we receive the address and the content of the mail. We keep that correspondence only as long as needed to answer and to keep a minimal record of the request.",
        ],
        ja: [
          "任意のフィードバックは、短い本文に加え、粗い技術情報（ブラウザの系統、画面サイズ、言語、タイムゾーン、参照元など）を送ります。製品の修正に使います。パスワード、身分証、戦術ボード一式は含めないでください。",
          "メールした場合、アドレスと本文を受け取ります。回答と請求の最小記録に必要な期間だけ保持します。",
        ],
      },
      {
        headingEn: "4. Hosting and security logs",
        headingJa: "4. ホスティングとログ",
        en: [
          "The site is served through Cloudflare. Like most HTTPS hosts, Cloudflare may process IP addresses, user-agent strings, and request timing to deliver the site, absorb abuse, and keep the connection encrypted. We do not use those logs to build a marketing profile of tactics-board users.",
        ],
        ja: [
          "サイトは Cloudflare 経由で配信します。一般的な HTTPS ホストと同様、配信、不正利用の抑制、暗号化のために IP アドレス、User-Agent、リクエスト時刻などが処理され得ます。戦術ボード利用者のマーケティングプロファイルをそのログから作ることはしません。",
        ],
      },
      {
        headingEn: "5. Fonts",
        headingJa: "5. フォント",
        en: [
          "Some pages load fonts from Google Fonts. Google may process the request, including your IP address, according to Google’s own policy. If we later self-host those files, this section will be updated.",
        ],
        ja: [
          "一部ページは Google Fonts からフォントを読みます。その際、IP アドレス等は Google の方針に従って処理され得ます。後日ファイルを自前配信する場合は、本項を更新します。",
        ],
      },
      {
        headingEn: "6. Analytics (Google Analytics 4)",
        headingJa: "6. 計測（Google Analytics 4）",
        en: [
          "If you allow analytics, we use Google Analytics 4 to understand visits to the public site: which pages were viewed, and whether someone opened the board from the landing page. The tag does not run until you allow analytics. Rejecting analytics is as easy as allowing it. You can change that choice later from Cookie choices in the footer.",
          "GA4 does not receive scenes, roster text, piece names or numbers, kit colours, or drawings. Broadcast mode (/board?broadcast=1) does not send hits. The pitch never asks for this consent.",
          "Lawful basis under UK/EU GDPR: consent (Article 6(1)(a)). Google may process the measurement in the United States. Details of cookies and similar storage are on the cookie page.",
        ],
        ja: [
          "計測を許可した場合、Google Analytics 4 で公開サイトの来訪を把握します。どのページが見られたか、ランディングからボードを開いたかです。許可するまでタグは動きません。拒否は許可と同じ操作です。フッターの Cookie choices から後で変えられます。",
          "GA4 は局面、名簿、駒の名前や番号、キット色、描画を受け取りません。配信モード（/board?broadcast=1）ではヒットを送りません。ピッチではこの同意を尋ねません。",
          "英国・EU GDPR 上の根拠は同意（6条1項(a)）です。計測は米国で処理され得ます。Cookie 等の詳細は Cookie のページにあります。",
        ],
      },
      {
        headingEn: "7. Advertising (Google AdSense)",
        headingJa: "7. 広告（Google AdSense）",
        en: [
          "We may display Google AdSense advertisements on informational pages of this site (About, Guide, FAQ, legal pages). We do not display ads on the landing page, the tactics pitch, or in broadcast mode. The window you capture for a stream is not an ad surface.",
          "AdSense does not load until you allow advertising cookies on a reading page. Allow advertising also allows analytics, which AdSense uses to measure ads. Rejecting advertising is as easy as allowing it. You can change that choice later from Cookie choices in the footer. The pitch never asks.",
          "Third-party vendors, including Google, use cookies to serve ads based on a user’s prior visits to this website or other websites. Google’s use of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and/or other sites on the Internet.",
          "Users in the UK and EEA may also opt out of personalised advertising at Google Ads Settings: https://www.google.com/settings/ads. You can also visit https://www.aboutads.info to opt out of some third-party vendors’ use of cookies for personalised advertising.",
          "If we use other ad technology later, we will name it here. We will not add an ad slot to the capture surface in order to raise fill rate.",
        ],
        ja: [
          "本サイトの読み物ページ（About、使い方、FAQ、法務ページ）に Google AdSense 広告を表示することがあります。ランディング、戦術ピッチ、配信モードには出しません。配信でキャプチャする窓は広告面ではありません。",
          "読み物ページで広告 Cookie を許可するまで、AdSense は読み込みません。Allow advertising は広告計測のため analytics も許可します。拒否は許可と同じ操作です。フッターの Cookie choices から後で変えられます。ピッチでは尋ねません。",
          "Google を含む第三者ベンダーは、Cookie を使用して、ユーザーが本サイトまたは他のサイトを過去に訪問した情報に基づき広告を配信します。Google の広告 Cookie の使用により、Google およびパートナーは、本サイトやインターネット上の他サイトへの訪問情報に基づいて広告を配信できます。",
          "英国・EEA では、パーソナライズド広告を Google 広告設定 https://www.google.com/settings/ads から無効化できます。一部の第三者ベンダーの Cookie については https://www.aboutads.info からもオプトアウトできます。",
          "別の広告技術を後から使う場合は、ここに名前を書きます。配信キャプチャ面に広告枠を足して埋まり率を上げる、ということはしません。",
        ],
      },
      {
        headingEn: "8. Cookies and similar technologies",
        headingJa: "8. Cookie 等",
        en: [
          "The board’s own save uses local storage on your device. That is strictly necessary to run the product. It is not an advertising or analytics cookie.",
          "Your privacy choice is also stored locally (zb-consent). That record is necessary to remember a yes or a no for analytics and for advertising, so we do not ask on every page load. It expires after 180 days.",
          "Google Analytics 4 and Google AdSense cookies are optional and run only after you allow them. Google Fonts may still be requested to render these pages; that request can include an IP address. Details of each tool are on the cookie page.",
          "Lawful basis under UK/EU GDPR: the board save and the consent record are strictly necessary to provide the service you asked for. Analytics and advertising cookies run only on consent (Article 6(1)(a)). You can refuse without losing the board.",
        ],
        ja: [
          "ボード自身の保存は端末の localStorage です。製品を動かすために必要なもので、広告 Cookie でも計測 Cookie でもありません。",
          "プライバシーの選択も端末内（zb-consent）に残します。計測とはい／いいえ、広告のはい／いいえを覚え、毎回尋ねないために必要です。180日で期限切れです。",
          "Google Analytics 4 と Google AdSense の Cookie は任意で、許可したあとだけ動きます。これらのページの表示のため Google Fonts は引き続き要求され、その要求には IP アドレスが含まれ得ます。各ツールの詳細は Cookie のページにあります。",
          "英国・EU GDPR 上の根拠: ボード保存と同意記録は、求めたサービス提供に必要なものです。計測と広告の Cookie は同意（6条1項(a)）のときだけ動きます。ボードを失わずに拒否できます。",
        ],
      },
      {
        headingEn: "9. Purpose of use (Japan APPI)",
        headingJa: "9. 利用目的（個人情報保護法）",
        en: [
          "We use information only to operate the site, answer a message you sent, fix defects, resist abuse, understand how the public site is used after you allow analytics (visits and whether the board was opened), and — on informational pages only — to fund the site with advertising. We do not sell personal data. We do not use board diagrams for advertising or analytics profiles, because we do not receive them in ordinary use.",
        ],
        ja: [
          "情報は、サイトの運営、利用者からの連絡への回答、不具合の修正、不正利用への対応、計測を許可されたあとの公開サイトの利用把握（来訪とボードを開いたか）、および読み物ページに限った広告による運営費にのみ使います。個人情報は販売しません。通常利用では図を受け取らないため、戦術図を広告や計測のプロファイルにも使いません。",
        ],
      },
      {
        headingEn: "10. Your rights",
        headingJa: "10. 利用者の権利",
        en: [
          `Depending on where you live, you may have rights to access, correct, delete, or restrict personal data we hold, or to object to certain processing. In the UK and EEA that includes GDPR rights, and the right to withdraw analytics and advertising consent as easily as you gave it (Cookie choices in the footer). Because we keep so little, many requests will be answered by explaining that we have no account record. Email ${PUBLISHER.email}. We may need to confirm that the request comes from you.`,
          "You can complain to your local data-protection authority. In the UK that is the ICO. You can delete local board data yourself with the browser’s site-data controls. That deletion happens on your device; it is not a request we process on a server.",
        ],
        ja: [
          `お住まいの地域により、当方が保有する個人データへの開示、訂正、削除、利用停止、または一部処理への異議の権利がある場合があります。英国・EEA では GDPR 上の権利と、計測および広告の同意を出したときと同じ簡単さで撤回する権利（フッターの Cookie choices）を含みます。保有が少ないため、アカウント記録が無い、という回答になることが多いです。${PUBLISHER.email} へご連絡ください。本人確認を求めることがあります。`,
          "お住まいの地域のデータ保護機関に苦情を出せます。英国では ICO です。ローカルのボードデータは、ブラウザのサイトデータ削除で自分で消せます。それは端末上の操作であり、サーバで処理する請求ではありません。",
        ],
      },
      {
        headingEn: "11. Children",
        headingJa: "11. 子ども",
        en: [
          "The product is aimed at people who run or watch football streams and at coaches. It is not directed at children under 16. We do not knowingly collect personal data from children. If you believe we have, write to us and we will delete what we can identify.",
        ],
        ja: [
          "対象はサッカー配信を行う・見る人、および指導者です。16歳未満の子ども向けではありません。子どもの個人情報を故意に集めることはありません。該当すると思われたら連絡ください。特定できるものは削除します。",
        ],
      },
      {
        headingEn: "12. International transfers",
        headingJa: "12. 国外転送",
        en: [
          "Cloudflare, Google Fonts, Google Analytics 4, and Google AdSense may process data outside Japan, including in the United States. If that is not acceptable, reject optional cookies, do not load the informational pages that use those services, and do not send us email you do not want processed by a mail provider.",
        ],
        ja: [
          "Cloudflare、Google Fonts、Google Analytics 4、Google AdSense は、日本国外（米国を含む）でデータを処理することがあります。それが受け入れられない場合は、任意 Cookie を拒否し、それらのサービスを使う読み物ページを開かないでください。メール提供者に処理されたくない内容は送らないでください。",
        ],
      },
      {
        headingEn: "13. Changes",
        headingJa: "13. 変更",
        en: [
          "We will change this policy when the product or the law requires it. The date at the top of the page is the current version. Material changes to advertising or data collection will be reflected here before we rely on them.",
        ],
        ja: [
          "製品または法令に必要なとき、本ポリシーを変更します。ページ上部の日付が現行版です。広告や収集の実質的な変更は、それに依る前にここに反映します。",
        ],
      },
    ],
  },
  {
    slug: "terms",
    titleEn: "Terms of use",
    titleJa: "利用規約",
    descriptionEn:
      "Terms for ZoneBoard: free browser tactics board, no account, local save. Ads on informational pages only — never on the pitch or in broadcast mode.",
    descriptionJa:
      "利用規約。無料のブラウザ戦術ボード、アカウントなし、端末内保存。広告は読み物ページのみ。ピッチ上・配信モードには出しません。",
    ledeEn: `Operated by ${PUBLISHER.legalName}. Last updated ${PUBLISHER.updatedEn}.`,
    ledeJa: `運営: ${PUBLISHER.legalNameJa}。最終更新 ${PUBLISHER.updatedJa}。`,
    sections: [
      {
        headingEn: "1. The service",
        headingJa: "1. サービス",
        en: [
          "ZoneBoard is a free tactics board in the browser. You may place pieces, draw, write short labels, keep scenes locally, and capture the window for a stream. We may change, pause, or stop the service. We do not promise a particular uptime.",
          "These terms apply to the public site and the board. If you do not agree, do not use the site.",
        ],
        ja: [
          "ZoneBoard はブラウザ上の無料戦術ボードです。駒を置き、描き、短い文字を書き、局面を端末に残し、配信用に窓をキャプチャできます。当方はサービスを変更、停止、終了できます。特定の稼働率は約束しません。",
          "本規約は公開サイトとボードに適用します。同意しない場合は利用しないでください。",
        ],
      },
      {
        headingEn: "2. No account, your content",
        headingJa: "2. アカウントなし、利用者の内容",
        en: [
          "You do not register. What you put on the board stays on your device unless you export it or send it to someone yourself. You are responsible for having the right to use names, numbers, crests, and images you load as a watermark.",
          "Do not use the board to harass, to publish unlawful content, or to infringe others’ rights. We can block abusive automated access to the site.",
        ],
        ja: [
          "登録しません。ボードに置いたものは、自分で書き出すか送らない限り端末に残ります。ウォーターマークとして読み込む名称、背番号、エンブレム、画像を使う権利は、利用者の責任です。",
          "嫌がらせ、違法な内容の公開、他人の権利侵害にボードを使わないでください。サイトへの不正な自動アクセスは遮断できます。",
        ],
      },
      {
        headingEn: "3. Our rights in the product",
        headingJa: "3. 製品についての権利",
        en: [
          "The ZoneBoard name, mark, and software are ours or used under licence. You may use the product to make diagrams. You do not get ownership of the software by using it. Do not scrape, copy, or republish the site as if it were your product.",
        ],
        ja: [
          "ZoneBoard の名称、マーク、ソフトウェアは当方のもの、またはライセンスに基づくものです。図を作るために製品を使えます。使っただけでソフトウェアの所有権は移りません。本サイトを自分の製品であるかのように複製、転載、スクレイプしないでください。",
        ],
      },
      {
        headingEn: "4. Advertising",
        headingJa: "4. 広告",
        en: [
          "Informational pages may show third-party ads, including Google AdSense, only after you allow advertising cookies. The tactics pitch, the landing page, and broadcast mode do not show ads. Ads are not part of the diagram you capture for a stream.",
        ],
        ja: [
          "読み物ページには、Google AdSense を含む第三者広告を出すことがあります。戦術ピッチと配信モードには広告を出しません。配信用にキャプチャする図の一部ではありません。",
        ],
      },
      {
        headingEn: "5. Warranty and liability",
        headingJa: "5. 保証と責任",
        en: [
          "The service is provided as is. We do not warrant that a particular match graphic will be accurate, that local storage will survive a browser update, or that a capture will match what you see. To the extent permitted by law, we are not liable for lost diagrams, lost audience, or indirect loss. Nothing in these terms limits liability that cannot be limited under Japanese law.",
        ],
        ja: [
          "サービスは現状有姿です。特定の試合図が正確であること、ブラウザ更新後もローカル保存が残ること、キャプチャが見た目と一致することを保証しません。法令が認める範囲で、図の喪失、視聴者の喪失、間接損害について責任を負いません。日本法で制限できない責任まで、本規約で制限するものではありません。",
        ],
      },
      {
        headingEn: "6. Governing law",
        headingJa: "6. 準拠法",
        en: [
          `These terms are governed by the laws of Japan. The courts of Japan have exclusive jurisdiction, without prejudice to any non-waivable consumer venue right you may have.`,
        ],
        ja: [
          "本規約は日本法に準拠します。日本の裁判所を専属的合意管轄とします。ただし、放棄できない消費者の裁判籍がある場合は、それを害しません。",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    titleEn: "Cookie policy",
    titleJa: "Cookie ポリシー",
    descriptionEn:
      "Cookies and storage on ZoneBoard: local board save, Google Analytics 4 (with consent), Google Fonts, and AdSense on informational pages only.",
    descriptionJa:
      "Cookie と保存。ボードの端末内保存、同意後の GA4、Google Fonts、読み物ページのみの AdSense。",
    ledeEn: `Last updated ${PUBLISHER.updatedEn}. Read with the privacy policy.`,
    ledeJa: `最終更新 ${PUBLISHER.updatedJa}。プライバシーポリシーとあわせて読んでください。`,
    sections: [
      {
        headingEn: "What we use",
        headingJa: "使うもの",
        en: [
          "ZoneBoard’s own board state is stored in local storage on your device. That is how scenes survive a refresh. It is not an advertising or analytics cookie. Clearing site data deletes it.",
          "The site may set a cookie or similar identifier only as needed to run a third-party service described here. Optional tools are named below. You can refuse them without losing the board.",
        ],
        ja: [
          "ZoneBoard 自身のボード状態は、端末の localStorage に入ります。再読み込み後も局面が残るためです。広告 Cookie でも計測 Cookie でもありません。サイトデータを消すと削除されます。",
          "ここに書いた第三者サービスを動かすために必要な場合に限り、Cookie 等を使うことがあります。任意のツールは以下に名前があります。ボードを失わずに拒否できます。",
        ],
      },
      {
        headingEn: "Google Fonts",
        headingJa: "Google Fonts",
        en: [
          "Pages may request font files from Google. That request can include an IP address. See Google’s documentation for how they handle it.",
        ],
        ja: [
          "ページが Google からフォントファイルを取得することがあります。その要求には IP アドレスが含まれ得ます。取扱いは Google の説明を見てください。",
        ],
      },
      {
        headingEn: "Google Analytics 4",
        headingJa: "Google Analytics 4",
        en: [
          "After you allow analytics, Google Analytics 4 may set cookies or use similar storage to measure page views on the landing page, reading pages, and the board editor, and to record that the landing page Open board control was used. It does not receive board contents. It does not run in broadcast mode.",
          "Until you allow analytics, the GA4 tag is not loaded. Consent Mode defaults keep analytics and ad storage denied. You can refuse without losing the board.",
        ],
        ja: [
          "計測を許可したあと、Google Analytics 4 は Cookie 等を使い、ランディング・読み物・ボード編集のページビューと、ランディングの Open board が使われたかを測ることがあります。ボードの中身は受け取りません。配信モードでは動きません。",
          "許可するまで GA4 のタグは読み込みません。Consent Mode の既定は計測・広告ストレージとも denied です。ボードを失わずに拒否できます。",
        ],
      },
      {
        headingEn: "Google AdSense cookies",
        headingJa: "Google AdSense の Cookie",
        en: [
          "When ads are shown on informational pages, Google and partners may use cookies to serve ads based on visits to this site and other sites. This does not happen on the pitch or in broadcast mode.",
          "Third-party vendors, including Google, use cookies to serve ads based on a user’s prior visits to your website or other websites. Google’s use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.",
          "You may opt out of personalised advertising at https://www.google.com/settings/ads and some third-party cookies at https://www.aboutads.info. Browser controls can also block cookies; the board save may still work because it uses local storage.",
        ],
        ja: [
          "読み物ページに広告を出すとき、Google およびパートナーは、本サイトや他サイトへの訪問に基づく広告のために Cookie を使うことがあります。ピッチ上および配信モードでは使いません。",
          "Google を含む第三者ベンダーは、Cookie を使用して、ユーザーが本サイトまたは他のサイトを過去に訪問した情報に基づき広告を配信します。Google の広告 Cookie により、Google およびパートナーは、本サイトや他サイトへの訪問情報に基づいて広告を配信できます。",
          "パーソナライズド広告は https://www.google.com/settings/ads 、一部の第三者 Cookie は https://www.aboutads.info から無効化できます。ブラウザ設定で Cookie を拒否することもできます。ボードの保存は localStorage のため、なお動くことがあります。",
        ],
      },
      {
        headingEn: "Consent",
        headingJa: "同意",
        en: [
          "We do not put a consent banner on the pitch or in broadcast mode. Stream capture must stay a pitch.",
          "On the landing page and on reading pages, a choice is required before analytics or advertising cookies run. Three equal-size controls: Reject optional, Allow analytics, and Allow advertising. Allow advertising also allows analytics. Until you choose, neither GA4 nor AdSense loads. Reject is the default for anyone who never chooses (including when JavaScript is off).",
          "You can change the choice from Cookie choices in the footer (landing and reading pages). The stored choice expires after 180 days. That is UK GDPR, EU GDPR, and ePrivacy practice: consent is informed, specific, and as easy to refuse as to give.",
        ],
        ja: [
          "ピッチ上および配信モードに同意バナーは出しません。キャプチャ面はピッチのままにします。",
          "ランディングと読み物ページでは、計測または広告の Cookie の前に選択が必要です。Reject optional、Allow analytics、Allow advertising は同じ大きさです。Allow advertising は analytics も許可します。選ぶまで GA4 も AdSense も読み込みません。選ばない人（JavaScript オフを含む）は拒否が既定です。",
          "フッターの Cookie choices（ランディングと読み物）から後で変えられます。記録は180日で期限切れです。英国 GDPR・EU GDPR・ePrivacy の運用として、同意は特定・十分な情報に基づき、拒否は許可と同じ簡単さです。",
        ],
      },
    ],
  },
  {
    slug: "contact",
    titleEn: "Contact",
    titleJa: "連絡先",
    descriptionEn:
      "Contact ZoneBoard for privacy requests, legal notices, and product feedback. No live chat. Do not paste a full tactics board.",
    descriptionJa:
      "プライバシー請求、法務、製品フィードバックはここへ。ライブチャットはありません。戦術ボード一式は貼らないでください。",
    ledeEn: `${PUBLISHER.legalName} · ${PUBLISHER.countryEn} · ${PUBLISHER.email}`,
    ledeJa: `${PUBLISHER.legalNameJa} · ${PUBLISHER.countryJa} · ${PUBLISHER.email}`,
    showContactForm: true,
    sections: [
      {
        headingEn: "How to reach us",
        headingJa: "連絡方法",
        en: [
          `Email ${PUBLISHER.email} for privacy requests, terms questions, and notices. For a product bug or a missing control, the form on this page or the feedback control on the homepage is enough. We do not operate a telephone desk or a chat widget.`,
          "Write in English. Say whether you are asking about the board, the privacy policy, or an ad on a reading page. Do not attach identity documents unless we ask, and do not paste a full scene from the pitch.",
          "We read mail as a small operator. A reply may take several days. If you do not hear back, send once more. Three copies of the same mail do not speed the queue.",
        ],
        ja: [
          `プライバシー請求、規約、通知は ${PUBLISHER.email} へ。製品の不具合や足りない操作は、このページのフォームか、ホームページのフィードバックで足ります。電話窓口とチャットウィジェットはありません。`,
          "日本語または英語で書いてください。ボードの話か、プライバシーか、読み物ページの広告かを書いてください。求めない限り身分証は添付しないでください。ピッチの局面一式も貼らないでください。",
          "小さい運営なので、返信に数日かかることがあります。届かないと感じたら、もう一度だけ送ってください。同じメールを三通しても順番は早くなりません。",
        ],
      },
      {
        headingEn: "What we will not do",
        headingJa: "やらないこと",
        en: [
          "We will not recover a board you deleted in the browser. We never had it. We will not place an advertisement on your stream capture as a paid extra. We will not give support that requires remote control of your PC.",
        ],
        ja: [
          "ブラウザで消したボードは復元しません。当方が持っていたことがないからです。配信キャプチャへ広告を有料オプションとして載せることもありません。PC の遠隔操作が必要なサポートもしません。",
        ],
      },
    ],
  },
];

export function pageBySlug(slug: string): SitePage | undefined {
  return SITE_PAGES.find((p) => p.slug === slug);
}
