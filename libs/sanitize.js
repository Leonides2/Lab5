// Sanitiza el texto para prevenir XSS y valida URLs seguras
import xss from 'xss';

const whiteList = {
  a: ['href', 'title', 'target', 'rel'],
  b: [],
  strong: [],
  i: [],
  em: [],
  u: [],
  br: [],
  p: [],
  ul: [],
  ol: [],
  li: [],
  blockquote: [],
  pre: [],
  code: [],
  span: ['style'],
  div: ['style'],
  img: ['src', 'alt', 'title', 'style'],
  video: ['src', 'controls', 'width', 'height', 'style'],
  source: ['src', 'type']
};

const styleWhiteList = [
  'color', 'background-color', 'font-size', 'font-weight', 
  'font-style', 'text-decoration', 'text-align', 'width',
  'height', 'max-width', 'max-height'
];

const xssOptions = {
  whiteList: whiteList,
  css: {
    whiteList: {
      '*': styleWhiteList
    }
  },
  onIgnoreTagAttr: function(tag, name, value, isWhiteAttr) {
    // Permitir estilos en línea solo de la lista blanca
    if (name === 'style') {
      const sanitized = [];
      const styles = value.split(';');
      
      for (const style of styles) {
        const [prop, val] = style.split(':').map(s => s.trim());
        if (prop && val && styleWhiteList.includes(prop.toLowerCase())) {
          sanitized.push(`${prop}:${val};`);
        }
      }
      
      if (sanitized.length > 0) {
        return `${name}="${sanitized.join(' ')}"`;
      }
    }
    
    // Para otros atributos, usar el comportamiento por defecto
    if (isWhiteAttr) {
      return `${name}="${xss.escapeAttrValue(value)}"`;
    }
  }
};

function sanitizeText(text) {
  if (!text) return '';
  return xss(text, xssOptions);
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
