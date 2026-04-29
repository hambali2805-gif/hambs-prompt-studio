import { buildUGCBrain } from './ugcBrain.js';
import { validateUGCContent } from './ugcValidator.js';
import { UGC_PROFILE } from './ugcProfiles.js';

export function buildUGCContent(context) {
    const brain = buildUGCBrain(context.info, context.categoryData, context.viralContext);
    return {
        ...brain,
        profile: UGC_PROFILE,
        validate: validateUGCContent
    };
}
