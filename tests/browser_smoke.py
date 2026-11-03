"""Offline visual/interaction QA using a Chromium document with inline local assets.

The review sandbox blocks normal browser navigation even to localhost. This test uses
page.set_content with the same production source, CSS, JS, and SVG files inline.
It tests the DOM/JS flow, NOT network routing, Netlify Forms, or actual hosting.
"""
from pathlib import Path
from datetime import date, timedelta
from playwright.sync_api import sync_playwright
import base64
import re

ROOT = Path(__file__).resolve().parent.parent


def bundled_html():
    html = (ROOT / 'index.html').read_text()
    html = re.sub(r'<link rel="preconnect"[^>]*>', '', html)
    html = re.sub(r'<link href="https://fonts.googleapis.com/[^>]*>', '', html)
    html = html.replace('<link rel="stylesheet" href="css/styles.css">',
                        '<style>' + (ROOT / 'css/styles.css').read_text() + '</style>')
    scripts = []
    for src in ['js/config.js', 'js/inquiry-utils.js', 'js/app.js']:
        html = html.replace(f'<script src="{src}" defer></script>', '')
        scripts.append('<script>' + (ROOT / src).read_text() + '</script>')
    html = html.replace('</body>', ''.join(scripts) + '</body>')
    for name in ['hero-scene.svg', 'room-classic.svg', 'room-twin.svg', 'room-family.svg']:
        data = base64.b64encode((ROOT / 'assets' / name).read_bytes()).decode()
        html = html.replace('assets/' + name, 'data:image/svg+xml;base64,' + data)
    return html


STORAGE_POLYFILL = """
Object.defineProperty(window, 'localStorage', { configurable: true,
 value: { _store: {}, getItem(k) { return this._store[k] || null; },
 setItem(k,v) { this._store[k] = String(v); }, removeItem(k) { delete this._store[k]; }}
});
"""


def assert_viewport(page, width):
    dims = page.evaluate('''() => ({scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth})''')
    assert dims['scroll'] <= dims['client'] + 1, f'Horizontal scroll at {width}px: {dims}'
    assert page.locator('#heroTitle').is_visible()
    assert page.locator('#quickCheckin').is_visible()


def run():
    html = bundled_html()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium',
                                    args=['--no-sandbox', '--disable-gpu', '--no-first-run',
                                          '--disable-background-networking'])
        for width, height in [(1440, 900), (768, 900), (390, 844), (320, 760)]:
            context = browser.new_context(viewport={'width':width,'height':height})
            context.add_init_script(STORAGE_POLYFILL)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.set_content(html, wait_until='domcontentloaded', timeout=15000)
            assert_viewport(page, width)
            assert not errors, f'Page errors at {width}px: {errors}'
            if width == 1440:
                page.screenshot(path='/mnt/data/ajv-mariners-inn-desktop-v2.png')
                page.locator('[data-room-select="twin"]').click()
                assert page.locator('#roomDialog').is_visible()
                assert page.locator('#roomDialogImage').get_attribute('src').startswith('data:image/svg+xml;base64,')
                page.locator('#roomDialog [data-close-dialog]').click()
                page.locator('[data-open-owner]').first.click()
                assert page.locator('#ownerDialog').is_visible()
                page.locator('#tryDemoInquiry').click()
                assert page.locator('#inquiryDialog').is_visible()
                assert page.locator('#formName').input_value() == 'Demo Guest'
                assert page.locator('#formEmail').input_value() == 'demo.guest@example.com'
                assert page.locator('#formCheckin').input_value() > date.today().isoformat()
                page.locator('#inquiryForm input[name="consent"]').check()
                page.locator('#submitInquiry').click()
                assert page.locator('#inquirySuccess').is_visible()
                assert page.locator('#inquiryReference').inner_text().startswith('DEMO-')
                assert 'No room has been booked' in page.locator('#successMessage').inner_text()
                page.locator('#inquirySuccess [data-close-dialog]').click()
                page.locator('[data-open-owner]').first.click()
                page.locator('#openDemoInbox').click()
                assert page.locator('.inbox-entry').count() == 1
                assert 'Demo Guest' in page.locator('.inbox-entry').inner_text()
            if width == 390:
                page.screenshot(path='/mnt/data/ajv-mariners-inn-mobile-v2.png')
                page.locator('#menuToggle').click()
                assert page.locator('#mainNav').is_visible()
                page.keyboard.press('Escape')
                assert not page.locator('#mainNav').is_visible()
                assert page.locator('.mobile-sticky').is_visible()
            if width == 320:
                page.locator('#quickCheckin').fill((date.today()+timedelta(days=2)).isoformat())
                page.locator('#quickCheckout').fill((date.today()+timedelta(days=4)).isoformat())
                page.locator('#quickGuests').select_option('6')
                page.locator('#quickSearchForm button[type=submit]').click()
                assert page.locator('#inquiryDialog').is_visible()
                assert page.locator('#formRoom').input_value() == 'other'
            print(f'PASS {width}px viewport, JS, and responsive checks')
            context.close()
        # Production-mode failure and retry behavior with a mocked Netlify response.
        live_html = html.replace("mode: 'demo', // 'demo' | 'netlify'", "mode: 'netlify', // 'demo' | 'netlify'")
        context = browser.new_context(viewport={'width':900,'height':900})
        context.add_init_script(STORAGE_POLYFILL)
        page = context.new_page()
        page.set_content(live_html, wait_until='domcontentloaded')
        assert page.locator('#fillDemoInquiry').is_hidden()
        assert page.locator('[data-open-owner]').first.is_hidden()
        page.locator('#quickCheckin').fill((date.today()+timedelta(days=3)).isoformat())
        page.locator('#quickCheckout').fill((date.today()+timedelta(days=5)).isoformat())
        page.locator('#quickSearchForm button[type=submit]').click()
        start=(date.today()+timedelta(days=3)).isoformat()
        end=(date.today()+timedelta(days=5)).isoformat()
        page.locator('#formCheckin').fill(start)
        page.locator('#formCheckout').fill(end)
        page.locator('#formName').fill('Example Guest')
        page.locator('#formEmail').fill('guest@example.com')
        page.locator('#inquiryForm input[name="consent"]').check()
        page.evaluate('window.fetch = async () => ({ ok:false, status:503 })')
        page.locator('#submitInquiry').click()
        assert page.locator('#inquiryError').is_visible()
        assert 'HTTP 503' in page.locator('#inquiryError').inner_text()
        assert page.locator('#inquirySuccess').is_hidden()
        assert page.locator('#formName').input_value() == 'Example Guest'
        page.evaluate('window.fetch = async () => ({ ok:true, status:200 })')
        page.locator('#submitInquiry').click()
        assert page.locator('#inquirySuccess').is_visible()
        assert 'not yet been reserved' in page.locator('#successMessage').inner_text()
        print('PASS simulated live-mode error, input preservation, and retry')
        context.close()
        browser.close()

if __name__ == '__main__':
    run()
