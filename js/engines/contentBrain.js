// ==================== CONTENT BRAIN ENGINE V2 ====================
// Adds meaning before style: product intelligence → strategy → scene blueprint.
// This layer is deterministic and lightweight so it still works when AI fallback is used.

function lower(v) {
    return String(v || '').toLowerCase();
}

function uniq(arr) {
    return [...new Set(arr.filter(Boolean))];
}

function first(arr, fallback = '') {
    return Array.isArray(arr) && arr.length ? arr[0] : fallback;
}

const CATEGORY_INTELLIGENCE = {
    MAKANAN: {
        coreBenefit: 'comfort food yang cepat, familiar, dan bikin craving',
        audience: 'anak kos, pekerja muda, dan orang yang butuh makanan cepat tapi tetap comforting',
        useCases: ['lapar malam', 'hujan di rumah', 'pulang kerja capek', 'makan cepat di sela aktivitas'],
        sensoryHooks: ['aroma bumbu panas', 'kecap manis yang mengilap', 'mie hangat baru diangkat', 'tekstur kenyal dan gurih'],
        proofMoments: ['uap panas terlihat jelas', 'bumbu tercampur rata', 'suapan pertama dengan reaksi spontan'],
        emotionalTriggers: ['nostalgia', 'craving', 'comfort'],
        humanScenes: ['dapur kecil lampu hangat', 'meja makan sederhana', 'panci air mendidih', 'piring mie dekat jendela saat hujan']
    },
    MINUMAN: {
        coreBenefit: 'rasa segar yang cepat terasa dan mudah dinikmati kapan saja',
        audience: 'anak muda aktif dan orang yang butuh refresh cepat',
        useCases: ['cuaca panas', 'habis aktivitas', 'nongkrong santai', 'jalan siang hari'],
        sensoryHooks: ['embun dingin di botol', 'suara tutup dibuka', 'tegukan pertama', 'ekspresi lega setelah minum'],
        proofMoments: ['botol dingin berembun', 'cairan dituang pelan', 'reaksi segar setelah minum'],
        emotionalTriggers: ['refresh', 'relief', 'energy'],
        humanScenes: ['teras siang hari', 'mobil berhenti setelah perjalanan', 'meja nongkrong', 'taman cerah']
    },
    SKINCARE: {
        coreBenefit: 'rutinitas perawatan yang terasa simple, nyata, dan percaya diri',
        audience: 'orang yang ingin kulit terlihat lebih terawat tanpa ribet',
        useCases: ['morning routine', 'sebelum keluar rumah', 'malam setelah aktivitas', 'persiapan makeup ringan'],
        sensoryHooks: ['tekstur produk di ujung jari', 'kulit tampak lembap', 'aplikasi perlahan di wajah', 'pantulan soft glow'],
        proofMoments: ['produk diaplikasikan nyata', 'tekstur kulit close-up', 'before-after halus tanpa klaim berlebihan'],
        emotionalTriggers: ['confidence', 'self-care', 'relief'],
        humanScenes: ['vanity mirror', 'kamar pagi hari', 'bathroom clean lighting', 'meja skincare minimalis']
    },
    FASHION: {
        coreBenefit: 'look yang bikin tampil lebih pede tanpa effort berlebihan',
        audience: 'orang yang ingin tampil stylish untuk aktivitas harian',
        useCases: ['hangout', 'kerja santai', 'date casual', 'foto OOTD'],
        sensoryHooks: ['jatuh kain saat bergerak', 'detail jahitan', 'layer outfit', 'reaksi saat lihat kaca'],
        proofMoments: ['full-body fit check', 'mix and match', 'gerak natural saat berjalan'],
        emotionalTriggers: ['confidence', 'identity', 'social validation'],
        humanScenes: ['depan cermin', 'jalan kota', 'kafe', 'kamar dengan rack baju']
    },
    ELEKTRONIK: {
        coreBenefit: 'fitur yang membantu aktivitas nyata jadi lebih praktis',
        audience: 'pengguna harian yang butuh fungsi jelas, bukan cuma spek',
        useCases: ['kerja harian', 'setup meja', 'travel ringan', 'produktif di rumah'],
        sensoryHooks: ['klik tombol', 'layar menyala', 'detail material', 'reaksi saat fitur bekerja'],
        proofMoments: ['fitur didemokan langsung', 'hasil terlihat di layar', 'perbandingan sebelum sesudah penggunaan'],
        emotionalTriggers: ['control', 'efficiency', 'confidence'],
        humanScenes: ['meja kerja', 'ruang keluarga', 'setup minimalis', 'tas perjalanan']
    }
};

const PHASE_FUNCTIONS = {
    hook: 'membuka dengan situasi spesifik yang langsung relatable',
    emotional: 'menghubungkan produk dengan memori/perasaan manusiawi',
    brand_story: 'memberi alasan kenapa produk terasa familiar atau dipercaya',
    product_reveal: 'memperkenalkan produk sebagai jawaban dari situasi',
    feature_1: 'menjelaskan detail utama yang bisa dilihat/dirasakan',
    feature_2: 'menambah detail kedua yang berbeda, bukan mengulang',
    demonstration: 'membuktikan lewat aksi nyata di layar',
    benefit: 'menghubungkan fitur dengan manfaat hidup sehari-hari',
    social_proof: 'membuat bukti terasa kredibel dan kontekstual',
    cta: 'mengajak aksi dengan alasan yang sesuai situasi',
    problem: 'menunjukkan masalah sehari-hari yang terasa nyata',
    solution: 'menawarkan produk sebagai solusi yang masuk akal',
    proof: 'membuktikan klaim lewat detail visual atau reaksi',
    reaction: 'menampilkan respons manusiawi setelah mencoba',
    explain: 'menjelaskan dengan bahasa sederhana dan spesifik',
    compare: 'membandingkan kondisi sebelum dan sesudah secara jelas',
    story: 'membawa penonton masuk ke cerita singkat',
    discovery: 'menunjukkan momen menemukan produk',
    question: 'memancing penonton dengan pertanyaan yang spesifik',
    reveal: 'mengungkap produk dengan payoff yang jelas'
};

function inferFromDescription(info) {
    const desc = lower(info?.desc);
    const hints = [];
    if (/enak|gurih|lezat|taste|rasa/.test(desc)) hints.push('rasa yang benar-benar jadi alasan orang balik lagi');
    if (/cepat|praktis|instant|instan|mudah/.test(desc)) hints.push('praktis saat dibutuhkan cepat');
    if (/premium|mewah|exclusive|eksklusif/.test(desc)) hints.push('kesan premium yang tetap relevan');
    if (/murah|hemat|terjangkau/.test(desc)) hints.push('value yang terasa masuk akal');
    return hints;
}

export function buildContentBrain(info, categoryData, viralContext, isUGC) {
    const preset = CATEGORY_INTELLIGENCE[info.category] || {};
    const sensoryFromRules = categoryData?.sensory || [];
    const useCase = first(preset.useCases, 'kebutuhan harian');
    const emotion = viralContext?.emotionalTrigger?.emotion || first(preset.emotionalTriggers, 'desire');
    const descHints = inferFromDescription(info);

    const intelligence = {
        product: info.name,
        category: info.category,
        description: info.desc || '',
        coreBenefit: preset.coreBenefit || categoryData?.voiceStyle || 'manfaat produk yang relevan untuk keseharian',
        audience: preset.audience || 'pengguna harian',
        useCases: preset.useCases || ['kebutuhan harian'],
        sensoryHooks: uniq([...(preset.sensoryHooks || []), ...sensoryFromRules.slice(0, 3)]),
        proofMoments: preset.proofMoments || categoryData?.actions || ['produk digunakan secara nyata'],
        emotionalTriggers: preset.emotionalTriggers || [emotion],
        humanScenes: preset.humanScenes || categoryData?.environments || ['setting real-life yang natural'],
        descHints
    };

    const strategy = {
        angle: `${emotion}_${isUGC ? 'ugc_real' : 'cinematic_real'}`,
        promise: descHints[0] || intelligence.coreBenefit,
        tension: useCase,
        audience: intelligence.audience,
        noGenericRule: 'Setiap scene harus punya detail situasi, aksi, atau sensory. Jangan hanya bilang enak, bagus, worth it, beda, atau viral.'
    };

    return {
        version: 'content_brain_v2',
        intelligence,
        strategy,
        sceneBlueprints: buildSceneBlueprints(viralContext?.structure || [], intelligence, strategy, isUGC)
    };
}

export function buildSceneBlueprints(structure, intelligence, strategy, isUGC) {
    return structure.map((phaseObj, index) => {
        const phase = phaseObj.phase;
        const sensory = intelligence.sensoryHooks[index % Math.max(1, intelligence.sensoryHooks.length)] || '';
        const proof = intelligence.proofMoments[index % Math.max(1, intelligence.proofMoments.length)] || '';
        const humanScene = intelligence.humanScenes[index % Math.max(1, intelligence.humanScenes.length)] || '';
        const useCase = intelligence.useCases[index % Math.max(1, intelligence.useCases.length)] || strategy.tension;

        return {
            sceneNumber: index + 1,
            phase,
            label: phaseObj.label || phase,
            function: PHASE_FUNCTIONS[phase] || 'menyampaikan pesan spesifik',
            message: buildMessage(phase, intelligence, strategy, sensory, proof, useCase),
            visualFocus: buildVisualFocus(phase, intelligence, humanScene, sensory, proof, isUGC),
            mustInclude: uniq([useCase, sensory, proof]).slice(0, 3),
            avoid: ['filler berlebihan', 'klaim kosong', 'visual generic', 'mengulang scene sebelumnya']
        };
    });
}

function buildMessage(phase, intel, strategy, sensory, proof, useCase) {
    const p = intel.product;
    switch (phase) {
        case 'hook': return `Tarik perhatian lewat situasi ${useCase}; buat penonton merasa “ini gue banget”.`;
        case 'emotional': return `Hubungkan ${p} dengan emosi ${first(intel.emotionalTriggers)} lewat detail ${sensory}.`;
        case 'brand_story': return `Buat ${p} terasa familiar dan dipercaya, bukan sekadar nama brand.`;
        case 'product_reveal': return `Reveal ${p} sebagai jawaban natural dari situasi ${strategy.tension}.`;
        case 'feature_1': return `Sorot detail yang bisa dirasakan: ${sensory || strategy.promise}.`;
        case 'feature_2': return `Berikan alasan kedua yang konkret, berbeda dari scene sebelumnya.`;
        case 'demonstration': return `Buktikan lewat aksi: ${proof}.`;
        case 'benefit': return `Terjemahkan fitur menjadi manfaat: ${strategy.promise}.`;
        case 'social_proof': return `Bangun trust lewat kebiasaan nyata orang memakai ${p}, bukan klaim kosong.`;
        case 'cta': return `Ajak aksi dengan konteks ${strategy.tension}; CTA harus terasa relevan.`;
        default: return `Tunjukkan ${p} lewat detail nyata: ${sensory || proof}.`;
    }
}

function buildVisualFocus(phase, intel, humanScene, sensory, proof, isUGC) {
    const realness = isUGC ? 'phone-recorded, imperfect, natural timing' : 'cinematic but lived-in, premium without feeling sterile';
    switch (phase) {
        case 'hook': return `${humanScene}; start with a small relatable human moment; ${realness}`;
        case 'emotional': return `close human reaction tied to ${sensory}; avoid exaggerated acting; ${realness}`;
        case 'product_reveal': return `product enters frame naturally inside ${humanScene}; no floating hero shot`;
        case 'demonstration': return `${proof}; hands and product interaction clearly visible`;
        case 'benefit': return `${sensory}; show payoff through expression and environment`;
        case 'cta': return `final usable moment with product in hand/frame, clear desire to act`;
        default: return `${humanScene}; ${sensory || proof}; ${realness}`;
    }
}

export function getSceneBlueprint(contentBrain, index) {
    return contentBrain?.sceneBlueprints?.[index] || null;
}
