// ==================== ADS ENGINE (CINEMATIC MODE) ====================
// Cinematic lighting and framing. Product beauty focus.
// Smooth camera motion (dolly, macro, slow motion).
// Clean and polished scenes — premium commercial ads.

import { engineConfig, PERSONAS, ENERGY_LEVELS } from '../config.js';
import { state } from '../state.js';
import { getSceneArc } from '../core/storyArc.js';
import { buildCTADirective } from '../core/ctaBuilder.js';
import { getSceneVariation } from '../core/sceneVariation.js';

// Ads cinematic lighting setups
const CINEMATIC_LIGHTING = [
    'three-point studio setup: key (softbox 45deg), fill (bounce), rim (backlight)',
    'volumetric fog with directional beam, moody atmosphere',
    'golden hour simulation, warm directional with long shadows',
    'high-key clean lighting, product photography grade',
    'dramatic chiaroscuro, deep shadows with bright highlights',
    'neon-practical hybrid, modern commercial aesthetic'
];

// Ads camera movements
const CINEMATIC_MOVEMENTS = [
    'slow dolly-in with shallow DOF transition',
    'smooth orbital tracking, 180-degree arc',
    'crane descending from high to eye-level',
    'macro push-in with rack focus',
    'steady slider tracking with parallax layers',
    'slow-motion reveal, overcranked at 120fps',
    'elegant tilt-up from product to model',
    'pull-back to wide establishing shot',
    'Hitchcock dolly-zoom for dramatic emphasis',
    'smooth Steadicam walk-and-reveal'
];

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function getAdsStyleContext() {
    const energy = ENERGY_LEVELS[engineConfig.energy] || ENERGY_LEVELS.medium;

    return {
        camera: 'stable cinematic movement, slider, crane, tripod-locked. NO handheld.',
        lighting: pickRandom(CINEMATIC_LIGHTING),
        vibe: `high production value, premium, aspirational, ${energy.pacing}`,
        background: 'perfectly curated studio or premium location',
        outfit: 'professional styling, polished look, wardrobe department quality',
        movement: pickRandom(CINEMATIC_MOVEMENTS),
        energy: energy.pacing,
        editStyle: energy.editStyle
    };
}

export function buildAdsVoiceoverPrompt(info) {
    const persona = PERSONAS[engineConfig.persona] || PERSONAS.seller;
    const energy = ENERGY_LEVELS[engineConfig.energy] || ENERGY_LEVELS.medium;
    const ctaDirective = buildCTADirective(state.selectedLang);
    const langNote = state.selectedLang === 'EN' ? 'Write entirely in English.' : 'Tulis dalam Bahasa Indonesia.';

    const isBeverage = info.name.toLowerCase().match(/teh|tea|minum|drink|jus|juice|kopi|coffee|susu|milk/);
    const productTerms = isBeverage
        ? 'PENTING: Produk ini adalah minuman. Gunakan terminologi yang tepat untuk botol/minuman.'
        : '';

    return `Kamu adalah copywriter iklan profesional dan narrator director.
Voice persona: ${persona.label} — ${persona.voiceStyle}
Energy: ${engineConfig.energy} — ${energy.pacing}

Buat NASKAH VOICEOVER NARATOR untuk video iklan cinematic:
- Produk: ${info.name}
- Kategori: ${info.category}
- Deskripsi: ${info.desc || 'tidak ada'}
${productTerms}
${langNote}

STORY ARC CINEMATIC (10 scene WAJIB):
1. Opening Hook — Dramatic visual opening
2. Brand Story — Establish brand identity
3. Product Reveal — Dramatic introduction
4. Feature Highlight 1 — Key feature macro detail
5. Feature Highlight 2 — Secondary feature, different angle
6. Key Benefits — Connect to emotional benefits
7. Social Proof — Trust and credibility
8. Demonstration — Product in action
9. Emotional Appeal — Emotional peak
10. Closing CTA — ${ctaDirective.instruction}

Gaya: Profesional, cinematic, meyakinkan. Premium brand voice.
Durasi total sekitar 60 detik.
Tambahkan EJAAN FONETIK dalam kurung untuk kata asing.
Langsung tulis naskahnya tanpa judul/header. Pisahkan tiap scene dengan baris baru.
Scene terakhir HARUS mengandung: urgency + emotional trigger + clear action.`;
}

export function buildAdsScenePrompt(info, sceneNum, voSnippet, totalScenes) {
    const gender = getGenderDesc();
    const style = getAdsStyleContext();
    const arc = getSceneArc('ads', sceneNum - 1);
    const variation = getSceneVariation(sceneNum - 1, false);

    const isBeverage = info.name.toLowerCase().match(/teh|tea|minum|drink|jus|juice|kopi|coffee|susu|milk/);
    const productInteraction = isBeverage
        ? 'elegant pour, product hero shot with condensation, premium presentation'
        : `premium interaction with ${info.name}, cinematic product showcase`;

    return `Kamu adalah AI Director untuk iklan komersial cinematic. Mode: PREMIUM ADS.
Buat DESKRIPSI VISUAL untuk Scene ${sceneNum}/${totalScenes}.

STORY ARC PHASE: ${arc.label}
PURPOSE: ${arc.purpose}
DIRECTION: ${arc.direction}

${variation.directive}

Produk: ${info.name} (${info.category})${isBeverage ? ' — PET bottle, cold with condensation droplets, vibrant amber tea color' : ''}
Naskah narator scene ini: "${voSnippet}"
Gaya: ${state.selectedStyle}, cinematic, professional.
Karakter: ${gender.subj}, ${style.outfit}

CINEMATIC ADS RULES:
- Camera: ${style.camera}. Movement: ${style.movement}
- Lighting: ${style.lighting}
- Production value: HIGH. This is a premium commercial.
- Product beauty: Product must look aspirational, perfect, desirable.
- Clean and polished: No imperfections, no mess, no casual elements.
- Interaksi produk: ${productInteraction}

${arc.phase === 'hook' ? 'PENTING Opening: Dramatic, mysterious, beautiful. Set the cinematic tone.' : ''}
${arc.phase === 'cta' ? 'PENTING CTA: Final hero shot + brand lockup. Clean, powerful, memorable.' : ''}

Tulis deskripsi visual singkat (2-3 kalimat bahasa Inggris).
Fokus: premium cinematic composition, professional lighting, product beauty.
Output HANYA deskripsi visual, tanpa judul atau label.`;
}

function getGenderDesc() {
    const g = document.getElementById('charGender')?.value || 'wanita';
    return g === 'pria'
        ? { subj: 'A young Indonesian man', pronoun: 'he', possessive: 'his' }
        : { subj: 'A young Indonesian woman', pronoun: 'she', possessive: 'her' };
}
