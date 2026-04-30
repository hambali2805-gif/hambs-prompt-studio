import { joinPromptParts } from '../../../shared/textCleaner.js?v=202604300933';

export function buildVideoModeStyle(mode, platform) {
    const isUGC = mode === 'ugc';
    if (platform === 'seedance') {
        return isUGC
            ? 'UGC handheld motion, natural body timing, casual everyday interaction, imperfect but believable'
            : 'polished commercial motion, controlled action beats, premium human-product interaction';
    }
    return isUGC
        ? 'creator-style handheld video, natural timing, human micro-reactions, everyday realism'
        : 'cinematic campaign video, polished pacing, emotional product reveal, premium visual continuity';
}

export function buildVideoPromptBase(parts) {
    return joinPromptParts(parts);
}
