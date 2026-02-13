import { renderAvatar, loadOverlay, exportPNG, getInitialPosition, ImagePosition } from './canvas';

const dropZone = document.getElementById('drop-zone')!;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const previewSection = document.getElementById('preview-section')!;
const canvas = document.getElementById('preview') as HTMLCanvasElement;
const grayscaleCheckbox = document.getElementById('grayscale') as HTMLInputElement;
const downloadBtn = document.getElementById('download')!;

let currentImage: HTMLImageElement | null = null;
let overlayImage: HTMLImageElement | null = null;
let imagePosition: ImagePosition | null = null;

// Dragging state
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let startOffsetX = 0;
let startOffsetY = 0;

// Preload the overlay image
const basePath = import.meta.env.BASE_URL;
loadOverlay(basePath).then((img) => {
  overlayImage = img;
});

function render(): void {
  if (!currentImage || !overlayImage || !imagePosition) return;
  renderAvatar(canvas, currentImage, overlayImage, imagePosition, { 
    grayscale: grayscaleCheckbox.checked 
  });
}

function loadImage(file: File): void {
  if (!file.type.startsWith('image/')) return;

  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    currentImage = img;
    imagePosition = getInitialPosition(img);
    previewSection.classList.remove('hidden');
    render();
  };
  img.src = url;
}

// Canvas drag interaction
canvas.addEventListener('mousedown', (e) => {
  if (!imagePosition) return;
  
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  startOffsetX = imagePosition.offsetX;
  startOffsetY = imagePosition.offsetY;
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging || !imagePosition) return;
  
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  
  // Apply movement scaled to canvas display size
  const canvasRect = canvas.getBoundingClientRect();
  const scale = canvas.width / canvasRect.width;
  
  imagePosition.offsetX = startOffsetX + dx * scale;
  imagePosition.offsetY = startOffsetY + dy * scale;
  
  render();
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Canvas zoom interaction (mouse wheel)
canvas.addEventListener('wheel', (e) => {
  if (!imagePosition || !currentImage) return;
  
  e.preventDefault();
  
  // Get mouse position relative to canvas
  const canvasRect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - canvasRect.left;
  const mouseY = e.clientY - canvasRect.top;
  const canvasScale = canvas.width / canvasRect.width;
  const canvasMouseX = mouseX * canvasScale;
  const canvasMouseY = mouseY * canvasScale;
  
  // Calculate zoom factor
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  const oldScale = imagePosition.scale;
  const newScale = oldScale * zoomFactor;
  
  // Update scale
  imagePosition.scale = newScale;
  
  // Adjust offset to zoom towards mouse position
  imagePosition.offsetX = canvasMouseX - (canvasMouseX - imagePosition.offsetX) * (newScale / oldScale);
  imagePosition.offsetY = canvasMouseY - (canvasMouseY - imagePosition.offsetY) * (newScale / oldScale);
  
  render();
});

// Click to browse
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (file) loadImage(file);
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
  if (file) loadImage(file);
});

// Controls
grayscaleCheckbox.addEventListener('change', render);
downloadBtn.addEventListener('click', () => {
  if (canvas) exportPNG(canvas);
});
