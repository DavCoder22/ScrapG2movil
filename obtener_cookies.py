# Script para obtener cookies de Instagram automaticamente
# Solo funciona si estas logueado en Instagram

import json
import os
import sys

# Intentar usar la extension o metodo manual

print("=" * 60)
print("COMO OBTENER COOKIES DE INSTAGRAM")
print("=" * 60)

print("""
OPCION 1 - Facil:
1. Abre Instagram en Microsoft Edge o Brave
2. Asegurate de estar logueado
3. Presiona F12 para abrir Developer Tools
4. Ve a la pestaña Application (Edge) o Storage (Firefox)
5. Busca "Cookies" -> "instagram.com"
6. Copia los valores de:
   - sessionid
   - ds_user_id
   - csrftoken
7. Pegalos en el archivo cookies/session_cookies.json

OPCION 2 - Con extension:
1. Instala "Cookie-Editor" en tu navegador
2. Abre instagram.com (logueado)
3. Haz clic en la extension
4. Busca "sessionid", "ds_user_id", "csrftoken"
5. Copia sus valores

Archivos necesarios:
- instagram_scraper/cookies/session_cookies.json
""")

# Mostrar archivo actual de cookies
COOKIES_FILE = 'cookies/session_cookies.json'

if os.path.exists(COOKIES_FILE):
    print(f"\nContenido actual de {COOKIES_FILE}:")
    print("-" * 40)
    with open(COOKIES_FILE, 'r') as f:
        print(f.read())
    
    # Verificar si estan vacias
    with open(COOKIES_FILE, 'r') as f:
        cookies = json.load(f)
    
    vacias = []
    for c in cookies:
        if not c.get('value'):
            vacias.append(c['name'])
    
    if vacias:
        print("\n✗ Cookies VACIAS:")
        for v in vacias:
            print(f"   - {v}")
        print("\nNECESITAS PONER LOS VALORES REALES")
    else:
        print("\n✓ Cookies configuradas")

print("\n" + "=" * 60)