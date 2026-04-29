export function buildAdsCTA(product, lang = 'ID') {
    return lang === 'EN'
        ? `Discover how ${product} fits your everyday moment.`
        : `Temukan bagaimana ${product} bisa masuk ke momen harian Anda.`;
}
