# 実装プロンプト — ネイティブ `alert` 廃止（インライン／アプリ内フィードバック）

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

あなたは ZoneBoard（`c:\asl_dev\zoneboard`）の実装エージェントです。  
**いまやるのは:** 回復可能なエラー／警告に使っている **`window.alert()` をやめ**、Drawer／操作位置の近くで読める **インライン（または既存アプリ内ダイアログ流儀）** に置き換える。

シニア UI/UX 決定は確定済み。`alert` は PC でも重いが、**タブレット／スマホでは明確に NG**（フォーカス奪取・配信中のブロッキング・ブランド外 OS ダイアログ）。

---

## 0. 先に読め

1. 本プロンプト §1（監査一覧）— 実装前に `rg "window\\.alert|window\\.confirm"` で再確認
2. `src/components/Drawer.tsx` — 名簿・局面・取込の主戦場
3. `src/components/Editor.tsx` — paste/drop 取込 · 局面追加
4. `src/components/SettingsModal.tsx` — **confirm のみ**（§3）
5. `src/components/BoardLimitDialog.tsx` — **良い先例**（アプリ内ダイアログ。新規 alert の代わりに参考可）
6. `.cursor/rules/i18n-ui-guardrails.mdc` — ロケール分岐レイアウト禁止 · Short キー · Drawer は stack

---

## 1. 監査結果（2026-09-06 · 再検索で更新可）

### A. `window.alert` — **すべて置き換え必須（P0）**

| 場所 | トリガー | MessageKey（代表） | 種別 |
|------|----------|-------------------|------|
| `Drawer.tsx` | スタメンをピッチに配置 · 名簿空 | `lineupFail` | バリデーション |
| `Drawer.tsx` | 名簿を取込 · パース失敗 | `rosterParseFail` | バリデーション |
| `Drawer.tsx` | XI 適用 · パース失敗 | `xiParseFail` | バリデーション |
| `Drawer.tsx` | XI 適用 · 名簿に無い番号 | `xiMissing`（`{nums}`） | 警告（部分成功可） |
| `Drawer.tsx` | 新規局面 · 上限 | `sceneLimit` | 上限 |
| `Drawer.tsx` | 局面プリセット追加失敗等 | `sceneLimit` | 上限 |
| `Drawer.tsx` | 取込を局面に適用 · 上限 | `sceneLimit` | 上限 |
| `Drawer.tsx` | 局面取込開始エラー | `t(err)`（capture 系キー） | 取込エラー |
| `Editor.tsx` | 新規局面（トップバー側） | `sceneLimit` | 上限 |
| `Editor.tsx` | 取込 paste / drop 失敗 | `t(err)` | 取込エラー |

**方針:** ネイティブ `alert` **ゼロ**にする。文言キーは既存を再利用（クールな言い換え・全ロケール再翻訳はしない）。

### B. `window.confirm` — **P0 では維持可 · P1 候補**

| 場所 | MessageKey | なぜ confirm 寄りか |
|------|------------|-------------------|
| `Drawer.tsx` | `confirmBench` | サブ人数変更 → 配置やり直し（破壊的） |
| `SettingsModal.tsx` | `confirmClearDrawings` | 描画全消去 |
| `SettingsModal.tsx` | `confirmClear` | 選手＋描画全消去 |

**P0:** 触らなくてよい（破壊的確認）。  
**P1（任意・時間があれば）:** Settings 内はすでにモーダルなので、同じパネル内の二段確認や `BoardLimitDialog` 型の軽い confirm に寄せてもよい。必須ではない。

### C. 参考（すでにアプリ内）

- `BoardLimitDialog` — ボード上限の差し替え UI。**この流儀を新規 alert に使わない／インラインの参考に**

### D. デッド／未使用っぽいキー

- `confirmSport` — messages にあるが呼び出しが無い可能性。今回消さなくてよい（スコープ外）

---

## 2. 置き換えパターン（必須）

### 2-1. バリデーション／パース／警告（名簿・XI）

1. **インラインエラー**を操作の直下に出す（textarea / ボタン列の直後）。`role="alert"` または `aria-live="polite"`
2. 成功時・再入力開始時にクリア
3. **予防:** 名簿が空なら `applyLineup` ボタンを **`disabled`**。`title` / 隣接 hint に `lineupFail`（または短い同義）。空のまま押させて alert、はやめる
4. `xiMissing` はブロッキング不要 → **同じインライン枠を警告スタイル**（色は既存トークン。新規紫テーマ等禁止）

### 2-2. 局面上限 `sceneLimit`

- 可能ならボタン **`disabled={sceneLimit}`**（Drawer の新規は既に disabled 気味 — alert 分岐を残さない）
- disabled でも押せる経路があれば、局面セクション内のインライン／既存 hint に出す。**alert 禁止**

### 2-3. 取込エラー（capture · paste/drop）

- Drawer 内の取込 UI があれば **そのブロック内インライン**
- Editor の paste/drop のように Drawer 外なら:
  - 取込パネルが開いていればそこに表示、または
  - ピッチ上／ステータス帯の **一時的インライン**（数秒で消えても可）
- 巨大フルスクリーン・モーダルは作らない（BoardLimit 級は「選ばせる必要がある」ときだけ）

### 2-4. 共通実装の指針

- 小さなヘルパ or 局所 state（例: `rosterActionError: string | null`）でよい。過剰なトースト基盤・新デザインシステムは作らない
- **1 DOM 構造・全ロケール共通**（`if (locale === "ja")` レイアウト禁止）
- Drawer 幅を壊さない。長文は折り返し。新横並びボタン行を増やさない
- 既存 `hint-muted` の近くに `.drawer-inline-error`（名前任意）程度の CSS で十分
- i18n: **新 MessageKey は原則不要**。UI 用に Short が必要ならガードレールに従い全ロケール同時追加

---

## 3. スコープ

### やる（P0）

- §1-A の **すべての `window.alert`** を除去
- 名簿フロー（`lineupFail` · `rosterParseFail` · `xiParseFail` · `xiMissing`）をインライン＋予防 disabled
- 局面上限・取込エラーも alert なし
- PC / 狭い Drawer / タッチでも読めること（タップで消せる or 再操作で消える）

### やらない

- `window.confirm` の全面置換（P1）
- 文案の全面リライト · Cool 軸の再採点
- 言語別 OG · 扇形 · 向きノーズ復活議論
- 新トーストライブラリ追加
- コミット / push

---

## 4. 受け入れ条件

1. `rg "window\\.alert"` → **ヒットゼロ**（`src/` 配下）
2. 名簿空で「スタメンをピッチに配置」→ **ネイティブダイアログなし**。disabled かインラインのみ
3. 名簿パース失敗 · XI 失敗 · XI missing · sceneLimit · capture 失敗も同様
4. `window.confirm` は残っていてよい（ベンチ／クリア）
5. `npm run build` または `tsc --noEmit` PASS
6. 文言変更が無ければ `test:i18n-chrome` 任意。Short キー追加時は **必須**

---

## 5. 完了報告フォーマット

```
## 完了報告 — alert 廃止

### 変更ファイル
- …

### 置換一覧
| 旧 alert | 新 UI |
|----------|-------|
| lineupFail | … |
| … | … |

### confirm（残したもの）
- …

### 確認
- [ ] rg window.alert → 0
- [ ] 名簿空 applyLineup
- [ ] roster / xi parse
- [ ] sceneLimit
- [ ] capture エラー経路
- [ ] build / tsc

### 触らなかったもの
- confirm* · …
```

---

## 6. やらないこと（再掲）

- ネイティブ `alert` の温存
- 破壊的 confirm の無理な削除（誤操作でボード全消し）
- コミット
