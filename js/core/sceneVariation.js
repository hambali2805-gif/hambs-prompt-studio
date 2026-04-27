// ==================== SCENE VARIATION SYSTEM ====================
// Each scene must use a different angle, action, and product description

const CAMERA_ANGLES = [
    'eye-level straight-on',
    'low angle looking up (hero shot)',
    'high angle looking down (overview)',
    'dutch angle (tilted, dynamic)',
    'over-the-shoulder',
    'bird\'s eye / top-down',
    'worm\'s eye (extreme low)',
    'profile / side view',
    'three-quarter angle',
    'frontal medium close-up'
];

const SUBJECT_ACTIONS_UGC = [
    'picks up product and examines it closely',
    'opens the product with both hands, genuine reaction',
    'applies/uses the product while talking to camera',
    'holds product next to face, comparing before/after',
    'casually shows product to camera with one hand',
    'demonstrates product texture/feel with fingers',
    'takes a sip/bite/tries product, eyes widen',
    'points at product features, explaining enthusiastically',
    'places product on surface, gestures around it',
    'puts product down after use, satisfied expression'
];

const SUBJECT_ACTIONS_ADS = [
    'elegantly reveals product from shadow into light',
    'places product on reflective surface, precision placement',
    'product glides across frame in slow motion',
    'hand gracefully presents product to camera',
    'product rotates on turntable, catching light',
    'model interacts with product in curated setting',
    'macro detail exploration of product surface',
    'product placed in lifestyle context with props',
    'dramatic pour/application in controlled environment',
    'final hero pose with brand elements visible'
];

const PRODUCT_DESCRIPTIONS = [
    'highlighting packaging design and brand identity',
    'focusing on texture and material quality',
    'showing the product in use, real results',
    'emphasizing size/scale relative to hand',
    'capturing color accuracy and finish',
    'displaying product features and unique selling points',
    'showcasing ingredient/component quality',
    'demonstrating ease of use and convenience',
    'product in motion, dynamic interaction',
    'hero shot: product as the star, clean composition'
];

const usedAngles = new Set();
const usedActions = new Set();
const usedDescriptions = new Set();

export function resetVariationTracker() {
    usedAngles.clear();
    usedActions.clear();
    usedDescriptions.clear();
}

function pickUnique(pool, usedSet) {
    const available = pool.filter(item => !usedSet.has(item));
    if (available.length === 0) {
        usedSet.clear();
        return pool[Math.floor(Math.random() * pool.length)];
    }
    const pick = available[Math.floor(Math.random() * available.length)];
    usedSet.add(pick);
    return pick;
}

export function getSceneVariation(sceneIndex, isUGC) {
    const angle = pickUnique(CAMERA_ANGLES, usedAngles);
    const actions = isUGC ? SUBJECT_ACTIONS_UGC : SUBJECT_ACTIONS_ADS;
    const action = pickUnique(actions, usedActions);
    const description = pickUnique(PRODUCT_DESCRIPTIONS, usedDescriptions);

    return {
        angle,
        action,
        productFocus: description,
        directive: `VARIATION RULES for Scene ${sceneIndex + 1}:
- Camera angle: ${angle}
- Subject action: ${action}
- Product focus: ${description}
These MUST be different from all other scenes.`
    };
}
