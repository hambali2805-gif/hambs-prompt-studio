// ==================== VO ENGINE ====================
// Per-scene voice-over generation with humanization and scene sync.
// Replaces global VO with individual scene VO objects.
// Each scene: { scene, vo, duration, emotion, imperfections }
//
// Pipeline: Category Engine → Viral Engine → VO Engine → Final Output.

import { engineConfig, PERSONAS, ENERGY_LEVELS } from '../config.js';
import { state } from '../state.js';
import { buildCTADirective, enforceCTA } from '../core/ctaBuilder.js';
import { getCategoryNegativeContext } from '../categoryRules.js';

// ==================== SPEECH PATTERNS (VO HUMANIZER) ====================
// Natural fillers and speech patterns for conversational feel.

const SPEECH_PATTERNS = {
    ID: {
        fillers: [
            'eh bentar...',
            'serius deh...',
            'gue kira...',
            'tapi ternyata...',
            'gimana ya...',
            'jadi gini...',
            'nah ini nih...',
            'beneran deh...',
            'lo tau gak...',
            'sumpah ya...',
            'gak boong...',
            'percaya deh...',
            'aduh gimana ya...',
            'kok bisa sih...',
            'wah gila...'
        ],
        transitions: [
            'terus kan...',
            'nah abis itu...',
            'eh tapi...',
            'yang bikin kaget...',
            'dan ternyata...',
            'pas gue coba...',
            'singkat cerita...'
        ],
        reactions: [
            'gila sih...',
            'beda banget...',
            'worth it parah...',
            'gak nyangka...',
            'langsung jatuh cinta...',
            'auto repeat order...',
            'ini sih juara...'
        ]
    },
    EN: {
        fillers: [
            'wait wait wait...',
            'honestly though...',
            'I swear...',
            'like seriously...',
            'okay so...',
            'not gonna lie...',
            'here\'s the thing...',
            'you know what...',
            'real talk...',
            'no cap...',
            'deadass...',
            'lowkey...',
            'I mean...',
            'bro listen...',
            'okay but...'
        ],
        transitions: [
            'so then...',
            'and then like...',
            'but here\'s where it gets interesting...',
            'the crazy part is...',
            'and guess what...',
            'when I tried it...',
            'long story short...'
        ],
        reactions: [
            'it\'s insane...',
            'totally different...',
            'so worth it...',
            'didn\'t expect that...',
            'instantly hooked...',
            'already reordered...',
            'this is the one...'
        ]
    }
};

// ==================== VO DURATION CALCULATOR ====================

const WORDS_PER_SECOND = 2.5; // Average speaking rate for casual content

function estimateDuration(text) {
    if (!text) return '2s';
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const seconds = Math.max(2, Math.min(4, Math.round(wordCount / WORDS_PER_SECOND)));
    return `${seconds}s`;
}

// ==================== UTILITY ====================

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultipleUnique(arr, count) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, arr.length));
}

// ==================== VO HUMANIZER ====================
// Insert 1-2 natural fillers per VO line.
// Avoid perfect grammar — keep it conversational.

/**
 * Humanize a VO line by injecting natural speech patterns.
 * @param {string} voText - The raw VO text
 * @param {string} lang - 'ID' or 'EN'
 * @param {string} phase - The scene phase (hook, problem, cta, etc.)
 * @returns {string} Humanized VO text
 */
export function humanizeVO(voText, lang, phase) {
    if (!voText || voText.trim().length === 0) return voText;

    const patterns = SPEECH_PATTERNS[lang] || SPEECH_PATTERNS.ID;
    const fillerCount = Math.random() > 0.5 ? 2 : 1;
    const selectedFillers = pickMultipleUnique(patterns.fillers, fillerCount);

    let humanized = voText;

    // For hook phase, prepend a filler for dramatic effect
    if (phase === 'hook' && Math.random() > 0.3) {
        humanized = `${selectedFillers[0]} ${humanized}`;
        selectedFillers.shift();
    }

    // Insert remaining fillers at natural break points (after commas, periods, or mid-sentence)
    for (const filler of selectedFillers) {
        const breakPoints = [];
        for (let i = 0; i < humanized.length; i++) {
            if (humanized[i] === ',' || humanized[i] === '.') {
                breakPoints.push(i + 1);
            }
        }
        if (breakPoints.length > 0) {
            const insertPoint = breakPoints[Math.floor(Math.random() * breakPoints.length)];
            humanized = humanized.slice(0, insertPoint) + ' ' + filler + ' ' + humanized.slice(insertPoint).trimStart();
        } else {
            // No natural break points — insert after first few words
            const words = humanized.split(' ');
            if (words.length > 3) {
                const insertIdx = Math.floor(Math.random() * Math.min(4, words.length - 1)) + 1;
                words.splice(insertIdx, 0, filler);
                humanized = words.join(' ');
            }
        }
    }

    // Add a reaction phrase at the end for proof/reaction scenes
    if ((phase === 'proof' || phase === 'reaction') && Math.random() > 0.4) {
        const reaction = pickRandom(patterns.reactions);
        humanized = humanized.replace(/[.!]?\s*$/, '') + '... ' + reaction;
    }

    // Add transition at start for middle scenes
    if (['solution', 'explain', 'discovery', 'compare'].includes(phase) && Math.random() > 0.5) {
        const transition = pickRandom(patterns.transitions);
        humanized = transition + ' ' + humanized;
    }

    return humanized;
}

// ==================== PER-SCENE VO BUILDER ====================

/**
 * Build VO prompt for a single scene, aware of viral context.
 * @param {Object} params - Scene parameters
 * @returns {string} AI prompt for generating this scene's VO
 */
export function buildSceneVOPrompt(params) {
    const {
        info, sceneIndex, totalScenes, phase, phaseLabel,
        isUGC, categoryData, viralContext, previousVOs
    } = params;

    const persona = PERSONAS[engineConfig.persona] || PERSONAS.best_friend;
    const energy = ENERGY_LEVELS[engineConfig.energy] || ENERGY_LEVELS.medium;
    const lang = state.selectedLang || 'ID';
    const langNote = lang === 'EN' ? 'Write entirely in English.' : 'Tulis dalam Bahasa Indonesia.';
    const toneGuide = lang === 'EN' ? persona.englishGuide : persona.toneGuide;

    const categoryContext = categoryData
        ? `\nCATEGORY (${info.category}):
- Voice style: ${categoryData.voiceStyle}
- Product interaction: ${categoryData.productInteraction}
- Sensory: ${categoryData.sensory.slice(0, 3).join(', ')}
- Required: ${categoryData.requiredElements.join(', ')}
- AVOID: ${getCategoryNegativeContext(categoryData)}`
        : '';

    const emotionDirective = viralContext
        ? `\nEMOTIONAL DIRECTION: ${viralContext.emotionalTrigger.emotion} — ${viralContext.emotionalTrigger.description}`
        : '';

    const hookDirective = (sceneIndex === 0 && viralContext)
        ? `\nHOOK (WAJIB sebagai kalimat pertama): "${viralContext.hook}"\nGunakan atau variasikan hook ini sebagai pembuka.`
        : '';

    const previousContext = previousVOs && previousVOs.length > 0
        ? `\nVO scene sebelumnya (untuk kontinuitas):\n${previousVOs.map((v, i) => `Scene ${i + 1}: "${v}"`).join('\n')}`
        : '';

    const ctaDirective = phase === 'cta'
        ? `\n${buildCTADirective(lang).instruction}`
        : '';

    const voStyle = isUGC
        ? 'Gaya: kasual, kayak ngobrol sama temen. Pakai filler alami (eh, gue kira, serius deh). JANGAN perfect grammar.'
        : 'Gaya: profesional tapi tetap engaging. Boleh pakai filler ringan untuk natural feel.';

    return `Buat SATU kalimat VO untuk Scene ${sceneIndex + 1}/${totalScenes}.

SCENE PHASE: ${phaseLabel}
Produk: ${info.name} (${info.category})
Deskripsi: ${info.desc || 'tidak ada'}
Persona: ${persona.label} — ${persona.voiceStyle}
Energy: ${engineConfig.energy} — ${energy.pacing}
${categoryContext}
${emotionDirective}
${hookDirective}
${previousContext}
${ctaDirective}
${langNote}
${toneGuide}
${voStyle}

RULES:
- Durasi: 2-4 detik saat dibaca (pendek dan impactful)
- HARUS nyambung dengan scene sebelumnya (continuous storytelling)
- JANGAN terlalu panjang — ini satu scene, bukan monolog
- ${isUGC ? 'Harus terasa seperti orang biasa ngomong, bukan script.' : 'Harus terasa premium tapi tidak kaku.'}

Output: HANYA teks VO, tanpa label atau penjelasan.`;
}

/**
 * Build per-scene VO objects from AI-generated text or fallback.
 * Each scene gets: { scene, vo, duration, phase, emotion }
 *
 * @param {string[]} voTexts - Raw VO texts per scene
 * @param {Object[]} structure - Viral structure phases
 * @param {Object} viralContext - Viral engine context
 * @param {string} lang - Language code
 * @returns {Object[]} Array of per-scene VO objects
 */
export function buildPerSceneVO(voTexts, structure, viralContext, lang) {
    const l = lang || state.selectedLang || 'ID';

    return voTexts.map((rawVO, index) => {
        const phase = structure[index]?.phase || 'unknown';
        const phaseLabel = structure[index]?.label || phase.toUpperCase();

        // Humanize the VO
        let humanizedVO = humanizeVO(rawVO, l, phase);

        // Enforce CTA elements on the last scene
        if (phase === 'cta') {
            humanizedVO = enforceCTA(humanizedVO, l);
        }

        // Inject hook as first scene VO if available
        if (index === 0 && viralContext && viralContext.hook) {
            const hookPresent = humanizedVO.toLowerCase().includes(viralContext.hook.toLowerCase().slice(0, 15));
            if (!hookPresent) {
                humanizedVO = viralContext.hook + ' ' + humanizedVO;
            }
        }

        return {
            scene: `Scene ${index + 1}: ${phaseLabel}`,
            vo: humanizedVO,
            duration: estimateDuration(humanizedVO),
            phase,
            emotion: viralContext ? viralContext.emotionalTrigger.emotion : null,
            imperfections: viralContext ? viralContext.getImperfectionsForScene() : []
        };
    });
}

/**
 * Generate fallback per-scene VO when AI is unavailable.
 * @param {Object} info - Product info
 * @param {Object[]} structure - Viral structure phases
 * @param {Object} viralContext - Viral engine context
 * @param {boolean} isUGC - Whether UGC mode
 * @param {Object} categoryData - Category rules data
 * @returns {Object[]} Array of per-scene VO objects
 */
export function buildFallbackPerSceneVO(info, structure, viralContext, isUGC, categoryData) {
    const lang = state.selectedLang || 'ID';
    const patterns = SPEECH_PATTERNS[lang] || SPEECH_PATTERNS.ID;

    const fallbackVOs = {
        ID: {
            hook: viralContext ? viralContext.hook : `Lo harus tau soal ${info.name} ini...`,
            problem: `Gue tuh udah lama nyari ${info.category.toLowerCase()} yang beneran works...`,
            solution: `${pickRandom(patterns.transitions)} ${info.name} ini beda banget sih...`,
            proof: `${pickRandom(patterns.fillers)} hasilnya ${pickRandom(patterns.reactions)}`,
            cta: `Link di bio ya! ${pickRandom(patterns.reactions)} Buruan sebelum kehabisan!`,
            reaction: `${pickRandom(patterns.fillers)} ${pickRandom(patterns.reactions)}`,
            explain: `${pickRandom(patterns.transitions)} jadi ${info.name} ini tuh...`,
            compare: `Sebelum vs sesudah pakai ${info.name}... ${pickRandom(patterns.reactions)}`,
            story: `Jadi ceritanya gue tuh... ${pickRandom(patterns.fillers)} nyari ${info.category.toLowerCase()} yang oke...`,
            discovery: `${pickRandom(patterns.transitions)} gue nemu ${info.name} ini...`,
            question: `Lo pernah gak sih ngerasa... ${pickRandom(patterns.fillers)} kayak butuh sesuatu yang beda?`,
            reveal: `${pickRandom(patterns.fillers)} ini dia ${info.name}! ${pickRandom(patterns.reactions)}`,
            brand_story: `${info.name} ini bukan brand biasa sih...`,
            product_reveal: `Ini dia yang ditunggu-tunggu... ${info.name}.`,
            feature_1: `Yang bikin beda... ${pickRandom(patterns.reactions)}`,
            feature_2: `Dan satu lagi nih... ${pickRandom(patterns.fillers)}`,
            benefit: `Manfaatnya tuh kerasa banget di ${categoryData ? categoryData.requiredElements[0] : 'daily life'}...`,
            social_proof: `Udah banyak yang buktiin sih... ${pickRandom(patterns.reactions)}`,
            demonstration: `Langsung gue demo ya... ${pickRandom(patterns.fillers)}`,
            emotional: `${pickRandom(patterns.fillers)} ini tuh yang bikin gue jatuh cinta...`
        },
        EN: {
            hook: viralContext ? viralContext.hook : `You need to know about ${info.name}...`,
            problem: `I've been looking for a ${info.category.toLowerCase()} that actually works...`,
            solution: `${pickRandom(patterns.transitions)} ${info.name} is just different...`,
            proof: `${pickRandom(patterns.fillers)} the results are ${pickRandom(patterns.reactions)}`,
            cta: `Link in bio! ${pickRandom(patterns.reactions)} Grab yours before it's gone!`,
            reaction: `${pickRandom(patterns.fillers)} ${pickRandom(patterns.reactions)}`,
            explain: `${pickRandom(patterns.transitions)} so ${info.name} basically...`,
            compare: `Before vs after using ${info.name}... ${pickRandom(patterns.reactions)}`,
            story: `So basically I was... ${pickRandom(patterns.fillers)} looking for a good ${info.category.toLowerCase()}...`,
            discovery: `${pickRandom(patterns.transitions)} I found ${info.name}...`,
            question: `Have you ever felt like... ${pickRandom(patterns.fillers)} you needed something different?`,
            reveal: `${pickRandom(patterns.fillers)} here it is, ${info.name}! ${pickRandom(patterns.reactions)}`,
            brand_story: `${info.name} isn't just another brand...`,
            product_reveal: `Here's what everyone's been waiting for... ${info.name}.`,
            feature_1: `What makes it different... ${pickRandom(patterns.reactions)}`,
            feature_2: `And one more thing... ${pickRandom(patterns.fillers)}`,
            benefit: `The benefits are so real for ${categoryData ? categoryData.requiredElements[0] : 'daily life'}...`,
            social_proof: `So many people have proven it... ${pickRandom(patterns.reactions)}`,
            demonstration: `Let me show you real quick... ${pickRandom(patterns.fillers)}`,
            emotional: `${pickRandom(patterns.fillers)} this is what made me fall in love...`
        }
    };

    const voMap = fallbackVOs[lang] || fallbackVOs.ID;

    return structure.map((phaseObj, index) => {
        const phase = phaseObj.phase;
        let vo = voMap[phase] || voMap.hook;

        // Humanize
        vo = humanizeVO(vo, lang, phase);

        // Enforce CTA on last scene
        if (phase === 'cta') {
            vo = enforceCTA(vo, lang);
        }

        return {
            scene: `Scene ${index + 1}: ${phaseObj.label}`,
            vo,
            duration: estimateDuration(vo),
            phase,
            emotion: viralContext ? viralContext.emotionalTrigger.emotion : null,
            imperfections: viralContext ? viralContext.getImperfectionsForScene() : []
        };
    });
}

/**
 * Validate VO sync with scenes.
 * Each scene must have matching VO and duration 2-4s.
 */
export function validateVOSync(sceneVOs) {
    const errors = [];

    for (let i = 0; i < sceneVOs.length; i++) {
        const sv = sceneVOs[i];
        if (!sv.vo || sv.vo.trim().length < 5) {
            errors.push(`Scene ${i + 1}: VO is empty or too short.`);
        }
        const dur = parseInt(sv.duration);
        if (isNaN(dur) || dur < 2 || dur > 4) {
            errors.push(`Scene ${i + 1}: Duration ${sv.duration} outside 2-4s range.`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        message: errors.length > 0
            ? `VO sync issues: ${errors.join('; ')}`
            : 'VO sync validated.'
    };
}
