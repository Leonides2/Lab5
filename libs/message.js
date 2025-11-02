// Validación y composición de mensajes de chat
import { sanitizeText } from './sanitize.js';
import { procesarURLs } from './url.js';

function validateMessage(msg) {
  if (!msg || typeof msg !== 'string') {
    return JSON.stringify({ error: 'Mensaje inválido' });
  }

  try {
    const obj = JSON.parse(msg);
    const nombre = sanitizeText(obj.nombre || 'Anónimo');
    const mensaje = obj.mensaje || '';
    const color = obj.color || '#000000';

    const mensajeProcesado = procesarURLs(mensaje);

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

export { validateMessage };
