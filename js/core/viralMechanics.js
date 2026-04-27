// ==================== VIRAL MECHANICS ====================
// Inject pattern interrupts, curiosity gaps, bold statements

import { engineConfig, ENERGY_LEVELS } from '../config.js';

const PATTERN_INTERRUPTS = {
    ID: [
        'STOP SCROLLING. Lo HARUS liat ini.',
        'Gue hampir gak percaya ini beneran.',
        'Ini rahasia yang gak ada yang kasih tau lo.',
        'POV: Lo baru aja nemuin holy grail lo.',
        'JANGAN BELI produk ini... sebelum lo tau ini.',
        'Gue literally nangis pas pertama kali nyobain.',
        'Tunggu sampe lo liat hasilnya...',
        'Ini bukan iklan biasa — ini pengalaman gue beneran.'
    ],
    EN: [
        'STOP SCROLLING. You NEED to see this.',
        'I almost didn\'t believe this was real.',
        'This is the secret nobody tells you.',
        'POV: You just found your holy grail.',
        'DON\'T BUY this product... before you know this.',
        'I literally cried the first time I tried this.',
        'Wait until you see the results...',
        'This isn\'t just an ad — this is my real experience.'
    ]
};

const CURIOSITY_GAPS = {
    ID: [
        'Dan yang terjadi selanjutnya bikin gue shocked...',
        'Tapi ada satu hal yang bikin ini beda dari yang lain...',
        'Lo gak bakal nyangka bagian terbaiknya...',
        'Dan ini yang bikin gue repeat order terus...',
        'Pas gue buka, gue langsung...',
        'Rahasianya ada di...'
    ],
    EN: [
        'And what happened next literally shocked me...',
        'But there\'s one thing that makes this different from everything else...',
        'You won\'t believe the best part...',
        'And this is why I keep coming back...',
        'When I opened it, I immediately...',
        'The secret is in...'
    ]
};

const BOLD_STATEMENTS = {
    ID: [
        'Ini produk terbaik yang pernah gue coba. Period.',
        'Kalau lo cuma beli satu produk tahun ini, beli ini.',
        'Gue udah coba 50+ produk sejenis, ini JUARA.',
        'Mau tau kenapa ini viral? Karena emang sebagus itu.',
        'Ini bukan hype — ini FAKTA.',
        'Gak ada yang bisa ngalahin ini. Titik.'
    ],
    EN: [
        'This is the best product I\'ve ever tried. Period.',
        'If you only buy one product this year, make it this one.',
        'I\'ve tried 50+ similar products. This one WINS.',
        'Wanna know why this went viral? Because it\'s THAT good.',
        'This isn\'t hype — it\'s a FACT.',
        'Nothing beats this. Period.'
    ]
};

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function getViralHookDirective(lang) {
    const l = lang === 'EN' ? 'EN' : 'ID';
    const energy = ENERGY_LEVELS[engineConfig.energy] || ENERGY_LEVELS.medium;

    return {
        patternInterrupt: pickRandom(PATTERN_INTERRUPTS[l]),
        curiosityGap: pickRandom(CURIOSITY_GAPS[l]),
        boldStatement: pickRandom(BOLD_STATEMENTS[l]),
        energyPacing: energy.pacing,
        instruction: `VIRAL MECHANICS (first 3 seconds):
1. PATTERN INTERRUPT: Start with something that breaks the scroll pattern
2. CURIOSITY GAP: Create an information gap that makes them NEED to keep watching
3. BOLD/UNEXPECTED STATEMENT: Say something no one expects
Energy level: ${engineConfig.energy} — ${energy.pacing}`
    };
}

export function injectViralElement(scenePrompt, sceneIndex, lang) {
    if (sceneIndex > 0) return scenePrompt;

    const l = lang === 'EN' ? 'EN' : 'ID';
    const interrupt = pickRandom(PATTERN_INTERRUPTS[l]);
    return `[VIRAL HOOK — Pattern Interrupt in first 3 seconds] ${interrupt}\n${scenePrompt}`;
}
