const COMMON_WEIRD_REPLACEMENTS = [
  [/tangan\s+kubur/gi, 'tangan mengambil produk'],
  [/kaolin/gi, 'dapur'],
  [/counterset/gi, 'counter dapur'],
  [/membuhut/gi, 'menjaga'],
  [/jarik/gi, 'mendekat'],
  [/nggakut/gi, 'penasaran'],
  [/memeria/gi, 'ceria'],
  [/mencemput/gi, 'mengambil'],
  [/menyinggung/gi, 'menunjukkan'],
  [/daripara/gi, 'daripada'],
  [/rebek/gi, 'ribet']
];

export const CATEGORY_QUALITY_PROFILES = {
  food: {
    label: 'Food / Makanan',
    categoryLabel: 'MAKANAN',
    presentationType: 'food_taste_demo',
    presentationLabel: 'Food Taste Demo / Sensory Proof',
    presentationPurpose: 'show real preparation, aroma, texture, steam, serving moment, and first bite reaction',
    keywords: ['open packaging','prepare food','cook/serve','pour seasoning/sauce','stir/mix','steam visible','texture close-up','aroma reaction','first bite reaction'],
    allowedActions: ['ambil produk','buka kemasan','siapkan makanan','tuang bumbu','aduk','sajikan','lihat tekstur','cium aroma','suapan pertama'],
    forbiddenPhrases: ['rubbing cream','skin before-after','fashion runway','try-on outfit','turning on device','charging cable','fake UI screen'],
    negativeRemove: ['fashion','high-fashion','skincare before-after','rubbing cream','before vs after','turning on device','device activation','fake UI screen'],
    negativeAdd: ['weird food texture','unrealistic food','floating ingredients','melted packaging','wrong serving texture'],
    replacements: [
      [/susu\s+goreng/gi, 'mie goreng'],
      [/bumbu\s+nyesal/gi, 'bumbu harum'],
      [/aroma\s+ngepuk/gi, 'aroma harum'],
      [/ngepuk/gi, 'harum'],
      [/mie\s+lumis/gi, 'mie yang sudah matang'],
      [/lintahkan\s+mie/gi, 'mengangkat mie'],
      [/berenangin\s+mie/gi, 'menyiapkan mie'],
      [/tonggak\s+bungkus/gi, 'mengambil bungkus'],
      [/jari\s+meminta\s+susu/gi, 'jari menunjuk ke mie'],
      [/kamera\s+jarik/gi, 'kamera mendekat'],
      [/warna\s+oranye\s+kuas/gi, 'warna oranye yang jelas']
    ],
    fallback: {
      hook: {
        mainAction: 'creator looks hungry, notices the product nearby, and reaches toward it without starting the demo',
        visualSummary: 'creator looks hungry near the kitchen counter while the product package is visible nearby',
        cameraDirection: 'handheld vertical framing, quick relatable hook, no full demo yet',
        continuity: 'keep the same kitchen/background, same product package, and same creator'
      },
      pain: {
        mainAction: 'creator picks up the product package and shows the label clearly',
        visualSummary: 'creator introduces the product as a practical food solution',
        cameraDirection: 'close product pickup shot with readable packaging',
        continuity: 'same kitchen/background and same package identity'
      },
      demo: {
        mainAction: 'creator prepares or serves the food with one clear action',
        visualSummary: 'product is being prepared or served with realistic food texture',
        cameraDirection: 'close-up on hands and product-use action',
        continuity: 'same serving setup, same packaging identity, no object jump'
      },
      proof: {
        mainAction: 'creator shows texture, steam, aroma, or first bite reaction',
        visualSummary: 'close-up proof of food texture, steam, serving, or taste reaction',
        cameraDirection: 'tight close-up with natural handheld motion',
        continuity: 'same finished food, same background, same product identity'
      },
      cta: {
        mainAction: 'creator holds or shows the final food and gives a soft recommendation',
        visualSummary: 'creator smiles naturally with the final product/serving visible',
        cameraDirection: 'stable closing shot with product memory',
        continuity: 'same creator, same food, same product package'
      }
    }
  },

  drink: {
    label: 'Drink / Minuman',
    categoryLabel: 'MINUMAN',
    presentationType: 'drink_refreshment_demo',
    presentationLabel: 'Drink Pour / Sip / Refreshment Proof',
    presentationPurpose: 'show pour, ice/condensation, texture/color, sip reaction, and refreshment moment',
    keywords: ['open bottle/cup','pour drink','ice/condensation','color/texture close-up','sip reaction','refreshment moment'],
    allowedActions: ['buka botol','tuang minuman','lihat es/embun','minum','reaksi segar'],
    forbiddenPhrases: ['boil noodles','pour seasoning','rubbing cream','try-on outfit','device activation'],
    negativeRemove: ['weird food texture','boil noodles','skincare before-after','fashion runway','device activation'],
    negativeAdd: ['unnatural liquid physics','floating cup','wrong drink texture','spilled unreadable product'],
    replacements: [
      [/minuman\s+dimakan/gi, 'minuman diminum'],
      [/gelas\s+direbus/gi, 'gelas dituangkan'],
      [/es\s+kulit/gi, 'es terlihat segar']
    ],
    fallback: {
      hook: { mainAction:'creator notices the drink and shows a thirsty/refreshment cue', visualSummary:'drink appears naturally in a bright daily-life setting', cameraDirection:'vertical handheld hook shot', continuity:'same drink, same setting, same creator' },
      pain: { mainAction:'creator picks up the drink and shows the label or cup clearly', visualSummary:'drink is introduced as the quick refreshment solution', cameraDirection:'close-up product pickup', continuity:'same drink identity and setting' },
      demo: { mainAction:'creator pours the drink or shows ice/condensation clearly', visualSummary:'clear pour or drink texture moment', cameraDirection:'close-up on pour/liquid movement', continuity:'same cup/bottle and background' },
      proof: { mainAction:'creator takes a sip and reacts naturally', visualSummary:'refreshment proof through sip reaction and visible condensation', cameraDirection:'medium close-up sip reaction', continuity:'same drink and setting' },
      cta: { mainAction:'creator holds the drink and gives a soft recommendation', visualSummary:'final drink memory shot with product visible', cameraDirection:'stable closing shot', continuity:'same drink identity and creator' }
    }
  },

  skincare: {
    label: 'Skincare',
    categoryLabel: 'SKINCARE',
    presentationType: 'skincare_texture_routine',
    presentationLabel: 'Skincare Texture / Apply / Routine Proof',
    presentationPurpose: 'show texture, application, routine integration, mirror check, and safe visible finish without medical claims',
    keywords: ['texture shot','apply to hand/face','blend','routine step','mirror check','soft finish'],
    allowedActions: ['tunjukkan tekstur','oleskan produk','blend pelan','mirror check','lihat finish'],
    forbiddenPhrases: ['eat product','boil noodles','pour seasoning','fabric try-on','device charging','medical cure'],
    negativeRemove: ['weird food texture','boil noodles','food steam','fashion runway','fake UI screen'],
    negativeAdd: ['medical claim text','unrealistic skin texture','fake clinical result','unsafe before-after claim','over-smoothed plastic skin'],
    replacements: [
      [/cream\s+dimakan/gi, 'cream dioleskan'],
      [/wajah\s+direbus/gi, 'wajah terlihat segar'],
      [/tekstur\s+mie/gi, 'tekstur cream'],
      [/kulit\s+digoreng/gi, 'kulit terlihat natural']
    ],
    fallback: {
      hook: { mainAction:'creator shows a relatable skincare routine moment', visualSummary:'creator near mirror or vanity with product visible', cameraDirection:'natural selfie/vanity framing', continuity:'same creator, same product, same bathroom/vanity' },
      pain: { mainAction:'creator shows the product and points to the routine need', visualSummary:'product introduced as part of daily routine', cameraDirection:'close product shot with clean background', continuity:'same vanity and product identity' },
      demo: { mainAction:'creator applies or blends the product gently', visualSummary:'texture/application shown clearly and safely', cameraDirection:'close-up on texture and application', continuity:'same face/hand, same product, same lighting' },
      proof: { mainAction:'creator checks the finish in the mirror', visualSummary:'soft visible finish without exaggerated claims', cameraDirection:'mirror or close-up finish check', continuity:'same creator and same lighting' },
      cta: { mainAction:'creator holds the product and gives a soft recommendation', visualSummary:'final product memory shot in routine context', cameraDirection:'stable closing shot', continuity:'same product and creator identity' }
    }
  },

  fashion: {
    label: 'Fashion',
    categoryLabel: 'FASHION',
    presentationType: 'fashion_tryon_fit_check',
    presentationLabel: 'Fashion Try-on / Fit / Fabric Proof',
    presentationPurpose: 'show fit, fabric movement, styling, mirror/body movement, and daily outfit context',
    keywords: ['try-on','fabric close-up','fit check','mirror shot','styling','walking movement'],
    allowedActions: ['pakai outfit','cek fit','tunjukkan kain','mirror shot','mix and match','jalan natural'],
    forbiddenPhrases: ['boil noodles','pour seasoning','rubbing cream','device screen demo','eat product'],
    negativeRemove: ['weird food texture','food steam','skincare before-after','fake UI screen','boil noodles'],
    negativeAdd: ['bad fabric physics','warped clothing','wrong fit','duplicated outfit pieces','extra limbs'],
    replacements: [
      [/baju\s+mendidih/gi, 'baju terlihat rapi'],
      [/kain\s+dimasak/gi, 'kain bergerak natural'],
      [/outfit\s+berasap/gi, 'outfit terlihat clean'],
      [/dress\s+dimakan/gi, 'dress dipakai']
    ],
    fallback: {
      hook: { mainAction:'creator shows an outfit problem or occasion cue', visualSummary:'creator stands near mirror or wardrobe with item visible', cameraDirection:'vertical mirror/handheld hook shot', continuity:'same outfit item and room' },
      pain: { mainAction:'creator picks up or shows the fashion item clearly', visualSummary:'fashion item introduced with color and fabric visible', cameraDirection:'close-up on item and fabric', continuity:'same item identity' },
      demo: { mainAction:'creator tries on or styles the item', visualSummary:'fit and styling shown on body', cameraDirection:'mirror shot or medium full-body framing', continuity:'same creator and item' },
      proof: { mainAction:'creator shows fabric movement, fit, or detail close-up', visualSummary:'fabric/fit/detail proof in natural movement', cameraDirection:'close-up detail or walking movement', continuity:'same outfit and room' },
      cta: { mainAction:'creator gives a final mirror look and soft recommendation', visualSummary:'final outfit memory shot', cameraDirection:'stable mirror closing shot', continuity:'same outfit and creator' }
    }
  },

  electronics: {
    label: 'Electronics / Gadget',
    categoryLabel: 'ELEKTRONIK',
    presentationType: 'electronics_feature_demo',
    presentationLabel: 'Electronics Unbox / Feature / Use Demo',
    presentationPurpose: 'show real device use, buttons/ports/screen/case, feature demo, and problem-solution proof without inventing specs',
    keywords: ['unboxing','turn on','screen demo','feature use','ports/buttons close-up','daily use proof'],
    allowedActions: ['unbox','nyalakan device','tunjukkan layar','demo fitur','tunjukkan port/tombol','pakai harian'],
    forbiddenPhrases: ['eat product','boil noodles','rubbing cream','fabric fit','medical cure'],
    negativeRemove: ['weird food texture','food steam','skincare before-after','fashion runway','boil noodles'],
    negativeAdd: ['fake UI text','wrong ports','warped device screen','invented specs','floating device'],
    replacements: [
      [/layar\s+dimakan/gi, 'layar menyala'],
      [/kabel\s+diaduk/gi, 'kabel dipasang'],
      [/device\s+direbus/gi, 'device dinyalakan'],
      [/port\s+digoreng/gi, 'port terlihat jelas']
    ],
    fallback: {
      hook: { mainAction:'creator shows a relatable device need or problem', visualSummary:'device appears in a real desk/daily-use setting', cameraDirection:'vertical desk/handheld hook shot', continuity:'same device and workspace' },
      pain: { mainAction:'creator picks up the device and shows it clearly', visualSummary:'device introduced with body and screen/ports visible', cameraDirection:'clean product close-up', continuity:'same device identity' },
      demo: { mainAction:'creator turns on or demonstrates one feature', visualSummary:'one clear device feature or use case shown', cameraDirection:'close-up on screen/buttons/ports', continuity:'same device and UI identity' },
      proof: { mainAction:'creator shows the result of the feature in use', visualSummary:'practical proof of device use without invented specs', cameraDirection:'follow shot or close-up proof', continuity:'same workspace and device' },
      cta: { mainAction:'creator holds the device and gives a soft recommendation', visualSummary:'final device memory shot with clear product view', cameraDirection:'stable closing shot', continuity:'same device and creator' }
    }
  },

  home_living: {
    label: 'Home / Living',
    categoryLabel: 'HOME_LIVING',
    presentationType: 'home_use_demo',
    presentationLabel: 'Home Product Use / Practical Proof',
    presentationPurpose: 'show practical home use, before-use setup, use action, visible result, and daily-life benefit',
    keywords: ['home setup','practical use','organize/clean/place','visible result','daily-life benefit'],
    allowedActions: ['pasang','pakai','rapikan','bersihkan','tunjukkan hasil','integrasi rumah'],
    forbiddenPhrases: ['eat product','skin before-after','fashion runway','device fake UI'],
    negativeRemove: ['boil noodles','skincare before-after','fashion runway','fake UI text'],
    negativeAdd: ['impossible object placement','floating home item','warped furniture','messy unclear result'],
    replacements: [],
    fallback: {
      hook: { mainAction:'creator shows a relatable home problem', visualSummary:'home product appears in a daily-life room setup', cameraDirection:'vertical natural home framing', continuity:'same room and product' },
      pain: { mainAction:'creator introduces the home product clearly', visualSummary:'product is shown as a practical home solution', cameraDirection:'close-up product pickup', continuity:'same room and item identity' },
      demo: { mainAction:'creator uses or places the product in one clear action', visualSummary:'practical product use shown clearly', cameraDirection:'follow the hand/action', continuity:'same room and object placement' },
      proof: { mainAction:'creator shows the visible result or practical improvement', visualSummary:'result/proof shown in the same home setting', cameraDirection:'before/use/result style without fake claims', continuity:'same room layout' },
      cta: { mainAction:'creator shows final setup and recommends softly', visualSummary:'final home setup memory shot', cameraDirection:'stable closing shot', continuity:'same room and product' }
    }
  },

  generic_product: {
    label: 'Generic Product',
    categoryLabel: 'GENERAL',
    presentationType: 'generic_product_demo',
    presentationLabel: 'Generic Product Demo',
    presentationPurpose: 'show product intro, one clear use action, visible proof, and soft CTA',
    keywords: ['product intro','use action','detail close-up','result proof','soft CTA'],
    allowedActions: ['show product','use product','show detail','show result','soft CTA'],
    forbiddenPhrases: [],
    negativeRemove: [],
    negativeAdd: ['unclear product','wrong scale','duplicate product','fake label text'],
    replacements: [],
    fallback: {
      hook: { mainAction:'creator shows a relatable need and notices the product', visualSummary:'product appears naturally in daily-life setting', cameraDirection:'vertical social hook shot', continuity:'same product and creator' },
      pain: { mainAction:'creator introduces the product clearly', visualSummary:'product shown with clear identity', cameraDirection:'close-up product intro', continuity:'same product identity' },
      demo: { mainAction:'creator uses the product in one clear action', visualSummary:'product-use action shown clearly', cameraDirection:'close-up on use action', continuity:'same setting and product' },
      proof: { mainAction:'creator shows visible product detail or result', visualSummary:'proof/detail moment shown clearly', cameraDirection:'tight proof close-up', continuity:'same product and setting' },
      cta: { mainAction:'creator gives a soft recommendation with product visible', visualSummary:'final product memory shot', cameraDirection:'stable closing shot', continuity:'same product and creator' }
    }
  }
};

function textOf(ctx) {
  return [
    ctx?.category,
    ctx?.selectedCategory,
    ctx?.requestedCategory,
    ctx?.productType,
    ctx?.productTypeLabel,
    ctx?.productName,
    ctx?.productDescription,
    ctx?.parentType
  ].join(' ').toLowerCase();
}

export function normalizeCategoryQualityKey(ctx = {}) {
  const t = textOf(ctx);

  if (ctx.parentType === 'drink' || /minuman|drink|beverage|coffee|tea|juice|soda|milk|kopi|teh|jus/.test(t)) return 'drink';
  if (ctx.parentType === 'food' || /makanan|food|noodle|mie|snack|sauce|rice|ayam|bakso|indomie|goreng/.test(t)) return 'food';
  if (/skincare|skin care|serum|sunscreen|moisturizer|cream|toner|facial wash|sabun wajah/.test(t)) return 'skincare';
  if (/fashion|baju|kaos|shirt|dress|celana|sepatu|tas|outfit|jacket|hijab/.test(t)) return 'fashion';
  if (/elektronik|electronics|gadget|phone|laptop|camera|headset|earbuds|charger|device|keyboard|mouse/.test(t)) return 'electronics';
  if (/home|living|rumah|dapur|furniture|organizer|cleaning|alat rumah|decor/.test(t)) return 'home_living';

  return 'generic_product';
}

export function getCategoryQualityProfile(ctx = {}) {
  const key = normalizeCategoryQualityKey(ctx);
  return CATEGORY_QUALITY_PROFILES[key] || CATEGORY_QUALITY_PROFILES.generic_product;
}

export function applyCategoryQualityProfile(ctx = {}) {
  const key = normalizeCategoryQualityKey(ctx);
  const profile = getCategoryQualityProfile(ctx);

  ctx.categoryQualityKey = key;
  ctx.categoryQualityProfile = profile;
  ctx.finalCategory = profile.categoryLabel;
  ctx.category = profile.categoryLabel;
  ctx.selectedCategory = profile.categoryLabel;

  ctx.presentationType = profile.presentationType;
  ctx.presentationKeywords = profile.keywords.join(', ');

  ctx.presentation = {
    ...(ctx.presentation || {}),
    label: profile.presentationLabel,
    purpose: profile.presentationPurpose,
    keywords: profile.keywords,
    motionRules: profile.allowedActions,
    avoid: profile.forbiddenPhrases
  };

  return ctx;
}

function rxMatch(pattern, text) {
  try {
    return new RegExp(pattern, 'i').test(text);
  } catch {
    return String(text || '').toLowerCase().includes(String(pattern || '').toLowerCase());
  }
}

export function cleanNegativePromptByCategory(ctx = {}, negativePrompt = '') {
  const profile = getCategoryQualityProfile(ctx);
  let items = String(negativePrompt || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);

  items = items.filter(item => !profile.negativeRemove.some(pattern => rxMatch(pattern, item)));

  return [...new Set([...items, ...profile.negativeAdd].filter(Boolean))].join(', ');
}

export function sanitizeCreativeTextByCategory(value = '', field = 'text', ctx = {}) {
  const profile = getCategoryQualityProfile(ctx);
  let t = String(value || '').trim();
  if (!t) return '';

  [...COMMON_WEIRD_REPLACEMENTS, ...(profile.replacements || [])].forEach(([from, to]) => {
    t = t.replace(from, to);
  });

  if (field === 'emotion') {
    const lower = t.toLowerCase();
    const allowed = ['relatable','penasaran','lapar','haus','senang','puas','hangat','excited','yakin','natural','ceria','fokus','nyaman','friendly','curious','happy','warm','confident','segar','rapi'];
    if (lower.includes('hargai')) return 'puas';
    if (!allowed.some(word => lower.includes(word)) && (lower.length > 18 || /[^a-zA-ZÀ-ÿ\s-]/.test(lower))) {
      return 'natural';
    }
  }

  return t.replace(/\s+/g, ' ').trim();
}

function phaseKey(phase = '', index = 0) {
  const p = String(phase || '').toLowerCase();
  if (p.includes('hook') || index === 0) return 'hook';
  if (p.includes('pain') || p.includes('problem') || p.includes('need') || index === 1) return 'pain';
  if (p.includes('demo') || p.includes('use') || index === 2) return 'demo';
  if (p.includes('proof') || p.includes('result') || p.includes('reaction') || index === 3) return 'proof';
  if (p.includes('cta') || p.includes('closing') || index >= 4) return 'cta';
  return 'demo';
}

function hasForbiddenOrWeird(text = '', profile) {
  const t = String(text || '').toLowerCase();
  const weird = /(kaolin|tangan kubur|counterset|membuhut|jarik|nggakut|memeria|mencemput|tonggak|lintahkan|berenangin|ngepuk|susu goreng|wajah direbus|baju mendidih|device direbus|kabel diaduk|cream dimakan)/i;
  if (weird.test(t)) return true;
  return profile.forbiddenPhrases.some(p => rxMatch(p, t));
}

export function guardSceneActionByCategory(action = '', phase = '', ctx = {}, index = 0) {
  const profile = getCategoryQualityProfile(ctx);
  const key = phaseKey(phase, index);
  const current = sanitizeCreativeTextByCategory(action, 'mainAction', ctx);

  if (hasForbiddenOrWeird(current, profile)) {
    return profile.fallback?.[key]?.mainAction || current;
  }

  const lower = current.toLowerCase();

  if (key === 'hook') {
    const fullDemo = /(tuang|aduk|rebus|oles|blend|try on|pakai outfit penuh|turn on|nyalakan|makan|first bite|suapan|sip|minum)/i;
    if (fullDemo.test(lower)) return profile.fallback?.hook?.mainAction || current;
  }

  if (key === 'pain') {
    const resultAction = /(first bite|suapan|makan|finish|hasil akhir|cta|buy now|mirror final|result proof)/i;
    if (resultAction.test(lower)) return profile.fallback?.pain?.mainAction || current;
  }

  return current;
}

export function normalizeScenePieceByCategory(value = '', field = 'visualSummary', phase = '', ctx = {}, index = 0) {
  const profile = getCategoryQualityProfile(ctx);
  const key = phaseKey(phase, index);
  const current = sanitizeCreativeTextByCategory(value, field, ctx);

  if (hasForbiddenOrWeird(current, profile)) {
    return profile.fallback?.[key]?.[field] || current;
  }

  return current;
}
