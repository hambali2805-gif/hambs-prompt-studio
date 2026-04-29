export const VIDEO_STYLE_PROFILES={
 cinematic:{label:'Cinematic',visual:'polished cinematic framing, controlled lighting, smooth camera movement, premium composition',camera:'slow push-in, rack focus, stabilized handheld/dolly',pace:'measured premium',guardrail:'visual only; do not change UGC voice into brand narration'},
 lifestyle:{label:'Lifestyle',visual:'natural daily-life setting, authentic but tidy, warm realistic light',camera:'gentle handheld or natural follow movement',pace:'conversational believable',guardrail:'keep product use grounded in daily life'},
 ugc:{label:'UGC',visual:'phone-recorded realism, handheld imperfections, casual framing, natural room light',camera:'self-shot, POV, small shakes, quick reframes',pace:'native social video pacing',guardrail:'avoid over-polished studio ad look'},
 macro:{label:'Macro',visual:'close-up sensory detail, product texture, tactile proof, shallow depth of field',camera:'macro push-in, detail pan, texture rack focus',pace:'slow enough for detail',guardrail:'do not lose human/product context'}
};
export function normalizeVideoStyle(style=''){const s=String(style).toLowerCase(); if(s.includes('cinematic'))return'cinematic'; if(s.includes('ugc'))return'ugc'; if(s.includes('macro'))return'macro'; return'lifestyle';}
export const getVideoStyleProfile=(s)=>VIDEO_STYLE_PROFILES[normalizeVideoStyle(s)];
