// ==================== PROMPT BUILDER ====================
// Category-aware prompt builder. Uses CATEGORY_RULES for all context.
// No hardcoded product-type detection — category drives everything.

import { engineConfig } from './config.js';
import { state } from './state.js';
import { getVeoLensPrompt, getVeoLighting, getVeoCameraMove, buildVeoVideoPrompt } from './platforms/veo.js';
import { getSeedanceMotion, getSeedanceLighting, getSeedanceInteraction, buildSeedanceVideoPrompt, SEEDANCE_SYSTEM_PROMPT } from './platforms/seedance.js';
import { getUGCStyleContext } from './engines/ugcEngine.js';
import { getAdsStyleContext } from './engines/adsEngine.js';
import { deduplicatePrompt } from './core/antiRepetition.js';
import { callAIWithSystem } from './api.js';
import { cleanText } from './utils.js';
import { getCategoryData, pickCategorySensory } from './categoryRules.js';

function hasCharacterReference() {
    return !!state.uploadedFiles.char;
}

function getGenderDesc() {
    const g = document.getElementById('charGender')?.value || 'wanita';
    return g === 'pria'
        ? { subj: 'A young Indonesian man', pronoun: 'he', possessive: 'his' }
        : { subj: 'A young Indonesian woman', pronoun: 'she', possessive: 'her' };
}

function getNegativePrompt(categoryData) {
    const base = 'deformed, blurry, low quality, distorted face, extra fingers, bad anatomy, watermark, text overlay, logo';
    const categoryNeg = categoryData
        ? ', ' + categoryData.negativeContext.join(', ')
        : '';
    return state.customNegativePrompt
        ? `${base}${categoryNeg}, ${state.customNegativePrompt}`
        : `${base}${categoryNeg}`;
}

function getCategorySensoryDetail(categoryData) {
    if (!categoryData) return '';
    return ', ' + pickCategorySensory(categoryData);
}

export function buildImagePrompt(sceneDesc, voSnippet, isUGC, categoryData) {
    const gender = getGenderDesc();
    const style = isUGC ? getUGCStyleContext(categoryData) : getAdsStyleContext(categoryData);

    const charRef = hasCharacterReference()
        ? `[REF:CHARACTER] ${gender.subj} (reference character), `
        : `${gender.subj}, ${style.outfit}, `;

    const prodRef = state.uploadedFiles.prod.some(p => p)
        ? '[REF:PRODUCT] '
        : `${state.productName} (${state.selectedCategory}), `;

    const lens = getVeoLensPrompt(state.lensStyle);
    const neg = getNegativePrompt(categoryData);
    const sensoryKw = getCategorySensoryDetail(categoryData);

    const realismNote = isUGC
        ? `Phone camera quality, realism: ${engineConfig.realism}/100. ${style.imperfections}`
        : 'Studio-grade photography, polished and flawless.';

    const photoRealism = 'high-resolution photography, photorealistic skin texture, sharp product details, hyper-realistic';
    const styleKeywords = `${style.camera}, ${style.lighting}, ${style.vibe}`;

    const raw = `${charRef}${sceneDesc}. ${prodRef}Product: ${state.productName}${sensoryKw}. ${photoRealism}. ${lens}. ${styleKeywords}. ${realismNote}. --no ${neg}`;
    return deduplicatePrompt(raw);
}

export function buildVideoPrompt(sceneDesc, voSnippet, sceneNum, totalScenes, isUGC, categoryData) {
    const gender = getGenderDesc();
    const style = isUGC ? getUGCStyleContext(categoryData) : getAdsStyleContext(categoryData);
    const sensoryDetail = getCategorySensoryDetail(categoryData);

    const charRef = hasCharacterReference()
        ? `${gender.subj} (consistent character from reference), `
        : `${gender.subj}, ${style.outfit}, `;

    if (engineConfig.platform === 'seedance') {
        const motion = getSeedanceMotion(sceneNum, isUGC);
        const lighting = getSeedanceLighting(isUGC);
        const interaction = getSeedanceInteraction(sceneNum);

        return deduplicatePrompt(buildSeedanceVideoPrompt({
            charRef, sceneDesc, sensoryDetail, motion, lighting,
            style: style.vibe, productName: state.productName, interaction
        }));
    }

    // Veo
    const cam = getVeoCameraMove(sceneNum, isUGC);
    const lighting = getVeoLighting(isUGC);

    return deduplicatePrompt(buildVeoVideoPrompt({
        charRef, sceneDesc, sensoryDetail, cam, lighting,
        style: style.vibe, productName: state.productName
    }));
}

export async function buildSeedanceAIPrompt(sceneDesc, info, gender, isUGC, categoryData) {
    const sensoryContext = categoryData
        ? `Sensory: ${categoryData.sensory.slice(0, 2).join(', ')}`
        : '';

    try {
        return cleanText(await callAIWithSystem(SEEDANCE_SYSTEM_PROMPT,
            `Buat prompt video Seedance 2.0 untuk scene ini:
Visual: ${sceneDesc}
Produk: ${info.name} (${info.category})
Karakter: ${gender.subj}
${sensoryContext}
Gaya: ${isUGC ? 'UGC handheld casual, phone-recorded feel' : 'IKLAN cinematic professional, premium commercial'}
Fokus: temporal consistency, fluid natural movement, human-product interaction dynamics.
Satu paragraf narasi teknis.`
        ));
    } catch (e) {
        return null;
    }
}

export function buildStructuredOutput(vo, shots, info, viralContext, sceneVOs) {
    const structured = {
        voiceover: vo,
        scenes: shots.map((shot, i) => {
            const sceneVO = sceneVOs ? sceneVOs[i] : null;
            return {
                shot: shot.title,
                scene: sceneVO ? sceneVO.scene : `Scene ${i + 1}`,
                vo: sceneVO ? sceneVO.vo : (shot.voSnippet || ''),
                duration: sceneVO ? sceneVO.duration : '2-4s',
                phase: sceneVO ? sceneVO.phase : (shot.arcPhase || ''),
                emotion: sceneVO ? sceneVO.emotion : null,
                imperfections: sceneVO ? sceneVO.imperfections : [],
                visual_prompt: shot.imagePrompt,
                motion: shot.videoPrompt,
                purpose: shot.arcPhase || shot.title
            };
        }),
        config: {
            mode: engineConfig.mode,
            platform: engineConfig.platform,
            persona: engineConfig.persona,
            energy: engineConfig.energy,
            realism: engineConfig.realism,
            category: info.category
        },
        meta: {
            product: info.name,
            category: info.category,
            generatedAt: new Date().toISOString(),
            engine: 'viral-content-engine-v1'
        }
    };

    // Add viral engine metadata
    if (viralContext) {
        structured.viralEngine = {
            hook: viralContext.hook,
            emotionalTrigger: viralContext.emotionalTrigger,
            structure: viralContext.structure.map(s => s.phase),
            structureLabels: viralContext.structure.map(s => s.label)
        };
    }

    return structured;
}
