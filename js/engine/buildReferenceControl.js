const PRODUCT_REF_ROLE_LABELS = {
  auto: 'Auto',
  main_packaging: 'Main Packaging',
  product_hero: 'Product Hero',
  product_in_use: 'Product In Use',
  texture_detail: 'Texture / Detail',
  serving_result: 'Serving / Result',
  variant: 'Variant',
  bundle: 'Bundle / Final Setup',
  before_state: 'Before State',
  after_state: 'After State',
  closeup_label: 'Close-up Label',
  accessory_props: 'Accessory / Props',
  custom: 'Custom'
};

const PRODUCT_REF_ROLE_INSTRUCTIONS = {
  auto: 'Use this reference according to the scene purpose.',
  main_packaging: 'Preserve packaging shape, logo area, label layout, color palette, scale, and material.',
  product_hero: 'Use as the main product hero anchor; keep the product readable, centered, and accurate.',
  product_in_use: 'Use as the product-use state anchor; preserve how the product looks while being used.',
  texture_detail: 'Use as close-up texture/material/detail anchor; preserve surface detail, color, and tactile quality.',
  serving_result: 'Use as final serving/result anchor; preserve portion, texture, plating, steam, color, and appetizing detail.',
  variant: 'Use as variant/edition reference; do not merge it with another variant unless requested.',
  bundle: 'Use as final bundle/setup anchor; preserve product arrangement and relationship between items.',
  before_state: 'Use as before-state anchor; do not present it as final result.',
  after_state: 'Use as after-state/result anchor; preserve result appearance without exaggerated claims.',
  closeup_label: 'Use as label/detail anchor; preserve text placement, logo area, colors, and material.',
  accessory_props: 'Use as accessory/props anchor; keep it secondary to the main product.',
  custom: 'Follow the custom instruction for this reference.'
};

function clean(x, fallback = '') {
  return String(x ?? fallback).trim();
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const cleaned = clean(value);
    if (cleaned) return cleaned;
  }
  return '';
}

function labelRole(role) {
  return PRODUCT_REF_ROLE_LABELS[role] || PRODUCT_REF_ROLE_LABELS.auto;
}

function roleInstruction(role) {
  return PRODUCT_REF_ROLE_INSTRUCTIONS[role] || PRODUCT_REF_ROLE_INSTRUCTIONS.auto;
}

function categoryKeyForReference(ctx = {}) {
  const raw = [
    ctx.categoryQualityKey,
    ctx.finalCategory,
    ctx.category,
    ctx.selectedCategory,
    ctx.parentType,
    ctx.productType,
    ctx.productName
  ].join(' ').toLowerCase();

  if (/minuman|drink|beverage|water|air mineral|kopi|teh|juice|jus|soda/.test(raw)) return 'drink';
  if (/makanan|food|noodle|mie|snack|indomie|rice|sauce/.test(raw)) return 'food';
  if (/skincare|serum|cream|sunscreen|moisturizer|facial/.test(raw)) return 'skincare';
  if (/fashion|baju|shirt|dress|outfit|sepatu|tas|celana/.test(raw)) return 'fashion';
  if (/elektronik|electronics|gadget|phone|laptop|device|charger|headset|camera/.test(raw)) return 'electronics';
  if (/home|living|rumah|furniture|organizer|cleaning/.test(raw)) return 'home_living';
  return 'generic';
}

function contextualRoleLabel(role, ctx = {}) {
  const key = categoryKeyForReference(ctx);

  const labels = {
    drink: {
      main_packaging: 'Main Bottle / Packaging',
      product_hero: 'Bottle Hero',
      product_in_use: 'Drinking / Pouring Moment',
      texture_detail: 'Condensation / Water Clarity Detail',
      serving_result: 'Drink / Pouring Result',
      bundle: 'Lifestyle Carry / Final Setup'
    },
    food: {
      main_packaging: 'Main Packaging',
      product_hero: 'Food Product Hero',
      product_in_use: 'Cooking / Serving Moment',
      texture_detail: 'Food Texture / Detail',
      serving_result: 'Serving / Result',
      bundle: 'Final Food Setup / Bundle'
    },
    skincare: {
      main_packaging: 'Bottle / Tube Packaging',
      product_hero: 'Skincare Hero',
      product_in_use: 'Application Moment',
      texture_detail: 'Cream / Texture Detail',
      serving_result: 'Finish / Routine Result',
      bundle: 'Routine / Bundle Setup'
    },
    fashion: {
      main_packaging: 'Tag / Packaging',
      product_hero: 'Fashion Item Hero',
      product_in_use: 'Try-on / Worn Look',
      texture_detail: 'Fabric / Stitch Detail',
      serving_result: 'Fit / Styling Result',
      bundle: 'Outfit / Bundle Setup'
    },
    electronics: {
      main_packaging: 'Device / Box Packaging',
      product_hero: 'Device Hero',
      product_in_use: 'Feature Use Moment',
      texture_detail: 'Screen / Port / Material Detail',
      serving_result: 'Use Result / Feature Proof',
      bundle: 'Desk / Accessory Setup'
    }
  };

  return labels[key]?.[role] || labelRole(role);
}

function contextualRoleInstruction(role, ctx = {}) {
  const key = categoryKeyForReference(ctx);

  const instructions = {
    drink: {
      main_packaging: 'Preserve bottle shape, cap, label layout, water clarity, volume, scale, and transparent material.',
      product_hero: 'Use as bottle/product hero anchor; keep label readable, shape accurate, and water clear.',
      product_in_use: 'Use as drinking/pouring moment anchor; preserve bottle angle, water clarity, condensation, and hand interaction.',
      texture_detail: 'Preserve condensation droplets, transparent water, label detail, cap, plastic/glass material, and highlight reflections.',
      serving_result: 'Preserve drink/pour/sip result, water clarity, condensation, cup/bottle relationship, and refreshment feel.',
      bundle: 'Preserve final lifestyle setup: bottle on table, bag, car holder, hand carry, or daily-use context.'
    },
    food: {
      main_packaging: 'Preserve packaging shape, logo area, label layout, color palette, scale, and material.',
      product_hero: 'Keep product readable, centered, accurate, and appetizing without redesigning packaging.',
      product_in_use: 'Preserve food being prepared/served with realistic hand interaction and packaging continuity.',
      texture_detail: 'Preserve food texture, seasoning, steam, color, serving surface, and close-up detail.',
      serving_result: 'Preserve final serving, portion, plating, steam, texture, and appetizing detail.',
      bundle: 'Preserve final food arrangement, package + serving relationship, props, and product context.'
    },
    skincare: {
      main_packaging: 'Preserve bottle/tube shape, label area, cap, color, scale, and clean cosmetic material.',
      product_hero: 'Keep skincare product readable and premium without fake clinical claims.',
      product_in_use: 'Preserve application moment on hand/face with safe natural texture and lighting.',
      texture_detail: 'Preserve cream/gel/serum texture, shine, viscosity, and clean surface detail.',
      serving_result: 'Preserve soft routine finish without medical or extreme before-after claims.',
      bundle: 'Preserve routine setup, product bundle, vanity props, and clean bathroom/desk context.'
    },
    fashion: {
      main_packaging: 'Preserve tag, label, color, fold, item shape, and material identity.',
      product_hero: 'Show fashion item clearly with accurate color, cut, and silhouette.',
      product_in_use: 'Preserve worn fit, body proportion, fabric drape, and styling context.',
      texture_detail: 'Preserve fabric texture, stitching, seams, print, and material movement.',
      serving_result: 'Preserve final fit/styling look with realistic fabric physics.',
      bundle: 'Preserve full outfit setup, accessories, and styling relationship.'
    },
    electronics: {
      main_packaging: 'Preserve device/box shape, logo area, ports, buttons, screen frame, and scale.',
      product_hero: 'Show device clearly without invented specs or fake UI text.',
      product_in_use: 'Preserve feature-use action, hand interaction, and device screen/body continuity.',
      texture_detail: 'Preserve screen, ports, buttons, material finish, reflections, and edges.',
      serving_result: 'Preserve practical feature proof without hallucinated performance claims.',
      bundle: 'Preserve desk setup, accessories, cables, and device arrangement.'
    }
  };

  return instructions[key]?.[role] || roleInstruction(role);
}

function uniq(arr) {
  return [...new Set((arr || []).filter(Boolean))];
}

function normalizeRefToken(token) {
  const t = clean(token).toLowerCase().replace(/\s+/g, '');
  if (!t || t === 'none') return '';
  if (t === '1' || t === 'ref1' || t === 'prod1' || t === 'product1') return 'prod1';
  if (t === '2' || t === 'ref2' || t === 'prod2' || t === 'product2') return 'prod2';
  if (t === '3' || t === 'ref3' || t === 'prod3' || t === 'product3') return 'prod3';
  if (t === '4' || t === 'ref4' || t === 'prod4' || t === 'product4') return 'prod4';
  return '';
}

function parseRefs(value, availableIds, fallbackIds) {
  const raw = clean(value, 'auto').toLowerCase();
  if (!raw || raw === 'auto') return fallbackIds;
  if (raw === 'none') return [];
  const tokens = raw.split(/[,+| ]+/).map(normalizeRefToken).filter(Boolean);
  const allowed = new Set(availableIds);
  const valid = uniq(tokens).filter(id => allowed.has(id));
  return valid.length ? valid : fallbackIds;
}

function detectUploadedProductRefs(state) {
  const prod = state?.uploadedFiles?.prod;
  if (Array.isArray(prod)) return prod;
  if (prod) return [prod];
  return [];
}

function buildProductReferences(state, ctx = {}) {
  const uploaded = detectUploadedProductRefs(state);

  return [1, 2, 3, 4].map(i => {
    const id = `prod${i}`;
    const role = clean(state?.[`productRef${i}Role`], 'auto');
    const customInstruction = clean(state?.[`productRef${i}Instruction`]);
    const uploadedRef = !!uploaded[i - 1];

    return {
      id,
      label: `Product Ref ${i}`,
      uploaded: uploadedRef,
      role,
      roleLabel: contextualRoleLabel(role, ctx),
      instruction: customInstruction || contextualRoleInstruction(role, ctx),
      customInstruction
    };
  });
}

function defaultRefsForScene(ctx, sceneNumber, availableIds) {
  const ids = availableIds.length ? availableIds : ['prod1'];
  const first = ids[0];
  const second = ids[1] || first;
  const third = ids[2] || second || first;
  const fourth = ids[3] || second || first;

  if (ctx.mode === 'ads') {
    const map = {
      1: [first],
      2: [first],
      3: [second],
      4: uniq([second, third]),
      5: uniq([first, second]),
      6: [second],
      7: [third],
      8: [fourth],
      9: [first],
      10: uniq([first, fourth])
    };
    return map[sceneNumber] || [first];
  }

  const map = {
    1: [first],
    2: [first],
    3: uniq([first, second]),
    4: uniq([second, third]),
    5: uniq([first, fourth])
  };
  return map[sceneNumber] || [first];
}

function defaultSceneRole(ctx, sceneNumber) {
  if (ctx.mode === 'ads') {
    return [
      'hero hook',
      'label/detail confirmation',
      'product use',
      'proof detail',
      'benefit demonstration',
      'lifestyle integration',
      'close-up proof',
      'bundle/final setup',
      'hero memory shot',
      'CTA product reminder'
    ][sceneNumber - 1] || 'product continuity';
  }

  return [
    'subtle product intro',
    'product introduction',
    'demo / product in use',
    'proof / texture detail',
    'final memory shot'
  ][sceneNumber - 1] || 'product continuity';
}

function defaultSceneVisibility(ctx, sceneNumber) {
  if (ctx.mode === 'ads') {
    return ['hero', 'strong', 'strong', 'strong', 'strong', 'balanced', 'strong', 'balanced', 'hero', 'strong'][sceneNumber - 1] || 'balanced';
  }
  return ['subtle', 'balanced', 'strong', 'strong', 'balanced'][sceneNumber - 1] || 'balanced';
}

function defaultSceneInstruction(ctx, sceneNumber) {
  if (ctx.mode === 'ads') {
    return [
      'Make product immediately recognizable without changing packaging.',
      'Show label/detail clearly and accurately.',
      'Show real product use with believable physical interaction.',
      'Show close-up proof/detail without inventing claims.',
      'Connect product detail to real benefit.',
      'Show product in daily-life use.',
      'Focus on detail/texture/proof anchor.',
      'Show final setup or bundle accurately.',
      'Create memorable product hero shot.',
      'Close with product and CTA clearly visible.'
    ][sceneNumber - 1] || 'Keep product accurate and consistent.';
  }

  return [
    'Product may appear naturally; do not start the full demo yet.',
    'Introduce product clearly; label/packaging should be readable.',
    'Show product being used; pack and in-use state may appear together.',
    'Focus on sensory/detail proof such as texture, steam, result, or close-up detail.',
    'Show final product memory shot with product/result visible.'
  ][sceneNumber - 1] || 'Keep product accurate and consistent.';
}

function buildSceneProductMap(ctx, state, productReferences) {
  const activeIds = productReferences
    .filter(r => r.uploaded || r.customInstruction)
    .map(r => r.id);

  // IMPORTANT:
  // Default UI roles for Ref 2-4 do not mean those references exist.
  // If only Ref 1 is uploaded, every scene must fallback to Ref 1.
  const availableIds = activeIds.length ? activeIds : ['prod1'];
  const map = {};

  for (let i = 1; i <= (ctx.totalScenes || 5); i++) {
    const fallbackRefs = defaultRefsForScene(ctx, i, availableIds);
    const refsValue = state?.sceneProductRefMap?.[String(i)]?.refs || state?.[`scene${i}ProductRefs`] || 'auto';
    const refs = parseRefs(refsValue, availableIds, fallbackRefs);

    const visibility =
      state?.sceneProductRefMap?.[String(i)]?.visibility ||
      state?.[`scene${i}ProductVisibility`] ||
      defaultSceneVisibility(ctx, i);

    const role =
      state?.sceneProductRefMap?.[String(i)]?.role ||
      state?.[`scene${i}ProductRole`] ||
      defaultSceneRole(ctx, i);

    const instruction =
      state?.sceneProductRefMap?.[String(i)]?.instruction ||
      state?.[`scene${i}ProductInstruction`] ||
      defaultSceneInstruction(ctx, i);

    map[String(i)] = {
      scene: i,
      refs,
      refLabels: refs.map(id => `Product Ref ${id.replace('prod', '')}`),
      visibility,
      role,
      instruction
    };
  }

  return map;
}

function buildCharacterControl(ctx, state) {
  const mode = clean(state.characterMode, 'auto');
  const gender = clean(state.characterGender, 'auto');
  const ageRange = clean(state.characterAgeRange, 'young_adult');
  const lock = clean(state.characterLock, 'strong');
  const outfitLock = clean(state.outfitLock, 'same_outfit');
  const notes = clean(state.characterNotes);

  let subjectPhrase = ctx.gender?.subj || 'the creator';
  if (mode === 'product_only') subjectPhrase = 'product-only scene';
  else if (gender === 'female') subjectPhrase = 'A young Indonesian woman';
  else if (gender === 'male') subjectPhrase = 'A young Indonesian man';
  else if (gender === 'mixed' || mode === 'couple') subjectPhrase = 'An Indonesian couple';
  else if (mode === 'group') subjectPhrase = 'A small group of Indonesian people';

  const reference = ctx.references?.hasCharacter ? 'yes, uploaded character reference is the identity anchor' : 'no uploaded character reference';
  const identityRule = mode === 'product_only'
    ? 'No human character required unless the scene explicitly needs hands for product use.'
    : `${reference}. Keep the same character identity, face, skin tone, hairstyle, body proportion, age impression, expression style, and creator personality across all scenes. Character Lock: ${lock}. Outfit Lock: ${outfitLock}.`;

  return {
    mode,
    gender,
    ageRange,
    lock,
    outfitLock,
    notes,
    subjectPhrase,
    reference,
    identityRule
  };
}

function buildBackgroundControl(ctx, state) {
  const mode = clean(state.backgroundMode, 'fixed');
  const lock = clean(state.backgroundLock, 'strong');
  const label = clean(state.backgroundLabel, 'Main Background');
  const description = firstNonEmpty(state.backgroundDescription, ctx.rawBackground, ctx.background?.directive, 'auto by category');
  const lightingLock = clean(state.lightingLock, 'same_mood');
  const continuityStrength = clean(state.continuityStrength, 'strong');

  const continuityRule = mode === 'fixed'
    ? `Keep the same environment identity across all scenes. Angle may change, but room identity, surface materials, prop style, layout logic, and lighting mood must remain consistent. Background Lock: ${lock}.`
    : mode === 'flexible_same_style'
      ? `Keep the same style world and lighting mood, but allow different angles or nearby areas. Continuity strength: ${continuityStrength}.`
      : mode === 'follow_uploaded_reference'
        ? `Follow uploaded background reference if available. Preserve room identity, material, prop style, and lighting mood.`
        : `Use category-appropriate background while keeping continuity believable.`;

  return {
    mode,
    lock,
    label,
    description,
    lightingLock,
    continuityStrength,
    continuityRule
  };
}

function productReferenceBrief(productReferences) {
  return productReferences.map(r => {
    const uploadStatus = r.uploaded ? 'uploaded' : 'not uploaded/configured';
    return `Product Ref ${r.id.replace('prod','')}:
Role: ${r.roleLabel}
Status: ${uploadStatus}
Instruction: ${r.instruction}`;
  }).join('\n\n');
}

function sceneMapBrief(sceneProductMap) {
  return Object.values(sceneProductMap).map(item => {
    return `Scene ${item.scene}: ${item.refLabels.length ? item.refLabels.join(' + ') : 'None'}, visibility: ${item.visibility}, role: ${item.role}, instruction: ${item.instruction}`;
  }).join('\n');
}

function formatSceneProductBlock(sceneMapItem, productReferences) {
  if (!sceneMapItem) return 'Auto product reference continuity.';

  const refs = sceneMapItem.refs.map(id => productReferences.find(r => r.id === id)).filter(Boolean);

  if (!refs.length) {
    return `No product reference selected for this scene. Keep product use minimal unless story requires it.`;
  }

  const refLines = refs.map(r => {
    return `${r.label} (${r.roleLabel}): ${r.instruction}`;
  }).join(' | ');

  return `This scene uses ${sceneMapItem.refLabels.join(' + ')}. Visibility: ${sceneMapItem.visibility}. Role in scene: ${sceneMapItem.role}. Scene instruction: ${sceneMapItem.instruction}. Reference rules: ${refLines}. Do not merge references into a new product, do not redesign packaging, do not invent a new variant.`;
}

export function buildReferenceControl(ctx, state) {
  const productReferences = buildProductReferences(state, ctx);
  const sceneProductMap = buildSceneProductMap(ctx, state, productReferences);
  const characterControl = buildCharacterControl(ctx, state);
  const backgroundControl = buildBackgroundControl(ctx, state);

  const activeRefIdSet = new Set(Object.values(sceneProductMap).flatMap(item => item.refs || []));
  const activeProductRefs = productReferences.filter(ref => activeRefIdSet.has(ref.id));

  const sceneBlocks = {};
  Object.keys(sceneProductMap).forEach(sceneNo => {
    sceneBlocks[sceneNo] = formatSceneProductBlock(sceneProductMap[sceneNo], productReferences);
  });

  const characterAnchor = `Character Anchor: ${characterControl.subjectPhrase}. ${characterControl.identityRule}${characterControl.notes ? ` Notes: ${characterControl.notes}.` : ''}`;
  const backgroundAnchor = `Background Anchor: ${backgroundControl.label}. Mode: ${backgroundControl.mode}. Description: ${backgroundControl.description}. ${backgroundControl.continuityRule}`;

  const creativeBriefBlock = `
[CHARACTER CONTROL]
Mode: ${characterControl.mode}
Gender: ${characterControl.gender}
Age Range: ${characterControl.ageRange}
Character Lock: ${characterControl.lock}
Outfit Lock: ${characterControl.outfitLock}
Reference Character: ${characterControl.reference}
Subject Phrase: ${characterControl.subjectPhrase}
Notes: ${characterControl.notes || 'none'}
Identity Rule: ${characterControl.identityRule}

[BACKGROUND CONTROL]
Mode: ${backgroundControl.mode}
Background Lock: ${backgroundControl.lock}
Label: ${backgroundControl.label}
Description: ${backgroundControl.description}
Lighting Lock: ${backgroundControl.lightingLock}
Continuity Strength: ${backgroundControl.continuityStrength}
Continuity Rule: ${backgroundControl.continuityRule}

[PRODUCT REFERENCES 1-4]
${productReferenceBrief(productReferences)}

[SCENE PRODUCT REFERENCE MAP]
${sceneMapBrief(sceneProductMap)}
`.trim();

  return {
    characterControl,
    backgroundControl,
    productReferences,
    activeProductRefs,
    sceneProductMap,
    sceneBlocks,
    characterAnchor,
    backgroundAnchor,
    creativeBriefBlock
  };
}
