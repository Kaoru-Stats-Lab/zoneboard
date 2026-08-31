# Grok LP レビュー — pl（en 正本 · 2026-08-31）

**対象:** `messages-lp.pl.json`（en `lp*` から直接 pl 化）  
**判定:** **出荷可**

---

## 5 秒テスト
### Michał（ワルシャワ）
H1とpayoffを声に出して読んだ瞬間の心の声：「Dodaj planszę taktyczną do dzisiejszej transmisji w OBS. Ukryj narzędzia. Przechwytuj tylko boisko. Kamera i czat zostają w OBS.」  
要約：今夜のOBS配信に戦術ボードを足し、ツールを消してフィールドだけをキャプチャする道具だと即座に理解した。en原文の意図がはっきり伝わる。

### Kasia（クラクフ）
H1とpayoffを声に出して読んだ瞬間の心の声：「Dodaj planszę do transmisji w OBS. Ukryj narzędzia. Tylko boisko. Kamera i czat zostają w OBS.」  
要約：ウォッチアロング用にフィールドをOBSに追加するツールだと分かった。準備感より「今夜の配信」に寄っており、自分ごとに感じやすい。

### Tomek（グダニスク）
H1とpayoffを声に出して読んだ瞬間の心の声：「Dodaj planszę taktyczną do transmisji w OBS. Ukryj narzędzia. Przechwytuj tylko boisko.」  
要約：戦術解説・実況向けのplanszaで、OBSに足してツールを消す使い方が明確に伝わる。enの意味が失われていない。

## スコア表
| 軸 | Michał | Kasia | Tomek |
| --- | --- | --- | --- |
| Cool / ブランド | 8 | 8 | 8 |
| 自分ごと化 | 9 | 8 | 9 |
| 信頼 | 9 | 9 | 9 |
| サッカー語 | 8 | 8 | 9 |
| 配信用語 | 9 | 9 | 9 |
| CTA | 8 | 8 | 8 |
| pl 自然さ | 9 | 9 | 9 |

## en vs pl
en原文の意味はほぼ失われていない。Cool 寄せ案（`Twoja transmisja. Boisko na pełnym ekranie.`）は **任意 · en 逸脱** — 採用しなかった。

## plansza の連想
3人共通で**サッカー寄り〜中立**。教室連想なし。**tablica** より **plansza** が自然。

## CMO 判定（Grok）

**出荷可**

任意修正 top 2 → **反映済み**（lpHeroCaption は現状維持）

---

## 反映済み修正（2026-08-31）

| キー | 初稿 | 反映後 |
|------|------|--------|
| `lpCloseCta` | …bez konta | **Otwórz planszę — bez konta · gotowe do OBS** |
| `lpCanTitle` | …transmisji i watchalongów | **Stworzone dla transmisji na żywo i watchalongów.** |
| `lpCan1` | …na murawie | **Umieść herb swojego klubu na boisku.**（boisko 統一） |
| `tagline`（App） | Tablica taktyczna | **Plansza taktyczna**（tablica 教室連想回避） |

Cool H1 案（`Twoja transmisja. Boisko na pełnym ekranie.`）は **不採用** — pl は en 正本維持。
