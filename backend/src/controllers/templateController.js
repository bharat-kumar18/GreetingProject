const TemplateService = require('../services/templateService');

class TemplateController {
  static async getAllTemplates(req, res) {
    try {
      const templates = await TemplateService.getAllTemplates();
      res.status(200).json({ success: true, data: templates });
    } catch (error) {
      console.error('getAllTemplates error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async getTemplateById(req, res) {
    try {
      const { id } = req.params;
      const template = await TemplateService.getTemplateById(id);
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      if (error.message === 'Template not found') {
        res.status(404).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  }

  static async createTemplate(req, res) {
    try {
      const file = req.file;
      const data = req.body;
      const template = await TemplateService.createTemplate(data, file);
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      if (error.message === 'Template not found') {
        res.status(404).json({ success: false, error: error.message });
      } else if (
        error.message === 'SVG file is required' || 
        error.message === 'Name and occasion are required' || 
        error.message.includes('Unsupported placeholder') || 
        error.message.includes('valid SVG') ||
        error.message.includes('Missing required placeholder') ||
        error.message.includes('Unsupported external asset found')
      ) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  }

  static async updateTemplate(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const template = await TemplateService.updateTemplate(id, data);
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      if (error.message === 'Template not found') {
        res.status(404).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  }

  static async deleteTemplate(req, res) {
    try {
      const { id } = req.params;
      const template = await TemplateService.deleteTemplate(id);
      res.status(200).json({ success: true, data: template, message: 'Template deleted successfully' });
    } catch (error) {
      if (error.message === 'Template not found') {
        res.status(404).json({ success: false, error: error.message });
      } else {
        console.error('Delete template error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  }
}

module.exports = TemplateController;
