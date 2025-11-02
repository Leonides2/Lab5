// Sanitiza el texto para prevenir XSS y valida URLs seguras
import xss from 'xss';

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
    console.error(e);
    return false;
  }
}

export { sanitizeText, isSafeUrl };
