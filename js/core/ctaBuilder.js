// ==================== STRONG CTA BUILDER ====================
// Final scene must include: urgency, emotional trigger, clear action

import { engineConfig, PERSONAS } from '../config.js';

const URGENCY_PHRASES = {
    ID: [
        'Cek detail produknya saat momennya relevan.',
        'Simpan dulu supaya mudah ditemukan lagi.',
        'Pilih saat sesuai dengan kebutuhan harian Anda.',
        'Lihat detailnya sebelum menentukan pilihan.'
    ],
    EN: [
        'Small details can make an everyday moment feel better.',
        'Choose what fits your everyday need.',
        'Make room for a simple moment that feels more comfortable.',
        'When the moment is right, this product is easy to remember.'
    ]
};

const EMOTIONAL_TRIGGERS = {
    ID: [
        
        'Detail kecil bisa membuat momen terasa lebih baik.',
        'Pilih produk yang sesuai dengan kebutuhan harian.',
        'Beri ruang untuk momen sederhana yang lebih nyaman.',
        'Saat momennya tepat, produk ini mudah diingat.'

    ],
    EN: [
        'You deserve the best.',
        'Because you\'re worth it.',
        'Don\'t settle for less.',
        'You owe this to yourself.',
        'This is a game changer — for real.',
        'Life\'s too short to hesitate.'
    ]
};

const CLEAR_ACTIONS = {
    ID: [
        'Klik link di bio sekarang!',
        'Add to cart sekarang juga!',
        'Langsung order via link di bio!',
        'Tap link — beli sekarang!',
        'Save dulu, biar gak lupa!'
    ],
    EN: [
        'Click the link in bio now!',
        'Add to cart right now!',
        'Order directly via the link in bio!',
        'Tap the link — buy now!',
        'Save this so you don\'t forget!'
    ]
};

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function buildCTADirective(lang) {
    const l = lang === 'EN' ? 'EN' : 'ID';
    const persona = PERSONAS[engineConfig.persona] || PERSONAS.best_friend;

    if (engineConfig.mode === 'ugc') {
        return {
            urgency: '',
            emotional: '',
            action: l === 'EN' ? 'Try it in a real everyday moment.' : 'Coba pas momennya lagi cocok.',
            voiceStyle: persona.voiceStyle,
            instruction: `CTA UGC: harus terasa natural seperti rekomendasi teman, bukan hard sell.
- Jangan pakai scarcity palsu seperti stok terbatas, flash sale, checkout sebelum kehabisan.
- Boleh ada ajakan ringan: coba, save, atau inget produk ini pas situasinya relevan.
- Maksimal 1 kalimat, tetap manusiawi.
Persona: ${persona.label} — ${persona.voiceStyle}`
        };
    }

    return {
        urgency: pickRandom(URGENCY_PHRASES[l]),
        emotional: pickRandom(EMOTIONAL_TRIGGERS[l]),
        action: pickRandom(CLEAR_ACTIONS[l]),
        voiceStyle: persona.voiceStyle,
        instruction: `CTA IKLAN: beri alasan aksi yang jelas, tapi tetap relevan dengan produk dan situasi.
- Hindari klaim stok/promo palsu kalau tidak ada input dari user.
- Gunakan CTA spesifik: coba, beli, save, atau cek link sesuai konteks.
Persona: ${persona.label} — ${persona.voiceStyle}`
    };
}

export function enforceCTA(voText, lang) {
    const l = lang === 'EN' ? 'EN' : 'ID';

    if (engineConfig.mode === 'ugc') {
        const hasSoftAction = /coba|save|simpan|ingat|cek|try|remember|keep|link|bio/i.test(voText);
        if (hasSoftAction) return voText;
        return voText + (l === 'EN'
            ? ' Try it when the moment feels right.'
            : ' Coba pas lagi butuh yang simpel dan comforting.');
    }

    const hasAction = /link|bio|klik|click|beli|buy|checkout|order|add to cart|tap|save|coba|try/i.test(voText);
    let enhanced = voText;
    if (!hasAction) enhanced += ' ' + (l === 'EN' ? 'Check it out when you need it.' : 'Cek produknya kalau momennya lagi cocok.');
    return enhanced;
}
