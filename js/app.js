// ==================== MAIN APPLICATION ====================
// Central entry point — category-aware prompt engine.
// All generation flows through generatePrompt(config).

import { engineConfig, updateConfig, TARGET_AD_SHOTS, TARGET_UGC_SHOTS, SHOT_COLORS, API_KEY_STORAGE, PERSONAS, ENERGY_LEVELS } from './config.js';
import { state, updateState } from './state.js';
import { delay, cleanText, escapeForAttr, splitVO } from './utils.js';
import { callAI, saveApiKeyToStorage, testProviderConnection, getApiKey } from './api.js';
import { buildImagePrompt, buildVideoPrompt, buildSeedanceAIPrompt, buildStructuredOutput } from './promptBuilder.js';
import { buildUGCVoiceoverPrompt, buildUGCScenePrompt } from './engines/ugcEngine.js';
import { buildAdsVoiceoverPrompt, buildAdsScenePrompt } from './engines/adsEngine.js';
import { resetPhraseTracker } from './core/antiRepetition.js';
import { resetVariationTracker } from './core/sceneVariation.js';
import { getSceneArc } from './core/storyArc.js';
import { enforceCTA } from './core/ctaBuilder.js';
import { getCategoryData, validateCategoryOutput, CATEGORY_RULES } from './categoryRules.js';
import { applyViralEngine, validateViralOutput } from './engines/viralEngine.js';
import { buildSceneVOPrompt, buildPerSceneVO, buildFallbackPerSceneVO, humanizeVO, validateVOSync } from './engines/voEngine.js';
import {
    saveSession, restoreSession, clearSession, handleFile, removeUpload,
    updateConfirmBtn, loadProjectList, saveCurrentProject, exportProject,
    importProject, loadSelectedProject
} from './session.js';

// ==================== NAVIGATION ====================
function selectMode(mode) {
    updateState({ contentStyle: mode });
    updateConfig({ mode: mode === 'UGC' ? 'ugc' : 'ads' });
    document.getElementById('panel-mode').classList.remove('active');
    document.getElementById('panel-0').classList.add('active');
    state.currentStep = 0;
    updateUI();
    saveSession();
}

function goToModeSelection() {
    state.currentStep = -1;
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-mode').classList.add('active');
    updateUI();
    saveSession();
}

function goToStep(s, { force = false } = {}) {
    if (!force && s === 2 && !state.generatedData) {
        alert('Silakan generate dulu!');
        return;
    }
    if (!force && s === 3 && !state.generatedData) {
        alert('Tidak ada data Master Plan. Silakan generate dulu!');
        return;
    }
    state.currentStep = s;
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    if (s === -1) document.getElementById('panel-mode').classList.add('active');
    else document.getElementById(`panel-${s}`).classList.add('active');

    document.querySelectorAll('.step-item').forEach((it, i) => {
        it.classList.remove('active', 'completed', 'disabled');
        if (i === s) it.classList.add('active');
        if (i < s) it.classList.add('completed');
        if ((i === 2 || i === 3) && !state.generatedData) it.classList.add('disabled');
    });
    saveSession();
}

function updateUI() {
    goToStep(state.currentStep);
}

function selOpt(btn, grp) {
    btn.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected', 'purple', 'green'));
    btn.classList.add('selected');
    if (grp === 'vid') { state.selectedStyle = btn.textContent; btn.classList.add('purple'); }
    if (grp === 'cat') state.selectedCategory = btn.textContent;
    if (grp === 'lang') state.selectedLang = btn.textContent.includes('ID') ? 'ID' : 'EN';
    if (grp === 'tone') state.selectedTone = btn.getAttribute('data-tone') || 'jaksel';
    if (grp === 'ugcBg') state.ugcBackground = btn.getAttribute('data-keywords') || '';
    if (grp === 'presentation') state.presentationKeywords = btn.getAttribute('data-keywords') || '';
    if (grp === 'lens') state.lensStyle = btn.getAttribute('data-lens') || 'portrait';
    if (grp === 'videoModel') {
        state.selectedVideoModel = btn.getAttribute('data-model') || 'veo';
        updateConfig({ platform: state.selectedVideoModel });
    }
    saveSession();
}

// ==================== CENTRAL ENTRY POINT ====================
// Pipeline: Input → Category Engine → Viral Engine → VO Engine → Final Output.
// All generation flows through this function.

function generatePrompt(config) {
    const categoryData = CATEGORY_RULES[config.selectedCategory];

    if (!categoryData) {
        throw new Error('Unsupported category: ' + config.selectedCategory);
    }

    if (config.mode !== 'ugc' && config.mode !== 'ads') {
        throw new Error('Invalid mode: ' + config.mode);
    }

    // Step 1: Category Engine (already resolved)
    // Step 2: Viral Engine layer
    const viralContext = applyViralEngine(config.selectedCategory, config.mode);

    return {
        categoryData,
        builder: config.mode,
        viralContext
    };
}

// ==================== GENERATE LOGIC ====================

// Legacy global VO generator (kept for fallback compatibility)
async function generateGlobalVO(info, isUGC, categoryData) {
    try {
        const prompt = isUGC
            ? buildUGCVoiceoverPrompt(info, categoryData)
            : buildAdsVoiceoverPrompt(info, categoryData);
        const rawVO = cleanText(await callAI(prompt));

        const lines = rawVO.split('\n').filter(l => l.trim());
        if (lines.length > 0) {
            lines[lines.length - 1] = enforceCTA(lines[lines.length - 1], state.selectedLang);
        }
        return lines.join('\n');
    } catch (e) {
        console.error('Gagal generate global VO:', e);
        return buildFallbackVO(info, isUGC, categoryData);
    }
}

// Per-scene VO generator (Viral Engine + VO Engine pipeline)
async function generatePerSceneVO(info, isUGC, categoryData, viralContext, totalScenes) {
    const structure = viralContext.structure;
    const voTexts = [];

    for (let i = 0; i < totalScenes; i++) {
        const phase = structure[i] || structure[structure.length - 1];
        try {
            const prompt = buildSceneVOPrompt({
                info,
                sceneIndex: i,
                totalScenes,
                phase: phase.phase,
                phaseLabel: phase.label,
                isUGC,
                categoryData,
                viralContext,
                previousVOs: voTexts
            });
            const rawVO = cleanText(await callAI(prompt));
            voTexts.push(rawVO);
        } catch (e) {
            console.error(`Scene ${i + 1} VO fallback:`, e);
            // Use fallback for this scene
            const fallbackVOs = buildFallbackPerSceneVO(info, [phase], viralContext, isUGC, categoryData);
            voTexts.push(fallbackVOs[0]?.vo || '');
        }
    }

    // Build per-scene VO objects with humanization
    return buildPerSceneVO(voTexts, structure, viralContext, state.selectedLang);
}

function buildFallbackVO(info, isUGC, categoryData) {
    const voiceStyle = categoryData ? categoryData.voiceStyle : 'natural and engaging';
    const actions = categoryData ? categoryData.actions.slice(0, 3).join(', ') : 'interacting with product';
    const sensory = categoryData ? categoryData.sensory.slice(0, 2).join(', ') : 'appealing visuals';

    if (isUGC) {
        return `Eh bestie, lo udah nyobain ${info.name} belum? Literally (li-te-re-li) worth it banget sih!
Gue tuh dulu skeptis sama ${info.category.toLowerCase()}, soalnya udah coba banyak tapi hasilnya gitu-gitu aja.
Tapi pas nyobain ${info.name} ini, beda banget! ${sensory}.
Basically (be-si-ke-li) juara sih — ${actions}. End-up gue malah repeat order.
Pokoknya recommended banget! Link di bio, buruan sebelum kehabisan!`;
    }
    return `Pernahkah Anda membayangkan ${info.category.toLowerCase()} yang sempurna?
Satu nama terus bersinar — ${info.name}.
${sensory} — setiap detail dirancang untuk pengalaman tak tertandingi.
Rasakan sendiri: ${actions}.
Setiap detail dirancang dengan standar tertinggi.
Dipercaya oleh ribuan pelanggan di seluruh Indonesia.
Lihat bagaimana ${info.name} mengubah rutinitas Anda.
Karena Anda layak mendapatkan yang terbaik.
Penawaran terbatas — jangan sampai kehabisan.
${info.name}. Pilihan cerdas untuk hidup yang lebih baik.`;
}

async function generateSceneVisuals(info, sceneNum, voSnippet, isUGC, totalScenes, categoryData, viralContext) {
    const mode = isUGC ? 'ugc' : 'ads';
    const structure = viralContext ? viralContext.structure : null;
    const phase = structure && structure[sceneNum - 1]
        ? structure[sceneNum - 1]
        : { phase: getSceneArc(mode, sceneNum - 1).phase, label: getSceneArc(mode, sceneNum - 1).label };
    const arc = getSceneArc(mode, sceneNum - 1);

    // Get imperfections from viral engine for UGC
    const imperfections = viralContext ? viralContext.getImperfectionsForScene() : [];
    const imperfectionDirective = imperfections.length > 0
        ? `\nREALISM IMPERFECTIONS (MUST include): ${imperfections.join(', ')}`
        : '';

    // Emotional direction from viral engine
    const emotionDirective = viralContext
        ? `\nEMOTIONAL TONE: ${viralContext.emotionalTrigger.emotion} — ${viralContext.emotionalTrigger.description}`
        : '';

    let sceneDescription;
    try {
        const scenePrompt = isUGC
            ? buildUGCScenePrompt(info, sceneNum, voSnippet, totalScenes, categoryData)
            : buildAdsScenePrompt(info, sceneNum, voSnippet, totalScenes, categoryData);
        // Inject viral directives into the prompt
        const enhancedPrompt = scenePrompt + emotionDirective + imperfectionDirective;
        sceneDescription = cleanText(await callAI(enhancedPrompt));
    } catch (e) {
        console.error(`Scene ${sceneNum} fallback:`, e);
        sceneDescription = buildFallbackScene(info, sceneNum, isUGC, categoryData);
    }

    const imagePrompt = buildImagePrompt(sceneDescription, voSnippet, isUGC, categoryData);
    let videoPrompt;

    if (engineConfig.platform === 'seedance') {
        const gender = getGenderDesc();
        const aiPrompt = await buildSeedanceAIPrompt(sceneDescription, info, gender, isUGC, categoryData);
        videoPrompt = aiPrompt || buildVideoPrompt(sceneDescription, voSnippet, sceneNum - 1, totalScenes, isUGC, categoryData);
    } else {
        videoPrompt = buildVideoPrompt(sceneDescription, voSnippet, sceneNum - 1, totalScenes, isUGC, categoryData);
    }

    return {
        title: phase.label || arc.label,
        arcPhase: phase.phase || arc.phase,
        description: sceneDescription,
        imagePrompt,
        videoPrompt,
        voSnippet,
        imperfections
    };
}

function buildFallbackScene(info, sceneNum, isUGC, categoryData) {
    const gender = getGenderDesc();

    if (categoryData) {
        const env = categoryData.environments[(sceneNum - 1) % categoryData.environments.length];
        const action = categoryData.actions[(sceneNum - 1) % categoryData.actions.length];
        const sensory = categoryData.sensory[(sceneNum - 1) % categoryData.sensory.length];

        if (isUGC) {
            return `${gender.subj} in ${env}, ${action}, ${sensory}, handheld phone camera, natural lighting, casual authentic feel`;
        }
        return `Cinematic shot: ${gender.subj} in ${env}, ${action}, ${sensory}, professional lighting, premium composition`;
    }

    if (isUGC) {
        return `${gender.subj} looks at camera with excited expression, holding ${info.name} close, natural sunlight, handheld framing, phone camera quality`;
    }
    return `Cinematic wide shot, golden light filtering through, ${info.name} silhouetted, mysterious atmosphere`;
}

function getGenderDesc() {
    const g = document.getElementById('charGender')?.value || 'wanita';
    return g === 'pria'
        ? { subj: 'A young Indonesian man', pronoun: 'he', possessive: 'his' }
        : { subj: 'A young Indonesian woman', pronoun: 'she', possessive: 'her' };
}

async function startAI() {
    state.productName = document.getElementById('productName').value || 'Produk';
    state.productDescription = document.getElementById('productDescription').value || '';
    state.customNegativePrompt = document.getElementById('customNegativePrompt')?.value || '';

    const key = getApiKey();
    if (!key) { alert('Masukkan API Key Google AI Studio!'); return; }

    const isUGC = state.contentStyle === 'UGC';
    if (isUGC) state.selectedStyle = 'LIFESTYLE';
    const totalScenes = isUGC ? TARGET_UGC_SHOTS : TARGET_AD_SHOTS;

    resetPhraseTracker();
    resetVariationTracker();

    updateConfig({
        mode: isUGC ? 'ugc' : 'ads',
        platform: state.selectedVideoModel
    });

    // Central entry point: resolve category and mode
    let resolved;
    try {
        resolved = generatePrompt({
            selectedCategory: state.selectedCategory,
            mode: engineConfig.mode
        });
    } catch (e) {
        alert('Error: ' + e.message);
        return;
    }

    const { categoryData, viralContext } = resolved;

    goToStep(2, { force: true });
    const statusEl = document.getElementById('loadingStatus');
    const progEl = document.getElementById('progressBar');
    const info = { name: state.productName, category: state.selectedCategory, desc: state.productDescription };

    try {
        // ===== STEP 1: Viral Engine context (already resolved) =====
        statusEl.textContent = '🔥 Viral Engine aktif...';
        progEl.style.width = '5%';
        console.log('Viral context:', {
            hook: viralContext.hook,
            emotion: viralContext.emotionalTrigger.emotion,
            structure: viralContext.structure.map(s => s.phase).join(' → ')
        });
        await delay(500);

        // ===== STEP 2: Per-scene VO generation (VO Engine) =====
        statusEl.textContent = '🎙️ Generate VO per scene...';
        progEl.style.width = '10%';

        let sceneVOs;
        try {
            sceneVOs = await generatePerSceneVO(info, isUGC, categoryData, viralContext, totalScenes);
        } catch (e) {
            console.warn('Per-scene VO failed, using fallback:', e);
            sceneVOs = buildFallbackPerSceneVO(info, viralContext.structure, viralContext, isUGC, categoryData);
        }

        // Combine all VOs for display
        const vo = sceneVOs.map(sv => `(Scene ${sceneVOs.indexOf(sv) + 1} - ${sv.phase}) ${sv.vo}`).join('\n');
        document.getElementById('fullVO').textContent = vo;

        // ===== STEP 3: Scene visual generation =====
        const shots = [];
        for (let i = 0; i < totalScenes; i++) {
            statusEl.textContent = `🎬 Generate Scene ${i + 1}/${totalScenes}...`;
            progEl.style.width = `${20 + (i + 1) * (70 / totalScenes)}%`;
            const sceneVO = sceneVOs[i] || sceneVOs[sceneVOs.length - 1];
            const shot = await generateSceneVisuals(info, i + 1, sceneVO.vo, isUGC, totalScenes, categoryData, viralContext);
            shots.push({
                number: i + 1,
                ...shot,
                headerColor: SHOT_COLORS[i] || 'yellow',
                sceneVO: sceneVO
            });
            if (i < totalScenes - 1) await delay(1500);
        }

        // ===== STEP 4: Validation =====
        statusEl.textContent = '✅ Validating output...';
        progEl.style.width = '95%';

        // Category validation
        const categoryValidation = validateCategoryOutput(shots, info.category);
        if (!categoryValidation.valid) {
            console.warn('Category validation warning:', categoryValidation.message);
            statusEl.textContent = `⚠️ Kategori: elemen kurang (${categoryValidation.missing.join(', ')}). Melanjutkan...`;
            await delay(1500);
        }

        // Viral validation
        const viralValidation = validateViralOutput(shots.map((s, i) => ({
            vo: sceneVOs[i]?.vo || s.voSnippet,
            description: s.description
        })), viralContext);
        if (!viralValidation.valid) {
            console.warn('Viral validation warning:', viralValidation.message);
            statusEl.textContent = `⚠️ Viral: ${viralValidation.errors[0]}. Melanjutkan...`;
            await delay(1500);
        }

        // VO sync validation
        const voSyncValidation = validateVOSync(sceneVOs);
        if (!voSyncValidation.valid) {
            console.warn('VO sync warning:', voSyncValidation.message);
        }

        statusEl.textContent = '🎉 Selesai! Viral Content Engine aktif.';
        progEl.style.width = '100%';

        const structured = buildStructuredOutput(vo, shots, info, viralContext, sceneVOs);

        state.generatedData = {
            vo,
            shots,
            sceneVOs,
            info,
            contentStyle: isUGC ? 'UGC' : 'IKLAN',
            structured,
            engineConfig: { ...engineConfig },
            categoryValidation,
            viralValidation,
            voSyncValidation,
            viralContext: {
                hook: viralContext.hook,
                emotionalTrigger: viralContext.emotionalTrigger,
                structure: viralContext.structure
            }
        };

        displayMasterPlan();
        await delay(500);
        goToStep(3);
        saveSession();
    } catch (e) {
        alert('Generate gagal: ' + e.message + '\nCoba cek koneksi atau API key.');
        goToStep(1);
    }
}

// ==================== DISPLAY ====================
function displayMasterPlan() {
    if (!state.generatedData) return;
    const { vo, shots, sceneVOs, viralContext: vc } = state.generatedData;
    document.getElementById('fullVO').textContent = vo;

    const container = document.getElementById('shotCards');
    container.innerHTML = '';

    // Engine info badge
    const engineInfo = document.createElement('div');
    engineInfo.className = 'engine-info-badge';
    engineInfo.innerHTML = `
        <span class="engine-mode ${engineConfig.mode}">${engineConfig.mode === 'ugc' ? '📱 UGC Realism' : '🎥 Ads Cinematic'}</span>
        <span class="engine-platform">${engineConfig.platform === 'seedance' ? 'Seedance 2.0' : 'Veo 3.1'}</span>
        <span class="engine-persona">${PERSONAS[engineConfig.persona]?.icon || '👯'} ${PERSONAS[engineConfig.persona]?.label || 'Best Friend'}</span>
        <span class="engine-energy">${ENERGY_LEVELS[engineConfig.energy]?.icon || '⚡'} ${ENERGY_LEVELS[engineConfig.energy]?.label || 'Balanced'}</span>
        <span class="engine-realism">Realism: ${engineConfig.realism}%</span>
        <span class="engine-category">📁 ${state.selectedCategory}</span>
    `;
    container.appendChild(engineInfo);

    // Viral Engine info badge
    if (vc) {
        const viralInfo = document.createElement('div');
        viralInfo.className = 'viral-engine-badge';
        viralInfo.style.cssText = 'background:linear-gradient(135deg,#1a0a2e,#2d1b4e);border:1px solid #7c3aed;border-radius:10px;padding:12px 16px;margin-bottom:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;';
        viralInfo.innerHTML = `
            <span style="background:#7c3aed;color:#fff;padding:3px 10px;border-radius:6px;font-size:0.75rem;font-weight:700;">🔥 VIRAL ENGINE</span>
            <span style="background:#1e1e2e;color:#c4b5fd;padding:3px 10px;border-radius:6px;font-size:0.75rem;">🎣 Hook: "${vc.hook?.slice(0, 40) || '...'}${vc.hook?.length > 40 ? '...' : ''}"</span>
            <span style="background:#1e1e2e;color:#fbbf24;padding:3px 10px;border-radius:6px;font-size:0.75rem;">💛 ${vc.emotionalTrigger?.emotion || 'N/A'}</span>
            <span style="background:#1e1e2e;color:#34d399;padding:3px 10px;border-radius:6px;font-size:0.75rem;">📐 ${vc.structure?.map(s => s.phase).join(' → ') || 'N/A'}</span>
        `;
        container.appendChild(viralInfo);
    }

    // Show validation status
    if (state.generatedData.categoryValidation && !state.generatedData.categoryValidation.valid) {
        const warning = document.createElement('div');
        warning.className = 'category-validation-warning';
        warning.innerHTML = `⚠️ Validasi kategori: elemen yang mungkin kurang — <strong>${state.generatedData.categoryValidation.missing.join(', ')}</strong>`;
        warning.style.cssText = 'background:#2a1f00;border:1px solid #f59e0b;color:#fbbf24;padding:8px 12px;border-radius:8px;margin-bottom:12px;font-size:0.8rem;';
        container.appendChild(warning);
    }

    // Viral validation warning
    if (state.generatedData.viralValidation && !state.generatedData.viralValidation.valid) {
        const warning = document.createElement('div');
        warning.style.cssText = 'background:#2a0f0f;border:1px solid #ef4444;color:#fca5a5;padding:8px 12px;border-radius:8px;margin-bottom:12px;font-size:0.8rem;';
        warning.innerHTML = `⚠️ Viral validation: <strong>${state.generatedData.viralValidation.errors.join('; ')}</strong>`;
        container.appendChild(warning);
    }

    shots.forEach((shot, i) => {
        const color = shot.headerColor || SHOT_COLORS[i] || 'yellow';
        const charBadge = state.uploadedFiles.char ? '<span class="character-badge">👤 REF</span>' : '';
        const prodBadge = state.uploadedFiles.prod.some(p => p) ? '<span class="shot-card-asset-ref">📦 PRODUCT REF</span>' : '';
        const arcBadge = shot.arcPhase ? `<span class="arc-badge">${shot.arcPhase.toUpperCase()}</span>` : '';

        // Per-scene VO data
        const sceneVO = shot.sceneVO || (sceneVOs && sceneVOs[i]) || null;
        const voDuration = sceneVO ? sceneVO.duration : '';
        const voEmotion = sceneVO ? sceneVO.emotion : '';
        const voImperfections = sceneVO && sceneVO.imperfections && sceneVO.imperfections.length > 0
            ? sceneVO.imperfections : (shot.imperfections || []);

        const voBadges = `
            ${voDuration ? `<span style="background:#1e1e2e;color:#60a5fa;padding:2px 6px;border-radius:4px;font-size:0.65rem;margin-left:4px;">⏱ ${voDuration}</span>` : ''}
            ${voEmotion ? `<span style="background:#1e1e2e;color:#fbbf24;padding:2px 6px;border-radius:4px;font-size:0.65rem;margin-left:4px;">💛 ${voEmotion}</span>` : ''}
        `;

        const imperfectionHtml = voImperfections.length > 0
            ? `<div style="margin-top:6px;padding:4px 8px;background:#1a1a2e;border-radius:4px;font-size:0.7rem;color:#a78bfa;">🎭 ${voImperfections.join(' | ')}</div>`
            : '';

        const card = document.createElement('div');
        card.className = 'shot-card';
        card.innerHTML = `
            <div class="shot-card-header ${color}">
                <div class="shot-number-badge ${color}">${shot.number}</div>
                <div>
                    <div class="shot-card-title">${shot.title}${charBadge} ${arcBadge}</div>
                    ${prodBadge}
                </div>
            </div>
            <div class="shot-card-body">
                <div class="shot-vo-section">
                    <div class="shot-vo-label">🎙️ SCENE VO ${voBadges}</div>
                    <div class="shot-vo-text">${sceneVO ? sceneVO.vo : (shot.voSnippet || '')}</div>
                    ${imperfectionHtml}
                </div>
                <div class="shot-prompt-section">
                    <div class="shot-prompt-label">📸 IMAGE PROMPT</div>
                    <div class="shot-prompt-text">${shot.imagePrompt || ''}</div>
                    <button class="btn-copy" onclick="window.__copyToClipboard(this, '${escapeForAttr(shot.imagePrompt)}')">📋 Copy</button>
                </div>
                <div class="shot-prompt-section">
                    <div class="shot-prompt-label">🎥 VIDEO PROMPT (${engineConfig.platform === 'seedance' ? 'Seedance 2.0' : 'Veo 3.1'})</div>
                    <div class="shot-prompt-text">${shot.videoPrompt || ''}</div>
                    <button class="btn-copy" onclick="window.__copyToClipboard(this, '${escapeForAttr(shot.videoPrompt)}')">📋 Copy</button>
                </div>
            </div>`;
        container.appendChild(card);
    });

    if (state.generatedData.structured) {
        const jsonSection = document.createElement('div');
        jsonSection.className = 'json-output-section';
        jsonSection.innerHTML = `
            <div class="json-output-header">
                <span>📄 STRUCTURED JSON OUTPUT</span>
                <button class="btn-copy" id="copyJsonBtn">📋 Copy JSON</button>
            </div>
            <pre class="json-output-text">${JSON.stringify(state.generatedData.structured, null, 2)}</pre>
        `;
        container.appendChild(jsonSection);
        jsonSection.querySelector('#copyJsonBtn').addEventListener('click', function() {
            copyToClipboard(this, JSON.stringify(state.generatedData.structured, null, 2));
        });
    }
}

// ==================== CLIPBOARD ====================
function copyToClipboard(btn, text) {
    const decoded = text.replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/&quot;/g, '"').replace(/\\\\/g, '\\');
    navigator.clipboard.writeText(decoded).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = orig, 1500);
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = decoded;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = orig, 1500);
    });
}
window.__copyToClipboard = copyToClipboard;

function copyAll(btn) {
    if (!state.generatedData) { alert('Belum ada data!'); return; }
    const { sceneVOs, viralContext: vc } = state.generatedData;
    let text = '';

    // Viral engine header
    if (vc) {
        text += `=== VIRAL ENGINE ===\n`;
        text += `Hook: ${vc.hook}\n`;
        text += `Emotion: ${vc.emotionalTrigger?.emotion}\n`;
        text += `Structure: ${vc.structure?.map(s => s.phase).join(' → ')}\n\n`;
    }

    text += '=== NASKAH VOICEOVER (PER SCENE) ===\n' + state.generatedData.vo + '\n\n';
    state.generatedData.shots.forEach((shot, i) => {
        const sv = sceneVOs && sceneVOs[i];
        text += `=== SCENE ${shot.number}: ${shot.title} ===\n`;
        text += `VO: ${sv ? sv.vo : shot.voSnippet}\n`;
        text += `Duration: ${sv ? sv.duration : 'N/A'}\n`;
        text += `Emotion: ${sv ? sv.emotion : 'N/A'}\n`;
        if (sv && sv.imperfections && sv.imperfections.length > 0) {
            text += `Imperfections: ${sv.imperfections.join(', ')}\n`;
        }
        text += `IMAGE PROMPT: ${shot.imagePrompt}\n`;
        text += `VIDEO PROMPT: ${shot.videoPrompt}\n\n`;
    });
    if (state.generatedData.structured) {
        text += `\n=== STRUCTURED JSON ===\n${JSON.stringify(state.generatedData.structured, null, 2)}\n`;
    }
    copyToClipboard(btn, text);
}

function copyVO(btn) {
    if (!state.generatedData) { alert('Belum ada data!'); return; }
    copyToClipboard(btn, state.generatedData.vo);
}

function downloadAllAssets() {
    if (!state.generatedData) { alert('Belum ada data untuk di-download!'); return; }
    const cfg = state.generatedData.engineConfig || engineConfig;
    const vc = state.generatedData.viralContext;
    const sceneVOs = state.generatedData.sceneVOs;
    let content = `HAMBS PRODUCTION — MASTER PROMPT PACK (VIRAL CONTENT ENGINE v1)\n`;
    content += `Mode: ${state.generatedData.contentStyle} (${cfg.mode === 'ugc' ? 'Realism' : 'Cinematic'})\n`;
    content += `Platform: ${cfg.platform === 'seedance' ? 'Seedance 2.0' : 'Veo 3.1'}\n`;
    content += `Persona: ${PERSONAS[cfg.persona]?.label || cfg.persona}\n`;
    content += `Energy: ${cfg.energy}\n`;
    content += `Realism: ${cfg.realism}%\n`;
    content += `Category: ${state.generatedData.info.category}\n`;
    content += `Produk: ${state.generatedData.info.name}\n`;
    content += `Generated: ${new Date().toLocaleString('id-ID')}\n`;
    if (vc) {
        content += `\n--- VIRAL ENGINE ---\n`;
        content += `Hook: ${vc.hook}\n`;
        content += `Emotion: ${vc.emotionalTrigger?.emotion} — ${vc.emotionalTrigger?.description || ''}\n`;
        content += `Structure: ${vc.structure?.map(s => s.phase).join(' → ')}\n`;
    }
    content += `${'='.repeat(60)}\n\n`;
    content += `NASKAH VOICEOVER (PER SCENE):\n${state.generatedData.vo}\n\n`;
    content += `${'='.repeat(60)}\n\n`;
    state.generatedData.shots.forEach((shot, idx) => {
        const sv = sceneVOs && sceneVOs[idx];
        content += `SCENE ${shot.number}: ${shot.title}\n`;
        content += `-`.repeat(40) + `\n`;
        content += `VOICEOVER: ${sv ? sv.vo : shot.voSnippet}\n`;
        content += `DURATION: ${sv ? sv.duration : 'N/A'}\n`;
        content += `EMOTION: ${sv ? sv.emotion : 'N/A'}\n`;
        if (sv && sv.imperfections && sv.imperfections.length > 0) {
            content += `IMPERFECTIONS: ${sv.imperfections.join(', ')}\n`;
        }
        content += `\nIMAGE PROMPT:\n${shot.imagePrompt}\n\n`;
        content += `VIDEO PROMPT:\n${shot.videoPrompt}\n\n`;
        content += `${'='.repeat(60)}\n\n`;
    });
    if (state.generatedData.structured) {
        content += `\nSTRUCTURED JSON OUTPUT:\n${JSON.stringify(state.generatedData.structured, null, 2)}\n`;
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `HAMBS_${state.generatedData.info.name.replace(/\s+/g, '_')}_${cfg.mode}_${state.generatedData.info.category}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
}

// ==================== ENGINE CONFIG UI ====================
function initEngineConfigUI() {
    const personaSelect = document.getElementById('personaSelect');
    if (personaSelect) {
        personaSelect.addEventListener('change', (e) => {
            updateConfig({ persona: e.target.value });
            saveSession();
        });
    }

    const energySelect = document.getElementById('energySelect');
    if (energySelect) {
        energySelect.addEventListener('change', (e) => {
            updateConfig({ energy: e.target.value });
            saveSession();
        });
    }

    const realismSlider = document.getElementById('realismSlider');
    if (realismSlider) {
        realismSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            updateConfig({ realism: val });
            const label = document.getElementById('realismValue');
            if (label) label.textContent = val;
            saveSession();
        });
    }
}

// ==================== EVENT BINDINGS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Header buttons
    document.getElementById('homeBtn').addEventListener('click', goToModeSelection);
    document.getElementById('brandIcon').addEventListener('click', goToModeSelection);
    document.getElementById('sidebarBrandIcon').addEventListener('click', goToModeSelection);
    document.getElementById('backToModeBtn').addEventListener('click', goToModeSelection);

    // Mode selection
    document.getElementById('cardIklan').addEventListener('click', () => selectMode('IKLAN'));
    document.getElementById('cardUGC').addEventListener('click', () => selectMode('UGC'));

    // Option grids
    document.querySelectorAll('#ugcBgGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'ugcBg'); }));
    document.querySelectorAll('#presentationGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'presentation'); }));
    document.querySelectorAll('#categoryGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'cat'); }));
    document.querySelectorAll('#styleGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'vid'); }));
    document.querySelectorAll('#toneGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'tone'); }));
    document.querySelectorAll('#lensGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'lens'); }));
    document.querySelectorAll('#videoModelGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'videoModel'); }));
    document.querySelectorAll('#langGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'lang'); }));

    // Upload handlers
    document.getElementById('charUpload').addEventListener('click', () => {
        const i = document.createElement('input');
        i.type = 'file'; i.accept = 'image/*';
        i.onchange = e => handleFile(e.target.files[0], 'charUpload', 'char');
        i.click();
    });
    for (let i = 0; i < 4; i++) {
        document.getElementById(`prod${i + 1}`).addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file'; input.accept = 'image/*';
            input.onchange = e => handleFile(e.target.files[0], `prod${i + 1}`, 'prod', i);
            input.click();
        });
    }

    // Core actions
    document.getElementById('generateBtn').addEventListener('click', startAI);
    document.getElementById('btnStep1').addEventListener('click', () => goToStep(1));
    document.getElementById('saveApiKeyBtn').addEventListener('click', saveApiKeyToStorage);
    document.getElementById('testApiBtn').addEventListener('click', testProviderConnection);

    // Project management
    document.getElementById('saveProjectBtn').addEventListener('click', saveCurrentProject);
    document.getElementById('exportProjectBtn').addEventListener('click', exportProject);
    document.getElementById('importProjectBtn').addEventListener('click', () => importProject(goToStep, displayMasterPlan));
    document.getElementById('projectSelect').addEventListener('change', () => loadSelectedProject(goToStep, displayMasterPlan));
    document.getElementById('downloadAllBtn').addEventListener('click', downloadAllAssets);
    document.getElementById('downloadAllMasterBtn').addEventListener('click', downloadAllAssets);
    document.getElementById('resetBtn').addEventListener('click', clearSession);
    document.getElementById('copyAllBtn').addEventListener('click', () => copyAll(document.getElementById('copyAllBtn')));
    document.getElementById('copyVOBtn').addEventListener('click', () => copyVO(document.getElementById('copyVOBtn')));

    // Sidebar navigation
    document.querySelectorAll('.step-item').forEach(item => {
        item.addEventListener('click', () => goToStep(parseInt(item.getAttribute('data-step'))));
    });

    // Engine config UI
    initEngineConfigUI();

    // Auto-save
    setInterval(saveSession, 3000);

    // Initialize
    state.apiKey = localStorage.getItem(API_KEY_STORAGE) || '';
    loadProjectList();
    if (state.apiKey) {
        document.getElementById('apiKeyInput').value = state.apiKey;
        document.getElementById('apiWarning').innerHTML = '&#10003; Tersimpan';
    }
    if (restoreSession()) {
        updateUI();
        if (state.currentStep === 3 && state.generatedData) displayMasterPlan();
        if (!confirm('Sesi sebelumnya ditemukan. Lanjutkan?')) clearSession();
    }
    updateConfirmBtn();
});
