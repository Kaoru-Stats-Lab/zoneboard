# 実装プロンプト — ツールモード契約（選択 / 配置 / 描画）

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

**前提:** 縦ピッチ · Pitch View · 名前ピル等は触らない。いま直すのは **ツールのスティッキー挙動と現在地の可視化** だけ。

仕様: [`PRODUCT_NOTE.md`](PRODUCT_NOTE.md) 決定ログ「ツールモード契約（2026-08-31）」。矛盾したら PRODUCT_NOTE を勝ちにする。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

あなたは ZoneBoard（`c:\asl_dev\zoneboard`）の実装エージェントです。

---

## 0. 先に読め

1. [`docs/PRODUCT_NOTE.md`](PRODUCT_NOTE.md) — 決定ログ「ツールモード契約（2026-08-31）」
2. このファイル全文
3. `.cursor/rules/i18n-ui-guardrails.mdc`
4. コード（挙動の正本）:
   - `src/components/BoardCanvas.tsx` — `onPointerDown` / `onPointerUp` · `linkDraftIds` · 線・ゾーン・ペン・リンク
   - `src/hooks/useAppState.ts` — `tool` · `setTool` · `addPieceAt`（配置後 `select` 済み）· `addLink`
   - `src/components/ToolRail.tsx` — 編集モードの縦レール
   - `src/components/BroadcastToolMenu.tsx` — 配信モード（**既にツール名表示あり** · 挙動だけ揃える）
   - `src/components/Editor.tsx` — キーボード `V` → `select` · `toolLabel`
   - `src/styles.css` — `.tool-rail-btn.active` · `.broadcast-tool-toggle`
   - `src/i18n/messages.ts` — `linkHint` 等
   - `src/i18n/howTo.ts` — 必要なら Link 説明1行

触らない: LP · Drawer 試合タブ · 縦ピッチ · PH · docs 大量追加 · ツールレールのアイコン化。

---

## 1. 問題（直すこと）

ユーザ報告: **リンクで駒を繋いだあと、ドリブル等に切り替えようとすると引っかかる。** レールはグレーでアクティブ表示しているが、**今何モードか分かりにくい。**

### 現状（コード事実）

| ツール | 1アクション後 |
|--------|----------------|
| `piece-home` / `piece-away` | **`select` に戻る**（`addPieceAt`） |
| `pass` · `run` · `dribble` · `screen` · `pen` · `zone` · `text` · `link` | **そのまま残る**（`setTool("select")` なし） |
| `ball` | スティッキー |

リンクだけ **第2状態** `linkDraftIds`（途中の鎖）があり、確定後もツールはリンクのまま。  
編集モードは `.tool-rail-btn.active` のみ。リンク色 `#404040` は非アクティブと区別しづらい。`選択` はレール最上段でスクロールすると画面外。

---

## 2. ゴール（受け入れ）

### 2-1. モード契約（必須）

| 契約 | ツール | 1アクション後 |
|------|--------|----------------|
| 選択 | `select` | — |
| 配置 | `piece-home` · `piece-away` | `select`（**変更なし**） |
| 描画 | `pass` · `run` · `dribble` · `screen` · `pen` · `zone` · `text` | **`select` に戻る** |
| リンク | `link` | **鎖確定（`addLink`）直後に `select` に戻る** |
| ボール | `ball` | **スティッキー維持**（変更なし） |

**リンク確定トリガー（既存 · 変えない）:** 同じ駒再クリック · 空き地クリック（2駒以上）· Enter。  
**Esc:** 鎖だけクリア（ツールはリンクのまま — 既存どおり）。

**描画の「1アクション」:**

- 線（pass/run/dribble/screen）: `onPointerUp` で `addLine` / `movePieceWithLine` した直後
- ゾーン: `addZone` した直後
- ペン: `addPen` した直後
- テキスト: テキスト編集を **確定**（Enter / blur で保存）した直後 — キャンセルだけでは戻さない

**実装方針:** `setTool("select")` を BoardCanvas 各完了点に足すか、`useAppState` に `finishDrawAction()`（内部で `setTool("select")`）を1か所定義して呼ぶ。重複を最小に。

### 2-2. 発見性（必須）

1. **編集モードでも現在ツールを常時表示**  
   - 配信の `BroadcastToolMenu` トグルと同趣旨（`toolIndicator` + ラベル）  
   - 置き場所案: ツールレール直上の1行、またはレール内グリップ下。ピッチを侵食しすぎない  
   - **配信モードの既存表示は壊さない**

2. **`選択` をスクロール外に固定**  
   - 案A: レール最上段に `選択` をピンし、残りだけ `overflow-y: auto`  
   - 案B: レール下部に `選択` 固定ボタン  
   - どちらか1つ。12項目全部スクロール必須にしない

3. **リンクのアクティブ状態を強化**  
   - グレー塗りだけに頼らない（左ボーダー太め · ラベル色 · レール横インジケータなど）

4. **リンク途中のサブ状態**（`linkDraftIds.length > 0`）  
   - ピッチ上またはレール近くに短い英語（公開 UI 英語）  
   - 例: `Linking: 2 pieces · Esc cancel`  
   - i18n: `linkDraftStatus` 等 · `ja` / `en` 両方 · Short 不要（ピッチ上は短文1行）

### 2-3. コピー修正（必須 · 小）

`linkHint` が実装とズレていないか確認。リンクは **クリック連鎖**（同じ駒で確定）。「ダブルクリック」は **テキスト編集**用でありリンクでは使わない。how-to に誤記があれば1行修正。

---

## 3. やってはいけない

- 全ツールを永久スティッキーのまま残す
- リンク確定後もリンクのまま（現状維持）
- ボールを1ドラッグごとに `select` に戻す（スコープ外）
- ツールレールをアイコンだけに作り替える
- 新ツール追加 · リンクの `Shift` 連続モード（Later）
- `if (locale === "ja")` レイアウト分岐
- LP / `/updates` / PRODUCT_NOTE の勝手な大量編集
- 勝手 commit / push

---

## 4. 触るファイル（目安）

| ファイル | 変更 |
|----------|------|
| `src/components/BoardCanvas.tsx` | 描画・リンク完了後 `select` |
| `src/hooks/useAppState.ts` | 任意: `finishDrawAction` ヘルパ |
| `src/components/ToolRail.tsx` | 選択ピン · 現在地表示 |
| `src/components/Editor.tsx` | 編集 chrome のツール表示（必要なら） |
| `src/styles.css` | ピン · リンク active · ドラフトバナー |
| `src/i18n/messages.ts` | `linkDraftStatus` 等 |
| `src/i18n/howTo.ts` | Link 1行（必要時のみ） |

Ship 後は [`docs/CHANGELOG_PUBLIC.md`](CHANGELOG_PUBLIC.md) に従い `src/site/changelog.ts` + `npm run site:pages` — **本 Agent ではやらない**（ユーザ依頼時）。

---

## 5. ガードレール

1. **配置（ホーム/アウェイ）の既存 `select` 復帰を壊すな**
2. **配信モード**でツール切替・`select` 復帰がキーボードと整合すること
3. **線を引く最中**（pointer down 〜 up）に `select` に飛ばない — **完了後だけ**
4. **リンク鎖の途中**で他ツールをレールから選んだら `linkDraftIds` はクリア（既存 `useEffect`）· 新ツールで動くこと
5. **V キー**は引き続き `select`（Shift+V は駒反転のまま · 衝突しないこと）
6. `npx tsc --noEmit` · `npm run test:i18n-chrome` 必須

---

## 6. 検証チェックリスト（手動）

- [ ] パス1本描いたあと **自動で選択** · 駒をドラッグ移動できる
- [ ] ラン/ドリブル（駒から線）も同様
- [ ] リンク: 2駒以上つないで確定 → **選択に戻る** · 次のクリックは移動
- [ ] リンク途中 Esc → 鎖だけ消える · ツールはリンクのまま
- [ ] リンク途中にドリブルをレール選択 → ドリブルで駒ドラッグできる
- [ ] ホーム駒配置 → 選択（回帰）
- [ ] ボールドラッグ → ボールのまま（回帰）
- [ ] 編集モードで **現在ツール名が常に見える**
- [ ] **選択**がスクロールしなくても押せる
- [ ] リンク active が非アクティブと区別できる
- [ ] リンク途中バナーが出る / 消える
- [ ] 配信モード: 既存ツールメニューが壊れていない
- [ ] `tsc` · `test:i18n-chrome`

---

## 7. 完了報告（日本語）

- 契約表（配置/描画/リンク/ボール）の実装結果
- 現在地 UI の置き場所
- 選択ピンの方式（A or B）
- 触ったファイル
- チェックリスト結果
- Later 明示: リンク連続モード（Shift/L）· ツールレールアイコン化
