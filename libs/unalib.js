// Módulo de validación y seguridad para el chat (barrel de libs)
const { sanitizeText, isSafeUrl } = require('./sanitize');
const { is_valid_video_url, getVideoMimeType, getImageTag, getVideoTag, getEmbeddedCode, getYTVideoId } = require('./media');
const { is_valid_url_image, is_valid_yt_video, isYouTubeUrl, getYouTubeVideoId, createSafeLink, procesarURLs } = require('./url');
const { is_valid_phone, getRandomColor } = require('./utils');
const { validateMessage } = require('./message');

module.exports = {
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