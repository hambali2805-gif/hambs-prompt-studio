import { state } from '../state.js?v=202604300940';
import { engineConfig } from '../config.js?v=202604300940';
import { detectProductType } from '../intelligence/productTypeDetector.js?v=202604300940';
import { inferPresentationType, getPresentationProfile } from '../intelligence/presentationProfiles.js?v=202604300940';
import { normalizeVideoStyle, getVideoStyleProfile } from '../intelligence/videoStyleProfiles.js?v=202604300940';
import { getPersonaProfile } from '../intelligence/personaProfiles.js?v=202604300940';
import { getSpeechStyleProfile } from '../intelligence/speechStyleProfiles.js?v=202604300940';
import { adaptBackgroundForContext } from '../intelligence/backgroundCompatibility.js?v=202604300940';
import { getPlatformProfile, normalizeTargetPlatform } from '../intelligence/platformProfiles.js?v=202604300940';
import { getImageEngineProfile, getVideoEngineProfile } from '../intelligence/engineProfiles.js?v=202604300940';
import { buildCreativeBrief } from './buildCreativeBrief.js?v=202604300940';
import { buildReferenceControl } from './buildReferenceControl.js?v=202604300940';
import { getGenderSubject } from '../shared/subjectUtils.js?v=202604300940';
import { buildReferenceDirectives } from '../shared/referenceHandler.js?v=202604300940';
import { buildNegativePrompt } from '../shared/negativePrompt.js?v=202604300940';

function resolveSceneCount(mode, duration = '15s', sceneCount = 'auto') {
  const explicit = parseInt(sceneCount, 10);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  if (mode === 'ads') return 10;
  const d = String(duration || '').toLowerCase();
  if (d.includes('10')) return 3;
  if (d.includes('30')) return 7;
  return 5;
}

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
 const imageModel=state.selectedImageModel||engineConfig.imagePlatform||'banana_pro';
 const videoModel=state.selectedVideoModel||engineConfig.platform||'veo';
 const targetPlatform=normalizeTargetPlatform(state.targetPlatform||'multi_platform');
 const contentDuration=state.contentDuration||'15s';
 const sceneCount=state.sceneCount||'auto';

 const base={
   engine:'v5-clean-engine',
   mode,
   totalScenes:resolveSceneCount(mode, contentDuration, sceneCount),
   productName:info.name,
   productDescription:info.desc,
   requestedCategory:product.requestedCategory,
   category:product.category,
   categoryOverridden:product.categoryOverridden,
   categoryOverrideReason:product.categoryOverrideReason,
   productType:product.productType,
   productTypeLabel:product.label,
   parentType:product.parentType,
   subtype:product.subtype,
   productConfidence:product.confidence,
   productEvidence:product.evidence,
   rules:product.rules,
   presentationType,
   presentation,
   videoStyleKey,
   videoStyle,
   imageModel,
   videoModel,
   targetPlatform,
   platformProfile:getPlatformProfile(targetPlatform),
   imageEngineProfile:getImageEngineProfile(imageModel),
   videoEngineProfile:getVideoEngineProfile(videoModel),
   contentGoal:state.contentGoal || (mode==='ugc'?'viral_relatable':'conversion'),
   targetAudience:state.targetAudience || '',
   contentDuration,
   sceneCount,
   hookType:state.hookType || 'auto',
   ctaType:state.ctaType || (mode==='ugc'?'soft_recommendation':'marketplace_cta'),
   productVisibility:state.productVisibility || (mode==='ugc'?'balanced':'strong'),
   cameraStyle:state.cameraStyle || '',
   mainBenefit:state.mainBenefit || '',
   painPoint:state.painPoint || '',
   usageMoment:state.usageMoment || '',
   offer:state.offer || '',
   claimSafety:state.claimSafety || 'safe_general',
   personaKey,
   persona:getPersonaProfile(personaKey),
   speechKey,
   speech:getSpeechStyleProfile(speechKey,mode),
   energy:engineConfig.energy||'medium',
   realism:engineConfig.realism||70,
   language:state.selectedLang||'ID',
   lensStyle:state.lensStyle||'portrait',
   customNegativePrompt:state.customNegativePrompt||'',
   references:{hasCharacter:!!state.uploadedFiles?.char, hasProduct:!!(state.uploadedFiles?.prod||[]).some(Boolean)},
   gender,
   rawBackground:state.ugcBackground||''
 };
 base.background=adaptBackgroundForContext(base, state.ugcBackground||'');
 base.referenceDirectives=buildReferenceDirectives(base);
 base.referenceControl=buildReferenceControl(base, state);
 if (base.referenceControl?.characterControl?.subjectPhrase && base.referenceControl.characterControl.mode !== 'auto') {
   base.gender = { ...base.gender, subj: base.referenceControl.characterControl.subjectPhrase };
 }
 if (base.referenceControl?.backgroundControl?.description) {
   base.background = {
     ...base.background,
     directive: base.referenceControl.backgroundControl.description,
     continuityRule: base.referenceControl.backgroundControl.continuityRule
   };
 }
 base.negativePrompt=buildNegativePrompt(base);
 base.creativeBrief=buildCreativeBrief(base);
 return base;
}
