// V5 lightweight prompt builder compatibility layer.
// Old V4 prompt assembly is retired; app now uses js/engine/* and platform-specific V5 builders.
import { engineConfig } from './config.js?v=202604301437';
import { state } from './state.js?v=202604301437';

export function getImagePlatformLabel(platform = engineConfig.imagePlatform || state.selectedImageModel || 'banana_pro') {
  return platform === 'gpt_image' ? 'GPT Image' : 'Banana Pro';
}

export function getVideoPlatformLabel(platform = engineConfig.platform || state.selectedVideoModel || 'veo') {
  return platform === 'seedance' ? 'Seedance 2.0' : 'Veo 3.1';
}

export function buildStructuredOutput(vo, shots, info, _viralContext, sceneVOs) {
  return {
    voiceover: vo,
    scenes: shots.map((shot, i) => ({
      shot: shot.title,
      scene: sceneVOs?.[i]?.scene || `Scene ${i + 1}`,
      vo: sceneVOs?.[i]?.vo || shot.voSnippet || '',
      duration: sceneVOs?.[i]?.duration || '2-4s',
      phase: sceneVOs?.[i]?.phase || shot.arcPhase || '',
      emotion: sceneVOs?.[i]?.emotion || null,
      imperfections: sceneVOs?.[i]?.imperfections || [],
      imagePlatform: getImagePlatformLabel(),
      videoPlatform: getVideoPlatformLabel(),
      visual_prompt: shot.imagePrompt,
      motion: shot.videoPrompt,
      purpose: shot.arcPhase || shot.title,
      meaning: sceneVOs?.[i]?.meaning || null
    })),
    config: {
      mode: engineConfig.mode,
      imagePlatform: engineConfig.imagePlatform || state.selectedImageModel || 'banana_pro',
      platform: engineConfig.platform || state.selectedVideoModel || 'veo',
      persona: engineConfig.persona,
      energy: engineConfig.energy,
      realism: engineConfig.realism,
      category: info.category
    },
    meta: { product: info.name, category: info.category, generatedAt: new Date().toISOString(), engine: 'v5-clean-engine' }
  };
}
