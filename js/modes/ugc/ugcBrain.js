import { buildContentBrain } from '../../engines/contentBrain.js';
import { UGC_PROFILE } from './ugcProfiles.js';

export function buildUGCBrain(info, categoryData, viralContext) {
    const brain = buildContentBrain(info, categoryData, viralContext, true);
    return {
        ...brain,
        version: 'content_brain_v4_mode_split',
        mode: 'ugc',
        modeProfile: UGC_PROFILE,
        strategy: {
            ...brain.strategy,
            angle: `${brain.strategy.angle}_human_creator`,
            delivery: 'creator experience first, product second, recommendation last',
            noGenericRule: `${brain.strategy.noGenericRule} UGC tidak boleh terdengar seperti iklan brand atau ecommerce hard-sell.`
        },
        sceneBlueprints: brain.sceneBlueprints.map(bp => ({
            ...bp,
            mode: 'ugc',
            modeIntent: 'momen manusia nyata + produk dipakai natural',
            voiceRule: 'satu kalimat natural seperti creator, spesifik, tidak hard sell',
            visualRule: 'handheld phone realism, natural imperfection, real interaction',
            avoid: [...new Set([...(bp.avoid || []), ...UGC_PROFILE.forbidden])]
        }))
    };
}
