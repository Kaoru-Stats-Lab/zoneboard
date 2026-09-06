# 日本語コピー リライト — 実装ログ

**Date:** 2026-09-06  
**Scope:** オプション 3（LP + 公開 chrome + App chrome）  
**Voice:** [`VOICE-JA.md`](VOICE-JA.md)

---

## 状態

| 面 | 状態 |
|----|------|
| A · LP (`lp*` · tagline · openBoard*) | **反映済** → `messages.ts` ja |
| B · `localePublicCopy` · `consentCopy` | **反映済** |
| C · App chrome（hint · OBS · 確認 · 駒→選手） | **反映済** |
| Grok レビュー | **済** — [`GROK-LP-REVIEW.md`](GROK-LP-REVIEW.md) · [`GROK-APP-REVIEW.md`](GROK-APP-REVIEW.md) · top 5 反映済 |
| FAQ / About / howTo 長文 | **Pending**（方針どおり触らない） |

---

## 主な変更（例）

| Before | After |
|--------|-------|
| ウォッチアロングの夜のために。 | 試合配信の夜に。 |
| あなたのクラブバッジを芝に置ける。 | クラブのエンブレムをピッチに載せられる。 |
| ホーム駒 / アウェイ駒 | ホーム / アウェイ |
| 駒と描画を全消去 | 選手と描画を全消去 |
| 読み物ページは英語です | ガイドなどの長文は英語版です |
| 任意を拒否 | 任意の Cookie を拒否 |
| 続行しますか？ | 続けますか？ |

---

## ファイル

| パス | 役割 |
|------|------|
| `src/i18n/messages.ts` | ja LP + App chrome |
| `src/site/localePublicCopy.ts` | フッター注記 · Settings hint |
| `src/site/consentCopy.ts` | Cookie バナー |
| `docs/AGENT_PROMPT_I18N_JA*.md` | Gemini / Grok 用プロンプト |
| `docs/i18n-draft/ja/*.json` | ドラフト正本（再レビュー用） |

---

## 次（任意）

1. Grok ← **[`GROK-LP-PASTE.md`](GROK-LP-PASTE.md)** 全文 → 回答を `GROK-LP-REVIEW.md` に保存  
2. Grok ← **[`GROK-APP-PASTE.md`](GROK-APP-PASTE.md)** 全文 → 回答を `GROK-APP-REVIEW.md` に保存  
3. 各 **top 5** を手修正 → `messages.ts` / `localePublicCopy` / `consentCopy` 再反映  

FAQ / About / howTo は **Pending**（評価・実装とも触らない）。

---

## 検証

- `npm run test:i18n-chrome` — **PASS**（2026-09-06）
- `messages.ts` ja 内: `駒` / `芝上` / `読み物` / `ウォッチアロング` / `ローカル保存` / `続行しますか` — **0 件**