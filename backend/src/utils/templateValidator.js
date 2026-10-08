const path = require('path');
const fs = require('fs/promises');

const ALLOWED_PLACEHOLDERS = ['{{name}}', '{{occasion}}', '{{date}}', '{{message}}'];

/**
 * Validates the content of an SVG file.
 * Returns { isValid: boolean, error?: string, width?: number, height?: number }
 */
async function validateSvgTemplate(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');

    // 1. Basic SVG check
    if (!content.includes('<svg') || !content.includes('</svg>')) {
      return { isValid: false, error: 'File is not a valid SVG' };
    }

    // 2. Check for unknown placeholders
    // A placeholder is defined as {{...}}
    const regex = /\{\{\s*([^}]+?)\s*\}\}/g;
    let match;
    const foundPlaceholders = [];
    while ((match = regex.exec(content)) !== null) {
      foundPlaceholders.push(`{{${match[1].trim()}}}`);
    }

    for (const placeholder of foundPlaceholders) {
      if (!ALLOWED_PLACEHOLDERS.includes(placeholder)) {
        return { 
          isValid: false, 
          error: `Unsupported placeholder found: ${placeholder}. Allowed: ${ALLOWED_PLACEHOLDERS.join(', ')}` 
        };
      }
    }

    // Ensure required placeholders are present
    const requiredPlaceholders = ['{{name}}', '{{occasion}}'];
    for (const req of requiredPlaceholders) {
      if (!foundPlaceholders.includes(req)) {
        return {
          isValid: false,
          error: `Missing required placeholder: ${req}. Templates must contain {{name}} and {{occasion}}. If they appear in your design, ensure your software exported them as editable <text> elements, NOT as vector paths/outlines.`
        };
      }
    }

    // 3. Prevent unsupported external assets (e.g. <image href="logo.png">)
    // Sharp cannot load external/relative images during SVG rendering. Only base64 data URIs are supported.
    const imageRegex = /<image\s+[^>]*(?:href|xlink:href)="([^"]+)"/g;
    let imageMatch;
    while ((imageMatch = imageRegex.exec(content)) !== null) {
      const href = imageMatch[1];
      if (!href.startsWith('data:image/')) {
        return {
          isValid: false,
          error: `Unsupported external asset found: ${href}. Only base64 embedded images are supported in templates.`
        };
      }
    }

    // 4. Extract width and height (basic extraction, normally you'd parse XML)
    // We will attempt to find width="..." and height="..." on the root <svg> tag.
    let width = 1200; // Default
    let height = 630; // Default

    const svgTagMatch = content.match(/<svg[^>]*>/);
    if (svgTagMatch) {
      const svgTag = svgTagMatch[0];
      const widthMatch = svgTag.match(/width="([^"]+)"/);
      const heightMatch = svgTag.match(/height="([^"]+)"/);
      
      if (widthMatch && !isNaN(parseInt(widthMatch[1]))) {
        width = parseInt(widthMatch[1]);
      }
      if (heightMatch && !isNaN(parseInt(heightMatch[1]))) {
        height = parseInt(heightMatch[1]);
      }
    }

    return { isValid: true, width, height };

  } catch (err) {
    return { isValid: false, error: 'Failed to read SVG file' };
  }
}

module.exports = {
  validateSvgTemplate,
  ALLOWED_PLACEHOLDERS
};
