export function validateBananaPrompt(prompt, mode) {
    const warnings = [];
    const p = String(prompt || '').toLowerCase();
    if (/fps|--motion|temporal consistency|dolly|pan|tilt/.test(p)) warnings.push('Banana Pro image prompt contains video-only terms.');
    if (mode === 'ugc' && /studio-grade|flawless|luxury campaign/.test(p)) warnings.push('UGC Banana prompt may be too polished.');
    if (mode === 'ads' && /messy|random clutter|awkward/.test(p)) warnings.push('Ads Banana prompt may be too casual.');
    return { valid: warnings.length === 0, warnings };
}
