import { createRequire } from 'node:module';
import * as nsfwjs from 'nsfwjs';
import sharp from 'sharp';
const require = createRequire(import.meta.url);

type TfjsNodeModule = typeof import('@tensorflow/tfjs-node');

let model: nsfwjs.NSFWJS | null = null;
let tfModulePromise: Promise<TfjsNodeModule> | null = null;

function ensureLegacyUtilPolyfill() {
  const nodeUtil = require('node:util') as typeof import('node:util') & {
    isNullOrUndefined?: (value: unknown) => value is null | undefined;
  };

  if (typeof nodeUtil.isNullOrUndefined !== 'function') {
    nodeUtil.isNullOrUndefined = (value: unknown): value is null | undefined => value == null;
  }
}

async function getTfModule() {
  if (!tfModulePromise) {
    ensureLegacyUtilPolyfill();
    tfModulePromise = import('@tensorflow/tfjs-node').then((module) => (module.default ?? module) as TfjsNodeModule);
  }

  return tfModulePromise;
}

export async function getNSFWModel() {
  if (!model) {
    await getTfModule();
    model = await nsfwjs.load();
  }
  return model;
}

export async function classifyImageBuffer(imageBuffer: Buffer) {
  const tf = await getTfModule();
  const loadedModel = await getNSFWModel();

  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error('Image buffer kosong');
  }

  let normalizedBuffer: Buffer;
  try {
    normalizedBuffer = await sharp(imageBuffer).jpeg().toBuffer();
  } catch {
    throw new Error('File bukan gambar valid atau format tidak didukung');
  }

  const imageTensor = tf.node.decodeImage(normalizedBuffer, 3);

  try {
    return await loadedModel.classify(imageTensor as any);
  } finally {
    imageTensor.dispose();
  }
}

export function isSafeImage(predictions: Array<{ className: string; probability: number }>) {
  const porn = predictions.find((p) => p.className === 'Porn');
  const hentai = predictions.find((p) => p.className === 'Hentai');
  const sexy = predictions.find((p) => p.className === 'Sexy');

  const pornProb = porn?.probability ?? 0;
  const hentaiProb = hentai?.probability ?? 0;
  const sexyProb = sexy?.probability ?? 0;

  if (pornProb >= 0.9) return false;
  if (hentaiProb >= 0.9) return false;
  if (sexyProb >= 0.95 && pornProb > 0.3) return false;
  return true;
}

export function isAvatarSafe(predictions: Array<{ className: string; probability: number }>) {
  return isSafeImage(predictions);
}
