export function buildSeedanceParams(mode) {
    return mode === 'ugc'
        ? '--motion 5 --fps 30 --cfg 6 --upscale 2'
        : '--motion 6 --fps 30 --cfg 7 --upscale 2';
}
