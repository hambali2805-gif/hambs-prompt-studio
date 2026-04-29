import { UGC_PROFILE } from './ugcProfiles.js';

export function validateUGCContent({ voiceover = '', scenes = [] } = {}) {
    const text = `${voiceover} ${scenes.map(s => `${s.vo || ''} ${s.description || ''}`).join(' ')}`.toLowerCase();
    const warnings = [];
    for (const phrase of UGC_PROFILE.forbidden) {
        if (text.includes(phrase.toLowerCase())) warnings.push(`UGC forbidden phrase/style detected: ${phrase}`);
    }
    if (/dipercaya\s+ribuan|stok\s+terbatas|checkout\s+sebelum/i.test(text)) {
        warnings.push('UGC sounds like hard-sell ecommerce instead of creator recommendation.');
    }
    return { valid: warnings.length === 0, warnings };
}
