"""Static integrity, relative links, and basic accessible-name checks."""
from pathlib import Path
from bs4 import BeautifulSoup
import re

root=Path(__file__).resolve().parent.parent
soup=BeautifulSoup((root/'index.html').read_text(encoding='utf-8'), 'html.parser')
ids=[element.get('id') for element in soup.select('[id]')]
assert len(ids)==len(set(ids)), 'Duplicate HTML IDs'
for link in soup.select('a[href]'):
    href=link['href']
    if href.startswith('#') and len(href)>1:
        assert href[1:] in ids, f'Broken anchor: {href}'
for element in soup.select('img'):
    assert element.has_attr('alt'), f'Image lacks alt text: {element}'
for element in soup.select('button'):
    assert element.get_text(strip=True) or element.get('aria-label'), f'Unlabeled button: {element}'
for element in soup.select('input, select, textarea'):
    if element.get('type') == 'hidden': continue
    labelled = element.get('aria-label') or element.find_parent('label')
    assert labelled, f'Form control lacks accessible name: {element}'
for element in soup.select('[src], link[href]'):
    target=element.get('src') or element.get('href')
    if target and not (target.startswith(('http://','https://','#','data:','mailto:'))):
        assert (root/target).exists(), f'Missing local asset: {target}'
assert soup.find('meta', attrs={'name':'robots','content':'noindex,nofollow'}), 'Demo should not be indexed'
assert soup.find('form', attrs={'name':'reservation-inquiry','data-netlify':'true'}), 'Netlify form definition missing'
for name in ['form-name','reference','status']:
    assert soup.find('input',attrs={'name':name,'type':'hidden'}), f'Missing Netlify field: {name}'
assert re.search(r'body\s*\{\s*font-size:\s*16px', (root/'css/styles.css').read_text()), 'Legible body rule missing'
print(f'Static audit passed: {len(ids)} unique IDs, {len(soup.select("a[href]"))} links, {len(soup.select("button"))} buttons, images and form controls.')
