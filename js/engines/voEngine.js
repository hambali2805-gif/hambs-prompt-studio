// ==================== VO ENGINE V2 ====================
// Per-scene voice-over generation with meaning-first guidance.
// Fixes the old filler-heavy behavior by forcing each line to carry a specific scene idea.

import { engineConfig, PERSONAS, ENERGY_LEVELS } from '../config.js';
import { state } from '../state.js';
import { buildCTADirective, enforceCTA } from '../core/ctaBuilder.js';
import { getCategoryNegativeContext } from '../categoryRules.js';
import { removeUnsupportedClaims } from '../shared/safetyRules.js';

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
        'ini dia yang ditunggu-tunggu', 'bukan brand biasa', 'hasilnya luar biasa',
        'terasa lebih gampang dinikmati', 'checkout sebelum kehabisan',
        'cuma tersisa sedikit lagi', 'lo pantas punya ini'
    ],
    weakPatterns: [
        /bikin\s+.+\s+terasa\s+lebih\s+gampang\s+dinikmati/i,
        /^(indomie|produk|.+)\s+bikin\s+/i,
        /checkout\s+sebelum\s+kehabisan/i,
        /cuma\s+tersisa\s+sedikit\s+lagi/i,
        /lo\s+pantas\s+punya\s+ini/i
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

    return removeUnsupportedClaims(cleanSpacing(cleaned));
}

function looksTooGeneric(text) {
    const raw = String(text || '');
    const t = raw.toLowerCase();
    if (t.split(/\s+/).filter(Boolean).length < 5) return true;
    if (VO_QUALITY_RULES.genericPhrases.some(p => t.includes(p))) return true;
    return VO_QUALITY_RULES.weakPatterns.some(re => re.test(raw));
}

function pickDetail(blueprint, index = 0, fallback = '') {
    const must = blueprint?.mustInclude || [];
    return must[index] || fallback || blueprint?.visualFocus || blueprint?.message || '';
}

function isFood(info) {
    const category = String(info?.category || '').toUpperCase();
    const name = String(info?.name || '').toLowerCase();
    return category === 'MAKANAN' || /indomie|mie|makanan|food/.test(name);
}

function fallbackFoodID(product, phase, blueprint) {
    const d0 = pickDetail(blueprint, 0, 'lapar malam');
    const d1 = pickDetail(blueprint, 1, 'aroma bumbu panas');
    const d2 = pickDetail(blueprint, 2, 'uap panasnya');

    switch (phase) {
        case 'hook':
            return 'Jam segini tuh, perut lapar tapi males ribet.';
        case 'problem':
            return 'Yang paling nyebelin itu pas laper, tapi tenaga buat masak udah tinggal sedikit.';
        case 'story':
            return `Akhirnya bikin ${product}, dan ${d1} langsung bikin suasana rumah berasa lebih hangat.`;
        case 'discovery':
            return `Pas ${d1} ketemu bumbunya, rasanya langsung kebayang bahkan sebelum suapan pertama.`;
        case 'reaction':
            return 'Suapan pertama tuh bikin diem sebentar, kayak, oke ini yang dari tadi dicari.';
        case 'proof':
            return `Lihat ${d2} sama bumbunya yang nempel; ini bukan cuma ngomong enak, kelihatan dari teksturnya.`;
        case 'demonstration':
            return `Mienya diangkat pas masih panas, terus bumbunya dicampur sampai benar-benar rata.`;
        case 'benefit':
            return `Kadang yang dibutuhin cuma makanan hangat yang cepat, familiar, dan nggak bikin mikir panjang.`;
        case 'feature_1':
            return `Yang kerasa duluan itu ${d1}, langsung naik pas bungkus bumbunya dibuka.`;
        case 'feature_2':
            return `Terus teksturnya tetap enak digigit, apalagi pas bumbunya sudah nempel rata.`;
        case 'social_proof':
            return 'Mungkin ini alasan orang tetap balik lagi: rasanya sederhana, tapi memorinya kuat.';
        case 'cta':
            return `Kalau nanti ${d0}, simpan ${product} buat momen simpel yang bikin nyaman.`;
        default:
            return `Ini tipe makanan yang sederhana, tapi pas ${d0} rasanya jadi tepat banget.`;
    }
}

function fallbackAdsID(product, phase, blueprint) {
    const d0 = pickDetail(blueprint, 0, 'momen harian');
    const d1 = pickDetail(blueprint, 1, 'detail produk');

    switch (phase) {
        case 'hook': return 'Ada momen sederhana yang langsung terasa berbeda saat detailnya tepat.';
        case 'emotional': return `Di momen itu, ${product} menghadirkan kesan yang familiar, hangat, dan mudah diingat.`;
        case 'brand_story': return `${product} dirancang untuk masuk ke keseharian tanpa terasa berlebihan.`;
        case 'product_reveal': return `${product} menjadi pusat perhatian lewat visual yang jelas dan natural.`;
        case 'feature_1': return `Detail pertamanya terlihat dari ${d1}, sesuatu yang bisa langsung dirasakan.`;
        case 'feature_2': return `Lalu ada ${d0}, yang membuat manfaatnya terasa lebih relevan.`;
        case 'demonstration': return `Buktinya hadir saat ${product} digunakan langsung dalam situasi nyata.`;
        case 'benefit': return `Manfaatnya sederhana: membuat ${d0} terasa lebih praktis dan nyaman.`;
        case 'social_proof': return `Kedekatan ${product} dengan momen sehari-hari membuatnya mudah diingat.`;
        case 'cta': return `Temukan kembali momen sederhana bersama ${product}.`;
        default: return `${product} hadir dengan detail yang relevan untuk kebutuhan sehari-hari.`;
    }
}


function fallbackGenericID(product, phase, blueprint) {
    const d0 = pickDetail(blueprint, 0, 'momen sehari-hari');
    const d1 = pickDetail(blueprint, 1, 'detail kecilnya');

    switch (phase) {
        case 'hook': return `Pernah nggak, ada momen kecil yang tiba-tiba bikin butuh sesuatu yang pas?`;
        case 'problem': return `Masalahnya sering bukan besar, tapi detail kecil yang bikin aktivitas terasa kurang nyaman.`;
        case 'solution': return `${product} masuk di situ karena manfaatnya langsung nyambung ke kebutuhan harian.`;
        case 'story': return `Awalnya biasa aja, sampai ${d1} mulai kelihatan di momen nyata.`;
        case 'discovery': return `Pas dicoba langsung kerasa, ini bukan cuma klaim, tapi ada detail yang bisa dilihat.`;
        case 'proof': return `Buktinya ada di ${d1}, bukan cuma di kata-kata.`;
        case 'reaction': return `Reaksinya kecil tapi jujur: ini ternyata kepakai banget.`;
        case 'demonstration': return `Lihat cara produk ini dipakai langsung di situasi nyata, bukan cuma dipajang.`;
        case 'benefit': return `Manfaatnya paling kerasa pas ${d0}, karena bikin momen itu lebih praktis.`;
        case 'cta': return `Kalau situasinya mirip, coba simpan ${product} buat nanti.`;
        default: return `${product} paling masuk akal saat ${d0}, karena detailnya terasa nyata.`;
    }
}

function fallbackFromBlueprint(info, phase, blueprint, lang, isUGCMode = true) {
    const product = info.name || 'Produk';
    const must = blueprint?.mustInclude || [];
    const detailA = must[0] || blueprint?.message || info.desc || product;
    const detailB = must[1] || blueprint?.visualFocus || '';

    if (lang === 'EN') {
        switch (phase) {
            case 'hook': return `Ever get hungry at night but too tired to make it complicated?`;
            case 'story': return `Then ${product} comes in, and that small familiar detail makes the moment feel warmer.`;
            case 'discovery': return `The first cue is ${detailB || detailA}, the kind of detail that makes you pause for a second.`;
            case 'proof': return `You can see the proof in ${detailA}; it feels real, not staged.`;
            case 'cta': return `Keep ${product} for the kind of moment when you need something simple and comforting.`;
            default: return `${product} works because the moment feels specific: ${detailA}.`;
        }
    }

    if (!isUGCMode) return fallbackAdsID(product, phase, blueprint);
    if (isFood(info)) return fallbackFoodID(product, phase, blueprint);
    return fallbackGenericID(product, phase, blueprint);
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
        ? `\nCONTENT BRAIN V4:\n- Angle: ${contentBrain.strategy.angle}\n- Audience: ${contentBrain.strategy.audience}\n- Tension/use case: ${contentBrain.strategy.tension}\n- Promise: ${contentBrain.strategy.promise}\n- Scene function: ${blueprint?.function || ''}\n- Scene message: ${blueprint?.message || ''}\n- Must include detail(s): ${(blueprint?.mustInclude || []).join(', ')}\n- Visual/action context: ${blueprint?.visualFocus || ''}\n- Avoid: ${(blueprint?.avoid || []).join(', ')}`
        : '';

    const modeDirective = contentBrain?.modeProfile?.promptBlock
        ? '\n' + contentBrain.modeProfile.promptBlock
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
${modeDirective}
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
- Hindari pola berulang seperti “produk bikin situasi terasa lebih gampang dinikmati”.
- Jangan pakai scarcity palsu untuk UGC makanan: “stok terbatas”, “checkout sebelum kehabisan”, “cuma tersisa sedikit lagi”.
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
            vo = fallbackFromBlueprint({
                name: contentBrain?.intelligence?.product || 'Produk',
                category: contentBrain?.intelligence?.category || '',
                desc: contentBrain?.intelligence?.description || ''
            }, phase, blueprint, l, (contentBrain?.mode || engineConfig.mode) !== 'ads');
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
        let vo = fallbackFromBlueprint(info, phase, blueprint, lang, isUGC);
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
