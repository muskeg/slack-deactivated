const OVERLAY_WIDTH = 987;
const OVERLAY_HEIGHT = 139;

export interface RenderOptions {
  grayscale: boolean;
}

export interface ImagePosition {
  offsetX: number;
  offsetY: number;
  scale: number;
}

const MAX_SCALE_MULTIPLIER = 4;

export function renderAvatar(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  overlay: HTMLImageElement,
  position: ImagePosition,
  options: RenderOptions
): void {
  const ctx = canvas.getContext('2d')!;
  const size = OVERLAY_WIDTH;
  canvas.width = size;
  canvas.height = size;

  // Draw the image with current position and scale
  ctx.save();
  if (options.grayscale) {
    ctx.filter = 'grayscale(100%)';
  }
  
  ctx.drawImage(
    image,
    position.offsetX,
    position.offsetY,
    image.naturalWidth * position.scale,
    image.naturalHeight * position.scale
  );
  ctx.restore();

  // Draw overlay at the bottom
  ctx.drawImage(overlay, 0, size - OVERLAY_HEIGHT, OVERLAY_WIDTH, OVERLAY_HEIGHT);
}

export function getMinimumScale(image: HTMLImageElement): number {
  const size = OVERLAY_WIDTH;
  return size / Math.min(image.naturalWidth, image.naturalHeight);
}

export function clampImagePosition(
  image: HTMLImageElement,
  position: ImagePosition
): ImagePosition {
  const minScale = getMinimumScale(image);
  const maxScale = minScale * MAX_SCALE_MULTIPLIER;
  const scale = clamp(position.scale, minScale, maxScale);

  const size = OVERLAY_WIDTH;
  const imageWidth = image.naturalWidth * scale;
  const imageHeight = image.naturalHeight * scale;

  const minOffsetX = size - imageWidth;
  const minOffsetY = size - imageHeight;

  return {
    scale,
    offsetX: clamp(position.offsetX, minOffsetX, 0),
    offsetY: clamp(position.offsetY, minOffsetY, 0),
  };
}

export function getInitialPosition(image: HTMLImageElement): ImagePosition {
  const size = OVERLAY_WIDTH;
  
  // Scale image so the smaller dimension fills the square
  const scale = getMinimumScale(image);
  
  // Center the image
  const offsetX = (size - image.naturalWidth * scale) / 2;
  const offsetY = (size - image.naturalHeight * scale) / 2;
  
  return { offsetX, offsetY, scale };
}

export function loadOverlay(basePath: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `${basePath}deactivated.png`;
  });
}

export function exportPNG(canvas: HTMLCanvasElement): void {
  const link = document.createElement('a');
  link.download = 'deactivated-avatar.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
