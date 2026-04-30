// ==================== HAMBS V5 CLEAN ENGINE APPLICATION ====================
// UI/API tetap, semua generator lama dipensiunkan. Generation path:
// UI → buildContext → Gemini Plan → V5 Platform Prompts → Master Pack.

import { engineConfig, updateConfig, SHOT_COLORS, API_KEY_STORAGE, PERSONAS, ENERGY_LEVELS } from './config.js?v=202604300940';
import { state } from './state.js?v=202604300940';
import { delay, escapeForAttr } from './utils.js?v=202604300940';
import {
  callAI,
  saveApiKeyToStorage,
  testProviderConnection,
  getApiKey,
  testOpenRouterConnection,
  getAiProvider,
  saveAiProviderToStorage,
  getOpenRouterApiKey,
  saveOpenRouterApiKeyToStorage,
  getOpenRouterModel,
  saveOpenRouterModelToStorage
} from './api.js?v=202604300940';
import { getImagePlatformLabel, getVideoPlatformLabel } from './promptBuilder.js?v=202604300940';
import { buildContext } from './engine/buildContext.js?v=202604300940';
import { buildGeminiPrompt } from './engine/buildGeminiPrompt.js?v=202604300940';
import { buildCreativePlan } from './engine/routeContent.js?v=202604300940';
import { buildOutputPack } from './engine/buildOutput.js?v=202604300940';
import {
  saveSession, restoreSession, clearSession, handleFile, updateConfirmBtn,
  loadProjectList, saveCurrentProject, exportProject, importProject, loadSelectedProject
} from './session.js?v=202604300940';

// ==================== NAVIGATION ====================
function selectMode(mode) {
  state.contentStyle = mode;
  updateConfig({ mode: mode === 'UGC' ? 'ugc' : 'ads' });
  document.getElementById('panel-mode')?.classList.remove('active');
  document.getElementById('panel-0')?.classList.add('active');
  state.currentStep = 0;
  updateUI();
  saveSession();
}

function goToModeSelection() {
  state.currentStep = -1;
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-mode')?.classList.add('active');
  updateUI();
  saveSession();
}

function goToStep(s, { force = false } = {}) {
  if (!force && s === 2 && !state.generatedData) { alert('Silakan generate dulu!'); return; }
  if (!force && s === 3 && !state.generatedData) { alert('Tidak ada data Master Plan. Silakan generate dulu!'); return; }
  state.currentStep = s;
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  if (s === -1) document.getElementById('panel-mode')?.classList.add('active');
  else document.getElementById(`panel-${s}`)?.classList.add('active');

  document.querySelectorAll('.step-item').forEach((it, i) => {
    it.classList.remove('active', 'completed', 'disabled');
    if (i === s) it.classList.add('active');
    if (i < s) it.classList.add('completed');
    if ((i === 2 || i === 3) && !state.generatedData) it.classList.add('disabled');
  });
  saveSession();
}
function updateUI() { goToStep(state.currentStep); }

function selOpt(btn, grp) {
  btn.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected', 'purple', 'green'));
  btn.classList.add('selected');
  if (grp === 'vid') { state.selectedStyle = btn.textContent.trim(); btn.classList.add('purple'); }
  if (grp === 'cat') state.selectedCategory = btn.textContent.trim();
  if (grp === 'lang') state.selectedLang = btn.textContent.includes('ID') ? 'ID' : 'EN';
  if (grp === 'tone') state.selectedTone = btn.getAttribute('data-tone') || 'jaksel';
  if (grp === 'ugcBg') state.ugcBackground = btn.getAttribute('data-keywords') || '';
  if (grp === 'presentation') {
    state.presentationKeywords = btn.getAttribute('data-keywords') || '';
    state.presentationType = btn.getAttribute('data-presentation') || state.presentationType || 'talking_head';
  }
  if (grp === 'lens') state.lensStyle = btn.getAttribute('data-lens') || 'portrait';
  if (grp === 'videoModel') { state.selectedVideoModel = btn.getAttribute('data-model') || 'veo'; updateConfig({ platform: state.selectedVideoModel }); }
  if (grp === 'imageModel') { state.selectedImageModel = btn.getAttribute('data-model') || 'banana_pro'; updateConfig({ imagePlatform: state.selectedImageModel }); }
  saveSession();
}


const STRATEGY_FIELD_IDS = [
  'targetPlatform','contentGoal','targetAudience','contentDuration','sceneCount',
  'hookType','ctaType','productVisibility','cameraStyle'
];

function syncStrategyStateFromUI() {
  STRATEGY_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) state[id] = el.value || state[id] || '';
  });
}

function syncStrategyUIFromState() {
  STRATEGY_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el && state[id] != null) el.value = state[id];
  });
}


const REFERENCE_CONTROL_FIELD_IDS = [
  'characterMode','characterGender','characterAgeRange','characterLock','outfitLock','characterNotes',
  'backgroundMode','backgroundLock','backgroundLabel','backgroundDescription','lightingLock','continuityStrength',
  'productRef1Role','productRef2Role','productRef3Role','productRef4Role',
  'productRef1Instruction','productRef2Instruction','productRef3Instruction','productRef4Instruction',
  'scene1ProductRefs','scene2ProductRefs','scene3ProductRefs','scene4ProductRefs','scene5ProductRefs',
  'scene6ProductRefs','scene7ProductRefs','scene8ProductRefs','scene9ProductRefs','scene10ProductRefs',
  'scene1ProductVisibility','scene2ProductVisibility','scene3ProductVisibility','scene4ProductVisibility','scene5ProductVisibility',
  'scene6ProductVisibility','scene7ProductVisibility','scene8ProductVisibility','scene9ProductVisibility','scene10ProductVisibility',
  'scene1ProductRole','scene2ProductRole','scene3ProductRole','scene4ProductRole','scene5ProductRole',
  'scene6ProductRole','scene7ProductRole','scene8ProductRole','scene9ProductRole','scene10ProductRole',
  'scene1ProductInstruction','scene2ProductInstruction','scene3ProductInstruction','scene4ProductInstruction','scene5ProductInstruction',
  'scene6ProductInstruction','scene7ProductInstruction','scene8ProductInstruction','scene9ProductInstruction','scene10ProductInstruction'
];

function syncReferenceControlStateFromUI() {
  REFERENCE_CONTROL_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) state[id] = el.value ?? state[id] ?? '';
  });

  state.productRefRoles = {};
  state.productRefInstructions = {};
  for (let i = 1; i <= 4; i++) {
    state.productRefRoles[`prod${i}`] = state[`productRef${i}Role`] || 'auto';
    state.productRefInstructions[`prod${i}`] = state[`productRef${i}Instruction`] || '';
  }

  state.sceneProductRefMap = {};
  for (let i = 1; i <= 10; i++) {
    state.sceneProductRefMap[String(i)] = {
      refs: state[`scene${i}ProductRefs`] || 'auto',
      visibility: state[`scene${i}ProductVisibility`] || 'balanced',
      role: state[`scene${i}ProductRole`] || '',
      instruction: state[`scene${i}ProductInstruction`] || ''
    };
  }
}

function syncReferenceControlUIFromState() {
  REFERENCE_CONTROL_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el && state[id] != null) el.value = state[id];
  });
}

function initReferenceControlUI() {
  syncReferenceControlUIFromState();
  REFERENCE_CONTROL_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? 'input' : 'change', e => {
        state[id] = e.target.value;
        syncReferenceControlStateFromUI();
        saveSession();
      });
    }
  });
}

// ==================== GENERATE LOGIC ====================
async function startAI() {
  state.productName = document.getElementById('productName')?.value || 'Produk';
  state.productDescription = document.getElementById('productDescription')?.value || '';
  state.customNegativePrompt = document.getElementById('customNegativePrompt')?.value || '';
  syncStrategyStateFromUI();

  const provider = getAiProvider();
  const geminiKey = getApiKey();
  const openRouterKey = getOpenRouterApiKey(false);

  if (provider === 'gemini' && !geminiKey) {
    alert('Masukkan API Key Google AI Studio!');
    return;
  }

  if (provider === 'openrouter' && !openRouterKey) {
    alert('Masukkan OpenRouter API Key!');
    return;
  }

  if (provider === 'auto' && !geminiKey && !openRouterKey) {
    alert('Masukkan API Key Google AI Studio atau OpenRouter API Key!');
    return;
  }

  const isUGC = state.contentStyle === 'UGC';
  // V5 fix: do not force UGC video style to Lifestyle. User choice stays respected.
  updateConfig({
    mode: isUGC ? 'ugc' : 'ads',
    platform: state.selectedVideoModel || 'veo',
    imagePlatform: state.selectedImageModel || 'banana_pro'
  });

  goToStep(2, { force: true });
  const statusEl = document.getElementById('loadingStatus');
  const progEl = document.getElementById('progressBar');

  try {
    statusEl.textContent = '🧠 Building V5 Creative Brief...';
    progEl.style.width = '8%';
    const ctx = buildContext();
    await delay(250);

    statusEl.textContent = `🔎 Product detector: ${ctx.productTypeLabel} (${Math.round(ctx.productConfidence * 100)}%)...`;
    progEl.style.width = '18%';
    await delay(250);

    statusEl.textContent = `🤖 Asking ${provider === 'openrouter' ? 'OpenRouter' : provider === 'gemini' ? 'Gemini' : 'AI provider'} for structured creative plan...`;
    progEl.style.width = '35%';
    let raw = '';
    let aiError = '';
    let aiSource = '';
    let aiResult = null;

    try {
      aiResult = await callAI(buildGeminiPrompt(ctx));
      raw = aiResult?.text || '';
      aiSource = aiResult?.source || aiResult?.provider || '';
    } catch (e) {
      aiError = e?.message || String(e);
      console.warn('AI plan failed before routing:', e);
      raw = '';
      aiSource = '';
    }

    statusEl.textContent = '🧩 Routing through UGC/Ads + platform split...';
    progEl.style.width = '58%';
    const plan = buildCreativePlan(raw, ctx, aiError, aiSource);

    if (!plan.source || plan.source === 'fallback') {
      const reason = plan.fallbackReason || 'AI did not return a valid creative plan.';
      const preview = plan.rawGeminiPreview ? `
Raw AI preview: ${plan.rawGeminiPreview}` : '';
      throw new Error(`AI creative plan failed. ${reason}${preview}`);
    }
    await delay(250);

    statusEl.textContent = `📸 ${getImagePlatformLabel(ctx.imageModel)} + 🎥 ${getVideoPlatformLabel(ctx.videoModel)} prompts...`;
    progEl.style.width = '78%';
    const pack = buildOutputPack(plan, ctx);
    await delay(250);

    statusEl.textContent = '✅ Validating product/mode/platform separation...';
    progEl.style.width = '92%';
    await delay(250);

    state.generatedData = {
      vo: pack.vo,
      shots: pack.shots.map((s, i) => ({ ...s, headerColor: SHOT_COLORS[i] || 'yellow' })),
      sceneVOs: pack.sceneVOs,
      info: { name: ctx.productName, category: ctx.category, desc: ctx.productDescription },
      contentStyle: isUGC ? 'UGC' : 'IKLAN',
      structured: pack.structured,
      engineConfig: { ...engineConfig },
      validation: pack.validation,
      debugContext: pack.debugContext,
      planSource: plan.source,
      fallbackReason: plan.fallbackReason || '',
      rawGeminiPreview: plan.rawGeminiPreview || plan.rawAiPreview || '',
      rawAiPreview: plan.rawAiPreview || plan.rawGeminiPreview || '',
      aiBrief: ctx.creativeBrief || ''
    };

    statusEl.textContent = `🎉 Selesai! V5 Clean Engine aktif (${plan.source}).`;
    progEl.style.width = '100%';
    displayMasterPlan();
    await delay(400);
    goToStep(3);
    saveSession();
  } catch (e) {
    console.error(e);
    alert('Generate gagal: ' + e.message + '\nCoba cek koneksi, API key, atau console browser.');
    goToStep(1);
  }
}

function activeGeneratedConfig() { return state.generatedData?.engineConfig || engineConfig; }
function currentImageLabel() { return getImagePlatformLabel(activeGeneratedConfig().imagePlatform || state.selectedImageModel); }
function currentVideoLabel() { return getVideoPlatformLabel(activeGeneratedConfig().platform || state.selectedVideoModel); }

// ==================== DISPLAY ====================
function displayMasterPlan() {
  if (!state.generatedData) return;
  const { vo, shots, sceneVOs, debugContext: ctx } = state.generatedData;
  const fullVO = document.getElementById('fullVO');
  if (fullVO) fullVO.textContent = vo;

  const container = document.getElementById('shotCards');
  if (!container) return;
  container.innerHTML = '';

  const engineInfo = document.createElement('div');
  engineInfo.className = 'engine-info-badge';
  engineInfo.innerHTML = `
    <span class="engine-mode ${engineConfig.mode}">${engineConfig.mode === 'ugc' ? '📱 UGC Clean' : '🎥 Ads Clean'}</span>
    <span class="engine-platform">📸 ${currentImageLabel()}</span>
    <span class="engine-platform">🎥 ${currentVideoLabel()}</span>
    <span class="engine-persona">${PERSONAS[engineConfig.persona]?.icon || '👯'} ${PERSONAS[engineConfig.persona]?.label || 'Best Friend'}</span>
    <span class="engine-energy">${ENERGY_LEVELS[engineConfig.energy]?.icon || '⚡'} ${ENERGY_LEVELS[engineConfig.energy]?.label || 'Balanced'}</span>
    <span class="engine-realism">Realism: ${engineConfig.realism}%</span>
    <span class="engine-category">📁 ${ctx?.category || state.selectedCategory}</span>
    <span class="engine-category">🧠 ${ctx?.productTypeLabel || 'Product Type'} ${ctx?.productConfidence ? Math.round(ctx.productConfidence * 100) + '%' : ''}</span>
    <span class="engine-category">🎭 ${ctx?.presentation?.label || 'Presentation'}</span>\n    <span class="engine-category">🎯 ${ctx?.platformProfile?.label || ctx?.targetPlatform || 'Platform'}</span>\n    <span class="engine-category">📣 ${String(ctx?.contentGoal || 'goal').replace(/_/g, ' ')}</span>
  `;
  container.appendChild(engineInfo);

  const cleanBadge = document.createElement('div');
  cleanBadge.className = 'viral-engine-badge';
  cleanBadge.style.cssText = 'background:linear-gradient(135deg,#08111f,#172554);border:1px solid #38bdf8;border-radius:10px;padding:12px 16px;margin-bottom:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;';
  cleanBadge.innerHTML = `
    <span style="background:#0284c7;color:#fff;padding:3px 10px;border-radius:6px;font-size:0.75rem;font-weight:700;">V5 CLEAN ENGINE</span>
    <span style="background:#111827;color:#93c5fd;padding:3px 10px;border-radius:6px;font-size:0.75rem;">Source: ${state.generatedData.planSource}</span>
    <span style="background:#111827;color:#a7f3d0;padding:3px 10px;border-radius:6px;font-size:0.75rem;">Mode split: UGC/Ads isolated</span>
    <span style="background:#111827;color:#fef3c7;padding:3px 10px;border-radius:6px;font-size:0.75rem;">Platform split: Image/Video isolated</span>
  `;
  container.appendChild(cleanBadge);

  if (state.generatedData.validation && !state.generatedData.validation.valid) {
    const warning = document.createElement('div');
    warning.style.cssText = 'background:#2a1f00;border:1px solid #f59e0b;color:#fbbf24;padding:8px 12px;border-radius:8px;margin-bottom:12px;font-size:0.8rem;';
    warning.innerHTML = `⚠️ V5 validation warning: <strong>${state.generatedData.validation.warnings.join('; ')}</strong>`;
    container.appendChild(warning);
  }

  shots.forEach((shot, i) => {
    const color = shot.headerColor || SHOT_COLORS[i] || 'yellow';
    const charBadge = state.uploadedFiles.char ? '<span class="character-badge">👤 REF</span>' : '';
    const prodBadge = state.uploadedFiles.prod.some(p => p) ? '<span class="shot-card-asset-ref">📦 PRODUCT REF</span>' : '';
    const arcBadge = shot.arcPhase ? `<span class="arc-badge">${shot.arcPhase.toUpperCase()}</span>` : '';
    const sceneVO = shot.sceneVO || sceneVOs?.[i] || null;
    const imperfectionHtml = (sceneVO?.imperfections || []).length > 0
      ? `<div style="margin-top:6px;padding:4px 8px;background:#1a1a2e;border-radius:4px;font-size:0.7rem;color:#a78bfa;">🎭 ${sceneVO.imperfections.join(' | ')}</div>`
      : '';

    const card = document.createElement('div');
    card.className = 'shot-card';
    card.innerHTML = `
      <div class="shot-card-header ${color}">
        <div class="shot-number-badge ${color}">${shot.number}</div>
        <div><div class="shot-card-title">${shot.title}${charBadge} ${arcBadge}</div>${prodBadge}</div>
      </div>
      <div class="shot-card-body">
        <div class="shot-vo-section">
          <div class="shot-vo-label">🎙️ SCENE VO <span style="background:#1e1e2e;color:#60a5fa;padding:2px 6px;border-radius:4px;font-size:0.65rem;margin-left:4px;">⏱ ${sceneVO?.duration || '2-4s'}</span></div>
          <div class="shot-vo-text">${sceneVO?.vo || shot.voSnippet || ''}</div>
          ${imperfectionHtml}
        </div>
        <div class="shot-prompt-section">
          <div class="shot-prompt-label">📸 IMAGE PROMPT (${currentImageLabel()})</div>
          <div class="shot-prompt-text">${shot.imagePrompt || ''}</div>
          <button class="btn-copy" onclick="window.__copyToClipboard(this, '${escapeForAttr(shot.imagePrompt || '')}')">📋 Copy</button>
        </div>
        <div class="shot-prompt-section">
          <div class="shot-prompt-label">🎥 VIDEO PROMPT (${currentVideoLabel()})</div>
          <div class="shot-prompt-text">${shot.videoPrompt || ''}</div>
          <button class="btn-copy" onclick="window.__copyToClipboard(this, '${escapeForAttr(shot.videoPrompt || '')}')">📋 Copy</button>
        </div>
      </div>`;
    container.appendChild(card);
  });


  if (state.generatedData.aiBrief) {
    const briefSection = document.createElement('div');
    briefSection.className = 'json-output-section';
    briefSection.innerHTML = `
      <div class="json-output-header"><span>🧠 AI CREATIVE BRIEF SENT</span><button class="btn-copy" id="copyBriefBtn">📋 Copy Brief</button></div>
      <pre class="json-output-text">${state.generatedData.aiBrief}</pre>`;
    container.appendChild(briefSection);
    briefSection.querySelector('#copyBriefBtn').addEventListener('click', function () { copyToClipboard(this, state.generatedData.aiBrief); });
  }

  if (state.generatedData.structured) {
    const jsonSection = document.createElement('div');
    jsonSection.className = 'json-output-section';
    jsonSection.innerHTML = `
      <div class="json-output-header"><span>📄 STRUCTURED JSON OUTPUT</span><button class="btn-copy" id="copyJsonBtn">📋 Copy JSON</button></div>
      <pre class="json-output-text">${JSON.stringify(state.generatedData.structured, null, 2)}</pre>`;
    container.appendChild(jsonSection);
    jsonSection.querySelector('#copyJsonBtn').addEventListener('click', function () { copyToClipboard(this, JSON.stringify(state.generatedData.structured, null, 2)); });
  }
}

// ==================== CLIPBOARD / EXPORT ====================
function copyToClipboard(btn, text) {
  const decoded = String(text || '').replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/&quot;/g, '"').replace(/\\\\/g, '\\');
  navigator.clipboard.writeText(decoded).then(() => {
    const orig = btn.textContent; btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = orig, 1500);
  }).catch(() => {
    const ta = document.createElement('textarea'); ta.value = decoded; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    const orig = btn.textContent; btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = orig, 1500);
  });
}
window.__copyToClipboard = copyToClipboard;

function copyAll(btn) {
  if (!state.generatedData) { alert('Belum ada data!'); return; }
  let text = '=== HAMBS V5 CLEAN ENGINE ===\n';
  text += `Product Type: ${state.generatedData.debugContext?.productTypeLabel || '-'}\n`;
  text += `Mode: ${state.generatedData.contentStyle}\n`;
  text += `Image: ${currentImageLabel()} | Video: ${currentVideoLabel()}\n\n`;
  text += '=== NASKAH VOICEOVER ===\n' + state.generatedData.vo + '\n\n';
  state.generatedData.shots.forEach((shot, i) => {
    const sv = state.generatedData.sceneVOs?.[i];
    text += `=== SCENE ${shot.number}: ${shot.title} ===\n`;
    text += `VO: ${sv?.vo || shot.voSnippet}\n`;
    text += `IMAGE PROMPT: ${shot.imagePrompt}\n`;
    text += `VIDEO PROMPT: ${shot.videoPrompt}\n\n`;
  });
  text += `\n=== STRUCTURED JSON ===\n${JSON.stringify(state.generatedData.structured, null, 2)}\n`;
  copyToClipboard(btn, text);
}
function copyVO(btn) { if (!state.generatedData) { alert('Belum ada data!'); return; } copyToClipboard(btn, state.generatedData.vo); }

function downloadAllAssets() {
  if (!state.generatedData) { alert('Belum ada data untuk di-download!'); return; }
  const ctx = state.generatedData.debugContext || {};
  let content = `HAMBS PRODUCTION — MASTER PROMPT PACK (V5 CLEAN ENGINE)\n`;
  content += `Mode: ${state.generatedData.contentStyle}\nImage Platform: ${currentImageLabel()}\nVideo Platform: ${currentVideoLabel()}\n`;
  content += `Category: ${ctx.category || state.generatedData.info.category}\nProduct Type: ${ctx.productTypeLabel || '-'} (${ctx.productType || '-'})\n`;
  content += `Produk: ${state.generatedData.info.name}\nGenerated: ${new Date().toLocaleString('id-ID')}\n${'='.repeat(60)}\n\n`;
  content += `NASKAH VOICEOVER:\n${state.generatedData.vo}\n\n${'='.repeat(60)}\n\n`;
  state.generatedData.shots.forEach((shot, idx) => {
    const sv = state.generatedData.sceneVOs?.[idx];
    content += `SCENE ${shot.number}: ${shot.title}\n${'-'.repeat(40)}\nVOICEOVER: ${sv?.vo || shot.voSnippet}\nDURATION: ${sv?.duration || 'N/A'}\nEMOTION: ${sv?.emotion || 'N/A'}\n\nIMAGE PROMPT:\n${shot.imagePrompt}\n\nVIDEO PROMPT:\n${shot.videoPrompt}\n\n${'='.repeat(60)}\n\n`;
  });
  content += `\nSTRUCTURED JSON OUTPUT:\n${JSON.stringify(state.generatedData.structured, null, 2)}\n`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `HAMBS_${state.generatedData.info.name.replace(/\s+/g, '_')}_v5_${Date.now()}.txt`;
  a.click(); URL.revokeObjectURL(a.href);
}

// ==================== ENGINE CONFIG UI ====================
function initEngineConfigUI() {
  document.getElementById('personaSelect')?.addEventListener('change', e => { updateConfig({ persona: e.target.value }); saveSession(); });
  document.getElementById('energySelect')?.addEventListener('change', e => { updateConfig({ energy: e.target.value }); saveSession(); });
  document.getElementById('realismSlider')?.addEventListener('input', e => {
    const val = parseInt(e.target.value); updateConfig({ realism: val });
    const label = document.getElementById('realismValue'); if (label) label.textContent = val; saveSession();
  });
  STRATEGY_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (state[id] != null) el.value = state[id];
      el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', e => {
        state[id] = e.target.value;
        saveSession();
      });
    }
  });
}
function bind(id, event, fn) { const el = document.getElementById(id); if (el) el.addEventListener(event, fn); }

// ==================== EVENT BINDINGS ====================
document.addEventListener('DOMContentLoaded', () => {
  bind('homeBtn','click',goToModeSelection); bind('brandIcon','click',goToModeSelection); bind('sidebarBrandIcon','click',goToModeSelection); bind('backToModeBtn','click',goToModeSelection);
  bind('cardIklan','click',() => selectMode('IKLAN')); bind('cardUGC','click',() => selectMode('UGC'));

  document.querySelectorAll('#ugcBgGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'ugcBg'); }));
  document.querySelectorAll('#presentationGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'presentation'); }));
  document.querySelectorAll('#categoryGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'cat'); }));
  document.querySelectorAll('#styleGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'vid'); }));
  document.querySelectorAll('#toneGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'tone'); }));
  document.querySelectorAll('#lensGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'lens'); }));
  document.querySelectorAll('#imageModelGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'imageModel'); }));
  document.querySelectorAll('#videoModelGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'videoModel'); }));
  document.querySelectorAll('#langGrid .option-btn').forEach(b => b.addEventListener('click', function () { selOpt(this, 'lang'); }));

  bind('charUpload','click',() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = e => handleFile(e.target.files[0], 'charUpload', 'char'); i.click(); });
  for (let i = 0; i < 4; i++) bind(`prod${i + 1}`,'click',() => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.onchange = e => handleFile(e.target.files[0], `prod${i + 1}`, 'prod', i); input.click(); });

  bind('generateBtn','click',startAI); bind('btnStep1','click',() => goToStep(1)); bind('saveApiKeyBtn','click',saveApiKeyToStorage); bind('testApiBtn','click',testProviderConnection);
  bind('saveProjectBtn','click',saveCurrentProject); bind('exportProjectBtn','click',exportProject); bind('importProjectBtn','click',() => importProject(goToStep, displayMasterPlan)); bind('projectSelect','change',() => loadSelectedProject(goToStep, displayMasterPlan));
  bind('downloadAllBtn','click',downloadAllAssets); bind('downloadAllMasterBtn','click',downloadAllAssets); bind('resetBtn','click',clearSession);
  bind('copyAllBtn','click',() => copyAll(document.getElementById('copyAllBtn'))); bind('copyVOBtn','click',() => copyVO(document.getElementById('copyVOBtn')));
  document.querySelectorAll('.step-item').forEach(item => item.addEventListener('click', () => goToStep(parseInt(item.getAttribute('data-step')))));

  initEngineConfigUI();
  initReferenceControlUI(); setInterval(saveSession, 3000);
  state.apiKey = localStorage.getItem(API_KEY_STORAGE) || '';
  loadProjectList();
  if (state.apiKey) { const apiInput = document.getElementById('apiKeyInput'); if (apiInput) apiInput.value = state.apiKey; const warn = document.getElementById('apiWarning'); if (warn) warn.innerHTML = '&#10003; Tersimpan'; }
  syncStrategyUIFromState();
  if (restoreSession()) { updateUI(); if (state.currentStep === 3 && state.generatedData) displayMasterPlan(); if (!confirm('Sesi sebelumnya ditemukan. Lanjutkan?')) clearSession(); }
  syncStrategyUIFromState();
  updateConfirmBtn();
});


function bindAiProviderUi() {
  if (document.getElementById('aiProviderCard')) return;

  const card = document.createElement('div');
  card.id = 'aiProviderCard';
  card.className = 'ai-provider-card';
  card.innerHTML = `
    <div class="ai-provider-title">⚡ AI Provider Settings</div>

    <div class="ai-provider-field">
      <label for="aiProvider">AI Provider</label>
      <select id="aiProvider">
        <option value="auto">Auto: Gemini → OpenRouter</option>
        <option value="gemini">Gemini Only</option>
        <option value="openrouter">OpenRouter Only</option>
      </select>
      <div class="ai-provider-hint">Auto akan coba Gemini dulu, lalu OpenRouter kalau Gemini rate limit.</div>
    </div>

    <div class="ai-provider-field" id="openRouterKeyWrap">
      <label for="openRouterApiKey">OpenRouter API Key</label>
      <input id="openRouterApiKey" type="password" placeholder="sk-or-v1-..." autocomplete="off" />
      <div class="ai-provider-hint">Disimpan lokal di browser, bukan di GitHub.</div>
    </div>

    <div class="ai-provider-field" id="openRouterModelWrap">
      <label for="openRouterModel">OpenRouter Model</label>
      <input id="openRouterModel" type="text" placeholder="openrouter/free" autocomplete="off" />
      <div class="ai-provider-hint">Default: openrouter/free</div>
    </div>

    <button id="testOpenRouterApiBtn" type="button" class="ai-provider-test-btn">
      🔌 Tes OpenRouter API
    </button>
    <div id="openRouterTestResult" class="ai-provider-test-result"></div>
  `;

  const buttons = Array.from(document.querySelectorAll('button'));
  const testBtn = buttons.find(btn => (btn.textContent || '').toLowerCase().includes('tes koneksi api'));
  const anchor = testBtn?.parentElement || document.querySelector('main') || document.body;

  if (testBtn?.parentElement) {
    testBtn.parentElement.insertAdjacentElement('afterend', card);
  } else {
    anchor.prepend(card);
  }

  const providerEl = document.getElementById('aiProvider');
  const keyEl = document.getElementById('openRouterApiKey');
  const modelEl = document.getElementById('openRouterModel');
  const keyWrap = document.getElementById('openRouterKeyWrap');
  const modelWrap = document.getElementById('openRouterModelWrap');
  const testOpenRouterBtn = document.getElementById('testOpenRouterApiBtn');
  const openRouterTestResult = document.getElementById('openRouterTestResult');

  providerEl.value = getAiProvider() || 'auto';
  keyEl.value = getOpenRouterApiKey(false) || '';
  modelEl.value = getOpenRouterModel() || 'openrouter/free';

  const sync = () => {
    const provider = providerEl.value || 'auto';
    const showOpenRouter = provider === 'auto' || provider === 'openrouter';
    keyWrap.classList.toggle('hidden', !showOpenRouter);
    modelWrap.classList.toggle('hidden', !showOpenRouter);
  };

  providerEl.addEventListener('change', e => {
    saveAiProviderToStorage(e.target.value);
    sync();
  });

  keyEl.addEventListener('change', e => {
    saveOpenRouterApiKeyToStorage(e.target.value.trim());
  });

  modelEl.addEventListener('change', e => {
    const value = e.target.value.trim() || 'openrouter/free';
    e.target.value = value;
    saveOpenRouterModelToStorage(value);
  });


  if (testOpenRouterBtn) {
    testOpenRouterBtn.addEventListener('click', async () => {
      try {
        saveOpenRouterApiKeyToStorage(keyEl.value.trim());
        saveOpenRouterModelToStorage((modelEl.value.trim() || 'openrouter/free'));

        testOpenRouterBtn.disabled = true;
        testOpenRouterBtn.textContent = '⏳ Mengetes OpenRouter...';
        if (openRouterTestResult) {
          openRouterTestResult.textContent = 'Menghubungi OpenRouter...';
          openRouterTestResult.className = 'ai-provider-test-result';
        }

        const result = await testOpenRouterConnection();

        if (openRouterTestResult) {
          openRouterTestResult.textContent = `✅ OpenRouter OK — ${result.model}`;
          openRouterTestResult.className = 'ai-provider-test-result success';
        }
      } catch (e) {
        if (openRouterTestResult) {
          openRouterTestResult.textContent = `❌ ${e?.message || String(e)}`;
          openRouterTestResult.className = 'ai-provider-test-result error';
        }
      } finally {
        testOpenRouterBtn.disabled = false;
        testOpenRouterBtn.textContent = '🔌 Tes OpenRouter API';
      }
    });
  }

  sync();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindAiProviderUi);
} else {
  bindAiProviderUi();
}
