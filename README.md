# Instagram Scraper - Documentación Técnica

**Proyecto Académico - Dispositivos Móviles Grupo 2**

---

## 1. Objetivo del Proyecto

Desarrollar una herramienta de web scraping para extraer datos públicos de perfiles de Instagram, implementando técnicas de anonimización mediante Tor y detección evasión con Puppeteer.

### Objetivos Específicos
- Extraer datos de perfiles públicos (seguidores, posts, bio)
- Extraer metadata de publicaciones
- Implementar navegación anónima via proxy Tor
- Evadir detección de automatización
- Gestion autenticación mediante cookies

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN               │
├─────────────────────────────────────────────────────────────┤
│  run.bat        │  login.bat     │  run-tor.bat   │
│  (UI CLI)     │  (Auth CLI)   │  (Tor CLI)   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA APLICACIÓN                    │
├─────────────────────────────────────────────────────────────┤
│  src/index.js    │  src/login.js                      │
│  (Scraper)    │  (Autenticación)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA SERVICIOS                     │
├─────────────────────────────────────────────────────────────┤
│  puppeteer.js  │  instagram.js │  cookies.js  │ login.js │
│  (Navegador)  │ (Scraping)   │ (Sesión)   │(Login)  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DATOS                     │
├─────────────────────────────────────────────────────────────┤
│  data/          │  output/     │  screenshots/          │
│  (Cookies)      │  (JSON)     │  (Evidencia)        │
└──────────────────────────────────────────────────��──────────┘
```

---

## 3. Componentes Principales

### 3.1 Puppeteer (Navegador Automation)

**¿Qué es?**
- Librería de Node.js que proporciona API de alto nivel para controlar Chrome/Chromium
- Permite automatizar tareas del navegador

**Función en el proyecto:**
- Controlar el navegador para navegar a Instagram
- Extraer contenido dinámico (JavaScript-rendered)
- Capturar screenshots
- Manejar cookies

```javascript
// src/services/puppeteer.js
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export default puppeteer;
```

### 3.2 Tor (Anonimización)

**¿Qué es?**
- Red de anonimidad que oculta la IP real del usuario
- Enruta el tráfico a través de múltiples nodos

**Función en el proyecto:**
- Ocultar la IP de origen
- Evitar bloqueos por IP
- Simular acceso desde diferentes ubicaciones

```
Usuario → Tor Proxy (9050) → Nodos Tor → Internet
```

```javascript
// Configuración en src/config/index.js
proxy: {
  enabled: false,
  host: '127.0.0.1',
  port: 9050,
  type: 'socks5'
}
```

### 3.3 Stealth Mode (Evasión de Detección)

**¿Qué hace?**
- Oculta que el navegador está automatizado
- Modifica propiedades del navigator.webdriver
- Simula comportamientos humanos

```javascript
// Anti-detección
await page.evaluateOnNewDocument(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
  window.chrome = { runtime: {} };
});
```

---

## 4. Estructura de Archivos

```
instagram-scraper/
│
├── 📄 package.json            # Dependencias del proyecto
│
├── 📄 README.md             # Documentación
│
├── 📄 .gitignore           # Archivos ignorados
│
├── 📄 run.bat             # Ejecutor rápido (sin Tor)
├── 📄 run-tor.bat        # Ejecutor con Tor
├── 📄 login.bat          # Guardar cookies de sesión
│
└── 📁 src/                     # Código fuente
    │
    ├── 📄 index.js           # Punto de entrada principal
    ├── 📄 login.js         # CLI de autenticación
    │
    ├── 📁 config/
    │   └── 📄 index.js   # Configuración global
    │
    └── 📁 services/
        │
        ├── 📄 puppeteer.js    # Setup del navegador + stealth
        ├── 📄 instagram.js  # Lógica de scraping
        ├── 📄 cookies.js   # Gestor de cookies
        └── 📄 login.js    # Flujo de login
```

---

## 5. Dependencias (package.json)

| Paquete | Función |
|---------|---------|
| `puppeteer` | Control del navegador Chrome |
| `puppeteer-extra` | Puppeteer con plugins |
| `puppeteer-extra-plugin-stealth` | Modo sigiloso |
| `puppeteer-extra-plugin-user-preferences` | Personalización |
| `csv-writer` | Exportación a CSV |

```json
{
  "dependencies": {
    "puppeteer": "^21.0.0",
    "puppeteer-extra": "^3.3.6",
    "puppeteer-extra-plugin-stealth": "^2.11.2",
    "puppeteer-extra-plugin-user-preferences": "^2.4.1",
    "csv-writer": "^1.6.0"
  }
}
```

---

## 6. Flujo de Recolección de Datos

```
┌──────────────┐
│ 1. INPUT   │
│ (Usuario)  │
└─────┬──────┘
      │
      ▼
┌──────────────┐
│2. VERIFICAR│
│Node.js    │
└─────┬──────┘
      │
      ▼
┌──────────────┐
│3. SESSION │
│(Cookies)  │
└─────┬──────┘
      │
      ▼
┌──────────────┐
│4. NAVEGAR │
│(Puppeteer)│
└─────┬──────┘
      │
      ▼
┌──────────────┐
│5. EXTRAER │
│(Instagram)│
└─────┬──────┘
      │
      ▼
┌──────────────┐
│6. GUARDAR │
│(JSON/CSV) │
└──────────────┘
```

### Detalle del Flujo

1. **Usuario**: Args (username, flags --tor, --no-cookies)
2. **Verificar Node.js**: dependency check
3. **Session**: Cargar cookies de `data/cookies.json`
4. **Navegar**: Puppeteer launch → page.goto()
5. **Extraer**: Page.evaluate() → DOM parsing
6. **Guardar**: fs.writeFile() + csv-writer

---

## 7. Datos Extraídos

### Perfil (JSON)
```json
{
  "profile": {
    "username": "natgeo",
    "fullName": "National Geographic",
    "biography": "...",
    "followers": 278000000,
    "postsCount": 27500,
    "isVerified": true,
    "isPrivate": false
  },
  "posts": [
    {
      "shortcode": "CxK9aL...",
      "likes": 1250000,
      "comments": 45000,
      "timestamp": "2026-04-22",
      "location": "Serengeti"
    }
  ]
}
```

### Posts (CSV)
| shortcode | url | likes | comments | date | video |
|----------|-----|-------|---------|------|-------|
| CxK9aL... | instagram.com/p/... | 1250000 | 45000 | 2026-04-22 | Yes |

---

## 8. Configuración (src/config/index.js)

```javascript
export default {
  // Instagram
  instagram: {
    baseUrl: 'https://www.instagram.com',
    timeout: 60000,        // 60s timeout
    scrollDelay: 3000,     // 3s entre scrolls
    maxScrolls: 3
  },
  
  // Proxy Tor
  proxy: {
    enabled: false,
    host: '127.0.0.1',
    port: 9050,
    type: 'socks5'
  },
  
  // Navegador
  browser: {
    headless: false,
    slowMo: 150,
    viewport: { width: 1920, height: 1080 }
  }
};
```

---

## 9. Uso de Comandos

| Comando | Función |
|---------|--------|
| `run.bat natgeo` | Scraping directo |
| `run-tor.bat natgeo` | Scraping con Tor |
| `login.bat` | Guardar cookies |
| `node src/index.js --tor user` | Con Tor CLI |
| `npm run login` | Login CLI |

---

## 10. Consideraciones Éticas

- **Perfiles públicos únicamente**
- Respetar Términos de Servicio
- No usar para spam o abuso
- Rate limiting implementado
- Para fines educativos

---

## 11. Próximas Mejoras

- [ ] Autenticación 2FA
- [ ] Rate limiting adaptativo
- [ ] Retry automático
- [ ] Más campos de extracción
- [ ] Tests unitarios
- [ ] Docker compose completo

---

**Licencia:** MIT  
**Curso:** Dispositivos Móviles - Grupo 2