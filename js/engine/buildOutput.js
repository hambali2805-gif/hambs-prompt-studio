import { buildImagePromptByPlatform } from '../platforms/image/index.js?v=202604301007';
import { buildVideoPromptByPlatform } from '../platforms/video/index.js?v=202604301007';
import { validateSceneSet } from '../shared/validationUtils.js?v=202604301007';

export function buildOutputPack(plan, ctx){
 const sceneVOs=plan.scenes.map((s,i)=>({
   scene:`Scene ${i+1}: ${s.title}`,
   phase:s.phase,
   vo:s.vo,
   duration:s.duration,
   emotion:s.emotion,
   imperfections:ctx.mode==='ugc'?ugcImperfections(ctx,i):[],
   meaning:s.meaning,
   mainAction:s.mainAction,
   cameraDirection:s.cameraDirection,
   continuity:s.continuity
 }));

 const shots=plan.scenes.map((s,i)=>{
   const imagePrompt=buildImagePromptByPlatform(ctx,s,i);
   const videoPrompt=buildVideoPromptByPlatform(ctx,s,i);
   return {
     number:i+1,
     title:s.title,
     arcPhase:s.phase,
     description:s.description,
     imagePrompt,
     videoPrompt,
     voSnippet:s.vo,
     imperfections:sceneVOs[i].imperfections,
     sceneVO:sceneVOs[i],
     mainAction:s.mainAction,
     cameraDirection:s.cameraDirection,
     continuity:s.continuity,
     productReferenceBlock:ctx.referenceControl?.sceneBlocks?.[String(i+1)] || ''
   };
 });

 const validation=validateSceneSet(ctx,shots);
 const vo=sceneVOs.map((sv,i)=>`(Scene ${i+1} - ${sv.phase}) ${sv.vo}`).join('\n');

 const structured={
   storyTitle: plan.storyTitle || '',
   contentHook: plan.contentHook || '',
   voiceover:vo,
   scenes:shots.map((shot,i)=>({
     shot:shot.title,
     scene:sceneVOs[i].scene,
     vo:sceneVOs[i].vo,
     duration:sceneVOs[i].duration,
     phase:sceneVOs[i].phase,
     emotion:sceneVOs[i].emotion,
     imperfections:sceneVOs[i].imperfections,
     mainAction:sceneVOs[i].mainAction,
     cameraDirection:sceneVOs[i].cameraDirection,
     continuity:sceneVOs[i].continuity,
     productReferenceBlock:sceneVOs[i].productReferenceBlock,
     imagePlatform:ctx.imageModel,
     videoPlatform:ctx.videoModel,
     visual_prompt:shot.imagePrompt,
     motion:shot.videoPrompt,
     purpose:shot.arcPhase,
     meaning:sceneVOs[i].meaning
   })),
   config:{
     mode:ctx.mode,
     targetPlatform:ctx.targetPlatform,
     platformLabel:ctx.platformProfile?.label,
     imagePlatform:ctx.imageModel,
     videoPlatform:ctx.videoModel,
     persona:ctx.personaKey,
     energy:ctx.energy,
     realism:ctx.realism,
     category:ctx.category,
     productType:ctx.productType,
     subtype:ctx.subtype,
     presentationType:ctx.presentationType,
     videoStyle:ctx.videoStyleKey,
     contentGoal:ctx.contentGoal,
     targetAudience:ctx.targetAudience,
     duration:ctx.contentDuration,
     hookType:ctx.hookType,
     ctaType:ctx.ctaType,
     productVisibility:ctx.productVisibility
   },
   meta:{
     product:ctx.productName,
     category:ctx.category,
     productTypeLabel:ctx.productTypeLabel,
     productTypeConfidence:ctx.productConfidence,
     engine:'v5-clean-engine',
     planSource:plan.source,
     fallbackReason:plan.fallbackReason||'',
     rawAiPreview:plan.rawAiPreview||plan.rawGeminiPreview||'',
     rawGeminiPreview:plan.rawGeminiPreview||plan.rawAiPreview||'',
     generatedAt:new Date().toISOString(),
     backgroundCompatibility:ctx.background,
     creativeBrief:ctx.creativeBrief,
     platformProfile:ctx.platformProfile,
     imageEngineProfile:ctx.imageEngineProfile,
     videoEngineProfile:ctx.videoEngineProfile,
     referenceControl:ctx.referenceControl
   }
 };

 return {vo,shots,sceneVOs,structured,validation,debugContext:ctx};
}

function ugcImperfections(ctx,i){
 const pool=['tiny hand-held shake','natural micro pause','small breathing movement','real room ambience','minor reframing'];
 return ctx.realism>50?[pool[i%pool.length]]:[];
}
