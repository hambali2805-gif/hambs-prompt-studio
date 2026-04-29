export function buildGptImagePrompt(ctx,scene,index){
 const voice=ctx.mode==='ugc'?'a believable creator-made social image':'a polished brand-safe campaign image';
 return `Create ${voice} for ${ctx.productName}. Scene ${index+1}: ${scene.title}. ${scene.description} The image must feel human and specific to ${ctx.productTypeLabel}, not generic stock photography. Show the product being used through ${ctx.presentation.label}: ${ctx.presentation.purpose}. Preserve product reference details: ${(ctx.rules.referenceFocus||[]).join(', ')}. Character/reference instruction: ${ctx.referenceDirectives.summary}. Visual style: ${ctx.videoStyle.visual}. Background adaptation: ${ctx.background.directive}. Avoid: ${[...(scene.avoid||[]),ctx.negativePrompt].join(', ')}.`;
}
