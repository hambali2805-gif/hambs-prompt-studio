import { buildVeoPrompt } from './veo/prompt.js?v=202604301007';
import { buildSeedancePrompt } from './seedance/prompt.js?v=202604301007';
export function buildVideoPromptByPlatform(ctx,scene,index){return (ctx.videoModel==='seedance'?buildSeedancePrompt:buildVeoPrompt)(ctx,scene,index);}
