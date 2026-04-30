function list(v){ return Array.isArray(v) ? v.filter(Boolean).join(', ') : String(v || ''); }

export function buildGptImagePrompt(ctx,scene,index){
 const voice=ctx.mode==='ugc'?'a believable creator-made social image':'a polished brand-safe campaign image';
 const engine=ctx.imageEngineProfile || {};
 return [
  `Create ${voice} for ${ctx.platformProfile?.label || 'social platform'} using ${engine.label || 'GPT Image'}.`,
  `Scene ${index+1}/${ctx.totalScenes}: ${scene.title} (${scene.phase}).`,
  `Visual summary: ${scene.visualSummary || scene.description}`,
  `Main still moment: ${scene.mainAction}. Emotion: ${scene.emotion}.`,
  `Camera/framing: ${scene.cameraDirection || ctx.platformProfile?.camera || ctx.videoStyle.camera}.`,
  `The image must feel human and specific to ${ctx.productTypeLabel}, not generic stock photography.`,
  `Product: ${ctx.productName}; visibility: ${ctx.productVisibility}; preserve reference details: ${list(ctx.rules.referenceFocus)}.`,
  `Image engine rules: ${list(engine.promptRules)}.`,
  `Character/reference instruction: ${ctx.referenceDirectives.summary}.`,
  `Character anchor: ${ctx.referenceControl?.characterAnchor || 'keep character continuity if present'}.`,
  `Background anchor: ${ctx.referenceControl?.backgroundAnchor || 'keep background continuity'}.`,
  `Product references for this scene: ${ctx.referenceControl?.sceneBlocks?.[String(index+1)] || 'auto product reference continuity'}.`,
  `Background adaptation: ${ctx.background.directive}. Continuity: ${scene.continuity}.`,
  `Avoid: ${list([...(scene.avoid||[]), ...(engine.negativeRules||[]), ctx.negativePrompt])}.`
 ].join(' ');
}
