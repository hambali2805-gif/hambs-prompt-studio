import { buildVeoPrompt } from './veo/prompt.js?v=202604301437';
import { buildSeedancePrompt } from './seedance/prompt.js?v=202604301437';
export function buildVideoPromptByPlatform(ctx,scene,index){return (ctx.videoModel==='seedance'?buildSeedancePrompt:buildVeoPrompt)(ctx,scene,index);}
