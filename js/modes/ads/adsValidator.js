import { ADS_PROFILE } from './adsProfiles.js';

export function validateAdsContent({ voiceover = '', scenes = [] } = {}) {
    const text = `${voiceover} ${scenes.map(s => `${s.vo || ''} ${s.description || ''}`).join(' ')}`.toLowerCase();
    const warnings = [];
    for (const phrase of ADS_PROFILE.forbidden) {
        if (text.includes(phrase.toLowerCase())) warnings.push(`Ads forbidden phrase/style detected: ${phrase}`);
    }
    if (/gue|\blo\b|bestie|gak boong|worth it parah/i.test(text)) {
        warnings.push('Ads sounds too much like UGC slang.');
    }
    return { valid: warnings.length === 0, warnings };
}
