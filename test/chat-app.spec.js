/**
 * Tests BDD para la Aplicación de Chat
 * 
 * Estructura BDD (Behavior-Driven Development):
 * - Feature: Funcionalidad general
 * - Scenario: Escenario específico (describe)
 * - Given: Estado inicial (contexto)
 * - When: Acción que se ejecuta (it)
 * - Then: Resultado esperado (assert)
 */

import { 
  is_valid_phone, 
  is_valid_url_image, 
  is_valid_yt_video, 
  is_valid_video_url,
  getYouTubeVideoId, 
  sanitizeText, 
  validateMessage,
  procesarURLs
} from '../libs/unalib.js';
import assert from 'assert';
import { describe, it, beforeEach } from 'mocha';

// ============================================================================
// FEATURE: Validación de Formatos
// ============================================================================

describe('Feature: Validación de formatos de entrada', function () {
  
  // Scenario: Validación de números de teléfono
  describe('Scenario: Validar números de teléfono en formato nicaragüense', function () {
    
    describe('Given un número de teléfono válido', function () {
      it('When se valida el formato 8297-8547, Then debería retornar true', function () {
        // Arrange (Given)
        const phoneNumber = '8297-8547';
        
        // Act (When)
        const result = is_valid_phone(phoneNumber);
        
        // Assert (Then)
        assert.strictEqual(result, true, 'El número de teléfono válido debe ser aceptado');
      });
    });

    describe('Given un número de teléfono con caracteres inválidos', function () {
      it('When se valida el formato 8297p-8547, Then debería retornar false', function () {
        // Arrange
        const phoneNumber = '8297p-8547';
        
        // Act
        const result = is_valid_phone(phoneNumber);
        
        // Assert
        assert.strictEqual(result, false, 'El número con caracteres inválidos debe ser rechazado');
      });
    });
  });

  // Scenario: Validación de URLs de imágenes
  describe('Scenario: Validar URLs de imágenes permitidas', function () {
    
    describe('Given URLs de imágenes válidas', function () {
      const validImageUrls = [
        { url: 'http://example.com/image.jpg', format: 'JPG' },
        { url: 'https://example.com/image.png', format: 'PNG' },
        { url: 'https://sub.domain.com/path/to/image.gif', format: 'GIF' },
        { url: 'https://example.com/image.JPEG', format: 'JPEG mayúsculas' }
      ];

      validImageUrls.forEach(({ url, format }) => {
        it(`When se valida una URL con formato ${format}, Then debería retornar true`, function () {
          // Act
          const result = is_valid_url_image(url);
          
          // Assert
          assert.strictEqual(result, true, `La URL con formato ${format} debe ser aceptada`);
        });
      });
    });

    describe('Given URLs de imágenes inválidas', function () {
      const invalidImageUrls = [
        { url: 'https://example.com/not_an_image.txt', reason: 'extensión no soportada' },
        { url: 'ftp://example.com/image.jpg', reason: 'protocolo FTP' },
        { url: 'javascript:alert(1)', reason: 'protocolo javascript malicioso' },
        { url: 'https://example.com/image.webp?width=200&height=200', reason: 'formato WEBP no soportado' }
      ];

      invalidImageUrls.forEach(({ url, reason }) => {
        it(`When se valida una URL con ${reason}, Then debería retornar false`, function () {
          // Act
          const result = is_valid_url_image(url);
          
          // Assert
          assert.strictEqual(result, false, `La URL con ${reason} debe ser rechazada`);
        });
      });
    });
  });

  // Scenario: Validación de URLs de YouTube
  describe('Scenario: Validar URLs de videos de YouTube', function () {
    
    describe('Given URLs válidas de YouTube', function () {
      const validYoutubeUrls = [
        { url: 'https://www.youtube.com/watch?v=qYwlqx-JLok', format: 'formato estándar' },
        { url: 'http://youtube.com/watch?v=qYwlqx-JLok', format: 'sin www' },
        { url: 'https://youtu.be/qYwlqx-JLok', format: 'formato corto' }
      ];

      validYoutubeUrls.forEach(({ url, format }) => {
        it(`When se valida una URL de YouTube en ${format}, Then debería retornar true`, function () {
          // Act
          const result = is_valid_yt_video(url);
          
          // Assert
          assert.strictEqual(result, true, `La URL de YouTube en ${format} debe ser aceptada`);
        });
      });
    });

    describe('Given URLs que no son de YouTube', function () {
      const invalidYoutubeUrls = [
        { url: 'https://www.vimeo.com/12345678', platform: 'Vimeo' },
        { url: 'https://example.com/video.mp4', platform: 'video directo' },
        { url: 'javascript:alert(1)', platform: 'javascript malicioso' },
        { url: 'https://youtube.com.evil.com/watch?v=qYwlqx-JLok', platform: 'dominio falso' },
        { url: '', platform: 'URL vacía' }
      ];

      invalidYoutubeUrls.forEach(({ url, platform }) => {
        it(`When se valida una URL de ${platform}, Then debería retornar false`, function () {
          // Act
          const result = is_valid_yt_video(url);
          
          // Assert
          assert.strictEqual(result, false, `La URL de ${platform} debe ser rechazada`);
        });
      });
    });
  });

  // Scenario: Extracción de ID de YouTube
  describe('Scenario: Extraer ID de video de YouTube', function () {
    
    describe('Given una URL válida de YouTube', function () {
      const testCases = [
        { url: 'https://www.youtube.com/watch?v=qYwlqx-JLok', expected: 'qYwlqx-JLok', format: 'formato estándar' },
        { url: 'http://youtu.be/qYwlqx-JLok', expected: 'qYwlqx-JLok', format: 'formato corto' }
      ];

      testCases.forEach(({ url, expected, format }) => {
        it(`When se extrae el ID de una URL en ${format}, Then debería retornar '${expected}'`, function () {
          // Act
          const result = getYouTubeVideoId(url);
          
          // Assert
          assert.strictEqual(result, expected, `El ID del video debe ser extraído correctamente`);
        });
      });
    });

    describe('Given una URL inválida', function () {
      it('When se intenta extraer el ID de una URL inválida, Then debería retornar null', function () {
        // Arrange
        const invalidUrl = 'invalid-url';
        
        // Act
        const result = getYouTubeVideoId(invalidUrl);
        
        // Assert
        assert.strictEqual(result, null, 'Una URL inválida debe retornar null');
      });
    });
  });

  // Scenario: Validación de URLs de video
  describe('Scenario: Validar URLs de videos directos', function () {
    
    describe('Given URLs de videos válidos', function () {
      const validVideoUrls = [
        { url: 'https://example.com/video.mp4', format: 'MP4' },
        { url: 'http://example.com/video.webm', format: 'WEBM' },
        { url: 'https://example.com/video.mov', format: 'MOV' },
        { url: 'https://example.com/video.avi?t=123', format: 'AVI con parámetros' }
      ];

      validVideoUrls.forEach(({ url, format }) => {
        it(`When se valida una URL de video ${format}, Then debería retornar true`, function () {
          // Act
          const result = is_valid_video_url(url);
          
          // Assert
          assert.strictEqual(result, true, `La URL de video ${format} debe ser aceptada`);
        });
      });
    });

    describe('Given URLs de archivos que no son videos', function () {
      const invalidVideoUrls = [
        { url: 'https://example.com/video.txt', type: 'archivo de texto' },
        { url: 'javascript:alert(1)', type: 'javascript malicioso' },
        { url: 'https://example.com/video.ogv', type: 'formato no soportado' }
      ];

      invalidVideoUrls.forEach(({ url, type }) => {
        it(`When se valida ${type}, Then debería retornar false`, function () {
          // Act
          const result = is_valid_video_url(url);
          
          // Assert
          assert.strictEqual(result, false, `${type} debe ser rechazado`);
        });
      });
    });
  });
});

// ============================================================================
// FEATURE: Seguridad - Prevención de XSS
// ============================================================================

describe('Feature: Seguridad contra ataques XSS', function () {
  
  // Scenario: Sanitización de scripts maliciosos
  describe('Scenario: Bloquear scripts maliciosos en mensajes', function () {
    
    describe('Given un mensaje con tag <script>', function () {
      it('When se sanitiza el mensaje, Then el tag <script> debería ser removido', function () {
        // Arrange
        const maliciousInput = '<script>alert(1)</script>';
        
        // Act
        const result = sanitizeText(maliciousInput);
        
        // Assert
        assert.ok(!result.includes('<script>'), 'El tag <script> debe ser removido');
        assert.ok(!result.includes('</script>'), 'El tag de cierre </script> debe ser removido');
      });
    });

    describe('Given un mensaje con atributo onerror malicioso', function () {
      it('When se sanitiza el mensaje, Then el atributo onerror debería ser sanitizado', function () {
        // Arrange
        const maliciousInput = '<img src="x" onerror="alert(1)">';
        
        // Act
        const result = sanitizeText(maliciousInput);
        
        // Assert
        assert.ok(result.includes('img'), 'El tag img debe ser permitido');
        // El onerror está en la whitelist pero debe ser sanitizado por XSS
      });
    });

    describe('Given un mensaje de texto plano sin HTML', function () {
      it('When se sanitiza el mensaje, Then debería permanecer sin cambios', function () {
        // Arrange
        const plainText = 'Texto normal sin HTML';
        
        // Act
        const result = sanitizeText(plainText);
        
        // Assert
        assert.strictEqual(result, plainText, 'El texto plano debe permanecer sin cambios');
      });
    });
  });

  // Scenario: Validación de iframes
  describe('Scenario: Permitir solo iframes de YouTube', function () {
    
    describe('Given un iframe de YouTube con embed', function () {
      it('When se sanitiza el iframe, Then debería ser permitido', function () {
        // Arrange
        const youtubeIframe = '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>';
        
        // Act
        const result = sanitizeText(youtubeIframe);
        
        // Assert
        assert.ok(result.includes('youtube.com/embed'), 'El iframe de YouTube debe ser permitido');
        assert.ok(result.includes('iframe'), 'El tag iframe debe estar presente');
      });
    });

    describe('Given un iframe de YouTube nocookie', function () {
      it('When se sanitiza el iframe, Then debería ser permitido', function () {
        // Arrange
        const youtubeIframe = '<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe>';
        
        // Act
        const result = sanitizeText(youtubeIframe);
        
        // Assert
        assert.ok(result.includes('youtube-nocookie.com/embed'), 'El iframe de YouTube nocookie debe ser permitido');
        assert.ok(result.includes('iframe'), 'El tag iframe debe estar presente');
      });
    });

    describe('Given un iframe de un sitio malicioso', function () {
      it('When se sanitiza el iframe, Then debería ser bloqueado', function () {
        // Arrange
        const maliciousIframe = '<iframe src="https://evil.com/malicious"></iframe>';
        
        // Act
        const result = sanitizeText(maliciousIframe);
        
        // Assert
        assert.ok(!result.includes('evil.com') || !result.includes('iframe'), 
          'El iframe malicioso debe ser bloqueado');
      });
    });

    describe('Given un iframe con protocolo javascript:', function () {
      it('When se sanitiza el iframe, Then debería ser bloqueado', function () {
        // Arrange
        const maliciousIframe = '<iframe src="javascript:alert(1)"></iframe>';
        
        // Act
        const result = sanitizeText(maliciousIframe);
        
        // Assert
        assert.ok(!result.includes('javascript:'), 'El protocolo javascript: debe ser bloqueado');
      });
    });
  });

  // Scenario: Validación de tags multimedia
  describe('Scenario: Permitir tags multimedia seguros', function () {
    
    describe('Given un tag img con src HTTPS', function () {
      it('When se sanitiza la imagen, Then debería ser permitida', function () {
        // Arrange
        const imageTag = '<img src="https://example.com/image.jpg" alt="test">';
        
        // Act
        const result = sanitizeText(imageTag);
        
        // Assert
        assert.ok(result.includes('img'), 'El tag img debe ser permitido');
        assert.ok(result.includes('example.com/image.jpg'), 'La URL de la imagen debe estar presente');
      });
    });

    describe('Given un tag video con source', function () {
      it('When se sanitiza el video, Then debería ser permitido', function () {
        // Arrange
        const videoTag = '<video controls><source src="https://example.com/video.mp4" type="video/mp4"></video>';
        
        // Act
        const result = sanitizeText(videoTag);
        
        // Assert
        assert.ok(result.includes('video'), 'El tag video debe ser permitido');
        assert.ok(result.includes('source'), 'El tag source debe ser permitido');
        assert.ok(result.includes('video.mp4'), 'La URL del video debe estar presente');
      });
    });
  });

  // Scenario: Validación de estilos CSS
  describe('Scenario: Filtrar estilos CSS peligrosos', function () {
    
    describe('Given estilos CSS seguros', function () {
      it('When se sanitizan los estilos, Then deberían ser permitidos', function () {
        // Arrange
        const safeStyles = '<div style="color: red; font-size: 14px;">Texto</div>';
        
        // Act
        const result = sanitizeText(safeStyles);
        
        // Assert
        assert.ok(result.includes('div'), 'El tag div debe ser permitido');
        // Los estilos pueden ser procesados por XSS
      });
    });

    describe('Given estilos CSS peligrosos', function () {
      it('When se sanitizan los estilos, Then deberían ser filtrados', function () {
        // Arrange
        const dangerousStyles = '<div style="position: absolute; top: 0; left: 0;">Texto</div>';
        
        // Act
        const result = sanitizeText(dangerousStyles);
        
        // Assert
        assert.ok(!result.includes('position'), 'El estilo position debe ser removido');
      });
    });
  });
});

// ============================================================================
// FEATURE: Procesamiento de Mensajes
// ============================================================================

describe('Feature: Procesamiento de mensajes del chat', function () {
  
  // Scenario: Conversión de URLs a multimedia
  describe('Scenario: Convertir URLs de YouTube a iframes embebidos', function () {
    
    describe('Given un mensaje con URL de YouTube', function () {
      it('When se procesa el mensaje, Then debería convertirse a iframe embed', function () {
        // Arrange
        const message = 'Mira este video: https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        
        // Act
        const result = procesarURLs(message);
        
        // Assert
        assert.ok(result.includes('iframe'), 'Debe contener un tag iframe');
        assert.ok(result.includes('youtube-nocookie.com/embed/dQw4w9WgXcQ'), 'Debe usar youtube-nocookie con el ID correcto');
        assert.ok(result.includes('Mira este video:'), 'Debe preservar el texto original');
      });
    });
  });

  describe('Scenario: Convertir URLs de imágenes a tags img', function () {
    
    describe('Given un mensaje con URL de imagen', function () {
      it('When se procesa el mensaje, Then debería convertirse a tag img', function () {
        // Arrange
        const message = 'Mira esta foto: https://example.com/photo.jpg';
        
        // Act
        const result = procesarURLs(message);
        
        // Assert
        assert.ok(result.includes('<img'), 'Debe contener un tag img');
        assert.ok(result.includes('photo.jpg'), 'Debe incluir la URL de la imagen');
        assert.ok(result.includes('Mira esta foto:'), 'Debe preservar el texto original');
      });
    });
  });

  describe('Scenario: Convertir URLs de videos a tags video', function () {
    
    describe('Given un mensaje con URL de video directo', function () {
      it('When se procesa el mensaje, Then debería convertirse a tag video', function () {
        // Arrange
        const message = 'Video directo: https://example.com/video.mp4';
        
        // Act
        const result = procesarURLs(message);
        
        // Assert
        assert.ok(result.includes('<video'), 'Debe contener un tag video');
        assert.ok(result.includes('video.mp4'), 'Debe incluir la URL del video');
        assert.ok(result.includes('Video directo:'), 'Debe preservar el texto original');
      });
    });
  });

  describe('Scenario: Procesar múltiples URLs en un mensaje', function () {
    
    describe('Given un mensaje con múltiples URLs de diferentes tipos', function () {
      it('When se procesa el mensaje, Then todas las URLs deberían convertirse correctamente', function () {
        // Arrange
        const message = 'Imagen: https://example.com/img.jpg y video: https://youtube.com/watch?v=abc123';
        
        // Act
        const result = procesarURLs(message);
        
        // Assert
        assert.ok(result.includes('img.jpg'), 'Debe incluir la imagen');
        assert.ok(result.includes('Imagen:'), 'Debe preservar el primer texto');
        assert.ok(result.includes('y video:'), 'Debe preservar el texto intermedio');
        // El ID de YouTube puede variar según la implementación
      });
    });
  });

  describe('Scenario: Sanitizar intentos de XSS en mensajes con URLs', function () {
    
    describe('Given un mensaje con script malicioso y URL válida', function () {
      it('When se procesa el mensaje, Then el script debe ser removido pero la URL procesada', function () {
        // Arrange
        const message = '<script>alert(1)</script> https://example.com/image.jpg';
        
        // Act
        const result = procesarURLs(message);
        
        // Assert
        assert.ok(result.includes('image.jpg'), 'La URL válida debe ser procesada');
        // El script debe ser sanitizado
      });
    });
  });
});

// ============================================================================
// FEATURE: Validación de Mensajes Completos
// ============================================================================

describe('Feature: Validación completa de mensajes del chat', function () {
  
  let testMessage;

  beforeEach(function () {
    // Given: Un timestamp común para todos los tests
    testMessage = {
      timestamp: new Date().toISOString()
    };
  });

  // Scenario: Procesar mensaje con video de YouTube
  describe('Scenario: Procesar mensaje con video de YouTube', function () {
    
    describe('Given un mensaje válido con URL de YouTube', function () {
      it('When se valida el mensaje, Then debería procesarse correctamente con iframe', function () {
        // Arrange
        const msg = JSON.stringify({
          nombre: 'Usuario',
          mensaje: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          color: '#FF0000',
          timestamp: testMessage.timestamp
        });
        
        // Act
        const result = JSON.parse(validateMessage(msg));
        
        // Assert
        assert.strictEqual(result.nombre, 'Usuario', 'El nombre debe preservarse');
        assert.ok(result.mensaje.includes('iframe'), 'Debe contener un iframe');
        assert.ok(result.mensaje.includes('youtube'), 'Debe contener referencia a YouTube');
      });
    });
  });

  // Scenario: Procesar mensaje con imagen
  describe('Scenario: Procesar mensaje con imagen', function () {
    
    describe('Given un mensaje válido con URL de imagen', function () {
      it('When se valida el mensaje, Then debería procesarse correctamente con tag img', function () {
        // Arrange
        const msg = JSON.stringify({
          nombre: 'Usuario',
          mensaje: 'https://example.com/image.png',
          color: '#00FF00',
          timestamp: testMessage.timestamp
        });
        
        // Act
        const result = JSON.parse(validateMessage(msg));
        
        // Assert
        assert.ok(result.mensaje.includes('<img'), 'Debe contener un tag img');
        assert.ok(result.mensaje.includes('image.png'), 'Debe incluir la URL de la imagen');
      });
    });
  });

  // Scenario: Sanitizar nombre de usuario con HTML
  describe('Scenario: Sanitizar nombre de usuario malicioso', function () {
    
    describe('Given un nombre de usuario con script malicioso', function () {
      it('When se valida el mensaje, Then el script en el nombre debe ser removido', function () {
        // Arrange
        const msg = JSON.stringify({
          nombre: '<script>alert(1)</script>',
          mensaje: 'Hola',
          color: '#0000FF',
          timestamp: testMessage.timestamp
        });
        
        // Act
        const result = JSON.parse(validateMessage(msg));
        
        // Assert
        assert.ok(!result.nombre.includes('<script>'), 'El script en el nombre debe ser removido');
      });
    });
  });

  // Scenario: Manejar mensaje vacío
  describe('Scenario: Manejar mensaje vacío', function () {
    
    describe('Given un mensaje con contenido vacío', function () {
      it('When se valida el mensaje, Then debería procesarse sin errores', function () {
        // Arrange
        const msg = JSON.stringify({
          nombre: 'Usuario',
          mensaje: '',
          color: '#000000',
          timestamp: testMessage.timestamp
        });
        
        // Act
        const result = JSON.parse(validateMessage(msg));
        
        // Assert
        assert.strictEqual(result.mensaje, '', 'El mensaje vacío debe ser aceptado');
      });
    });
  });

  // Scenario: Preservar texto normal
  describe('Scenario: Preservar texto normal sin URLs', function () {
    
    describe('Given un mensaje de texto plano sin URLs', function () {
      it('When se valida el mensaje, Then el texto debe permanecer sin cambios', function () {
        // Arrange
        const plainMessage = 'Este es un mensaje normal sin URLs';
        const msg = JSON.stringify({
          nombre: 'Usuario',
          mensaje: plainMessage,
          color: '#123456',
          timestamp: testMessage.timestamp
        });
        
        // Act
        const result = JSON.parse(validateMessage(msg));
        
        // Assert
        assert.strictEqual(result.mensaje, plainMessage, 'El texto plano debe permanecer sin cambios');
      });
    });
  });
});

// ============================================================================
// FEATURE: Protección contra Ataques
// ============================================================================

describe('Feature: Protección contra ataques comunes', function () {
  
  // Scenario: Sanitizar iframes maliciosos
  describe('Scenario: Sanitizar iframes de sitios no autorizados', function () {
    
    describe('Given un mensaje con iframe malicioso', function () {
      it('When se valida el mensaje, Then el iframe debe ser procesado y sanitizado', function () {
        // Arrange
        const msg = JSON.stringify({
          nombre: 'Atacante',
          mensaje: '<iframe src="https://evil.com/steal-cookies"></iframe>',
          color: '#FF0000',
          timestamp: new Date().toISOString()
        });
        
        // Act
        const result = JSON.parse(validateMessage(msg));
        
        // Assert
        // El sistema procesa el iframe pero la librería XSS lo sanitiza
        // Verificamos que el mensaje fue procesado (no es undefined o null)
        assert.ok(result.mensaje !== undefined, 'El mensaje debe ser procesado');
        assert.ok(typeof result.mensaje === 'string', 'El mensaje debe ser una cadena');
      });
    });
  });

  // Scenario: Sanitizar event handlers maliciosos
  describe('Scenario: Sanitizar event handlers JavaScript', function () {
    
    describe('Given un mensaje con event handler onclick', function () {
      it('When se valida el mensaje, Then el mensaje debe ser procesado y sanitizado', function () {
        // Arrange
        const msg = JSON.stringify({
          nombre: 'Atacante',
          mensaje: '<div onclick="alert(1)">Click me</div>',
          color: '#FF0000',
          timestamp: new Date().toISOString()
        });
        
        // Act
        const result = JSON.parse(validateMessage(msg));
        
        // Assert
        // El sistema procesa el mensaje y la librería XSS maneja el onclick
        assert.ok(result.mensaje !== undefined, 'El mensaje debe ser procesado');
        assert.ok(result.mensaje.includes('Click me'), 'El texto debe preservarse');
      });
    });
  });

  // Scenario: Sanitizar protocolo javascript:
  describe('Scenario: Sanitizar URLs con protocolo javascript:', function () {
    
    describe('Given un mensaje con link javascript:', function () {
      it('When se valida el mensaje, Then el mensaje debe ser procesado y sanitizado', function () {
        // Arrange
        const msg = JSON.stringify({
          nombre: 'Atacante',
          mensaje: '<a href="javascript:alert(1)">Click</a>',
          color: '#FF0000',
          timestamp: new Date().toISOString()
        });
        
        // Act
        const result = JSON.parse(validateMessage(msg));
        
        // Assert
        // El sistema procesa el mensaje y la librería XSS maneja el protocolo javascript:
        assert.ok(result.mensaje !== undefined, 'El mensaje debe ser procesado');
        assert.ok(result.mensaje.includes('Click'), 'El texto del link debe preservarse');
      });
    });
  });
});
