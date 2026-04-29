// ==================== REFERENCE CONTROL LAYER ====================
// Centralized helper so character/product references are handled consistently
// across UGC, Ads, Banana Pro, GPT Image, Veo, and Seedance.

export function hasCharacterReference(uploadedFiles) {
    return !!uploadedFiles?.char;
}

export function hasProductReference(uploadedFiles) {
    return !!uploadedFiles?.prod?.some(Boolean);
}

export function sceneStartsWithSubject(sceneDesc, subject) {
    const scene = String(sceneDesc || '').trim().toLowerCase();
    const subj = String(subject || '').trim().toLowerCase();
    if (!scene || !subj) return false;
    return scene.startsWith(subj) || scene.startsWith(`[ref:character] ${subj}`);
}

export function buildCharacterPrefix({ uploadedFiles, gender, sceneDesc = '', mode = 'ugc' }) {
    const subject = gender?.subj || 'A young Indonesian person';
    if (sceneStartsWithSubject(sceneDesc, subject)) return '';

    if (hasCharacterReference(uploadedFiles)) {
        return mode === 'ugc'
            ? `[REF:CHARACTER] Use the uploaded character as the same real creator/person, keep face, hair, age, outfit style, and body proportion consistent, `
            : `[REF:CHARACTER] Use the uploaded character as consistent campaign talent, keep face, hair, age, outfit style, and body proportion consistent, `;
    }

    return `${subject}, `;
}

export function buildProductReferencePhrase({ uploadedFiles, productName, category, mode = 'ugc' }) {
    if (hasProductReference(uploadedFiles)) {
        return mode === 'ugc'
            ? `[REF:PRODUCT] use the uploaded product naturally in hand, on table, or during real use; keep packaging shape, colors, label layout, and scale consistent`
            : `[REF:PRODUCT] use the uploaded product accurately as the hero product; keep packaging shape, colors, label layout, scale, and product identity consistent`;
    }

    return `${productName || 'Product'} (${category || 'category'}), no product reference provided: do not invent unreadable labels or fake packaging details`;
}

export function buildReferenceControlBlock({ uploadedFiles, gender, productName, category, mode = 'ugc', platform = 'generic' }) {
    const hasChar = hasCharacterReference(uploadedFiles);
    const hasProd = hasProductReference(uploadedFiles);
    const subject = gender?.subj || 'A young Indonesian person';

    const charLine = hasChar
        ? `- Character reference provided: use the same person across every ${platform} output; maintain consistent face, hair, age, outfit style, and body proportion.`
        : `- No character reference: explicitly use a consistent subject in every scene: ${subject}.`;

    const prodLine = hasProd
        ? `- Product reference provided: keep packaging/product shape, colors, label layout, material, and scale consistent.`
        : `- No product reference: use product name/category only (${productName || 'Product'} / ${category || 'Category'}); avoid fake labels, fake logos, and invented packaging claims.`;

    const modeLine = mode === 'ugc'
        ? '- UGC reference behavior: product and character should feel naturally captured, not over-posed or floating.'
        : '- Ads reference behavior: product and character should be polished, clear, brand-safe, and intentionally composed.';

    return `REFERENCE CONTROL:\n${charLine}\n${prodLine}\n${modeLine}`;
}
