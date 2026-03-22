/**
 * Extract YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 */
export function extractYouTubeVideoId(url) {
  if (!url) return null;

  // Remove whitespace
  url = url.trim();

  // Pattern 1: youtu.be/VIDEO_ID
  const youtubeShortPattern = /youtu\.be\/([a-zA-Z0-9_-]{11})/;
  const shortMatch = url.match(youtubeShortPattern);
  if (shortMatch && shortMatch[1]) {
    return shortMatch[1];
  }

  // Pattern 2: youtube.com/watch?v=VIDEO_ID
  const youtubeWatchPattern = /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const watchMatch = url.match(youtubeWatchPattern);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  // Pattern 3: Direct VIDEO_ID (if it looks like a valid ID)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Validate if URL is a valid YouTube URL
 */
export function isValidYouTubeUrl(url) {
  if (!url) return false;
  const videoId = extractYouTubeVideoId(url);
  return videoId !== null;
}

/**
 * Generate YouTube thumbnail URL
 * Tries maxresdefault first, then falls back to smaller sizes
 * Format: https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg
 */
export function generateYouTubeThumbnailUrl(videoId) {
  if (!videoId) return null;

  // Validate video ID format
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return null;
  }

  // Return the highest quality thumbnail URL
  // If not available, YouTube will serve the next available size
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Get thumbnail URL from YouTube video URL
 * Automatically extracts video ID and generates thumbnail URL
 */
export function getYouTubeThumbnail(youtubeUrl) {
  if (!youtubeUrl) return null;

  const videoId = extractYouTubeVideoId(youtubeUrl);
  if (!videoId) return null;

  return generateYouTubeThumbnailUrl(videoId);
}

/**
 * Convert YouTube URL to embeddable iframe URL
 */
export function getYouTubeEmbedUrl(youtubeUrl) {
  if (!youtubeUrl) return null;

  const videoId = extractYouTubeVideoId(youtubeUrl);
  if (!videoId) return null;

  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Validate and process YouTube URL for storage
 * Returns object with videoId and thumbnailUrl, or null if invalid
 */
export function processYouTubeUrl(youtubeUrl) {
  if (!youtubeUrl) return null;

  const videoId = extractYouTubeVideoId(youtubeUrl);
  if (!videoId) return null;

  return {
    videoId: videoId,
    originalUrl: youtubeUrl,
    embedUrl: getYouTubeEmbedUrl(youtubeUrl),
    thumbnailUrl: generateYouTubeThumbnailUrl(videoId),
  };
}
