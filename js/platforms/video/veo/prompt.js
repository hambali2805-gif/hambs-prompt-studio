function list(v){ return Array.isArray(v) ? v.filter(Boolean).join(', ') : String(v || ''); }

export function buildVeoPrompt(ctx,scene,index){
 const style=ctx.mode==='ugc'?'creator-realistic but visually coherent':'cinematic commercial';
 const engine=ctx.videoEngineProfile || {};
 return [
  `Veo video prompt, ${style}. Platform: ${ctx.platformProfile?.label || 'vertical social video'}. Scene ${index+1}/${ctx.totalScenes}: ${scene.title} (${scene.phase}).`,
  `Visual summary: ${scene.visualSummary || scene.description}.`,
  `Main action: ${scene.mainAction}. Build a clear beginning-middle-end around this single action.`,
  `Camera direction: ${scene.cameraDirection || ctx.platformProfile?.camera || ctx.videoStyle.camera}; lens style: ${ctx.lensStyle}; camera profile: ${ctx.cameraStyle || 'auto'}.`,
  `Lighting/visual: ${ctx.platformProfile?.visual || ctx.videoStyle.visual}. Pace: ${ctx.platformProfile?.pacing || ctx.videoStyle.pace}.`,
  `Veo engine rules: ${list(engine.promptRules)}.`,
  `Keep continuity of ${ctx.gender.subj}, ${ctx.productName}, packaging, scale, background, and action logic. ${scene.continuity}.`,
  `Product type: ${ctx.productTypeLabel}; visible proof must include ${list(scene.mustInclude)}.`,
  `Background: ${ctx.background.directive}. Product visibility: ${ctx.productVisibility}.`,
  `Avoid: ${ctx.negativePrompt}. ${list(engine.negativeRules)}. No fake claims, no extra limbs, no product redesign.`
 ].join(' ');
}
