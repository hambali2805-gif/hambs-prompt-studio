import { buildImageNegativePrompt } from '../shared/imageNegativeRules.js?v=202604301437';

export function buildGPTImageNegative(categoryData, customNegativePrompt) {
    return buildImageNegativePrompt(categoryData, customNegativePrompt);
}
