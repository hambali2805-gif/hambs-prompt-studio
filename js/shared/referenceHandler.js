export function buildReferenceDirectives(context){
 const hasChar=!!context.references?.hasCharacter; const hasProduct=!!context.references?.hasProduct; const focus=(context.rules.referenceFocus||[]).join(', ');
 const char=hasChar?'Use uploaded character reference as identity anchor: keep face, age, skin tone, hairstyle, body proportion, and outfit continuity.':'No character reference uploaded: define the human subject clearly in every scene.';
 const prod=hasProduct?`Use uploaded product reference as product anchor: preserve ${focus}. Do not redesign the product.`:`No product reference uploaded: describe product form clearly using product type: ${context.productTypeLabel}.`;
 return {char,prod,summary:`${char} ${prod}`};
}

export function buildCharacterPrefix({ uploadedFiles = {}, gender = {}, sceneDesc = '', mode = 'ugc' } = {}) {
  const hasChar = !!uploadedFiles.char;
  const subject = gender?.subj || 'person';

  if (!hasChar) {
    return `${subject} clearly visible, `;
  }

  return `[REF:CHARACTER] Keep the uploaded character identity consistent: face, age, skin tone, hairstyle, body proportion, and outfit continuity. `;
}

export function buildProductReferencePhrase({ uploadedFiles = {}, productName = 'produk ini', category = '', mode = 'ugc' } = {}) {
  const hasProduct = Array.isArray(uploadedFiles.prod)
    ? uploadedFiles.prod.some(Boolean)
    : !!uploadedFiles.prod;

  if (!hasProduct) {
    return `show ${productName} clearly as a ${category || 'product'}`;
  }

  return `[REF:PRODUCT] Use uploaded product reference for ${productName}; preserve packaging, label, shape, color, material, and proportions; do not redesign the product`;
}

export function buildReferenceControlBlock({ uploadedFiles = {}, gender = {}, productName = 'produk ini', category = '', mode = 'ugc', platform = 'image' } = {}) {
  const hasChar = !!uploadedFiles.char;
  const hasProduct = Array.isArray(uploadedFiles.prod)
    ? uploadedFiles.prod.some(Boolean)
    : !!uploadedFiles.prod;

  const subject = gender?.subj || 'human subject';

  return [
    `Platform: ${platform}.`,
    hasChar
      ? 'Character reference active: preserve identity and continuity exactly.'
      : `No character reference uploaded: define ${subject} clearly in the scene.`,
    hasProduct
      ? `Product reference active: preserve ${productName} visual identity exactly.`
      : `No product reference uploaded: describe ${productName} clearly as ${category || 'the product'}.`,
    mode === 'ugc'
      ? 'Keep the image natural, relatable, and creator-style.'
      : 'Keep the image polished, commercial, and product-forward.'
  ].join(' ');
}

