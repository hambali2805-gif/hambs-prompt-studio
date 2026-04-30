import { buildCharacterPrefix, buildProductReferencePhrase, buildReferenceControlBlock } from '../../../shared/referenceHandler.js?v=202604301437';
import { buildImagePromptBase, buildModeImageStyle, stripVideoOnlyTerms } from '../shared/imagePromptUtils.js?v=202604301437';
import { buildBananaNegative } from './bananaNegative.js?v=202604301437';

export function buildBananaImagePrompt(params) {
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
        platform: 'Banana Pro image'
    });
    const modeStyle = buildModeImageStyle(mode, 'banana_pro');
    const negative = buildBananaNegative(categoryData, state.customNegativePrompt);
    const blueprint = sceneBlueprint
        ? `Scene intent: ${sceneBlueprint.function}. Visual focus: ${sceneBlueprint.visualFocus}. Must include: ${sceneBlueprint.mustInclude.join(', ')}.`
        : '';
    const realism = mode === 'ugc'
        ? `Realism level ${engineConfig.realism}/100, slight natural imperfection allowed.`
        : 'Premium commercial finish, controlled composition, polished but realistic.';

    return buildImagePromptBase([
        `BANANA PRO IMAGE PROMPT: single still image only.`,
        referenceBlock,
        `${charPrefix}${cleanScene}.`,
        blueprint,
        `Product reference: ${productRef}. Product name: ${state.productName}${sensoryDetail}.`,
        `Image style: ${modeStyle}.`,
        lensPrompt,
        voSnippet ? `Emotional context from VO: "${voSnippet}".` : '',
        realism,
        `No motion instructions. --no ${negative}`
    ]);
}
