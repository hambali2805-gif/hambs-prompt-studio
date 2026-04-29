// ==================== SESSION & PROJECT MANAGEMENT ====================
import { SESSION_KEY, PROJECTS_KEY, API_KEY_STORAGE, engineConfig, updateConfig } from './config.js';
import { state, updateState } from './state.js';
import { compressImage } from './utils.js';
import { inferPresentationType } from './intelligence/presentationProfiles.js';

export function saveSession() {
    try {
        const s = {
            currentStep: state.currentStep,
            contentStyle: state.contentStyle,
            productName: state.productName,
            productDescription: state.productDescription,
            selectedCategory: state.selectedCategory,
            selectedStyle: state.selectedStyle,
            selectedLang: state.selectedLang,
            selectedTone: state.selectedTone,
            customNegativePrompt: state.customNegativePrompt,
            selectedVideoModel: state.selectedVideoModel,
            selectedImageModel: state.selectedImageModel,
            ugcBackground: state.ugcBackground,
            presentationKeywords: state.presentationKeywords,
            presentationType: state.presentationType || inferPresentationType(state.presentationKeywords || '') || 'talking_head',
            lensStyle: state.lensStyle,
            charPreview: state.uploadedFiles.char?.preview,
            prodPreviews: state.uploadedFiles.prod.map(p => p?.preview),
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
            currentStep: s.currentStep ?? -1,
            contentStyle: s.contentStyle || 'IKLAN',
            productName: s.productName || 'Indomie Goreng',
            productDescription: s.productDescription || '',
            selectedCategory: s.selectedCategory || 'FASHION',
            selectedStyle: s.selectedStyle || 'LIFESTYLE',
            selectedLang: s.selectedLang || 'ID',
            selectedTone: s.selectedTone || 'jaksel',
            customNegativePrompt: s.customNegativePrompt || '',
            selectedVideoModel: s.selectedVideoModel || 'veo',
            selectedImageModel: s.selectedImageModel || 'banana_pro',
            ugcBackground: s.ugcBackground || 'Scandinavian-Japanese fusion, beige limewash wall, light oak wood slats, pampas grass in ceramic vase, linen textures, clean space.',
            presentationKeywords: s.presentationKeywords || 'Direct eye contact, framing: medium close-up, hand gestures, expressive facial expressions, talking to camera, FaceTime-style framing.',
            presentationType: s.presentationType || inferPresentationType(s.presentationKeywords || '') || 'talking_head',
            lensStyle: s.lensStyle || 'portrait',
            generatedData: s.generatedData
        });

        if (s.engineConfig) {
            updateConfig(s.engineConfig);
        }

        // Restore form values
        const prodNameEl = document.getElementById('productName');
        if (prodNameEl) prodNameEl.value = state.productName;
        const prodDescEl = document.getElementById('productDescription');
        if (prodDescEl) prodDescEl.value = state.productDescription;
        const negPromptEl = document.getElementById('customNegativePrompt');
        if (negPromptEl) negPromptEl.value = state.customNegativePrompt;

        // Restore uploaded images
        if (s.charPreview) {
            restoreUploadPreview('charUpload', s.charPreview, 'char');
            state.uploadedFiles.char = { preview: s.charPreview };
        }
        s.prodPreviews?.forEach((p, i) => {
            if (p) {
                restoreUploadPreview(`prod${i + 1}`, p, 'prod', i);
                state.uploadedFiles.prod[i] = { preview: p };
            }
        });

        // Restore option selections
        restoreOptionSelections();
        return true;
    } catch (e) { return false; }
}

function restoreUploadPreview(boxId, preview, type, idx) {
    const b = document.getElementById(boxId);
    if (!b) return;
    b.classList.add('has-image');
    b.innerHTML = `<img src="${preview}"><button class="remove-btn">✕</button>`;
    b.querySelector('.remove-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        removeUpload(boxId, type, idx);
    });
}

function restoreOptionSelections() {
    restoreGridSelection('#ugcBgGrid', 'data-keywords', state.ugcBackground);
    restoreGridSelection('#presentationGrid', 'data-keywords', state.presentationKeywords);
    document.querySelectorAll('[data-model]').forEach(b => b.classList.remove('selected'));
    document.querySelector('#imageModelGrid [data-model="' + state.selectedImageModel + '"]')?.classList.add('selected');
    document.querySelector('#videoModelGrid [data-model="' + state.selectedVideoModel + '"]')?.classList.add('selected');

    // Restore engine config UI
    const personaEl = document.getElementById('personaSelect');
    if (personaEl) personaEl.value = engineConfig.persona;
    const energyEl = document.getElementById('energySelect');
    if (energyEl) energyEl.value = engineConfig.energy;
    const realismEl = document.getElementById('realismSlider');
    if (realismEl) {
        realismEl.value = engineConfig.realism;
        const label = document.getElementById('realismValue');
        if (label) label.textContent = engineConfig.realism;
    }
}

function restoreGridSelection(gridSelector, attr, value) {
    if (!value) return;
    document.querySelectorAll(`${gridSelector} .option-btn`).forEach(b => b.classList.remove('selected'));
    const escaped = value.replace(/"/g, '&quot;');
    document.querySelector(`${gridSelector} [${attr}="${escaped}"]`)?.classList.add('selected');
}

export function removeUpload(boxId, type, idx) {
    const b = document.getElementById(boxId);
    if (!b) return;
    b.classList.remove('has-image');
    b.innerHTML = `<div class="upload-icon">📷</div><div class="upload-text">${type === 'char' ? 'Karakter' : `Produk ${idx + 1}`}</div>`;
    if (type === 'char') state.uploadedFiles.char = null;
    else state.uploadedFiles.prod[idx] = null;
    updateConfirmBtn();
    saveSession();
}

export function updateConfirmBtn() {
    const btn = document.getElementById('btnStep1');
    if (btn) btn.disabled = !state.uploadedFiles.prod.some(p => p);
}

export function clearSession() {
    if (confirm('Reset semua?')) {
        localStorage.removeItem(SESSION_KEY);
        location.reload();
    }
}

export function handleFile(file, boxId, type, idx) {
    const r = new FileReader();
    r.onload = async (e) => {
        const compressed = await compressImage(e.target.result);
        const b = document.getElementById(boxId);
        b.classList.add('has-image');
        b.innerHTML = `<img src="${compressed}"><button class="remove-btn">✕</button>`;
        b.querySelector('.remove-btn').addEventListener('click', (event) => {
            event.stopPropagation();
            removeUpload(boxId, type, idx);
        });
        if (type === 'char') state.uploadedFiles.char = { preview: compressed };
        else state.uploadedFiles.prod[idx] = { preview: compressed };
        updateConfirmBtn();
        saveSession();
    };
    r.readAsDataURL(file);
}

// ==================== PROJECT MANAGER ====================
export function loadProjectList() {
    const sel = document.getElementById('projectSelect');
    if (!sel) return;
    const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '{}');
    sel.innerHTML = '<option value="">-- Pilih Project --</option>';
    Object.keys(projects).forEach(n => {
        const o = document.createElement('option');
        o.value = n;
        o.textContent = `${n} (${new Date(projects[n].timestamp).toLocaleDateString()})`;
        sel.appendChild(o);
    });
}

export function saveCurrentProject() {
    if (!state.generatedData) { alert('Generate dulu!'); return; }
    const n = prompt('Nama project:', state.currentProjectName || 'Project Baru');
    if (!n) return;
    const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '{}');
    projects[n] = {
        currentStep: 3,
        contentStyle: state.contentStyle,
        productName: state.productName,
        productDescription: state.productDescription,
        selectedCategory: state.selectedCategory,
        selectedStyle: state.selectedStyle,
        selectedLang: state.selectedLang,
        selectedTone: state.selectedTone,
        customNegativePrompt: state.customNegativePrompt,
        selectedVideoModel: state.selectedVideoModel,
            selectedImageModel: state.selectedImageModel,
        ugcBackground: state.ugcBackground,
        presentationKeywords: state.presentationKeywords,
        presentationType: state.presentationType || inferPresentationType(state.presentationKeywords || '') || 'talking_head',
        lensStyle: state.lensStyle,
        generatedData: state.generatedData,
        engineConfig: { ...engineConfig },
        timestamp: Date.now()
    };
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    state.currentProjectName = n;
    loadProjectList();
    alert(`Project "${n}" disimpan!`);
}

export function exportProject() {
    if (!state.generatedData) { alert('Generate dulu sebelum export!'); return; }
    const data = {
        version: 'hambs_v5_clean_engine',
        name: state.currentProjectName || 'Untitled',
        contentStyle: state.contentStyle,
        productName: state.productName,
        productDescription: state.productDescription,
        selectedCategory: state.selectedCategory,
        selectedStyle: state.selectedStyle,
        selectedLang: state.selectedLang,
        selectedTone: state.selectedTone,
        customNegativePrompt: state.customNegativePrompt,
        selectedVideoModel: state.selectedVideoModel,
            selectedImageModel: state.selectedImageModel,
        ugcBackground: state.ugcBackground,
        presentationKeywords: state.presentationKeywords,
        presentationType: state.presentationType || inferPresentationType(state.presentationKeywords || '') || 'talking_head',
        lensStyle: state.lensStyle,
        generatedData: state.generatedData,
        engineConfig: { ...engineConfig },
        exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `HAMBS_${(state.currentProjectName || state.productName).replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
}

export function importProject(goToStepFn, displayMasterPlanFn) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (!data.version || !data.version.startsWith('hambs')) {
                    alert('File ini bukan project Hambs Production!');
                    return;
                }
                updateState({
                    contentStyle: data.contentStyle || 'IKLAN',
                    productName: data.productName || 'Produk',
                    productDescription: data.productDescription || '',
                    selectedCategory: data.selectedCategory || 'FASHION',
                    selectedStyle: data.selectedStyle || 'LIFESTYLE',
                    selectedLang: data.selectedLang || 'ID',
                    selectedTone: data.selectedTone || 'jaksel',
                    customNegativePrompt: data.customNegativePrompt || '',
                    selectedVideoModel: data.selectedVideoModel || 'veo',
                    selectedImageModel: data.selectedImageModel || 'banana_pro',
                    ugcBackground: data.ugcBackground || '',
                    presentationKeywords: data.presentationKeywords || '',
                    presentationType: data.presentationType || inferPresentationType(data.presentationKeywords || '') || 'talking_head',
                    lensStyle: data.lensStyle || 'portrait',
                    generatedData: data.generatedData,
                    currentProjectName: data.name || ''
                });
                if (data.engineConfig) updateConfig(data.engineConfig);

                document.getElementById('productName').value = state.productName;
                document.getElementById('productDescription').value = state.productDescription;
                document.getElementById('customNegativePrompt').value = state.customNegativePrompt;

                if (state.generatedData) {
                    displayMasterPlanFn();
                    goToStepFn(3);
                } else {
                    goToStepFn(0);
                }
                saveSession();

                const saveName = prompt('Simpan sebagai project:', data.name || 'Imported Project');
                if (saveName) {
                    const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '{}');
                    projects[saveName] = { ...data, timestamp: Date.now() };
                    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
                    state.currentProjectName = saveName;
                    loadProjectList();
                }
                alert('Project berhasil di-import!');
            } catch (err) {
                alert('Gagal membaca file: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

export function loadSelectedProject(goToStepFn, displayMasterPlanFn) {
    const sel = document.getElementById('projectSelect');
    const name = sel.value;
    if (!name) return;
    const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '{}');
    const p = projects[name];
    if (!p) { alert('Project tidak ditemukan!'); return; }

    state.currentProjectName = name;
    updateState({
        contentStyle: p.contentStyle || 'IKLAN',
        productName: p.productName || 'Produk',
        productDescription: p.productDescription || '',
        selectedCategory: p.selectedCategory || 'FASHION',
        selectedStyle: p.selectedStyle || 'LIFESTYLE',
        selectedLang: p.selectedLang || 'ID',
        selectedTone: p.selectedTone || 'jaksel',
        customNegativePrompt: p.customNegativePrompt || '',
        selectedVideoModel: p.selectedVideoModel || 'veo',
        selectedImageModel: p.selectedImageModel || 'banana_pro',
        ugcBackground: p.ugcBackground || '',
        presentationKeywords: p.presentationKeywords || '',
        presentationType: p.presentationType || inferPresentationType(p.presentationKeywords || '') || 'talking_head',
        lensStyle: p.lensStyle || 'portrait',
        generatedData: p.generatedData
    });
    if (p.engineConfig) updateConfig(p.engineConfig);

    document.getElementById('productName').value = state.productName;
    document.getElementById('productDescription').value = state.productDescription;
    document.getElementById('customNegativePrompt').value = state.customNegativePrompt;

    if (state.generatedData) {
        displayMasterPlanFn();
        goToStepFn(3);
    } else {
        goToStepFn(0);
    }
    saveSession();
    alert(`Project "${name}" berhasil dimuat!`);
}
