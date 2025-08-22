import * as faceapi from 'face-api.js';

let modelsLoadedPromise: Promise<void> | null = null;

export async function ensureModelsLoaded(): Promise<void> {
  if (!modelsLoadedPromise) {
    modelsLoadedPromise = (async () => {
      // Derive the correct base path even when the app is hosted under a sub-path
      const base: string = (import.meta as any)?.env?.BASE_URL ?? '/';
      const MODEL_URL: string = base.endsWith('/') ? `${base}weights` : `${base}/weights`;
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
      } catch (e) {
        console.error('[face-api] Failed to load models from', MODEL_URL, e);
        throw e;
      }
    })();
  }
  return modelsLoadedPromise;
}

export async function centerCropFace(
  imgFile: File,
  containerWidth: number,
  containerHeight: number,
): Promise<string> {
  try {
    await ensureModelsLoaded();
  } catch (err) {
    console.warn('[face-api] Using original image due to model load error.');
    return URL.createObjectURL(imgFile);
  }

  const img = await faceapi.bufferToImage(imgFile);

  // Downscale very large images before detection to reduce latency
  const MAX_SIZE = 640; // px, adjust if needed for quality vs speed
  let detectSource: HTMLImageElement | HTMLCanvasElement = img;
  let scaleFactor = 1; // detectSource = original * scaleFactor
  if (img.width > MAX_SIZE || img.height > MAX_SIZE) {
    const aspect = img.width / img.height;
    const targetWidth = aspect >= 1 ? Math.min(img.width, MAX_SIZE) : Math.round(MAX_SIZE * aspect);
    const targetHeight = aspect >= 1 ? Math.round(MAX_SIZE / aspect) : Math.min(img.height, MAX_SIZE);
    const off = document.createElement('canvas');
    off.width = targetWidth;
    off.height = targetHeight;
    const octx = off.getContext('2d');
    if (!octx) throw new Error('2D context not available');
    octx.imageSmoothingEnabled = true;
    try { (octx as any).imageSmoothingQuality = 'high'; } catch {}
    octx.drawImage(img, 0, 0, targetWidth, targetHeight);
    detectSource = off;
    scaleFactor = targetWidth / img.width; // same as targetHeight / img.height
  }

  let detections;
  try {
    detections = await faceapi
      .detectAllFaces(detectSource, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 }))
      .withFaceLandmarks();
  } catch (e) {
    console.error('[face-api] Detection error:', e);
    return URL.createObjectURL(imgFile);
  }

  if (!detections.length) {
    console.warn('[face-api] No faces detected; returning original image.');
    return URL.createObjectURL(imgFile);
  }

  // Map detection box back to original image coordinates if we downscaled
  // const best = detections.reduce((a, b) => (a.detection.box.area > b.detection.box.area ? a : b));
  // const detBox = detections[0].detection.box;
  const bestDetection = detections.sort((a,b) => (b.detection.box.width*b.detection.box.height) - (a.detection.box.width*a.detection.box.height))[0];
  const detBox = bestDetection.detection.box;
  const inv = 1 / scaleFactor; // if scaleFactor===1, this is a no-op
  const box = {
    x: detBox.x * inv,
    y: detBox.y * inv,
    width: detBox.width * inv,
    height: detBox.height * inv,
  };
  const targetFill = 0.5; // 50% fill
  const scale = Math.min(
    (containerWidth * targetFill) / box.width,
    (containerHeight * targetFill) / box.height,
  );

  const canvas = document.createElement('canvas');
  canvas.width = containerWidth;
  canvas.height = containerHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context not available');

  const faceCenterX = box.x + box.width / 2;
  const faceCenterY = box.y + box.height / 2;

  const offsetX = containerWidth / 2 - faceCenterX * scale;
  const offsetY = containerHeight / 2 - faceCenterY * scale;

  ctx.imageSmoothingEnabled = true;
  try { (ctx as any).imageSmoothingQuality = 'high'; } catch {}

  ctx.drawImage(
    img,
    offsetX,
    offsetY,
    img.width * scale,
    img.height * scale,
  );

  return canvas.toDataURL('image/png');
}
