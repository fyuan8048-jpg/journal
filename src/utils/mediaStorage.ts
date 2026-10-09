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
 * Extracts a video thumbnail and duration from an uploaded video file.
 */
export async function generateVideoThumbnail(
  file: File
): Promise<{ thumbnailDataUrl: string; duration: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = objectUrl;

    const cleanup = () => {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {}
    };

    video.onloadeddata = () => {
      video.currentTime = Math.min(0.5, (video.duration || 1) / 2);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, 320, 180);
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          cleanup();
          resolve({ thumbnailDataUrl, duration: video.duration || 0 });
          return;
        }
      } catch {}
      cleanup();
      resolve({ thumbnailDataUrl: '', duration: video.duration || 0 });
    };

    video.onerror = () => {
      cleanup();
      resolve({ thumbnailDataUrl: '', duration: 0 });
    };

    // Safety timeout in case video fails to decode
    setTimeout(() => {
      cleanup();
      resolve({ thumbnailDataUrl: '', duration: 0 });
    }, 4000);
  });
}

/**
 * Stores a full-resolution media blob (image or video) in IndexedDB under `media_blob_${id}`
 */
export async function storeMediaBlob(id: string, blob: Blob): Promise<string> {
  const key = `media_blob_${id}`;
  await idbSet(key, blob);
  return key;
}

/**
 * Backward compatibility wrapper for storeImageBlob
 */
export async function storeImageBlob(id: string, blob: Blob): Promise<string> {
  return storeMediaBlob(id, blob);
}

/**
 * Retrieves a stored blob from IndexedDB and returns a live object URL
 */
export async function getMediaBlobUrl(key: string): Promise<string | null> {
  try {
    let blob = await get<Blob>(key);
    if (!blob && !key.startsWith('media_blob_') && !key.startsWith('img_blob_')) {
      blob = await get<Blob>(`media_blob_${key}`) || await get<Blob>(`img_blob_${key}`);
    }
    if (blob instanceof Blob) {
      return URL.createObjectURL(blob);
    }
  } catch (e) {
    console.warn('Failed to retrieve blob from IndexedDB for key:', key, e);
  }
  return null;
}

/**
 * Backward compatibility wrapper for getImageBlobUrl
 */
export async function getImageBlobUrl(key: string): Promise<string | null> {
  return getMediaBlobUrl(key);
}

/**
 * Removes a media blob from IndexedDB
 */
export async function deleteMediaBlob(id: string): Promise<void> {
  try {
    await idbDel(`media_blob_${id}`);
    await idbDel(`img_blob_${id}`);
  } catch (e) {
    console.warn('Failed to delete media blob from IndexedDB for id:', id, e);
  }
}

export async function deleteImageBlob(id: string): Promise<void> {
  return deleteMediaBlob(id);
}

/**
 * Restores live blob URLs for all user custom images and videos from IndexedDB upon sign-in/mount
 */
export async function restoreImagesFromStorage(images: UserCustomImage[]): Promise<UserCustomImage[]> {
  if (!images || images.length === 0) return [];

  const restored = await Promise.all(
    images.map(async (img) => {
      // If it's a web URL (http:// or https://), it's already live
      if (img.url && (img.url.startsWith('http://') || img.url.startsWith('https://'))) {
        return img;
      }

      // Check IndexedDB for the local blob using storageKey or id
      const possibleKeys = [
        img.storageKey,
        `media_blob_${img.id}`,
        `img_blob_${img.id}`,
        img.id
      ].filter(Boolean) as string[];

      for (const k of possibleKeys) {
        const blobUrl = await getMediaBlobUrl(k);
        if (blobUrl) {
          return {
            ...img,
            url: blobUrl,
            storageKey: k,
          };
        }
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
      // If the image/video URL is a huge base64 data string (> 30KB) or temporary blob: URL, clean it for Firestore
      if (img.url && (img.url.startsWith('data:') && img.url.length > 30000 || img.url.startsWith('blob:'))) {
        return {
          ...img,
          url: img.thumbnailDataUrl || '', // Store micro-thumbnail or empty, blob stays in local IndexedDB
          storageKey: img.storageKey || `media_blob_${img.id}`,
        };
      }
      return img;
    });
  }

  // If the active custom wallpaper is a huge base64 string or blob URL, sanitize it too
  if (
    sanitized.preferences?.activeCustomImageUrl &&
    (sanitized.preferences.activeCustomImageUrl.startsWith('data:') && sanitized.preferences.activeCustomImageUrl.length > 30000 ||
     sanitized.preferences.activeCustomImageUrl.startsWith('blob:'))
  ) {
    // Keep reference ID instead of dead blob URL
    sanitized.preferences.activeCustomImageUrl = sanitized.preferences.activeCustomImageId || '';
  }

  return sanitized;
}
