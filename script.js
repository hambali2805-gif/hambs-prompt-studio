// ==================== CONFIG ====================
const GEMINI_MODEL = 'gemini-2.5-flash-lite'; // gratis, cepat, hemat quota
function getGeminiApiUrl(key) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
}
const TARGET_AD_SHOTS = 10;
const SHOT_COLORS = ['yellow','blue','teal','purple','yellow','blue','teal','purple','yellow','blue'];
const SESSION_KEY = 'hambs_session_v26';
const PROJECTS_KEY = 'hambs_projects_v25';

const SEEDANCE_SYSTEM_PROMPT = `ROLE: Kamu adalah AI Director & Senior Cinematographer spesialis mesin video AI Seedance 2.0.
STRUKTUR PROMPT SEEDANCE 2.0 (WAJIB):
1. Subject & Action Detail.
2. Camera Motion: Dolly In/Out, Orbital Tracking, Pan, Tilt, Rack Focus.
3. Lighting & Optics: Rim lighting, Volumetric, Softbox, Lensa spesifik.
4. Material Physics: ray-traced reflections, subsurface scattering.
5. Ending: --motion 6 --fps 30 --cfg 7 --upscale 2.
Jangan gunakan bullet points. Output hanya satu paragraf narasi prompt.`;

// ==================== STATE ====================
let currentStep = -1;
let contentStyle = 'IKLAN';
let uploadedFiles = { char: null, prod: [null,null,null,null] };
let selectedCategory = 'FASHION';
let selectedStyle = 'LIFESTYLE';
let selectedLang = 'ID';
let productName = 'Indomie Goreng';
let productDescription = '';
let ugcBackground = 'Scandinavian-Japanese fusion, beige limewash wall, light oak wood slats, pampas grass in ceramic vase, linen textures, clean space.';
let presentationKeywords = 'Direct eye contact, framing: medium close-up, hand gestures, expressive facial expressions, talking to camera, FaceTime-style framing.';
let selectedTone = 'jaksel';
let lensStyle = 'portrait';
let selectedVideoModel = 'veo';
let customNegativePrompt = '';
let apiKey = localStorage.getItem('hambs_gemini_key') || '';
let generatedData = null;
let currentProjectName = '';

// ==================== UTILS ====================
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function cleanText(t, fb='') { return String(t||'').trim() || fb; }
function hasCharacterReference() { return !!uploadedFiles.char; }
function updateConfirmBtn() { document.getElementById('btnStep1').disabled = !uploadedFiles.prod.some(p=>p); }

function selectMode(mode) {
    console.log('Masuk mode:', mode);
    contentStyle = mode;
    document.getElementById('panel-mode').classList.remove('active');
    document.getElementById('panel-0').classList.add('active');
    currentStep = 0;
    updateUI();
    saveSession();
}
function goToModeSelection() {
    currentStep = -1;
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-mode').classList.add('active');
    updateUI();
    saveSession();
}
function goToStep(s) {
    if (s === 2 && !generatedData) {
        alert('⚠️ Silakan generate dulu!');
        return;
    }
    if (s === 3 && !generatedData) {
        alert('⚠️ Tidak ada data Master Plan. Silakan generate dulu!');
        return;
    }
    currentStep = s;
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    if (s === -1) document.getElementById('panel-mode').classList.add('active');
    else document.getElementById(`panel-${s}`).classList.add('active');

    document.querySelectorAll('.step-item').forEach((it, i) => {
        it.classList.remove('active', 'completed', 'disabled');
        if (i === s) it.classList.add('active');
        if (i < s) it.classList.add('completed');
        if ((i === 2 || i === 3) && !generatedData) it.classList.add('disabled');
    });
    saveSession();
}

function selOpt(btn, grp) {
    btn.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected','purple','green'));
    btn.classList.add('selected');
    if (grp==='vid') { selectedStyle = btn.textContent; btn.classList.add('purple'); }
    if (grp==='cat') selectedCategory = btn.textContent;
    if (grp==='lang') selectedLang = btn.textContent.includes('ID') ? 'ID' : 'EN';
    if (grp==='tone') { selectedTone = btn.getAttribute('data-tone') || 'jaksel'; }
    if (grp==='ugcBg') { ugcBackground = btn.getAttribute('data-keywords') || ''; }
    if (grp==='presentation') { presentationKeywords = btn.getAttribute('data-keywords') || ''; }
    if (grp==='lens') { lensStyle = btn.getAttribute('data-lens') || 'portrait'; }
    if (grp==='videoModel') { selectedVideoModel = btn.getAttribute('data-model') || 'veo'; }
    console.log(`Opsi ${grp} dipilih:`, btn.textContent.trim());
    saveSession();
}

async function compressImage(base64Str, maxWidth = 800) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                if (img.width <= maxWidth) {
                    canvas.width = img.width;
                    canvas.height = img.height;
                } else {
                    const scale = maxWidth / img.width;
                    canvas.width = maxWidth;
                    canvas.height = img.height * scale;
                }
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            } catch (e) {
                resolve(base64Str);
            }
        };
        img.onerror = () => resolve(base64Str);
        img.src = base64Str;
    });
}
function handleFile(file, boxId, type, idx) {
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
        if (type === 'char') uploadedFiles.char = { preview: compressed };
        else uploadedFiles.prod[idx] = { preview: compressed };
        updateConfirmBtn();
        saveSession();
    };
    r.readAsDataURL(file);
}
function removeUpload(boxId, type, idx) {
    const b = document.getElementById(boxId);
    b.classList.remove('has-image');
    b.innerHTML = `<div class="upload-icon">📷</div><div class="upload-text">${type==='char'?'Karakter':`Produk ${idx+1}`}</div>`;
    if (type === 'char') uploadedFiles.char = null;
    else uploadedFiles.prod[idx] = null;
    updateConfirmBtn();
    saveSession();
}

// ==================== SESSION ====================
function saveSession() {
    try {
        const s = { currentStep, contentStyle, productName, productDescription, selectedCategory, selectedStyle, selectedLang, selectedTone, customNegativePrompt, selectedVideoModel, ugcBackground, presentationKeywords, lensStyle, charPreview: uploadedFiles.char?.preview, prodPreviews: uploadedFiles.prod.map(p=>p?.preview), generatedData, timestamp: Date.now() };
        localStorage.setItem(SESSION_KEY, JSON.stringify(s));
        document.getElementById('sessionBadge').style.opacity = '1';
    } catch(e) {}
}
function restoreSession() {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return false;
    try {
        const s = JSON.parse(saved);
        if (Date.now() - s.timestamp > 24*60*60*1000) { localStorage.removeItem(SESSION_KEY); return false; }
        currentStep = s.currentStep ?? -1;
        contentStyle = s.contentStyle || 'IKLAN';
        productName = s.productName || 'Indomie Goreng';
        productDescription = s.productDescription || '';
        selectedCategory = s.selectedCategory || 'FASHION';
        selectedStyle = s.selectedStyle || 'LIFESTYLE';
        selectedLang = s.selectedLang || 'ID';
        selectedTone = s.selectedTone || 'jaksel';
        customNegativePrompt = s.customNegativePrompt || '';
        selectedVideoModel = s.selectedVideoModel || 'veo';
        ugcBackground = s.ugcBackground || 'Scandinavian-Japanese fusion, beige limewash wall, light oak wood slats, pampas grass in ceramic vase, linen textures, clean space.';
        presentationKeywords = s.presentationKeywords || 'Direct eye contact, framing: medium close-up, hand gestures, expressive facial expressions, talking to camera, FaceTime-style framing.';
        lensStyle = s.lensStyle || 'portrait';
        generatedData = s.generatedData;
        document.getElementById('productName').value = productName;
        document.getElementById('productDescription').value = productDescription;
        document.getElementById('customNegativePrompt').value = customNegativePrompt;
        if (s.charPreview) {
            const b = document.getElementById('charUpload');
            b.classList.add('has-image');
            b.innerHTML = `<img src="${s.charPreview}"><button class="remove-btn">✕</button>`;
            b.querySelector('.remove-btn').addEventListener('click', (e) => { e.stopPropagation(); removeUpload('charUpload', 'char'); });
            uploadedFiles.char = { preview: s.charPreview };
        }
        s.prodPreviews?.forEach((p,i) => {
            if (p) {
                const b = document.getElementById(`prod${i+1}`);
                b.classList.add('has-image');
                b.innerHTML = `<img src="${p}"><button class="remove-btn">✕</button>`;
                b.querySelector('.remove-btn').addEventListener('click', (e) => { e.stopPropagation(); removeUpload(`prod${i+1}`, 'prod', i); });
                uploadedFiles.prod[i] = { preview: p };
            }
        });
        // restore pilihan
        document.querySelectorAll('#ugcBgGrid .option-btn').forEach(b => b.classList.remove('selected'));
        document.querySelector(`#ugcBgGrid [data-keywords="${ugcBackground.replace(/"/g, '&quot;')}"]`)?.classList.add('selected');
        document.querySelectorAll('#presentationGrid .option-btn').forEach(b => b.classList.remove('selected'));
        document.querySelector(`#presentationGrid [data-keywords="${presentationKeywords.replace(/"/g, '&quot;')}"]`)?.classList.add('selected');
        document.querySelectorAll('[data-model]').forEach(b => b.classList.remove('selected'));
        document.querySelector(`[data-model="${selectedVideoModel}"]`)?.classList.add('selected');
        updateUI();
        if (currentStep === 3 && generatedData) displayMasterPlan();
        updateConfirmBtn();
        return true;
    } catch (e) { return false; }
}
function clearSession() { if(confirm('Reset semua?')) { localStorage.removeItem(SESSION_KEY); location.reload(); } }
setInterval(saveSession, 3000);
function updateUI() { goToStep(currentStep); }

// ==================== PROJECT MANAGER ====================
function loadProjectList() {
    const sel = document.getElementById('projectSelect');
    const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '{}');
    sel.innerHTML = '<option value="">-- Pilih Project --</option>';
    Object.keys(projects).forEach(n => {
        const o = document.createElement('option');
        o.value = n;
        o.textContent = `${n} (${new Date(projects[n].timestamp).toLocaleDateString()})`;
        sel.appendChild(o);
    });
}
function saveCurrentProject() {
    if (!generatedData) { alert('⚠️ Generate dulu!'); return; }
    const n = prompt('Nama project:', currentProjectName || 'Project Baru');
    if (!n) return;
    const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '{}');
    projects[n] = { currentStep:3, contentStyle, productName, productDescription, selectedCategory, selectedStyle, selectedLang, selectedTone, customNegativePrompt, selectedVideoModel, ugcBackground, presentationKeywords, lensStyle, generatedData, timestamp: Date.now() };
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    currentProjectName = n;
    loadProjectList();
    alert(`✅ Project "${n}" disimpan!`);
}


// ==================== API (Google Gemini / AI Studio) ====================
const API_KEY_STORAGE = 'hambs_gemini_key';
function saveApiKey() {
    const k = document.getElementById('apiKeyInput').value.trim();
    if (k) { apiKey = k; localStorage.setItem(API_KEY_STORAGE, k); document.getElementById('apiWarning').innerHTML = '✅ Tersimpan'; alert('✅ API Key tersimpan!'); }
}
async function testProviderConnection() {
    const key = document.getElementById('apiKeyInput').value.trim() || apiKey;
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
            if (res.status === 400) {
                throw new Error(`API Key tidak valid. Pastikan key dari Google AI Studio (aistudio.google.com). Detail: ${detail}`);
            }
            if (res.status === 403) {
                throw new Error(`API Key ditolak. Pastikan Gemini API sudah diaktifkan di Google Cloud Console. Detail: ${detail}`);
            }
            if (res.status === 429) {
                throw new Error(`Rate limit tercapai. Coba lagi beberapa detik. Detail: ${detail}`);
            }
            throw new Error(`HTTP ${res.status}: ${detail}`);
        }
        const d = await res.json();
        const text = d?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        resEl.className = 'api-test-result success show';
        resEl.textContent = `✅ Koneksi berhasil! Model: ${GEMINI_MODEL}. Response: "${text.trim()}"`;
        apiKey = key;
        localStorage.setItem(API_KEY_STORAGE, key);
    } catch(e) {
        resEl.className = 'api-test-result error show';
        resEl.textContent = `❌ ${e.message}`;
    }
}
async function callAI(prompt) {
    let key = document.getElementById('apiKeyInput')?.value?.trim() || localStorage.getItem(API_KEY_STORAGE);
    if (!key) throw new Error('API Key tidak ditemukan. Masukkan API Key Google AI Studio.');
    apiKey = key;
    localStorage.setItem(API_KEY_STORAGE, key);
    const res = await fetch(getGeminiApiUrl(key), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
    });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error?.message || `HTTP ${res.status}`); }
    const d = await res.json();
    return d.candidates[0].content.parts[0].text;
}
async function callAIWithSystem(systemPrompt, userPrompt) {
    let key = document.getElementById('apiKeyInput')?.value?.trim() || localStorage.getItem(API_KEY_STORAGE);
    if (!key) throw new Error('API Key tidak ditemukan. Masukkan API Key Google AI Studio.');
    apiKey = key;
    localStorage.setItem(API_KEY_STORAGE, key);
    const res = await fetch(getGeminiApiUrl(key), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
    });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error?.message || `HTTP ${res.status}`); }
    const d = await res.json();
    return d.candidates[0].content.parts[0].text;
}

// ==================== GENERATE LOGIC ====================
async function generateVO(info, isUGC) {
    const isBeverage = info.name.toLowerCase().match(/teh|tea|minum|drink|jus|juice|kopi|coffee|susu|milk/);
    const productTerms = isBeverage
        ? `PENTING: Produk ini adalah minuman dalam PET bottle. JANGAN sebut "package" atau "kemasan". Gunakan: "botol", "buka tutup botolnya", "nyeruput", "seger banget", "dingin".`
        : '';
    const toneInstructions = selectedTone === 'jaksel'
        ? `Gunakan gaya bahasa Jaksel yang NATURAL dan GAUL. Aturan:
- WAJIB pakai: "sih", "dong", "gue", "lo", "literally", "vibe", "worth it", "end-up", "basically", "no debat"
- HINDARI frasa formal/korporat: "dikelola secara modern", "diformulasikan", "menghadirkan inovasi"
- GANTI dengan: "Kualitasnya dijaga banget", "Pake pucuk teh pilihan", "Vibe-nya dapet banget", "Literally seger banget"
- Buat kayak ngomong sama temen, bukan baca naskah
- Santai tapi meyakinkan, casual tapi tetap informatif`
        : 'Gunakan bahasa Indonesia santai biasa, friendly dan conversational.';
    const langNote = selectedLang === 'EN' ? 'Write entirely in English.' : 'Tulis dalam Bahasa Indonesia.';
    try {
        const prompt = isUGC
            ? `Kamu adalah copywriter UGC TikTok profesional yang jago bikin konten viral.
Buat NASKAH VOICEOVER untuk video UGC TikTok Affiliate dengan detail:
- Produk: ${info.name}
- Kategori: ${info.category}
- Deskripsi: ${info.desc || 'tidak ada'}
${productTerms}
${langNote}
${toneInstructions}

FORMAT: Tulis naskah untuk 4 scene (HOOK → PROBLEM → SOLUTION → CTA).
Durasi total sekitar 30-45 detik.
Tambahkan EJAAN FONETIK dalam kurung untuk kata-kata asing/sulit.
Contoh: "worth it (wort-it)", "literally (li-te-re-li)"
Langsung tulis naskahnya tanpa judul/header. Pisahkan tiap scene dengan baris baru.`
            : `Kamu adalah copywriter iklan profesional dan narrator director.
Buat NASKAH VOICEOVER NARATOR untuk video iklan produk dengan detail:
- Produk: ${info.name}
- Kategori: ${info.category}
- Deskripsi: ${info.desc || 'tidak ada'}
${productTerms}
${langNote}

FORMAT: Tulis naskah narator untuk 10 scene cinematic (Opening Hook → Brand Story → Product Reveal → Features → Benefits → Social Proof → Demonstration → Emotional Appeal → Urgency → Closing CTA).
Durasi total sekitar 60 detik.
Gaya: Profesional, cinematic, meyakinkan.
Tambahkan EJAAN FONETIK dalam kurung untuk kata-kata asing/sulit.
Langsung tulis naskahnya tanpa judul/header. Pisahkan tiap scene dengan baris baru.`;
        return cleanText(await callAI(prompt));
    } catch (e) {
        console.error('Gagal generate VO:', e);
        if (isUGC) {
            const bevFallback = isBeverage
                ? `Eh bestie, lo udah nyobain ${info.name} belum? Literally (li-te-re-li) seger banget sih!\nGue tuh dulu males banget minum teh botol, soalnya kebanyakan yang rasanya flat gitu, vibe-nya gak dapet.\nTapi pas nyobain ${info.name} ini, beda dong! Pake pucuk teh pilihan, kualitasnya dijaga banget. Dingin-dingin gini nyeruput satu botol, literally bikin mood naik.\nNo debat (no-debat) sih ini worth it (wort-it) banget! Buruan cobain, link di bio ya!`
                : `Eh bestie, lo udah nyobain ${info.name} belum? Literally (li-te-re-li) worth it (wort-it) banget sih!\nGue tuh dulu skeptis dong sama ${info.category.toLowerCase()}, soalnya udah coba banyak tapi hasilnya gitu-gitu aja.\nTapi pas nyobain ${info.name} ini, beda banget! Vibe-nya dapet, kualitasnya dijaga banget, basically (be-si-ke-li) juara.\nEnd-up (end-ap) gue malah repeat order (ri-pit or-der). Pokoknya recommended (re-ko-men-ded) banget! Link di bio ya!`;
            return bevFallback;
        }
        const bevFallbackIklan = isBeverage
            ? `Satu tegukan yang mengubah segalanya.\nDari pucuk teh terpilih, lahirlah ${info.name}.\nKesegaran sejati dalam setiap tetes — dingin, murni, menyegarkan.\nDibuat dari daun teh pilihan, dipetik di waktu terbaiknya.\nRasakan kesegaran alami yang memanjakan setiap indra Anda.\nDipercaya jutaan penikmat teh di seluruh Indonesia.\nBuka tutup botolnya, rasakan kesegarannya.\nKarena momen terbaik dimulai dari tegukan pertama.\nDapatkan sekarang — kesegaran menanti Anda.\n${info.name}. Teh terbaik dari pucuknya.`
            : `Pernahkah Anda membayangkan ${info.category.toLowerCase()} yang sempurna?\nDi dunia yang penuh pilihan, satu nama terus bersinar — ${info.name}.\nDiracik dengan teknologi terdepan dan bahan pilihan terbaik.\nSetiap detail dirancang untuk memberikan pengalaman yang tak tertandingi.\nRasakan perbedaannya sejak sentuhan pertama.\nDipercaya oleh ribuan pelanggan di seluruh Indonesia.\nLihat bagaimana ${info.name} mengubah rutinitas Anda.\nKarena Anda layak mendapatkan yang terbaik.\nPenawaran terbatas — jangan sampai kehabisan.\n${info.name}. Pilihan cerdas untuk hidup yang lebih baik.`;
        return bevFallbackIklan;
    }
}
async function startAI() {
    productName = document.getElementById('productName').value || 'Produk';
    productDescription = document.getElementById('productDescription').value || '';
    customNegativePrompt = document.getElementById('customNegativePrompt')?.value || '';
    if (!apiKey) { alert('Masukkan API Key Google AI Studio!'); return; }
    const isUGC = contentStyle === 'UGC';
    if (isUGC) selectedStyle = 'LIFESTYLE';
    const totalScenes = isUGC ? 4 : TARGET_AD_SHOTS;
    
    goToStep(2);
    const statusEl = document.getElementById('loadingStatus'), progEl = document.getElementById('progressBar');
    const info = { name: productName, category: selectedCategory, desc: productDescription };
    
    try {
        statusEl.textContent = '🎙️ Generate naskah...'; progEl.style.width = '10%';
        const vo = await generateVO(info, isUGC);
        document.getElementById('fullVO').textContent = vo;
        
        const voSnippets = splitVO(vo, totalScenes);
        const shots = [];
        for (let i = 0; i < totalScenes; i++) {
            statusEl.textContent = `🎬 Generate Scene ${i+1}/${totalScenes}...`;
            progEl.style.width = `${20 + (i+1) * (70/totalScenes)}%`;
            const shot = await generateSceneVisuals(info, i+1, voSnippets[i] || vo, isUGC, totalScenes);
            shots.push({ number: i+1, ...shot, headerColor: SHOT_COLORS[i] || 'yellow' });
            if (i < totalScenes - 1) await delay(1500);
        }
        statusEl.textContent = '✅ Selesai!'; progEl.style.width = '100%';
        generatedData = { vo, shots, info, contentStyle: isUGC?'UGC':'IKLAN' };
        displayMasterPlan();
        await delay(500);
        goToStep(3);
        saveSession();
    } catch (e) {
        alert('❌ Generate gagal: ' + e.message + '\nCoba cek koneksi atau API key.');
        goToStep(1);
    }
}

// ==================== HELPER FUNCTIONS ====================
function splitVO(vo, count) {
    if (!vo) return Array(count).fill('');

    const sceneLabelRegex = /\(scene\s+\d+\s*-\s*[^)]+\)/gi;
    const hasSceneLabels = sceneLabelRegex.test(vo);

    if (hasSceneLabels) {
        const parts = vo.split(/\(scene\s+\d+\s*-\s*[^)]+\)/i);
        const result = [];
        for (let i = 1; i < parts.length; i++) {
            const text = parts[i].trim();
            if (text) result.push(text);
        }
        while (result.length < count) result.push(result[result.length - 1] || '');
        if (result.length > count) return result.slice(0, count);
        return result;
    }

    const lines = vo.split('\n').filter(l => l.trim().length > 0);
    if (lines.length <= count) {
        const result = [...lines];
        while (result.length < count) result.push(lines[lines.length - 1] || '');
        return result;
    }
    const perChunk = Math.ceil(lines.length / count);
    const result = [];
    for (let i = 0; i < count; i++) {
        const chunk = lines.slice(i * perChunk, (i + 1) * perChunk);
        result.push(chunk.join(' '));
    }
    return result;
}

function getLensPrompt() {
    switch (lensStyle) {
        case 'portrait': return 'Shot on 85mm f/1.4 portrait lens, shallow depth of field, creamy bokeh background, face in sharp focus';
        case 'lifestyle': return 'Shot on 35mm f/2.0 wide lens, environmental portrait, model and surroundings in context, natural perspective';
        case 'macro': return 'Shot on 100mm f/2.8 macro lens, extreme close-up, fine texture details, razor-thin focal plane';
        default: return 'Shot on 50mm f/1.8 standard lens, natural perspective';
    }
}

function getNegativePrompt() {
    const base = 'deformed, blurry, low quality, distorted face, extra fingers, bad anatomy, watermark, text overlay, logo';
    return customNegativePrompt ? `${base}, ${customNegativePrompt}` : base;
}

function getGenderDesc() {
    const g = document.getElementById('charGender')?.value || 'wanita';
    return g === 'pria'
        ? { subj: 'A young Indonesian man', pronoun: 'he', possessive: 'his' }
        : { subj: 'A young Indonesian woman', pronoun: 'she', possessive: 'her' };
}

function getStyleContext(isUGC) {
    if (isUGC) {
        return {
            camera: 'handheld camera, slightly shaky, natural framing',
            lighting: 'natural sunlight, indoor ambient lighting, soft window light',
            vibe: 'casual, relatable, person-next-door aesthetic',
            background: 'natural/messy backgrounds, coffee shops, parks, bedroom',
            outfit: 'casual everyday outfit'
        };
    }
    return {
        camera: 'stable cinematic movement, slider, crane, tripod-locked',
        lighting: 'three-point lighting, studio rim light, high-end commercial look',
        vibe: 'high production value, premium, aspirational',
        background: 'perfectly curated studio or location',
        outfit: 'professional styling, polished look'
    };
}

function buildImagePrompt(sceneDesc, voSnippet, isUGC) {
    const gender = getGenderDesc();
    const charRef = hasCharacterReference()
        ? `[REF:CHARACTER] ${gender.subj} (reference character), `
        : `${gender.subj}, casual outfit, `;
    const prodRef = uploadedFiles.prod.some(p => p)
        ? '[REF:PRODUCT] '
        : `${productName} (${selectedCategory}), `;
    const lens = getLensPrompt();
    const neg = getNegativePrompt();
    const style = getStyleContext(isUGC);
    const bananaPro = 'shot on 35mm lens, high-resolution photography, photorealistic skin texture, sharp product details, hyper-realistic';
    const isBeverage = productName.toLowerCase().match(/teh|tea|minum|drink|jus|juice|kopi|coffee|susu|milk/);
    const beverageKeywords = isBeverage ? ', cold PET bottle with water condensation droplets, vibrant amber tea color, chilled refreshing look' : '';
    const styleKeywords = isUGC
        ? `${style.camera}, ${style.lighting}, ${style.vibe}, ${style.background}`
        : `${style.camera}, ${style.lighting}, ${style.vibe}, ${style.background}`;
    return `${charRef}${sceneDesc}. ${prodRef}Product: ${productName}${beverageKeywords}. ${bananaPro}. ${lens}. ${styleKeywords}. --no ${neg}`;
}

function buildVideoPrompt(sceneDesc, voSnippet, sceneNum, totalScenes, isUGC) {
    const gender = getGenderDesc();
    const charRef = hasCharacterReference()
        ? `${gender.subj} (consistent character from reference), `
        : `${gender.subj}, casual outfit, `;
    const style = getStyleContext(isUGC);
    const isBeverage = productName.toLowerCase().match(/teh|tea|minum|drink|jus|juice|kopi|coffee|susu|milk/);
    const beverageDetail = isBeverage ? ', cold PET bottle with visible condensation, refreshing liquid pour' : '';

    if (selectedVideoModel === 'seedance') {
        const ugcMotions = ['Handheld follow, natural sway', 'Quick pan left-right, energetic', 'Slight tilt up with handheld shake', 'POV grab-and-show, first person', 'Rack Focus close to mid, organic', 'Slow push-in, casual reveal', 'Handheld orbital, curiosity peek', 'Static with natural body sway'];
        const iklanMotions = ['Dolly In slowly with parallax', 'Orbital Tracking 180° left to right', 'Smooth Tilt-up cinematic reveal', 'Rack Focus foreground to background', 'Crane descending to eye level', 'Push In with dolly zoom effect', 'Slow-motion liquid splash capture', 'Slider tracking with depth layers'];
        const motions = isUGC ? ugcMotions : iklanMotions;
        const motion = motions[sceneNum % motions.length];
        const seedanceLighting = isUGC
            ? 'Natural ambient lighting, soft window bounce, no artificial setup'
            : 'Studio rim lighting with volumetric haze, diffused softbox key, controlled environment';
        return `${charRef}${sceneDesc}${beverageDetail}. Camera Motion: ${motion}. Lighting: ${seedanceLighting}. Temporal Consistency: maintain consistent character appearance and fluid natural movement across frames. Material Physics: subsurface scattering on skin texture. Product: ${productName}. ${style.vibe}. --motion 6 --fps 30 --cfg 7 --upscale 2`;
    }
    const ugcCam = ['Handheld close-up, natural sway', 'POV first-person perspective', 'Quick whip-pan, energetic TikTok style', 'Slight zoom-in with shake'];
    const iklanCam = ['Slow dolly zoom, intimate reveal', 'Smooth orbital pan with rack focus', 'Crane shot descending, dramatic', 'Slow-motion liquid splash, 120fps', 'Slider tracking with depth of field', 'Smooth tilt-up, dramatic reveal', 'Pull-back wide reveal shot', 'Over-shoulder to frontal transition'];
    const camOptions = isUGC ? ugcCam : iklanCam;
    const cam = camOptions[sceneNum % camOptions.length];
    const veoLighting = isUGC
        ? 'Natural daylight, ambient bounce, casual setting'
        : 'Ray-traced volumetric fog, cinematic rim light, advanced lighting physics, three-point studio setup';
    return `Cinematic video scene: ${charRef}${sceneDesc}${beverageDetail}. Camera: ${cam}. Lighting: ${veoLighting}. Cinematic realism with advanced lighting physics. Product: ${productName}. Style: ${style.vibe}. 4K, 24fps, shallow depth of field.`;
}

async function generateSceneVisuals(info, sceneNum, voSnippet, isUGC, totalScenes) {
    const bgKeywords = isUGC ? ugcBackground : '';
    const presKeywords = isUGC ? presentationKeywords : '';
    const gender = getGenderDesc();
    const style = getStyleContext(isUGC);
    const isBeverage = info.name.toLowerCase().match(/teh|tea|minum|drink|jus|juice|kopi|coffee|susu|milk/);
    const productInteraction = isBeverage
        ? 'unscrewing the bottle cap, holding the chilled PET bottle, sipping refreshing tea'
        : `interacting naturally with ${info.name}`;

    const scenePrompt = isUGC
        ? `Kamu adalah AI Director untuk UGC TikTok. Target output: Banana Pro image generation.
Buat DESKRIPSI VISUAL untuk Scene ${sceneNum}/${totalScenes} dari video UGC TikTok.
Produk: ${info.name} (${info.category})${isBeverage ? ' — PET bottle, cold with condensation droplets, vibrant amber tea color' : ''}
Naskah scene ini: "${voSnippet}"
Latar belakang: ${bgKeywords}
Gaya presentasi: ${presKeywords}
Karakter: ${gender.subj}, ${style.outfit}
Gaya visual: ${style.camera}, ${style.lighting}
Interaksi produk: ${productInteraction}
${sceneNum === 1 ? 'PENTING Scene 1: Jika fokus pada tangan, wajah harus blur (bokeh) tapi tetap recognizable sebagai karakter yang sama.' : ''}

Tulis deskripsi visual singkat (2-3 kalimat bahasa Inggris) untuk scene ini.
Fokus pada: photorealistic skin texture, sharp product details, hyper-realistic detail.
JANGAN gunakan kata "package" — gunakan "PET bottle" untuk minuman.
Output HANYA deskripsi visual, tanpa judul atau label.`
        : `Kamu adalah AI Director untuk iklan komersial cinematic. Target output: Banana Pro image generation.
Buat DESKRIPSI VISUAL untuk Scene ${sceneNum}/${totalScenes} dari video iklan.
Produk: ${info.name} (${info.category})${isBeverage ? ' — PET bottle, cold with condensation droplets, vibrant amber tea color' : ''}
Naskah narator scene ini: "${voSnippet}"
Gaya: ${selectedStyle}, cinematic, professional.
Karakter: ${gender.subj}, ${style.outfit}
Gaya visual: ${style.camera}, ${style.lighting}
Interaksi produk: ${productInteraction}

Tulis deskripsi visual singkat (2-3 kalimat bahasa Inggris) untuk scene ini.
Fokus pada: photorealistic skin texture, sharp product details, premium cinematic composition.
JANGAN gunakan kata "package" — gunakan "PET bottle" untuk minuman.
Output HANYA deskripsi visual, tanpa judul atau label.`;

    let sceneDescription;
    try {
        sceneDescription = cleanText(await callAI(scenePrompt), `${gender.subj} holding ${info.name}, looking at camera, ${selectedStyle} style`);
    } catch (e) {
        console.error(`Scene ${sceneNum} fallback:`, e);
        const bevDetail = isBeverage ? 'chilled PET bottle with condensation droplets' : info.name;
        let fallbacks;
        if (isUGC) {
            fallbacks = isBeverage
                ? [
                    `${gender.subj} looks at camera with excited expression, holding ${bevDetail} close, natural sunlight, handheld framing`,
                    `Close-up of hands unscrewing bottle cap of ${bevDetail}, face softly blurred in bokeh, natural ambient light`,
                    `${gender.subj} takes a refreshing sip of ${info.name}, genuine smile, medium close-up, casual setting`,
                    `${gender.subj} holds up ${bevDetail} to camera, direct eye contact, energetic thumbs up, natural background`
                ]
                : [
                    `${gender.subj} opening the ${info.name} package with both hands, excited expression, natural sunlight, handheld framing`,
                    `Close-up of hands mixing the ${info.name} with seasoning, steam rising, close-up shot, natural ambient light`,
                    `${gender.subj} taking a big bite of ${info.name}, satisfied smile, medium close-up, casual setting`,
                    `${gender.subj} holding up ${info.name} to camera, direct eye contact, thumbs up, natural background`
                ];
        } else {
            fallbacks = [
                `Cinematic wide shot, golden light filtering through, ${bevDetail} silhouetted, mysterious atmosphere`,
                `Slow reveal of ${bevDetail}, dramatic three-point rim lighting, dark studio background`,
                `${gender.subj} discovers ${bevDetail}, close-up reaction, professional styling, soft focus background`,
                `Product detail macro shot of ${bevDetail}, highlighting texture and label quality`,
                `${gender.subj} enjoying ${info.name} naturally, curated lifestyle setting, warm studio tones`,
                `Testimonial-style framing, authentic expression, studio rim light`,
                `Demonstration shot, ${isBeverage ? 'liquid pour from ' + bevDetail : info.name + ' presented elegantly'}, clean studio composition`,
                `Emotional close-up, ${gender.subj} ${isBeverage ? 'refreshed after sip' : 'delighted after trying ' + info.name}, cinematic bokeh, three-point lighting`,
                `Dynamic crane shot, sense of freshness, bold vibrant colors`,
                `Final hero shot of ${bevDetail}, brand positioning, premium aspirational feel`
            ];
        }
        sceneDescription = fallbacks[(sceneNum - 1) % fallbacks.length];
    }

    const imagePrompt = buildImagePrompt(sceneDescription, voSnippet, isUGC);
    let videoPrompt;
    if (selectedVideoModel === 'seedance') {
        try {
            videoPrompt = cleanText(await callAIWithSystem(SEEDANCE_SYSTEM_PROMPT,
                `Buat prompt video Seedance 2.0 untuk scene ini:\nVisual: ${sceneDescription}\nProduk: ${info.name}${isBeverage ? ' (PET bottle, cold condensation)' : ''}\nKarakter: ${gender.subj}\nGaya: ${isUGC ? 'UGC handheld casual' : 'IKLAN cinematic professional'}\nFokus: temporal consistency, fluid natural movement.\nSatu paragraf narasi teknis.`
            ), buildVideoPrompt(sceneDescription, voSnippet, sceneNum - 1, totalScenes, isUGC));
        } catch (e) {
            videoPrompt = buildVideoPrompt(sceneDescription, voSnippet, sceneNum - 1, totalScenes, isUGC);
        }
    } else {
        videoPrompt = buildVideoPrompt(sceneDescription, voSnippet, sceneNum - 1, totalScenes, isUGC);
    }

    const title = isUGC
        ? [`HOOK — Attention Grab`, `PROBLEM — Pain Point`, `SOLUTION — Product Hero`, `CTA — Call to Action`][sceneNum - 1] || `Scene ${sceneNum}`
        : [`Opening Hook`, `Brand Story`, `Product Reveal`, `Feature Highlight`, `Key Benefits`, `Social Proof`, `Demonstration`, `Emotional Appeal`, `Urgency`, `Closing CTA`][sceneNum - 1] || `Scene ${sceneNum}`;

    return { title, description: sceneDescription, imagePrompt, videoPrompt, voSnippet };
}

function displayMasterPlan() {
    if (!generatedData) return;
    const { vo, shots } = generatedData;
    document.getElementById('fullVO').textContent = vo;

    const container = document.getElementById('shotCards');
    container.innerHTML = '';
    shots.forEach((shot, i) => {
        const color = shot.headerColor || SHOT_COLORS[i] || 'yellow';
        const charBadge = hasCharacterReference() ? '<span class="character-badge">👤 REF</span>' : '';
        const prodBadge = uploadedFiles.prod.some(p => p) ? '<span class="shot-card-asset-ref">📦 PRODUCT REF</span>' : '';

        const card = document.createElement('div');
        card.className = 'shot-card';
        card.innerHTML = `
            <div class="shot-card-header ${color}">
                <div class="shot-number-badge ${color}">${shot.number}</div>
                <div>
                    <div class="shot-card-title">${shot.title}${charBadge}</div>
                    ${prodBadge}
                </div>
            </div>
            <div class="shot-card-body">
                <div class="shot-vo-section">
                    <div class="shot-vo-label">🎙️ VOICEOVER</div>
                    <div class="shot-vo-text">${shot.voSnippet || ''}</div>
                </div>
                <div class="shot-prompt-section">
                    <div class="shot-prompt-label">📸 IMAGE PROMPT</div>
                    <div class="shot-prompt-text">${shot.imagePrompt || ''}</div>
                    <button class="btn-copy" onclick="copyToClipboard(this, '${escapeForAttr(shot.imagePrompt)}')">📋 Copy</button>
                </div>
                <div class="shot-prompt-section">
                    <div class="shot-prompt-label">🎥 VIDEO PROMPT (${selectedVideoModel === 'seedance' ? 'Seedance 2.0' : 'Veo 3.1'})</div>
                    <div class="shot-prompt-text">${shot.videoPrompt || ''}</div>
                    <button class="btn-copy" onclick="copyToClipboard(this, '${escapeForAttr(shot.videoPrompt)}')">📋 Copy</button>
                </div>
            </div>`;
        container.appendChild(card);
    });
}

function escapeForAttr(str) {
    return String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n');
}

function copyToClipboard(btn, text) {
    const decoded = text.replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/&quot;/g, '"').replace(/\\\\/g, '\\');
    navigator.clipboard.writeText(decoded).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => btn.textContent = orig, 1500);
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = decoded;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        const orig = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => btn.textContent = orig, 1500);
    });
}

function copyAll(btn) {
    if (!generatedData) { alert('Belum ada data!'); return; }
    let text = '=== NASKAH VOICEOVER ===\n' + generatedData.vo + '\n\n';
    generatedData.shots.forEach(shot => {
        text += `=== SCENE ${shot.number}: ${shot.title} ===\n`;
        text += `VO: ${shot.voSnippet}\n`;
        text += `IMAGE PROMPT: ${shot.imagePrompt}\n`;
        text += `VIDEO PROMPT: ${shot.videoPrompt}\n\n`;
    });
    navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✅ Semua Disalin!';
        setTimeout(() => btn.textContent = orig, 2000);
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        const orig = btn.textContent;
        btn.textContent = '✅ Semua Disalin!';
        setTimeout(() => btn.textContent = orig, 2000);
    });
}

function copyVO(btn) {
    if (!generatedData) { alert('Belum ada data!'); return; }
    navigator.clipboard.writeText(generatedData.vo).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✅ VO Disalin!';
        setTimeout(() => btn.textContent = orig, 2000);
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = generatedData.vo;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        const orig = btn.textContent;
        btn.textContent = '✅ VO Disalin!';
        setTimeout(() => btn.textContent = orig, 2000);
    });
}

function downloadAllAssets() {
    if (!generatedData) { alert('Belum ada data untuk di-download!'); return; }
    let content = `HAMBS PRODUCTION — MASTER PROMPT PACK\n`;
    content += `Mode: ${generatedData.contentStyle}\n`;
    content += `Produk: ${generatedData.info.name}\n`;
    content += `Kategori: ${generatedData.info.category}\n`;
    content += `Video Model: ${selectedVideoModel === 'seedance' ? 'Seedance 2.0' : 'Veo 3.1'}\n`;
    content += `Generated: ${new Date().toLocaleString('id-ID')}\n`;
    content += `${'='.repeat(60)}\n\n`;
    content += `NASKAH VOICEOVER:\n${generatedData.vo}\n\n`;
    content += `${'='.repeat(60)}\n\n`;
    generatedData.shots.forEach(shot => {
        content += `SCENE ${shot.number}: ${shot.title}\n`;
        content += `-`.repeat(40) + `\n`;
        content += `VOICEOVER:\n${shot.voSnippet}\n\n`;
        content += `IMAGE PROMPT:\n${shot.imagePrompt}\n\n`;
        content += `VIDEO PROMPT:\n${shot.videoPrompt}\n\n`;
        content += `${'='.repeat(60)}\n\n`;
    });
    if (customNegativePrompt) {
        content += `NEGATIVE PROMPT:\n${getNegativePrompt()}\n`;
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `HAMBS_${generatedData.info.name.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
}

// ==================== PROJECT MANAGER FUNCTIONS ====================
function loadSelectedProject() {
    const sel = document.getElementById('projectSelect');
    const name = sel.value;
    if (!name) return;
    const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '{}');
    const p = projects[name];
    if (!p) { alert('Project tidak ditemukan!'); return; }
    currentProjectName = name;
    contentStyle = p.contentStyle || 'IKLAN';
    productName = p.productName || 'Produk';
    productDescription = p.productDescription || '';
    selectedCategory = p.selectedCategory || 'FASHION';
    selectedStyle = p.selectedStyle || 'LIFESTYLE';
    selectedLang = p.selectedLang || 'ID';
    selectedTone = p.selectedTone || 'jaksel';
    customNegativePrompt = p.customNegativePrompt || '';
    selectedVideoModel = p.selectedVideoModel || 'veo';
    ugcBackground = p.ugcBackground || '';
    presentationKeywords = p.presentationKeywords || '';
    lensStyle = p.lensStyle || 'portrait';
    generatedData = p.generatedData;
    document.getElementById('productName').value = productName;
    document.getElementById('productDescription').value = productDescription;
    document.getElementById('customNegativePrompt').value = customNegativePrompt;
    if (generatedData) {
        displayMasterPlan();
        goToStep(3);
    } else {
        goToStep(0);
    }
    saveSession();
    alert(`✅ Project "${name}" berhasil dimuat!`);
}

function exportProject() {
    if (!generatedData) { alert('⚠️ Generate dulu sebelum export!'); return; }
    const data = {
        version: 'hambs_v25',
        name: currentProjectName || 'Untitled',
        contentStyle, productName, productDescription, selectedCategory, selectedStyle,
        selectedLang, selectedTone, customNegativePrompt, selectedVideoModel,
        ugcBackground, presentationKeywords, lensStyle, generatedData,
        exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `HAMBS_${(currentProjectName || productName).replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
}

function importProject() {
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
                    alert('❌ File ini bukan project Hambs Production!');
                    return;
                }
                contentStyle = data.contentStyle || 'IKLAN';
                productName = data.productName || 'Produk';
                productDescription = data.productDescription || '';
                selectedCategory = data.selectedCategory || 'FASHION';
                selectedStyle = data.selectedStyle || 'LIFESTYLE';
                selectedLang = data.selectedLang || 'ID';
                selectedTone = data.selectedTone || 'jaksel';
                customNegativePrompt = data.customNegativePrompt || '';
                selectedVideoModel = data.selectedVideoModel || 'veo';
                ugcBackground = data.ugcBackground || '';
                presentationKeywords = data.presentationKeywords || '';
                lensStyle = data.lensStyle || 'portrait';
                generatedData = data.generatedData;
                currentProjectName = data.name || '';
                document.getElementById('productName').value = productName;
                document.getElementById('productDescription').value = productDescription;
                document.getElementById('customNegativePrompt').value = customNegativePrompt;
                if (generatedData) {
                    displayMasterPlan();
                    goToStep(3);
                } else {
                    goToStep(0);
                }
                saveSession();
                const saveName = prompt('Simpan sebagai project dengan nama:', data.name || 'Imported Project');
                if (saveName) {
                    const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '{}');
                    projects[saveName] = { ...data, timestamp: Date.now() };
                    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
                    currentProjectName = saveName;
                    loadProjectList();
                }
                alert('✅ Project berhasil di-import!');
            } catch (err) {
                alert('❌ Gagal membaca file: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Bind semua tombol
    document.getElementById('homeBtn').addEventListener('click', goToModeSelection);
    document.getElementById('brandIcon').addEventListener('click', goToModeSelection);
    document.getElementById('sidebarBrandIcon').addEventListener('click', goToModeSelection);
    document.getElementById('backToModeBtn').addEventListener('click', goToModeSelection);
    
    document.getElementById('cardIklan').addEventListener('click', () => selectMode('IKLAN'));
    document.getElementById('cardUGC').addEventListener('click', () => selectMode('UGC'));
    
    document.querySelectorAll('#ugcBgGrid .option-btn').forEach(b => b.addEventListener('click', function() { selOpt(this, 'ugcBg'); }));
    document.querySelectorAll('#presentationGrid .option-btn').forEach(b => b.addEventListener('click', function() { selOpt(this, 'presentation'); }));
    document.querySelectorAll('#categoryGrid .option-btn').forEach(b => b.addEventListener('click', function() { selOpt(this, 'cat'); }));
    document.querySelectorAll('#styleGrid .option-btn').forEach(b => b.addEventListener('click', function() { selOpt(this, 'vid'); }));
    document.querySelectorAll('#toneGrid .option-btn').forEach(b => b.addEventListener('click', function() { selOpt(this, 'tone'); }));
    document.querySelectorAll('#lensGrid .option-btn').forEach(b => b.addEventListener('click', function() { selOpt(this, 'lens'); }));
    document.querySelectorAll('#videoModelGrid .option-btn').forEach(b => b.addEventListener('click', function() { selOpt(this, 'videoModel'); }));
    document.querySelectorAll('#langGrid .option-btn').forEach(b => b.addEventListener('click', function() { selOpt(this, 'lang'); }));
    
    // Upload via click
    document.getElementById('charUpload').addEventListener('click', () => { const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.onchange = e => handleFile(e.target.files[0], 'charUpload', 'char'); i.click(); });
    for (let i=0; i<4; i++) {
        document.getElementById(`prod${i+1}`).addEventListener('click', () => { const input = document.createElement('input'); input.type='file'; input.accept='image/*'; input.onchange = e => handleFile(e.target.files[0], `prod${i+1}`, 'prod', i); input.click(); });
    }
    
    document.getElementById('generateBtn').addEventListener('click', startAI);
    document.getElementById('btnStep1').addEventListener('click', () => goToStep(1));
    document.getElementById('saveApiKeyBtn').addEventListener('click', saveApiKey);
    document.getElementById('testApiBtn').addEventListener('click', testProviderConnection);
    
    // Project buttons
    document.getElementById('saveProjectBtn').addEventListener('click', saveCurrentProject);
    document.getElementById('exportProjectBtn').addEventListener('click', exportProject);
    document.getElementById('importProjectBtn').addEventListener('click', importProject);
    document.getElementById('projectSelect').addEventListener('change', loadSelectedProject);
    document.getElementById('downloadAllBtn').addEventListener('click', downloadAllAssets);
    document.getElementById('downloadAllMasterBtn').addEventListener('click', downloadAllAssets);
    document.getElementById('resetBtn').addEventListener('click', clearSession);
    document.getElementById('copyAllBtn').addEventListener('click', () => copyAll(document.getElementById('copyAllBtn')));
    document.getElementById('copyVOBtn').addEventListener('click', () => copyVO(document.getElementById('copyVOBtn')));
    
    // Sidebar
    document.querySelectorAll('.step-item').forEach(item => {
        item.addEventListener('click', () => goToStep(parseInt(item.getAttribute('data-step'))));
    });
    
    loadProjectList();
    if (apiKey) { document.getElementById('apiKeyInput').value = apiKey; document.getElementById('apiWarning').innerHTML = '✅ Tersimpan'; }
    if (restoreSession()) {
        if (!confirm('🔄 Sesi sebelumnya ditemukan. Lanjutkan?')) clearSession();
    }
    updateConfirmBtn();
});
