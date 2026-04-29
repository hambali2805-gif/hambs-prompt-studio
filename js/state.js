// ==================== APPLICATION STATE ====================
export const state = {
    currentStep: -1,
    contentStyle: 'IKLAN',
    uploadedFiles: { char: null, prod: [null, null, null, null] },
    selectedCategory: 'FASHION',
    selectedStyle: 'LIFESTYLE',
    selectedLang: 'ID',
    productName: 'Indomie Goreng',
    productDescription: '',
    ugcBackground: 'Scandinavian-Japanese fusion, beige limewash wall, light oak wood slats, pampas grass in ceramic vase, linen textures, clean space.',
    presentationKeywords: 'Direct eye contact, framing: medium close-up, hand gestures, expressive facial expressions, talking to camera, FaceTime-style framing.',
    selectedTone: 'jaksel',
    lensStyle: 'portrait',
    selectedVideoModel: 'veo',
    selectedImageModel: 'banana_pro',
    customNegativePrompt: '',
    apiKey: '',
    generatedData: null,
    currentProjectName: ''
};

export function updateState(partial) {
    Object.assign(state, partial);
}
