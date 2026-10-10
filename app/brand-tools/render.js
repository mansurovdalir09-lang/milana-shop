// Рендер постов и сторис Milana в PNG.
// Запуск из папки app/:  python3 -m http.server 8765  (в отдельном окне)
// затем:                 node brand-tools/render.js "layout=single&id=131" posts/single-131.png
// Нужен Playwright: npm i -D playwright  (или глобально установленный)
const { chromium } = require(process.env.PW_PATH || 'playwright');
(async () => {
  const [, , query = 'layout=single&id=131', out = 'post.png'] = process.argv;
  const story = /layout=story/.test(query);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: story ? 1920 : 1350 } });
  await page.goto(`http://localhost:8765/brand-tools/post.html?${query}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: out });
  await browser.close();
  console.log('saved', out);
})();
