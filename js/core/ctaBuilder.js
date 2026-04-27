// ==================== STRONG CTA BUILDER ====================
// Final scene must include: urgency, emotional trigger, clear action

import { engineConfig, PERSONAS } from '../config.js';

const URGENCY_PHRASES = {
    ID: [
        'Stok terbatas, jangan sampai kehabisan!',
        'Promo ini cuma hari ini!',
        'Buruan sebelum sold out!',
        'Cuma tersisa sedikit lagi!',
        'Flash sale — waktu terbatas!',
        'Besok harga naik, sekarang atau nyesel!',
        'Link di bio, tapi cepetan ya!',
        'Diskon gede-gedean cuma sampe jam 12!'
    ],
    EN: [
        'Limited stock — act now!',
        'This offer ends today!',
        'Grab yours before it sells out!',
        'Only a few left!',
        'Flash sale — limited time only!',
        'Price goes up tomorrow — don\'t miss out!',
        'Link in bio, but hurry!',
        'Massive discount ends at midnight!'
    ]
};

const EMOTIONAL_TRIGGERS = {
    ID: [
        'Lo layak dapetin yang terbaik.',
        'Karena hidup lo worth it.',
        'Jangan settle sama yang biasa aja.',
        'Lo pantas punya ini.',
        'Ini game changer, beneran.',
        'Hidup terlalu singkat buat ragu-ragu.'
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
        'Checkout sebelum kehabisan!',
        'Langsung order via link di bio!',
        'Tap link — beli sekarang!',
        'Save dulu, biar gak lupa!'
    ],
    EN: [
        'Click the link in bio now!',
        'Add to cart right now!',
        'Check out before it\'s gone!',
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

    return {
        urgency: pickRandom(URGENCY_PHRASES[l]),
        emotional: pickRandom(EMOTIONAL_TRIGGERS[l]),
        action: pickRandom(CLEAR_ACTIONS[l]),
        voiceStyle: persona.voiceStyle,
        instruction: `WAJIB: Scene CTA harus mengandung 3 elemen:
1. URGENCY: Beri tekanan waktu/stok terbatas
2. EMOTIONAL TRIGGER: Sentuh emosi personal viewer
3. CLEAR ACTION: Instruksi spesifik (klik, beli, checkout)
Persona: ${persona.label} — ${persona.voiceStyle}`
    };
}

export function enforceCTA(voText, lang) {
    const l = lang === 'EN' ? 'EN' : 'ID';
    const hasUrgency = /terbatas|habis|sold out|cuma|limited|hurry|ends|last/i.test(voText);
    const hasAction = /link|bio|klik|click|beli|buy|checkout|order|add to cart|tap|save/i.test(voText);
    const hasEmotion = /layak|worth|deserve|pantas|terbaik|best|game changer/i.test(voText);

    let enhanced = voText;
    if (!hasUrgency) enhanced += ' ' + pickRandom(URGENCY_PHRASES[l]);
    if (!hasAction) enhanced += ' ' + pickRandom(CLEAR_ACTIONS[l]);
    if (!hasEmotion) enhanced += ' ' + pickRandom(EMOTIONAL_TRIGGERS[l]);
    return enhanced;
}
