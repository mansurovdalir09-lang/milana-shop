// Сборка промо-ролика Milana в MP4 (H.264, 1080×1920, 30 кадров/с) для WhatsApp.
// Из папки app/:  python3 -m http.server 8765   (в отдельном окне)
// затем:          node brand-tools/promo-render.js "spot=141,126,131" milana-promo.mp4
// Нужны Playwright и ffmpeg (с libx264).
const { chromium } = require(process.env.PW_PATH || 'playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
(async () => {
  const [, , query = '', out = 'milana-promo.mp4'] = process.argv;
  const fps = 30, dir = fs.mkdtempSync(path.join(os.tmpdir(), 'promo-'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto(`http://localhost:8765/brand-tools/promo.html?frame=1&${query}`);
  await page.evaluate(() => window.ready);
  const duration = await page.evaluate(() => window.DURATION);
  const frames = Math.round(duration * fps);
  for (let i = 0; i < frames; i++) {
    await page.evaluate(t => window.render(t), i / fps);
    await page.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
    if (i % 60 === 0) console.log(`кадр ${i}/${frames}`);
  }
  await browser.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(dir, 'f%04d.jpg'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-crf', '20', '-preset', 'slow', '-movflags', '+faststart', out]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('готово:', out);
})();
