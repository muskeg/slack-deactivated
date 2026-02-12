const OVERLAY_WIDTH = 987;
const OVERLAY_HEIGHT = 139;
export function renderAvatar(canvas, image, overlay, options) {
    const ctx = canvas.getContext('2d');
    const size = OVERLAY_WIDTH;
    canvas.width = size;
    canvas.height = size;
    // Determine center-crop region (largest square from center of source)
    const srcSize = Math.min(image.naturalWidth, image.naturalHeight);
    const sx = (image.naturalWidth - srcSize) / 2;
    const sy = (image.naturalHeight - srcSize) / 2;
    // Draw image (with optional grayscale filter)
    ctx.save();
    if (options.grayscale) {
        ctx.filter = 'grayscale(100%)';
    }
    ctx.drawImage(image, sx, sy, srcSize, srcSize, 0, 0, size, size);
    ctx.restore();
    // Draw overlay at the bottom
    ctx.drawImage(overlay, 0, size - OVERLAY_HEIGHT, OVERLAY_WIDTH, OVERLAY_HEIGHT);
}
export function loadOverlay(basePath) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = `${basePath}deactivated.png`;
    });
}
export function exportPNG(canvas) {
    const link = document.createElement('a');
    link.download = 'deactivated-avatar.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}
