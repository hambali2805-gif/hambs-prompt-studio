import { stripMarkdownFences, compact } from '../shared/textCleaner.js?v=202604301007';
import { ensureSubject } from '../shared/subjectUtils.js?v=202604301007';

export function parseGeminiPlan(raw){
 if(!raw) return null;
 let text=stripMarkdownFences(raw);
 const first=text.indexOf('{'), last=text.lastIndexOf('}');
 if(first>=0 && last>first) text=text.slice(first,last+1);
 try { return JSON.parse(text); } catch { return null; }
}

export function buildCreativePlan(raw, ctx, aiError = '', aiSource = 'ai'){
 const ai=parseGeminiPlan(raw);

 if(ai && Array.isArray(ai.scenes) && ai.scenes.length){
   return normalizePlan(ai, ctx, false, aiSource || 'ai');
 }

 const fallback = buildFallbackPlan(ctx);
 fallback.fallbackReason = aiError
   ? `AI API error: ${aiError}`
   : raw
     ? 'AI response received but failed JSON/schema parsing'
     : 'AI returned empty response or call was skipped';
 fallback.rawAiPreview = raw ? String(raw).slice(0, 800) : '';
 fallback.rawGeminiPreview = fallback.rawAiPreview;
 return fallback;
}


function sanitizeCreativeText(value, field = 'text', ctx = {}) {
  let t = String(value || '').trim();
  if (!t) return '';

  const replacements = [
    [/tangan\s+kubur/gi, 'tangan mengambil produk'],
    [/kaolin/gi, 'dapur'],
    [/bumbu\s+nyesal/gi, 'bumbu harum'],
    [/mencemput/gi, 'mengambil'],
    [/menceritakan\s+bumbu/gi, 'menuang bumbu'],
    [/menyinggung\s+piring/gi, 'menunjukkan piring'],
    [/memeria/gi, 'ceria'],
    [/nggakut/gi, 'penasaran'],
    [/cheese-like\s+smile/gi, 'senyum natural'],
    [/daripara/gi, 'daripada'],
    [/rebek/gi, 'ribet'],
    [/menyentuh\s+aroma/gi, 'mencium aroma'],
    [/bumbu\s+sedih/gi, 'bumbu harum'],
    [/piring\s+nggakut/gi, 'piring mie'],
    [/mie\s+nyesal/gi, 'mie berbumbu']
  ];

  replacements.forEach(([from, to]) => {
    t = t.replace(from, to);
  });

  t = t.replace(/\s+/g, ' ').trim();

  if (field === 'emotion') {
    const lower = t.toLowerCase();
    const allowed = ['relatable','penasaran','lapar','senang','puas','hangat','excited','yakin','natural','ceria','fokus','nyaman','friendly','curious','happy','warm','confident'];
    if (!allowed.some(word => lower.includes(word))) {
      if (lower.length > 18 || /[^a-zA-ZÀ-ÿ\s-]/.test(lower)) return 'natural';
    }
  }

  return t;
}

function guardSceneAction(action, phase, ctx, index) {
  const a = sanitizeCreativeText(action, 'mainAction', ctx);
  const p = String(phase || '').toLowerCase();
  const isFood = ctx?.parentType === 'food' || String(ctx?.category || '').toUpperCase().includes('MAKANAN') || String(ctx?.productType || '').includes('noodle');

  if (!isFood) return a;

  const demoWords = /(rebus|boil|tuang bumbu|pour seasoning|aduk|stir|suapan|first bite|makan|eat|angkat mie|lift noodles)/i;

  if ((p.includes('hook') || index === 0) && demoWords.test(a)) {
    return 'creator looks at the camera, gestures to hunger, and notices the product nearby without starting the cooking demo';
  }

  if ((p.includes('pain') || p.includes('problem') || index === 1) && /(aduk|stir|suapan|first bite|makan|eat)/i.test(a)) {
    return 'hand reaches for the product packaging and brings it closer with the label visible';
  }

  return a;
}


function normalizeArray(v, fallback = []) {
  return Array.isArray(v) && v.length ? v.filter(Boolean).map(x => String(x).trim()).filter(Boolean) : fallback;
}

function normalizePlan(plan, ctx, fallback, aiSource = 'ai'){
 const scenes=[];
 for(let i=0;i<ctx.totalScenes;i++){
   const beat = sceneBeat(ctx,i);
   const s=plan.scenes[i] || fallbackScene(ctx,i);

   const phase = sanitizeCreativeText(compact(s.phase)||beat.phase||defaultPhase(ctx,i), 'phase', ctx);
   const vo = localizeVOText(sanitizeCreativeText(compact(s.vo)||fallbackVO(ctx,i), 'vo', ctx), ctx);
   const visualSummary = sanitizeCreativeText(compact(s.visualSummary || s.description) || fallbackDescription(ctx,i), 'visualSummary', ctx);
   const rawMainAction = sanitizeCreativeText(compact(s.mainAction || s.action) || beat.action || pick(ctx.rules.actions, i) || 'natural product interaction', 'mainAction', ctx);
   const mainAction = guardSceneAction(rawMainAction, phase, ctx, i);
   const cameraDirection = sanitizeCreativeText(compact(s.cameraDirection) || beat.cameraDirection || ctx.platformProfile?.camera || ctx.videoStyle?.camera || 'vertical social video framing', 'cameraDirection', ctx);
   const continuity = sanitizeCreativeText(compact(s.continuity) || beat.continuity || `Keep the same ${ctx.gender.subj}, product scale, background logic, and product identity.`, 'continuity', ctx);

   scenes.push({
    number: Number(s.number) || i + 1,
    title: sanitizeCreativeText(compact(s.title)||beat.title||defaultTitle(ctx,i), 'title', ctx),
    phase,
    vo,
    duration: compact(s.duration)|| (ctx.mode==='ugc'?'2-4s':'2-3s'),
    emotion: sanitizeCreativeText(compact(s.emotion)||beat.emotion||defaultEmotion(ctx,i), 'emotion', ctx),
    visualSummary,
    mainAction,
    cameraDirection,
    continuity,
    description: ensureSubject(visualSummary, ctx.gender.subj),
    mustInclude: normalizeArray(s.mustInclude, beat.mustInclude),
    avoid: normalizeArray(s.avoid, ctx.rules.avoid),
    meaning: sanitizeCreativeText(compact(s.meaning)||beat.meaning||'Move the viewer through the story with product-specific proof.', 'meaning', ctx)
   });
 }

 return {
   source:fallback?'fallback':aiSource,
   storyTitle: compact(plan.storyTitle) || `${ctx.productName} ${ctx.mode.toUpperCase()} Story`,
   contentHook: compact(plan.contentHook) || scenes[0]?.vo || '',
   voiceover:scenes.map((s,i)=>`(Scene ${i+1} - ${s.phase}) ${s.vo}`).join('\n'),
   scenes
 };
}

export function buildFallbackPlan(ctx){
 return normalizePlan({scenes:Array.from({length:ctx.totalScenes},(_,i)=>fallbackScene(ctx,i))},ctx,true,'fallback');
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
function pick(arr,i){ return arr && arr.length ? arr[i%arr.length] : ''; }

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

function idTerm(text){ return ID_ACTION[text] || text; }

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

 if(ctx.productType === 'instant_noodle'){
   const beats = [
    {
     title:'Late Night Craving', phase:'hook', emotion:'relatable',
     setting:'cozy kitchen entrance or counter',
     action:'creator touches stomach and glances at the kitchen counter',
     cameraDirection:'vertical handheld medium close-up, quick relatable expression, no cooking action yet',
     proof:'late-night hunger cue',
     vo:`Pernah nggak sih, malam-malam gini laper tapi males ribet?`,
     continuity:'same kitchen, same outfit, product can appear nearby but not used yet',
     meaning:'Stop scroll with a familiar hunger problem.'
    },
    {
     title:'Quick Comfort Fix', phase:'pain', emotion:'longing',
     setting:'kitchen counter',
     action:'hand reaches for the Indomie Goreng pack and brings it closer to camera',
     cameraDirection:'close-up product pickup, label visible, casual handheld framing',
     proof:'recognizable pack as the quick solution',
     vo:`Jujur gue lagi butuh comfort food yang satset tapi tetap enak.`,
     continuity:'product pack remains same size and design as reference',
     meaning:'Introduce the product as the immediate solution.'
    },
    {
     title:'Seasoning Demo', phase:'demo', emotion:'focused',
     setting:'white kitchen counter or dining table',
     action:'open seasoning sachet and pour sauce/powder onto steaming noodles',
     cameraDirection:'overhead close-up on hands, sachet, noodles, and visible steam',
     proof:'seasoning lands clearly on noodles',
     vo:`Langsung gue bikin, terus bumbunya tuh langsung kecium banget.`,
     continuity:'same bowl, same counter, same product pack nearby',
     meaning:'Show actual product preparation with clear physical use.'
    },
    {
     title:'Aroma Proof', phase:'proof', emotion:'excited',
     setting:'dining table',
     action:'stir noodles until glossy seasoning coats the strands while steam rises',
     cameraDirection:'tight food close-up with slight handheld movement, then small reaction cut',
     proof:'glossy sauce, steam, aroma reaction',
     vo:`Pas diaduk gini, aromanya langsung naik banget, bikin makin laper.`,
     continuity:'same noodle bowl and product pack stay visible in believable positions',
     meaning:'Give sensory proof through texture, steam, and reaction.'
    },
    {
     title:'First Bite Closing', phase:'cta', emotion:'happy',
     setting:'dining table',
     action:'creator takes the first bite, nods naturally, and relaxes',
     cameraDirection:'medium shot, creator and bowl visible, soft closing beat',
     proof:'first bite satisfaction expression',
     vo:`Emang paling bener deh santai sambil makan mie, mood langsung balik lagi.`,
     continuity:'same creator, same food, same product identity; no new setting jump',
     meaning:'Close with emotional benefit and soft recommendation.'
    }
   ];
   const b = beats[i] || beats[beats.length-1];
   return {...b, mustInclude:[b.action,b.proof].filter(Boolean)};
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
  cameraDirection: ctx.platformProfile?.camera || ctx.videoStyle?.camera,
  continuity:`Keep the same ${ctx.gender.subj}, same product identity, same visual logic.`,
  mustInclude:[action,motion,benefit].filter(Boolean),
  meaning:fallbackMeaning(ctx,i)
 };
}

function fallbackScene(ctx,i){
 const beat = sceneBeat(ctx,i);
 return {
  number:i+1,
  title:beat.title || defaultTitle(ctx,i),
  phase:beat.phase || defaultPhase(ctx,i),
  vo:beat.vo || fallbackVO(ctx,i),
  duration:ctx.mode==='ugc'?'2-4s':'2-3s',
  emotion:beat.emotion || defaultEmotion(ctx,i),
  visualSummary:fallbackDescription(ctx,i),
  mainAction:beat.action || pick(ctx.rules.actions,i) || 'natural product interaction',
  cameraDirection:beat.cameraDirection || ctx.platformProfile?.camera || ctx.videoStyle?.camera || 'vertical social video framing',
  continuity:beat.continuity || `Keep the same ${ctx.gender.subj}, product identity, and background logic.`,
  description:fallbackDescription(ctx,i),
  mustInclude:beat.mustInclude,
  avoid:ctx.rules.avoid,
  meaning:beat.meaning || fallbackMeaning(ctx,i)
 };
}

function fallbackMeaning(ctx,i){
 const phase=defaultPhase(ctx,i);
 const meanings={hook:'Create attention and relevance.',pain:'Make the need feel relatable.',problem:'Make the need feel relatable.',demo:'Show product use physically.',proof:'Show visible or sensory proof.',cta:'Close with a product memory and action.'};
 return meanings[phase] || 'Advance the story.';
}

function fallbackDescription(ctx,i){
 const beat=sceneBeat(ctx,i);
 const setting=beat.setting || pick(ctx.rules.contexts,i) || ctx.background.directive;
 const action=beat.action || pick(ctx.rules.actions,i) || `show ${ctx.productName}`;
 const proof=beat.proof || pick(ctx.rules.benefits,i) || ctx.productTypeLabel;
 return `${ctx.gender.subj} in ${setting}, ${action}, with ${ctx.productName} clearly visible; visible proof: ${proof}; mood: ${beat.emotion || defaultEmotion(ctx,i)}.`;
}

function fallbackVO(ctx,i){
 const beat=sceneBeat(ctx,i);
 if(beat.vo) return beat.vo;
 if((ctx.language||'ID')==='ID'){
  const p=ctx.productName;
  const phase=defaultPhase(ctx,i);
  const action=idTerm(beat.action||pick(ctx.rules.actions,i)||'pakai produknya');
  if(phase==='hook') return `Pernah nggak sih butuh ${p} di momen kayak gini?`;
  if(phase==='pain'||phase==='problem') return `Makanya aku cari yang praktis tapi tetap berasa.`;
  if(phase==='demo') return `Aku coba langsung ${action}, biar kelihatan hasilnya.`;
  if(phase==='proof') return `Nah bagian ini yang bikin aku yakin, detailnya kelihatan banget.`;
  if(phase==='cta') return `Kalau lo butuh opsi yang gampang, ${p} ini bisa banget dicoba.`;
 }
 return `Scene ${i+1} shows ${ctx.productName} in a clear product story moment.`;
}
