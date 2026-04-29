import { buildRoleplayBlock } from './roleplayProfiles.js';

export function buildGeminiPrompt(ctx){
 const roleplay = buildRoleplayBlock(ctx);
 return `${roleplay}

OUTPUT CONTRACT
You are HAMBS V5 Clean Engine. Generate a complete production plan as STRICT VALID JSON only. No markdown, no commentary, no code fence.

PRODUCT
- Name: ${ctx.productName}
- Category: ${ctx.category}
- Detected product type: ${ctx.productTypeLabel} (${ctx.productType}), confidence ${ctx.productConfidence}, evidence: ${ctx.productEvidence.join(', ') || 'fallback'}
- Description: ${ctx.productDescription || 'none'}

CONTENT CONTEXT
- Mode: ${ctx.mode.toUpperCase()} (${ctx.mode==='ugc'?'native creator content, personal, realistic':'brand ad, polished, persuasive, brand-safe'})
- Presentation format: ${ctx.presentation.label} — ${ctx.presentation.purpose}
- Video style: ${ctx.videoStyle.label} — ${ctx.videoStyle.visual}
- Image model: ${ctx.imageModel}
- Video model: ${ctx.videoModel}
- Persona: ${ctx.persona.label} — ${ctx.persona.role}
- Speech style: ${ctx.speech.label} — ${ctx.speech.rule}
- Background: ${ctx.background.directive}

PRODUCT-SPECIFIC RULES
- Benefits to use: ${ctx.rules.benefits.join(' | ')}
- Pain points: ${ctx.rules.painPoints.join(' | ')}
- Visual actions: ${ctx.rules.actions.join(' | ')}
- Motion mechanics: ${ctx.rules.motions.join(' | ')}
- Reference focus: ${ctx.rules.referenceFocus.join(' | ')}
- Must avoid: ${ctx.rules.avoid.join(' | ')}
- Presentation visual rules: ${ctx.presentation.visualRules.join(' | ')}
- Presentation motion rules: ${ctx.presentation.motionRules.join(' | ')}
- Negative prompt: ${ctx.negativePrompt}

REFERENCE HANDLING
${ctx.referenceDirectives.summary}

OUTPUT SCHEMA:
{
  "voiceover": "full VO combined, scene by scene",
  "scenes": [
    {
      "title": "short title",
      "phase": "hook/problem/demo/proof/cta/etc",
      "vo": "human natural VO for this scene",
      "duration": "2-4s",
      "emotion": "short emotion label",
      "description": "specific visual scene description with human subject and product action",
      "mustInclude": ["physical details"],
      "avoid": ["wrong details"],
      "meaning": "why this scene exists"
    }
  ]
}

REQUIREMENTS:
- Exactly ${ctx.totalScenes} scenes.
- Every scene must be product-type aware. Do not use generic stock footage.
- If product type is footwear/running shoes, include feet, shoe, sole, laces, step/walk/jog mechanics. Do not treat it as clothing/fabric OOTD.
- If skincare, show texture/apply/blend/mirror finish without medical claims.
- If food/drink, show prep/serving/sensory/first bite or sip.
- If electronics, show device shape, buttons/ports/screen/case and real use.
- Keep UGC and Ads different. UGC = personal creator realism. Ads = polished brand-safe story.
- Do not invent unsupported specs, discounts, testimonials, or medical claims.
- Return JSON only.`;
}
