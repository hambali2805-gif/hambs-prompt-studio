const SPEAKING_STYLE_PROFILES = {
  casual_indonesia: {
    label: 'Casual Indonesia',
    description: 'Bahasa Indonesia sehari-hari, natural, aman untuk mayoritas produk.',
    allow: ['aku/kamu boleh dipakai ringan', 'tuh', 'sih', 'banget', 'praktis', 'enak dipakai/diminum/dinikmati'],
    avoid: ['slang berlebihan', 'klaim terlalu pasti', 'bahasa iklan TV yang kaku'],
    sample: 'Kalau lagi butuh yang praktis, ini enak banget buat nemenin aktivitas harian.'
  },
  jaksel_light: {
    label: 'Jaksel Light',
    description: 'Jaksel ringan, modern, tapi tidak lebay.',
    allow: ['gue/lo secukupnya', 'tuh', 'sih', 'hectic', 'vibes secukupnya'],
    avoid: ['literally berulang', 'basically berulang', 'no debat berlebihan', 'campur Inggris terlalu banyak'],
    sample: 'Ini tuh pas banget buat nemenin hari yang lagi hectic.'
  },
  genz_tiktok: {
    label: 'Gen-Z TikTok',
    description: 'Pendek, punchy, cepat, cocok hook TikTok.',
    allow: ['kalimat pendek', 'reaksi cepat', 'relatable problem', 'punchline ringan'],
    avoid: ['terlalu formal', 'klaim keras', 'VO panjang'],
    sample: 'Gerah di jalan? Ini sih penyelamat kecil.'
  },
  bestie: {
    label: 'Bestie / Teman Dekat',
    description: 'Ngobrol seperti rekomendasi ke teman dekat.',
    allow: ['aku', 'kamu', 'jujur', 'ini tuh', 'menurutku'],
    avoid: ['jualan terlalu keras', 'bahasa terlalu formal'],
    sample: 'Aku tuh suka nyetok ini karena gampang banget dipakai kapan aja.'
  },
  honest_review: {
    label: 'Review Jujur',
    description: 'Natural, terasa seperti pengalaman personal tanpa overclaim.',
    allow: ['menurutku', 'yang aku suka', 'terasa', 'cukup', 'praktis'],
    avoid: ['pasti', 'terbaik nomor satu', 'langsung menyembuhkan', 'klaim mustahil'],
    sample: 'Menurutku ini praktis, rasanya ringan, dan enak buat dipakai harian.'
  },
  soft_selling: {
    label: 'Soft Selling',
    description: 'Ajakan halus, tidak maksa beli.',
    allow: ['bisa jadi pilihan', 'cocok buat', 'kalau kamu lagi cari', 'praktis'],
    avoid: ['buruan beli keras', 'diskon palsu', 'stok habis tanpa data'],
    sample: 'Kalau kamu lagi cari yang praktis, ini bisa jadi pilihan.'
  },
  live_seller: {
    label: 'Live Seller',
    description: 'Gaya host TikTok/Shopee Live, tetap brand-safe.',
    allow: ['cocok buat kalian', 'cek produknya', 'praktis banget', 'langsung lihat detailnya'],
    avoid: ['klaim diskon palsu', 'stok habis kalau tidak ada data', 'teriak berlebihan'],
    sample: 'Ini cocok banget buat kalian yang butuh produk praktis buat dipakai harian.'
  },
  professional_clean: {
    label: 'Professional Clean',
    description: 'Rapi, bersih, aman untuk brand.',
    allow: ['praktis', 'nyaman', 'cocok untuk aktivitas harian', 'mudah digunakan'],
    avoid: ['gue', 'lo', 'beuh', 'gila sih', 'slang berat'],
    sample: 'Produk ini praktis digunakan dan cocok untuk aktivitas harian.'
  },
  premium_elegant: {
    label: 'Premium / Elegant',
    description: 'Lebih halus, clean, cocok beauty/fashion/premium product.',
    allow: ['simple', 'clean', 'terasa pas', 'detail', 'rutinitas harian'],
    avoid: ['slang kasar', 'CTA keras', 'bahasa terlalu ramai'],
    sample: 'Simple, clean, dan terasa pas untuk melengkapi rutinitas harian.'
  },
  emak_rumahan: {
    label: 'Emak / Rumahan',
    description: 'Hangat, praktis, cocok household/food/family product.',
    allow: ['praktis banget', 'di rumah', 'kalau lagi buru-buru', 'anak-anak/keluarga jika relevan'],
    avoid: ['Jaksel berat', 'bahasa terlalu premium'],
    sample: 'Ini tuh praktis banget disiapin di rumah, apalagi kalau lagi buru-buru.'
  },
  tech_reviewer: {
    label: 'Tech Reviewer',
    description: 'Fokus fitur, pemakaian harian, build, tombol, port, layar, performa ringan.',
    allow: ['fitur', 'dipakai harian', 'tombol', 'port', 'bodi', 'ringkas', 'responsif terasa'],
    avoid: ['klaim benchmark palsu', 'spesifikasi yang tidak diberikan', 'makanan/skincare/fashion action'],
    sample: 'Bodinya ringkas, tombolnya gampang dijangkau, dan enak dipakai harian.'
  },
  light_comedy: {
    label: 'Comedy Ringan',
    description: 'Lucu ringan, tetap jelas menjual produk.',
    allow: ['problem relatable', 'reaksi ringan', 'humor pendek'],
    avoid: ['humor merendahkan', 'terlalu absurd sampai produk hilang'],
    sample: 'Panas dikit langsung drama, untung ada ini di tas.'
  }
};

const PERSONA_LABELS = {
  best_friend: 'Best Friend',
  reviewer: 'Reviewer',
  seller: 'Seller',
  expert: 'Expert',
  beauty_advisor: 'Beauty Advisor',
  tech_reviewer: 'Tech Reviewer',
  mom_household: 'Mom / Household',
  student: 'Student',
  lifestyle_creator: 'Lifestyle Creator'
};

const ENERGY_LABELS = {
  calm: 'Calm',
  medium: 'Medium',
  high: 'High'
};

const SLANG_LABELS = {
  none: 'None',
  light: 'Light',
  medium: 'Medium',
  strong: 'Strong'
};

const CTA_LABELS = {
  soft_cta: 'Soft CTA',
  direct_cta: 'Direct CTA',
  live_seller_cta: 'Live Seller CTA',
  review_cta: 'Review CTA',
  organic_no_cta: 'No CTA / Organic'
};

const LENGTH_LABELS = {
  short: 'Short',
  medium: 'Medium',
  detailed: 'Detailed'
};

function clean(x, fallback = '') {
  return String(x ?? fallback).trim();
}

function normalizeStyleKey(value) {
  const raw = clean(value || '').toLowerCase();

  const aliases = {
    jaksel: 'jaksel_light',
    jaksel_light: 'jaksel_light',
    casual: 'casual_indonesia',
    casual_indonesia: 'casual_indonesia',
    genz: 'genz_tiktok',
    gen_z: 'genz_tiktok',
    genz_tiktok: 'genz_tiktok',
    bestie: 'bestie',
    best_friend: 'bestie',
    honest: 'honest_review',
    honest_review: 'honest_review',
    review_jujur: 'honest_review',
    soft: 'soft_selling',
    soft_selling: 'soft_selling',
    live: 'live_seller',
    live_seller: 'live_seller',
    professional: 'professional_clean',
    professional_clean: 'professional_clean',
    premium: 'premium_elegant',
    premium_elegant: 'premium_elegant',
    emak: 'emak_rumahan',
    emak_rumahan: 'emak_rumahan',
    rumahan: 'emak_rumahan',
    tech: 'tech_reviewer',
    tech_reviewer: 'tech_reviewer',
    comedy: 'light_comedy',
    light_comedy: 'light_comedy'
  };

  return aliases[raw] || 'casual_indonesia';
}

function categoryKey(ctx = {}) {
  const raw = [
    ctx.categoryQualityKey,
    ctx.finalCategory,
    ctx.category,
    ctx.selectedCategory,
    ctx.parentType,
    ctx.productType,
    ctx.productName
  ].join(' ').toLowerCase();

  if (/minuman|drink|beverage|water|tea|coffee|juice|kopi|teh|jus/.test(raw)) return 'drink';
  if (/makanan|food|noodle|mie|snack|indomie|rice|sauce/.test(raw)) return 'food';
  if (/skincare|serum|cream|sunscreen|moisturizer|facial/.test(raw)) return 'skincare';
  if (/fashion|baju|shirt|dress|outfit|sepatu|tas|celana/.test(raw)) return 'fashion';
  if (/elektronik|electronics|gadget|phone|laptop|device|charger|headset|camera|fan|kipas/.test(raw)) return 'electronics';
  if (/home|living|rumah|furniture|organizer|cleaning/.test(raw)) return 'home_living';
  return 'generic';
}

function recommendedStylesForCategory(key) {
  const map = {
    food: ['casual_indonesia', 'bestie', 'genz_tiktok', 'honest_review', 'live_seller', 'emak_rumahan'],
    drink: ['casual_indonesia', 'bestie', 'genz_tiktok', 'honest_review', 'soft_selling', 'live_seller'],
    skincare: ['soft_selling', 'premium_elegant', 'honest_review', 'professional_clean', 'bestie'],
    fashion: ['bestie', 'genz_tiktok', 'premium_elegant', 'honest_review', 'soft_selling'],
    electronics: ['tech_reviewer', 'professional_clean', 'honest_review', 'live_seller', 'casual_indonesia'],
    home_living: ['emak_rumahan', 'soft_selling', 'honest_review', 'live_seller', 'casual_indonesia'],
    generic: ['casual_indonesia', 'honest_review', 'soft_selling', 'professional_clean']
  };
  return map[key] || map.generic;
}

function compatibilityNote(styleKey, catKey) {
  const recommended = recommendedStylesForCategory(catKey);
  if (recommended.includes(styleKey)) return 'compatible';
  return `adapted: ${styleKey} is not the strongest default for ${catKey}, so keep wording category-safe and natural`;
}

function buildRules(styleKey, profile, opts, catKey) {
  const rules = [
    `Speaking style: ${profile.label}`,
    `Persona: ${opts.personaLabel}`,
    `Energy: ${opts.energyLabel}`,
    `Slang level: ${opts.slangLabel}`,
    `CTA style: ${opts.ctaLabel}`,
    `VO length: ${opts.lengthLabel}`,
    'Use natural Indonesian.',
    'Keep each VO scene-specific.',
    'Do not overuse slang.',
    'Avoid malformed Indonesian.',
    'Avoid exaggerated claims.',
    'Do not force CTA in every scene.'
  ];

  if (opts.energy === 'calm') rules.push('Use calmer pacing and softer wording.');
  if (opts.energy === 'high') rules.push('Use shorter, punchier sentences, but keep meaning clear.');

  if (opts.slangLevel === 'none') rules.push('Do not use gue/lo/beuh/gila/hectic/vibes.');
  if (opts.slangLevel === 'light') rules.push('Light slang allowed: tuh, sih, banget.');
  if (opts.slangLevel === 'medium') rules.push('Moderate slang allowed, but not in every sentence.');
  if (opts.slangLevel === 'strong') rules.push('Stronger slang allowed only if still readable and category-safe.');

  if (opts.ctaStyle === 'organic_no_cta') rules.push('Avoid hard CTA; end organically.');
  if (opts.ctaStyle === 'soft_cta') rules.push('Use soft CTA such as bisa jadi pilihan, cocok buat kamu, or coba cek detailnya.');
  if (opts.ctaStyle === 'direct_cta') rules.push('Use clear CTA only in the final scene.');
  if (opts.ctaStyle === 'live_seller_cta') rules.push('Use live-seller CTA, but do not invent discount, stock, or urgency claims.');
  if (opts.ctaStyle === 'review_cta') rules.push('CTA should sound like personal recommendation.');

  if (catKey === 'skincare') rules.push('No medical cure claims, no guaranteed before-after results.');
  if (catKey === 'electronics') rules.push('No invented specs, benchmark, or fake feature claims.');
  if (catKey === 'drink') rules.push('No medical hydration guarantee; describe taste/refreshment softly.');
  if (catKey === 'food') rules.push('No health guarantee; focus on taste, practicality, texture, aroma.');
  if (catKey === 'fashion') rules.push('No body-shaming or guaranteed body shape claim.');

  return rules;
}

export function applyVoiceStyleProfile(ctx = {}, state = {}) {
  const styleKey = normalizeStyleKey(state.speakingStyle || state.voiceStyle || state.selectedTone || ctx.selectedTone || 'casual_indonesia');
  const profile = SPEAKING_STYLE_PROFILES[styleKey] || SPEAKING_STYLE_PROFILES.casual_indonesia;
  const catKey = categoryKey(ctx);

  const opts = {
    persona: clean(state.voicePersona, 'reviewer'),
    energy: clean(state.voiceEnergy, 'medium'),
    slangLevel: clean(state.slangLevel, styleKey === 'professional_clean' ? 'none' : styleKey === 'jaksel_light' ? 'medium' : 'light'),
    ctaStyle: clean(state.ctaStyle, 'soft_cta'),
    voLength: clean(state.voLength, 'short')
  };

  opts.personaLabel = PERSONA_LABELS[opts.persona] || PERSONA_LABELS.reviewer;
  opts.energyLabel = ENERGY_LABELS[opts.energy] || ENERGY_LABELS.medium;
  opts.slangLabel = SLANG_LABELS[opts.slangLevel] || SLANG_LABELS.light;
  opts.ctaLabel = CTA_LABELS[opts.ctaStyle] || CTA_LABELS.soft_cta;
  opts.lengthLabel = LENGTH_LABELS[opts.voLength] || LENGTH_LABELS.short;

  const rules = buildRules(styleKey, profile, opts, catKey);

  ctx.voiceStyle = {
    speakingStyle: styleKey,
    speakingStyleLabel: profile.label,
    description: profile.description,
    persona: opts.persona,
    personaLabel: opts.personaLabel,
    energy: opts.energy,
    energyLabel: opts.energyLabel,
    slangLevel: opts.slangLevel,
    slangLabel: opts.slangLabel,
    ctaStyle: opts.ctaStyle,
    ctaLabel: opts.ctaLabel,
    voLength: opts.voLength,
    lengthLabel: opts.lengthLabel,
    categoryVoiceCompatibility: compatibilityNote(styleKey, catKey),
    allowedExpressions: profile.allow,
    avoidExpressions: profile.avoid,
    sample: profile.sample,
    rules,
    rulesText: rules.join(' | ')
  };

  ctx.voiceDebug = {
    originalTone: state.selectedTone || ctx.selectedTone || '',
    finalSpeakingStyle: styleKey,
    finalSpeakingStyleLabel: profile.label,
    categoryKey: catKey,
    categoryVoiceCompatibility: ctx.voiceStyle.categoryVoiceCompatibility,
    claimSoftenerApplied: false
  };

  ctx.selectedTone = styleKey;
  return ctx;
}

function softenClaims(text = '', ctx = {}) {
  let t = String(text || '');
  const cat = categoryKey(ctx);
  let changed = false;

  const globalRules = [
    [/pasti\s+(ampuh|berhasil|manjur|sembuh|hilang)/gi, 'terasa membantu'],
    [/nomor\s+satu\s+di\s+dunia/gi, 'jadi salah satu pilihan menarik'],
    [/terbaik\s+nomor\s+satu/gi, 'pilihan yang menarik'],
    [/langsung\s+sempurna/gi, 'terlihat lebih baik'],
    [/dijamin/gi, 'bisa jadi']
  ];

  const drinkRules = [
    [/langsung\s+menenangkan/gi, 'cocok buat jeda sebentar'],
    [/bikin\s+adem\s+banget/gi, 'rasanya seger dan enak diminum'],
    [/langsung\s+ngilangin\s+haus/gi, 'bikin terasa lebih segar'],
    [/menghilangkan\s+haus/gi, 'membantu terasa lebih segar'],
    [/hidrasi\s+terjamin/gi, 'praktis buat diminum saat aktivitas']
  ];

  const skincareRules = [
    [/menghilangkan\s+jerawat/gi, 'membantu tampilan kulit terasa lebih terawat'],
    [/memutihkan/gi, 'membuat tampilan terlihat lebih cerah'],
    [/menghapus\s+kerutan/gi, 'membantu tampilan terasa lebih halus'],
    [/hasil\s+instan/gi, 'finish yang terasa nyaman']
  ];

  const foodRules = [
    [/pasti\s+sehat/gi, 'praktis dan enak dinikmati'],
    [/bikin\s+sehat/gi, 'enak buat dinikmati'],
    [/langsung\s+bikin\s+kenyang\s+seharian/gi, 'cukup mengenyangkan untuk dinikmati']
  ];

  const electronicsRules = [
    [/paling\s+cepat/gi, 'terasa responsif untuk penggunaan harian'],
    [/baterai\s+awet\s+seharian/gi, 'baterainya terasa praktis untuk aktivitas harian'],
    [/performa\s+terbaik/gi, 'performanya terasa nyaman untuk kebutuhan harian']
  ];

  const fashionRules = [
    [/bikin\s+badan\s+pasti\s+kurus/gi, 'bikin look terlihat lebih rapi'],
    [/langsung\s+kelihatan\s+sempurna/gi, 'look terlihat lebih clean'],
    [/cocok\s+untuk\s+semua\s+bentuk\s+tubuh/gi, 'mudah dipadukan untuk berbagai gaya']
  ];

  let rules = [...globalRules];
  if (cat === 'drink') rules = [...rules, ...drinkRules];
  if (cat === 'skincare') rules = [...rules, ...skincareRules];
  if (cat === 'food') rules = [...rules, ...foodRules];
  if (cat === 'electronics') rules = [...rules, ...electronicsRules];
  if (cat === 'fashion') rules = [...rules, ...fashionRules];

  rules.forEach(([from, to]) => {
    const next = t.replace(from, to);
    if (next !== t) changed = true;
    t = next;
  });

  if (ctx.voiceDebug && changed) ctx.voiceDebug.claimSoftenerApplied = true;
  return t;
}

function enforceSlangLevel(text = '', ctx = {}) {
  const style = ctx.voiceStyle || {};
  let t = String(text || '');

  if (style.slangLevel === 'none') {
    t = t
      .replace(/\bgue\b/gi, 'saya')
      .replace(/\bgua\b/gi, 'saya')
      .replace(/\blo\b/gi, 'kamu')
      .replace(/\bbeuh\b/gi, '')
      .replace(/\bgila sih\b/gi, 'menarik')
      .replace(/\bhectic\b/gi, 'padat')
      .replace(/\bvibes\b/gi, 'nuansa');
  }

  if (style.slangLevel === 'light') {
    t = t
      .replace(/\bliterally\b/gi, '')
      .replace(/\bbasically\b/gi, '')
      .replace(/\bno debat\b/gi, 'menarik')
      .replace(/\bspill\b/gi, 'cerita');
  }

  if (style.speakingStyle === 'professional_clean' || style.speakingStyle === 'premium_elegant') {
    t = t
      .replace(/\bgue\b/gi, 'saya')
      .replace(/\blo\b/gi, 'kamu')
      .replace(/\bbeuh\b/gi, '')
      .replace(/\bgila sih\b/gi, 'menarik')
      .replace(/\bhectic\b/gi, 'padat');
  }

  return t.replace(/\s+/g, ' ').trim();
}

function enforceLength(text = '', ctx = {}) {
  const style = ctx.voiceStyle || {};
  let t = String(text || '').trim();

  if (style.voLength === 'short') {
    const parts = t.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (parts.length > 1) t = parts[0];
    if (t.length > 130) t = t.slice(0, 127).trim() + '...';
  }

  if (style.voLength === 'medium' && t.length > 220) {
    t = t.slice(0, 217).trim() + '...';
  }

  return t;
}

function enforceCta(text = '', ctx = {}, meta = {}) {
  const style = ctx.voiceStyle || {};
  let t = String(text || '').trim();
  const phase = String(meta.phase || '').toLowerCase();
  const index = Number(meta.index || 0);

  const isFinal = phase.includes('cta') || phase.includes('closing') || index >= 4;

  if (!isFinal && /(cek sekarang|beli sekarang|klik keranjang|checkout|order sekarang|langsung beli)/i.test(t)) {
    t = t.replace(/(cek sekarang|beli sekarang|klik keranjang|checkout|order sekarang|langsung beli)/gi, 'lihat detailnya nanti');
  }

  if (style.ctaStyle === 'organic_no_cta') {
    t = t.replace(/(cek sekarang|beli sekarang|klik keranjang|checkout|order sekarang|langsung beli|buruan)/gi, '').trim();
  }

  if (style.ctaStyle === 'live_seller_cta') {
    t = t.replace(/stok\s+terbatas|diskon\s+besar|harga\s+termurah/gi, 'cek detail produknya');
  }

  return t.replace(/\s+/g, ' ').trim();
}

export function sanitizeVoiceoverText(text = '', ctx = {}, meta = {}) {
  let t = String(text || '').trim();
  if (!t) return t;

  t = softenClaims(t, ctx);
  t = enforceSlangLevel(t, ctx);
  t = enforceCta(t, ctx, meta);
  t = enforceLength(t, ctx);

  return t.replace(/\s+/g, ' ').trim();
}
