// Measures what a visitor actually downloads, so loading work can be compared
// before and after. Bytes are as sent over the wire (after the host's own
// compression), on a simulated phone connection (10 Mbit/s, 40 ms latency).
//   PLAYWRIGHT_CORE=<path to playwright-core> CHROME=<path to chrome> node tools/measure/load.cjs [url]
// Prints: first view (page opened, nothing scrolled) and the whole walk.
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const url = process.argv[2] || 'https://www.human-diet.com/';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: (10e6 / 8), uploadThroughput: (5e6 / 8) });
  const urls = new Map(); let pending = 0, lastDone = 0;
  const sum = { models: 0, modelBytes: 0, otherBytes: 0 };
  cdp.on('Network.requestWillBeSent', (e) => { urls.set(e.requestId, e.request.url); pending++; });
  const done = (e) => { pending--; lastDone = Date.now(); };
  cdp.on('Network.loadingFinished', (e) => {
    const u = urls.get(e.requestId) || '';
    if (u.includes('/models/')) { sum.models++; sum.modelBytes += e.encodedDataLength; } else sum.otherBytes += e.encodedDataLength;
    done(e);
  });
  cdp.on('Network.loadingFailed', done);
  // Wait until nothing has been in flight for 3 s.
  const settle = async () => { for (;;) { await p.waitForTimeout(500); if (pending <= 0 && Date.now() - lastDone > 3000) return; } };
  const mb = (n) => (n / 1e6).toFixed(1) + ' MB';
  const t0 = Date.now();
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  await settle();
  console.log(`first view : ${sum.models} models, ${mb(sum.modelBytes)} models + ${mb(sum.otherBytes)} page, ready in ${((lastDone - t0) / 1000).toFixed(1)} s`);
  for (let i = 1; i <= 40; i++) {
    await p.evaluate((f) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), i / 40);
    await p.waitForTimeout(700);
  }
  await settle();
  console.log(`whole walk : ${sum.models} models, ${mb(sum.modelBytes)} models + ${mb(sum.otherBytes)} page`);
  await b.close();
})();
