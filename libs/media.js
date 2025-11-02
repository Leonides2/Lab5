// Utilidades para manejo de imagenes y videos
import { sanitizeText } from './sanitize.js';

function is_valid_video_url(url) {
  const re = /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i;
  return re.test(url);
}

function getVideoMimeType(url) {
  if (/\.mp4(\?.*)?$/i.test(url)) return 'video/mp4';
  if (/\.webm(\?.*)?$/i.test(url)) return 'video/webm';
  if (/\.ogg(\?.*)?$/i.test(url)) return 'video/ogg';
  return 'video/mp4';
}

function getImageTag(url) {
  const safeUrl = sanitizeText(url);
  return `<div class="media-container">
    <img src="${safeUrl}" alt="Imagen compartida" 
         onerror="this.parentNode.outerHTML='<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>'">
    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" 
       style="font-size: 11px; color: #7f8c8d;">Ver imagen</a>
  </div>`;
}

function getVideoTag(url) {
  const safeUrl = sanitizeText(url);
  return `<div class="media-container">
    <video width="100%" controls>
      <source src="${safeUrl}" type="${getVideoMimeType(url)}">
      Tu navegador no soporta la reproducción de video.
    </video>
    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" 
       style="font-size: 11px; color: #7f8c8d;">Ver video original</a>
  </div>`;
}

function getEmbeddedCode(url){
  const id = getYTVideoId(url);
  const code = '<iframe width="560" height="315" src="https://www.youtube.com/embed/'+id+ '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  return code;
}

function getYTVideoId(url){
  return url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)[1];
}

export {
  is_valid_video_url,
  getVideoMimeType,
  getImageTag,
  getVideoTag,
  getEmbeddedCode,
  getYTVideoId
};
