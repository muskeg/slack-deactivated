import {
  renderAvatar,
  loadOverlay,
  exportPNG,
  getInitialPosition,
  clampImagePosition,
  ImagePosition,
} from './canvas';

const dropZone = document.getElementById('drop-zone')!;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const previewSection = document.getElementById('preview-section')!;
const canvas = document.getElementById('preview') as HTMLCanvasElement;
const grayscaleCheckbox = document.getElementById('grayscale') as HTMLInputElement;
const downloadBtn = document.getElementById('download')!;
const statusMessage = document.getElementById('status') as HTMLParagraphElement;

let currentImage: HTMLImageElement | null = null;
let overlayImage: HTMLImageElement | null = null;
let imagePosition: ImagePosition | null = null;
let currentObjectUrl: string | null = null;

// Dragging state
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let startOffsetX = 0;
let startOffsetY = 0;
let activePointerId: number | null = null;

// Preload the overlay image
const basePath = import.meta.env.BASE_URL;
loadOverlay(basePath).then((img) => {
  overlayImage = img;
  render();
}).catch(() => {
  setStatus('Failed to load the overlay. Please refresh and try again.', true);
});

function render(): void {
  if (!currentImage || !overlayImage || !imagePosition) return;
  renderAvatar(canvas, currentImage, overlayImage, imagePosition, { 
    grayscale: grayscaleCheckbox.checked 
  });
}

function setStatus(message: string, isError = false): void {
  if (!statusMessage) return;
  statusMessage.textContent = message;
  statusMessage.dataset.state = isError ? 'error' : 'info';
}

function updatePosition(next: ImagePosition): void {
  if (!currentImage) return;
  imagePosition = clampImagePosition(currentImage, next);
  render();
}

function loadImage(file: File): void {
  if (!file.type.startsWith('image/')) {
    setStatus('Please choose a valid image file.', true);
    return;
  }

  setStatus('');

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
  }

  const url = URL.createObjectURL(file);
  currentObjectUrl = url;
  const img = new Image();
  img.onload = () => {
    currentImage = img;
    imagePosition = getInitialPosition(img);
    previewSection.classList.remove('hidden');
    updatePosition(imagePosition);
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
  };
  img.onerror = () => {
    setStatus('Could not read that image. Please try another file.', true);
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
  };
  img.src = url;
}

// Canvas drag interaction
canvas.addEventListener('pointerdown', (e) => {
  if (!imagePosition) return;
  if (e.button !== 0) return;
  
  isDragging = true;
  activePointerId = e.pointerId;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  startOffsetX = imagePosition.offsetX;
  startOffsetY = imagePosition.offsetY;
  canvas.setPointerCapture(e.pointerId);
  e.preventDefault();
});

canvas.addEventListener('pointermove', (e) => {
  if (!isDragging || !imagePosition || e.pointerId !== activePointerId) return;
  
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  
  // Apply movement scaled to canvas display size
  const canvasRect = canvas.getBoundingClientRect();
  const scale = canvas.width / canvasRect.width;
  
  updatePosition({
    ...imagePosition,
    offsetX: startOffsetX + dx * scale,
    offsetY: startOffsetY + dy * scale,
  });
});

canvas.addEventListener('pointerup', (e) => {
  if (activePointerId === e.pointerId) {
    isDragging = false;
    activePointerId = null;
  }
});

canvas.addEventListener('pointercancel', (e) => {
  if (activePointerId === e.pointerId) {
    isDragging = false;
    activePointerId = null;
  }
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
  
  // Adjust offset to zoom towards mouse position
  updatePosition({
    scale: newScale,
    offsetX: canvasMouseX - (canvasMouseX - imagePosition.offsetX) * (newScale / oldScale),
    offsetY: canvasMouseY - (canvasMouseY - imagePosition.offsetY) * (newScale / oldScale),
  });
});

// Click to browse
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});
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
