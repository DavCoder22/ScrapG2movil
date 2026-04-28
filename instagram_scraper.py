from playwright.sync_api import sync_playwright
import json
import os
import sys
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIES_FILE = os.path.join(BASE_DIR, 'cookies', 'session_cookies.json')
OUTPUT_DIR = os.path.join(BASE_DIR, 'output')

os.makedirs('cookies', exist_ok=True)
os.makedirs('output', exist_ok=True)


def extraer_datos_pagina(page):
    data = {
        'likes': '',
        'titulo': '',
        'comentarios': []
    }
    
    page_text = page.inner_text('body')
    
    likes_match = re.search(r'([\d,.]+[KMB]?)\s*(?:likes|me gusta)', page_text, re.I)
    if likes_match:
        data['likes'] = likes_match.group(1)
    
    lines = page_text.split('\n')
    for line in lines:
        line = line.strip()
        if line and 10 < len(line) < 200:
            if 'like' not in line.lower() and 'reply' not in line.lower():
                if not line.replace(',','').replace('.','').isdigit():
                    data['titulo'] = line[:200]
                    break
    
    comentario_match = re.findall(r'@(\w+)\s+([^\n]+)', page_text)
    comentarios = []
    for autor, texto in comentario_match[:5]:
        if texto and len(texto.strip()) > 0:
            comentarios.append({
                'autor': autor,
                'texto': texto.strip()[:100]
            })
    data['comentarios'] = comentarios
    
    return data


def login_y_scrape(username):
    print("\n=== INICIANDO SESION ===")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            args=['--disable-blink-features=AutomationControlled']
        )
        
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
        )
        
        page = context.new_page()
        page.goto('https://www.instagram.com/')
        
        print("\n1. Inicia sesion en Instagram")
        print("2. Esperando...")
        
        page.wait_for_timeout(25000)
        
        url = page.url
        if 'login' in url.lower():
            print("Error: No se inicio sesion.")
            browser.close()
            return
        
        print("Sesion iniciada!")
        
        cookies = page.context.cookies()
        needed = ['sessionid', 'ds_user_id', 'csrftoken', 'ig_did', 'mid']
        filtered = [{'name': c['name'], 'value': c['value'], 'domain': c['domain'], 'path': c['path']} 
                   for c in cookies if c['name'] in needed]
        
        with open(COOKIES_FILE, 'w') as f:
            json.dump(filtered, f, indent=2)
        
        print(f"\n=== SCRAPEANDO @{username} ===")
        
        page.goto(f'https://www.instagram.com/{username}/', wait_until='domcontentloaded', timeout=30000)
        page.wait_for_timeout(5000)
        
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(2500)
        
        links = page.query_selector_all('a[href*="/p/"], a[href*="/reel/"]')
        post_links = []
        for link in links[:15]:
            href = link.get_attribute('href')
            if href and href not in post_links:
                post_links.append(href)
        
        print(f"Links: {len(post_links)}")
        
        resultado = {
            'username': username,
            'seguidores': '',
            'siguiendo': '',
            'num_posts': '',
            'publicaciones': []
        }
        
        page_text = page.inner_text('body')
        
        followers_match = re.search(r'([\d,.]+[KMB]?)\s*followers?', page_text, re.I)
        if followers_match:
            resultado['seguidores'] = followers_match.group(1)
        
        following_match = re.search(r'([\d,]+)\s*following', page_text, re.I)
        if following_match:
            resultado['siguiendo'] = following_match.group(1)
        
        posts_match = re.search(r'([\d,]+)\s*posts?', page_text, re.I)
        if posts_match:
            resultado['num_posts'] = posts_match.group(1)
        
        print(f"\nExtraer {min(10, len(post_links))} posts...")
        
        for i, link in enumerate(post_links[:10], 1):
            full_url = f"https://www.instagram.com{link}" if link.startswith('/') else link
            
            print(f"  Post {i}...", end=" ", flush=True)
            
            try:
                page.goto(full_url, wait_until='domcontentloaded', timeout=15000)
                page.wait_for_timeout(2000)
                
                datos = extraer_datos_pagina(page)
                
                post_data = {
                    'numero': i,
                    'link': full_url,
                    'titulo': datos['titulo'],
                    'likes': datos['likes'],
                    'comentarios': datos['comentarios']
                }
                
                resultado['publicaciones'].append(post_data)
                
                likes_str = post_data.get('likes', '?')
                coment_count = len(post_data.get('comentarios', []))
                print(f"Likes: {likes_str} | Comentarios: {coment_count}")
                
            except Exception as e:
                print(f"Error: {str(e)[:30]}")
                resultado['publicaciones'].append({
                    'numero': i, 
                    'link': full_url, 
                    'error': str(e)[:30]
                })
        
        print(f"\n=== RESULTADO ===")
        print(f"@{username}")
        print(f"Seuidores: {resultado['seguidores']}")
        print(f"Posts: {resultado['num_posts']}")
        print(f"Publicaciones: {len(resultado['publicaciones'])}")
        
        filename = os.path.join(OUTPUT_DIR, f'{username}.json')
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(resultado, f, ensure_ascii=False, indent=2)
        
        print(f"\nOK: output/{username}.json")
        
        browser.close()


def main():
    if len(sys.argv) < 2:
        print("Uso: python instagram_scraper.py usuario")
        sys.exit(1)
    
    username = sys.argv[1]
    
    print("=" * 50)
    print("INSTAGRAM SCRAPER")
    print("=" * 50)
    
    login_y_scrape(username)


if __name__ == '__main__':
    main()