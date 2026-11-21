// Makes public/share.png, the picture shown when the site is shared on X,
// Facebook or LinkedIn. Run the site locally first (npx vite --port 5199).
//   PLAYWRIGHT_CORE=<path to playwright-core> CHROME=<path to chrome> node tools/share/card.cjs [url]
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined });
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.goto((process.argv[2] || 'http://localhost:5199/') + '?share-card', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'public/share.png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await b.close();
})();
