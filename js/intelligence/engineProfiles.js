export const IMAGE_ENGINE_PROFILES = {
  banana_pro: {
    label: 'Banana Pro',
    role: 'reference-accurate product still generator',
    strength: 'product packaging accuracy, character/product reference locking, direct still-frame prompts',
    promptRules: [
      'single still image only, no video language',
      'preserve uploaded product packaging, label layout, colors, scale, and material',
      'make product readable and not redesigned',
      'use concise direct visual instructions'
    ],
    negativeRules: ['product redesign', 'wrong packaging', 'fake label text', 'duplicate product', 'motion blur that hides product']
  },
  gpt_image: {
    label: 'GPT Image',
    role: 'narrative lifestyle image generator',
    strength: 'human scene interpretation, emotional context, lifestyle composition, social ad storytelling',
    promptRules: [
      'describe the scene naturally with subject, product, environment, and emotion',
      'keep the image human and specific, not generic stock photography',
      'preserve product identity and character continuity',
      'include social-platform visual context'
    ],
    negativeRules: ['generic stock photo', 'fake brand text', 'overly artificial pose', 'product identity drift']
  }
};

export const VIDEO_ENGINE_PROFILES = {
  seedance: {
    label: 'Seedance 2.0',
    role: 'motion/action realism video generator',
    strength: 'human movement, hand interaction, UGC demo action, temporal continuity',
    promptRules: [
      'one clear action beat per scene',
      'explicit hand/body mechanics',
      'natural micro-pauses and believable physical interaction',
      'no teleporting product or skipped physical steps'
    ],
    negativeRules: ['teleporting product', 'random action not in scene', 'impossible hand movement', 'motion mismatch']
  },
  veo: {
    label: 'Veo 3.1',
    role: 'cinematic/lens-driven video generator',
    strength: 'camera direction, lighting, depth of field, premium visual continuity',
    promptRules: [
      'clear camera movement and lens language',
      'beginning-middle-end within the shot',
      'cinematic lighting while preserving product identity',
      'clean continuity between subject, product, and background'
    ],
    negativeRules: ['unclear camera direction', 'overly busy scene', 'product redesign', 'continuity jump']
  }
};

export function getImageEngineProfile(model = 'banana_pro') {
  return IMAGE_ENGINE_PROFILES[model] || IMAGE_ENGINE_PROFILES.banana_pro;
}

export function getVideoEngineProfile(model = 'veo') {
  return VIDEO_ENGINE_PROFILES[model] || VIDEO_ENGINE_PROFILES.veo;
}
