# Instagram Scraper

Scraper de Instagram usando Playwright para extraer datos de perfiles y publicaciones.

## Características

- Login automático (abre navegador para iniciar sesión)
- Extracción de datos del perfil (seguidores, siguiendo, posts)
- Extracción de las últimas 10 publicaciones
- Extrae de cada publicación: likes, título, comentarios (hasta 5)
- Guarda resultados en formato JSON

## Instalación

```bash
pip install playwright
playwright install chromium
```

## Uso

```bash
python instagram_scraper.py usuario
```

Ejemplo:
```bash
python instagram_scraper.py natgeo
```

O usando el batch:
```bash
run_scraper.bat
```

## Estructura de salida

```json
{
  "username": "natgeo",
  "seguidores": "274M",
  "siguiendo": "193",
  "num_posts": "31,589",
  "publicaciones": [
    {
      "numero": 1,
      "link": "https://www.instagram.com/natgeo/reel/...",
      "titulo": "and 5 others",
      "likes": "39",
      "comentarios": [
        {"autor": "StanleyTucci", "texto": "returns for a second..."},
        {"autor": "DisneyPlus", "texto": "and @hulu."}
      ]
    }
  ]
}
```

## Archivos

- `instagram_scraper.py` - Scraper principal
- `run_scraper.bat` - Ejecutar con doble clic
- `cookies/` - Cookies guardadas
- `output/` - Resultados JSON

## Requisitos

- Python 3.8+
- Playwright
- Navegador Chrome/Chromium

---

## Actualizaciones

### v2.0.0 (27/04/2026)
- Login automático integrado con el scrape
- Extracción de 10 últimas publicaciones
- Extrae likes de cada publicación
- Extrae título/caption de cada post
- Extrae hasta 5 comentarios por publicación (autor + texto)
- Evita detección de bot
- Scroll automático para cargar más publicaciones
- Guardado automático en JSON

### v1.0.0
- Versión inicial con Playwright
- Extracción básica de perfil
- Extracción de links de posts