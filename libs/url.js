// Parsing y utilidades relacionadas a URLs (imagenes, videos, YouTube, links)
import { sanitizeText, isSafeUrl } from './sanitize.js';
import { is_valid_video_url, getImageTag, getVideoTag } from './media.js';

function is_valid_url_image(url) {
  let isValid = false;
  const re = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg|bmp)/i;
  try {
    isValid = re.test(url);
  } catch (e) {
    console.log(e);
  } 
  return isValid;
}

function is_valid_yt_video(url) {
  let isValid = false;
  const re = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})?$/i;
  try {
    isValid = re.test(url);
  } catch (e) {
    console.log(e);
  } 
  return isValid;
}

function isYouTubeUrl(url) {
  return /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})?$/i.test(url);
}

function getYouTubeVideoId(url) {
  const match = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
  return match && match[1];
}

function createSafeLink(url) {
  return `<a href="${sanitizeText(url)}" target="_blank" rel="noopener noreferrer">${sanitizeText(url)}</a>`;
}

function procesarURLs(texto) {
  if (!texto) return '';
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  let result = '';
  let lastIndex = 0;
  let match;

  if (/<[a-z][\s\S]*>/i.test(texto)) {
    return texto;
  }

  const textoEscapado = sanitizeText(texto);

  if (!urlRegex.test(textoEscapado)) {
    return textoEscapado;
  }

  urlRegex.lastIndex = 0;

  while ((match = urlRegex.exec(textoEscapado)) !== null) {
    result += textoEscapado.substring(lastIndex, match.index);

    try {
      const url = new URL(match[0]);

      if (isYouTubeUrl(url.href)) {
        const videoId = getYouTubeVideoId(url.href);
        if (videoId) {
          result += `<div class="media-container">
            <iframe width="100%" height="315" 
              src="https://www.youtube.com/embed/${videoId}" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>`;
          lastIndex = urlRegex.lastIndex;
          continue;
        }
      }

      if (is_valid_url_image(url.href)) {
        result += getImageTag(url.href);
        lastIndex = urlRegex.lastIndex;
        continue;
      }

      if (is_valid_video_url(url.href)) {
        result += getVideoTag(url.href);
        lastIndex = urlRegex.lastIndex;
        continue;
      }

      if (!isSafeUrl(url.href)) {
        result += sanitizeText(match[0]);
        lastIndex = urlRegex.lastIndex;
        continue;
      }

      result += createSafeLink(url.href);

    } catch (e) {
      console.error('Error procesando URL:', e);
      result += match[0];
    }

    lastIndex = urlRegex.lastIndex;
  }

  result += textoEscapado.substring(lastIndex);
  return result;
}

export {
  is_valid_url_image,
  is_valid_yt_video,
  isYouTubeUrl,
  getYouTubeVideoId,
  createSafeLink,
  procesarURLs
};
