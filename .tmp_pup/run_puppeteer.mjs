import puppeteer from 'puppeteer';

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Extract text
    const text = await page.evaluate(() => document.body.innerText);
    console.log("Initial page text extracted.");
    
    const isFerroUiPresent = text.includes("FERRO_UI // RUNTIME");
    console.log(`"FERRO_UI // RUNTIME" present: ${isFerroUiPresent}`);
    
    // Click center bottom
    const { width, height } = await page.viewport();
    console.log(`Clicking center bottom: x=${width / 2}, y=${height - 50}`);
    await page.mouse.click(width / 2, height - 50);
    
    // Wait 500ms
    await new Promise(r => setTimeout(r, 500));
    
    // Check input placeholder
    const placeholder = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      for (const input of inputs) {
        if (input.placeholder && input.placeholder.includes("Run a full diagnostic")) {
          return input.placeholder;
        }
      }
      return null;
    });
    
    console.log(`Input with "Run a full diagnostic" placeholder found: ${placeholder !== null}`);
    
    // Let's also check if there is an Activity icon we can click specifically
    const orbFound = await page.evaluate(() => {
      const svgs = Array.from(document.querySelectorAll('svg'));
      for (const svg of svgs) {
        if (svg.classList.contains('lucide-activity') || svg.innerHTML.includes('polyline')) {
          const rect = svg.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            return {x: rect.x + rect.width/2, y: rect.y + rect.height/2};
          }
        }
      }
      return null;
    });
    
    if (orbFound && placeholder === null) {
       console.log(`Orb found at ${orbFound.x}, ${orbFound.y}. Clicking it...`);
       await page.mouse.click(orbFound.x, orbFound.y);
       await new Promise(r => setTimeout(r, 500));
       
       const placeholder2 = await page.evaluate(() => {
         const inputs = Array.from(document.querySelectorAll('input'));
         for (const input of inputs) {
           if (input.placeholder && input.placeholder.includes("Run a full diagnostic")) {
             return input.placeholder;
           }
         }
         return null;
       });
       console.log(`Input with "Run a full diagnostic" placeholder found after clicking orb: ${placeholder2 !== null}`);
    }

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();