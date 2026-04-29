// ==================== MODE ROUTER ====================
// UGC and Ads are intentionally separated so their VO, CTA, and strategy rules do not collide.

import { buildUGCContent } from './ugc/index.js';
import { buildAdsContent } from './ads/index.js';

export function buildModeContent({ info, categoryData, viralContext, isUGC }) {
    return isUGC
        ? buildUGCContent({ info, categoryData, viralContext })
        : buildAdsContent({ info, categoryData, viralContext });
}
