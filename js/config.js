// ==================== GLOBAL CONFIG ====================
export const GEMINI_MODEL = 'gemini-2.0-flash';
export const SESSION_KEY = 'hambs_session_v27';
export const PROJECTS_KEY = 'hambs_projects_v27';
export const API_KEY_STORAGE = 'hambs_gemini_key';
export const TARGET_AD_SHOTS = 10;
export const TARGET_UGC_SHOTS = 5;
export const SHOT_COLORS = ['yellow','blue','teal','purple','red','yellow','blue','teal','purple','red'];

export function getGeminiApiUrl(key) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
}

// Engine config — dynamically affects prompt generation
export const engineConfig = {
    mode: 'ugc',           // 'ugc' | 'ads'
    platform: 'veo',       // 'veo' | 'seedance'
    persona: 'best_friend',// 'best_friend' | 'reviewer' | 'seller' | 'storyteller'
    energy: 'medium',      // 'low' | 'medium' | 'high' | 'chaotic'
    realism: 70            // 0-100
};

export function updateConfig(partial) {
    Object.assign(engineConfig, partial);
}

export function getConfig() {
    return { ...engineConfig };
}

// Persona definitions
export const PERSONAS = {
    best_friend: {
        label: 'Best Friend',
        icon: '👯',
        toneGuide: 'Bicara kayak teman dekat, santai, pakai "gue/lo", humor ringan, sering bilang "sih", "dong", "literally".',
        englishGuide: 'Speak like a close friend, casual, use slang, light humor, relatable tone.',
        voiceStyle: 'warm, relatable, peer-to-peer'
    },
    reviewer: {
        label: 'Honest Reviewer',
        icon: '🔍',
        toneGuide: 'Bicara kayak reviewer jujur, analitis tapi tetap friendly, kasih pros-cons, detail produk.',
        englishGuide: 'Speak like an honest reviewer, analytical yet friendly, give pros-cons, product details.',
        voiceStyle: 'analytical, trustworthy, detail-oriented'
    },
    seller: {
        label: 'Confident Seller',
        icon: '💼',
        toneGuide: 'Bicara kayak salesperson yang percaya diri, persuasif, fokus ke benefit, pakai power words.',
        englishGuide: 'Speak like a confident salesperson, persuasive, benefit-focused, use power words.',
        voiceStyle: 'persuasive, confident, benefit-driven'
    },
    storyteller: {
        label: 'Storyteller',
        icon: '📖',
        toneGuide: 'Bicara kayak pendongeng, mulai dari masalah, bangun emosi, bawa ke solusi, bikin penonton penasaran.',
        englishGuide: 'Speak like a storyteller, start with a problem, build emotion, lead to solution, keep viewers curious.',
        voiceStyle: 'narrative, emotional, suspenseful'
    }
};

// Energy definitions
export const ENERGY_LEVELS = {
    low: {
        label: 'Calm & Soft',
        icon: '🌙',
        pacing: 'slow, deliberate, whisper-like',
        cameraEnergy: 'static or very slow movement',
        editStyle: 'long takes, minimal cuts'
    },
    medium: {
        label: 'Balanced',
        icon: '⚡',
        pacing: 'conversational, natural rhythm',
        cameraEnergy: 'gentle movement, smooth transitions',
        editStyle: 'standard cuts, natural flow'
    },
    high: {
        label: 'Energetic',
        icon: '🔥',
        pacing: 'fast, upbeat, punchy',
        cameraEnergy: 'dynamic movement, quick repositions',
        editStyle: 'fast cuts, jump cuts, high tempo'
    },
    chaotic: {
        label: 'Chaotic / Viral',
        icon: '🌪️',
        pacing: 'rapid-fire, unpredictable, meme-like',
        cameraEnergy: 'extreme handheld, whip pans, zoom punches',
        editStyle: 'smash cuts, pattern interrupts, no rules'
    }
};
