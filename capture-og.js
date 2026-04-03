const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to the standard OG image size
  await page.setViewport({ width: 1200, height: 630 });
  
  // Load the HTML file we created
  await page.goto(`file://${path.join(__dirname, 'og-preview.html')}`);
  
  // Take a screenshot of the entire viewport
  await page.screenshot({ path: path.join(__dirname, 'public', 'og-image.png') });
  
  await browser.close();
  console.log("Screenshot saved to public/og-image.png");
})();
