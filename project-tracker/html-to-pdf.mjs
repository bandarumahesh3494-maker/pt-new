import playwright from 'playwright-core';
import { promises as fs } from 'fs';
import path from 'path';

const htmlDir = './html-docs';
const outputDir = './pdf-docs';

async function convertToPDF() {
  try {
    await fs.mkdir(outputDir, { recursive: true });

    console.log("Converting HTML to PDF using Chromium...\n");

    // Get all HTML files
    const files = await fs.readdir(htmlDir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));

    // Launch browser with chromium
    let browser;
    try {
      browser = await playwright.chromium.launch({
        executablePath: '/usr/bin/chromium-browser'
      });
    } catch (err) {
      try {
        browser = await playwright.chromium.launch({
          executablePath: '/usr/bin/google-chrome'
        });
      } catch (err2) {
        console.log("Chromium/Chrome not found. Trying Firefox...");
        browser = await playwright.firefox.launch();
      }
    }

    const context = await browser.newContext();
    const page = await context.newPage();

    for (const htmlFile of htmlFiles) {
      const htmlPath = path.resolve(htmlDir, htmlFile);
      const pdfPath = path.resolve(outputDir, htmlFile.replace('.html', '.pdf'));

      console.log(`Converting: ${htmlFile}`);

      await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

      await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: true
      });

      console.log(`✓ Generated: ${pdfPath}`);
    }

    await browser.close();

    console.log("\n✓ All PDFs generated successfully!");
    console.log(`\nPDFs are available in: ${outputDir}/`);

  } catch (error) {
    console.error("Error:", error.message);
    console.log("\nFallback: Use your browser to print HTML files to PDF");
    console.log(`1. Open html-docs/index.html in any browser`);
    console.log(`2. Click on any document link`);
    console.log(`3. Press Ctrl+P (or Cmd+P on Mac)`);
    console.log(`4. Select "Save as PDF" and save`);
  }
}

convertToPDF();
