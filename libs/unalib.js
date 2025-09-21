// Módulo de validación y seguridad para el chat
const xss = require('xss');

module.exports = {

    // logica que valida si un telefono esta correcto...
    is_valid_phone: function (phone) {
      // inicializacion lazy
      var isValid = false;
      // expresion regular copiada de StackOverflow
      var re = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/i;

      // validacion Regex
      try {
        isValid = re.test(phone);
      } catch (e) {
        console.log(e);
      } finally {
          return isValid;
      }
      // fin del try-catch block
    },

    is_valid_url_image: function (url) {

      // inicializacion lazy
      var isValid = false;
      // expresion regular copiada de StackOverflow
      const re = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg|bmp)/i;

      // validacion Regex
      try {
        isValid = re.test(url);
      } catch (e) {
        console.log(e);
      } finally {
          return isValid;
      }
      // fin del try-catch block
    },

    is_valid_yt_video: function (url) {

      // inicializacion lazy
      var isValid = false;
      // expresion regular copiada de StackOverflow
      const re = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})?$/i;

      // validacion Regex
      try {
        isValid = re.test(url);
      } catch (e) {
        console.log(e);
      } finally {
          return isValid;
      }
      // fin del try-catch block
    },

    getYTVideoId: function(url){

      return url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)[1];
    },

    getEmbeddedCode: function (url){
      var id = this.getYTVideoId(url);
      var code = '<iframe width="560" height="315" src="https://www.youtube.com/embed/'+id+ '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      return code;
    },

    // Valida si es una URL de video válida
    is_valid_video_url: function(url) {
      const re = /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i;
      return re.test(url);
    },

    getImageTag: function(url) {
      const safeUrl = this.sanitizeText(url);
      return `<div class="media-container">
        <img src="${safeUrl}" alt="Imagen compartida" 
             onerror="this.parentNode.outerHTML='<a href=\'${safeUrl}\' target=\'_blank\' rel=\'noopener noreferrer\'>${safeUrl}</a>'">
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" 
           style="font-size: 11px; color: #7f8c8d;">Ver imagen</a>
      </div>`;
    },

    getVideoTag: function(url) {
      const safeUrl = this.sanitizeText(url);
      return `<div class="media-container">
        <video width="100%" controls>
          <source src="${safeUrl}" type="${this.getVideoMimeType(url)}">
          Tu navegador no soporta la reproducción de video.
        </video>
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" 
           style="font-size: 11px; color: #7f8c8d;">Ver video original</a>
      </div>`;
    },

    getVideoMimeType: function(url) {
      if (/\.mp4(\?.*)?$/i.test(url)) return 'video/mp4';
      if (/\.webm(\?.*)?$/i.test(url)) return 'video/webm';
      if (/\.ogg(\?.*)?$/i.test(url)) return 'video/ogg';
      return 'video/mp4'; // Por defecto
    },

    getRandomColor: function() {
      return '#' + Math.floor(Math.random()*16777215).toString(16);
    },

    // Sanitiza el texto para prevenir XSS
    sanitizeText: function(text) {
      if (!text) return '';
      // Eliminar etiquetas HTML/JS potencialmente peligrosas
      return xss(text, {
        whiteList: {}, // No permitir ninguna etiqueta HTML
        stripIgnoreTag: true, // Eliminar etiquetas no permitidas
        stripIgnoreTagBody: ['script'] // Eliminar contenido de scripts
      });
    },

    // Valida si una URL es segura
    isSafeUrl: function(url) {
      try {
        const parsedUrl = new URL(url);
        // Solo permitir URLs con protocolos http o https
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          return false;
        }
        return true;
      } catch (e) {
        return false;
      }
    },

    procesarURLs: function(texto) {
      if (!texto) return '';
      
      // Expresión regular para detectar URLs
      const urlRegex = /(https?:\/\/[^\s<]+)/g;
      let result = '';
      let lastIndex = 0;
      let match;
      
      // Si el texto ya parece contener HTML, no lo procesamos
      if (/<[a-z][\s\S]*>/i.test(texto)) {
        return texto;
      }
      
      // Escapar el texto por defecto
      const textoEscapado = this.sanitizeText(texto);
      
      // Si no hay URLs, devolver el texto escapado
      if (!urlRegex.test(textoEscapado)) {
        return textoEscapado;
      }
      
      // Resetear lastIndex para volver a buscar
      urlRegex.lastIndex = 0;
      
      while ((match = urlRegex.exec(textoEscapado)) !== null) {
        // Añadir texto antes de la URL
        result += textoEscapado.substring(lastIndex, match.index);
        
        try {
          const url = new URL(match[0]);
          
          // Verificar si es YouTube
          if (this.isYouTubeUrl(url.href)) {
            const videoId = this.getYouTubeVideoId(url.href);
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
          
          // Para cualquier otra URL, crear un enlace simple
          result += this.createSafeLink(url.href);
          
        } catch (e) {
          console.error("Error procesando URL:", e);
          result += match[0];
        }
        
        lastIndex = urlRegex.lastIndex;
      }
      
      // Añadir el resto del texto después de la última URL
      result += textoEscapado.substring(lastIndex);
      
      return result;
    },

    isYouTubeUrl: function(url) {
      return /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})?$/i.test(url);
    },

    getYouTubeVideoId: function(url) {
      const match = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
      return match && match[1];
    },

    createSafeLink: function(url) {
      return `<a href="${this.sanitizeText(url)}" target="_blank" rel="noopener noreferrer">${this.sanitizeText(url)}</a>`;
    },

    // Procesa y valida un mensaje completo
    validateMessage: function(msg) {
      if (!msg || typeof msg !== 'string') {
        return JSON.stringify({ error: 'Mensaje inválido' });
      }
      
      try {
        const obj = JSON.parse(msg);
        const nombre = this.sanitizeText(obj.nombre || 'Anónimo');
        const mensaje = obj.mensaje || '';  // No sanitizar aquí, lo haremos en procesarURLs
        const color = obj.color || '#000000';
        
        // Procesar mensaje para detectar URLs
        const mensajeProcesado = this.procesarURLs(mensaje);
        
        return JSON.stringify({
          nombre,
          mensaje: mensajeProcesado,
          color,
          timestamp: obj.timestamp || new Date().toISOString()
        });
        
      } catch (e) {
        console.error('Error al validar el mensaje:', e);
        return JSON.stringify({ 
          nombre: 'Sistema', 
          mensaje: 'Error al procesar el mensaje', 
          color: '#FF0000',
          timestamp: new Date().toISOString()
        });
      }
    }
};
  
  // fin del modulo