// ==================== SESSION MANAGEMENT ====================
import { SESSION_KEY, API_KEY_STORAGE, engineConfig, updateConfig } from './config.js';
import { state, updateState } from './state.js';

export function saveSession() {
    try {
        const s = {
            mode: state.mode,
            selectedCategory: state.selectedCategory,
            selectedLang: state.selectedLang,
            selectedTone: state.selectedTone,
            selectedVideoModel: state.selectedVideoModel,
            charPersona: state.charPersona,
            charStyle: state.charStyle,
            charImage: state.charImage,
            products: state.products,
            durationTarget: state.durationTarget,
            contentStyle: state.contentStyle,
            platform: state.platform,
            generatedData: state.generatedData,
            engineConfig: { ...engineConfig },
            timestamp: Date.now()
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(s));
        const badge = document.getElementById('sessionBadge');
        if (badge) badge.style.opacity = '1';
    } catch (e) { /* ignore storage errors */ }
}

export function restoreSession() {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return false;
    try {
        const s = JSON.parse(saved);
        if (Date.now() - s.timestamp > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(SESSION_KEY);
            return false;
        }

        updateState({
            mode: s.mode || 'ugc',
            selectedCategory: s.selectedCategory || 'FASHION',
            selectedLang: s.selectedLang || 'ID',
            selectedTone: s.selectedTone || 'jaksel',
            selectedVideoModel: s.selectedVideoModel || 'veo',
            charPersona: s.charPersona || '',
            charStyle: s.charStyle || 'casual',
            charImage: s.charImage || null,
            products: s.products || [{ name: '', description: '', role: 'primary' }],
            durationTarget: s.durationTarget || 30,
            contentStyle: s.contentStyle || 'lifestyle',
            platform: s.platform || '',
            generatedData: s.generatedData
        });

        if (s.engineConfig) {
            updateConfig(s.engineConfig);
        }

        return true;
    } catch (e) { return false; }
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    location.reload();
}

// Legacy exports kept for compatibility with any other modules that import them
export function handleFile() {}
export function removeUpload() {}
export function updateConfirmBtn() {}
export function loadProjectList() {}
export function saveCurrentProject() {}
export function exportProject() {}
export function importProject() {}
export function loadSelectedProject() {}
