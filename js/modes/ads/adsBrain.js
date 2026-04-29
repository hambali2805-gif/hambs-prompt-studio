import { buildContentBrain } from '../../engines/contentBrain.js';
import { ADS_PROFILE } from './adsProfiles.js';

export function buildAdsBrain(info, categoryData, viralContext) {
    const brain = buildContentBrain(info, categoryData, viralContext, false);
    return {
        ...brain,
        version: 'content_brain_v4_mode_split',
        mode: 'ads',
        modeProfile: ADS_PROFILE,
        strategy: {
            ...brain.strategy,
            angle: `${brain.strategy.angle}_brand_campaign`,
            delivery: 'brand promise first, product proof second, clear action last',
            noGenericRule: `${brain.strategy.noGenericRule} Ads harus terasa premium dan grounded, tanpa klaim palsu atau slang UGC.`
        },
        sceneBlueprints: brain.sceneBlueprints.map(bp => ({
            ...bp,
            mode: 'ads',
            modeIntent: 'brand campaign yang rapi + product value jelas',
            voiceRule: 'satu kalimat brand narrator, premium, spesifik, tidak slang',
            visualRule: 'commercial composition, controlled lighting, product clarity',
            avoid: [...new Set([...(bp.avoid || []), ...ADS_PROFILE.forbidden])]
        }))
    };
}
