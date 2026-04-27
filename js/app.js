// ==================== MAIN APPLICATION ====================
// Production-ready content tool with Product Role System and Scene Block output.

import { engineConfig, updateConfig, TARGET_AD_SHOTS, TARGET_UGC_SHOTS, SHOT_COLORS, API_KEY_STORAGE, PERSONAS, ENERGY_LEVELS } from './config.js';
import { state, updateState } from './state.js';
import { delay, cleanText, escapeForAttr, compressImage } from './utils.js';
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
import { saveSession, restoreSession, clearSession } from './session.js';

// ==================== PRODUCT SYSTEM ====================
function renderProducts() {
    const container = document.getElementById('productList');
    if (!container) return;
    container.innerHTML = '';

    state.products.forEach((prod, idx) => {
        const roleClass = `role-${prod.role}`;
        const div = document.createElement('div');
        div.className = `product-item ${roleClass}`;
        div.innerHTML = `
            <div class="product-item-header">
                <span class="product-role-badge ${prod.role}">${prod.role.toUpperCase()}</span>
                ${state.products.length > 1 ? `<button class="product-remove" data-idx="${idx}">&times;</button>` : ''}
            </div>
            <div class="product-fields">
                <input type="text" class="input-field" placeholder="Product name" value="${escapeAttr(prod.name)}" data-idx="${idx}" data-field="name">
                <input type="text" class="input-field" placeholder="Short description" value="${escapeAttr(prod.description)}" data-idx="${idx}" data-field="description">
                <select class="input-field" data-idx="${idx}" data-field="role">
                    <option value="primary" ${prod.role === 'primary' ? 'selected' : ''}>PRIMARY</option>
                    <option value="comparison" ${prod.role === 'comparison' ? 'selected' : ''}>COMPARISON</option>
                    <option value="supporting" ${prod.role === 'supporting' ? 'selected' : ''}>SUPPORTING</option>
                </select>
            </div>
        `;
        container.appendChild(div);
    });

    // Bind events
    container.querySelectorAll('.product-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx);
            state.products.splice(idx, 1);
            renderProducts();
            saveSession();
        });
    });

    container.querySelectorAll('.product-fields .input-field').forEach(el => {
        el.addEventListener('input', (e) => {
            const idx = parseInt(e.target.dataset.idx);
            const field = e.target.dataset.field;
            if (field === 'role') {
                state.products[idx].role = e.target.value;
                renderProducts();
            } else {
                state.products[idx][field] = e.target.value;
            }
            saveSession();
        });
        el.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.idx);
            const field = e.target.dataset.field;
            state.products[idx][field] = e.target.value;
            if (field === 'role') renderProducts();
            saveSession();
        });
    });
}

function escapeAttr(s) {
    return String(s || '').replace(/"/g, '&quot;');
}

function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function addProduct() {
    state.products.push({ name: '', description: '', role: 'supporting' });
    renderProducts();
    saveSession();
}

// ==================== VALIDATION ====================
function validateInput() {
    const errors = [];

    // PRIMARY product check
    const primaryProducts = state.products.filter(p => p.role === 'primary');
    if (primaryProducts.length === 0) {
        errors.push('At least one product must have PRIMARY role.');
    }
    if (primaryProducts.length > 1) {
        errors.push('Only one product can be PRIMARY.');
    }

    // PRIMARY product must have a name
    const primary = state.products.find(p => p.role === 'primary');
    if (primary && !primary.name.trim()) {
        errors.push('PRIMARY product must have a name.');
    }

    // Show validation
    const valEl = document.getElementById('productValidation');
    if (errors.length > 0) {
        valEl.textContent = errors.join(' ');
        valEl.className = 'validation-msg error';
    } else {
        valEl.className = 'validation-msg';
        valEl.textContent = '';
    }

    return errors.length === 0;
}

function validateOutput(scenes, sceneVOs) {
    const errors = [];

    // Check if first scene has a hook goal
    if (scenes.length > 0) {
        const firstPhase = (scenes[0].arcPhase || '').toLowerCase();
        if (!firstPhase.includes('hook') && !firstPhase.includes('intro') && !firstPhase.includes('opening')) {
            errors.push('First scene should have a hook/attention goal.');
        }
    }

    // Check for duplicate scenes
    const descriptions = scenes.map(s => s.description);
    const uniqueDescs = new Set(descriptions);
    if (uniqueDescs.size < descriptions.length * 0.7) {
        errors.push('Too many similar scenes detected.');
    }

    // Check VO length (no scene VO should exceed 200 chars)
    if (sceneVOs) {
        sceneVOs.forEach((sv, i) => {
            if (sv.vo && sv.vo.length > 200) {
                errors.push(`Scene ${i + 1} VO is too long (${sv.vo.length} chars).`);
            }
        });
    }

    return errors;
}

// ==================== CHARACTER IMAGE ====================
function setupCharUpload() {
    const box = document.getElementById('charUpload');
    if (!box) return;
    box.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const compressed = await compressImage(ev.target.result);
                state.charImage = { preview: compressed };
                renderCharUpload();
                saveSession();
            };
            reader.readAsDataURL(file);
        };
        input.click();
    });
}

function renderCharUpload() {
    const box = document.getElementById('charUpload');
    if (!box) return;
    if (state.charImage) {
        box.classList.add('has-image');
        box.innerHTML = `<img src="${state.charImage.preview}"><button class="remove-btn">&times;</button>`;
        box.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            state.charImage = null;
            renderCharUpload();
            saveSession();
        });
    } else {
        box.classList.remove('has-image');
        box.innerHTML = '<span class="upload-placeholder">+ Upload</span>';
    }
}

// ==================== GENERATE LOGIC ====================
function getGenderDesc() {
    const style = state.charStyle || 'casual';
    const persona = state.charPersona || '';
    const isPria = /\b(pria|male|cowok|man|laki)\b/i.test(persona);
    return isPria
        ? { subj: 'A young Indonesian man', pronoun: 'he', possessive: 'his' }
        : { subj: 'A young Indonesian woman', pronoun: 'she', possessive: 'her' };
}

function getPrimaryProduct() {
    return state.products.find(p => p.role === 'primary') || state.products[0];
}

function getComparisonProduct() {
    return state.products.find(p => p.role === 'comparison') || null;
}

async function generatePerSceneVO(info, isUGC, categoryData, viralContext, totalScenes) {
    const structure = viralContext.structure;
    const rawVOTexts = [];
    const fallbackVOObjects = {};

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
                previousVOs: rawVOTexts.filter(v => v !== null)
            });
            const rawVO = cleanText(await callAI(prompt));
            rawVOTexts.push(rawVO);
        } catch (e) {
            console.error(`Scene ${i + 1} VO fallback:`, e);
            const fallbackVOs = buildFallbackPerSceneVO(info, [phase], viralContext, isUGC, categoryData);
            fallbackVOObjects[i] = { ...fallbackVOs[0], scene: `Scene ${i + 1}: ${phase.label}` };
            rawVOTexts.push(null);
        }
    }

    const processed = buildPerSceneVO(
        rawVOTexts.map(t => t || ''),
        structure, viralContext, state.selectedLang
    );

    return processed.map((vo, i) => fallbackVOObjects[i] || vo);
}

function buildFallbackVO(info, isUGC, categoryData) {
    const voiceStyle = categoryData ? categoryData.voiceStyle : 'natural and engaging';
    const actions = categoryData ? categoryData.actions.slice(0, 3).join(', ') : 'interacting with product';
    const sensory = categoryData ? categoryData.sensory.slice(0, 2).join(', ') : 'appealing visuals';

    if (isUGC) {
        return `Eh bestie, lo udah nyobain ${info.name} belum? Literally worth it banget sih!
Gue tuh dulu skeptis sama ${info.category.toLowerCase()}, soalnya udah coba banyak tapi hasilnya gitu-gitu aja.
Tapi pas nyobain ${info.name} ini, beda banget! ${sensory}.
Basically juara sih — ${actions}. End-up gue malah repeat order.
Pokoknya recommended banget! Link di bio, buruan sebelum kehabisan!`;
    }
    return `Pernahkah Anda membayangkan ${info.category.toLowerCase()} yang sempurna?
Satu nama terus bersinar — ${info.name}.
${sensory} — setiap detail dirancang untuk pengalaman tak tertandingi.
Rasakan sendiri: ${actions}.
${info.name}. Pilihan cerdas untuk hidup yang lebih baik.`;
}

async function generateSceneVisuals(info, sceneNum, voSnippet, isUGC, totalScenes, categoryData, viralContext, sceneVOImperfections) {
    const mode = isUGC ? 'ugc' : 'ads';
    const structure = viralContext ? viralContext.structure : null;
    const phase = structure && structure[sceneNum - 1]
        ? structure[sceneNum - 1]
        : { phase: getSceneArc(mode, sceneNum - 1).phase, label: getSceneArc(mode, sceneNum - 1).label };
    const arc = getSceneArc(mode, sceneNum - 1);

    const imperfections = (sceneVOImperfections && sceneVOImperfections.length > 0)
        ? sceneVOImperfections
        : (viralContext ? viralContext.getImperfectionsForScene() : []);
    const imperfectionDirective = imperfections.length > 0
        ? `\nREALISM IMPERFECTIONS (MUST include): ${imperfections.join(', ')}`
        : '';

    const emotionDirective = viralContext
        ? `\nEMOTIONAL TONE: ${viralContext.emotionalTrigger.emotion} — ${viralContext.emotionalTrigger.description}`
        : '';

    let sceneDescription;
    try {
        const scenePrompt = isUGC
            ? buildUGCScenePrompt(info, sceneNum, voSnippet, totalScenes, categoryData)
            : buildAdsScenePrompt(info, sceneNum, voSnippet, totalScenes, categoryData);
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

// ==================== MAIN GENERATE ====================
async function startAI() {
    if (!validateInput()) return;

    const key = getApiKey();
    if (!key) { alert('Enter your Google AI Studio API Key first.'); return; }

    const primary = getPrimaryProduct();
    const comparison = getComparisonProduct();
    const isUGC = state.mode === 'ugc';
    const totalScenes = isUGC ? TARGET_UGC_SHOTS : TARGET_AD_SHOTS;

    resetPhraseTracker();
    resetVariationTracker();

    updateConfig({
        mode: state.mode,
        platform: state.selectedVideoModel
    });

    const categoryData = CATEGORY_RULES[state.selectedCategory];
    if (!categoryData) {
        alert('Unsupported category: ' + state.selectedCategory);
        return;
    }

    let viralContext;
    try {
        viralContext = applyViralEngine(state.selectedCategory, state.mode);
    } catch (e) {
        alert('Viral Engine error: ' + e.message);
        return;
    }

    // Show loading
    showLoading();
    const statusEl = document.getElementById('loadingStatus');
    const progEl = document.getElementById('progressBar');

    const info = {
        name: primary.name,
        category: state.selectedCategory,
        desc: primary.description,
        comparison: comparison ? comparison.name : null
    };

    try {
        statusEl.textContent = 'Viral Engine active...';
        progEl.style.width = '5%';
        await delay(400);

        // Per-scene VO
        statusEl.textContent = 'Generating VO per scene...';
        progEl.style.width = '10%';

        let sceneVOs;
        try {
            sceneVOs = await generatePerSceneVO(info, isUGC, categoryData, viralContext, totalScenes);
        } catch (e) {
            console.warn('Per-scene VO failed, using fallback:', e);
            sceneVOs = buildFallbackPerSceneVO(info, viralContext.structure, viralContext, isUGC, categoryData);
        }

        const vo = sceneVOs.map((sv, i) => `(Scene ${i + 1} - ${sv.phase}) ${sv.vo}`).join('\n');

        // Scene visuals
        const shots = [];
        for (let i = 0; i < totalScenes; i++) {
            statusEl.textContent = `Generating Scene ${i + 1}/${totalScenes}...`;
            progEl.style.width = `${20 + (i + 1) * (70 / totalScenes)}%`;
            const sceneVO = sceneVOs[i] || sceneVOs[sceneVOs.length - 1];
            const shot = await generateSceneVisuals(info, i + 1, sceneVO.vo, isUGC, totalScenes, categoryData, viralContext, sceneVO.imperfections);
            shots.push({
                number: i + 1,
                ...shot,
                sceneVO: sceneVO
            });
            if (i < totalScenes - 1) await delay(1200);
        }

        // Validation
        statusEl.textContent = 'Validating output...';
        progEl.style.width = '95%';

        const categoryValidation = validateCategoryOutput(shots, info.category);
        const viralValidation = validateViralOutput(shots.map((s, i) => ({
            vo: sceneVOs[i]?.vo || s.voSnippet,
            description: s.description
        })), viralContext);
        const voSyncValidation = validateVOSync(sceneVOs);
        const outputErrors = validateOutput(shots, sceneVOs);

        progEl.style.width = '100%';
        statusEl.textContent = 'Done!';

        const structured = buildStructuredOutput(vo, shots, info, viralContext, sceneVOs);

        state.generatedData = {
            vo,
            shots,
            sceneVOs,
            info,
            comparison: comparison ? comparison.name : null,
            products: state.products.map(p => ({ ...p })),
            mode: state.mode,
            structured,
            engineConfig: { ...engineConfig },
            categoryValidation,
            viralValidation,
            voSyncValidation,
            outputErrors,
            viralContext: {
                hook: viralContext.hook,
                emotionalTrigger: viralContext.emotionalTrigger,
                structure: viralContext.structure
            }
        };

        await delay(300);
        displayResults();
        saveSession();

    } catch (e) {
        alert('Generate failed: ' + e.message);
        showEmpty();
    }
}

// ==================== DISPLAY ====================
function showEmpty() {
    document.getElementById('outputEmpty').classList.remove('hidden');
    document.getElementById('outputLoading').classList.add('hidden');
    document.getElementById('outputResults').classList.add('hidden');
}

function showLoading() {
    document.getElementById('outputEmpty').classList.add('hidden');
    document.getElementById('outputLoading').classList.remove('hidden');
    document.getElementById('outputResults').classList.add('hidden');
}

function showResults() {
    document.getElementById('outputEmpty').classList.add('hidden');
    document.getElementById('outputLoading').classList.add('hidden');
    document.getElementById('outputResults').classList.remove('hidden');
}

function displayResults() {
    if (!state.generatedData) { showEmpty(); return; }
    showResults();

    const { shots, sceneVOs, info, comparison, viralContext: vc, mode, products } = state.generatedData;
    const container = document.getElementById('sceneContainer');
    container.innerHTML = '';

    const primary = (products || state.products).find(p => p.role === 'primary');
    const compProduct = (products || state.products).find(p => p.role === 'comparison');

    // Compute scene durations
    const durationTarget = state.durationTarget || 30;
    const totalScenes = shots.length;
    const baseDuration = Math.round(durationTarget / totalScenes);

    shots.forEach((shot, i) => {
        const sceneVO = shot.sceneVO || (sceneVOs && sceneVOs[i]) || {};
        const phase = (shot.arcPhase || 'default').toLowerCase();
        const goal = mapPhaseToGoal(phase, i, totalScenes);
        shot.goal = goal;

        const sceneDuration = i === 0 ? baseDuration + 1 : (i === totalScenes - 1 ? baseDuration + 1 : baseDuration);

        const numberClass = getPhaseClass(phase);
        const voText = sceneVO.vo || shot.voSnippet || '';
        const voEmotion = sceneVO.emotion || mapPhaseToEmotion(phase);

        const block = document.createElement('div');
        block.className = 'scene-block';
        block.innerHTML = `
            <div class="scene-header">
                <div class="scene-number ${numberClass}">${shot.number}</div>
                <div class="scene-title-wrap">
                    <div class="scene-title">${shot.title} (${sceneDuration}s)</div>
                    <div class="scene-meta">Scene ${shot.number} of ${totalScenes}</div>
                </div>
            </div>
            <div class="scene-body">
                ${renderSceneRow('person', 'CHARACTER', state.charPersona || getGenderDesc().subj)}
                ${renderSceneRow('package', 'PRIMARY', primary ? primary.name : info.name)}
                ${compProduct ? renderSceneRow('package', 'COMPARISON', compProduct.name) : ''}
                ${renderSceneRow('target', 'GOAL', goal)}

                <div class="scene-copyable">
                    <div class="scene-copyable-header">
                        <span class="scene-copyable-label video">VIDEO PROMPT</span>
                        <button class="btn-copy" data-copy="video-${i}">Copy</button>
                    </div>
                    <div class="scene-copyable-text" id="video-${i}">${escapeHtml(shot.videoPrompt)}</div>
                </div>

                <div class="scene-copyable">
                    <div class="scene-copyable-header">
                        <span class="scene-copyable-label vo">VOICE OVER</span>
                        <button class="btn-copy" data-copy="vo-${i}">Copy</button>
                    </div>
                    <div class="scene-copyable-text" id="vo-${i}">${escapeHtml(voText)}</div>
                </div>

                <div class="scene-copyable">
                    <div class="scene-copyable-header">
                        <span class="scene-copyable-label tts">TTS STYLE</span>
                    </div>
                    <ul class="tts-list">
                        <li><span>tone:</span> ${voEmotion || 'casual'}</li>
                        <li><span>speed:</span> ${i === 0 || i === totalScenes - 1 ? '1.1x' : '1.0x'}</li>
                        <li><span>emotion:</span> ${voEmotion || 'neutral'}</li>
                    </ul>
                </div>

                <div class="scene-copyable">
                    <div class="scene-copyable-header">
                        <span class="scene-copyable-label editor">EDITOR NOTE</span>
                    </div>
                    <ul class="editor-list">
                        <li>${getTimingNote(i, totalScenes, sceneDuration)}</li>
                        <li>${getCameraNote(phase, mode)}</li>
                        <li>${getCutNote(i, totalScenes)}</li>
                    </ul>
                </div>
            </div>
        `;
        container.appendChild(block);
    });

    // Bind copy buttons
    container.querySelectorAll('.btn-copy[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.copy;
            const textEl = document.getElementById(targetId);
            if (textEl) {
                copyToClipboard(btn, textEl.textContent);
            }
        });
    });
}

function renderSceneRow(icon, label, content) {
    const icons = {
        person: '\uD83D\uDC64',
        package: '\uD83D\uDCE6',
        target: '\uD83C\uDFAF'
    };
    return `
        <div class="scene-row">
            <span class="scene-row-icon">${icons[icon] || ''}</span>
            <span class="scene-row-label">${label}:</span>
            <span class="scene-row-content">${escapeHtml(content) || '-'}</span>
        </div>
    `;
}

function mapPhaseToGoal(phase, idx, total) {
    const map = {
        hook: 'hook',
        problem: 'hook',
        discovery: 'solution',
        comparison: 'compare',
        compare: 'compare',
        proof: 'proof',
        result: 'proof',
        cta: 'CTA',
        'call-to-action': 'CTA',
        intro: 'hook',
        buildup: 'compare',
        climax: 'proof',
        resolution: 'CTA'
    };
    if (idx === 0) return 'hook';
    if (idx === total - 1) return 'CTA';
    return map[phase] || 'solution';
}

function mapPhaseToEmotion(phase) {
    const map = {
        hook: 'curious / energetic',
        problem: 'frustrated / relatable',
        discovery: 'surprised / excited',
        comparison: 'analytical / confident',
        proof: 'satisfied / impressed',
        cta: 'urgent / excited'
    };
    return map[phase] || 'natural';
}

function getPhaseClass(phase) {
    if (['hook', 'problem', 'intro'].includes(phase)) return 'hook';
    if (['comparison', 'compare', 'buildup'].includes(phase)) return 'compare';
    if (['discovery', 'solution'].includes(phase)) return 'solution';
    if (['proof', 'result', 'climax'].includes(phase)) return 'proof';
    if (['cta', 'call-to-action', 'resolution'].includes(phase)) return 'cta';
    return 'default';
}

function getTimingNote(idx, total, duration) {
    if (idx === 0) return `Open strong — ${duration}s, front-load action`;
    if (idx === total - 1) return `Close with CTA — ${duration}s, hold product`;
    return `Pace: ${duration}s, maintain rhythm`;
}

function getCameraNote(phase, mode) {
    if (mode === 'ugc') {
        const notes = {
            hook: 'Slight handheld shake, close-up to mid',
            compare: 'Side-by-side or quick cut between products',
            solution: 'Smooth zoom into product detail',
            proof: 'Steady close-up on result/reaction',
            cta: 'Pull back to reveal, direct to camera'
        };
        return notes[getPhaseClass(phase)] || 'Natural handheld movement';
    }
    const notes = {
        hook: 'Dolly in, dramatic reveal',
        compare: 'Split screen or rack focus',
        solution: 'Slow push-in on product',
        proof: 'Beauty shot, smooth orbit',
        cta: 'Final beauty frame, hero shot'
    };
    return notes[getPhaseClass(phase)] || 'Smooth cinematic movement';
}

function getCutNote(idx, total) {
    if (idx === 0) return 'Hard cut to start — grab attention immediately';
    if (idx === total - 1) return 'Dissolve or hold final frame';
    return 'Match cut or quick cut on action';
}

// ==================== CLIPBOARD ====================
function copyToClipboard(btn, text) {
    const decoded = text.replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/&quot;/g, '"').replace(/\\\\/g, '\\');
    navigator.clipboard.writeText(decoded).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = decoded;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
    });
}
window.__copyToClipboard = copyToClipboard;

function copyAllScenes() {
    if (!state.generatedData) { alert('No data to copy.'); return; }
    const { shots, sceneVOs, info, viralContext: vc, products } = state.generatedData;
    const primary = (products || state.products).find(p => p.role === 'primary');
    const comp = (products || state.products).find(p => p.role === 'comparison');
    const totalScenes = shots.length;
    const durationTarget = state.durationTarget || 30;
    const baseDuration = Math.round(durationTarget / totalScenes);

    let text = '';
    shots.forEach((shot, i) => {
        const sv = sceneVOs && sceneVOs[i];
        const phase = (shot.arcPhase || 'default').toLowerCase();
        const goal = mapPhaseToGoal(phase, i, totalScenes);
        const sceneDuration = i === 0 ? baseDuration + 1 : (i === totalScenes - 1 ? baseDuration + 1 : baseDuration);
        const voText = sv ? sv.vo : (shot.voSnippet || '');
        const voEmotion = sv ? sv.emotion : mapPhaseToEmotion(phase);

        text += `=== SCENE ${shot.number} — ${shot.title} (${sceneDuration}s) ===\n\n`;
        text += `CHARACTER:\n${state.charPersona || getGenderDesc().subj}\n\n`;
        text += `PRIMARY:\n${primary ? primary.name : info.name}\n\n`;
        if (comp) text += `COMPARISON:\n${comp.name}\n\n`;
        text += `GOAL:\n${goal}\n\n`;
        text += `VIDEO PROMPT:\n${shot.videoPrompt || ''}\n\n`;
        text += `VOICE OVER:\n${voText}\n\n`;
        text += `TTS STYLE:\n- tone: ${voEmotion || 'casual'}\n- speed: ${i === 0 || i === totalScenes - 1 ? '1.1x' : '1.0x'}\n- emotion: ${voEmotion || 'neutral'}\n\n`;
        text += `EDITOR NOTE:\n- ${getTimingNote(i, totalScenes, sceneDuration)}\n- ${getCameraNote(phase, state.generatedData.mode)}\n- ${getCutNote(i, totalScenes)}\n\n`;
        text += `${'—'.repeat(40)}\n\n`;
    });

    const btn = document.getElementById('copyAllBtn');
    copyToClipboard(btn, text);
}

// ==================== EVENT BINDINGS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Mode toggle
    document.querySelectorAll('#modeToggle .toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#modeToggle .toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.mode = btn.dataset.mode;
            updateConfig({ mode: state.mode });
            saveSession();
        });
    });

    // Category
    document.getElementById('categorySelect').addEventListener('change', (e) => {
        state.selectedCategory = e.target.value;
        saveSession();
    });

    // Character fields
    document.getElementById('charPersona').addEventListener('input', (e) => { state.charPersona = e.target.value; saveSession(); });
    document.getElementById('charStyle').addEventListener('change', (e) => { state.charStyle = e.target.value; saveSession(); });
    document.getElementById('charLang').addEventListener('change', (e) => { state.selectedLang = e.target.value; saveSession(); });
    document.getElementById('charTone').addEventListener('change', (e) => { state.selectedTone = e.target.value; saveSession(); });

    // Content settings
    document.getElementById('durationTarget').addEventListener('change', (e) => { state.durationTarget = parseInt(e.target.value); saveSession(); });
    document.getElementById('contentStyleSelect').addEventListener('change', (e) => { state.contentStyle = e.target.value; saveSession(); });
    document.getElementById('platformSelect').addEventListener('change', (e) => { state.platform = e.target.value; saveSession(); });
    document.getElementById('videoModelSelect').addEventListener('change', (e) => {
        state.selectedVideoModel = e.target.value;
        updateConfig({ platform: e.target.value });
        saveSession();
    });

    // Product system
    document.getElementById('addProductBtn').addEventListener('click', addProduct);
    renderProducts();

    // Character upload
    setupCharUpload();

    // API key
    document.getElementById('saveApiKeyBtn').addEventListener('click', saveApiKeyToStorage);
    document.getElementById('testApiBtn').addEventListener('click', testProviderConnection);

    // Generate
    document.getElementById('generateBtn').addEventListener('click', startAI);

    // Copy All
    document.getElementById('copyAllBtn').addEventListener('click', copyAllScenes);

    // Auto-save
    setInterval(saveSession, 5000);

    // Initialize API key
    state.apiKey = localStorage.getItem(API_KEY_STORAGE) || '';
    if (state.apiKey) {
        document.getElementById('apiKeyInput').value = state.apiKey;
        const warn = document.getElementById('apiWarning');
        warn.textContent = 'API Key saved.';
        warn.classList.add('saved');
    }

    // Restore session
    if (restoreSession()) {
        restoreFormState();
        if (state.generatedData) displayResults();
    }
});

function restoreFormState() {
    // Mode toggle
    document.querySelectorAll('#modeToggle .toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === state.mode);
    });

    // Category
    const catEl = document.getElementById('categorySelect');
    if (catEl) catEl.value = state.selectedCategory;

    // Character
    const personaEl = document.getElementById('charPersona');
    if (personaEl) personaEl.value = state.charPersona || '';
    const styleEl = document.getElementById('charStyle');
    if (styleEl) styleEl.value = state.charStyle || 'casual';
    const langEl = document.getElementById('charLang');
    if (langEl) langEl.value = state.selectedLang || 'ID';
    const toneEl = document.getElementById('charTone');
    if (toneEl) toneEl.value = state.selectedTone || 'jaksel';

    // Content settings
    const durEl = document.getElementById('durationTarget');
    if (durEl) durEl.value = state.durationTarget || 30;
    const csEl = document.getElementById('contentStyleSelect');
    if (csEl) csEl.value = state.contentStyle || 'lifestyle';
    const platEl = document.getElementById('platformSelect');
    if (platEl) platEl.value = state.platform || '';
    const vmEl = document.getElementById('videoModelSelect');
    if (vmEl) vmEl.value = state.selectedVideoModel || 'veo';

    // Products
    renderProducts();

    // Character image
    renderCharUpload();
}
