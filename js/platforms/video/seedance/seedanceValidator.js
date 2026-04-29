export function validateSeedancePrompt(prompt, mode) {
    const warnings = [];
    const p = String(prompt || '').toLowerCase();
    if (!/hand|hands|motion|movement|interaction|body|physics/.test(p)) warnings.push('Seedance prompt should emphasize motion/body/product interaction.');
    if (!/--motion/.test(p)) warnings.push('Seedance parameters missing.');
    if (mode === 'ads' && /messy handheld chaos/.test(p)) warnings.push('Ads Seedance prompt may be too chaotic.');
    return { valid: warnings.length === 0, warnings };
}
