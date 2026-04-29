import { ADS_PROFILE } from './adsProfiles.js';

export function buildAdsVoiceRules(lang = 'ID') {
    return lang === 'EN'
        ? `ADS VO: polished brand narrator, specific benefit and emotional payoff. No slang, no fake urgency, no unsupported social proof.`
        : `ADS VO: narator brand yang rapi, benefit spesifik, payoff emosional. Jangan slang, fake urgency, atau social proof palsu.`;
}

export function brandAdsFallback(product, phase) {
    switch (phase) {
        case 'hook': return 'Ada momen sederhana yang terasa lebih berarti saat detailnya tepat.';
        case 'emotional': return `Di momen seperti itu, ${product} hadir dengan rasa yang familiar dan mudah dikenali.`;
        case 'brand_story': return `${product} membawa pengalaman yang dekat dengan keseharian, lewat detail yang terasa nyata.`;
        case 'product_reveal': return `${product} menjadi pusat momen, jelas terlihat tanpa perlu dibuat berlebihan.`;
        case 'feature_1': return 'Detail produknya terlihat dari tekstur, aroma, dan cara ia digunakan langsung.';
        case 'feature_2': return 'Setiap elemen mendukung pengalaman yang praktis, hangat, dan mudah dinikmati.';
        case 'demonstration': return 'Buktinya terlihat saat produk digunakan dalam situasi nyata.';
        case 'benefit': return 'Hasil akhirnya adalah momen yang lebih praktis, familiar, dan terasa nyaman.';
        case 'social_proof': return 'Kedekatannya dengan momen sehari-hari membuat produk ini mudah diingat.';
        case 'cta': return `Temukan kembali momen sederhana bersama ${product}.`;
        default: return `${product} hadir dengan detail yang relevan untuk kebutuhan sehari-hari.`;
    }
}

export { ADS_PROFILE };
