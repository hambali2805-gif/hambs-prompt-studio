export function validateGPTImagePrompt(prompt, mode) {
    const warnings = [];
    const p = String(prompt || '').toLowerCase();
    if (/fps|--motion|--cfg|--upscale/.test(p)) warnings.push('GPT Image prompt contains video parameters.');
    if (!/single still image|still image|image/.test(p)) warnings.push('GPT Image prompt should explicitly request a still image.');
    if (mode === 'ugc' && /commercial campaign|studio hero|luxury product photography/.test(p)) warnings.push('UGC GPT Image prompt may be too ad-like.');
    if (mode === 'ads' && /phone-photo|messy handheld|awkward framing/.test(p)) warnings.push('Ads GPT Image prompt may be too UGC-like.');
    return { valid: warnings.length === 0, warnings };
}
