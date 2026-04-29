# HAMBS V5 Clean Engine Notes

Update ini mengganti jalur generator lama dengan arsitektur baru yang dipisah per mode dan platform.

## Yang berubah

- `js/app.js` sekarang hanya menjadi controller UI + orchestrator.
- Generator utama ada di `js/engine/`:
  - `buildContext.js`: membaca UI, kategori, produk, mode, platform, referensi, background.
  - `buildGeminiPrompt.js`: membuat instruksi terstruktur untuk Gemini.
  - `routeContent.js`: membaca JSON Gemini dan fallback deterministic kalau Gemini gagal/JSON rusak.
  - `buildOutput.js`: membuat VO, image prompt, video prompt, structured JSON.
- Intelligence kategori & product type ada di `js/intelligence/`.
- Image platform dipisah di `js/platforms/image/bananaPro` dan `js/platforms/image/gptImage`.
- Video platform dipisah di `js/platforms/video/veo` dan `js/platforms/video/seedance`.
- File engine lama sudah dikeluarkan dari jalur aktif/dihapus dari paket V5 agar tidak bentrok.

## Kenapa ini lebih aman

- UGC dan Ads tidak memakai builder yang sama.
- Banana Pro, GPT Image, Veo, dan Seedance punya prompt builder masing-masing.
- Product type detector mencegah kasus sepatu dianggap fashion generik, makanan dianggap lifestyle generik, dan seterusnya.
- Fallback tetap jalan jika respons Gemini bukan JSON valid.

## Catatan test

Setelah upload ke GitHub, test minimal:

1. Fashion + Sepatu Lari + UGC + Testing/Demo + Seedance.
2. Fashion + Baju/Jaket + Ads + Cinematic + Veo.
3. Makanan + Indomie + UGC + POV.
4. Skincare + Serum + UGC + GRWM.
5. Elektronik + Earbuds + Ads + GPT Image + Seedance.

Periksa apakah prompt sudah menyebut detail produk yang benar, bukan hanya visual generik.
