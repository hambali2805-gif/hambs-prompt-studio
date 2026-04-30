export const PLATFORM_PROFILES = {
  tiktok: {
    label: 'TikTok',
    hookRule: 'grab attention in the first 1-2 seconds with a direct relatable hook',
    pacing: 'fast, punchy, spontaneous, native social pacing',
    camera: 'handheld phone, selfie/POV friendly, slight micro-shake, quick reframes',
    visual: 'natural creator footage, not over-polished, product shown in real daily use',
    vo: 'casual, punchy, conversational, sounds like talking to a friend',
    cta: 'soft conversational CTA such as coba deh / save buat nanti',
    avoid: ['overly polished commercial look', 'slow intro', 'generic stock ad']
  },
  instagram_reels: {
    label: 'Instagram Reels',
    hookRule: 'start with an aesthetic visual hook or clean lifestyle moment',
    pacing: 'smooth, clean, visually satisfying, polished but still human',
    camera: 'stable handheld or clean lifestyle framing, pretty composition, soft movement',
    visual: 'aesthetic lifestyle lighting, clean background, polished creator look',
    vo: 'natural but refined, concise lifestyle wording',
    cta: 'save/share or soft recommendation CTA',
    avoid: ['messy chaotic framing', 'too much slang', 'cluttered product view']
  },
  youtube_shorts: {
    label: 'YouTube Shorts',
    hookRule: 'clear promise or problem in the first line, then step-by-step payoff',
    pacing: 'structured, retention-focused, clear cause-and-effect',
    camera: 'clear demo framing, close-up inserts, readable product action',
    visual: 'clear demonstration with enough context for viewers to understand each step',
    vo: 'informative but casual, slightly more explanatory',
    cta: 'try this / save this / watch until the end style CTA',
    avoid: ['unclear scene jumps', 'random aesthetic shots without explanation']
  },
  facebook_pro: {
    label: 'Facebook Pro / FB Reels',
    hookRule: 'simple everyday hook that a broad audience understands quickly',
    pacing: 'clear, slightly slower, friendly, benefit-forward',
    camera: 'bright readable framing, stable shots, product easy to see',
    visual: 'warm daily-life setting, family-friendly, practical benefit clearly visible',
    vo: 'warm, simple, broad-audience Indonesian, avoid excessive slang',
    cta: 'clear practical recommendation, polite and direct',
    avoid: ['too much Jaksel slang', 'chaotic cuts', 'hard-to-read product shots']
  },
  multi_platform: {
    label: 'Multi-platform',
    hookRule: 'fast clear hook that works across TikTok, Reels, Shorts, and FB Reels',
    pacing: 'balanced, clean, reusable across platforms',
    camera: 'vertical 9:16 social video framing, natural handheld or stable lifestyle shots',
    visual: 'clean daily-life creator content with product clarity',
    vo: 'natural, not too platform-specific, easy to reuse',
    cta: 'soft recommendation or save/try CTA',
    avoid: ['platform-specific slang overload', 'unclear product use']
  }
};

export function normalizeTargetPlatform(value = 'multi_platform') {
  const v = String(value || '').toLowerCase().trim();
  if (v.includes('tiktok') || v === 'tt') return 'tiktok';
  if (v.includes('instagram') || v.includes('reels') || v === 'ig') return 'instagram_reels';
  if (v.includes('youtube') || v.includes('short')) return 'youtube_shorts';
  if (v.includes('facebook') || v.includes('fb')) return 'facebook_pro';
  if (v.includes('multi')) return 'multi_platform';
  return PLATFORM_PROFILES[v] ? v : 'multi_platform';
}

export function getPlatformProfile(value = 'multi_platform') {
  return PLATFORM_PROFILES[normalizeTargetPlatform(value)] || PLATFORM_PROFILES.multi_platform;
}
