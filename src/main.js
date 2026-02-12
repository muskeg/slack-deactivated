import { renderAvatar, loadOverlay, exportPNG } from './canvas';
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const previewSection = document.getElementById('preview-section');
const canvas = document.getElementById('preview');
const grayscaleCheckbox = document.getElementById('grayscale');
const downloadBtn = document.getElementById('download');
let currentImage = null;
let overlayImage = null;
// Preload the overlay image
const basePath = import.meta.env.BASE_URL;
loadOverlay(basePath).then((img) => {
    overlayImage = img;
});
function render() {
    if (!currentImage || !overlayImage)
        return;
    renderAvatar(canvas, currentImage, overlayImage, { grayscale: grayscaleCheckbox.checked });
}
function loadImage(file) {
    if (!file.type.startsWith('image/'))
        return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
        currentImage = img;
        previewSection.classList.remove('hidden');
        render();
    };
    img.src = url;
}
// Click to browse
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file)
        loadImage(file);
});
// Drag and drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer?.files[0];
    if (file)
        loadImage(file);
});
// Controls
grayscaleCheckbox.addEventListener('change', render);
downloadBtn.addEventListener('click', () => {
    if (canvas)
        exportPNG(canvas);
});
