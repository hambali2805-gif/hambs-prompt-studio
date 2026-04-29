export function buildNegativePrompt(context){
 const base=['watermark','logo hallucination','unreadable fake text','extra fingers','deformed hands','distorted face','duplicate product','floating product','wrong scale'];
 const typeNeg=context.rules.negatives||context.rules.avoid||[];
 const custom=context.customNegativePrompt?[context.customNegativePrompt]:[];
 return [...new Set([...base,...typeNeg,...custom])].filter(Boolean).join(', ');
}
