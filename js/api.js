// ==================== GEMINI API LAYER ====================
import { getGeminiApiUrl, API_KEY_STORAGE, GEMINI_MODEL } from './config.js';
import { state } from './state.js';

// HAMBS AI PROVIDER ROUTER
const AI_PROVIDER_STORAGE = 'hambs_ai_provider';
const OPENROUTER_API_KEY_STORAGE = 'hambs_openrouter_api_key';
const OPENROUTER_MODEL_STORAGE = 'hambs_openrouter_model';
const DEFAULT_OPENROUTER_MODEL = 'openrouter/free';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isTemporaryAiError(e) {
    const msg = String(e?.message || e || '').toLowerCase();
    return msg.includes('high demand')
        || msg.includes('try again later')
        || msg.includes('overloaded')
        || msg.includes('unavailable')
        || msg.includes('rate limit')
        || msg.includes('quota')
        || msg.includes('resource exhausted')
        || msg.includes('429')
        || msg.includes('500')
        || msg.includes('502')
        || msg.includes('503')
        || msg.includes('504');
}

export function getAiProvider() {
    const v = state.aiProvider || localStorage.getItem(AI_PROVIDER_STORAGE) || 'auto';
    return String(v || 'auto').toLowerCase();
}

export function saveAiProviderToStorage(provider = 'auto') {
    const v = ['auto', 'gemini', 'openrouter'].includes(String(provider).toLowerCase())
        ? String(provider).toLowerCase()
        : 'auto';

    state.aiProvider = v;
    localStorage.setItem(AI_PROVIDER_STORAGE, v);
    return v;
}

export function getOpenRouterModel() {
    const model = state.openRouterModel || localStorage.getItem(OPENROUTER_MODEL_STORAGE) || DEFAULT_OPENROUTER_MODEL;
    return String(model || DEFAULT_OPENROUTER_MODEL).trim();
}

export function saveOpenRouterModelToStorage(model = DEFAULT_OPENROUTER_MODEL) {
    const v = String(model || DEFAULT_OPENROUTER_MODEL).trim();
    state.openRouterModel = v;
    localStorage.setItem(OPENROUTER_MODEL_STORAGE, v);
    return v;
}

export function getOpenRouterApiKey(ask = false) {
    let key = state.openRouterApiKey || localStorage.getItem(OPENROUTER_API_KEY_STORAGE) || '';

    if (!key && ask && typeof window !== 'undefined') {
        key = window.prompt('Masukkan OpenRouter API key. Jangan bagikan key ini ke chat/GitHub.') || '';
        key = key.trim();

        if (key) {
            saveOpenRouterApiKeyToStorage(key);
        }
    }

    return String(key || '').trim();
}

export function saveOpenRouterApiKeyToStorage(key = '') {
    const v = String(key || '').trim();
    state.openRouterApiKey = v;

    if (v) {
        localStorage.setItem(OPENROUTER_API_KEY_STORAGE, v);
    } else {
        localStorage.removeItem(OPENROUTER_API_KEY_STORAGE);
    }

    return v;
}

async function requestGeminiPayload(payload, key) {
    const res = await fetch(getGeminiApiUrl(key), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.error?.message || err.message || `HTTP ${res.status}`;
        const e = new Error(`HTTP ${res.status}: ${msg}`);
        e.status = res.status;
        e.details = err;
        throw e;
    }

    const d = await res.json();
    const text = d?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini tidak mengembalikan teks.');
    return text;
}

async function requestGeminiWithRetry(payload, key, label) {
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            return await requestGeminiPayload(payload, key);
        } catch (e) {
            lastError = e;

            if (!isTemporaryAiError(e) || attempt === 3) {
                throw e;
            }

            const delay = 1200 * attempt;
            console.warn(`Gemini ${label} temporary failure, retry ${attempt}/3 in ${delay}ms:`, e);
            await sleep(delay);
        }
    }

    throw lastError;
}

async function callGeminiDirect(prompt) {
    const key = getApiKey();
    if (!key) throw new Error('API Key Gemini tidak ditemukan. Masukkan API Key Google AI Studio.');

    state.apiKey = key;
    localStorage.setItem(API_KEY_STORAGE, key);

    const basePayload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.85,
            topP: 0.95,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json'
        }
    };

    const fallbackPayload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.85,
            topP: 0.95,
            maxOutputTokens: 4096
        }
    };

    try {
        const text = await requestGeminiWithRetry(basePayload, key, 'JSON-mode');
        return {
            text,
            provider: 'gemini',
            model: 'gemini-2.5-flash',
            source: 'gemini'
        };
    } catch (e) {
        console.warn('Gemini JSON-mode request failed, retrying standard request:', e);
        const text = await requestGeminiWithRetry(fallbackPayload, key, 'standard');
        return {
            text,
            provider: 'gemini',
            model: 'gemini-2.5-flash',
            source: 'gemini'
        };
    }
}

async function requestOpenRouterPayload(payload, key) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'X-Title': 'HAMBS Prompt Studio'
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.error?.message || err.message || `HTTP ${res.status}`;
        const e = new Error(`HTTP ${res.status}: ${msg}`);
        e.status = res.status;
        e.details = err;
        throw e;
    }

    const d = await res.json();
    const text = d?.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenRouter tidak mengembalikan teks.');
    return text;
}

async function requestOpenRouterWithRetry(payload, key, label) {
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            return await requestOpenRouterPayload(payload, key);
        } catch (e) {
            lastError = e;

            if (!isTemporaryAiError(e) || attempt === 3) {
                throw e;
            }

            const delay = 1200 * attempt;
            console.warn(`OpenRouter ${label} temporary failure, retry ${attempt}/3 in ${delay}ms:`, e);
            await sleep(delay);
        }
    }

    throw lastError;
}

async function callOpenRouter(prompt) {
    const key = getOpenRouterApiKey(true);
    if (!key) throw new Error('OpenRouter API Key belum diisi.');

    const model = getOpenRouterModel();

    const basePayload = {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.85,
        top_p: 0.95,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
    };

    const fallbackPayload = {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.85,
        top_p: 0.95,
        max_tokens: 4096
    };

    try {
        const text = await requestOpenRouterWithRetry(basePayload, key, 'JSON-mode');
        return {
            text,
            provider: 'openrouter',
            model,
            source: `openrouter:${model}`
        };
    } catch (e) {
        console.warn('OpenRouter JSON-mode request failed, retrying standard request:', e);
        const text = await requestOpenRouterWithRetry(fallbackPayload, key, 'standard');
        return {
            text,
            provider: 'openrouter',
            model,
            source: `openrouter:${model}`
        };
    }
}


export function getApiKey() {
    return document.getElementById('apiKeyInput')?.value?.trim()
        || localStorage.getItem(API_KEY_STORAGE)
        || state.apiKey;
}

export function saveApiKeyToStorage() {
    const k = document.getElementById('apiKeyInput').value.trim();
    if (k) {
        state.apiKey = k;
        localStorage.setItem(API_KEY_STORAGE, k);
        document.getElementById('apiWarning').innerHTML = '&#10003; Tersimpan';
        alert('API Key tersimpan!');
    }
}

export async function testProviderConnection() {
    const key = getApiKey();
    if (!key) { alert('Masukkan API Key Google AI Studio!'); return; }
    const resEl = document.getElementById('apiTestResult');
    resEl.className = 'api-test-result info show';
    resEl.textContent = 'Menguji koneksi ke Google Gemini...';
    try {
        const res = await fetch(getGeminiApiUrl(key), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Reply with exactly: OK' }] }],
                generationConfig: { maxOutputTokens: 10 }
            })
        });
        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            const detail = errBody?.error?.message || `Status ${res.status}`;
            if (res.status === 400) throw new Error(`API Key tidak valid. Detail: ${detail}`);
            if (res.status === 403) throw new Error(`API Key ditolak. Detail: ${detail}`);
            if (res.status === 429) throw new Error(`Rate limit tercapai. Detail: ${detail}`);
            throw new Error(`HTTP ${res.status}: ${detail}`);
        }
        const d = await res.json();
        const text = d?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        resEl.className = 'api-test-result success show';
        resEl.textContent = `Koneksi berhasil! Model: ${GEMINI_MODEL}. Response: "${text.trim()}"`;
        state.apiKey = key;
        localStorage.setItem(API_KEY_STORAGE, key);
    } catch (e) {
        resEl.className = 'api-test-result error show';
        resEl.textContent = `Error: ${e.message}`;
    }
}

export async function callAI(prompt) {
    const provider = getAiProvider();

    if (provider === 'gemini') {
        return await callGeminiDirect(prompt);
    }

    if (provider === 'openrouter') {
        return await callOpenRouter(prompt);
    }

    try {
        return await callGeminiDirect(prompt);
    } catch (geminiError) {
        if (!isTemporaryAiError(geminiError)) {
            throw geminiError;
        }

        console.warn('Gemini direct failed temporarily, trying OpenRouter:', geminiError);

        try {
            return await callOpenRouter(prompt);
        } catch (openRouterError) {
            const g = geminiError?.message || String(geminiError);
            const o = openRouterError?.message || String(openRouterError);
            throw new Error(`Gemini failed: ${g}. OpenRouter failed: ${o}`);
        }
    }
}

export async function callAIWithSystem(systemPrompt, userPrompt) {
    const key = getApiKey();
    if (!key) throw new Error('API Key tidak ditemukan. Masukkan API Key Google AI Studio.');
    state.apiKey = key;
    localStorage.setItem(API_KEY_STORAGE, key);
    const res = await fetch(getGeminiApiUrl(key), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { temperature: 0.85, topP: 0.95, maxOutputTokens: 4096 }
        })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    const d = await res.json();
    return d.candidates[0].content.parts[0].text;
}
