import { buildAdsBrain } from './adsBrain.js';
import { validateAdsContent } from './adsValidator.js';
import { ADS_PROFILE } from './adsProfiles.js';

export function buildAdsContent(context) {
    const brain = buildAdsBrain(context.info, context.categoryData, context.viralContext);
    return {
        ...brain,
        profile: ADS_PROFILE,
        validate: validateAdsContent
    };
}
