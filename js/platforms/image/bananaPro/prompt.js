function list(v){ return Array.isArray(v) ? v.filter(Boolean).join(', ') : String(v || ''); }

export function buildBananaProPrompt(ctx,scene,index){
 const mode=ctx.mode==='ugc'?'authentic UGC still frame':'premium advertising still frame';
 const engine=ctx.imageEngineProfile || {};
 return [
  `${mode}, vertical social image for ${ctx.platformProfile?.label || 'social platform'}. Scene ${index+1}/${ctx.totalScenes}: ${scene.title}.`,
  `Visual summary: ${scene.visualSummary || scene.description}`,
  `Main still action: ${scene.mainAction}. Freeze the clearest moment; no video or motion instruction.`,
  `Product: ${ctx.productName}, type: ${ctx.productTypeLabel}. Product visibility: ${ctx.referenceControl?.sceneProductMap?.[String(index+1)]?.visibility || ctx.productVisibility}. Preserve: ${list(ctx.rules.referenceFocus)}.`,
  `Banana Pro role: ${engine.role || 'reference-accurate product still'}. Rules: ${list(engine.promptRules)}.`,
  `Composition: ${ctx.platformProfile?.visual || ctx.videoStyle.visual}; camera/lens: ${ctx.cameraStyle || ctx.lensStyle}; clear product visibility, human interaction, authentic but tidy.`,
  `Must include: ${list(scene.mustInclude)}.`,
  `Continuity: ${scene.continuity}.`,
  `Background: ${ctx.background.directive}.`,
  `Reference rules: ${ctx.referenceDirectives.summary}`,
  `Character anchor: ${ctx.referenceControl?.characterAnchor || 'keep character continuity if present'}.`,
  `Background anchor: ${ctx.referenceControl?.backgroundAnchor || 'keep background continuity'}.`,
  `Product references for this scene: ${ctx.referenceControl?.sceneBlocks?.[String(index+1)] || 'auto product reference continuity'}.`,
  `Negative: ${ctx.negativePrompt}.`
 ].join(' ');
}
