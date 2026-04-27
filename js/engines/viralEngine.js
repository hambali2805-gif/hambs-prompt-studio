// ==================== VIRAL CONTENT ENGINE ====================
// Layered on top of Category-Aware Engine.
// Components: Hook Engine, Emotional Triggers, Structure Randomizer, Chaos/Realism Engine.
// Pipeline: Category Engine → Viral Engine → VO Engine → Final Output.

import { engineConfig } from '../config.js';
import { CATEGORY_RULES } from '../categoryRules.js';

// ==================== HOOK ENGINE ====================
// Category-specific scroll-stopping hooks for the first scene.

const HOOKS = {
    MAKANAN: [
        'Gue kira ini biasa aja...',
        'Ini kenapa gak ada yang ngomong ya?',
        'Gue nyesel baru coba ini...',
        'Lo pasti gak nyangka ini seenak itu...',
        'Bau masakannya aja udah bikin laper...',
        'Ini sih bukan makanan, ini pengalaman...',
        'Pertama kali gigit, langsung diem...',
        'Selama ini gue salah masak ternyata...'
    ],
    MINUMAN: [
        'Gue kira ini gak bakal ngaruh...',
        'Pas lagi panas gini, ini beda sih...',
        'Ini sih langsung kerasa...',
        'Satu teguk dan gue langsung melek...',
        'Kenapa baru sekarang gue tau ini...',
        'Ini minuman apa obat sih? Langsung seger...',
        'Cuaca panas + ini = hidup lagi...',
        'Gue udah coba banyak, tapi ini juara...'
    ],
    SKINCARE: [
        'Kulit gue berubah drastis gara-gara ini...',
        'Gue hampir nyerah sama skincare...',
        'Ini rahasia kulit glowing yang gak mahal...',
        'Seminggu pakai ini, orang langsung nanya...',
        'Gue skeptis banget awalnya...',
        'Baru oles udah kerasa beda...',
        'Ini bukan skincare biasa sih...',
        'Jerawat gue hilang gara-gara ini...'
    ],
    FASHION: [
        'Outfit ini bikin gue ditanya terus...',
        'Gue gak nyangka harganya segini...',
        'Ini sih bikin percaya diri naik 100%...',
        'Style ini lagi viral banget dan gue paham kenapa...',
        'Satu baju ini bisa dipake buat 5 look...',
        'Gue awalnya ragu, tapi pas dipake...',
        'Ini definisi looks expensive tapi affordable...',
        'Orang pada nanya gue beli dimana...'
    ],
    ELEKTRONIK: [
        'Gue gak nyangka gadget segini bisa secanggih ini...',
        'Ini sih game changer buat daily life...',
        'Unboxing ini bikin gue speechless...',
        'Fitur ini harusnya udah ada dari dulu...',
        'Worth it gak sih? Spoiler: BANGET...',
        'Ini teknologi masa depan sih...',
        'Review jujur setelah seminggu pakai...',
        'Gue udah coba banyak gadget, ini beda...'
    ]
};

// ==================== EMOTIONAL TRIGGER ENGINE ====================
// One emotional layer injected per content generation.

const EMOTIONS = {
    MAKANAN: ['nostalgia', 'comfort', 'satisfaction', 'surprise', 'craving', 'warmth'],
    MINUMAN: ['refreshment', 'relief', 'energy boost', 'coolness', 'revival', 'thirst quench'],
    SKINCARE: ['confidence', 'self-care', 'transformation', 'hope', 'glow-up', 'empowerment'],
    FASHION: ['confidence', 'self-expression', 'admiration', 'trendsetting', 'empowerment', 'style discovery'],
    ELEKTRONIK: ['excitement', 'amazement', 'productivity boost', 'future-ready', 'wow factor', 'smart living']
};

const EMOTION_DESCRIPTIONS = {
    nostalgia: 'Evoke childhood memories and familiar warmth',
    comfort: 'Create a sense of home, safety, and contentment',
    satisfaction: 'Build toward a deeply satisfying payoff moment',
    surprise: 'Set up expectation then deliver an unexpected twist',
    craving: 'Make the viewer physically crave the experience',
    warmth: 'Wrap the content in cozy, heartfelt energy',
    refreshment: 'Convey instant cooling relief and rejuvenation',
    relief: 'Show the transition from discomfort to blissful relief',
    'energy boost': 'Capture the surge of energy and alertness',
    coolness: 'Emphasize the chill factor and refreshing sensation',
    revival: 'Show coming back to life after feeling drained',
    'thirst quench': 'Build thirst tension then release with satisfaction',
    confidence: 'Radiate self-assurance and empowered energy',
    'self-care': 'Frame as an act of loving yourself',
    transformation: 'Show the before-to-after journey dramatically',
    hope: 'Inspire belief that change is possible',
    'glow-up': 'Celebrate visible improvement and radiance',
    empowerment: 'Make the viewer feel they can achieve this too',
    'self-expression': 'Celebrate individuality and personal style',
    admiration: 'Create a moment others would envy',
    trendsetting: 'Position as ahead of the curve',
    'style discovery': 'Frame as finding your signature look',
    excitement: 'Build hype and anticipation energy',
    amazement: 'Create genuine wow moments',
    'productivity boost': 'Show tangible life improvement through tech',
    'future-ready': 'Position as cutting-edge and forward-thinking',
    'wow factor': 'Deliver jaw-dropping visual moments',
    'smart living': 'Frame as the intelligent lifestyle choice'
};

// ==================== STRUCTURE RANDOMIZER ====================
// Avoid repetitive flow by randomly selecting content structure.

const STRUCTURES = {
    ugc: [
        ['hook', 'problem', 'solution', 'proof', 'cta'],
        ['hook', 'reaction', 'explain', 'proof', 'cta'],
        ['hook', 'compare', 'reaction', 'explain', 'cta'],
        ['hook', 'story', 'discovery', 'proof', 'cta'],
        ['hook', 'question', 'reveal', 'reaction', 'cta']
    ],
    ads: [
        ['hook', 'brand_story', 'product_reveal', 'feature_1', 'feature_2', 'benefit', 'social_proof', 'demonstration', 'emotional', 'cta'],
        ['hook', 'problem', 'product_reveal', 'feature_1', 'demonstration', 'benefit', 'feature_2', 'social_proof', 'emotional', 'cta'],
        ['hook', 'emotional', 'brand_story', 'product_reveal', 'feature_1', 'feature_2', 'demonstration', 'benefit', 'social_proof', 'cta']
    ]
};

const STRUCTURE_LABELS = {
    hook: 'HOOK — Scroll Stopper',
    problem: 'PROBLEM — Pain Point',
    solution: 'SOLUTION — The Answer',
    proof: 'PROOF — Real Evidence',
    cta: 'CTA — Take Action Now',
    reaction: 'REACTION — Genuine Response',
    explain: 'EXPLAIN — Break It Down',
    compare: 'COMPARE — Before vs After',
    story: 'STORY — Personal Journey',
    discovery: 'DISCOVERY — The Find',
    question: 'QUESTION — Make Them Think',
    reveal: 'REVEAL — The Big Moment',
    brand_story: 'BRAND STORY — Identity',
    product_reveal: 'PRODUCT REVEAL — Hero Moment',
    feature_1: 'FEATURE 1 — Key Detail',
    feature_2: 'FEATURE 2 — Secondary Detail',
    benefit: 'KEY BENEFITS — Why It Matters',
    social_proof: 'SOCIAL PROOF — Trust Builder',
    demonstration: 'DEMONSTRATION — In Action',
    emotional: 'EMOTIONAL — Feel The Impact'
};

// ==================== CHAOS / REALISM ENGINE ====================
// Inject imperfections for UGC mode to create authentic feel.

const IMPERFECTIONS = [
    'slight camera shake from handheld grip',
    'focus hunting moment before locking on subject',
    'overexposed lighting spike from window glare',
    'awkward pause before speaking',
    'hand partially blocking frame momentarily',
    'mic picks up ambient background noise',
    'subject briefly looks away from camera',
    'slight lens smudge visible in corner',
    'auto-white-balance shift mid-shot',
    'natural hair or clothing adjustment mid-take',
    'phone notification sound in background',
    'visible breathing movement in close-up',
    'slight audio pop on plosive sounds',
    'background person walking through frame edge'
];

// ==================== UTILITY ====================

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultipleRandom(arr, count) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ==================== PUBLIC API ====================

/**
 * Generate a category-specific hook for the first scene.
 * Hook MUST be used as the first scene VO.
 */
export function generateHook(category) {
    const categoryHooks = HOOKS[category];
    if (!categoryHooks) {
        const allHooks = Object.values(HOOKS).flat();
        return pickRandom(allHooks);
    }
    return pickRandom(categoryHooks);
}

/**
 * Get all available hooks for a category (for prompt injection).
 */
export function getHookPool(category) {
    return HOOKS[category] || Object.values(HOOKS).flat();
}

/**
 * Select one emotional trigger for the content.
 * Returns { emotion, description } for injection into prompts.
 */
export function selectEmotionalTrigger(category) {
    const pool = EMOTIONS[category] || ['excitement', 'satisfaction', 'surprise'];
    const emotion = pickRandom(pool);
    return {
        emotion,
        description: EMOTION_DESCRIPTIONS[emotion] || emotion
    };
}

/**
 * Get a randomized content structure.
 * Returns array of phase names and their labels.
 */
export function getRandomStructure(mode) {
    const pool = STRUCTURES[mode] || STRUCTURES.ugc;
    const structure = pickRandom(pool);
    return structure.map(phase => ({
        phase,
        label: STRUCTURE_LABELS[phase] || phase.toUpperCase()
    }));
}

/**
 * Get imperfections for a scene in UGC mode.
 * At least one imperfection per scene.
 * @param {boolean} isUGC - Only inject imperfections for UGC mode
 * @param {number} realismLevel - 0-100, higher = more imperfections
 * @returns {string[]} Array of imperfection descriptions
 */
export function getSceneImperfections(isUGC, realismLevel) {
    if (!isUGC) return [];

    const count = realismLevel > 70 ? 3 : realismLevel > 40 ? 2 : 1;
    return pickMultipleRandom(IMPERFECTIONS, count);
}

/**
 * Apply the full viral engine layer to a generation config.
 * This is the main entry point for the viral engine.
 *
 * @param {string} category - Product category (MAKANAN, MINUMAN, etc.)
 * @param {string} mode - 'ugc' or 'ads'
 * @returns {Object} Viral engine context for prompt injection
 */
export function applyViralEngine(category, mode) {
    const isUGC = mode === 'ugc';
    const hook = generateHook(category);
    const emotionalTrigger = selectEmotionalTrigger(category);
    const structure = getRandomStructure(mode);
    const realismLevel = engineConfig.realism || 70;

    return {
        hook,
        emotionalTrigger,
        structure,
        isUGC,
        realismLevel,
        getImperfectionsForScene: () => getSceneImperfections(isUGC, realismLevel),
        viralDirective: buildViralDirective(hook, emotionalTrigger, structure, isUGC)
    };
}

/**
 * Build a viral directive string for prompt injection.
 */
function buildViralDirective(hook, emotionalTrigger, structure, isUGC) {
    const structureFlow = structure.map((s, i) => `${i + 1}. ${s.label}`).join('\n');

    return `VIRAL ENGINE ACTIVE:
HOOK (first 3 seconds): "${hook}"
EMOTIONAL DIRECTION: ${emotionalTrigger.emotion} — ${emotionalTrigger.description}
CONTENT STRUCTURE:
${structureFlow}
${isUGC ? 'CHAOS MODE: Active — inject natural imperfections for authentic feel.' : 'POLISHED MODE: Clean execution with controlled energy.'}`;
}

/**
 * Validate viral output quality.
 * Returns { valid, errors } — throws if critical issues found.
 */
export function validateViralOutput(scenes, viralContext) {
    const errors = [];

    if (!scenes || scenes.length === 0) {
        throw new Error('VIRAL VALIDATION FAILED: No scenes generated.');
    }

    // Check hook in first scene
    const firstScene = scenes[0];
    if (!firstScene.vo || firstScene.vo.trim().length < 10) {
        errors.push('No hook detected in first scene VO.');
    }

    // Check emotional trigger presence
    const allText = scenes.map(s => `${s.vo || ''} ${s.description || ''}`).join(' ').toLowerCase();
    const emotionKeyword = viralContext.emotionalTrigger.emotion.toLowerCase();
    const emotionRelatedWords = EMOTION_DESCRIPTIONS[emotionKeyword]?.toLowerCase().split(/\s+/) || [];
    const hasEmotionalContent = emotionRelatedWords.some(w => w.length > 4 && allText.includes(w));
    if (!hasEmotionalContent) {
        errors.push(`No emotional trigger (${viralContext.emotionalTrigger.emotion}) detected in content.`);
    }

    // Check scene similarity (no two scenes should have identical VO)
    const voTexts = scenes.map(s => (s.vo || '').trim().toLowerCase()).filter(v => v.length > 0);
    const uniqueVOs = new Set(voTexts);
    if (voTexts.length > 1 && uniqueVOs.size < voTexts.length * 0.7) {
        errors.push('Too many similar scenes detected — content feels repetitive.');
    }

    // Check VO quality (not too generic)
    const genericPhrases = ['produk ini bagus', 'this product is good', 'sangat recommended', 'very recommended'];
    const isGeneric = genericPhrases.some(p => allText.includes(p));
    if (isGeneric && voTexts.length > 2) {
        errors.push('VO contains overly generic phrases.');
    }

    return {
        valid: errors.length === 0,
        errors,
        message: errors.length > 0
            ? `Viral validation warnings: ${errors.join('; ')}`
            : 'Viral validation passed.'
    };
}
