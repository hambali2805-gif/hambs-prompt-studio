import { buildImagePromptByPlatform } from '../platforms/image/index.js';
import { buildVideoPromptByPlatform } from '../platforms/video/index.js';
import { validateSceneSet } from '../shared/validationUtils.js';

export function buildOutputPack(plan, ctx){
 const sceneVOs=plan.scenes.map((s,i)=>({scene:`Scene ${i+1}: ${s.title}`,phase:s.phase,vo:s.vo,duration:s.duration,emotion:s.emotion,imperfections:ctx.mode==='ugc'?ugcImperfections(ctx,i):[],meaning:s.meaning}));
 const shots=plan.scenes.map((s,i)=>{
   const imagePrompt=buildImagePromptByPlatform(ctx,s,i);
   const videoPrompt=buildVideoPromptByPlatform(ctx,s,i);
   return {number:i+1,title:s.title,arcPhase:s.phase,description:s.description,imagePrompt,videoPrompt,voSnippet:s.vo,imperfections:sceneVOs[i].imperfections,sceneVO:sceneVOs[i]};
 });
 const validation=validateSceneSet(ctx,shots);
 const vo=sceneVOs.map((sv,i)=>`(Scene ${i+1} - ${sv.phase}) ${sv.vo}`).join('\n');
 const structured={voiceover:vo,scenes:shots.map((shot,i)=>({shot:shot.title,scene:sceneVOs[i].scene,vo:sceneVOs[i].vo,duration:sceneVOs[i].duration,phase:sceneVOs[i].phase,emotion:sceneVOs[i].emotion,imperfections:sceneVOs[i].imperfections,imagePlatform:ctx.imageModel,videoPlatform:ctx.videoModel,visual_prompt:shot.imagePrompt,motion:shot.videoPrompt,purpose:shot.arcPhase,meaning:sceneVOs[i].meaning})),config:{mode:ctx.mode,imagePlatform:ctx.imageModel,platform:ctx.videoModel,persona:ctx.personaKey,energy:ctx.energy,realism:ctx.realism,category:ctx.category,productType:ctx.productType,subtype:ctx.subtype,presentationType:ctx.presentationType,videoStyle:ctx.videoStyleKey},meta:{product:ctx.productName,category:ctx.category,productTypeLabel:ctx.productTypeLabel,productTypeConfidence:ctx.productConfidence,engine:'v5-clean-engine',planSource:plan.source,fallbackReason:plan.fallbackReason||'',rawGeminiPreview:plan.rawGeminiPreview||'',generatedAt:new Date().toISOString(),backgroundCompatibility:ctx.background}};
 return {vo,shots,sceneVOs,structured,validation,debugContext:ctx};
}
function ugcImperfections(ctx,i){ const pool=['tiny hand-held shake','natural micro pause','small breathing movement','real room ambience','minor reframing']; return ctx.realism>50?[pool[i%pool.length]]:[]; }
