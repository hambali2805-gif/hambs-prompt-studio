import { getSeedanceMotion, getSeedanceLighting, getSeedanceInteraction, buildSeedanceVideoPrompt, SEEDANCE_SYSTEM_PROMPT as LEGACY_SEEDANCE_SYSTEM_PROMPT } from '../../seedance.js';
import { buildContinuityRules } from '../shared/continuityRules.js';
import { buildVideoModeStyle } from '../shared/videoPromptUtils.js';
import { buildSeedanceParams } from './seedanceParams.js';
import { validateSeedancePrompt } from './seedanceValidator.js';

export const SEEDANCE_SYSTEM_PROMPT = `${LEGACY_SEEDANCE_SYSTEM_PROMPT}
MODE SPLIT ADDENDUM:
- If mode is UGC, keep the motion creator-like, human, imperfect, and natural.
- If mode is Ads, keep the motion polished, controlled, premium, and brand-safe.
- Never import Veo-only cinematic phrasing if it weakens hand continuity, product physics, or action clarity.`;

export function buildSeedanceVideo(params) {
    const { sceneNum, mode, charRef, sceneDesc, sensoryDetail, productName, sceneBlueprint, voSnippet } = params;
    const isUGC = mode === 'ugc';
    let prompt = buildSeedanceVideoPrompt({
        charRef,
        sceneDesc,
        sensoryDetail,
        motion: getSeedanceMotion(sceneNum, isUGC),
        lighting: getSeedanceLighting(isUGC),
        style: `${buildVideoModeStyle(mode, 'seedance')}. ${buildContinuityRules(mode)}`,
        productName,
        interaction: getSeedanceInteraction(sceneNum),
        sceneBlueprint,
        voSnippet
    });
    prompt = prompt.replace(/--motion\s*\d+\s*--fps\s*\d+\s*--cfg\s*\d+\s*--upscale\s*\d+/i, buildSeedanceParams(mode));
    return {
        platform: 'seedance',
        label: 'Seedance',
        prompt,
        validation: validateSeedancePrompt(prompt, mode)
    };
}
