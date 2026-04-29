import { UGC_PROFILE } from './ugcProfiles.js';

export function buildUGCVoiceRules(lang = 'ID') {
    return lang === 'EN'
        ? `UGC VO: speak like a real creator telling a small honest moment. Soft CTA only. No fake urgency, no generic hype.`
        : `UGC VO: bicara seperti creator nyata yang cerita momen kecil. CTA soft saja. Jangan fake urgency, jangan hype kosong.`;
}

export function humanUGCFallback(product, phase) {
    switch (phase) {
        case 'hook': return 'Jam segini tuh, kadang yang dicari cuma sesuatu yang simpel.';
        case 'problem': return 'Yang bikin males itu bukan laparnya, tapi ribetnya duluan kebayang.';
        case 'story': return `Akhirnya ambil ${product}, dan momennya langsung terasa lebih santai.`;
        case 'discovery': return 'Pas dicoba langsung ada detail kecil yang bikin berhenti sebentar.';
        case 'proof': return 'Kelihatan dari cara produknya dipakai, bukan cuma dari kata-kata.';
        case 'cta': return `Kalau lagi butuh yang simpel, ${product} bisa disimpan buat momen kayak gini.`;
        default: return `${product} masuk akal karena kepakai di momen nyata, bukan cuma terlihat bagus.`;
    }
}

export { UGC_PROFILE };
