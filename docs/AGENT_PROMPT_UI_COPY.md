# プロンプト — ボード UI 文案（波2: hint / title）

**波1:** [`AGENT_PROMPT_HOWTO_COPY.md`](AGENT_PROMPT_HOWTO_COPY.md) · `howTo.ts`  
**波2（本ファイル）:** `src/i18n/messages.ts` の `*Hint` とツール `*Hint` · OBS 系  
**波2b（読み物）:** `src/site/pages.ts` の `guide` · `faq` → `npm run site:pages`

---

## 対象キー（触る）

- `*Hint`（`title` / `aria-label` 用の全文キーも同名系）
- ツール: `passHint` `runHint` `dribbleHint` `penHint` `linkHint` `ballSnapHint` `pieceSwapHint` `pieceRotateHint`
- 局面: `scenesHint` `newSceneHint` `sceneNotesHint` `sceneMirrorEndsHint`
- 操作: `wipeDrawingHint` `deleteHint` `viewFocusHint` `teamFocusHint`
- 配信: `obs*` hint 系 · `broadcastFocusHint` `exitBroadcastHint` `matchBannerHint`
- `applyLineupHint`

## 触らない

- `*Short`（レイアウト固定 — [`i18n-chrome-check.ts`](../scripts/i18n-chrome-check.ts)）
- LP キー（`lp*` — [`LP_COPY.md`](LP_COPY.md) ロック）
- 法務 · confirm ダイアログ本文
- 競技オーバーレイ専門 hint（`lanes5Hint` 等）— 波3

## 語彙（howTo と同じ）

| 使う | 使わない |
|------|----------|
| 駒 · 選択 · 局面 | 塊 · グループ · シーン（ja） |
| Pass / Run / Pen / Link（ツール名） | パス / ラン（hint 内） |
| piece · selection · scene（en） | chrome · group · fork |

## 検証

```bash
npm run test:i18n-chrome
npx tsc --noEmit
```
