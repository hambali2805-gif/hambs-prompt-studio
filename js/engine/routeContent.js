import { stripMarkdownFences, compact } from '../shared/textCleaner.js';
import { ensureSubject } from '../shared/subjectUtils.js';

export function parseGeminiPlan(raw){
 if(!raw) return null;
 let text=stripMarkdownFences(raw);
 const first=text.indexOf('{'), last=text.lastIndexOf('}');
 if(first>=0 && last>first) text=text.slice(first,last+1);
 try { return JSON.parse(text); } catch { return null; }
}

export function buildCreativePlan(raw, ctx){
 const ai=parseGeminiPlan(raw);
 if(ai && Array.isArray(ai.scenes) && ai.scenes.length){
   return normalizePlan(ai, ctx, false);
 }
 return buildFallbackPlan(ctx);
}

function normalizePlan(plan, ctx, fallback){
 const scenes=[];
 for(let i=0;i<ctx.totalScenes;i++){
   const s=plan.scenes[i] || fallbackScene(ctx,i);
   scenes.push({
    title: compact(s.title)||defaultTitle(ctx,i),
    phase: compact(s.phase)||defaultPhase(ctx,i),
    vo: compact(s.vo)||fallbackVO(ctx,i),
    duration: compact(s.duration)|| (ctx.mode==='ugc'?'2-4s':'2-3s'),
    emotion: compact(s.emotion)||defaultEmotion(ctx,i),
    description: ensureSubject(compact(s.description)||fallbackDescription(ctx,i), ctx.gender.subj),
    mustInclude: Array.isArray(s.mustInclude)?s.mustInclude:ctx.rules.actions.slice(0,3),
    avoid: Array.isArray(s.avoid)?s.avoid:ctx.rules.avoid,
    meaning: compact(s.meaning)||'Move the viewer through the story with product-specific proof.'
   });
 }
 return { source:fallback?'fallback':'gemini', voiceover:scenes.map((s,i)=>`(Scene ${i+1} - ${s.phase}) ${s.vo}`).join('\n'), scenes };
}

export function buildFallbackPlan(ctx){ return normalizePlan({scenes:Array.from({length:ctx.totalScenes},(_,i)=>fallbackScene(ctx,i))},ctx,true); }

function defaultPhase(ctx,i){
 return (ctx.mode==='ugc'?['hook','pain','demo','proof','cta']:['hook','problem','product reveal','feature','demo','benefit','proof','lifestyle','hero','cta'])[i] || 'scene';
}
function defaultTitle(ctx,i){ const map={hook:'Hook',pain:'Pain Point',problem:'Problem',demo:'Demo',proof:'Proof',cta:'CTA','product reveal':'Product Reveal',feature:'Feature',benefit:'Benefit',lifestyle:'Lifestyle','hero':'Hero Shot'}; return map[defaultPhase(ctx,i)]||`Scene ${i+1}`; }
function defaultEmotion(ctx,i){ return ctx.mode==='ugc'?['curious','relatable','interested','convinced','friendly'][i]||'natural':['attention','tension','desire','trust','action'][i%5]; }
function pick(arr,i){ return arr && arr.length ? arr[i%arr.length] : ''; }
function fallbackScene(ctx,i){return {title:defaultTitle(ctx,i),phase:defaultPhase(ctx,i),vo:fallbackVO(ctx,i),duration:ctx.mode==='ugc'?'2-4s':'2-3s',emotion:defaultEmotion(ctx,i),description:fallbackDescription(ctx,i),mustInclude:[pick(ctx.rules.actions,i),pick(ctx.rules.motions,i),pick(ctx.rules.benefits,i)].filter(Boolean),avoid:ctx.rules.avoid,meaning:fallbackMeaning(ctx,i)};}
function fallbackMeaning(ctx,i){return ctx.mode==='ugc'?['Stop scroll with a real everyday problem.','Make the pain point feel familiar.','Show the product being used, not just held.','Give physical proof and a human reaction.','Close with a soft recommendation.'][i]||'Continue natural story.':['Grab attention.','Set the consumer problem.','Reveal product clearly.','Show a key feature.','Demonstrate use.','Translate feature into benefit.','Give believable proof.','Place product in lifestyle context.','Make hero visual memorable.','End with CTA.'][i]||'Continue brand story.';}

function fallbackVO(ctx,i){
 const p=ctx.productName, r=ctx.rules, pain=pick(r.painPoints,i), ben=pick(r.benefits,i), act=pick(r.actions,i);
 if(ctx.mode==='ads'){
   const lines=[`Saat ${pain}, yang dibutuhkan adalah solusi yang terasa nyata.`,`Perkenalkan ${p}, dibuat untuk momen ketika detail kecil benar-benar penting.`,`Dengan ${act}, ${p} terlihat relevan untuk penggunaan harian.`,`Rasakan ${ben}, tanpa klaim berlebihan dan tetap terasa believable.`,`Setiap detailnya dirancang agar pengalaman memakai produk terasa lebih mudah.`,`Dari tampilan sampai cara dipakai, ${p} memberi alasan yang jelas untuk dipilih.`,`Bukti terbaiknya ada pada interaksi nyata: ${act}.`,`Masuk ke rutinitas harian tanpa terasa dipaksakan.`,`Inilah ${p} dalam momen terbaiknya: jelas, rapi, dan mudah diingat.`,`Coba ${p} dan rasakan bedanya dalam aktivitasmu.`];
   return lines[i]||lines[lines.length-1];
 }
 if(ctx.presentationType==='asmr_lofi'){
   return [`Buka pelan... detailnya kelihatan banget.`,`Dengerin teksturnya, satisfying sih.`,`Aku coba langsung, gerakannya simpel.`,`Close-up-nya bikin kelihatan bedanya.`,`Kalau suka detail kayak gini, ini menarik buat dicoba.`][i] || `Detail ${p} kelihatan natural.`;
 }
 const casual=ctx.speechKey==='jaksel';
 const lines=casual?
 [`Pernah nggak sih, ${pain}?`,`Nah ini yang bikin gue penasaran sama ${p}.`,`Gue coba langsung: ${act}.`,`Yang kerasa tuh ${ben}, bukan cuma kelihatan bagus doang.`,`Kalau lo butuh yang begini, ${p} worth buat dicek.`]:
 [`Pernah mengalami ${pain}?`,`Ini alasan saya ingin mencoba ${p}.`,`Saya tes langsung: ${act}.`,`Yang terasa adalah ${ben}, dengan cara yang cukup natural.`,`Kalau butuh produk seperti ini, ${p} layak dipertimbangkan.`];
 return lines[i]||lines[lines.length-1];
}

function fallbackDescription(ctx,i){
 const subject=ctx.gender.subj; const action=pick(ctx.rules.actions,i); const motion=pick(ctx.rules.motions,i); const setting=pick(ctx.rules.contexts,i); const visual=ctx.videoStyle.visual; const pres=pick(ctx.presentation.visualRules,i); const benefit=pick(ctx.rules.benefits,i);
 return `${subject} in ${setting}, using ${ctx.productName}. Scene action: ${action}. Motion: ${motion}. Presentation: ${pres}. Product proof: ${benefit}. ${visual}. Keep product reference accurate: ${(ctx.rules.referenceFocus||[]).join(', ')}.`;
}
