const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { replacePlaceholders } = require('../utils/templateEngine');

function safeFilePart(value) {
  return String(value || 'unknown')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function renderGreeting({ templatePath, recipient, outputDir }) {
  const templateSvg = await fs.readFile(templatePath, 'utf8');
  const renderedSvg = replacePlaceholders(templateSvg, recipient);

  await fs.mkdir(outputDir, { recursive: true });

  const filename = `${safeFilePart(recipient.occasion)}_${safeFilePart(recipient.name)}.png`;
  const outputPath = path.join(outputDir, filename);

  await sharp(Buffer.from(renderedSvg))
    .png()
    .toFile(outputPath);

  return { filename, outputPath };
}

module.exports = { renderGreeting };
