import { PRODUCT_TYPE_RULES, normalizeCategory, getDefaultTypeForCategory, getRulesForType } from './productTypeRules.js';
const norm=t=>String(t||'').toLowerCase().normalize('NFKD');
function score(hay, kw){ const k=norm(kw).trim(); if(!k) return 0; return hay.includes(k) ? (k.includes(' ')?3:2) : 0; }
export function detectProductType({category,name='',description=''}){
  const cat=normalizeCategory(category); const set=PRODUCT_TYPE_RULES[cat]; const n=norm(name); const d=norm(description);
  let best=getDefaultTypeForCategory(cat), bestScore=0, evidence=[];
  Object.entries(set).forEach(([key,rule])=>{
    let s=0, ev=[];
    (rule.keywords||[]).forEach(kw=>{ const v=score(n,kw)*2 + score(d,kw); if(v){s+=v; ev.push(kw);} });
    if(s>bestScore){ bestScore=s; best=key; evidence=ev; }
  });
  const rules=getRulesForType(cat,best);
  const confidence=Number(Math.max(0.28,Math.min(0.98,bestScore?0.48+bestScore/18:0.34)).toFixed(2));
  return {category:cat,productType:best,parentType:rules.parentType,subtype:best,label:rules.label,confidence,evidence:[...new Set(evidence)].slice(0,6),rules};
}
