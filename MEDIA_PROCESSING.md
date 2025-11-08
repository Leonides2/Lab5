# Procesamiento de Multimedia en el Chat

## Flujo de Procesamiento de Mensajes

### 1. **Cliente envía mensaje**
```javascript
socket.emit('chat message', {
  nombre: nombreTxt,
  mensaje: mensajeTxt,  // Puede contener URLs
  color: colorHexTxt,
  timestamp: new Date().toISOString()
});
```

### 2. **Servidor recibe y procesa** (`server.js`)
```javascript
socket.on('chat message', (msgData) => {
  // 1. Validación básica
  const processedMsg = validateMessage(JSON.stringify({
    nombre: msgData.nombre || 'Anónimo',
    mensaje: String(msgData.mensaje || '').substring(0, 1000),
    color: userColor,
    timestamp: new Date().toISOString()
  }));
  
  // 2. Emitir a todos los clientes
  io.emit('chat message', JSON.parse(processedMsg));
});
```

### 3. **Validación del mensaje** (`libs/message.js`)
```javascript
function validateMessage(msg) {
  const obj = JSON.parse(msg);
  const nombre = sanitizeText(obj.nombre);  // Sanitiza el nombre
  const mensaje = obj.mensaje;
  
  // Procesa URLs en el mensaje
  const mensajeProcesado = procesarURLs(mensaje);
  
  return JSON.stringify({
    nombre,
    mensaje: mensajeProcesado,  // Contiene HTML seguro
    color,
    timestamp
  });
}
```

### 4. **Procesamiento de URLs** (`libs/url.js`)

El flujo de `procesarURLs()`:

```
Texto original → Sanitizar texto → Buscar URLs → Procesar cada URL
```

Para cada URL encontrada:

#### A. **Video de YouTube**
```javascript
if (isYouTubeUrl(url.href)) {
  const videoId = getYouTubeVideoId(url.href);
  // Genera iframe embed
  result += `<iframe src="https://www.youtube.com/embed/${videoId}" ...></iframe>`;
}
```

**Ejemplo:**
- Input: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Output: `<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" ...></iframe>`

#### B. **Imagen**
```javascript
if (is_valid_url_image(url.href)) {
  result += getImageTag(url.href);
}
```

**Genera:**
```html
<div class="media-container">
  <img src="URL_SANITIZADA" alt="Imagen compartida" 
       onerror="this.parentNode.outerHTML='<a href=...'>URL</a>'">
  <a href="URL_SANITIZADA" target="_blank">Ver imagen</a>
</div>
```

**Formatos soportados:** `.jpg`, `.gif`, `.png`, `.jpeg`, `.bmp`

#### C. **Video directo**
```javascript
if (is_valid_video_url(url.href)) {
  result += getVideoTag(url.href);
}
```

**Genera:**
```html
<div class="media-container">
  <video width="100%" controls>
    <source src="URL_SANITIZADA" type="video/mp4">
  </video>
  <a href="URL_SANITIZADA" target="_blank">Ver video original</a>
</div>
```

**Formatos soportados:** `.mp4`, `.webm`, `.ogg`, `.mov`, `.avi`, `.wmv`, `.flv`, `.mkv`

#### D. **URL normal**
```javascript
if (isSafeUrl(url.href)) {
  result += createSafeLink(url.href);
}
```

**Genera:**
```html
<a href="URL_SANITIZADA" target="_blank" rel="noopener noreferrer">URL_SANITIZADA</a>
```

### 5. **Sanitización XSS** (`libs/sanitize.js`)

Todas las URLs y contenido pasan por `sanitizeText()` que usa la librería `xss`:

```javascript
function sanitizeText(text) {
  return xss(text, xssOptions);
}
```

**Protecciones:**
- Elimina scripts maliciosos
- Valida que iframes solo sean de YouTube
- Permite solo tags HTML de la whitelist
- Filtra atributos peligrosos
- Sanitiza estilos CSS inline

### 6. **Cliente recibe y muestra** (`public/index.html`)

```javascript
socket.on('chat message', function (msg) {
  const mensaje = msgJson.mensaje;  // Ya viene procesado del servidor
  
  // Sanitización adicional en frontend (solo para <script>)
  $('#messages').append($('<li>').html(`
    <div>
      <b style="color: ${msgJson.color}">${escapeHtml(msgJson.nombre)}</b>
      <span class="message-time">${time}</span>
    </div>
    <div>${sanitizeMessage(mensaje)}</div>
  `));
});
```

## Ejemplos de Uso

### Ejemplo 1: Enviar video de YouTube
**Usuario escribe:**
```
Miren este video: https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

**Resultado en el chat:**
- Texto: "Miren este video: "
- Iframe de YouTube embebido con el video

### Ejemplo 2: Compartir imagen
**Usuario escribe:**
```
https://example.com/imagen.jpg
```

**Resultado en el chat:**
- Imagen mostrada directamente
- Link "Ver imagen" debajo

### Ejemplo 3: Video directo
**Usuario escribe:**
```
https://example.com/video.mp4
```

**Resultado en el chat:**
- Reproductor de video HTML5
- Link "Ver video original" debajo

### Ejemplo 4: Texto con múltiples URLs
**Usuario escribe:**
```
Hola! Miren esta imagen https://example.com/foto.png y este video https://www.youtube.com/watch?v=abc123
```

**Resultado en el chat:**
- "Hola! Miren esta imagen "
- [Imagen embebida]
- " y este video "
- [Video de YouTube embebido]

## Seguridad

### Protecciones Implementadas

1. **XSS Prevention:**
   - Todo el contenido pasa por sanitización XSS
   - Whitelist estricta de tags HTML
   - Validación de atributos

2. **Iframe Security:**
   - Solo iframes de YouTube permitidos
   - CSP restringe `frameSrc` a YouTube
   - Validación en backend y CSP en frontend

3. **URL Validation:**
   - Solo protocolos `http:` y `https:`
   - Validación de formatos de archivo
   - Sanitización de URLs antes de mostrar

4. **Content Security Policy:**
   - `frameSrc`: Solo YouTube
   - `mediaSrc`: Solo HTTPS
   - `imgSrc`: HTTPS y data URIs

### Lo que NO se permite

❌ Iframes de otros sitios (solo YouTube)
❌ Scripts inline en mensajes
❌ Protocolos peligrosos (`javascript:`, `data:`, `file:`)
❌ Tags HTML peligrosos (`<script>`, `<object>`, `<embed>`)
❌ Event handlers inline (`onclick`, `onerror` maliciosos)

### Lo que SÍ se permite

✅ Videos de YouTube (embed)
✅ Imágenes de URLs HTTPS
✅ Videos directos (mp4, webm, etc.)
✅ Links a sitios externos
✅ Texto formateado básico
✅ Estilos CSS seguros

## Testing

### Probar videos de YouTube
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
```

### Probar imágenes
```
https://1.bp.blogspot.com/-k6YHsdBim8A/U3Tx5GFbXYI/AAAAAAACMqQ/BMgDHUHbkZs/s1600/imagenes-gratis-para-ver-y-compartir-en-facebook-y-google+-fotos-free-photos-to-share+(16).jpg
https://miro.medium.com/v2/resize:fit:1000/1*2UBkJVqVgCIqzwuXZibRWg.jpeg
```

### Probar videos directos
```
https://www.w3schools.com/html/mov_bbb.mp4
```

### Intentar XSS (debe ser bloqueado)
```
<script>alert('XSS')</script>
<iframe src="https://evil.com"></iframe>
<img src=x onerror="alert('XSS')">
```

Todos estos intentos serán sanitizados y no ejecutarán código malicioso.
