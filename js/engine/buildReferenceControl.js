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

function labelRole(role) {
  return PRODUCT_REF_ROLE_LABELS[role] || PRODUCT_REF_ROLE_LABELS.auto;
}

function roleInstruction(role) {
  return PRODUCT_REF_ROLE_INSTRUCTIONS[role] || PRODUCT_REF_ROLE_INSTRUCTIONS.auto;
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

function buildProductReferences(state) {
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
      roleLabel: labelRole(role),
      instruction: customInstruction || roleInstruction(role),
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
  const configuredIds = productReferences
    .filter(r => r.uploaded || r.role !== 'auto' || r.customInstruction)
    .map(r => r.id);

  const availableIds = configuredIds.length ? configuredIds : ['prod1'];
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
  const description = clean(state.backgroundDescription, ctx.rawBackground || ctx.background?.directive || 'auto by category');
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
  const productReferences = buildProductReferences(state);
  const sceneProductMap = buildSceneProductMap(ctx, state, productReferences);
  const characterControl = buildCharacterControl(ctx, state);
  const backgroundControl = buildBackgroundControl(ctx, state);

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
    sceneProductMap,
    sceneBlocks,
    characterAnchor,
    backgroundAnchor,
    creativeBriefBlock
  };
}
