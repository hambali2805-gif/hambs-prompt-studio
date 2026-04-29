# HAMBS Prompt Studio V4 — Mode + Platform Split

## Tujuan
V4 memisahkan logic UGC, Ads, Image, dan Video supaya style tidak saling bentrok.

## Struktur utama

```txt
js/modes/
  ugc/                  # aturan khusus UGC: human creator, soft CTA, natural phone realism
  ads/                  # aturan khusus Ads: brand campaign, polished, clear benefit

js/platforms/image/
  bananaPro/            # prompt image Banana Pro
  gptImage/             # prompt image GPT Image

js/platforms/video/
  veo/                  # prompt video Veo
  seedance/             # prompt video Seedance

js/shared/
  referenceHandler.js   # kontrol karakter & produk upload
  safetyRules.js        # cegah fake claim / scarcity palsu
```

## Alur baru
1. User pilih mode: UGC atau IKLAN.
2. `js/modes/index.js` meneruskan ke engine khusus mode.
3. User pilih image platform: Banana Pro atau GPT Image.
4. `js/platforms/image/index.js` meneruskan prompt ke folder image masing-masing.
5. User pilih video platform: Veo atau Seedance.
6. `js/platforms/video/index.js` meneruskan prompt ke folder video masing-masing.
7. `referenceHandler.js` memastikan karakter dan produk upload dipakai konsisten.

## Catatan penting
- File root `app.js` tidak dibuat lagi. App utama tetap `js/app.js`.
- GPT Image di sini adalah pilihan template prompt image, bukan koneksi API OpenAI langsung.
- Gemini tetap dipakai sebagai generator teks/prompt sesuai API key Gemini yang sudah ada di tool.
