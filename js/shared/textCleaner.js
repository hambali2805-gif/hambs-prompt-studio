// ==================== TEXT CLEANER ====================

export function normalizePromptText(text) {
    return String(text || '')
        .replace(/\s+([,.!?;:])/g, '$1')
        .replace(/([,.!?]){2,}/g, '$1')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

export function joinPromptParts(parts) {
    return normalizePromptText(parts.filter(Boolean).join(' '));
}
