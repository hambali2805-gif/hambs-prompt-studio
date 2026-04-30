import { buildImageNegativePrompt } from '../shared/imageNegativeRules.js?v=202604300933';

export function buildBananaNegative(categoryData, customNegativePrompt) {
    return buildImageNegativePrompt(categoryData, customNegativePrompt);
}
