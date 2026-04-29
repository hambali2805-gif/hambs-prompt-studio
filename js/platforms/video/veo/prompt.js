export function buildVeoPrompt(ctx,scene,index){
 const style=ctx.mode==='ugc'?'creator-realistic but visually coherent':'cinematic commercial';
 return `Veo video prompt, ${style}. Scene ${index+1}/${ctx.totalScenes}: ${scene.title}. ${scene.description} Camera: ${ctx.videoStyle.camera}; pace: ${ctx.videoStyle.pace}; lighting: ${ctx.videoStyle.visual}. Keep continuity of ${ctx.gender.subj} and ${ctx.productName}. Product type: ${ctx.productTypeLabel}; visible proof must include ${(scene.mustInclude||ctx.rules.actions).join(', ')}. Motion should be natural, with clear beginning-middle-end. Background: ${ctx.background.directive}. Avoid: ${ctx.negativePrompt}. No fake claims, no extra limbs, no product redesign.`;
}
