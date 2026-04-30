import { buildCharacterPrefix, buildProductReferencePhrase, buildReferenceControlBlock } from '../../../shared/referenceHandler.js?v=202604300959';
import { buildImagePromptBase, buildModeImageStyle, stripVideoOnlyTerms } from '../shared/imagePromptUtils.js?v=202604300959';
import { buildGPTImageNegative } from './gptImageNegative.js?v=202604300959';

export function buildGPTImagePrompt(params) {
    const {
        sceneDesc, voSnippet, mode, categoryData, state, engineConfig, gender,
        lensPrompt = '', sensoryDetail = '', sceneBlueprint = null
    } = params;

    const cleanScene = stripVideoOnlyTerms(sceneDesc);
    const charPrefix = buildCharacterPrefix({ uploadedFiles: state.uploadedFiles, gender, sceneDesc: cleanScene, mode });
    const productRef = buildProductReferencePhrase({
        uploadedFiles: state.uploadedFiles,
        productName: state.productName,
        category: state.selectedCategory,
        mode
    });
    const referenceBlock = buildReferenceControlBlock({
        uploadedFiles: state.uploadedFiles,
        gender,
        productName: state.productName,
        category: state.selectedCategory,
        mode,
        platform: 'GPT Image'
    });
    const modeStyle = buildModeImageStyle(mode, 'gpt_image');
    const negative = buildGPTImageNegative(categoryData, state.customNegativePrompt);
    const blueprint = sceneBlueprint
        ? `Narrative intent: ${sceneBlueprint.function}. Human message: ${sceneBlueprint.message}. Visual focus: ${sceneBlueprint.visualFocus}. Required visual details: ${sceneBlueprint.mustInclude.join(', ')}.`
        : '';
    const modeInstruction = mode === 'ugc'
        ? 'Create it as a believable creator-style photo: natural, slightly imperfect, relatable, captured like a real daily moment.'
        : 'Create it as a premium campaign still: polished, intentional, cinematic, product-forward, emotionally warm but not fake.';

    return buildImagePromptBase([
        `GPT IMAGE PROMPT: create one single still image, not a video, not a storyboard.`,
        referenceBlock,
        modeInstruction,
        `${charPrefix}${cleanScene}.`,
        blueprint,
        `Product handling: ${productRef}. Product name: ${state.productName}${sensoryDetail}.`,
        `Visual style: ${modeStyle}.`,
        lensPrompt,
        voSnippet ? `Use this VO as emotional context only, do not render text: "${voSnippet}".` : '',
        mode === 'ugc' ? `Realism ${engineConfig.realism}/100: keep it human and not overproduced.` : 'High-end commercial clarity with realistic texture and lighting.',
        `No text overlay, no watermark, no fake labels. Negative: ${negative}.`
    ]);
}
