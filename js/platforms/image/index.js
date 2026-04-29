import { buildBananaProPrompt } from './bananaPro/prompt.js';
import { buildGptImagePrompt } from './gptImage/prompt.js';
export function buildImagePromptByPlatform(ctx,scene,index){return (ctx.imageModel==='gpt_image'?buildGptImagePrompt:buildBananaProPrompt)(ctx,scene,index);}
