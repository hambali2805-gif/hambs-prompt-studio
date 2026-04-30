import { buildImageNegativePrompt } from '../shared/imageNegativeRules.js?v=202604300848';

export function buildBananaNegative(categoryData, customNegativePrompt) {
    return buildImageNegativePrompt(categoryData, customNegativePrompt);
}
