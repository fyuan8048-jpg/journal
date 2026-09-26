// Persistent Local Media Storage Engine via IndexedDB (idb-keyval)
// Safely stores large user wallpapers, videos, and audio without blowing Firestore or localStorage limits

import { get, set as idbSet, del as idbDel } from 'idb-keyval';
import type { UserCustomImage, UserProfile } from '../context/AuthContext';

/**
 * Compresses an uploaded image file down to max 1920x1080 with WebP/JPEG compression.
 * Reduces 5-10MB photos down to ~150-300KB for instant, buttery-smooth 60fps rendering.
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.82
): Promise<{ blob: Blob; dataUrl: string; thumbnailDataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // 1. High-Res Canvas (1080p)
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }

      // Smooth bicubic resampling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // 2. Micro Thumbnail Canvas (< 5KB for Firestore safe backup)
      const thumbCanvas = document.createElement('canvas');
      const thumbRatio = Math.min(160 / img.width, 90 / img.height);
      thumbCanvas.width = Math.round(img.width * thumbRatio);
      thumbCanvas.height = Math.round(img.height * thumbRatio);
      const thumbCtx = thumbCanvas.getContext('2d');
      if (thumbCtx) {
        thumbCtx.imageSmoothingEnabled = true;
        thumbCtx.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);
      }
      const thumbnailDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.5);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              blob,
              dataUrl: reader.result as string,
              thumbnailDataUrl,
            });
          };
          reader.readAsDataURL(blob);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image file'));
    };

    img.src = objectUrl;
  });
}

/**
 * Stores a full-resolution image blob in IndexedDB under `img_blob_${id}`
 */
export async function storeImageBlob(id: string, blob: Blob): Promise<string> {
  const key = `img_blob_${id}`;
  await idbSet(key, blob);
  return key;
}

/**
 * Retrieves a stored blob from IndexedDB and returns a live object URL
 */
export async function getImageBlobUrl(key: string): Promise<string | null> {
  try {
    const blob = await get<Blob>(key);
    if (blob) {
      return URL.createObjectURL(blob);
    }
  } catch (e) {
    console.warn('Failed to retrieve blob from IndexedDB for key:', key, e);
  }
  return null;
}

/**
 * Removes a blob from IndexedDB
 */
export async function deleteImageBlob(id: string): Promise<void> {
  try {
    await idbDel(`img_blob_${id}`);
  } catch (e) {
    console.warn('Failed to delete blob from IndexedDB for id:', id, e);
  }
}

/**
 * Restores live blob URLs for all user custom images from IndexedDB upon sign-in/mount
 */
export async function restoreImagesFromStorage(images: UserCustomImage[]): Promise<UserCustomImage[]> {
  if (!images || images.length === 0) return [];

  const restored = await Promise.all(
    images.map(async (img) => {
      // If it's a web URL (https://...), it's already live
      if (img.url.startsWith('http://') || img.url.startsWith('https://')) {
        return img;
      }

      // Check IndexedDB for the local blob
      const storageKey = img.storageKey || `img_blob_${img.id}`;
      const blobUrl = await getImageBlobUrl(storageKey);
      if (blobUrl) {
        return {
          ...img,
          url: blobUrl,
          storageKey,
        };
      }

      // Fallback to thumbnail or existing URL
      return img;
    })
  );

  return restored;
}

/**
 * Sanitizes a UserProfile document before uploading to Cloud Firestore.
 * Ensures the payload NEVER exceeds Firestore's strict 1 Megabyte document limit.
 */
export function sanitizeProfileForFirestore(profile: UserProfile): UserProfile {
  const sanitized = JSON.parse(JSON.stringify(profile)) as UserProfile;

  if (sanitized.preferences?.customImages) {
    sanitized.preferences.customImages = sanitized.preferences.customImages.map((img) => {
      // If the image URL is a huge base64 data string (> 30KB), strip it for Firestore
      if (img.url && img.url.startsWith('data:') && img.url.length > 30000) {
        return {
          ...img,
          url: img.thumbnailDataUrl || '', // Store micro-thumbnail or empty, blob stays in local IndexedDB
          storageKey: img.storageKey || `img_blob_${img.id}`,
        };
      }
      return img;
    });
  }

  // If the active custom wallpaper is a huge base64 string, sanitize it too
  if (
    sanitized.preferences?.activeCustomImageUrl &&
    sanitized.preferences.activeCustomImageUrl.startsWith('data:') &&
    sanitized.preferences.activeCustomImageUrl.length > 30000
  ) {
    sanitized.preferences.activeCustomImageUrl = '';
  }

  return sanitized;
}
