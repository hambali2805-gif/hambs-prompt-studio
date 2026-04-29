function scoreText(text, keywords=[]){const t=String(text||'').toLowerCase(); return keywords.filter(k=>t.includes(String(k).toLowerCase())).length;}
export function validateSceneSet(context, scenes){
 const combined=scenes.map(s=>`${s.description} ${s.imagePrompt} ${s.videoPrompt} ${s.voSnippet}`).join(' ').toLowerCase();
 const warnings=[];
 const parent=context.parentType;
 const checks={footwear:['shoe','sepatu','foot','kaki','sole','sol','lace','tali','walk','step','jog'],skincare:['skin','kulit','apply','wajah','texture','mirror','blend'],food:['bite','makan','texture','aroma','steam','serve','suap'],drink:['sip','drink','minum','pour','ice','bottle','gelas'],electronics:['device','screen','button','port','charging','tap','unbox'],clothing:['fabric','bahan','fit','outfit','mirror','wear'],bag:['zipper','compartment','bag','tas','strap'],accessory:['wrist','strap','dial','detail']};
 const needed=checks[parent]||[]; const hit=scoreText(combined,needed);
 if(needed.length && hit<3) warnings.push(`Product-type signal weak for ${parent}; add more physical proof.`);
 if(context.mode==='ugc' && /luxury commercial|perfect studio|brand manifesto/.test(combined)) warnings.push('UGC may be too polished; add more natural creator realism.');
 if(context.mode==='ads' && /bestie|gue|lo|literally/.test(combined)) warnings.push('Ads voice may be too slang; keep brand-safe tone.');
 return {valid:warnings.length===0,warnings};
}
