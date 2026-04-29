import { buildGPTImagePrompt } from './gptImagePrompt.js';
import { validateGPTImagePrompt } from './gptImageValidator.js';

export function buildGPTImage(params) {
    const prompt = buildGPTImagePrompt(params);
    return {
        platform: 'gpt_image',
        label: 'GPT Image',
        prompt,
        validation: validateGPTImagePrompt(prompt, params.mode)
    };
}
