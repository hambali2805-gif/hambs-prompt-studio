export function buildBananaProPrompt(ctx,scene,index){
 const mode=ctx.mode==='ugc'?'authentic UGC still frame':'premium advertising still frame';
 return [
  `${mode}, ${scene.description}`,
  `Product: ${ctx.productName}, type: ${ctx.productTypeLabel}. Preserve: ${(ctx.rules.referenceFocus||[]).join(', ')}.`,
  `Composition: clear product visibility, human interaction, ${ctx.videoStyle.visual}, lens style ${ctx.lensStyle}.`,
  `Must include: ${(scene.mustInclude||[]).join(', ')}.`,
  `Background: ${ctx.background.directive}.`,
  `Reference rules: ${ctx.referenceDirectives.summary}`,
  `Negative: ${ctx.negativePrompt}.`
 ].join(' ');
}
