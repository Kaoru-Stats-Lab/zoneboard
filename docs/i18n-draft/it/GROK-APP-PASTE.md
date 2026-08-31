# Grok 貼り付け用 — it App UI 評価（このファイル全文を Grok に貼る）

> プロンプト枠だけでは評価不可。**このファイル全文**（評価指示 + it JSON + howTo + en 参照）を 1 回で貼る。

---

## ROLE

3 人のネイティブ **it-IT** 話者:

| ペルソナ | 背景 |
|----------|------|
| **Marco（Milano）** | Watchalong · OBS · usa DrawTactics occasionalmente |
| **Giulia（Roma）** | Alesia / MatchStudio · analisi tattica · YouTube |
| **Luca（Torino）** | Debriefer · ex settore giovanile · scorciatoie tastiera |

**自己チェック目標:** « Leggo il pannello prima della diretta e so **senza dizionario** cosa cliccare? »

## プロダクト

- **Passaggio / Corsa / Dribbling** = linee (palla vs senza palla vs con palla)
- **Pennello / Collegamento / Zona**
- **Modalità diretta (B)** = strumenti nascosti · solo campo in OBS
- **5 corsie / corridoi** = half-space / tra le linee (hint)
- **lavagna tattica** — mai **lavagna** sola (scuola)

---

## A. App 必須キー（it · 実データ）

```json
{
  "tagline": "Lavagna tattica calcio per OBS. La modalità diretta nasconde gli strumenti.",
  "openBoard": "Apri lavagna tattica",
  "broadcast": "Modalità diretta",
  "exitBroadcast": "Esci da modalità diretta",
  "exitBroadcastShort": "Esci",
  "broadcastFocusHint": "Clicca per controllare la lavagna tattica",
  "pass": "Passaggio",
  "passHint": "Passaggio = traiettoria palla (passaggio, cross, tiro). I pezzi restano fermi",
  "run": "Corsa",
  "runHint": "Corsa = movimento senza palla. Trascina un pezzo",
  "dribble": "Dribbling",
  "dribbleHint": "Dribbling = movimento con palla. Trascina un pezzo",
  "deleteHint": "Passaggio=tratteggiato, Corsa=continua, Dribbling=ondulato. Seleziona, poi Elimina",
  "pen": "Pennello",
  "penHint": "Pennello = linea libera sull'erba. Shift+trascina per dritta. Usa Collegamento per seguire i pezzi",
  "link": "Collegamento",
  "linkHint": "Collegamento = clic sui pezzi per unirli con una linea. Stesso pezzo, erba vuota o Invio per finire. Esc annulla",
  "zone": "Zona",
  "lanes5": "5 corsie",
  "lanesOffShort": "Off",
  "lanesOnShort": "Corsie",
  "lanes5Hint": "Gli half-space seguono la larghezza dell'area e il cerchio di centrocampo",
  "matchLabelPh": "Giornata 1",
  "titlePh": "Note partita",
  "homeTeamPh": "CAS",
  "awayTeamPh": "TRAS",
  "rosterPlaceholder": "10,Romano,R\n7,Ferrari\n4,Bianchi\n11,Rossi,L",
  "obsSection": "Usa con OBS",
  "obsIntro": "Consigliato: cattura finestra + modalità diretta + 1920×1080",
  "obsStep2": "Attiva la modalità diretta sulla lavagna tattica (tasto B)",
  "obsStep3": "OBS → Sorgenti → Cattura finestra → questo browser. Abilita area client",
  "obsNotIncluded": "Webcam e chat restano in OBS. ZoneBoard non aggiunge webcam alla lavagna tattica.",
  "languageHint": "Cambia solo i menu della lavagna tattica. Landing page e pagine di lettura restano in inglese. I nomi sul campo restano come li hai scritti."
}
```

## A2. *Short キー一覧（drawer 溢出監査 · ~12 ラテン文字目安）

```json
{
  "pieceHomeShort": "Casa",
  "pieceAwayShort": "Trasf.",
  "presetSquareShort": "Quadrato",
  "presetX169Short": "16:9",
  "presetIg45Short": "4:5",
  "presetStoryShort": "Story",
  "presetNativeShort": "Campo",
  "newBoardShort": "+ Nuova",
  "deleteBoardShort": "Elimina",
  "addGoalShort": "Aggiungi",
  "addCardShort": "Aggiungi",
  "newSceneShort": "Duplica",
  "deleteSceneShort": "Elimina",
  "captureImportShort": "Importa",
  "captureImportCancelShort": "Annulla",
  "captureApplyToSceneShort": "Applica",
  "captureDiscardShort": "Scarta",
  "captureNewSceneShort": "Nuova scena",
  "captureFrameChooseFileShort": "Scegli video",
  "captureFrameCopyShort": "Copia PNG",
  "captureFrameOpenShort": "Estrai frame",
  "captureUnderlayOpacityShort": "Sottofondo",
  "captureBackToCalibShort": "4 angoli",
  "captureCalibStartShort": "4 angoli",
  "captureCalibApplyShort": "Applica",
  "captureCalibResetShort": "Reimposta",
  "sceneMirrorEndsShort": "Inverti",
  "fromPresetShort": "Preset",
  "viewFullShort": "Intero",
  "viewFtLShort": "Terzo S",
  "viewFtRShort": "Terzo D",
  "viewFtTopShort": "Terzo A",
  "viewFtBottomShort": "Terzo B",
  "viewCkSetupLShort": "Ang. S",
  "viewCkSetupRShort": "Ang. D",
  "viewCkSetupTopShort": "Ang. A",
  "viewCkSetupBottomShort": "Ang. B",
  "viewCkBlShort": "Ang. BS",
  "viewCkBrShort": "Ang. BD",
  "viewCkTlShort": "Ang. AS",
  "viewCkTrShort": "Ang. AD",
  "viewThrowTopShort": "Rim. A",
  "viewThrowBotShort": "Rim. B",
  "viewThrowLeftShort": "Rim. S",
  "viewThrowRightShort": "Rim. D",
  "viewPenLShort": "Area S",
  "viewPenRShort": "Area D",
  "viewPenTopShort": "Area A",
  "viewPenBottomShort": "Area B",
  "viewBballFrontRShort": "Front D",
  "viewBballFrontLShort": "Front S",
  "viewBballPaintRShort": "Area D",
  "viewBballPaintLShort": "Area S",
  "viewBballTopShort": "Centro",
  "viewBballWingTShort": "Ala A",
  "viewBballWingBShort": "Ala B",
  "viewBballCornerTRShort": "AD",
  "viewBballCornerBRShort": "BD",
  "viewBballCornerTLShort": "AS",
  "viewBballCornerBLShort": "BS",
  "viewBballTransitionShort": "Trans.",
  "viewGoalLShort": "Porta S",
  "viewGoalRShort": "Porta D",
  "viewMidLShort": "Centro S",
  "viewMidRShort": "Centro D",
  "viewCornerTLShort": "AS",
  "viewCornerTRShort": "AD",
  "viewCornerBLShort": "BS",
  "viewCornerBRShort": "BD",
  "viewVolleyLShort": "Proprio",
  "viewVolleyRShort": "Avv.",
  "lanesOffShort": "Off",
  "lanesOnShort": "Corsie",
  "screenShort": "Schermo",
  "sizeTacticsShort": "Tattica",
  "sizeBalancedShort": "Bilanciato",
  "sizePositionShort": "Posizione",
  "exitBroadcastShort": "Esci"
}
```

---

## B. How-to（howTo.it.json 全文）

```json
{
  "_meta": {
    "locale": "it",
    "bcp47": "it-IT",
    "source": "howTo.ts en ONLY"
  },
  "intro": "La modalità diretta (B) nasconde gli strumenti. Muovi i pezzi con la tastiera. Prova i tasti qui prima di andare in diretta — le stesse scorciatoie funzionano durante lo stream. Non c'è un tutorial iniziale sul campo. Questo pannello e la guida pubblica sono il manuale.",
  "sections": [
    {
      "heading": "Perché la tastiera",
      "paragraphs": [
        "Gli spettatori vogliono vedere il campo. Se il pannello laterale resta aperto, vedono menu, non tattica. La modalità diretta (B) nasconde gli strumenti. Restano selezionare, muovere e ruotare.",
        "Non serve imparare ogni scorciatoia. Alcuni spostano un'intera linea. Altri selezionano solo la casa. Altri copiano una scena e confrontano due disegni. Impara solo i tasti che usi."
      ]
    },
    {
      "heading": "Selezionare i pezzi",
      "paragraphs": [
        "Fai prima la selezione — una linea, un blocco in marcatura, o solo la casa — poi muovila. Se muovi prima, trascinerai un pezzo alla volta.",
        "Trascina sull'erba vuota per disegnare un riquadro e selezionare i pezzi dentro. I pezzi non hanno etichette di ruolo come DC, quindi disegna un riquadro attorno alla linea difensiva. Tieni premuto Ctrl o Cmd mentre trascini per aggiungere alla selezione attuale.",
        "Un clic breve quasi senza movimento annulla la selezione. Cliccare sull'erba vuota con Ctrl o Cmd premuto non la annulla."
      ],
      "keys": [
        { "combo": "Click", "meaning": "Seleziona un pezzo" },
        { "combo": "Ctrl/Cmd+Click", "meaning": "Aggiungi o rimuovi" },
        { "combo": "Shift+Click", "meaning": "Aggiungi (mantieni il resto)" },
        { "combo": "Drag empty grass", "meaning": "Selezione a riquadro" },
        { "combo": "Alt+1 / Alt+2", "meaning": "Tutta la casa / tutta la trasferta" },
        { "combo": "Ctrl/Cmd+A", "meaning": "Seleziona tutti i visibili" },
        { "combo": "Esc", "meaning": "Annulla selezione" }
      ]
    },
    {
      "heading": "Muovere la selezione",
      "paragraphs": [
        "Trascina un pezzo selezionato e l'intera selezione si muove insieme. Usalo per alzare una linea, saltare al pressing o scivolare mantenendo la marcatura. Rilasciare una selezione multipla non scambia le maglie. Lo scambio funziona solo con un pezzo.",
        "Le frecce muovono a piccoli passi. Shift + freccia fa un passo più grande. Usalo quando dici \"ancora mezzo passo\" durante la diretta.",
        "R cambia solo l'orientamento. Le posizioni restano uguali. Usalo per squadrare un blocco. Q / E ruotano l'intera forma attorno al centro della selezione. Seleziona due o più pezzi.",
        "- avvicina i pezzi. = li allontana. Il centro della selezione si muove appena — utile per una linea alta compatta o aperta.",
        "Shift+H specchia sinistra e destra, orientamento incluso. Shift+V capovolge alto e basso. Ctrl/Cmd+D copia i pezzi; le copie restano selezionate così puoi farle scorrere a coppia."
      ],
      "keys": [
        { "combo": "Drag a selected piece", "meaning": "Muovi l'intera selezione" },
        { "combo": "Arrow / Shift+Arrow", "meaning": "Sposta (fine / grosso)" },
        { "combo": "R", "meaning": "Solo orientamento +45°" },
        { "combo": "Q / E", "meaning": "Ruota forma sul centro" },
        { "combo": "- / =", "meaning": "Più stretto / più largo" },
        { "combo": "Shift+H / Shift+V", "meaning": "Specchia H / specchia V" },
        { "combo": "Ctrl/Cmd+D", "meaning": "Duplica (copie selezionate)" },
        { "combo": "Ctrl/Cmd+Shift+Arrow", "meaning": "Allinea a bordo o asse" },
        { "combo": "Alt+Shift+Arrow", "meaning": "Spaziatura uniforme (H / V)" },
        { "combo": "Delete", "meaning": "Rimuovi pezzi selezionati" }
      ]
    },
    {
      "heading": "Disegnare prima della diretta",
      "paragraphs": [
        "Prima della diretta, usa la barra strumenti per Passaggio, Corsa, Pennello e Collegamento. Passaggio è la traiettoria della palla — passaggio, cross o tiro. Corsa è movimento senza palla. Dribbling è un giocatore che conduce la palla.",
        "Pennello è una linea libera che non è Passaggio o Corsa — una linea di blocco o un confine di corridoio. Tieni premuto Shift mentre trascini Pennello per una linea dritta. Cerchi e loop restano a mano libera senza Shift. Collegamento unisce i pezzi; la linea li segue quando li muovi."
      ],
      "keys": [
        { "combo": "Pass", "meaning": "Traiettoria palla (tratteggiata)" },
        { "combo": "Run / Dribble", "meaning": "Corsa o dribbling" },
        { "combo": "Pen", "meaning": "Linea a mano libera" },
        { "combo": "Link", "meaning": "Collegamento pezzi (segue)" },
        { "combo": "Shift+Pen drag", "meaning": "Linea dritta da A a B" },
        { "combo": "Zone + Shift", "meaning": "Zona quasi circolare" }
      ]
    },
    {
      "heading": "Muovere la vista",
      "paragraphs": [
        "Zoom su una palla inattiva o guarda l'intera metà campo — Ctrl o Cmd + rotella zoom verso il cursore. Tieni premuto Spazio e trascina per spostare la vista. Alt + trascina funziona anche."
      ],
      "keys": [
        { "combo": "Ctrl/Cmd+Wheel", "meaning": "Zoom sul cursore" },
        { "combo": "Space+Drag", "meaning": "Sposta la vista" },
        { "combo": "Alt+Drag", "meaning": "Sposta la vista (alternativa)" }
      ]
    },
    {
      "heading": "Prima e durante la diretta",
      "paragraphs": [
        "Prima del calcio d'inizio, prova ad alzare una linea e riportarla indietro, o a selezionare la casa e avvicinarla. Poi quei tasti funzionano anche in modalità diretta. Premi B per la modalità diretta. Non aprire questa guida (? / F1) durante la diretta — compare a schermo.",
        "Cambia scena con [ ]. Metti un calcio d'angolo e una forma di rest difesa su scene separate, non in un unico disegno affollato.",
        "Per provare un movimento e tenere l'originale, copia la scena prima di trascinare. La prima scena resta — torna con [ ]. Durante la diretta, usa Duplica in basso a destra. Non c'è un pulsante per tornare all'inizio. Copiare la scena è come tenere un originale pulito."
      ],
      "keys": [
        { "combo": "B", "meaning": "Attiva/disattiva modalità diretta" },
        { "combo": "[ ] or PageUp/PageDown", "meaning": "Cambia scena" },
        { "combo": "Duplicate (Scenes or bottom-right)", "meaning": "Copia scena, prova movimento" },
        { "combo": "? or F1", "meaning": "Guida (non in diretta)" }
      ]
    }
  ]
}
```

---

## C. en 参照（並べて読む）

```json
{
  "tagline": "Football tactics board for OBS. Broadcast mode hides the tools.",
  "openBoard": "Open board",
  "broadcast": "Broadcast mode",
  "exitBroadcast": "Exit broadcast mode",
  "pass": "Pass",
  "run": "Run",
  "dribble": "Dribble",
  "passHint": "Pass = ball path (pass, cross, shot). Pieces stay put.",
  "runHint": "Run = off-ball movement. Drag a piece.",
  "dribbleHint": "Dribble = ball-carrying run. Drag a piece.",
  "deleteHint": "Pass=dashed, Run=solid, Dribble=wavy. Select, then Delete",
  "penHint": "Pen = freehand line on the grass. Shift+drag for straight. Use Link to follow pieces",
  "linkHint": "Link = click pieces to join with a line. Same piece, empty grass, or Enter to finish. Esc cancels",
  "lanes5": "5 lanes",
  "lanes5Hint": "Half-spaces align to penalty-box width and the centre circle.",
  "matchLabelPh": "Matchday 1",
  "homeTeamPh": "HOME",
  "awayTeamPh": "AWAY",
  "rosterPlaceholder": "10,Müller,R\n7,Schmidt\n4,Schneider\n11,Weber,L",
  "obsIntro": "Recommended: window capture + broadcast mode + 1920×1080",
  "obsStep2": "Turn on broadcast mode on the board (B key)",
  "obsStep3": "OBS → Sources → Window Capture → this browser. Enable client area",
  "languageHint": "Changes only the board menus. Landing page and reading pages stay in English. Names on the pitch stay as you typed them."
}
```

---

## やること

1. **パネル 5 秒テスト**（3 人 · 初見で「cos'è / cosa clicco」→ **日本語要約**）
2. **ツール名一貫性:** Passaggio / Corsa / Dribbling · Pennello / Collegamento / Zona — 矛盾があれば列挙
3. **Passaggio vs Corsa:** hint で区別が **calcio 視聴者に明確**か
4. **lavagna tattica:** board 系キーで **lavagna scuola** 連想が出ないか · **lavagna** 単独の残存
5. **戦術語（hint/howTo のみ）:** half-space · pressing · tra le linee — 自然か
6. **プレースホルダ中立:** 実在クラブ/リーグ/スター（Juve, Inter, Milan, Serie A, Immobile…）が **Ph / Placeholder** に無いか
7. ***Short キー:** ~12 ラテン文字超えで drawer が溢れそうなもの
8. **How-to:** 5 セクション · `keys[].combo` が **英語のまま**か · 配信前の読みやすさ · **erba vs campo** 混在
9. **DrawTactics ユーザー視点:** 「in live è più leggero / mi manca X» — X は invent 禁止
10. **CMO 判定:** 出荷可 / 要修正 / 要リライト · **App top 5 修正**（キー · 現行 · 提案）

## 出力フォーマット（日本語）

- 5 秒テスト
- ツール名・用語表（OK / 要統一）
- Passaggio/Corsa 評価
- プレースホルダ監査
- Short 溢出リスト
- How-to 評価
- CMO 判定 + top 5

## 禁止

- de/fr/es/tr ドラフトを正本にしない
- 新キー invent · combo を it 化する提案
- 3-back 可変 preset など **未実装機能**を「翻訳不足」としない
