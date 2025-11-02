import { 
  is_valid_phone, 
  is_valid_url_image, 
  is_valid_yt_video, 
  is_valid_video_url,
  getYouTubeVideoId, 
  sanitizeText, 
  validateMessage } from '../libs/unalib.js';
import assert from 'assert';
import { describe, it } from 'mocha';

describe('unalib', function () {
  // Pruebas de validación de teléfono
  describe('funcion is_valid_phone', function () {
    it('deberia devolver true para 8297-8547', function () {
      assert.strictEqual(is_valid_phone('8297-8547'), true);
    });

    it('deberia devolver false para 8297p-8547', function () {
      assert.strictEqual(is_valid_phone('8297p-8547'), false);
    });
  });

  // Pruebas de validación de URLs de imágenes
  describe('funcion is_valid_url_image', function () {
    const validImageUrls = [
      'http://example.com/image.jpg',
      'https://example.com/image.png',
      'https://sub.domain.com/path/to/image.gif',
      'https://example.com/image.JPEG'
    ];

    const invalidImageUrls = [
      'https://example.com/not_an_image.txt',
      'ftp://example.com/image.jpg',
      'javascript:alert(1)',
      'https://example.com/image.webp?width=200&height=200',
    ];

    validImageUrls.forEach(url => {
      it(`deberia devolver true para ${url}`, function () {
        assert.strictEqual(is_valid_url_image(url), true);
      });
    });

    invalidImageUrls.forEach(url => {
      it(`deberia devolver false para ${url}`, function () {
        assert.strictEqual(is_valid_url_image(url), false);
      });
    });
  });

  // Pruebas de validación de URLs de YouTube
  describe('funcion is_valid_yt_video', function () {
    const validYoutubeUrls = [
      'https://www.youtube.com/watch?v=qYwlqx-JLok',
      'http://youtube.com/watch?v=qYwlqx-JLok',
      'https://youtu.be/qYwlqx-JLok'
    ];

    const invalidYoutubeUrls = [
      'https://www.vimeo.com/12345678',
      'https://example.com/video.mp4',
      'javascript:alert(1)',
      'https://youtube.com.evil.com/watch?v=qYwlqx-JLok',
      ''
    ];

    validYoutubeUrls.forEach(url => {
      it(`deberia devolver true para ${url}`, function () {
        assert.strictEqual(is_valid_yt_video(url), true);
      });
    });

    invalidYoutubeUrls.forEach(url => {
      it(`deberia devolver false para ${url}`, function () {
        assert.strictEqual(is_valid_yt_video(url), false);
      });
    });
  });

  // Pruebas de extracción de ID de YouTube
  describe('funcion getYouTubeVideoId', function () {
    const testCases = [
      {
        url: 'https://www.youtube.com/watch?v=qYwlqx-JLok',
        expected: 'qYwlqx-JLok'
      },
      {
        url: 'http://youtu.be/qYwlqx-JLok',
        expected: 'qYwlqx-JLok'
      },
      {
        url: 'invalid-url',
        expected: null
      }
    ];

    testCases.forEach(({ url, expected }) => {
      it(`deberia extraer correctamente el ID de ${url}`, function () {
        assert.strictEqual(getYouTubeVideoId(url), expected);
      });
    });
  });

  // Pruebas de prevención de inyección XSS
  describe('Prevención de inyección XSS', function () {
    it('deberia escapar HTML en mensajes de texto', function () {
      const input = '<script>alert(1)</script>';
      const result = sanitizeText(input);
      // La implementación actual usa la librería xss que puede tener un formato diferente
      assert.ok(!result.includes('<script>'));
    });

    it('deberia escapar atributos HTML', function () {
      const input = '<img src="x" onerror="alert(1)">';
      const result = sanitizeText(input);
      // Verificar que se haya escapado el HTML
      assert.ok(!result.includes('onerror'));
    });

    it('deberia permitir texto plano', function () {
      const input = 'Texto normal sin HTML';
      const result = sanitizeText(input);
      assert.strictEqual(result, input);
    });
  });

  // Pruebas de validación de URLs de video
  describe('Validación de URLs de video', function () {
    const validVideoUrls = [
      'https://example.com/video.mp4',
      'http://example.com/video.webm',
      'https://example.com/video.mov',
      'https://example.com/video.avi?t=123'
    ];

    const invalidVideoUrls = [
      'https://example.com/video.txt',
      'javascript:alert(1)',
      'https://example.com/video.ogv',
    ];

    validVideoUrls.forEach(url => {
      it(`deberia aceptar la URL de video: ${url}`, function () {
        assert.strictEqual(is_valid_video_url(url), true);
      });
    });

    invalidVideoUrls.forEach(url => {
      it(`deberia rechazar la URL de video: ${url}`, function () {
        assert.strictEqual(is_valid_video_url(url), false);
      });
    });
  });

  // Pruebas de procesamiento de mensajes
  describe('Procesamiento de mensajes', function () {
    it('deberia procesar correctamente un mensaje con URL de imagen', function () {
      const msg = JSON.stringify({
        nombre: 'Test',
        mensaje: 'Mira esta imagen: https://example.com/image.jpg',
        color: '#123456'
      });
      const result = validateMessage(msg);
      assert.ok(result.includes('image.jpg'));
    });

    it('deberia procesar correctamente un mensaje con URL de YouTube', function () {
      const msg = JSON.stringify({
        nombre: 'Test',
        mensaje: 'Mira este video: https://youtube.com/watch?v=qYwlqx-JLok',
        color: '#123456'
      });
      const result = validateMessage(msg);
      assert.ok(result.includes('youtube.com/embed/qYwlqx-JLok'));
    });

    it('deberia manejar HTML en mensajes de texto', function () {
      const msg = JSON.stringify({
        nombre: 'Test',
        mensaje: '<script>alert(1)</script>',
        color: '#123456'
      });
      const result = JSON.parse(validateMessage(msg));
      // Verificar que el mensaje se haya procesado correctamente
      assert.strictEqual(result.nombre, 'Test');
      // El mensaje con HTML debería ser manejado por el cliente
      assert.strictEqual(result.mensaje, '<script>alert(1)</script>');
    });
  });
});
