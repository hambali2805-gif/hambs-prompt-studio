// ==================== SEEDANCE PLATFORM ADAPTER ====================
// Seedance: motion emphasis, real-time dynamics, human action focus

export const SEEDANCE_CONFIG = {
    name: 'Seedance 2.0',
    strengths: ['Motion dynamics', 'Human interaction', 'Real-time movement', 'Temporal consistency']
};

export const SEEDANCE_SYSTEM_PROMPT = `ROLE: Kamu adalah AI Director & Senior Cinematographer spesialis mesin video AI Seedance 2.0.
STRUKTUR PROMPT SEEDANCE 2.0 (WAJIB):
1. Subject & Action Detail — focus on human-product interaction and body dynamics.
2. Camera Motion: Dolly In/Out, Orbital Tracking, Pan, Tilt, Rack Focus.
3. Lighting & Optics: Rim lighting, Volumetric, Softbox, Lensa spesifik.
4. Material Physics: ray-traced reflections, subsurface scattering.
5. Motion Dynamics: emphasize real-time movement, fluid transitions, human action continuity.
6. Ending: --motion 6 --fps 30 --cfg 7 --upscale 2.
Jangan gunakan bullet points. Output hanya satu paragraf narasi prompt.`;

const MOTION_PRESETS_UGC = [
    'Handheld follow, natural sway, reactive to subject',
    'Quick pan left-right, energetic and spontaneous',
    'Slight tilt up with handheld shake, casual discovery',
    'POV grab-and-show, first person interaction',
    'Rack focus close to mid, organic transition',
    'Slow push-in, casual reveal, natural pacing',
    'Handheld orbital, curiosity peek around subject',
    'Static with natural body sway and micro-movements'
];

const MOTION_PRESETS_ADS = [
    'Dolly In slowly with parallax depth layers',
    'Orbital Tracking 180 degrees, left to right',
    'Smooth Tilt-up cinematic reveal, floor to face',
    'Rack Focus foreground to background, dramatic shift',
    'Crane descending to eye level, grand entrance',
    'Push In with dolly zoom effect, Hitchcock style',
    'Slow-motion fluid dynamics capture, liquid/fabric',
    'Slider tracking with depth layers and bokeh shift',
    'Spiral orbit around product, 360 showcase',
    'Whip pan to product hero shot, snap reveal'
];

const INTERACTION_TYPES = [
    'Hand reaching for product, fingertips first, deliberate grasp',
    'Product being lifted and rotated, examining from all angles',
    'Opening/unboxing with anticipation, reveal moment',
    'Product application/usage, real-time demonstration',
    'Product placed down with satisfaction, final placement',
    'Hands framing product, presenting to viewer',
    'Natural product handoff between hands',
    'Product interaction with environment (table, shelf, mirror)'
];

export function getSeedanceMotion(sceneNum, isUGC) {
    const pool = isUGC ? MOTION_PRESETS_UGC : MOTION_PRESETS_ADS;
    return pool[sceneNum % pool.length];
}

export function getSeedanceLighting(isUGC) {
    return isUGC
        ? 'Natural ambient lighting, soft window bounce, no artificial setup'
        : 'Studio rim lighting with volumetric haze, diffused softbox key, controlled environment';
}

export function getSeedanceInteraction(sceneNum) {
    return INTERACTION_TYPES[sceneNum % INTERACTION_TYPES.length];
}

export function buildSeedanceVideoPrompt(params) {
    const { charRef, sceneDesc, beverageDetail, motion, lighting, style, productName, interaction } = params;
    return `${charRef}${sceneDesc}${beverageDetail}. Camera Motion: ${motion}. Lighting: ${lighting}. Human Interaction: ${interaction}. Temporal Consistency: maintain consistent character appearance and fluid natural movement across frames. Material Physics: subsurface scattering on skin texture, ray-traced reflections on product surface. Product: ${productName}. ${style}. --motion 6 --fps 30 --cfg 7 --upscale 2`;
}
