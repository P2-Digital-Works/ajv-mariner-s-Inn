"""Build one self-contained HTML demonstration, with local SVG/CSS/JS inline.

Usage: python scripts/build_preview.py [output.html]
The Google Fonts link is removed, so the preview has no remote dependencies.
"""
from pathlib import Path
import re
import sys
import base64

root = Path(__file__).resolve().parent.parent
out = Path(sys.argv[1]) if len(sys.argv)>1 else root / 'preview-standalone.html'
html = (root / 'index.html').read_text(encoding='utf-8')
html = re.sub(r'<link rel="preconnect"[^>]*>', '', html)
html = re.sub(r'<link href="https://fonts.googleapis.com/[^>]*>', '', html)
html = html.replace('<link rel="stylesheet" href="css/styles.css">',
                    '<style>\n' + (root / 'css/styles.css').read_text(encoding='utf-8') + '\n</style>')
inline_js = []
for name in ['js/config.js', 'js/inquiry-utils.js', 'js/app.js']:
    html = html.replace(f'<script src="{name}" defer></script>', '')
    js = (root / name).read_text(encoding='utf-8').replace('</script>', '<\\/script>')
    inline_js.append('<script>\n' + js + '\n</script>')
html = html.replace('</body>', '\n' + '\n'.join(inline_js) + '\n</body>')
for asset in (root / 'assets').glob('*.svg'):
    content = base64.b64encode(asset.read_bytes()).decode('ascii')
    html = html.replace('assets/' + asset.name, 'data:image/svg+xml;base64,' + content)
out.write_text(html, encoding='utf-8')
print(f'Created: {out} ({out.stat().st_size:,} bytes)')
