import { joinPromptParts } from '../../../shared/textCleaner.js';

export function buildModeImageStyle(mode, platform) {
    const isUGC = mode === 'ugc';
    if (platform === 'gpt_image') {
        return isUGC
            ? 'natural phone-photo realism, relatable human moment, casual imperfect framing, everyday environment, no studio polish'
            : 'premium commercial image, polished composition, controlled cinematic lighting, strong product clarity, brand-safe visual direction';
    }
    return isUGC
        ? 'direct still-image prompt, phone camera quality, natural light, casual framing, believable everyday scene'
        : 'direct still-image prompt, clean commercial product photography, premium lighting, sharp hero composition';
}

export function stripVideoOnlyTerms(text) {
    return String(text || '')
        .replace(/\b(24fps|30fps|60fps|120fps|fps|temporal consistency|camera movement|dolly|pan|tilt|orbit|rack focus|slow motion|motion dynamics|--motion\s*\d+|--cfg\s*\d+|--fps\s*\d+|--upscale\s*\d+)\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

export function buildImagePromptBase(parts) {
    return joinPromptParts(parts);
}
