const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');
const { replacePlaceholders } = require('../utils/templateEngine');

class RenderingService {
  /**
   * Generates a deterministic and sanitized filename
   */
  static generateFilename(name, occasion, extension = 'png') {
    const sanitize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    const cleanName = sanitize(name);
    const cleanOccasion = sanitize(occasion);
    const uniqueId = require('crypto').randomBytes(4).toString('hex');
    return `${cleanOccasion}_${cleanName}_${uniqueId}.${extension}`;
  }

  /**
   * Reads an SVG template, replaces placeholders, and renders to PNG
   * @param {string} templatePath - Absolute path to the original SVG template
   * @param {Object} recipientData - Data object { name, occasion, date, message }
   * @returns {Object} - Metadata about the generated files
   */
  static async renderGreeting(templatePath, recipientData) {
    try {
      const svgContent = await fs.readFile(templatePath, 'utf8');
      return await this.renderGreetingFromContent(svgContent, recipientData);
    } catch (error) {
      throw new Error(`Rendering failed: ${error.message}`);
    }
  }

  static async renderGreetingFromContent(svgContent, recipientData) {
    try {
      const personalizedSvg = replacePlaceholders(svgContent, recipientData);
      
      const pngFilename = this.generateFilename(recipientData.name, recipientData.occasion, 'png');
      const svgFilename = this.generateFilename(recipientData.name, recipientData.occasion, 'svg');

      const outputDir = path.resolve(__dirname, '../../../backend/storage/generated');
      await fs.mkdir(outputDir, { recursive: true });

      const pngPath = path.join(outputDir, pngFilename);
      const svgPath = path.join(outputDir, svgFilename);

      await fs.writeFile(svgPath, personalizedSvg, 'utf8');

      await sharp(Buffer.from(personalizedSvg))
        .png()
        .toFile(pngPath);

      return {
        success: true,
        pngFile: pngFilename,
        pngPath: `backend/storage/generated/${pngFilename}`,
        svgFile: svgFilename,
        svgPath: `backend/storage/generated/${svgFilename}`,
      };
    } catch (error) {
      throw new Error(`Rendering failed: ${error.message}`);
    }
  }
  static async previewGreeting(templatePath, recipientData) {
    try {
      const svgContent = await fs.readFile(templatePath, 'utf8');
      const personalizedSvg = replacePlaceholders(svgContent, recipientData);
      
      const pngBuffer = await sharp(Buffer.from(personalizedSvg))
        .png()
        .toBuffer();

      const base64 = pngBuffer.toString('base64');
      return {
        success: true,
        previewUrl: `data:image/png;base64,${base64}`
      };
    } catch (error) {
      throw new Error(`Preview failed: ${error.message}`);
    }
  }
}

module.exports = RenderingService;
