import { PUBLISHER, type SiteSlug } from "./publisher.ts";

export type SiteSection = {
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
      "ZoneBoard is a canvas-first football tactics board for live streams. Place an XI, draw the move, and show the pitch without shrinking it behind a toolbar.",
    descriptionJa:
      "ZoneBoard は配信向けのキャンバス優先サッカー戦術ボードです。スタメンを置き、動きを描き、ツールバーにピッチを削られずに画面へ出します。",
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
      "A practical guide to ZoneBoard: place an XI, draw the pattern, hide the tools, and capture the window beside the camera you already use.",
    descriptionJa:
      "ZoneBoard の実務ガイド。スタメンを置き、型を描き、ツールを消し、いつものカメラの横にウィンドウを足します。",
    ledeEn:
      "The board is not a second show. It is the pitch you add to a show you already run. This page is the long version of place, draw, and show.",
    ledeJa:
      "ボードは第二の番組ではありません。いま走っている番組に足すピッチです。このページは、置く・描く・出すの長い版です。",
    sections: [
      {
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
        headingEn: "During the pattern: draw",
        headingJa: "型を見せるとき: 描く",
        en: [
          "Pass, run, and dribble are different lines because they mean different things on a football graphic. A pass is a ball. A run is a body without the ball. A dribble is a carrier moving with it. If you use one colour for all three, the viewer has to guess. Use the labelled tools. Do not turn the pitch into a highlighter pack.",
          "Zones are for space, not for decoration. A pressing trap, a box to attack, or a rest-defence block should be large enough to read and transparent enough that the grass and the numbers still show. If a zone hides a player, the zone is wrong.",
          "Pen is for the one mark that is not a pass or a run: a block line, a cover shadow, a keeper’s starting position. Text is for a short title on the picture, not for a paragraph. If you need a paragraph, say it with your voice. The board is the diagram.",
        ],
        ja: [
          "パス、ラン、ドリブルは線が違います。意味が違うからです。パスはボール。ランはボールを持たない体。ドリブルは運ぶ人です。三本を同じ色にすると、視聴者は推測します。名前のついたツールを使ってください。ピッチを蛍光ペンの束にしないでください。",
          "ゾーンは空間用であり、飾りではありません。プレスの罠、攻める箱、レストディフェンスの塊は、読める大きさで、芝と番号が残る透明度にします。ゾーンが選手を隠すなら、そのゾーンは失敗です。",
          "ペンは、パスでもランでもない一本です。ブロックの線、カバーシャドウ、GKの開始位置。文字は絵の短い題であり、段落ではありません。段落が必要なら声で言ってください。ボードは図です。",
        ],
      },
      {
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
        headingEn: "What this guide will not promise",
        headingJa: "このガイドが約束しないこと",
        en: [
          "We will not promise a thirty-second setup for every match. A clean XI still takes the time the numbers take. We will not promise that a slide habit disappears. Some hosts will keep slides for tables and use ZoneBoard only for the pitch. That is a valid split.",
          "We will not put a tutorial overlay on the board the first time you open it. The tools are words. If a word is unclear, this guide and the FAQ are the place to read, not a modal on the grass.",
        ],
        ja: [
          "どの試合でも30秒で組める、とは言いません。きれいな XI は、番号の数だけ時間が要ります。スライド癖が消えるとも言いません。表はスライド、ピッチだけ ZoneBoard、という分け方は成立します。",
          "初回にボードへチュートリアルを重ねません。ツールは言葉です。言葉が分からなければ、芝の上のモーダルではなく、このガイドと FAQ を読んでください。",
        ],
      },
    ],
  },
  {
    slug: "faq",
    titleEn: "Frequently asked questions",
    titleJa: "よくある質問",
    descriptionEn:
      "Answers about accounts, saving, broadcast capture, sports, advertising on ZoneBoard, and how to reach the operator.",
    descriptionJa:
      "アカウント、保存、配信キャプチャ、競技、ZoneBoard の広告、運営への連絡についての回答です。",
    ledeEn:
      "Short answers. If yours is missing, the contact page reaches the operator. Do not paste a full board into the form.",
    ledeJa:
      "短い回答です。ここに無いことは連絡先ページから運営へ。フォームにボード全体を貼らないでください。",
    sections: [
      {
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
    slug: "privacy",
    titleEn: "Privacy policy",
    titleJa: "プライバシーポリシー",
    descriptionEn:
      "How ZoneBoard handles local board data, optional feedback, cookies, Google Fonts, Cloudflare, and Google AdSense on informational pages.",
    descriptionJa:
      "ZoneBoard がボードのローカルデータ、任意のフィードバック、Cookie、Google Fonts、Cloudflare、読み物ページの Google AdSense をどう扱うか。",
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
        headingEn: "6. Advertising (Google AdSense)",
        headingJa: "6. 広告（Google AdSense）",
        en: [
          "We may display Google AdSense advertisements on informational pages of this site (About, Guide, FAQ, legal pages, and possibly the landing page). We do not display ads on the tactics pitch or in broadcast mode. The window you capture for a stream is not an ad surface.",
          "Third-party vendors, including Google, use cookies to serve ads based on a user’s prior visits to this website or other websites. Google’s use of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and/or other sites on the Internet.",
          "Users may opt out of personalised advertising by visiting Google Ads Settings at https://www.google.com/settings/ads. You can also visit https://www.aboutads.info to opt out of some third-party vendors’ use of cookies for personalised advertising.",
          "If we use other ad technology later, we will name it here. We will not add an ad slot to the capture surface in order to raise fill rate.",
        ],
        ja: [
          "本サイトの読み物ページ（About、使い方、FAQ、法務ページ、場合によりランディング）に Google AdSense 広告を表示することがあります。戦術ピッチおよび配信モードには広告を表示しません。配信でキャプチャする窓は広告面ではありません。",
          "Google を含む第三者ベンダーは、Cookie を使用して、ユーザーが本サイトまたは他のサイトを過去に訪問した情報に基づき広告を配信します。Google の広告 Cookie の使用により、Google およびパートナーは、本サイトやインターネット上の他サイトへの訪問情報に基づいて広告を配信できます。",
          "パーソナライズド広告は、Google 広告設定 https://www.google.com/settings/ads から無効化できます。一部の第三者ベンダーの Cookie については https://www.aboutads.info からもオプトアウトできます。",
          "別の広告技術を後から使う場合は、ここに名前を書きます。配信キャプチャ面に広告枠を足して埋まり率を上げる、ということはしません。",
        ],
      },
      {
        headingEn: "7. Cookies and similar technologies",
        headingJa: "7. Cookie 等",
        en: [
          "The board’s own save uses local storage, which is not a cookie. AdSense and Google Fonts may set or read cookies or similar identifiers as described above. Details are on the cookie page.",
        ],
        ja: [
          "ボード自身の保存は localStorage であり、Cookie ではありません。AdSense と Google Fonts は、上記のとおり Cookie 等を設定または参照することがあります。詳細は Cookie のページにあります。",
        ],
      },
      {
        headingEn: "8. Purpose of use (Japan APPI)",
        headingJa: "8. 利用目的（個人情報保護法）",
        en: [
          "We use information only to operate the site, answer a message you sent, fix defects, resist abuse, and — on informational pages only — to fund the site with advertising. We do not sell personal data. We do not use board diagrams for advertising profiles, because we do not receive them in ordinary use.",
        ],
        ja: [
          "情報は、サイトの運営、利用者からの連絡への回答、不具合の修正、不正利用への対応、および読み物ページに限った広告による運営費にのみ使います。個人情報は販売しません。通常利用では図を受け取らないため、戦術図を広告プロファイルにも使いません。",
        ],
      },
      {
        headingEn: "9. Your rights",
        headingJa: "9. 利用者の権利",
        en: [
          `Depending on where you live, you may have rights to access, correct, delete, or restrict personal data we hold, or to object to certain processing. Because we keep so little, many requests will be answered by explaining that we have no account record. Email ${PUBLISHER.email}. We may need to confirm that the request comes from you.`,
          "You can delete local board data yourself with the browser’s site-data controls. That deletion happens on your device; it is not a request we process on a server.",
        ],
        ja: [
          `お住まいの地域により、当方が保有する個人データへの開示、訂正、削除、利用停止、または一部処理への異議の権利がある場合があります。保有が少ないため、アカウント記録が無い、という回答になることが多いです。${PUBLISHER.email} へご連絡ください。本人確認を求めることがあります。`,
          "ローカルのボードデータは、ブラウザのサイトデータ削除で自分で消せます。それは端末上の操作であり、サーバで処理する請求ではありません。",
        ],
      },
      {
        headingEn: "10. Children",
        headingJa: "10. 子ども",
        en: [
          "The product is aimed at people who run or watch football streams and at coaches. It is not directed at children under 16. We do not knowingly collect personal data from children. If you believe we have, write to us and we will delete what we can identify.",
        ],
        ja: [
          "対象はサッカー配信を行う・見る人、および指導者です。16歳未満の子ども向けではありません。子どもの個人情報を故意に集めることはありません。該当すると思われたら連絡ください。特定できるものは削除します。",
        ],
      },
      {
        headingEn: "11. International transfers",
        headingJa: "11. 国外転送",
        en: [
          "Cloudflare, Google Fonts, and Google AdSense may process data outside Japan, including in the United States. If that is not acceptable, do not load the informational pages that use those services, and do not send us email you do not want processed by a mail provider.",
        ],
        ja: [
          "Cloudflare、Google Fonts、Google AdSense は、日本国外（米国を含む）でデータを処理することがあります。それが受け入れられない場合は、それらのサービスを使う読み物ページを開かないでください。メール提供者に処理されたくない内容は送らないでください。",
        ],
      },
      {
        headingEn: "12. Changes",
        headingJa: "12. 変更",
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
      "Terms for using ZoneBoard, a free browser tactics board. No account. Local save. Ads only on informational pages, never on the pitch or in broadcast mode.",
    descriptionJa:
      "無料のブラウザ戦術ボード ZoneBoard の利用規約。アカウントなし。ローカル保存。広告は読み物ページのみ。ピッチと配信モードには出しません。",
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
          "Informational pages may show third-party ads, including Google AdSense. The tactics pitch and broadcast mode do not show ads. Ads are not part of the diagram you capture for a stream.",
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
      "Cookies and local storage on ZoneBoard: board save on your device, Google Fonts, and Google AdSense on informational pages only.",
    descriptionJa:
      "ZoneBoard の Cookie とローカル保存。ボードは端末内。Google Fonts。Google AdSense は読み物ページのみ。",
    ledeEn: `Last updated ${PUBLISHER.updatedEn}. Read with the privacy policy.`,
    ledeJa: `最終更新 ${PUBLISHER.updatedJa}。プライバシーポリシーとあわせて読んでください。`,
    sections: [
      {
        headingEn: "What we use",
        headingJa: "使うもの",
        en: [
          "ZoneBoard’s own board state is stored in local storage on your device. That is how scenes survive a refresh. It is not an advertising cookie. Clearing site data deletes it.",
          "The site may set a cookie or similar identifier only as needed to run a third-party service described here. We do not run a first-party analytics cookie today. If that changes, this page will name the tool.",
        ],
        ja: [
          "ZoneBoard 自身のボード状態は、端末の localStorage に入ります。再読み込み後も局面が残るためです。広告 Cookie ではありません。サイトデータを消すと削除されます。",
          "ここに書いた第三者サービスを動かすために必要な場合に限り、Cookie 等を使うことがあります。現時点でファーストパーティの計測 Cookie は置いていません。変わる場合は、このページにツール名を書きます。",
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
          "We do not put a consent banner on the broadcast board. Stream capture must stay a pitch. If a region requires a choice before advertising cookies run, that choice will be collected on the informational pages, not over the grass.",
        ],
        ja: [
          "配信ボードの上に同意バナーは出しません。キャプチャ面はピッチのままにします。広告 Cookie の前に選択が必要な地域では、その選択は読み物ページで取り、芝の上では取りません。",
        ],
      },
    ],
  },
  {
    slug: "contact",
    titleEn: "Contact",
    titleJa: "連絡先",
    descriptionEn:
      "Contact the ZoneBoard operator for privacy requests, legal notices, and product feedback. No live chat. Do not paste a full tactics board.",
    descriptionJa:
      "プライバシー請求、法的通知、製品フィードバックは ZoneBoard 運営へ。ライブチャットはありません。戦術ボード一式は貼らないでください。",
    ledeEn: `${PUBLISHER.legalName} · ${PUBLISHER.countryEn} · ${PUBLISHER.email}`,
    ledeJa: `${PUBLISHER.legalNameJa} · ${PUBLISHER.countryJa} · ${PUBLISHER.email}`,
    showContactForm: true,
    sections: [
      {
        headingEn: "How to reach us",
        headingJa: "連絡方法",
        en: [
          `Email ${PUBLISHER.email} for privacy requests, terms questions, and notices. For a product bug or a missing control, the form on this page or the feedback control on the homepage is enough. We do not operate a telephone desk or a chat widget.`,
          "Write in Japanese or English. Say whether you are asking about the board, the privacy policy, or an ad on a reading page. Do not attach identity documents unless we ask, and do not paste a full scene from the pitch.",
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
