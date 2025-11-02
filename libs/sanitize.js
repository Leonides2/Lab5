// Sanitiza el texto para prevenir XSS y valida URLs seguras
const xss = require('xss');

function sanitizeText(text) {
  if (!text) return '';
  return xss(text, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  });
}

function isSafeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = { sanitizeText, isSafeUrl };
