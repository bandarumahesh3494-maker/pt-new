import { mdToPdf } from 'md-to-pdf';
import { promises as fs } from 'fs';
import path from 'path';

const docs = [
  "CLIENT_DEMO_DOCUMENTATION.md",
  "FEATURE_REQUIREMENTS.md",
  "API_DOCUMENTATION.md",
  "ENTITY_RELATIONSHIP_DIAGRAM.md",
  "API_FLOWCHARTS.md",
  "HIGH_LEVEL_ARCHITECTURE.md",
  "QUICK_REFERENCE.md",
  "SCHEMA_AUTO_MIGRATION_COMPLETE.md"
];

const outputDir = "./pdf-docs";

async function generatePDFs() {
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log("Generating PDFs...\n");

    for (const doc of docs) {
      const inputPath = `./${doc}`;
      const outputPath = `${outputDir}/${doc.replace('.md', '.pdf')}`;

      try {
        await fs.access(inputPath);
        console.log(`Converting: ${doc}`);

        const pdf = await mdToPdf({ path: inputPath }, {
          dest: outputPath,
          launch_options: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
        });

        console.log(`✓ Generated: ${outputPath}`);
      } catch (error) {
        console.log(`✗ Error with ${doc}: ${error.message}`);
      }
    }

    console.log("\n✓ PDF generation complete! Check the pdf-docs folder.");
  } catch (error) {
    console.error("Error:", error);
  }
}

generatePDFs();
