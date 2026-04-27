// ==================== PROMPT BUILDER ====================
// Separated from UI — builds image/video prompts based on engine output

import { engineConfig } from './config.js';
import { state } from './state.js';
import { getVeoLensPrompt, getVeoLighting, getVeoCameraMove, buildVeoVideoPrompt } from './platforms/veo.js';
import { getSeedanceMotion, getSeedanceLighting, getSeedanceInteraction, buildSeedanceVideoPrompt, SEEDANCE_SYSTEM_PROMPT } from './platforms/seedance.js';
import { getUGCStyleContext } from './engines/ugcEngine.js';
import { getAdsStyleContext } from './engines/adsEngine.js';
import { deduplicatePrompt } from './core/antiRepetition.js';
import { callAIWithSystem } from './api.js';
import { cleanText } from './utils.js';

function hasCharacterReference() {
    return !!state.uploadedFiles.char;
}

function getGenderDesc() {
    const g = document.getElementById('charGender')?.value || 'wanita';
    return g === 'pria'
        ? { subj: 'A young Indonesian man', pronoun: 'he', possessive: 'his' }
        : { subj: 'A young Indonesian woman', pronoun: 'she', possessive: 'her' };
}

function getNegativePrompt() {
    const base = 'deformed, blurry, low quality, distorted face, extra fingers, bad anatomy, watermark, text overlay, logo';
    return state.customNegativePrompt ? `${base}, ${state.customNegativePrompt}` : base;
}

function getBeverageDetail(productName) {
    const isBeverage = productName.toLowerCase().match(/teh|tea|minum|drink|jus|juice|kopi|coffee|susu|milk/);
    return isBeverage ? ', cold PET bottle with water condensation droplets, vibrant amber tea color, chilled refreshing look' : '';
}

export function buildImagePrompt(sceneDesc, voSnippet, isUGC) {
    const gender = getGenderDesc();
    const style = isUGC ? getUGCStyleContext() : getAdsStyleContext();

    const charRef = hasCharacterReference()
        ? `[REF:CHARACTER] ${gender.subj} (reference character), `
        : `${gender.subj}, ${style.outfit}, `;

    const prodRef = state.uploadedFiles.prod.some(p => p)
        ? '[REF:PRODUCT] '
        : `${state.productName} (${state.selectedCategory}), `;

    const lens = getVeoLensPrompt(state.lensStyle);
    const neg = getNegativePrompt();
    const beverageKw = getBeverageDetail(state.productName);

    const realismNote = isUGC
        ? `Phone camera quality, realism: ${engineConfig.realism}/100. ${style.imperfections}`
        : 'Studio-grade photography, polished and flawless.';

    const bananaPro = 'shot on 35mm lens, high-resolution photography, photorealistic skin texture, sharp product details, hyper-realistic';
    const styleKeywords = `${style.camera}, ${style.lighting}, ${style.vibe}`;

    const raw = `${charRef}${sceneDesc}. ${prodRef}Product: ${state.productName}${beverageKw}. ${bananaPro}. ${lens}. ${styleKeywords}. ${realismNote}. --no ${neg}`;
    return deduplicatePrompt(raw);
}

export function buildVideoPrompt(sceneDesc, voSnippet, sceneNum, totalScenes, isUGC) {
    const gender = getGenderDesc();
    const style = isUGC ? getUGCStyleContext() : getAdsStyleContext();
    const beverageDetail = getBeverageDetail(state.productName);

    const charRef = hasCharacterReference()
        ? `${gender.subj} (consistent character from reference), `
        : `${gender.subj}, ${style.outfit}, `;

    if (engineConfig.platform === 'seedance') {
        const motion = getSeedanceMotion(sceneNum, isUGC);
        const lighting = getSeedanceLighting(isUGC);
        const interaction = getSeedanceInteraction(sceneNum);

        return deduplicatePrompt(buildSeedanceVideoPrompt({
            charRef, sceneDesc, beverageDetail, motion, lighting,
            style: style.vibe, productName: state.productName, interaction
        }));
    }

    // Veo
    const cam = getVeoCameraMove(sceneNum, isUGC);
    const lighting = getVeoLighting(isUGC);

    return deduplicatePrompt(buildVeoVideoPrompt({
        charRef, sceneDesc, beverageDetail, cam, lighting,
        style: style.vibe, productName: state.productName
    }));
}

export async function buildSeedanceAIPrompt(sceneDesc, info, gender, isUGC) {
    const isBeverage = info.name.toLowerCase().match(/teh|tea|minum|drink|jus|juice|kopi|coffee|susu|milk/);
    try {
        return cleanText(await callAIWithSystem(SEEDANCE_SYSTEM_PROMPT,
            `Buat prompt video Seedance 2.0 untuk scene ini:
Visual: ${sceneDesc}
Produk: ${info.name}${isBeverage ? ' (PET bottle, cold condensation)' : ''}
Karakter: ${gender.subj}
Gaya: ${isUGC ? 'UGC handheld casual, phone-recorded feel' : 'IKLAN cinematic professional, premium commercial'}
Fokus: temporal consistency, fluid natural movement, human-product interaction dynamics.
Satu paragraf narasi teknis.`
        ));
    } catch (e) {
        return null;
    }
}

// Structured JSON output builder
export function buildStructuredOutput(vo, shots, info) {
    return {
        voiceover: vo,
        scenes: shots.map(shot => ({
            shot: shot.title,
            visual_prompt: shot.imagePrompt,
            motion: shot.videoPrompt,
            purpose: shot.arcPhase || shot.title
        })),
        config: {
            mode: engineConfig.mode,
            platform: engineConfig.platform,
            persona: engineConfig.persona,
            energy: engineConfig.energy,
            realism: engineConfig.realism
        },
        meta: {
            product: info.name,
            category: info.category,
            generatedAt: new Date().toISOString()
        }
    };
}
