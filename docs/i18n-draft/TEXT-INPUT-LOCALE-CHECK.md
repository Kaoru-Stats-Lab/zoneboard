# Canvas text input — locale UTF-8 check

**Date:** 2026-09-01
**URL:** http://localhost:5173/board?lang=…
**Runner:** Puppeteer (Chrome DevTools Protocol) · `npm run test:text-input-locale`

## Conclusion

**文字化けなし（9/9 PASS）。** テキストツール（`T` → キャンバスクリック → 入力 → 確定）で、各ロケールの代表文字（ラテン拡張 · CJK · TR · PL）が textarea と `localStorage` の `object.text` まで一致。UI ラベル（例: de `Auswärts` · `Rückgängig`）も UTF-8 正常表示。

再実行: `npm run dev` 起動中に `npm run test:text-input-locale`

## Summary

| Locale | Pass | Input UTF-8 | Persist | Tool label | Placeholder (hint) |
| --- | --- | --- | --- | --- | --- |
| en | ✅ | ✅ | ✅ | Text | High press |
| ja | ✅ | ✅ | ✅ | テキスト | ラベルを入力… |
| es | ✅ | ✅ | ✅ | Texto | Presión alta |
| pt | ✅ | ✅ | ✅ | Texto | Pressão alta |
| pl | ✅ | ✅ | ✅ | Tekst | Wysoki pressing |
| de | ✅ | ✅ | ✅ | Text | Hohes Pressing |
| fr | ✅ | ✅ | ✅ | Texte | Bloc haut |
| tr | ✅ | ✅ | ✅ | Metin | Ön alan baskısı |
| it | ✅ | ✅ | ✅ | Testo | Pressing alto |

**Overall:** PASS

## Detail

### en

- **Input sample:** `High press · Müller 09`
- **Textarea after type:** `High press · Müller 09`
- **Input UTF-8 OK:** yes
- **Stored object.text:** `High press · Müller 09`
- **Persist round-trip:** yes

### ja

- **Input sample:** `ハイプレス · 天皇杯 · 漢字仮名`
- **Textarea after type:** `ハイプレス · 天皇杯 · 漢字仮名`
- **Input UTF-8 OK:** yes
- **Stored object.text:** `ハイプレス · 天皇杯 · 漢字仮名`
- **Persist round-trip:** yes

### es

- **Input sample:** `Presión alta · Niño · campeón`
- **Textarea after type:** `Presión alta · Niño · campeón`
- **Input UTF-8 OK:** yes
- **Stored object.text:** `Presión alta · Niño · campeón`
- **Persist round-trip:** yes

### pt

- **Input sample:** `Pressão alta · São Paulo · coração`
- **Textarea after type:** `Pressão alta · São Paulo · coração`
- **Input UTF-8 OK:** yes
- **Stored object.text:** `Pressão alta · São Paulo · coração`
- **Persist round-trip:** yes

### pl

- **Input sample:** `Wysoki pressing · Łódź · ąęćłńóśźż`
- **Textarea after type:** `Wysoki pressing · Łódź · ąęćłńóśźż`
- **Input UTF-8 OK:** yes
- **Stored object.text:** `Wysoki pressing · Łódź · ąęćłńóśźż`
- **Persist round-trip:** yes

### de

- **Input sample:** `Hohes Pressing · Auswärts · Straße`
- **Textarea after type:** `Hohes Pressing · Auswärts · Straße`
- **Input UTF-8 OK:** yes
- **Stored object.text:** `Hohes Pressing · Auswärts · Straße`
- **Persist round-trip:** yes

### fr

- **Input sample:** `Bloc haut · équipe · François ç`
- **Textarea after type:** `Bloc haut · équipe · François ç`
- **Input UTF-8 OK:** yes
- **Stored object.text:** `Bloc haut · équipe · François ç`
- **Persist round-trip:** yes

### tr

- **Input sample:** `Ön alan baskısı · İstanbul · şüphe`
- **Textarea after type:** `Ön alan baskısı · İstanbul · şüphe`
- **Input UTF-8 OK:** yes
- **Stored object.text:** `Ön alan baskısı · İstanbul · şüphe`
- **Persist round-trip:** yes

### it

- **Input sample:** `Pressing alto · Passaggio · corsa`
- **Textarea after type:** `Pressing alto · Passaggio · corsa`
- **Input UTF-8 OK:** yes
- **Stored object.text:** `Pressing alto · Passaggio · corsa`
- **Persist round-trip:** yes
