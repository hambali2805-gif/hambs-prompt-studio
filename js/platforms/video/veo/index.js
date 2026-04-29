import { getVeoCameraMove, getVeoLighting, buildVeoVideoPrompt } from '../../veo.js';
import { buildContinuityRules } from '../shared/continuityRules.js';
import { buildVideoModeStyle } from '../shared/videoPromptUtils.js';
import { validateVeoPrompt } from './veoValidator.js';

export function buildVeoVideo(params) {
    const { sceneNum, mode, charRef, sceneDesc, sensoryDetail, productName, sceneBlueprint, voSnippet } = params;
    const isUGC = mode === 'ugc';
    const prompt = buildVeoVideoPrompt({
        charRef,
        sceneDesc,
        sensoryDetail,
        cam: getVeoCameraMove(sceneNum, isUGC),
        lighting: getVeoLighting(isUGC),
        style: `${buildVideoModeStyle(mode, 'veo')}. ${buildContinuityRules(mode)}`,
        productName,
        sceneBlueprint,
        voSnippet
    });
    return {
        platform: 'veo',
        label: 'Veo',
        prompt,
        validation: validateVeoPrompt(prompt, mode)
    };
}
