export function validateVeoPrompt(prompt, mode) {
    const warnings = [];
    const p = String(prompt || '').toLowerCase();
    if (!/camera|lighting|video|motion|movement/.test(p)) warnings.push('Veo prompt may be too still-image-like.');
    if (/--motion|--cfg|--upscale/.test(p)) warnings.push('Veo prompt contains Seedance parameters.');
    if (mode === 'ugc' && /overacting|flawless studio/.test(p)) warnings.push('UGC Veo prompt may be too polished.');
    return { valid: warnings.length === 0, warnings };
}
