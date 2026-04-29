import { buildBananaImagePrompt } from './bananaPrompt.js';
import { validateBananaPrompt } from './bananaValidator.js';

export function buildBananaProImage(params) {
    const prompt = buildBananaImagePrompt(params);
    return {
        platform: 'banana_pro',
        label: 'Banana Pro',
        prompt,
        validation: validateBananaPrompt(prompt, params.mode)
    };
}
