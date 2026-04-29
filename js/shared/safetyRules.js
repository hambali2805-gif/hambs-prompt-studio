// ==================== SAFETY / CLAIM RULES ====================

export const UNSUPPORTED_CLAIM_PATTERNS = [
    /stok\s+terbatas/i,
    /promo\s+ini\s+cuma/i,
    /flash\s*sale/i,
    /besok\s+harga\s+naik/i,
    /dipercaya\s+oleh\s+ribuan/i,
    /ribuan\s+pelanggan/i,
    /terbukti\s+secara\s+klinis/i,
    /nomor\s*1/i,
    /garansi\s+hasil/i
];

export function removeUnsupportedClaims(text) {
    let cleaned = String(text || '');
    const replacements = [
        [/stok\s+terbatas,?\s*jangan\s+sampai\s+kehabisan!?/gi, 'cek produknya saat momennya relevan'],
        [/checkout\s+sebelum\s+kehabisan!?/gi, 'cek produknya kalau cocok'],
        [/cuma\s+tersisa\s+sedikit\s+lagi!?/gi, 'pilih saat memang dibutuhkan'],
        [/dipercaya\s+oleh\s+ribuan\s+pelanggan[^.?!]*/gi, 'dipakai dalam momen sehari-hari'],
        [/promo\s+ini\s+cuma\s+hari\s+ini!?/gi, 'cek detail produknya'],
        [/besok\s+harga\s+naik[^.?!]*/gi, 'cek detailnya sebelum memilih']
    ];
    for (const [pattern, replacement] of replacements) cleaned = cleaned.replace(pattern, replacement);
    return cleaned.replace(/\s{2,}/g, ' ').trim();
}

export function findUnsupportedClaims(text) {
    const raw = String(text || '');
    return UNSUPPORTED_CLAIM_PATTERNS.filter(re => re.test(raw)).map(re => re.source);
}
