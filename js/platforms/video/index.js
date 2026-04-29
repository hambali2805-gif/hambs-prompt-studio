// ==================== VIDEO PLATFORM ROUTER ====================
// Keeps Veo and Seedance logic separated.

import { buildVeoVideo } from './veo/index.js';
import { buildSeedanceVideo } from './seedance/index.js';

export function buildVideoByPlatform(params) {
    const platform = params.platform || 'veo';
    if (platform === 'seedance') return buildSeedanceVideo(params);
    return buildVeoVideo(params);
}
