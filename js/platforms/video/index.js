import { buildVeoPrompt } from './veo/prompt.js';
import { buildSeedancePrompt } from './seedance/prompt.js';
export function buildVideoPromptByPlatform(ctx,scene,index){return (ctx.videoModel==='seedance'?buildSeedancePrompt:buildVeoPrompt)(ctx,scene,index);}
