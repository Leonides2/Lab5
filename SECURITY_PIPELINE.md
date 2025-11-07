# Pipeline de Seguridad - CI/CD

## 📊 Flujo Completo del Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    PUSH A MAIN (Trigger)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  1. Express.js Docker Build & Push (docker-image.yml)           │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Checkout código                                              │
│  ✅ Configurar Node.js 20                                        │
│  ✅ Generar package-lock.json                                    │
│  ✅ Revisar linter (npm run lint)                                │
│  ✅ Ejecutar pruebas (npm run test) ← TESTS BDD                 │
│  ✅ SAST con Snyk (vulnerabilidades de dependencias)            │
│  ✅ Construir imagen Docker                                      │
│  ✅ Push a Docker Hub (latest + SHA)                             │
│  ✅ Trigger → container-security-scan                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. Container Security Scan (container-security.yml)            │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Pull imagen desde Docker Hub                                 │
│  ✅ Trivy: Escaneo de vulnerabilidades en imagen                │
│     - Severidad: CRITICAL, HIGH                                 │
│     - Tipos: OS, Library                                        │
│     - Exit code 1 si encuentra vulnerabilidades                 │
│  ✅ Upload resultados a GitHub Security tab (SARIF)             │
│  ✅ Trigger → deploy_azure_container (solo si pasa)             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. Despliegue a Azure Container App (deploy-image.yaml)        │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Azure Login                                                  │
│  ✅ Deploy a Azure Container App                                │
│     - Resource Group: UNA-CHAT                                  │
│     - Container App: una-chat-app                               │
│     - Imagen: lab5:latest                                       │
│     - Variables de entorno (secrets)                            │
│  ✅ Trigger → nuclei                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. Security Scan - Nuclei (nuclei.yaml) ⭐                     │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Escaneo de vulnerabilidades en producción                    │
│     - Target: BASE_URL (app desplegada)                         │
│     - Severidad: critical, high, medium, low                    │
│     - Stats: Estadísticas del escaneo                           │
│  ✅ Crear issues en GitHub por cada vulnerabilidad              │
│     - Título: Nombre de la vulnerabilidad                       │
│     - Descripción: Detalles técnicos                            │
│     - Labels: Severidad (critical, high, etc.)                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔒 Capas de Seguridad

### 1. **SAST (Static Application Security Testing)**
**Herramienta:** Snyk  
**Workflow:** `docker-image.yml`  
**Qué escanea:** Vulnerabilidades en dependencias de npm

**Ejemplo de detección:**
```
❌ Vulnerabilidad encontrada: express@4.17.1
   Severidad: HIGH
   CVE: CVE-2022-24999
   Fix: Actualizar a express@4.17.3
```

**Acción:** Falla el workflow si encuentra vulnerabilidades HIGH/CRITICAL

---

### 2. **Container Security Scan**
**Herramienta:** Trivy  
**Workflow:** `container-security.yml`  
**Qué escanea:** Vulnerabilidades en la imagen Docker (OS + librerías)

**Ejemplo de detección:**
```
❌ Vulnerabilidad encontrada en imagen
   Package: openssl
   Severidad: CRITICAL
   CVE: CVE-2023-12345
   Fix: Actualizar imagen base
```

**Acción:** 
- Falla el workflow si encuentra CRITICAL/HIGH
- Sube resultados a GitHub Security tab (SARIF)
- Solo despliega si el escaneo pasa

---

### 3. **DAST (Dynamic Application Security Testing)**
**Herramienta:** Nuclei  
**Workflow:** `nuclei.yaml`  
**Qué escanea:** Vulnerabilidades en la aplicación desplegada (producción)

**Ejemplo de detección:**
```
❌ SQL Injection detectado
   URL: https://tu-app.com/login
   Severidad: CRITICAL
   Template: sql-injection.yaml
   Payload: ' OR 1=1--
```

**Acción:**
- Crea issues en GitHub automáticamente
- No detiene el despliegue (ya está en producción)
- Permite monitoreo continuo

---

## 🎯 Tipos de Vulnerabilidades Detectadas

### Snyk (SAST)
- ✅ Dependencias desactualizadas
- ✅ CVEs conocidos en paquetes npm
- ✅ Licencias incompatibles
- ✅ Vulnerabilidades en dependencias transitivas

### Trivy (Container Scan)
- ✅ Vulnerabilidades en imagen base (Alpine, Ubuntu, etc.)
- ✅ Vulnerabilidades en paquetes del sistema operativo
- ✅ Vulnerabilidades en librerías instaladas
- ✅ Configuraciones inseguras

### Nuclei (DAST)
- ✅ SQL Injection
- ✅ XSS (Cross-Site Scripting)
- ✅ CSRF (Cross-Site Request Forgery)
- ✅ Path Traversal
- ✅ Command Injection
- ✅ SSRF (Server-Side Request Forgery)
- ✅ Configuraciones inseguras (headers, CORS, etc.)
- ✅ Exposición de información sensible
- ✅ Autenticación débil
- ✅ Vulnerabilidades conocidas (CVEs)

---

## 📋 Configuración de Secrets

### Secrets Requeridos en GitHub

```bash
# Docker Hub
DOCKER_USERNAME=tu_usuario
DOCKER_PASSWORD=tu_token_o_password

# Snyk
SNYK_TOKEN=tu_token_de_snyk

# Azure
AZURE_CREDENTIALS={"clientId":"...","clientSecret":"...","subscriptionId":"...","tenantId":"..."}

# Aplicación
BASE_URL=https://una-chat-app.bluepebble-d90e530f.westus2.azurecontainerapps.io
JWT_SECRET=tu_secret_jwt
CLIENT_ID=tu_auth0_client_id
ISSUER_BASE_URL=https://tu-tenant.auth0.com
ALLOWED_ORIGINS=https://una-chat-app.bluepebble-d90e530f.westus2.azurecontainerapps.io

# GitHub (automático)
GITHUB_TOKEN=ghp_... (generado automáticamente)
```

---

## 🚨 Manejo de Vulnerabilidades

### Workflow 1: docker-image.yml
**Si falla Snyk:**
```
1. El workflow se detiene
2. No se construye la imagen Docker
3. No se despliega nada
4. Revisar logs de Snyk en Actions
5. Actualizar dependencias vulnerables
6. Hacer nuevo commit
```

### Workflow 2: container-security.yml
**Si falla Trivy:**
```
1. El workflow se detiene
2. No se despliega a Azure
3. Resultados disponibles en Security tab
4. Revisar vulnerabilidades en SARIF
5. Actualizar imagen base o paquetes
6. Hacer nuevo commit
```

### Workflow 3: nuclei.yaml
**Si encuentra vulnerabilidades:**
```
1. El workflow NO falla (ya está en producción)
2. Se crean issues automáticamente en GitHub
3. Cada issue contiene:
   - Título: Nombre de la vulnerabilidad
   - Descripción: Detalles técnicos
   - Label: Severidad (critical, high, medium, low)
   - URL afectada
   - Información de remediación
4. Revisar issues y priorizar por severidad
5. Aplicar fixes y hacer nuevo deploy
```

---

## 📊 Ejemplo de Issue Creado por Nuclei

```markdown
Título: [critical] SQL Injection in /api/users endpoint

Labels: critical, security, nuclei

Descripción:
**Vulnerability:** SQL Injection
**Severity:** CRITICAL
**Template:** sql-injection.yaml
**URL:** https://una-chat-app.bluepebble-d90e530f.westus2.azurecontainerapps.io/api/users
**Method:** POST
**Payload:** ' OR 1=1--

**Description:**
SQL Injection vulnerability detected in the /api/users endpoint. 
The application does not properly sanitize user input, allowing 
attackers to inject malicious SQL queries.

**Impact:**
- Unauthorized data access
- Data manipulation
- Potential database compromise

**Remediation:**
1. Use parameterized queries (prepared statements)
2. Implement input validation
3. Use ORM with proper escaping
4. Apply principle of least privilege to database user

**References:**
- OWASP: https://owasp.org/www-community/attacks/SQL_Injection
- CWE-89: https://cwe.mitre.org/data/definitions/89.html
```

---

## 🔍 Verificación del Pipeline

### Ver resultados de Snyk
```
GitHub → Actions → Express.js Docker Build & Push → 
Ejecutar Análisis de Seguridad (SAST) con Snyk
```

### Ver resultados de Trivy
```
GitHub → Security → Code scanning → 
Filtrar por "container-scan"
```

### Ver resultados de Nuclei
```
GitHub → Issues → 
Filtrar por label "nuclei" o "security"
```

---

## 📈 Métricas de Seguridad

### Antes del Pipeline
- ❌ Sin escaneo de dependencias
- ❌ Sin escaneo de imágenes
- ❌ Sin escaneo en producción
- ❌ Vulnerabilidades desconocidas

### Después del Pipeline
- ✅ Escaneo automático en cada commit
- ✅ 3 capas de seguridad (SAST, Container, DAST)
- ✅ Detección temprana de vulnerabilidades
- ✅ Prevención de despliegues inseguros
- ✅ Monitoreo continuo en producción
- ✅ Issues automáticos para tracking

---

## 🛠️ Troubleshooting

### Problema: Snyk falla con "No se encontró SNYK_TOKEN"
**Solución:**
1. Ve a https://snyk.io/
2. Genera un token de API
3. Agrégalo como secret en GitHub: `SNYK_TOKEN`

### Problema: Trivy falla con "exit code 1"
**Solución:**
1. Revisa los resultados en Security tab
2. Identifica las vulnerabilidades CRITICAL/HIGH
3. Actualiza la imagen base en Dockerfile
4. O actualiza los paquetes vulnerables

### Problema: Nuclei no crea issues
**Solución:**
1. Verifica que `github-report: true` esté configurado
2. Verifica que el token tenga permisos de escritura:
   - Settings → Actions → General → Workflow permissions
   - Selecciona "Read and write permissions"

### Problema: El workflow no se dispara automáticamente
**Solución:**
1. Verifica que el workflow anterior tenga el trigger correcto
2. Verifica que el `event-type` coincida
3. Verifica los permisos del token

---

## 🎓 Mejores Prácticas

### 1. **Actualizar regularmente**
```bash
# Actualizar dependencias
npm update
npm audit fix

# Actualizar imagen base
FROM node:20-alpine  # Usar versión específica
```

### 2. **Monitorear issues de Nuclei**
- Revisar issues semanalmente
- Priorizar por severidad
- Cerrar issues después de aplicar fix

### 3. **Revisar Security tab**
- Verificar resultados de Trivy
- Mantener 0 vulnerabilidades CRITICAL/HIGH

### 4. **Documentar fixes**
- Agregar comentarios en issues
- Documentar cambios en CHANGELOG.md

---

## 📚 Referencias

- [Snyk Documentation](https://docs.snyk.io/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Nuclei Documentation](https://nuclei.projectdiscovery.io/)
- [GitHub Security](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## ✅ Checklist de Seguridad

- [x] SAST implementado (Snyk)
- [x] Container scan implementado (Trivy)
- [x] DAST implementado (Nuclei)
- [x] Tests unitarios (BDD)
- [x] Linter configurado
- [x] Secrets configurados
- [x] Pipeline encadenado
- [x] Issues automáticos
- [x] Security tab habilitado
- [x] Documentación completa
