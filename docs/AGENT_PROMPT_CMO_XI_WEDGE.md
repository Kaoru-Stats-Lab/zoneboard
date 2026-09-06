# 実装プロンプト — CMO 楔コピー「型ではなく、この試合のスタメン」

このファイルをそのまま **別 Agent（Cursor Auto 可）** に渡してよい。

日本語で報告する。**コミットはユーザが頼むまでしない。**

---

あなたは ZoneBoard（`c:\asl_dev\zoneboard`）の実装エージェントです。  
**いまやるのは:** フォーメ非所持を LP の短い楔文に載せる。確定文案は以下のみ。

| 言語 | 確定文（句点含む） |
|------|-------------------|
| **ja** | `型ではなく、この試合のスタメン。` |
| **en** | `Not a template — this match's XI.` |

**意図（冗長にしない）:** 本来は「フォーメーションではなく、この試合のスタメン」。対比の左辺は短い **「型」** で足りる。右辺は **「スタメン」**（「並び」禁止）。時間帯は **「この試合」**（「今夜」禁止 — デイゲーム考慮）。

---

## 0. 先に読め

1. [`docs/MATCHDAY_UX_SPEC.md`](MATCHDAY_UX_SPEC.md) — §7-1 項1 · §4 Lineup 裁定  
2. [`docs/PRODUCT_NOTE.md`](PRODUCT_NOTE.md) — フォーメプリセット決定ログ（運営カタログを持たない）  
3. `.cursor/rules/i18n-ui-guardrails.mdc`  
4. `src/i18n/messages.ts` — 全ロケールの `lpCanTitle` · `lpCanLead` · `tagline`  
5. （任意）`docs/i18n-draft/ja/messages-lp.ja.json` · `docs/i18n-draft/ja/VOICE-JA.md`

---

## 1. 置き場所（必須）

**キー:** `lpCanTitle`（Landing の can セクション見出し）

| ロケール | 現行（参考） | 変更後 |
|----------|--------------|--------|
| **ja** | `試合配信の夜に。` | **`型ではなく、この試合のスタメン。`** |
| **en** | `Built for the watchalong stream.` | **`Not a template — this match's XI.`** |

### 他ロケール（es · pt · pl · de · fr · tr · it）

同じキー `lpCanTitle` を、**en の意味**に合わせて短く直す（直訳で「今夜／夜」に戻さない）。

| ロケール | 推奨案（エージェントが自然さ優先で微調整可 · 意味は固定） |
|----------|----------------------------------------------------------|
| es | `No es un esquema — el once de este partido.` |
| pt | `Não é um esquema — o XI deste jogo.` |
| pl | `Nie szablon — skład na ten mecz.` |
| de | `Kein Schema — die Startelf dieses Spiels.` |
| fr | `Pas un schéma — le onze de ce match.` |
| tr | `Şablon değil — bu maçın ilk 11'i.` |
| it | `Non uno schema — l'undici di questa partita.` |

意味制約:

- **左:** フォーメ／テンプレ／スキーマ（短い対比）  
- **右:** この試合の XI／スタメン／once／undici  
- **禁止:** 今夜 · tonight · stasera · cette nuit · watchalong の夜 だけを見出しにする

---

## 2. `lpCanLead`（任意 · 推奨）

見出しが楔になったので、リードが「配信者向け…」のままでも可。  
**ja** が浮く場合のみ、1 文で補う例:

- ja: `配信者向け。型に並べず、今夜というよりこの試合の XI を置く。` → **やらない**（冗長・今夜が混ざる）  
- ja 推奨リード（変更する場合）: `配信者向け。同じボードは指導でも使える。`（現行 `lpCanLead` 維持でよい）

**原則:** `lpCanLead` は無理に触らない。触るなら「今夜」を増やさない。

---

## 3. 触るな

| 禁止 | 理由 |
|------|------|
| `lpHeadline1` の「今夜の OBS」を消す | 配信スロット口語。本タスクの対象外 |
| Lineup Mode · スタメン専用画面 · 4-3-3 カタログ | MATCHDAY_UX_SPEC 非交渉 |
| 新 MessageKey の invent（不要なら） | 既存 `lpCanTitle` で足りる |
| FAQ / About / howTo 長文 | Pending |
| 「並び」「フォーメーションではなく」フル表記 | 冗長。確定文は「型ではなく」 |
| コミット | ユーザ指示があるまで |

---

## 4. 同期ファイル

変更したら揃える:

| ファイル | 内容 |
|----------|------|
| `src/i18n/messages.ts` | 全ロケール `lpCanTitle` |
| `docs/i18n-draft/ja/messages-lp.ja.json` | `lpCanTitle` |
| `docs/i18n-draft/ja/GROK-LP-PASTE.md` | 埋め込み JSON の同キー（ある場合） |
| `docs/MATCHDAY_UX_SPEC.md` §7-1 | 「実装済」と日付を1行追記してよい |

`index.html` / `siteMeta.ts` の OG 説明文は **本タスクでは触らない**（H1 系は別議論）。

---

## 5. 検証

```bash
npm run test:i18n-chrome
```

- [ ] ja / en の `lpCanTitle` が上表どおり  
- [ ] 他ロケールも「試合単位の XI」意味 · 夜固定なし  
- [ ] キー数不変 · Short ペア破壊なし  

---

## 6. 完了報告（日本語・短く）

1. 変更したロケールと最終文字列一覧（表）  
2. `lpCanLead` を触ったか（Yes/No）  
3. `test:i18n-chrome` 結果  
4. 触らなかったもの（H1 · OG · Lineup）  

---

## 付録 — 裁定メモ（実装判断に迷ったら）

> 型ではなく、この試合のスタメン。◎  
> 本来は「フォーメーションではなく、この試合のスタメン」だが冗長なので「型」で圧縮。  
> 「今夜」はデイゲーム（PL / ブンデス等）を切り捨てるので楔文では使わない。  
> LP H1「今夜の OBS」は別枠（配信の口語）として残す。
