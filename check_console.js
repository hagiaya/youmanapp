const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.error('NET ERROR:', request.url(), request.failure().errorText));

  console.log('Navigating to local server...');
  try {
    await page.goto('http://localhost:5173/mobile', { waitUntil: 'networkidle0' });
    console.log('Navigation complete. Checking page content...');
    
    // Check if #root is empty
    const rootHtml = await page.$eval('#root', el => el.innerHTML);
    console.log('Root HTML length:', rootHtml.length);
    if (rootHtml.length < 50) {
      console.log('Root HTML snippet:', rootHtml);
    }
  } catch (err) {
    console.error('Fatal Puppeteer Error:', err.message);
  } finally {
    await browser.close();
  }
})();
