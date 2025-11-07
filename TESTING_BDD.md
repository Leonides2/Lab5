# Testing BDD - Behavior-Driven Development

## ¿Qué es BDD?

**BDD (Behavior-Driven Development)** es una metodología de desarrollo que se enfoca en el **comportamiento** del sistema desde la perspectiva del usuario, en lugar de solo la implementación técnica.

## Principios BDD

### 1. **Lenguaje Ubicuo (Ubiquitous Language)**
Los tests se escriben en un lenguaje que todos entienden: desarrolladores, testers, y stakeholders.

### 2. **Estructura Given-When-Then**

```
Given (Dado):   Estado inicial / Contexto
When (Cuando):  Acción que se ejecuta
Then (Entonces): Resultado esperado
```

### 3. **Enfoque en Comportamiento**
Los tests describen **qué hace** el sistema, no **cómo lo hace**.

## Estructura de Tests BDD en este Proyecto

### Jerarquía

```
Feature (Funcionalidad)
  └─ Scenario (Escenario)
      └─ Given (Contexto)
          └─ When/Then (Acción/Resultado)
```

### Ejemplo Práctico

```javascript
// Feature: Funcionalidad general
describe('Feature: Validación de formatos de entrada', function () {
  
  // Scenario: Escenario específico
  describe('Scenario: Validar números de teléfono en formato nicaragüense', function () {
    
    // Given: Estado inicial
    describe('Given un número de teléfono válido', function () {
      
      // When/Then: Acción y resultado
      it('When se valida el formato 8297-8547, Then debería retornar true', function () {
        // Arrange (Given)
        const phoneNumber = '8297-8547';
        
        // Act (When)
        const result = is_valid_phone(phoneNumber);
        
        // Assert (Then)
        assert.strictEqual(result, true);
      });
    });
  });
});
```

## Features Implementadas

### 1. **Feature: Validación de Formatos**
- Scenario: Validar números de teléfono
- Scenario: Validar URLs de imágenes
- Scenario: Validar URLs de YouTube
- Scenario: Extraer ID de YouTube
- Scenario: Validar URLs de videos directos

### 2. **Feature: Seguridad contra XSS**
- Scenario: Bloquear scripts maliciosos
- Scenario: Permitir solo iframes de YouTube
- Scenario: Permitir tags multimedia seguros
- Scenario: Filtrar estilos CSS peligrosos

### 3. **Feature: Procesamiento de Mensajes**
- Scenario: Convertir URLs de YouTube a iframes
- Scenario: Convertir URLs de imágenes a tags img
- Scenario: Convertir URLs de videos a tags video
- Scenario: Procesar múltiples URLs
- Scenario: Sanitizar XSS en mensajes con URLs

### 4. **Feature: Validación de Mensajes Completos**
- Scenario: Procesar mensaje con YouTube
- Scenario: Procesar mensaje con imagen
- Scenario: Sanitizar nombre de usuario
- Scenario: Manejar mensaje vacío
- Scenario: Preservar texto normal

### 5. **Feature: Protección contra Ataques**
- Scenario: Bloquear iframes maliciosos
- Scenario: Bloquear event handlers
- Scenario: Bloquear protocolo javascript:

## Patrón AAA (Arrange-Act-Assert)

Cada test sigue el patrón AAA:

```javascript
it('When se valida un número válido, Then debería retornar true', function () {
  // Arrange: Preparar los datos
  const phoneNumber = '8297-8547';
  
  // Act: Ejecutar la acción
  const result = is_valid_phone(phoneNumber);
  
  // Assert: Verificar el resultado
  assert.strictEqual(result, true, 'El número válido debe ser aceptado');
});
```

## Nomenclatura de Tests

### ❌ Mal (Enfoque técnico)
```javascript
it('should return true', function () { ... });
it('test_valid_phone', function () { ... });
```

### ✅ Bien (Enfoque BDD)
```javascript
it('When se valida el formato 8297-8547, Then debería retornar true', function () { ... });
```

## Ventajas de BDD

### 1. **Documentación Viva**
Los tests sirven como documentación del comportamiento del sistema.

### 2. **Comunicación Clara**
Todos entienden qué hace el sistema sin leer el código.

### 3. **Cobertura de Casos de Uso**
Se enfoca en casos de uso reales, no solo en cobertura de código.

### 4. **Detección Temprana de Problemas**
Los tests fallan cuando el comportamiento cambia, no solo cuando el código se rompe.

### 5. **Especificación Ejecutable**
Los tests son la especificación del sistema que se puede ejecutar.

## Ejecución de Tests

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar solo tests BDD
```bash
npm test -- test/chat-app.spec.js
```

### Ejecutar con reporte detallado
```bash
npm test -- --reporter spec
```

### Ejecutar tests en modo watch
```bash
npm test -- --watch
```

## Configuración de Mocha

El archivo `.mocharc.json` configura Mocha para:

```json
{
  "spec": ["test/**/*.spec.js", "test/**/*.test.js"],
  "timeout": 5000,
  "color": true,
  "reporter": "spec",
  "recursive": true,
  "exit": true
}
```

- **spec**: Busca archivos `.spec.js` y `.test.js`
- **timeout**: 5 segundos máximo por test
- **color**: Salida con colores
- **reporter**: Formato de reporte
- **recursive**: Busca en subdirectorios
- **exit**: Termina el proceso después de los tests

## Cobertura de Tests

### Tests Actuales

| Feature | Scenarios | Tests | Estado |
|---------|-----------|-------|--------|
| Validación de Formatos | 5 | 25+ | ✅ |
| Seguridad XSS | 4 | 15+ | ✅ |
| Procesamiento de Mensajes | 5 | 10+ | ✅ |
| Validación Completa | 5 | 10+ | ✅ |
| Protección contra Ataques | 3 | 6+ | ✅ |
| **TOTAL** | **22** | **66+** | **✅** |

## Integración con CI/CD

### GitHub Actions

El pipeline ejecuta los tests automáticamente:

```yaml
- name: Run tests
  run: npm test
```

Los tests deben pasar para que el pipeline continúe al siguiente paso.

### Criterios de Éxito

Para que el pipeline pase:
1. ✅ Todos los tests deben pasar (exit code 0)
2. ✅ No debe haber errores de sintaxis
3. ✅ El tiempo de ejecución debe ser < 5 segundos por test

## Mejores Prácticas

### 1. **Nombres Descriptivos**
```javascript
// ❌ Mal
it('test 1', function () { ... });

// ✅ Bien
it('When se valida un número válido, Then debería retornar true', function () { ... });
```

### 2. **Un Assert por Test**
```javascript
// ❌ Mal
it('should validate phone', function () {
  assert.strictEqual(is_valid_phone('8297-8547'), true);
  assert.strictEqual(is_valid_phone('invalid'), false);
});

// ✅ Bien
it('When se valida un número válido, Then debería retornar true', function () {
  assert.strictEqual(is_valid_phone('8297-8547'), true);
});

it('When se valida un número inválido, Then debería retornar false', function () {
  assert.strictEqual(is_valid_phone('invalid'), false);
});
```

### 3. **Tests Independientes**
Cada test debe poder ejecutarse independientemente.

```javascript
// ✅ Bien - Usa beforeEach para estado compartido
beforeEach(function () {
  testMessage = {
    timestamp: new Date().toISOString()
  };
});
```

### 4. **Mensajes de Error Claros**
```javascript
// ❌ Mal
assert.strictEqual(result, true);

// ✅ Bien
assert.strictEqual(result, true, 'El número de teléfono válido debe ser aceptado');
```

### 5. **Datos de Test Realistas**
```javascript
// ✅ Bien - Usa datos reales
const validImageUrls = [
  { url: 'http://example.com/image.jpg', format: 'JPG' },
  { url: 'https://example.com/image.png', format: 'PNG' }
];
```

## Ejemplo Completo de BDD

```javascript
describe('Feature: Validación de mensajes del chat', function () {
  
  describe('Scenario: Procesar mensaje con video de YouTube', function () {
    
    describe('Given un mensaje válido con URL de YouTube', function () {
      
      it('When se valida el mensaje, Then debería procesarse con iframe', function () {
        // Arrange (Given)
        const msg = JSON.stringify({
          nombre: 'Usuario',
          mensaje: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          color: '#FF0000',
          timestamp: new Date().toISOString()
        });
        
        // Act (When)
        const result = JSON.parse(validateMessage(msg));
        
        // Assert (Then)
        assert.strictEqual(result.nombre, 'Usuario');
        assert.ok(result.mensaje.includes('iframe'));
        assert.ok(result.mensaje.includes('youtube'));
      });
    });
  });
});
```

## Lectura de Resultados

### Salida de Tests

```
Feature: Validación de formatos de entrada
  Scenario: Validar números de teléfono en formato nicaragüense
    Given un número de teléfono válido
      ✓ When se valida el formato 8297-8547, Then debería retornar true
    Given un número de teléfono con caracteres inválidos
      ✓ When se valida el formato 8297p-8547, Then debería retornar false

  66 passing (95ms)
```

### Interpretación

- ✅ **Verde**: Test pasó
- ❌ **Rojo**: Test falló
- ⏱️ **Tiempo**: Tiempo de ejecución

## Mantenimiento de Tests

### Cuando Agregar Tests

1. **Nueva funcionalidad**: Escribir tests antes (TDD)
2. **Bug encontrado**: Escribir test que reproduzca el bug
3. **Refactoring**: Asegurar que los tests sigan pasando

### Cuando Actualizar Tests

1. **Cambio de comportamiento**: Actualizar el test correspondiente
2. **Cambio de API**: Actualizar los tests afectados
3. **Nuevos casos de uso**: Agregar nuevos scenarios

## Recursos Adicionales

- [Mocha Documentation](https://mochajs.org/)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)
- [Given-When-Then](https://martinfowler.com/bliki/GivenWhenThen.html)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## Conclusión

Los tests BDD en este proyecto:
- ✅ Siguen la estructura Given-When-Then
- ✅ Usan lenguaje natural y descriptivo
- ✅ Cubren casos de uso reales
- ✅ Sirven como documentación
- ✅ Se integran con CI/CD
- ✅ Son mantenibles y escalables
