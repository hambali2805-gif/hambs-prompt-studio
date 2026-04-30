import { buildBananaProPrompt } from './bananaPro/prompt.js?v=202604300933';
import { buildGptImagePrompt } from './gptImage/prompt.js?v=202604300933';
export function buildImagePromptByPlatform(ctx,scene,index){return (ctx.imageModel==='gpt_image'?buildGptImagePrompt:buildBananaProPrompt)(ctx,scene,index);}
