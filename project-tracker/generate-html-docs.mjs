import { marked } from 'marked';
import { promises as fs } from 'fs';

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

const outputDir = "./html-docs";

const htmlTemplate = (title, content) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
        }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; border-bottom: 2px solid #95a5a6; padding-bottom: 8px; margin-top: 30px; }
        h3 { color: #7f8c8d; }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        pre code {
            background: none;
            color: inherit;
            padding: 0;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #3498db;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        blockquote {
            border-left: 4px solid #3498db;
            padding-left: 20px;
            margin-left: 0;
            color: #555;
        }
        a { color: #3498db; text-decoration: none; }
        a:hover { text-decoration: underline; }
        @media print {
            body { padding: 0; }
            pre { page-break-inside: avoid; }
            h1, h2, h3 { page-break-after: avoid; }
        }
    </style>
</head>
<body>
${content}
<footer style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; text-align: center;">
    <p>Generated on ${new Date().toLocaleDateString()} | <a href="index.html">Back to Index</a></p>
</footer>
</body>
</html>`;

async function generateHTMLDocs() {
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log("Generating HTML documentation...\n");

    const indexLinks = [];

    for (const doc of docs) {
      const inputPath = `./${doc}`;
      const outputPath = `${outputDir}/${doc.replace('.md', '.html')}`;

      try {
        const markdown = await fs.readFile(inputPath, 'utf-8');
        const htmlContent = marked(markdown);
        const title = doc.replace('.md', '').replace(/_/g, ' ');
        const fullHtml = htmlTemplate(title, htmlContent);

        await fs.writeFile(outputPath, fullHtml);
        console.log(`✓ Generated: ${outputPath}`);

        indexLinks.push({ title, filename: doc.replace('.md', '.html') });
      } catch (error) {
        console.log(`✗ Error with ${doc}: ${error.message}`);
      }
    }

    // Generate index page
    const indexContent = `
# Project Tracker Documentation

Generated on ${new Date().toLocaleDateString()}

## Available Documents

${indexLinks.map(link => `- [${link.title}](${link.filename})`).join('\n')}

## Quick Guide

1. **Start Here**: [Client Demo Documentation](CLIENT_DEMO_DOCUMENTATION.html)
2. **Features**: [Feature Requirements](FEATURE_REQUIREMENTS.html)
3. **Technical**: [High Level Architecture](HIGH_LEVEL_ARCHITECTURE.html)
4. **API**: [API Documentation](API_DOCUMENTATION.html)
5. **Database**: [Entity Relationship Diagram](ENTITY_RELATIONSHIP_DIAGRAM.html)

---

**Tip**: To save as PDF, open any document and use your browser's "Print to PDF" function.
`;

    const indexHtml = htmlTemplate('Project Tracker Documentation', marked(indexContent));
    await fs.writeFile(`${outputDir}/index.html`, indexHtml);
    console.log(`✓ Generated: ${outputDir}/index.html`);

    console.log("\n✓ HTML documentation generated successfully!");
    console.log(`\nTo convert to PDF:\n1. Open ${outputDir}/index.html in your browser`);
    console.log(`2. For each document, use browser Print > Save as PDF`);
    console.log(`3. Or use: npx playwright pdf ${outputDir}/CLIENT_DEMO_DOCUMENTATION.html CLIENT_DEMO_DOCUMENTATION.pdf`);

  } catch (error) {
    console.error("Error:", error);
  }
}

generateHTMLDocs();
