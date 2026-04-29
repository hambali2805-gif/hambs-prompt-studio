// ==================== VEO PLATFORM ADAPTER ====================
// Veo: lens details, depth of field, cinematic lighting

export const VEO_CONFIG = {
    name: 'Veo 3.1',
    strengths: ['Lens simulation', 'Depth of field', 'Cinematic lighting', 'Photorealistic rendering']
};

const LENS_PRESETS = {
    portrait: {
        spec: '85mm f/1.4',
        description: 'shallow depth of field, creamy bokeh background, face in sharp focus',
        dof: 'razor-thin focal plane isolating subject'
    },
    lifestyle: {
        spec: '35mm f/2.0',
        description: 'environmental portrait, model and surroundings in context, natural perspective',
        dof: 'moderate depth of field, subject and environment both visible'
    },
    macro: {
        spec: '100mm f/2.8',
        description: 'extreme close-up, fine texture details, razor-thin focal plane',
        dof: 'ultra-shallow DOF, only product detail in focus'
    },
    cinematic: {
        spec: '50mm f/1.8 anamorphic',
        description: 'cinematic framing, natural perspective, oval bokeh, lens flare',
        dof: 'medium depth of field with anamorphic character'
    },
    wide: {
        spec: '24mm f/2.8',
        description: 'wide establishing shot, environmental context, slight barrel distortion',
        dof: 'deep depth of field, everything in focus'
    }
};

const LIGHTING_SETUPS_UGC = [
    'Natural window light, soft and diffused, no artificial setup',
    'Ambient room lighting with warm overhead, casual feel',
    'Golden hour sunlight streaming through window, natural flare',
    'Overcast daylight, even illumination, no harsh shadows'
];

const LIGHTING_SETUPS_ADS = [
    'Three-point lighting with key, fill, and rim, studio quality',
    'Volumetric fog with backlit rim light, dramatic depth',
    'Softbox key with negative fill, controlled contrast',
    'Practical lighting with neon accents, modern commercial feel',
    'Golden hour cinematic, warm directional light with long shadows',
    'High-key clean white lighting, product photography standard'
];

const CAMERA_MOVES_UGC = [
    'Handheld close-up, natural sway',
    'POV first-person perspective',
    'Quick whip-pan, energetic TikTok style',
    'Slight zoom-in with organic shake',
    'Static with subject movement only'
];

const CAMERA_MOVES_ADS = [
    'Slow dolly zoom, intimate reveal',
    'Smooth orbital pan with rack focus',
    'Crane shot descending, dramatic',
    'Slow-motion capture, 120fps overcranked',
    'Slider tracking with layered depth',
    'Smooth tilt-up, dramatic reveal',
    'Pull-back wide reveal shot',
    'Over-shoulder to frontal transition',
    'Macro push-in with rack focus',
    'Steadicam walk-and-reveal'
];

export function getVeoLensPrompt(lensStyle) {
    const preset = LENS_PRESETS[lensStyle] || LENS_PRESETS.portrait;
    return `Shot on ${preset.spec} lens, ${preset.description}. DOF: ${preset.dof}`;
}

export function getVeoLighting(isUGC) {
    const pool = isUGC ? LIGHTING_SETUPS_UGC : LIGHTING_SETUPS_ADS;
    return pool[Math.floor(Math.random() * pool.length)];
}

export function getVeoCameraMove(sceneNum, isUGC) {
    const pool = isUGC ? CAMERA_MOVES_UGC : CAMERA_MOVES_ADS;
    return pool[sceneNum % pool.length];
}

export function buildVeoVideoPrompt(params) {
    const { charRef, sceneDesc, sensoryDetail, cam, lighting, style, productName, sceneBlueprint, voSnippet } = params;

    const blueprintBlock = sceneBlueprint
        ? `Story intent: ${sceneBlueprint.function}. Human moment: ${sceneBlueprint.message}. Visual focus: ${sceneBlueprint.visualFocus}. Required details: ${sceneBlueprint.mustInclude.join(', ')}.`
        : '';

    const voBlock = voSnippet
        ? `Voiceover context: "${voSnippet}".`
        : '';

    const antiGeneric = 'Avoid generic stock-footage posing; show a believable human action with product interaction, micro-reaction, continuity, and one clear subject focus.';

    return [
        `Cinematic video scene: ${charRef}${sceneDesc}${sensoryDetail}.`,
        blueprintBlock,
        voBlock,
        `Product: ${productName}.`,
        `Camera: ${cam}. Lighting: ${lighting}.`,
        antiGeneric,
        `Style: ${style}.`,
        'Photorealistic, natural motion, consistent character, realistic hands, 4K, 24fps, controlled shallow depth of field.'
    ].filter(Boolean).join(' ');
}

