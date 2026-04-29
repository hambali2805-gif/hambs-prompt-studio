export const IMAGE_NEGATIVE_BASE = [
    'deformed hands', 'extra fingers', 'bad anatomy', 'distorted face', 'blurry', 'low quality',
    'watermark', 'text overlay', 'random logo', 'fake unreadable label', 'duplicate person',
    'floating product', 'oversaturated plastic skin'
];

export function buildImageNegativePrompt(categoryData, customNegativePrompt = '') {
    const categoryNeg = categoryData?.negativeContext || [];
    return [...IMAGE_NEGATIVE_BASE, ...categoryNeg, customNegativePrompt]
        .filter(Boolean)
        .join(', ');
}
