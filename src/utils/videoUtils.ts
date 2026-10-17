/**
 * Video URL parsing and embed link generation utilities
 * Supports YouTube (standard, shorts, embed), Vimeo, Loom, Google Drive,
 * Dropbox, and direct HTML5 video files (MP4, WebM, OGG, MOV, blob, data URL).
 */

export interface ParsedVideo {
  type: 'youtube' | 'vimeo' | 'loom' | 'gdrive' | 'html5' | 'none';
  embedUrl?: string;
  directUrl?: string;
  videoId?: string;
  providerName?: string;
}

export function parseVideoUrl(
  url: string | undefined | null,
  autoplay: boolean = false
): ParsedVideo {
  if (!url || !url.trim()) {
    return { type: 'none' };
  }

  const trimmed = url.trim();
  const autoParam = autoplay ? '1' : '0';

  // 1. YouTube Matchers (standard, shorts, embed, shortlink)
  const ytRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = trimmed.match(ytRegex);

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      providerName: 'YouTube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoParam}&rel=0&modestbranding=1&playsinline=1`,
    };
  }

  // Plain 11-char YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return {
      type: 'youtube',
      videoId: trimmed,
      providerName: 'YouTube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${trimmed}?autoplay=${autoParam}&rel=0&modestbranding=1&playsinline=1`,
    };
  }

  // 2. Vimeo Matchers
  const vimeoRegex = /(?:vimeo\.com\/)(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)/i;
  const vimeoMatch = trimmed.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      videoId,
      providerName: 'Vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=${autoParam}&dnt=1`,
    };
  }

  // 3. Loom Matchers
  const loomRegex = /(?:loom\.com\/(?:share|embed)\/)([a-zA-Z0-9_-]+)/i;
  const loomMatch = trimmed.match(loomRegex);
  if (loomMatch && loomMatch[1]) {
    const videoId = loomMatch[1];
    return {
      type: 'loom',
      videoId,
      providerName: 'Loom',
      embedUrl: `https://www.loom.com/embed/${videoId}?autoplay=${autoParam}`,
    };
  }

  // 4. Google Drive Preview
  const gdriveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/i;
  const gdriveMatch = trimmed.match(gdriveRegex);
  if (gdriveMatch && gdriveMatch[1]) {
    const fileId = gdriveMatch[1];
    return {
      type: 'gdrive',
      videoId: fileId,
      providerName: 'Google Drive',
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    };
  }

  // 5. Dropbox direct link (convert dl=0 to raw=1)
  if (trimmed.includes('dropbox.com') && (trimmed.includes('dl=0') || trimmed.includes('raw=0'))) {
    const directDropboxUrl = trimmed.replace(/[?&](?:dl|raw)=\d/g, '').concat(
      trimmed.includes('?') ? '&raw=1' : '?raw=1'
    );
    return {
      type: 'html5',
      directUrl: directDropboxUrl,
      providerName: 'Dropbox Video',
    };
  }

  // 6. Direct HTML5 Video (mp4, webm, ogg, mov, blob:, data:video/)
  if (
    trimmed.startsWith('data:video/') ||
    trimmed.startsWith('blob:') ||
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)
  ) {
    return {
      type: 'html5',
      directUrl: trimmed,
      providerName: 'Direct Video File',
    };
  }

  // If URL has http/https but no specific extension, treat as direct video stream
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      type: 'html5',
      directUrl: trimmed,
      providerName: 'Video Stream',
    };
  }

  return { type: 'none' };
}
