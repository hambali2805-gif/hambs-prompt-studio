// ==================== GEMINI API LAYER ====================
import { getGeminiApiUrl, API_KEY_STORAGE, GEMINI_MODEL } from './config.js';
import { state } from './state.js';

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
    const key = getApiKey();
    if (!key) throw new Error('API Key tidak ditemukan. Masukkan API Key Google AI Studio.');

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

    async function request(payload) {
        const res = await fetch(getGeminiApiUrl(key), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${res.status}`);
        }

        const d = await res.json();
        const text = d?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Gemini tidak mengembalikan teks.');
        return text;
    }

    try {
        return await request(basePayload);
    } catch (e) {
        console.warn('Gemini JSON-mode request failed, retrying standard request:', e);
        return await request(fallbackPayload);
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
