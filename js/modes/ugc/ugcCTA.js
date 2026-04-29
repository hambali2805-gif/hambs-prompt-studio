export function buildUGCCTA(product, lang = 'ID') {
    return lang === 'EN'
        ? `Keep ${product} in mind for a simple everyday moment.`
        : `Simpan ${product} buat momen simpel yang memang lagi cocok.`;
}
