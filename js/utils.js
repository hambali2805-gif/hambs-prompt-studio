// ==================== UTILITY FUNCTIONS ====================
export function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

export function cleanText(t, fb = '') {
    return String(t || '').trim() || fb;
}

export function escapeForAttr(str) {
    return String(str || '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '&quot;')
        .replace(/\n/g, '\\n');
}

export async function compressImage(base64Str, maxWidth = 800) {
    return new Promise((resolve) => {
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

export function splitVO(vo, count) {
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
