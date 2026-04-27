// ==================== STORY ARC ENFORCEMENT ====================
// Ensures scenes follow: Hook -> Problem -> Discovery -> Proof -> CTA

export const STORY_ARC = {
    ugc: [
        {
            phase: 'hook',
            label: 'HOOK — Pattern Interrupt',
            purpose: 'Grab attention in first 3 seconds',
            direction: 'Start with a bold, unexpected statement or visual that stops scrolling. Pattern interrupt.',
            voGuide: 'Open with a shocking question, bold claim, or relatable frustration. Maximum impact.'
        },
        {
            phase: 'problem',
            label: 'PROBLEM — Pain Point',
            purpose: 'Create emotional connection through shared frustration',
            direction: 'Show the struggle or frustration the viewer relates to. Build empathy.',
            voGuide: 'Describe the problem authentically. Use "gue juga dulu..." or "lo pasti pernah..." style.'
        },
        {
            phase: 'discovery',
            label: 'DISCOVERY — Product Reveal',
            purpose: 'Introduce product as the unexpected solution',
            direction: 'Natural discovery moment. Not a sales pitch — a genuine find.',
            voGuide: 'Transition from problem to discovery. "Tapi pas gue nyobain ini..." moment.'
        },
        {
            phase: 'proof',
            label: 'PROOF — Show Results',
            purpose: 'Demonstrate tangible results or experience',
            direction: 'Show the product in action. Real results, real reactions. Close-up details.',
            voGuide: 'Give specific proof points. Texture, smell, feel, results. Be concrete, not vague.'
        },
        {
            phase: 'cta',
            label: 'CTA — Call to Action',
            purpose: 'Drive immediate action with urgency',
            direction: 'Direct, confident CTA. Show product one last time. Energy peak.',
            voGuide: 'Urgency + emotional trigger + clear action. "Link di bio", "Buruan sebelum habis".'
        }
    ],
    ads: [
        {
            phase: 'hook',
            label: 'Opening Hook',
            purpose: 'Cinematic attention grab',
            direction: 'Dramatic visual opening. Mystery, beauty, or intrigue. Set the mood.',
            voGuide: 'One powerful line that sets the stage. Evocative and cinematic.'
        },
        {
            phase: 'brand_story',
            label: 'Brand Story',
            purpose: 'Establish brand identity and values',
            direction: 'Elegant visuals establishing brand world. Premium feel.',
            voGuide: 'Introduce the brand philosophy. Aspirational but grounded.'
        },
        {
            phase: 'product_reveal',
            label: 'Product Reveal',
            purpose: 'Dramatic product introduction',
            direction: 'Hero shot of product. Cinematic lighting, slow reveal.',
            voGuide: 'Build anticipation, then reveal. Make the product the star.'
        },
        {
            phase: 'feature_1',
            label: 'Feature Highlight 1',
            purpose: 'Showcase key feature with macro detail',
            direction: 'Macro detail shot. Texture, material quality, craftsmanship.',
            voGuide: 'Highlight the most impressive feature. Technical but accessible.'
        },
        {
            phase: 'feature_2',
            label: 'Feature Highlight 2',
            purpose: 'Showcase secondary feature',
            direction: 'Different angle, different detail. Show versatility.',
            voGuide: 'Second key selling point. Build the case.'
        },
        {
            phase: 'benefit',
            label: 'Key Benefits',
            purpose: 'Connect features to emotional benefits',
            direction: 'Lifestyle integration. Product in use, natural setting.',
            voGuide: 'Translate features into life improvements. Emotional resonance.'
        },
        {
            phase: 'social_proof',
            label: 'Social Proof',
            purpose: 'Build trust and credibility',
            direction: 'Testimonial-style framing or usage montage.',
            voGuide: 'Numbers, testimonials, trust signals. "Dipercaya jutaan..."'
        },
        {
            phase: 'demonstration',
            label: 'Demonstration',
            purpose: 'Show product in action',
            direction: 'Dynamic demonstration. Product being used, results visible.',
            voGuide: 'Show dont tell. The product delivering on its promise.'
        },
        {
            phase: 'emotional',
            label: 'Emotional Appeal',
            purpose: 'Create emotional peak before CTA',
            direction: 'Close-up emotional reaction. Satisfaction, joy, transformation.',
            voGuide: 'Hit the emotional core. Why this matters. What life looks like now.'
        },
        {
            phase: 'cta',
            label: 'Closing CTA',
            purpose: 'Drive conversion with urgency',
            direction: 'Final hero shot + brand lockup. Clean, powerful, memorable.',
            voGuide: 'Urgency + aspiration + clear action. Premium tone, strong close.'
        }
    ]
};

export function getSceneArc(mode, sceneIndex) {
    const arc = STORY_ARC[mode] || STORY_ARC.ugc;
    return arc[sceneIndex] || arc[arc.length - 1];
}

export function getArcLength(mode) {
    return (STORY_ARC[mode] || STORY_ARC.ugc).length;
}

export function enforceStoryProgression(scenes) {
    const phases = scenes.map(s => s.phase);
    const hasCTA = phases.includes('cta');
    const hasHook = phases.includes('hook');
    return { valid: hasCTA && hasHook, phases };
}
