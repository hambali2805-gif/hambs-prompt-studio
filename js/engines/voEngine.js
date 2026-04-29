// ==================== VO ENGINE V2 ====================
// Per-scene voice-over generation with meaning-first guidance.
// Fixes the old filler-heavy behavior by forcing each line to carry a specific scene idea.

import { engineConfig, PERSONAS, ENERGY_LEVELS } from '../config.js';
import { state } from '../state.js';
import { buildCTADirective, enforceCTA } from '../core/ctaBuilder.js';
import { getCategoryNegativeContext } from '../categoryRules.js';

// ==================== CONTROLLED SPEECH PATTERNS ====================
// Fillers are now optional seasoning, not the main content.

const SPEECH_PATTERNS = {
    ID: {
        softOpeners: ['Eh', 'Jujur', 'Coba bayangin', 'Lo pernah nggak'],
        transitions: ['terus', 'pas dicoba', 'yang kerasa', 'makanya'],
        reactions: ['ini yang bikin kangen', 'langsung kebayang rasanya', 'rasanya familiar banget', 'nggak perlu drama']
    },
    EN: {
        softOpeners: ['Honestly', 'Picture this', 'Have you ever', 'Real talk'],
        transitions: ['then', 'when you try it', 'what you notice', 'that is why'],
        reactions: ['that familiar feeling hits', 'it feels instantly comforting', 'it just makes sense', 'no overclaim needed']
    }
};

export const VO_QUALITY_RULES = {
    maxFillerPerLine: 1,
    bannedPhrases: [
        'worth it parah', 'gak boong', 'nggak boong', 'tapi ternyata', 'serius deh',
        'wah gila', 'percaya deh', 'kok bisa sih', 'beneran deh', 'auto repeat order',
        'literally', 'beda banget sih', 'ini sih juara'
    ],
    genericPhrases: [
        'yang bikin beda', 'manfaatnya tuh kerasa banget', 'udah banyak yang buktiin',
        'ini dia yang ditunggu-tunggu', 'bukan brand biasa', 'hasilnya luar biasa'
    ]
};

const WORDS_PER_SECOND = 2.7;

function estimateDuration(text) {
    if (!text) return '2s';
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const seconds = Math.max(2, Math.min(5, Math.round(wordCount / WORDS_PER_SECOND)));
    return `${seconds}s`;
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function cleanSpacing(text) {
    return String(text || '')
        .replace(/\s+([,.!?])/g, '$1')
        .replace(/([,.!?]){2,}/g, '$1')
        .replace(/\s{2,}/g, ' ')
        .replace(/\s+$/g, '')
        .trim();
}

export function enforceVORules(text) {
    let cleaned = String(text || '');

    for (const phrase of VO_QUALITY_RULES.bannedPhrases) {
        const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        cleaned = cleaned.replace(re, '');
    }

    // Remove repeated punctuation and orphan filler residue.
    cleaned = cleaned
        .replace(/\.\.\./g, '.')
        .replace(/\s+\.\s*/g, '. ')
        .replace(/\s+,\s*/g, ', ')
        .replace(/^(,|\.|-|—)+\s*/g, '');

    return cleanSpacing(cleaned);
}

function looksTooGeneric(text) {
    const t = String(text || '').toLowerCase();
    if (t.split(/\s+/).length < 5) return true;
    return VO_QUALITY_RULES.genericPhrases.some(p => t.includes(p));
}

function fallbackFromBlueprint(info, phase, blueprint, lang) {
    const product = info.name;
    const must = blueprint?.mustInclude || [];
    const detailA = must[0] || blueprint?.message || info.desc || product;
    const detailB = must[1] || blueprint?.visualFocus || '';

    if (lang === 'EN') {
        switch (phase) {
            case 'hook': return `Have you ever suddenly craved something familiar during ${detailA}?`;
            case 'emotional': return `${product} hits that familiar feeling through ${detailA}.`;
            case 'brand_story': return `This is the kind of product people remember because the moment feels real.`;
            case 'product_reveal': return `That is where ${product} comes in, simple and instantly recognizable.`;
            case 'feature_1': return `The first thing you notice is ${detailA}.`;
            case 'feature_2': return `Then ${detailB || 'the small details'} makes it feel even more complete.`;
            case 'demonstration': return `Watch the proof in the action: ${detailA}.`;
            case 'benefit': return `So the benefit is simple: ${detailA}.`;
            case 'social_proof': return `People keep coming back because this fits a real everyday moment.`;
            case 'cta': return `Try ${product} for your next ${detailA}, before the craving passes.`;
            default: return `${product} makes ${detailA} feel easier to enjoy.`;
        }
    }

    switch (phase) {
        case 'hook': return `Lo pernah nggak tiba-tiba kangen sesuatu yang familiar pas ${detailA}?`;
        case 'emotional': return `${product} itu ngena karena detail kecilnya: ${detailA}.`;
        case 'brand_story': return `Ini tipe produk yang diingat bukan karena ramai, tapi karena momennya terasa dekat.`;
        case 'product_reveal': return `Di momen kayak gitu, ${product} masuknya natural banget.`;
        case 'feature_1': return `Yang pertama kerasa itu ${detailA}.`;
        case 'feature_2': return `Terus detail lainnya, ${detailB || 'cara produknya dipakai'}, bikin momennya makin lengkap.`;
        case 'demonstration': return `Lihat langsung prosesnya: ${detailA}.`;
        case 'benefit': return `Benefit-nya simpel: ${detailA}.`;
        case 'social_proof': return `Makanya orang balik lagi, karena ini cocok sama momen sehari-hari.`;
        case 'cta': return `Kalau lagi ${detailA}, cobain ${product} sebelum craving-nya lewat.`;
        default: return `${product} bikin ${detailA} terasa lebih gampang dinikmati.`;
    }
}

// ==================== VO HUMANIZER ====================
// Adds at most one light conversational touch only when the line is already meaningful.

export function humanizeVO(voText, lang, phase) {
    let text = enforceVORules(voText);
    if (!text) return text;

    const patterns = SPEECH_PATTERNS[lang] || SPEECH_PATTERNS.ID;
    const wordCount = text.split(/\s+/).length;

    // Do not humanize short CTA/product reveal lines; keep them clean.
    if (['cta', 'product_reveal', 'reveal'].includes(phase) || wordCount < 7) {
        return cleanSpacing(text);
    }

    // Low probability, one opener max. This prevents filler spam.
    if ((phase === 'hook' || phase === 'emotional') && Math.random() > 0.55) {
        const opener = pickRandom(patterns.softOpeners);
        if (!text.toLowerCase().startsWith(opener.toLowerCase())) {
            text = `${opener}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
        }
    }

    return cleanSpacing(text);
}

// ==================== PER-SCENE VO BUILDER ====================

export function buildSceneVOPrompt(params) {
    const {
        info, sceneIndex, totalScenes, phase, phaseLabel,
        isUGC, categoryData, viralContext, previousVOs, contentBrain
    } = params;

    const persona = PERSONAS[engineConfig.persona] || PERSONAS.best_friend;
    const energy = ENERGY_LEVELS[engineConfig.energy] || ENERGY_LEVELS.medium;
    const lang = state.selectedLang || 'ID';
    const langNote = lang === 'EN' ? 'Write entirely in English.' : 'Tulis dalam Bahasa Indonesia natural.';
    const toneGuide = lang === 'EN' ? persona.englishGuide : persona.toneGuide;
    const blueprint = contentBrain?.sceneBlueprints?.[sceneIndex];

    const categoryContext = categoryData
        ? `\nCATEGORY (${info.category}):\n- Voice style: ${categoryData.voiceStyle}\n- Product interaction: ${categoryData.productInteraction}\n- Sensory: ${categoryData.sensory.slice(0, 3).join(', ')}\n- Required: ${categoryData.requiredElements.join(', ')}\n- AVOID: ${getCategoryNegativeContext(categoryData)}`
        : '';

    const emotionDirective = viralContext
        ? `\nEMOTIONAL DIRECTION: ${viralContext.emotionalTrigger.emotion} — ${viralContext.emotionalTrigger.description}`
        : '';

    const previousContext = previousVOs && previousVOs.length > 0
        ? `\nVO scene sebelumnya:\n${previousVOs.map((v, i) => `Scene ${i + 1}: "${v}"`).join('\n')}`
        : '';

    const ctaDirective = phase === 'cta'
        ? `\n${buildCTADirective(lang).instruction}`
        : '';

    const brainContext = contentBrain
        ? `\nCONTENT BRAIN V2:\n- Angle: ${contentBrain.strategy.angle}\n- Audience: ${contentBrain.strategy.audience}\n- Tension/use case: ${contentBrain.strategy.tension}\n- Promise: ${contentBrain.strategy.promise}\n- Scene function: ${blueprint?.function || ''}\n- Scene message: ${blueprint?.message || ''}\n- Must include detail(s): ${(blueprint?.mustInclude || []).join(', ')}\n- Visual/action context: ${blueprint?.visualFocus || ''}\n- Avoid: ${(blueprint?.avoid || []).join(', ')}`
        : '';

    const hookDirective = (sceneIndex === 0 && viralContext)
        ? `\nHOOK GOAL: boleh pakai ide ini, tapi jadikan spesifik dan manusiawi: "${viralContext.hook}".`
        : '';

    const voStyle = isUGC
        ? 'Gaya: kasual seperti ngomong ke teman, tapi tetap punya isi. Maksimal 1 filler ringan, jangan spam slang.'
        : 'Gaya: premium cinematic tapi tetap manusiawi, spesifik, dan tidak kaku.';

    return `Buat SATU kalimat VO untuk Scene ${sceneIndex + 1}/${totalScenes}.

SCENE PHASE: ${phaseLabel}
Produk: ${info.name} (${info.category})
Deskripsi produk: ${info.desc || 'tidak ada'}
Persona: ${persona.label} — ${persona.voiceStyle}
Energy: ${engineConfig.energy} — ${energy.pacing}
${categoryContext}
${emotionDirective}
${brainContext}
${hookDirective}
${previousContext}
${ctaDirective}
${langNote}
${toneGuide}
${voStyle}

QUALITY RULES:
- Wajib punya detail konkret: situasi, sensory, aksi, atau manfaat nyata.
- Jangan output kalimat kosong seperti “yang bikin beda”, “worth it”, “gak boong”, “serius deh”, “wah gila”.
- Jangan lebih dari 1 kalimat.
- Durasi saat dibaca: 2-5 detik.
- Harus nyambung dengan scene sebelumnya.
- Kalau emotion adalah nostalgia/comfort, masukkan memori atau situasi spesifik, bukan cuma kata “nostalgia”.
- Kalau phase feature/benefit/demo, sebut detail yang bisa terlihat atau dirasakan.

Output: HANYA teks VO, tanpa label atau penjelasan.`;
}

export function buildPerSceneVO(voTexts, structure, viralContext, lang, contentBrain) {
    const l = lang || state.selectedLang || 'ID';

    return voTexts.map((rawVO, index) => {
        const phase = structure[index]?.phase || 'unknown';
        const phaseLabel = structure[index]?.label || phase.toUpperCase();
        const blueprint = contentBrain?.sceneBlueprints?.[index];

        let vo = enforceVORules(rawVO);
        if (!vo || looksTooGeneric(vo)) {
            vo = fallbackFromBlueprint({ name: contentBrain?.intelligence?.product || 'Produk', category: '', desc: '' }, phase, blueprint, l);
        }

        vo = humanizeVO(vo, l, phase);

        if (phase === 'cta') {
            vo = enforceCTA(vo, l);
            vo = enforceVORules(vo);
        }

        return {
            scene: `Scene ${index + 1}: ${phaseLabel}`,
            vo,
            duration: estimateDuration(vo),
            phase,
            emotion: viralContext ? viralContext.emotionalTrigger.emotion : null,
            imperfections: viralContext ? viralContext.getImperfectionsForScene() : [],
            meaning: blueprint ? {
                function: blueprint.function,
                message: blueprint.message,
                visualFocus: blueprint.visualFocus,
                mustInclude: blueprint.mustInclude
            } : null
        };
    });
}

export function buildFallbackPerSceneVO(info, structure, viralContext, isUGC, categoryData, contentBrain) {
    const lang = state.selectedLang || 'ID';

    return structure.map((phaseObj, index) => {
        const phase = phaseObj.phase;
        const blueprint = contentBrain?.sceneBlueprints?.[index];
        let vo = fallbackFromBlueprint(info, phase, blueprint, lang);
        vo = humanizeVO(vo, lang, phase);

        if (phase === 'cta') {
            vo = enforceCTA(vo, lang);
            vo = enforceVORules(vo);
        }

        return {
            scene: `Scene ${index + 1}: ${phaseObj.label}`,
            vo,
            duration: estimateDuration(vo),
            phase,
            emotion: viralContext ? viralContext.emotionalTrigger.emotion : null,
            imperfections: viralContext ? viralContext.getImperfectionsForScene() : [],
            meaning: blueprint ? {
                function: blueprint.function,
                message: blueprint.message,
                visualFocus: blueprint.visualFocus,
                mustInclude: blueprint.mustInclude
            } : null
        };
    });
}

export function validateVOSync(sceneVOs) {
    const errors = [];
    const warnings = [];
    const seenWeak = [];

    for (let i = 0; i < sceneVOs.length; i++) {
        const sv = sceneVOs[i];
        if (!sv.vo || sv.vo.trim().length < 5) {
            errors.push(`Scene ${i + 1}: VO is empty or too short.`);
        }
        const dur = parseInt(sv.duration);
        if (isNaN(dur) || dur < 2 || dur > 5) {
            errors.push(`Scene ${i + 1}: Duration ${sv.duration} outside 2-5s range.`);
        }
        const lower = String(sv.vo || '').toLowerCase();
        for (const phrase of [...VO_QUALITY_RULES.bannedPhrases, ...VO_QUALITY_RULES.genericPhrases]) {
            if (lower.includes(phrase)) seenWeak.push(`Scene ${i + 1}: weak phrase "${phrase}"`);
        }
        if (!sv.meaning && sv.phase !== 'unknown') warnings.push(`Scene ${i + 1}: missing meaning blueprint.`);
    }

    return {
        valid: errors.length === 0 && seenWeak.length === 0,
        errors: [...errors, ...seenWeak],
        warnings,
        message: (errors.length || seenWeak.length)
            ? `VO sync/quality issues: ${[...errors, ...seenWeak].join('; ')}`
            : 'VO sync and quality validated.'
    };
}
