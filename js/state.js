// ==================== APPLICATION STATE ====================
export const state = {
    mode: 'ugc',                    // 'ugc' | 'ads'
    selectedCategory: 'FASHION',
    selectedLang: 'ID',
    selectedTone: 'jaksel',
    selectedVideoModel: 'veo',

    // Character
    charPersona: '',
    charStyle: 'casual',
    charImage: null,                // { preview: base64 }

    // Products (role system)
    products: [
        { name: '', description: '', role: 'primary' }
    ],

    // Content settings
    durationTarget: 30,
    contentStyle: 'lifestyle',      // lifestyle | demo | review
    platform: '',                   // '' | tiktok | instagram | youtube

    // API
    apiKey: '',

    // Generated
    generatedData: null
};

export function updateState(partial) {
    Object.assign(state, partial);
}
