import requests
from bs4 import BeautifulSoup
import json
from concurrent.futures import ThreadPoolExecutor
from howlongtobeatpy import HowLongToBeat

base_url = 'https://www.dekudeals.com/games'
start_index = 50
end_index = 400
game_list = []

# Rango de páginas a obtener
page_range = range((start_index // 36) + 1, ((end_index // 36) + 2))

def fetch_hltb_data(game_name):
    """Obtiene datos de HowLongToBeat para un juego específico."""
    hltb = HowLongToBeat()
    results = hltb.search(game_name)
    if results:
        best_match = max(results, key=lambda x: x.similarity)
        return {
            "main_story": best_match.main_story,
            "main_extra": best_match.main_extra,
            "completionist": best_match.completionist
        }
    return None

def fetch_game_data(game, index):
    """Obtiene los detalles de un juego en la página principal."""
    name = game.select_one("div.h6.name").get_text(strip=True) if game.select_one("div.h6.name") else "No name"
    price = game.select_one("div.card-badge strong").get_text(strip=True) if game.select_one("div.card-badge strong") else "No price"
    image_url = game.select_one("img.responsive-img")['src'] if game.select_one("img.responsive-img") else "No image URL"
    game_link = game.find("a", href=True)['href'] if game.find("a", href=True) else None
    full_game_link = f'https://www.dekudeals.com{game_link}' if game_link else None

    platforms = fetch_platform_data(full_game_link) if full_game_link else []

    # Obtener datos de HowLongToBeat
    hltb_data = fetch_hltb_data(name)

    return {
        "index": index,
        "name": name,
        "image_url": image_url,
        "price": price,
        "platforms": platforms,
        "howlongtobeat": hltb_data
    }

def fetch_platform_data(game_url):
    """Obtiene detalles de las plataformas para un juego específico."""
    platforms = []
    platform_urls_seen = set()
    game_response = requests.get(game_url)
    game_soup = BeautifulSoup(game_response.content, 'html.parser')
    platform_rows = game_soup.select("table.table a[href]")

    for platform in platform_rows:
        platform_name = platform.get_text(strip=True)
        platform_url = platform['href']

        if platform_url not in platform_urls_seen:
            platform_urls_seen.add(platform_url)

            price_container = platform.find_next("div", class_="btn")
            platform_price = price_container.get_text(strip=True) if price_container else "No price"

            sale_end = platform.find_next("a", class_="text-dark small pb-1")
            sale_end_text = sale_end.get_text(strip=True) if sale_end else "No end date"

            platforms.append({
                "platform_name": platform_name,
                "platform_url": platform_url,
                "platform_price": platform_price,
                "sale_end": sale_end_text
            })
    return platforms

def fetch_page_data(page):
    """Obtiene todos los juegos de una página específica."""
    url = f'{base_url}?page={page}'
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    games = soup.select("div.col-xl-2.col-lg-3.col-sm-4.col-6.cell")
    return games

# Ejecuta el scraping usando un ThreadPoolExecutor
with ThreadPoolExecutor() as executor:
    future_games = {executor.submit(fetch_page_data, page): page for page in page_range}

    # Procesa cada página de juegos
    current_index = start_index
    for future in future_games:
        page_games = future.result()
        for game in page_games:
            if len(game_list) < (end_index - start_index):
                game_data = executor.submit(fetch_game_data, game, current_index)
                game_list.append(game_data.result())
                current_index += 1

# Imprime y guarda los resultados en JSON
for game in game_list:
    print(f"{game['index']}. {game['name']}")
    print(f"   Image URL: {game['image_url']}")
    print(f"   Base Price: {game['price']}")
    print("   Available on:")
    for platform in game['platforms']:
        print(f"      - {platform['platform_name']}: {platform['platform_url']}")
        print(f"        Price: {platform['platform_price']}")
        print(f"        Sale Ends: {platform['sale_end']}")
    print(f"   HowLongToBeat Data: {game['howlongtobeat']}")
    print("\n")

# Guarda los datos en un archivo JSON
with open('products.json', 'w', encoding='utf-8') as f:
    json.dump(game_list, f, ensure_ascii=False, indent=4)
