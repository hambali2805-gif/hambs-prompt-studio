// ==================== ANTI-REPETITION SYSTEM ====================
// Tracks used visual phrases and prevents reuse more than 2 times

const usedPhrases = new Map(); // phrase -> count
const MAX_REUSE = 2;

export function resetPhraseTracker() {
    usedPhrases.clear();
}

export function trackPhrase(phrase) {
    const normalized = phrase.toLowerCase().trim();
    const count = (usedPhrases.get(normalized) || 0) + 1;
    usedPhrases.set(normalized, count);
}

export function isPhraseOverused(phrase) {
    const normalized = phrase.toLowerCase().trim();
    return (usedPhrases.get(normalized) || 0) >= MAX_REUSE;
}

export function deduplicatePrompt(prompt) {
    const keywords = extractKeyPhrases(prompt);
    let result = prompt;
    for (const kw of keywords) {
        if (isPhraseOverused(kw)) {
            const alt = getAlternativePhrase(kw);
            if (alt !== kw) {
                result = result.replace(kw, alt);
            }
        }
        trackPhrase(kw);
    }
    return result;
}

function extractKeyPhrases(text) {
    const actionPhrases = text.match(
        /(?:holding|looking|smiling|reaching|opening|pouring|sipping|showing|applying|pointing|grabbing|unboxing|touching|interacting)[^,.;]*/gi
    ) || [];
    const cameraPhrases = text.match(
        /(?:close-up|wide shot|medium shot|dolly|pan|tilt|tracking|orbital|crane|slider|handheld|POV|macro)[^,.;]*/gi
    ) || [];
    return [...actionPhrases, ...cameraPhrases].map(p => p.trim());
}

// Replace overused visual descriptions with alternatives
const VISUAL_ALTERNATIVES = {
    'holding product': [
        'cradling product gently',
        'presenting product at eye level',
        'product resting in open palm',
        'balancing product between fingers'
    ],
    'looking at camera': [
        'glancing toward lens with a subtle smile',
        'direct gaze into camera, confident',
        'eyes meeting the viewer naturally',
        'candid look caught mid-moment'
    ],
    'close-up': [
        'tight framing',
        'intimate detail shot',
        'pulled-in composition',
        'compressed focal plane'
    ],
    'slow motion': [
        'reduced frame tempo',
        'stretched temporal capture',
        'time-dilated sequence',
        'overcranked footage'
    ]
};

export function getAlternativePhrase(phrase) {
    const normalized = phrase.toLowerCase().trim();
    for (const [key, alts] of Object.entries(VISUAL_ALTERNATIVES)) {
        if (normalized.includes(key)) {
            const count = usedPhrases.get(normalized) || 0;
            return alts[count % alts.length];
        }
    }
    return phrase;
}
