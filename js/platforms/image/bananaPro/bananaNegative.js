import { buildImageNegativePrompt } from '../shared/imageNegativeRules.js';

export function buildBananaNegative(categoryData, customNegativePrompt) {
    return buildImageNegativePrompt(categoryData, customNegativePrompt);
}
