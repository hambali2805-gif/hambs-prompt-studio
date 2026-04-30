function list(v, fallback = 'none') {
  return Array.isArray(v) && v.length ? v.filter(Boolean).join(' | ') : fallback;
}

function labelValue(value, fallback = 'auto') {
  return String(value || fallback).replace(/_/g, ' ');
}

export function categoryPresentationHint(ctx) {
  const parent = ctx.parentType || '';
  const type = ctx.productType || '';
  const cat = String(ctx.category || '').toUpperCase();

  if (parent === 'food' || cat.includes('MAKANAN') || type.includes('noodle')) {
    return 'Food presentation must focus on taste demo, aroma proof, texture close-up, steam/serving moment, and first bite reaction. Avoid skincare-style before/after or efficacy language.';
  }
  if (parent === 'drink' || cat.includes('MINUMAN')) {
    return 'Drink presentation must focus on pour, ice/condensation, sip reaction, refreshment, texture/color, and serving moment.';
  }
  if (cat.includes('SKINCARE')) {
    return 'Skincare presentation must focus on texture, apply/blend, routine integration, mirror finish, and safe visible result. Avoid medical claims.';
  }
  if (cat.includes('ELEKTRONIK')) {
    return 'Electronics presentation must focus on real device use, buttons/ports/screen/case, feature demo, and problem-solution proof without inventing specs.';
  }
  if (cat.includes('FASHION')) {
    return 'Fashion presentation must focus on fit, fabric movement, styling, mirror/body movement, and daily outfit context.';
  }
  return 'Presentation must match the real product category and show physical product proof.';
}

export function buildSceneRules(ctx) {
  if (ctx.mode === 'ads') {
    return [
      'Scene 1: attention hook only; no full demo yet',
      'Scene 2: problem or desire setup',
      'Scene 3: product reveal with clear product visibility',
      'Scene 4: key feature or sensory/detail proof',
      'Scene 5: demo action with physical use',
      'Scene 6: benefit translated into real life',
      'Scene 7: proof/reaction/comparison without unsupported claims',
      'Scene 8: lifestyle integration',
      'Scene 9: hero product memory shot',
      'Scene 10: CTA matched to selected CTA type'
    ];
  }
  return [
    'Scene 1: hook only; show problem/curiosity, do not start the main demo yet',
    'Scene 2: setup/pain/need; introduce why the product matters',
    'Scene 3: demo; one physical product-use action',
    'Scene 4: proof/reaction; show sensory or visible evidence',
    'Scene 5: CTA/closing; first bite/result/memory anchor and soft recommendation'
  ];
}

export function buildCreativeBrief(ctx) {
  const platform = ctx.platformProfile || {};
  const imageEngine = ctx.imageEngineProfile || {};
  const videoEngine = ctx.videoEngineProfile || {};
  const rules = ctx.rules || {};

  return `
[CONTENT]
Mode: ${(ctx.mode || 'ugc').toUpperCase()}
Target Platform: ${platform.label || ctx.targetPlatform}
Content Goal: ${labelValue(ctx.contentGoal)}
Duration: ${ctx.contentDuration || '15s'}
Scene Count: ${ctx.totalScenes}
Language: ${ctx.language}
Tone: ${ctx.speech?.label || ctx.speechKey}
Persona: ${ctx.persona?.label || ctx.personaKey}
Energy: ${ctx.energy}
Realism: ${ctx.realism}

[PLATFORM RULES]
Hook Rule: ${platform.hookRule || 'clear hook in first seconds'}
Pacing: ${platform.pacing || 'balanced'}
Camera: ${platform.camera || 'vertical social video'}
Visual Style: ${platform.visual || 'social content'}
VO Style: ${platform.vo || 'natural'}
CTA Style: ${platform.cta || 'soft recommendation'}
Avoid: ${list(platform.avoid)}

[PRODUCT]
Name: ${ctx.productName}
Category: ${ctx.category}
Detected Type: ${ctx.productTypeLabel} (${ctx.productType})
Description: ${ctx.productDescription || 'none'}
Main Benefit: ${ctx.mainBenefit || list(rules.benefits)}
Pain Point: ${ctx.painPoint || list(rules.painPoints)}
Usage Moment: ${ctx.usageMoment || list(rules.contexts)}
USP/Offer: ${ctx.offer || 'none; do not invent discounts or promos'}
Claim Safety: ${ctx.claimSafety || 'safe/general; do not invent medical, clinical, or guaranteed claims'}
Reference Focus: ${list(rules.referenceFocus)}

[AUDIENCE]
Target Audience: ${ctx.targetAudience || 'general audience'}

[VISUAL]
Character Reference: ${ctx.references?.hasCharacter ? 'yes, preserve character identity' : 'no'}
Product Reference: ${ctx.references?.hasProduct ? 'yes, preserve product identity' : 'no'}
Background: ${ctx.background?.directive || 'auto'}
Visual Style: ${ctx.videoStyle?.label || ctx.videoStyleKey}
Camera Style: ${ctx.cameraStyle || ctx.videoStyle?.camera || 'auto'}
Lens Style: ${ctx.lensStyle}
Product Visibility: ${labelValue(ctx.productVisibility, 'balanced')}

${ctx.referenceControl?.creativeBriefBlock || ''}

[ENGINE]
Image Engine: ${imageEngine.label || ctx.imageModel}
Image Engine Role: ${imageEngine.role || 'image prompt'}
Image Rules: ${list(imageEngine.promptRules)}
Video Engine: ${videoEngine.label || ctx.videoModel}
Video Engine Role: ${videoEngine.role || 'video prompt'}
Video Rules: ${list(videoEngine.promptRules)}

[PRESENTATION]
Presentation Type: ${ctx.presentation?.label || ctx.presentationType}
Presentation Purpose: ${ctx.presentation?.purpose || 'show product clearly'}
Category Presentation Hint: ${categoryPresentationHint(ctx)}

[CATEGORY QUALITY PROFILE]
Final Category: ${ctx.finalCategory || ctx.category}
Quality Key: ${ctx.categoryQualityKey || 'generic_product'}
Presentation Keywords: ${ctx.presentationKeywords || 'auto'}
Allowed Actions: ${list(ctx.categoryQualityProfile?.allowedActions)}
Forbidden Cross-Category Actions: ${list(ctx.categoryQualityProfile?.forbiddenPhrases)}
Hook Type: ${labelValue(ctx.hookType)}
CTA Type: ${labelValue(ctx.ctaType, 'soft recommendation')}

[SCENE RULES]
${buildSceneRules(ctx).map(x => `- ${x}`).join('\n')}

[NEGATIVE RULES]
${ctx.negativePrompt}

[TASK]
Create a structured story plan only. The tool will build final image/video prompts later.
Return JSON only. For each scene, provide title, phase, vo, visualSummary, mainAction, cameraDirection, emotion, duration, continuity, mustInclude, avoid, and meaning.
`.trim();
}
