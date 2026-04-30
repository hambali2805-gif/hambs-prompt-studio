function list(v){ return Array.isArray(v) ? v.filter(Boolean).join(', ') : String(v || ''); }

function phaseGuard(scene){
 const phase=String(scene.phase||'').toLowerCase();
 if(phase.includes('hook')) return 'Do not jump into later demo steps; keep this as a hook/setup action only.';
 if(phase.includes('pain')||phase.includes('problem')) return 'Introduce need/product without completing the main demo yet.';
 if(phase.includes('demo')) return 'Show one physical product-use step clearly from start to finish.';
 if(phase.includes('proof')) return 'Show visible/sensory proof and a natural human reaction.';
 if(phase.includes('cta')) return 'Close with result/reaction/product memory; do not restart earlier prep steps.';
 return 'Keep action matched to the scene purpose.';
}

export function buildSeedancePrompt(ctx,scene,index){
 const engine=ctx.videoEngineProfile || {};
 return [
  `Seedance 2.0 motion prompt. Platform: ${ctx.platformProfile?.label || 'social vertical video'}. Scene ${index+1}/${ctx.totalScenes}: ${scene.title}.`,
  `Core visual: ${scene.visualSummary || scene.description}.`,
  `ONE MAIN ACTION ONLY: ${scene.mainAction}.`,
  `Motion mechanics: start with ${scene.mainAction}, show believable hand/body movement, natural micro-pauses, and finish the action without teleporting the product.`,
  `Phase guard: ${phaseGuard(scene)}`,
  `Camera/framing: ${scene.cameraDirection || ctx.platformProfile?.camera || ctx.videoStyle.camera}. Pacing: ${ctx.platformProfile?.pacing || ctx.videoStyle.pace}.`,
  `Continuity: ${scene.continuity}. Same subject, same product scale, same product identity, no sudden location/object jump.`,
  `Mode separation: ${ctx.mode==='ugc'?'phone-camera UGC realism, imperfect timing, natural micro-pauses':'controlled ad motion, clean transitions, premium product choreography'}.`,
  `Engine rules: ${list(engine.promptRules)}.`,
  `Presentation: ${ctx.presentation.label}; motion rules: ${list(ctx.presentation.motionRules)}.`,
  `Product reference focus: ${list(ctx.rules.referenceFocus)}. Must include: ${list(scene.mustInclude)}.`,
  `Negative: ${ctx.negativePrompt}. ${list(engine.negativeRules)}.`
 ].join(' ');
}
