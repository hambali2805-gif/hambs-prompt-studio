export function buildReferenceDirectives(context){
 const hasChar=!!context.references?.hasCharacter; const hasProduct=!!context.references?.hasProduct; const focus=(context.rules.referenceFocus||[]).join(', ');
 const char=hasChar?'Use uploaded character reference as identity anchor: keep face, age, skin tone, hairstyle, body proportion, and outfit continuity.':'No character reference uploaded: define the human subject clearly in every scene.';
 const prod=hasProduct?`Use uploaded product reference as product anchor: preserve ${focus}. Do not redesign the product.`:`No product reference uploaded: describe product form clearly using product type: ${context.productTypeLabel}.`;
 return {char,prod,summary:`${char} ${prod}`};
}
