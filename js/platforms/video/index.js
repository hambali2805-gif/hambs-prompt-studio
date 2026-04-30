import { buildVeoPrompt } from './veo/prompt.js?v=202604301651';
import { buildSeedancePrompt } from './seedance/prompt.js?v=202604301651';
export function buildVideoPromptByPlatform(ctx,scene,index){return (ctx.videoModel==='seedance'?buildSeedancePrompt:buildVeoPrompt)(ctx,scene,index);}
