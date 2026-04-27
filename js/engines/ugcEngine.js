// ==================== UGC ENGINE (REALISM MODE) ====================
// Category-aware UGC generation.
// Environments, actions, and sensory details are driven by CATEGORY_RULES.
// Handheld phone recording with imperfections — authentic user-generated content.

import { engineConfig, PERSONAS, ENERGY_LEVELS } from '../config.js';
import { state } from '../state.js';
import { getSceneArc } from '../core/storyArc.js';
import { buildCTADirective } from '../core/ctaBuilder.js';
import { getViralHookDirective } from '../core/viralMechanics.js';
import { getSceneVariation } from '../core/sceneVariation.js';
import { getCategoryData, pickCategoryEnvironment, pickCategoryAction, pickCategorySensory, getCategoryNegativeContext } from '../categoryRules.js';

const UGC_IMPERFECTIONS = [
    'slight camera shake from handheld grip',
    'natural lens flare from window light',
    'slightly overexposed highlights, phone camera auto-exposure',
    'uneven ambient lighting, mix of warm and cool',
    'background slightly out of focus, phone bokeh simulation',
    'micro-jitter from breathing while recording',
    'auto-focus hunting briefly before locking',
    'slight motion blur on fast hand movements'
];

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function getUGCStyleContext(categoryData) {
    const energy = ENERGY_LEVELS[engineConfig.energy] || ENERGY_LEVELS.medium;
    const realism = engineConfig.realism;
    const imperfectionLevel = realism > 70 ? 'heavy' : realism > 40 ? 'moderate' : 'light';

    const environment = categoryData
        ? pickCategoryEnvironment(categoryData)
        : 'casual everyday setting';

    return {
        camera: `handheld phone camera, ${pickRandom(UGC_IMPERFECTIONS)}, selfie-mode framing`,
        lighting: 'natural light only — window, ambient room, or outdoor. NO studio setup.',
        vibe: `casual, relatable, person-next-door, ${energy.pacing}`,
        background: state.ugcBackground || environment,
        outfit: 'casual everyday outfit, no professional styling',
        imperfections: `Realism level: ${realism}/100 (${imperfectionLevel}). Include natural imperfections: ${pickRandom(UGC_IMPERFECTIONS)}.`,
        energy: energy.pacing,
        editStyle: energy.editStyle
    };
}

export function buildUGCVoiceoverPrompt(info, categoryData) {
    const persona = PERSONAS[engineConfig.persona] || PERSONAS.best_friend;
    const energy = ENERGY_LEVELS[engineConfig.energy] || ENERGY_LEVELS.medium;
    const viralHook = getViralHookDirective(state.selectedLang);
    const ctaDirective = buildCTADirective(state.selectedLang);
    const langNote = state.selectedLang === 'EN' ? 'Write entirely in English.' : 'Tulis dalam Bahasa Indonesia.';

    const toneGuide = state.selectedLang === 'EN' ? persona.englishGuide : persona.toneGuide;

    const categoryContext = categoryData
        ? `\nCATEGORY CONTEXT (${info.category}):
- Voice style: ${categoryData.voiceStyle}
- Product interaction: ${categoryData.productInteraction}
- Sensory focus: ${categoryData.sensory.join(', ')}
- MUST include these elements in the script: ${categoryData.requiredElements.join(', ')}
- DO NOT reference: ${getCategoryNegativeContext(categoryData)}`
        : '';

    return `Kamu adalah content creator UGC TikTok dengan persona: ${persona.label}.
Voice style: ${persona.voiceStyle}
Energy level: ${engineConfig.energy} — ${energy.pacing}

${viralHook.instruction}

Buat NASKAH VOICEOVER untuk video UGC TikTok Affiliate:
- Produk: ${info.name}
- Kategori: ${info.category}
- Deskripsi: ${info.desc || 'tidak ada'}
${categoryContext}
${langNote}
${toneGuide}

STORY ARC (WAJIB diikuti):
1. HOOK — Pattern interrupt, grab attention dalam 3 detik pertama
2. PROBLEM — Pain point yang relatable
3. DISCOVERY — Momen nemuin produk ini
4. PROOF — Bukti nyata, pengalaman spesifik
5. CTA — ${ctaDirective.instruction}

Contoh pattern interrupt: "${viralHook.patternInterrupt}"
Contoh curiosity gap: "${viralHook.curiosityGap}"

FORMAT: 5 scene. Durasi total 30-45 detik.
Tambahkan EJAAN FONETIK dalam kurung untuk kata asing.
Langsung tulis naskahnya tanpa judul/header. Pisahkan tiap scene dengan baris baru.
Scene terakhir HARUS mengandung: urgency + emotional trigger + clear action.`;
}

export function buildUGCScenePrompt(info, sceneNum, voSnippet, totalScenes, categoryData) {
    const gender = getGenderDesc();
    const style = getUGCStyleContext(categoryData);
    const arc = getSceneArc('ugc', sceneNum - 1);
    const variation = getSceneVariation(sceneNum - 1, true);

    const categoryAction = categoryData ? pickCategoryAction(categoryData) : 'interacting naturally with product';
    const categorySensory = categoryData ? pickCategorySensory(categoryData) : '';
    const negativeContext = categoryData ? getCategoryNegativeContext(categoryData) : '';

    const hasUserBackground = !!state.ugcBackground;
    const envDirective = hasUserBackground
        ? `- Adapt the user-selected background to feel natural for ${info.category.toLowerCase()} content`
        : `- Environment MUST be: ${style.background}`;

    const categoryDirective = categoryData
        ? `\nCATEGORY RULES (${info.category}):
${envDirective}
- Action focus: ${categoryAction}
- Sensory detail: ${categorySensory}
- Product interaction: ${categoryData.productInteraction}
- FORBIDDEN environments: ${negativeContext}
- This scene must feel authentic to how someone actually uses ${info.category.toLowerCase()} in real life.`
        : '';

    return `Kamu adalah AI Director untuk UGC TikTok. Mode: REALISM.
Buat DESKRIPSI VISUAL untuk Scene ${sceneNum}/${totalScenes}.

STORY ARC PHASE: ${arc.label}
PURPOSE: ${arc.purpose}
DIRECTION: ${arc.direction}

${variation.directive}

Produk: ${info.name} (${info.category})
Naskah scene ini: "${voSnippet}"
Latar belakang: ${style.background} [LOCK: semua scene HARUS di lokasi yang sama]
Gaya presentasi: ${state.presentationKeywords}
Karakter: ${gender.subj}, ${style.outfit}
${categoryDirective}

UGC REALISM RULES:
- Camera: ${style.camera}
- Lighting: ${style.lighting}
- Imperfections: ${style.imperfections}
- Energy: ${style.energy}
- JANGAN pakai cinematic perfection. Ini harus terasa seperti rekaman HP asli.
- Interaksi produk: ${categoryData ? categoryData.productInteraction : 'natural interaction with product'}

${sceneNum === 1 ? 'PENTING Scene 1: PATTERN INTERRUPT visual. Bold, unexpected, stops scrolling.' : ''}
${arc.phase === 'cta' ? 'PENTING CTA: Energi puncak, tunjukkan produk terakhir kali, direct to camera.' : ''}

Tulis deskripsi visual singkat (2-3 kalimat bahasa Inggris).
Fokus: photorealistic phone-quality, natural imperfections, authentic feel.
Output HANYA deskripsi visual, tanpa judul atau label.`;
}

function getGenderDesc() {
    const g = document.getElementById('charGender')?.value || 'wanita';
    return g === 'pria'
        ? { subj: 'A young Indonesian man', pronoun: 'he', possessive: 'his' }
        : { subj: 'A young Indonesian woman', pronoun: 'she', possessive: 'her' };
}
