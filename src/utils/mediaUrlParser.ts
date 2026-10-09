// Intelligent Media URL Parser & Metadata Extractor
// Supports YouTube (standard, shorts, embed, youtu.be, music.youtube), Vimeo, Direct Audio/Video streams & Images

export interface ParsedMedia {
  type: 'youtube' | 'vimeo' | 'video' | 'audio' | 'image' | 'generic';
  id?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  directUrl: string;
  defaultTitle: string;
}

/**
 * Extracts YouTube video ID from any valid YouTube URL
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();
  const match = cleanUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i
  );
  return match ? match[1] : null;
}

/**
 * Extracts Vimeo video ID from any valid Vimeo URL
 */
export function extractVimeoId(url: string): string | null {
  if (!url) return null;
  const match = url.trim().match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|)(\d+)/i);
  return match ? match[1] : null;
}

/**
 * Analyzes any web URL and categorizes its media type with optimal embed/streaming details
 */
export function parseMediaUrl(url: string): ParsedMedia {
  const cleanUrl = url.trim();

  // 1. YouTube
  const ytId = extractYouTubeId(cleanUrl);
  if (ytId) {
    return {
      type: 'youtube',
      id: ytId,
      embedUrl: `https://www.youtube.com/embed/${ytId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      directUrl: cleanUrl,
      defaultTitle: `YouTube Media (${ytId})`,
    };
  }

  // 2. Vimeo
  const vimeoId = extractVimeoId(cleanUrl);
  if (vimeoId) {
    return {
      type: 'vimeo',
      id: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      directUrl: cleanUrl,
      defaultTitle: `Vimeo Video (${vimeoId})`,
    };
  }

  // 3. Direct Video File
  if (cleanUrl.match(/\.(mp4|webm|mov|mkv|m4v|avi|ogv)(\?.*)?$/i)) {
    const filename = cleanUrl.split('/').pop()?.split('?')[0] || 'Web Video';
    return {
      type: 'video',
      directUrl: cleanUrl,
      defaultTitle: decodeURIComponent(filename.replace(/\.[^/.]+$/, '')),
    };
  }

  // 4. Direct Audio File or Stream
  if (cleanUrl.match(/\.(mp3|wav|ogg|flac|aac|m4a|weba|opus)(\?.*)?$/i)) {
    const filename = cleanUrl.split('/').pop()?.split('?')[0] || 'Audio Track';
    return {
      type: 'audio',
      directUrl: cleanUrl,
      defaultTitle: decodeURIComponent(filename.replace(/\.[^/.]+$/, '')),
    };
  }

  // 5. Image File or Known Image CDN
  if (
    cleanUrl.match(/\.(png|jpe?g|webp|gif|svg|bmp|avif)(\?.*)?$/i) ||
    cleanUrl.includes('images.unsplash.com') ||
    cleanUrl.includes('imgur.com')
  ) {
    const filename = cleanUrl.split('/').pop()?.split('?')[0] || 'Custom Artwork';
    return {
      type: 'image',
      directUrl: cleanUrl,
      thumbnailUrl: cleanUrl,
      defaultTitle: decodeURIComponent(filename.replace(/\.[^/.]+$/, '')),
    };
  }

  // 6. Generic Link
  return {
    type: 'generic',
    directUrl: cleanUrl,
    defaultTitle: 'Web Media Link',
  };
}

/**
 * Asynchronously fetches metadata (title, author, thumbnail) for YouTube and other media links
 */
export async function fetchLinkMetadata(
  url: string
): Promise<{ title: string; author: string; thumbnailUrl?: string; isYouTube: boolean; youTubeId?: string }> {
  const parsed = parseMediaUrl(url);

  if (parsed.type === 'youtube' && parsed.id) {
    const defaultData = {
      title: `YouTube: ${parsed.id}`,
      author: 'YouTube Channel',
      thumbnailUrl: `https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`,
      isYouTube: true,
      youTubeId: parsed.id,
    };

    try {
      // Try noembed (CORS-friendly public proxy)
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title || defaultData.title,
          author: data.author_name || defaultData.author,
          thumbnailUrl: data.thumbnail_url || defaultData.thumbnailUrl,
          isYouTube: true,
          youTubeId: parsed.id,
        };
      }
    } catch {}

    return defaultData;
  }

  return {
    title: parsed.defaultTitle,
    author: 'Web Source',
    thumbnailUrl: parsed.thumbnailUrl,
    isYouTube: false,
  };
}

/**
 * Sends a command to an embedded YouTube iframe via postMessage
 */
export function sendYouTubeCommand(
  iframe: HTMLIFrameElement | null,
  func: 'playVideo' | 'pauseVideo' | 'stopVideo' | 'mute' | 'unMute' | 'setVolume' | 'seekTo',
  args: (number | string | boolean)[] = []
) {
  if (!iframe || !iframe.contentWindow) return;
  try {
    iframe.contentWindow.postMessage(
      JSON.stringify({
        event: 'command',
        func,
        args,
      }),
      '*'
    );
  } catch (err) {
    console.warn('Failed to send YouTube iframe command:', err);
  }
}
