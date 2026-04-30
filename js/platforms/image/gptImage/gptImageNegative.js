import { buildImageNegativePrompt } from '../shared/imageNegativeRules.js?v=202604300937';

export function buildGPTImageNegative(categoryData, customNegativePrompt) {
    return buildImageNegativePrompt(categoryData, customNegativePrompt);
}
