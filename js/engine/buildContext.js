import { state } from '../state.js';
import { engineConfig } from '../config.js';
import { detectProductType } from '../intelligence/productTypeDetector.js';
import { inferPresentationType, getPresentationProfile } from '../intelligence/presentationProfiles.js';
import { normalizeVideoStyle, getVideoStyleProfile } from '../intelligence/videoStyleProfiles.js';
import { getPersonaProfile } from '../intelligence/personaProfiles.js';
import { getSpeechStyleProfile } from '../intelligence/speechStyleProfiles.js';
import { adaptBackgroundForContext } from '../intelligence/backgroundCompatibility.js';
import { getGenderSubject } from '../shared/subjectUtils.js';
import { buildReferenceDirectives } from '../shared/referenceHandler.js';
import { buildNegativePrompt } from '../shared/negativePrompt.js';

export function buildContext(){
 const mode=state.contentStyle==='UGC'?'ugc':'ads';
 const info={name:state.productName||'Produk',desc:state.productDescription||'',category:state.selectedCategory||'FASHION'};
 const product=detectProductType({category:info.category,name:info.name,description:info.desc});
 const presentationType=state.presentationType || inferPresentationType(`${state.presentationKeywords||''}`);
 const presentation=getPresentationProfile(presentationType);
 const videoStyleKey=normalizeVideoStyle(state.selectedStyle||'LIFESTYLE');
 const videoStyle=getVideoStyleProfile(videoStyleKey);
 const personaKey=engineConfig.persona||'best_friend';
 const speechKey=state.selectedTone||'jaksel';
 const gender=getGenderSubject();
 const base={
   engine:'v5-clean-engine', mode, totalScenes:mode==='ugc'?5:10,
   productName:info.name, productDescription:info.desc, requestedCategory:product.requestedCategory, category:product.category, categoryOverridden:product.categoryOverridden, categoryOverrideReason:product.categoryOverrideReason,
   productType:product.productType, productTypeLabel:product.label, parentType:product.parentType, subtype:product.subtype,
   productConfidence:product.confidence, productEvidence:product.evidence, rules:product.rules,
   presentationType, presentation, videoStyleKey, videoStyle,
   imageModel:state.selectedImageModel||engineConfig.imagePlatform||'banana_pro', videoModel:state.selectedVideoModel||engineConfig.platform||'veo',
   personaKey, persona:getPersonaProfile(personaKey), speechKey, speech:getSpeechStyleProfile(speechKey,mode), energy:engineConfig.energy||'medium', realism:engineConfig.realism||70,
   language:state.selectedLang||'ID', lensStyle:state.lensStyle||'portrait', customNegativePrompt:state.customNegativePrompt||'',
   references:{hasCharacter:!!state.uploadedFiles?.char, hasProduct:!!(state.uploadedFiles?.prod||[]).some(Boolean)},
   gender, rawBackground:state.ugcBackground||''
 };
 base.background=adaptBackgroundForContext(base, state.ugcBackground||'');
 base.referenceDirectives=buildReferenceDirectives(base);
 base.negativePrompt=buildNegativePrompt(base);
 return base;
}
