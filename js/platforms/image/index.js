// ==================== IMAGE PLATFORM ROUTER ====================
// Keeps Banana Pro and GPT Image prompt logic separated.

import { buildBananaProImage } from './bananaPro/index.js';
import { buildGPTImage } from './gptImage/index.js';

export function buildImageByPlatform(params) {
    const platform = params.platform || 'banana_pro';
    if (platform === 'gpt_image') return buildGPTImage(params);
    return buildBananaProImage(params);
}
