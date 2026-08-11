import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Simulate a report so the Header shows the download button
  await page.evaluate(() => {
    // Force zustand state if possible or just call the function directly
    window.__TEST_PDF__ = true;
  });

  // We can just import and call downloadFullPdfReport if it was exposed, 
  // but since it's a module, let's just trigger a search and then click the download button.
  console.log("Typing company name...");
  await page.type('input[placeholder="Razón Social, CUIT o Nombre (ej: YPF S.A.)"]', 'YPF S.A.');
  await page.click('button[type="submit"]');

  console.log("Waiting for scan to finish (or header button to appear)...");
  
  try {
    // Wait for the download PDF button to appear (it says "Descargar PDF Completo")
    await page.waitForFunction(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(b => b.innerText.includes('Descargar PDF Completo'));
    }, { timeout: 30000 });
    
    console.log("Button found! Clicking...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const pdfBtn = buttons.find(b => b.innerText.includes('Descargar PDF Completo'));
      if (pdfBtn) pdfBtn.click();
    });

    console.log("Clicked! Waiting 10 seconds to observe freezes or logs...");
    await new Promise(r => setTimeout(r, 10000));
  } catch (e) {
    console.error("Timeout or error:", e);
  }

  await browser.close();
})();
