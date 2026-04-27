// ==================== CATEGORY RULES ENGINE ====================
// Central category-aware rules system.
// Each category defines: environments, actions, sensory details,
// required validation elements, voice style, and negative context.
// Extend by adding new keys to CATEGORY_RULES.

export const CATEGORY_RULES = {
    MAKANAN: {
        environments: [
            'home kitchen with warm ambient lighting',
            'cooking area with steam and spices visible',
            'dining table set with natural daylight',
            'food market stall with vibrant colors',
            'outdoor barbecue or grilling setup'
        ],
        actions: [
            'preparing ingredients on a cutting board',
            'cooking process with visible steam rising',
            'plating and garnishing the final dish',
            'serving food directly to camera',
            'taking first bite with genuine reaction'
        ],
        sensory: [
            'steam rising from hot food',
            'golden crispy texture in close-up',
            'warm ambient kitchen lighting',
            'sizzling visual implying sound',
            'fresh ingredients with vibrant natural colors'
        ],
        requiredElements: ['cooking', 'final dish', 'eating'],
        voiceStyle: 'warm, sensory, relatable — focus on taste, texture, aroma',
        productInteraction: 'hands preparing, cooking, serving, and eating the food product',
        negativeContext: ['car interior', 'gym', 'office desk', 'bathroom', 'fashion runway']
    },
    MINUMAN: {
        environments: [
            'car interior with natural dashboard light',
            'outdoor sunny park or street setting',
            'casual hangout spot with friends',
            'beach or poolside under bright sun',
            'morning routine at home near window'
        ],
        actions: [
            'opening bottle cap with satisfying twist',
            'pouring drink into glass with visible liquid movement',
            'taking a refreshing sip from the bottle',
            'holding cold bottle showing condensation droplets',
            'refreshed reaction after drinking'
        ],
        sensory: [
            'condensation droplets on cold bottle surface',
            'liquid movement and pour dynamics',
            'refreshing expression on face',
            'ice and cold mist visual effect',
            'vibrant drink color visible through bottle'
        ],
        requiredElements: ['drinking', 'refresh reaction'],
        voiceStyle: 'energetic, refreshing — focus on thirst-quenching, coolness, relief',
        productInteraction: 'opening, pouring, sipping, holding the chilled beverage',
        negativeContext: ['cooking area', 'gym equipment', 'office desk', 'fashion runway']
    },
    SKINCARE: {
        environments: [
            'bathroom vanity with soft mirror lighting',
            'bedroom morning routine setup',
            'minimalist clean beauty corner',
            'spa-like setting with diffused warm light',
            'dressing table with curated beauty products'
        ],
        actions: [
            'applying product on skin with gentle motion',
            'showing product texture on fingertips',
            'blending product smoothly on face',
            'checking skin result in mirror',
            'comparing before and after skin glow'
        ],
        sensory: [
            'creamy texture spreading on skin surface',
            'dewy glow on skin after application',
            'soft diffused bathroom or vanity light',
            'clean minimal aesthetic surroundings',
            'product droplet on fingertip close-up'
        ],
        requiredElements: ['application', 'skin texture', 'result'],
        voiceStyle: 'gentle, educational, beauty-focused — focus on skin feel, glow, ingredients',
        productInteraction: 'dispensing, applying, blending skincare on face or hands',
        negativeContext: ['kitchen', 'car interior', 'outdoor sports', 'food', 'gym']
    },
    FASHION: {
        environments: [
            'urban street with architectural backdrop',
            'minimalist studio with neutral tones',
            'cafe terrace with lifestyle vibe',
            'mirror showing full-body reflection',
            'curated wardrobe room or walk-in closet'
        ],
        actions: [
            'outfit reveal with confident walk toward camera',
            'styling and accessorizing the look',
            'showing fabric texture and detail close-up',
            'posing with natural relaxed movement',
            'outfit transition or quick change moment'
        ],
        sensory: [
            'fabric texture and drape detail visible',
            'natural movement of clothing on body',
            'confident body language and posture',
            'color coordination clearly visible',
            'detail stitching and material quality'
        ],
        requiredElements: ['outfit showcase', 'styling', 'confidence'],
        voiceStyle: 'trendy, confident, style-focused — focus on look, fit, vibe',
        productInteraction: 'wearing, styling, showcasing the fashion item on body',
        negativeContext: ['kitchen cooking', 'bathroom sink', 'gym equipment', 'food']
    },
    ELEKTRONIK: {
        environments: [
            'clean desk setup with tech aesthetic',
            'home office with monitor glow and cable management',
            'modern living room with gadgets',
            'tech unboxing station with clean surface',
            'outdoor real-world tech usage scenario'
        ],
        actions: [
            'unboxing with careful product reveal',
            'powering on device for the first time',
            'demonstrating key feature in real use',
            'comparing device size with hand for scale',
            'real-world usage scenario showing benefit'
        ],
        sensory: [
            'LED screen glow and reflections',
            'satisfying click or button press implied',
            'sleek metallic or matte surface texture',
            'cable management and clean tech aesthetic',
            'tech interface and UI close-up'
        ],
        requiredElements: ['unboxing or reveal', 'feature demo', 'usage'],
        voiceStyle: 'analytical, tech-savvy, excited — focus on specs, features, user experience',
        productInteraction: 'unboxing, setting up, operating the electronic device',
        negativeContext: ['kitchen cooking', 'bathroom', 'fashion runway', 'food preparation']
    }
};

export function getCategoryData(categoryKey) {
    const data = CATEGORY_RULES[categoryKey];
    if (!data) {
        throw new Error(`Unsupported category: ${categoryKey}. Available: ${Object.keys(CATEGORY_RULES).join(', ')}`);
    }
    return data;
}

export function pickCategoryEnvironment(categoryData) {
    return categoryData.environments[Math.floor(Math.random() * categoryData.environments.length)];
}

export function pickCategoryAction(categoryData) {
    return categoryData.actions[Math.floor(Math.random() * categoryData.actions.length)];
}

export function pickCategorySensory(categoryData) {
    return categoryData.sensory[Math.floor(Math.random() * categoryData.sensory.length)];
}

export function getCategoryNegativeContext(categoryData) {
    return categoryData.negativeContext.join(', ');
}

export function validateCategoryOutput(scenes, categoryKey) {
    const categoryData = CATEGORY_RULES[categoryKey];
    if (!categoryData) {
        return { valid: false, missing: ['unknown category'], message: `Category validation failed: unknown category "${categoryKey}"` };
    }

    const allText = scenes
        .map(s => `${s.description || ''} ${s.voSnippet || ''}`)
        .join(' ')
        .toLowerCase();

    const validationMap = {
        MAKANAN: [
            { keyword: /cook|masak|goreng|rebus|tumis|prepar|fry|boil|grill|saut|stir|bake|roast|simmer|heat/i, label: 'cooking process' },
            { keyword: /dish|hidang|sajian|piring|plate|food|makanan|final|result|served/i, label: 'final dish' },
            { keyword: /eat|makan|bite|gigit|kunyah|chew|taste|reaction|icip|coba|try|enjoy/i, label: 'eating reaction' }
        ],
        MINUMAN: [
            { keyword: /drink|minum|sip|seru|gulp|teguk|pour|tuang|open|buka|bottle|botol/i, label: 'drinking interaction' },
            { keyword: /refresh|segar|relief|lega|cool|dingin|thirst|haus|react|ekspresi|satisfied/i, label: 'refresh reaction' }
        ],
        SKINCARE: [
            { keyword: /apply|aplik|oles|spread|blend|rata|usap|put on|use|pakai/i, label: 'application' },
            { keyword: /skin|kulit|texture|tekst|glow|cerah|surface|permukaan/i, label: 'skin texture' },
            { keyword: /result|hasil|before|after|sebelum|sesudah|change|perubahan|effect|efek/i, label: 'result' }
        ],
        FASHION: [
            { keyword: /outfit|pakaian|wear|pakai|dress|baju|look|tampil|style|gaya|fashion/i, label: 'outfit showcase' },
            { keyword: /style|styling|aksesor|accessor|mix|match|padupad|combine/i, label: 'styling' },
            { keyword: /confiden|percaya|pose|walk|jalan|strut|show|tampil|proud|bangga/i, label: 'confidence' }
        ],
        ELEKTRONIK: [
            { keyword: /unbox|buka|reveal|bongkar|open|package|kemasan|box/i, label: 'unboxing or reveal' },
            { keyword: /demo|feature|fitur|show|tunjuk|function|fungsi|spec|spek|test|tes/i, label: 'feature demo' },
            { keyword: /use|pakai|operate|oper|real.?world|nyata|daily|sehari|scenario/i, label: 'usage' }
        ]
    };

    const rules = validationMap[categoryKey];
    if (!rules) return { valid: true, missing: [] };

    const missing = [];
    for (const rule of rules) {
        if (!rule.keyword.test(allText)) {
            missing.push(rule.label);
        }
    }

    if (missing.length > 0) {
        return {
            valid: false,
            missing,
            message: `Category validation failed for ${categoryKey}: missing [${missing.join(', ')}]`
        };
    }

    return { valid: true, missing: [] };
}

export function getAvailableCategories() {
    return Object.keys(CATEGORY_RULES);
}
