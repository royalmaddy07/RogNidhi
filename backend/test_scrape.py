import requests
from bs4 import BeautifulSoup

def scrape_schemes():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    }
    url = 'https://html.duckduckgo.com/html/?q=site:gov.in+"health+insurance+scheme"'
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')
    results = []
    
    for a in soup.find_all('a', class_='result__url'):
        href = a.get('href')
        title_a = a.find_parent('div').find_previous_sibling('h2').find('a')
        snippet = a.find_parent('div').find_next_sibling('a', class_='result__snippet')
        
        if href and title_a:
            results.append({
                "url": href,
                "title": title_a.text.strip(),
                "snippet": snippet.text.strip() if snippet else ""
            })
    
    import json
    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    scrape_schemes()
