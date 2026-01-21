const markdownpdf = require("markdown-pdf");
const fs = require("fs");
const path = require("path");

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
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

console.log("Generating PDFs...\n");

docs.forEach((doc) => {
  const inputPath = `./${doc}`;
  const outputPath = `${outputDir}/${doc.replace('.md', '.pdf')}`;

  if (fs.existsSync(inputPath)) {
    markdownpdf()
      .from(inputPath)
      .to(outputPath, () => {
        console.log(`✓ Generated: ${outputPath}`);
      });
  } else {
    console.log(`✗ Not found: ${inputPath}`);
  }
});

console.log("\nPDF generation complete! Check the pdf-docs folder.");
