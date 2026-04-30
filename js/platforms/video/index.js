import { buildVeoPrompt } from './veo/prompt.js?v=202604300848';
import { buildSeedancePrompt } from './seedance/prompt.js?v=202604300848';
export function buildVideoPromptByPlatform(ctx,scene,index){return (ctx.videoModel==='seedance'?buildSeedancePrompt:buildVeoPrompt)(ctx,scene,index);}
