// ==================== PROMPT BUILDER V4 ====================
// Routes prompt generation through separated mode/platform adapters.
// UGC/Ads, Banana Pro/GPT Image, and Veo/Seedance stay isolated.

import { engineConfig } from './config.js';
import { state } from './state.js';
import { getVeoLensPrompt } from './platforms/veo.js';
import { SEEDANCE_SYSTEM_PROMPT } from './platforms/video/seedance/index.js';
import { getUGCStyleContext } from './engines/ugcEngine.js';
import { getAdsStyleContext } from './engines/adsEngine.js';
import { deduplicatePrompt } from './core/antiRepetition.js';
import { callAIWithSystem } from './api.js';
import { cleanText } from './utils.js';
import { pickCategorySensory } from './categoryRules.js';
import { buildImageByPlatform } from './platforms/image/index.js';
import { buildVideoByPlatform } from './platforms/video/index.js';
import { buildCharacterPrefix } from './shared/referenceHandler.js';

function getGenderDesc() {
    const g = document.getElementById('charGender')?.value || 'wanita';
    return g === 'pria'
        ? { subj: 'A young Indonesian man', pronoun: 'he', possessive: 'his' }
        : { subj: 'A young Indonesian woman', pronoun: 'she', possessive: 'her' };
}

function getCategorySensoryDetail(categoryData) {
    if (!categoryData) return '';
    return ', ' + pickCategorySensory(categoryData);
}

export function getImagePlatformLabel(platform = engineConfig.imagePlatform || state.selectedImageModel || 'banana_pro') {
    return platform === 'gpt_image' ? 'GPT Image' : 'Banana Pro';
}

export function getVideoPlatformLabel(platform = engineConfig.platform || state.selectedVideoModel || 'veo') {
    return platform === 'seedance' ? 'Seedance 2.0' : 'Veo 3.1';
}

export function buildImagePrompt(sceneDesc, voSnippet, isUGC, categoryData, sceneBlueprint = null) {
    const gender = getGenderDesc();
    const lens = getVeoLensPrompt(state.lensStyle);
    const sensoryDetail = getCategorySensoryDetail(categoryData);
    const mode = isUGC ? 'ugc' : 'ads';

    const result = buildImageByPlatform({
        platform: engineConfig.imagePlatform || state.selectedImageModel || 'banana_pro',
        sceneDesc,
        voSnippet,
        mode,
        categoryData,
        state,
        engineConfig,
        gender,
        lensPrompt: lens,
        sensoryDetail,
        sceneBlueprint
    });

    if (result.validation && !result.validation.valid) {
        console.warn('Image prompt validation:', result.validation.warnings);
    }

    return deduplicatePrompt(result.prompt);
}

export function buildVideoPrompt(sceneDesc, voSnippet, sceneNum, totalScenes, isUGC, categoryData, sceneBlueprint = null) {
    const gender = getGenderDesc();
    const mode = isUGC ? 'ugc' : 'ads';
    const style = isUGC ? getUGCStyleContext(categoryData) : getAdsStyleContext(categoryData);
    const sensoryDetail = getCategorySensoryDetail(categoryData);

    const charRef = buildCharacterPrefix({
        uploadedFiles: state.uploadedFiles,
        gender,
        sceneDesc,
        mode
    }) || `${gender.subj}, ${style.outfit}, `;

    const result = buildVideoByPlatform({
        platform: engineConfig.platform || state.selectedVideoModel || 'veo',
        sceneNum,
        totalScenes,
        mode,
        charRef,
        sceneDesc,
        sensoryDetail,
        productName: state.productName,
        sceneBlueprint,
        voSnippet,
        categoryData,
        state,
        engineConfig,
        gender
    });

    if (result.validation && !result.validation.valid) {
        console.warn('Video prompt validation:', result.validation.warnings);
    }

    return deduplicatePrompt(result.prompt);
}

export async function buildSeedanceAIPrompt(sceneDesc, info, gender, isUGC, categoryData, sceneBlueprint = null, voSnippet = '') {
    const sensoryContext = categoryData
        ? `Sensory: ${categoryData.sensory.slice(0, 2).join(', ')}`
        : '';

    const blueprintContext = sceneBlueprint
        ? `
Content Brain V4:
- Function: ${sceneBlueprint.function}
- Message: ${sceneBlueprint.message}
- Visual focus: ${sceneBlueprint.visualFocus}
- Must include: ${sceneBlueprint.mustInclude.join(', ')}
- Avoid: ${sceneBlueprint.avoid.join(', ')}
- Mode visual rule: ${sceneBlueprint.visualRule || ''}
- Mode voice rule: ${sceneBlueprint.voiceRule || ''}`
        : '';

    const voContext = voSnippet
        ? `
Voiceover context: ${voSnippet}`
        : '';

    try {
        return cleanText(await callAIWithSystem(SEEDANCE_SYSTEM_PROMPT,
            `Buat prompt video Seedance 2.0 untuk scene ini:
Visual: ${sceneDesc}
Produk: ${info.name} (${info.category})
Karakter: ${gender.subj}
${sensoryContext}
${blueprintContext}
${voContext}
Mode: ${isUGC ? 'UGC' : 'ADS'}
Gaya: ${isUGC ? 'UGC handheld casual, phone-recorded feel, natural imperfect creator timing' : 'IKLAN cinematic professional, premium commercial, controlled brand-safe motion'}
Fokus: temporal consistency, fluid natural movement, human-product interaction dynamics, believable hands, real body timing, micro-expression, and product physics.
Jangan campur gaya UGC dan Ads. Jangan buat prompt generic/stock footage. Satu paragraf narasi teknis.`
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
                imagePlatform: getImagePlatformLabel(),
                videoPlatform: getVideoPlatformLabel(),
                visual_prompt: shot.imagePrompt,
                motion: shot.videoPrompt,
                purpose: shot.arcPhase || shot.title,
                meaning: sceneVO ? sceneVO.meaning : null
            };
        }),
        config: {
            mode: engineConfig.mode,
            imagePlatform: engineConfig.imagePlatform || state.selectedImageModel || 'banana_pro',
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
            engine: 'v4-mode-platform-split'
        }
    };

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
