const HINTS = {
  skincare: ['bathroom','vanity','bedroom','mirror','hotel'],
  footwear: ['street','gym','fitness','garden','outdoor','asphalt','mirror'],
  clothing: ['bedroom','mirror','street','cafe','hotel'],
  fashion: ['bedroom','mirror','street','cafe','hotel','garden','studio','wardrobe','closet'],
  bag: ['desk','cafe','car','travel','street'],
  accessory: ['desk','mirror','cafe','hotel','street'],
  food: ['kitchen','cafe','table','dining','counter','countertop','stove','bowl','plate','tiles','cutting board','wooden cutting board','fruit bowl','cozy'],
  drink: ['cafe','car','garden','gym','desk','outdoor','table','counter','kitchen'],
  electronics: ['desk','tech','office','bedroom','car','loft']
};

export function adaptBackgroundForContext(context, rawBackground = '') {
  const bg = String(rawBackground || '').toLowerCase();
  const parent = context.parentType || 'generic';
  const hints = HINTS[parent] || [];
  const compatible = !rawBackground || hints.some(h => bg.includes(h));

  if (!rawBackground) {
    return {
      compatible: true,
      directive: (context.rules.contexts || [])[0] || 'realistic daily-life setting',
      note: 'No custom background selected.'
    };
  }

  if (compatible) {
    return {
      compatible: true,
      directive: rawBackground,
      note: 'Selected background is compatible.'
    };
  }

  return {
    compatible: false,
    directive: `${rawBackground} Use it only as a believable corner/transition space; prioritize product-appropriate action: ${(context.rules.contexts || []).slice(0, 2).join(' / ')}.`,
    note: `Background adapted for ${parent}; not blocked.`
  };
}
