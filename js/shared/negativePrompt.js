function arr(v){ return Array.isArray(v) ? v : (v ? [v] : []); }

export function buildNegativePrompt(context){
 const base=['watermark','logo hallucination','unreadable fake text','extra fingers','deformed hands','distorted face','duplicate product','floating product','wrong scale'];
 const typeNeg=arr(context.rules?.negatives || context.rules?.avoid);
 const custom=context.customNegativePrompt?[context.customNegativePrompt]:[];
 const modeNeg=context.mode==='ugc'
  ? ['overly polished studio commercial look','unnatural acting','high-fashion pose unrelated to product']
  : ['messy framing','unclear product','accidental clutter','weak product hero shot'];
 const platformNeg=arr(context.platformProfile?.avoid);
 const imageNeg=arr(context.imageEngineProfile?.negativeRules);
 const videoNeg=arr(context.videoEngineProfile?.negativeRules);
 const categoryNeg=[];
 const cat=String(context.category||'').toUpperCase();
 const type=String(context.productType||'').toLowerCase();

 if(context.parentType==='food' || cat.includes('MAKANAN') || type.includes('noodle')){
   categoryNeg.push('weird food texture','unrealistic noodles','floating ingredients','melted packaging','raw fashion scene','skincare before-after framing');
 }
 if(cat.includes('MINUMAN')) categoryNeg.push('unnatural liquid physics','floating cup','wrong drink texture');
 if(cat.includes('SKINCARE')) categoryNeg.push('medical claim text','unrealistic skin texture','fake clinical result','unsafe before-after claim');
 if(cat.includes('ELEKTRONIK')) categoryNeg.push('fake UI text','wrong ports','warped device screen','invented specs');

 return [...new Set([...base,...typeNeg,...modeNeg,...platformNeg,...imageNeg,...videoNeg,...categoryNeg,...custom])]
  .filter(Boolean).join(', ');
}
