# Product Hunt — 準備ログ

**更新:** 2026-08-26  
**判定:** **キット準備は進める。Launch ボタンはまだ押さない。**  
**本番:** https://zoneboard.app（Cloudflare Pages · `main` 自動デプロイ）

---

## 0. いまの結論

| 項目 | 状態 |
|---|---|
| 製品の楔（OBS に足す・B でツール消す・芝に運営ロゴなし） | **Ready**（LP 出荷済） |
| 公開面（英語一本・メタ・OGP PNG） | **Ready**（本コミット） |
| 貼れる Guide / FAQ アンカー | **Ready**（本コミット） |
| 認知の代替（PNG 任意クレジット · 説明文コピー） | **Ready**（本コミット · 既定 OFF） |
| PH ギャラリー（Press B → OBS が3秒で分かる素材） | **未** |
| PH 文案（tagline · description · first comment） | **未固定** |
| 初日のつて / hunter | **なし**（必須条件にはしない） |
| FAQ の大幅拡充 | **後**（実問が来てから） |
| GA4「ボードを開いた」確認 | **要確認**（別タスク） |

---

## 1. 製品として揃っているもの（2026-08-26）

### LP / 製品
- OBS-first H1 · Hero → How → Can → Close
- エンドカードは LP に載せない · `/materials/` へ
- Press B · no account · cam/chat は OBS
- PNG 枠ドラッグ（クロップ）· 比率連動ズームは作らない（決定済）

### 認知（ライブ透かしなし）
- **B:** Settings → optional `zoneboard.app` PNG footer（既定 OFF · 芝／Broadcast には入らない）
- **C:** 配信説明用コピー — `/materials/` コピーボックス · Settings→OBS  
  `Board: https://zoneboard.app — no account. Press B to hide tools. Window capture in OBS.`
- 正本: [`src/site/shareCopy.ts`](../src/site/shareCopy.ts) · 決定: [`COMPETITIVE_LP.md`](COMPETITIVE_LP.md) §0b

### SEO / OGP
- ホーム + 読み物: description 更新 · `og:*` · `twitter:card=summary_large_image`
- 画像正本: [`/brand/lockup-og.png`](../public/brand/lockup-og.png)（1200×630）· `npm run brand:og`
- メタ正本: [`src/site/siteMeta.ts`](../src/site/siteMeta.ts)

### Deep links
- Guide: `/guide/#place` · `#draw` · `#show` · `#after` · `#rehearse` · `#limits`
- FAQ: `/faq/#account` · `#blank-encoder` · `#free` · …（明示 id）
- HowTo モーダル → `/guide/#place`
- 生成: [`src/site/siteAnchors.ts`](../src/site/siteAnchors.ts) · `npm run site:pages`

---

## 2. Launch 前にまだやること（優先順）

1. **本番スモーク** — LP · `/board` · B · Settings コピー · `/materials/` · OGP 画像 URL  
2. **GA4** — Measurement ID が Pages にあり、ボードオープンが取れること（[`AGENT_PROMPT_GA4.md`](AGENT_PROMPT_GA4.md)）  
3. **ギャラリー1本** — Press B → ツール消え →（可能なら）OBS 窓、3–8 秒 GIF/MP4  
4. **文案固定** — tagline / short description / first comment（OBS · no account · no logo on grass）  
5. **日程** — 火〜木 PT 想定 · 本人が最初の数時間貼れる日  
6. FAQ 増補は **実ユーザーの詰まり** を見てから

やらない（Launch 文に書かない）: 有料予告 · 競合表 · 「つてのお願い」営業を前提にした設計

---

## 3. 未着手のキット欄（あとで埋める）

```
Tagline (60 chars):
—

Short description (260 chars):
—

First comment (maker):
—

Topics:
—

Gallery:
- [ ] Hero GIF/MP4 (Press B)
- [ ] Still: board in broadcast
- [ ] Thumbnail / logo (lockup-og.png 可)

Launch window (PT):
—
```

---

## 4. 関連

- LP: [`LP_STRUCTURE.md`](LP_STRUCTURE.md) · [`COMPETITIVE_LP.md`](COMPETITIVE_LP.md)  
- ブランド / OGP: [`STUDIO.md`](STUDIO.md)  
- OBS: [`OBS.md`](OBS.md) · Guide: https://zoneboard.app/guide/#show  
