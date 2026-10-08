const TemplateModel = require('../models/templateModel');
const RecipientModel = require('../models/recipientModel');
const RenderingService = require('../services/renderingService');

class GenerationController {
  static async preview(req, res) {
    try {
      const { templateId, recipientId } = req.body;

      if (!templateId || !recipientId) {
        return res.status(400).json({ success: false, error: 'templateId and recipientId are required' });
      }

      // Fetch template
      const template = await TemplateModel.findActiveById(templateId);
      if (!template) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      // Fetch recipient
      const recipient = await RecipientModel.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({ success: false, error: 'Recipient not found' });
      }

      const path = require('path');
      const absolutePath = path.resolve(__dirname, '../../..', template.file_path);

      // Generate preview output (base64)
      const previewResult = await RenderingService.previewGreeting(absolutePath, recipient);

      res.json({
        success: true,
        data: previewResult
      });

    } catch (error) {
      if (error.message.includes('Missing required placeholders') || error.message.includes('Unsupported placeholder')) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  }

  static async generate(req, res) {
    try {
      const { templateId, recipientId } = req.body;

      if (!templateId || !recipientId) {
        return res.status(400).json({ success: false, error: 'templateId and recipientId are required' });
      }

      const template = await TemplateModel.findActiveById(templateId);
      if (!template) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      const recipient = await RecipientModel.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({ success: false, error: 'Recipient not found' });
      }

      const path = require('path');
      const absolutePath = path.resolve(__dirname, '../../..', template.file_path);

      // Generate actual file to disk
      const renderResult = await RenderingService.renderGreeting(absolutePath, recipient);

      const OutputModel = require('../models/outputModel');
      const outputRecord = await OutputModel.create({
        template_id: templateId,
        recipient_id: recipientId,
        file_name: renderResult.pngFile,
        file_path: renderResult.pngPath,
        format: 'png',
        email_status: 'not_sent'
      });

      res.status(201).json({
        success: true,
        data: outputRecord
      });

    } catch (error) {
      if (error.message.includes('Missing required placeholders') || error.message.includes('Unsupported placeholder')) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  }

  static async getAllOutputs(req, res) {
    try {
      const OutputModel = require('../models/outputModel');
      const outputs = await OutputModel.findAll();
      res.json({ success: true, data: outputs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getOutputById(req, res) {
    try {
      const OutputModel = require('../models/outputModel');
      const output = await OutputModel.findById(req.params.id);
      if (!output) {
        return res.status(404).json({ success: false, error: 'Output not found' });
      }
      res.json({ success: true, data: output });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async downloadOutput(req, res) {
    try {
      const OutputModel = require('../models/outputModel');
      const output = await OutputModel.findById(req.params.id);
      if (!output) {
        return res.status(404).json({ success: false, error: 'Output not found' });
      }

      const path = require('path');
      
      // Ensure we construct an absolute, safe path without path traversal risks.
      // The output.file_name is generated deterministically, and the base folder is constant.
      // We ignore output.file_path to be extra safe and reconstruct it from the base directory.
      const baseDir = path.resolve(__dirname, '../../../backend/storage/generated');
      const safeFilename = path.basename(output.file_name);
      const safePath = path.join(baseDir, safeFilename);
      
      res.download(safePath, safeFilename, (err) => {
        if (err) {
          if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Failed to download file' });
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getJobById(req, res) {
    try {
      const JobModel = require('../models/jobModel');
      const job = await JobModel.findById(req.params.id);
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }
      res.json({ success: true, data: job });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async batchGenerate(req, res) {
    try {
      const { templateId, recipientIds } = req.body;

      if (!templateId || !Array.isArray(recipientIds) || recipientIds.length === 0) {
        return res.status(400).json({ success: false, error: 'templateId and recipientIds array are required' });
      }

      const template = await TemplateModel.findActiveById(templateId);
      if (!template) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      // Pre-read template content once
      const fs = require('fs/promises');
      const path = require('path');
      const absolutePath = path.resolve(__dirname, '../../..', template.file_path);
      const svgContent = await fs.readFile(absolutePath, 'utf8');

      const JobModel = require('../models/jobModel');
      const OutputModel = require('../models/outputModel');
      
      const job = await JobModel.create(templateId, recipientIds.length);

      // We respond immediately with the job ID and process in the background
      res.status(202).json({
        success: true,
        data: job
      });

      // Background processing
      (async () => {
        let successCount = 0;
        let failedCount = 0;

        for (const recipientId of recipientIds) {
          try {
            const recipient = await RecipientModel.findById(recipientId);
            if (!recipient) throw new Error('Recipient not found');

            const renderResult = await RenderingService.renderGreetingFromContent(svgContent, recipient);

            await OutputModel.create({
              job_id: job.id,
              template_id: templateId,
              recipient_id: recipientId,
              file_name: renderResult.pngFile,
              file_path: renderResult.pngPath,
              format: 'png',
              email_status: 'not_sent'
            });

            successCount++;
          } catch (error) {
            console.error(`Batch processing failed for recipient ${recipientId}:`, error.message);
            failedCount++;
            // We continue processing even if one fails. The failure reason is logged to console.
            // In a production system, we might record individual failure rows.
          }
        }

        const finalStatus = failedCount === recipientIds.length ? 'failed' : 'completed';
        await JobModel.updateCounts(job.id, successCount, failedCount, finalStatus);
      })();

    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = GenerationController;
