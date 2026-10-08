const express = require('express');
const router = express.Router();
const TemplateController = require('../controllers/templateController');
const { uploadTemplate } = require('../middlewares/upload');

// GET all templates
router.get('/', TemplateController.getAllTemplates);

// GET template by id
router.get('/:id', TemplateController.getTemplateById);

// POST create new template
// The frontend should send form-data with 'file' as the SVG file and text fields for 'name', 'occasion', etc.
router.post('/', uploadTemplate.single('file'), TemplateController.createTemplate);

// PUT update template metadata
router.put('/:id', TemplateController.updateTemplate);

// DELETE template
router.delete('/:id', TemplateController.deleteTemplate);

module.exports = router;
