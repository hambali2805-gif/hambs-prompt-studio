// ==================== SEEDANCE PLATFORM ADAPTER ====================
// Seedance: motion emphasis, real-time dynamics, human action focus

export const SEEDANCE_CONFIG = {
    name: 'Seedance 2.0',
    strengths: ['Motion dynamics', 'Human interaction', 'Real-time movement', 'Temporal consistency']
};

export const SEEDANCE_SYSTEM_PROMPT = `ROLE: Kamu adalah AI Director & Senior Cinematographer spesialis mesin video AI Seedance 2.0.
TUJUAN: Buat prompt yang terasa human-level, spesifik, dan tidak generic. Seedance kuat di motion, jadi prompt harus menekankan body dynamics, hand movement, timing, micro-reaction, dan continuity.
STRUKTUR PROMPT SEEDANCE 2.0 (WAJIB):
1. Subject & Action Detail — jelaskan aksi manusia + interaksi produk secara konkret, bukan pose iklan kosong.
2. Story Intent — hubungkan aksi visual dengan pesan scene/voiceover.
3. Camera Motion — Dolly In/Out, Orbital Tracking, Pan, Tilt, Rack Focus, Handheld Follow, atau POV movement yang sesuai adegan.
4. Lighting & Optics — natural/practical/studio lighting yang mendukung mood, bukan keyword acak.
5. Motion Dynamics — real-time movement, hand continuity, product physics, micro-expression, natural pause, fluid transition.
6. Anti-generic — hindari stock footage, floating product hero shot, acting berlebihan, dan scene yang tidak nyambung dengan VO.
7. Ending: --motion 6 --fps 30 --cfg 7 --upscale 2.
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
    'Slow-motion fluid dynamics capture',
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
    const {
        charRef, sceneDesc, sensoryDetail, motion, lighting, style,
        productName, interaction, sceneBlueprint, voSnippet
    } = params;

    const blueprintBlock = sceneBlueprint
        ? `Story Intent: ${sceneBlueprint.function}. Human Message: ${sceneBlueprint.message}. Visual Focus: ${sceneBlueprint.visualFocus}. Must Include: ${sceneBlueprint.mustInclude.join(', ')}.`
        : '';

    const voBlock = voSnippet
        ? `Voiceover Context: "${voSnippet}".`
        : '';

    const antiGeneric = 'Avoid generic stock footage, floating product shots, overacting, disconnected beauty shots, and repeated motion. Show believable body mechanics, hand continuity, product physics, micro-reaction, and one clear action beat.';

    return [
        `${charRef}${sceneDesc}${sensoryDetail}.`,
        blueprintBlock,
        voBlock,
        `Human Interaction: ${interaction}.`,
        `Camera Motion: ${motion}. Lighting: ${lighting}.`,
        `Product: ${productName}.`,
        antiGeneric,
        `Style: ${style}.`,
        'Temporal Consistency: maintain consistent character appearance, realistic hands, fluid natural movement, and coherent motion across frames.',
        '--motion 6 --fps 30 --cfg 7 --upscale 2'
    ].filter(Boolean).join(' ');
}
