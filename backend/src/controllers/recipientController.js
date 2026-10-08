const RecipientService = require('../services/recipientService');

class RecipientController {
  static async getAllRecipients(req, res) {
    try {
      const recipients = await RecipientService.getAllRecipients();
      res.json({ success: true, data: recipients });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getRecipientById(req, res) {
    try {
      const recipient = await RecipientService.getRecipientById(req.params.id);
      res.json({ success: true, data: recipient });
    } catch (error) {
      if (error.message === 'Recipient not found') {
        res.status(404).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  }

  static async createRecipient(req, res) {
    try {
      const recipient = await RecipientService.createRecipient(req.body);
      res.status(201).json({ success: true, data: recipient });
    } catch (error) {
      if (error.message.includes('Validation failed')) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  }

  static async updateRecipient(req, res) {
    try {
      const recipient = await RecipientService.updateRecipient(req.params.id, req.body);
      res.json({ success: true, data: recipient });
    } catch (error) {
      if (error.message === 'Recipient not found') {
        res.status(404).json({ success: false, error: error.message });
      } else if (error.message.includes('Validation failed')) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  }

  static async deleteRecipient(req, res) {
    try {
      await RecipientService.deleteRecipient(req.params.id);
      res.json({ success: true, message: 'Recipient deleted successfully' });
    } catch (error) {
      if (error.message === 'Recipient not found') {
        res.status(404).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  }

  static async importCsv(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No CSV file uploaded' });
      }

      const result = await RecipientService.processCsvImport(req.file.path);
      
      // We return 207 Multi-Status if there are partial errors, or 201 if fully successful
      const status = result.errorCount > 0 ? 207 : 201;
      
      res.status(status).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = RecipientController;
