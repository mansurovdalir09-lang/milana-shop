// Снимает реальные экраны мини-аппа для ролика (390×844, DPR 2) и координаты кнопок.
// Из папки app/: python3 -m http.server 8765 ; node brand-tools/appvideo/capture.js
const { chromium } = require(process.env.PW_PATH || 'playwright');
const fs = require('fs'), D = __dirname + '/shots/';
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await c.addInitScript(() => { try { localStorage.clear() } catch (e) {} });
  const p = await c.newPage(); const box = {};
  // фирменные шрифты из brand-tools/fonts вместо Google Fonts (в офлайне/за прокси)
  const css = fs.readFileSync(__dirname + '/../fonts/fonts.css', 'utf8').replace(/url\(\.\/files\//g, 'url(http://localhost:8765/brand-tools/fonts/files/');
  await p.route(/fonts\.googleapis\.com/, r => r.fulfill({ contentType: 'text/css', body: css }));
  await p.route(/fonts\.gstatic\.com/, r => r.abort());
  const bb = async (sel, k) => { const r = await p.locator(sel).first().boundingBox(); box[k] = r && { x: r.x + r.width / 2, y: r.y + r.height / 2 } };
  await p.goto('http://localhost:8765/'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  await p.screenshot({ path: D + '1-loader.png' });
  await p.waitForSelector('#loader.hide', { state: 'attached' }); await p.waitForTimeout(700);
  // как в Telegram: кнопка «в Telegram» и приветствие покупателя
  await p.evaluate(() => { Pf.kind = 'tg'; Pf.user = { first_name: 'Анна' }; document.getElementById('hello').textContent = 'Привет, Анна'; document.getElementById('ava').textContent = 'А' });
  await p.screenshot({ path: D + '2-home.png' });
  await p.evaluate(() => scrollTo(0, 760)); await p.waitForTimeout(300); await p.screenshot({ path: D + '3-home2.png' });
  await p.evaluate(() => scrollTo(0, 0));
  await bb('.tab[data-tab="catalog"]', 'tabCatalog');
  await p.click('.tab[data-tab="catalog"]'); await p.waitForTimeout(600);
  await p.screenshot({ path: D + '4-catalog.png' });
  await p.addStyleTag({ content: '.tabbar{display:none!important}' });
  await p.screenshot({ path: D + '5-catalog-full.png', fullPage: true });
  await p.addStyleTag({ content: '.tabbar{display:grid!important}' });
  await p.screenshot({ path: D + '6-tabbar.png', clip: { x: 0, y: 844 - 110, width: 390, height: 110 } });
  await bb('#grid .card >> nth=2', 'card');
  await p.click('#grid .card >> nth=2'); await p.waitForTimeout(700);
  await bb('#addSheet', 'addBtn');
  await p.screenshot({ path: D + '7-product.png' });
  await p.click('[data-sq="1"]'); await p.click('#addSheet'); await p.waitForTimeout(500);
  await p.click('#grid .card >> nth=0 >> .add'); await p.waitForTimeout(300);
  await p.click('#grid .card >> nth=5 >> .add'); await p.waitForTimeout(2400);
  await p.click('.tab[data-tab="cart"]'); await p.waitForTimeout(600);
  await p.screenshot({ path: D + '8-cart.png' });
  await p.evaluate(() => scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(400);
  await bb('[data-act="order"]', 'orderBtn');
  await p.screenshot({ path: D + '9-cart-bottom.png' });
  await p.evaluate(() => { window.open = () => {} });
  await p.click('[data-act="order"]'); await p.waitForTimeout(1200);
  await p.screenshot({ path: D + '10-done.png' });
  fs.writeFileSync(D + 'boxes.json', JSON.stringify(box, null, 1));
  await b.close(); console.log(box);
})();
