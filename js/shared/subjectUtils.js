export function getGenderSubject(){
 const g=document.getElementById('charGender')?.value || 'wanita';
 return g==='pria'?{subj:'A young Indonesian man',pronoun:'he',possessive:'his'}:{subj:'A young Indonesian woman',pronoun:'she',possessive:'her'};
}
export function hasHumanSubject(text=''){return /\b(man|woman|person|creator|talent|model|girl|boy|he|she|orang|wanita|pria|creator)\b/i.test(text);}
export function ensureSubject(text, subject){return hasHumanSubject(text)?text:`${subject}, ${text}`;}
export function cleanJoin(parts, sep=', '){return parts.filter(Boolean).map(x=>String(x).trim()).filter(Boolean).join(sep).replace(/\s+/g,' ').trim();}
