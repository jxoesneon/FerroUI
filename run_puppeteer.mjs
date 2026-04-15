import puppeteer from 'puppeteer';

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Click center bottom
    const { width, height } = await page.viewport();
    await page.mouse.click(width / 2, height - 50);
    
    // Wait for input to be active
    await new Promise(r => setTimeout(r, 1000));
    
    // Type the prompt
    await page.keyboard.type("Show me a detailed networking deep-dive dashboard");
    await page.keyboard.press("Enter");
    
    // Wait 3 seconds for synthesis
    await new Promise(r => setTimeout(r, 3000));
    
    // Extract full text
    const text = await page.evaluate(() => document.body.innerText);
    console.log("--- DASHBOARD TEXT ---");
    console.log(text);
    console.log("--- END DASHBOARD TEXT ---");
    
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();