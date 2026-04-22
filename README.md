# Instagram Scraper

**Proyecto académico - Dispositivos Móviles Grupo 2**

Herramienta de scraping para perfiles públicos de Instagram usando Puppeteer con técnicas stealth.

## Características

- Extracción de datos de perfiles (seguidores, posts, bio, verificación)
- Extracción de posts (likes, comentarios, timestamps, ubicación)
- Exportación a JSON y CSV
- Modo stealth para evitar detección
- Autenticación con cookies de sesión
- Soporte opcional para Tor proxy
- Configuración personalizable

## Requisitos

- Node.js 18+
- Docker (opcional para Tor)

## Instalación

```bash
npm install
```

## Uso Rápido

### 1. Guardar cookies de sesión (recomendado)

```bash
npm run login
# o
login.bat
```

Ingresa tu usuario y contraseña de Instagram. Las cookies se guardan automáticamente.

### 2. Scrapear un perfil

```bash
npm start natgeo
# o
run.bat natgeo
```

### 3. Con Tor Proxy (opcional)

```bash
# Iniciar Tor primero
docker run -d --name tor_proxy -p 9050:9050 dperson/torproxy

# Luego ejecutar
npm run start:tor natgeo
# o
run-tor.bat natgeo
```

## Estructura del Proyecto

```
instagram-scraper/
├── src/
│   ├── index.js           # Punto de entrada principal
│   ├── login.js        # CLI para guardar cookies
│   ├── config/
│   │   └── index.js  # Configuración
│   └── services/
│       ├── puppeteer.js   # Setup de Puppeteer
│       ├── instagram.js # Scraping de Instagram
│       ├── cookies.js  # Gestor de cookies
│       └── login.js   # Flujo de login
├── data/              # Datos extraídos
├── screenshots/       # Capturas
├── run.bat          # Ejecutor rápido
├── run-tor.bat    # Ejecutor con Tor
├── login.bat      # Guardar cookies
└── package.json
```

## Configuración

Edita `src/config/index.js`:

```javascript
export default {
  instagram: {
    baseUrl: 'https://www.instagram.com',
    timeout: 60000,
    scrollDelay: 3000,
    maxScrolls: 3
  },
  browser: {
    headless: false,
    slowMo: 150,
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0...'
  }
};
```

## Cookies de Sesión

Para perfil privados o evitar limitaciones:

1. Ejecuta `login.bat`
2. Ingresa tus credenciales
3. Completa 2FA si es necesario
4. Las cookies se guardan en `data/cookies.json`

## Datos Extraídos

Los datos se guardan en `data/`:

- `{username}_data.json` - Perfil completo
- `{username}_posts.csv` - Posts en CSV

## Advertencia

Este proyecto es para **fines educativos**. Respeta los Términos de Servicio de Instagram y úsalo responsablemente.

## Licencia

MIT