import { buildImageNegativePrompt } from '../shared/imageNegativeRules.js';

export function buildGPTImageNegative(categoryData, customNegativePrompt) {
    return buildImageNegativePrompt(categoryData, customNegativePrompt);
}
