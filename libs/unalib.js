// Módulo de validación y seguridad para el chat (barrel de libs)
import { sanitizeText, isSafeUrl } from './sanitize.js';
import { is_valid_video_url, getVideoMimeType, getImageTag, getVideoTag, getEmbeddedCode, getYTVideoId } from './media.js';
import { is_valid_url_image, is_valid_yt_video, isYouTubeUrl, getYouTubeVideoId, createSafeLink, procesarURLs } from './url.js';
import { is_valid_phone, getRandomColor } from './utils.js';
import { validateMessage } from './message.js';

export {
  // utils
  is_valid_phone,
  getRandomColor,
  // sanitize
  sanitizeText,
  isSafeUrl,
  // media
  is_valid_video_url,
  getVideoMimeType,
  getImageTag,
  getVideoTag,
  getEmbeddedCode,
  getYTVideoId,
  // url
  is_valid_url_image,
  is_valid_yt_video,
  isYouTubeUrl,
  getYouTubeVideoId,
  createSafeLink,
  procesarURLs,
  // messages
  validateMessage
};

// fin del modulo