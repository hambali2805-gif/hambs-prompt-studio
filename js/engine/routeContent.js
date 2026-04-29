import { stripMarkdownFences, compact } from '../shared/textCleaner.js';
import { ensureSubject } from '../shared/subjectUtils.js';

export function parseGeminiPlan(raw){
 if(!raw) return null;
 let text=stripMarkdownFences(raw);
 const first=text.indexOf('{'), last=text.lastIndexOf('}');
 if(first>=0 && last>first) text=text.slice(first,last+1);
 try { return JSON.parse(text); } catch { return null; }
}

export function buildCreativePlan(raw, ctx, aiError = ''){
 const ai=parseGeminiPlan(raw);

 if(ai && Array.isArray(ai.scenes) && ai.scenes.length){
   return normalizePlan(ai, ctx, false);
 }

 const fallback = buildFallbackPlan(ctx);

 fallback.fallbackReason = aiError
   ? `Gemini API error: ${aiError}`
   : raw
     ? 'Gemini response received but failed JSON/schema parsing'
     : 'Gemini returned empty response or call was skipped';

 fallback.rawGeminiPreview = raw ? String(raw).slice(0, 800) : '';

 console.warn('[HAMBS] Gemini plan failed; fallback used', {
   reason: fallback.fallbackReason,
   rawPreview: fallback.rawGeminiPreview
 });

 return fallback;
}

function normalizePlan(plan, ctx, fallback){
 const scenes=[];
 for(let i=0;i<ctx.totalScenes;i++){
   const beat = sceneBeat(ctx,i);
   const s=plan.scenes[i] || fallbackScene(ctx,i);

   const vo = localizeVOText(compact(s.vo)||fallbackVO(ctx,i), ctx);

   scenes.push({
    title: compact(s.title)||beat.title||defaultTitle(ctx,i),
    phase: compact(s.phase)||beat.phase||defaultPhase(ctx,i),
    vo,
    duration: compact(s.duration)|| (ctx.mode==='ugc'?'2-4s':'2-3s'),
    emotion: compact(s.emotion)||beat.emotion||defaultEmotion(ctx,i),
    description: ensureSubject(compact(s.description)||fallbackDescription(ctx,i), ctx.gender.subj),
    mustInclude: Array.isArray(s.mustInclude) && s.mustInclude.length ? s.mustInclude : beat.mustInclude,
    avoid: Array.isArray(s.avoid)?s.avoid:ctx.rules.avoid,
    meaning: compact(s.meaning)||beat.meaning||'Move the viewer through the story with product-specific proof.'
   });
 }
 return { source:fallback?'fallback':'gemini', voiceover:scenes.map((s,i)=>`(Scene ${i+1} - ${s.phase}) ${s.vo}`).join('\n'), scenes };
}

export function buildFallbackPlan(ctx){
 return normalizePlan({scenes:Array.from({length:ctx.totalScenes},(_,i)=>fallbackScene(ctx,i))},ctx,true);
}

function defaultPhase(ctx,i){
 return (ctx.mode==='ugc'?['hook','pain','demo','proof','cta']:['hook','problem','product reveal','feature','demo','benefit','proof','lifestyle','hero','cta'])[i] || 'scene';
}

function defaultTitle(ctx,i){
 const map={hook:'Hook',pain:'Pain Point',problem:'Problem',demo:'Demo',proof:'Proof',cta:'CTA','product reveal':'Product Reveal',feature:'Feature',benefit:'Benefit',lifestyle:'Lifestyle','hero':'Hero Shot'};
 return map[defaultPhase(ctx,i)]||`Scene ${i+1}`;
}

function defaultEmotion(ctx,i){
 return ctx.mode==='ugc'?['curious','relatable','interested','convinced','friendly'][i]||'natural':['attention','tension','desire','trust','action'][i%5];
}

function pick(arr,i){
 return arr && arr.length ? arr[i%arr.length] : '';
}

const ID_ACTION = {
 'boil noodles':'rebus mie',
 'open packet':'buka bungkusnya',
 'pour seasoning':'tuang bumbunya',
 'pour noodles':'tuang mie-nya',
 'stir noodles':'aduk mie-nya',
 'stir seasoning':'campur bumbunya',
 'first bite':'coba suapan pertama',
 'lift noodles with fork':'angkat mie pakai garpu',
 'prepare food':'siapkan makanannya',
 'texture close-up':'lihat teksturnya dari dekat',
 'open/serve':'buka dan sajikan',
 'lift bite':'angkat suapan',
 'chew reaction':'reaksi setelah dicoba'
};

function idTerm(text){
 return ID_ACTION[text] || text;
}

function localizeVOText(text, ctx){
 if((ctx.language||'ID') !== 'ID') return text;
 return String(text||'')
  .replace(/\bstir noodles\b/g,'aduk mie-nya')
  .replace(/\bboil noodles\b/g,'rebus mie')
  .replace(/\bpour seasoning\b/g,'tuang bumbunya')
  .replace(/\bpour noodles\b/g,'tuang mie-nya')
  .replace(/\bopen packet\b/g,'buka bungkusnya')
  .replace(/\bfirst bite\b/g,'coba suapan pertama')
  .replace(/\blift noodles with fork\b/g,'angkat mie pakai garpu')
  .replace(/\bstir seasoning\b/g,'campur bumbunya');
}

function sceneBeat(ctx,i){
 const phase = defaultPhase(ctx,i);
 const r = ctx.rules || {};
 const p = ctx.productName || 'produk ini';

 if(ctx.productType === 'instant_noodle'){
   const beats = [
    {
     title:'Hook',
     phase:'hook',
     emotion:'curious',
     setting:'kitchen counter',
     action:'open packet beside a small pot of boiling noodles',
     motion:'hands open the pack, noodles and seasoning visible',
     proof:'quick late-night comfort food cue',
     voAction:'buka bungkusnya',
     vo:`Pernah nggak sih, lapar malam tapi malas ribet?`,
     meaning:'Stop scroll with a familiar late-night hunger problem.'
    },
    {
     title:'Pain Point',
     phase:'pain',
     emotion:'relatable',
     setting:'kitchen counter',
     action:'pour seasoning into a bowl of warm noodles',
     motion:'seasoning falls clearly onto the noodles',
     proof:'aroma bumbu mulai naik',
     voAction:'tuang bumbunya',
     vo:`Kadang cuma pengen makan yang simpel, tapi tetap berasa.`,
     meaning:'Make the need feel practical and familiar.'
    },
    {
     title:'Demo',
     phase:'demo',
     emotion:'interested',
     setting:'dining table',
     action:'stir noodles until the seasoning coats evenly',
     motion:'fork mixes the noodles in a close-up bowl shot',
     proof:'bumbu tercampur rata',
     voAction:'aduk mie-nya',
     vo:`Gue coba langsung aduk mie-nya, dan kelihatan bumbunya nyatu.`,
     meaning:'Show clear product use, not just holding the pack.'
    },
    {
     title:'Proof',
     phase:'proof',
     emotion:'convinced',
     setting:'dining table',
     action:'first bite with noodles lifted on a fork',
     motion:'she takes a small bite and reacts naturally',
     proof:'aroma bumbu naik dan tekstur mie kelihatan matang',
     voAction:'coba suapan pertama',
     vo:`Yang kerasa tuh aromanya langsung naik, gurihnya familiar banget.`,
     meaning:'Give sensory proof through food texture, steam, and reaction.'
    },
    {
     title:'CTA',
     phase:'cta',
     emotion:'friendly',
     setting:'dining table',
     action:'finished serving beauty shot with the pack beside the bowl',
     motion:'she smiles lightly, fork rests near the bowl, product pack stays visible',
     proof:'comfort food cepat buat momen santai',
     voAction:'rekomendasi santai',
     vo:`Kalau lo butuh comfort food cepat, Indomie Goreng ini worth buat distok.`,
     meaning:'Close with a soft recommendation and clear product memory.'
    }
   ];
   const b = beats[i] || beats[beats.length-1];
   return {...b, mustInclude:[b.action,b.motion,b.proof].filter(Boolean)};
 }

 const action = pick(r.actions,i);
 const motion = pick(r.motions,i);
 const benefit = pick(r.benefits,i);
 const setting = pick(r.contexts,i);

 return {
  title: defaultTitle(ctx,i),
  phase,
  emotion: defaultEmotion(ctx,i),
  setting,
  action,
  motion,
  proof: benefit,
  voAction: idTerm(action),
  mustInclude:[action,motion,benefit].filter(Boolean),
  meaning:fallbackMeaning(ctx,i)
 };
}

function fallbackScene(ctx,i){
 const beat = sceneBeat(ctx,i);
 return {
  title:beat.title || defaultTitle(ctx,i),
  phase:beat.phase || defaultPhase(ctx,i),
  vo:beat.vo || fallbackVO(ctx,i),
  duration:ctx.mode==='ugc'?'2-4s':'2-3s',
  emotion:beat.emotion || defaultEmotion(ctx,i),
  description:fallbackDescription(ctx,i),
  mustInclude:beat.mustInclude,
  avoid:ctx.rules.avoid,
  meaning:beat.meaning || fallbackMeaning(ctx,i)
 };
}

function fallbackMeaning(ctx,i){
 return ctx.mode==='ugc'
 ? ['Stop scroll with a real everyday problem.','Make the pain point feel familiar.','Show the product being used, not just held.','Give physical proof and a human reaction.','Close with a soft recommendation.'][i]||'Continue natural story.'
 : ['Grab attention.','Set the consumer problem.','Reveal product clearly.','Show a key feature.','Demonstrate use.','Translate feature into benefit.','Give believable proof.','Place product in lifestyle context.','Make hero visual memorable.','End with CTA.'][i]||'Continue brand story.';
}

function fallbackVO(ctx,i){
 const p=ctx.productName, r=ctx.rules, pain=pick(r.painPoints,i), ben=pick(r.benefits,i);
 const beat = sceneBeat(ctx,i);
 const act = beat.voAction || idTerm(pick(r.actions,i));

 if(ctx.mode==='ads'){
   const lines=[
    `Saat ${pain}, yang dibutuhkan adalah solusi yang terasa nyata.`,
    `Perkenalkan ${p}, dibuat untuk momen ketika detail kecil benar-benar penting.`,
    `Dengan ${act}, ${p} terlihat relevan untuk penggunaan harian.`,
    `Rasakan ${ben}, tanpa klaim berlebihan dan tetap terasa believable.`,
    `Setiap detailnya dirancang agar pengalaman memakai produk terasa lebih mudah.`,
    `Dari tampilan sampai cara dipakai, ${p} memberi alasan yang jelas untuk dipilih.`,
    `Bukti terbaiknya ada pada interaksi nyata: ${act}.`,
    `Masuk ke rutinitas harian tanpa terasa dipaksakan.`,
    `Inilah ${p} dalam momen terbaiknya: jelas, rapi, dan mudah diingat.`,
    `Coba ${p} dan rasakan bedanya dalam aktivitasmu.`
   ];
   return lines[i]||lines[lines.length-1];
 }

 if(ctx.presentationType==='asmr_lofi'){
   return [
    `Buka pelan... detailnya kelihatan banget.`,
    `Dengerin teksturnya, satisfying sih.`,
    `Aku coba langsung, gerakannya simpel.`,
    `Close-up-nya bikin kelihatan bedanya.`,
    `Kalau suka detail kayak gini, ini menarik buat dicoba.`
   ][i] || `Detail ${p} kelihatan natural.`;
 }

 const casual=ctx.speechKey==='jaksel';
 const lines=casual?
 [
  `Pernah nggak sih, ${pain}?`,
  `Nah ini yang bikin gue penasaran sama ${p}.`,
  `Gue coba langsung ${act}.`,
  `Yang kerasa tuh ${ben}, bukan cuma kelihatan bagus doang.`,
  `Kalau lo butuh yang begini, ${p} worth buat dicek.`
 ]:
 [
  `Pernah mengalami ${pain}?`,
  `Ini alasan saya ingin mencoba ${p}.`,
  `Saya tes langsung dengan cara ${act}.`,
  `Yang terasa adalah ${ben}, dengan cara yang cukup natural.`,
  `Kalau butuh produk seperti ini, ${p} layak dipertimbangkan.`
 ];

 return localizeVOText(lines[i]||lines[lines.length-1], ctx);
}

function fallbackDescription(ctx,i){
 const subject=ctx.gender.subj;
 const beat = sceneBeat(ctx,i);
 const visual=ctx.videoStyle.visual;
 const pres=pick(ctx.presentation.visualRules,i);
 const ref=(ctx.rules.referenceFocus||[]).join(', ');

 return `${subject} in ${beat.setting}, using ${ctx.productName}. Scene action: ${beat.action}. Motion: ${beat.motion}. Presentation: ${pres}. Product proof: ${beat.proof}. ${visual}. Keep product reference accurate: ${ref}.`;
}
