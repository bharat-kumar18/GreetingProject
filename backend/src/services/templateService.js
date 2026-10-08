const TemplateModel = require('../models/templateModel');
const { validateSvgTemplate } = require('../utils/templateValidator');
const fs = require('fs/promises');

class TemplateService {
  static async getAllTemplates() {
    return TemplateModel.findAll();
  }

  static async getTemplateById(id) {
    const template = await TemplateModel.findActiveById(id);
    if (!template) {
      throw new Error('Template not found');
    }
    return template;
  }

  static async createTemplate(data, file) {
    if (!file) {
      throw new Error('SVG file is required');
    }
    if (!data.name || !data.occasion) {
      // Clean up uploaded file
      await this.deleteFile(file.path);
      throw new Error('Name and occasion are required');
    }

    // Validate SVG contents
    const validation = await validateSvgTemplate(file.path);
    if (!validation.isValid) {
      await this.deleteFile(file.path);
      throw new Error(validation.error);
    }

    const relativeFilePath = `backend/templates/${file.filename}`;

    const templateData = {
      name: data.name,
      occasion: data.occasion,
      file_name: file.filename,
      file_path: relativeFilePath,
      width: validation.width,
      height: validation.height,
      is_active: data.is_active !== undefined ? data.is_active === 'true' || data.is_active === true : true
    };

    return TemplateModel.create(templateData);
  }

  static async updateTemplate(id, data) {
    // We only support updating metadata for now (name, occasion, is_active)
    // If we wanted to update the file itself, we'd handle file upload here similarly.
    const template = await TemplateModel.findActiveById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    const updatedData = {};
    if (data.name !== undefined) updatedData.name = data.name;
    if (data.occasion !== undefined) updatedData.occasion = data.occasion;
    if (data.is_active !== undefined) {
      updatedData.is_active = data.is_active === 'true' || data.is_active === true;
    }

    return TemplateModel.update(id, updatedData);
  }

  static async deleteTemplate(id) {
    const template = await TemplateModel.findActiveById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    // Keep the record and SVG for generated outputs and historical email records.
    const deletedTemplate = await TemplateModel.delete(id);
    if (!deletedTemplate) {
      throw new Error('Template not found');
    }
    return deletedTemplate;
  }

  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error(`Failed to delete file: ${filePath}`, err);
    }
  }
}

module.exports = TemplateService;
