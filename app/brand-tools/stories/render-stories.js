// Рендер всех карточек сторис из stories.json в JPG 1080×1920.
// Из папки app/: python3 -m http.server 8765 ; затем: node brand-tools/stories/render-stories.js out-folder
const { chromium } = require(process.env.PW_PATH || 'playwright');
const fs = require('fs');
(async () => {
  const out = process.argv[2] || 'stories-out';
  fs.mkdirSync(out, { recursive: true });
  const list = JSON.parse(fs.readFileSync(__dirname + '/stories.json', 'utf8'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const s of list) {
    await page.goto(`http://localhost:8765/brand-tools/stories/story.html?n=${s.n}`);
    await page.waitForSelector('body[data-ready]');
    await page.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map(i => i.decode().catch(() => {}))]));
    const name = `${String(s.n).padStart(2, '0')}-${(s.code || s.cat).replace(/[^\wА-Яа-я-]+/g, '_')}.jpg`;
    await page.screenshot({ path: `${out}/${name}`, type: 'jpeg', quality: 90 });
    console.log(name);
  }
  await browser.close();
})();
