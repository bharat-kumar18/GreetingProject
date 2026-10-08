const express = require('express');
const router = express.Router();
const GenerationController = require('../controllers/generationController');

router.post('/preview', GenerationController.preview);
router.post('/generate', GenerationController.generate);
router.post('/batch', GenerationController.batchGenerate);
router.get('/jobs/:id', GenerationController.getJobById);
router.get('/outputs', GenerationController.getAllOutputs);
router.get('/outputs/:id', GenerationController.getOutputById);
router.get('/outputs/:id/download', GenerationController.downloadOutput);

module.exports = router;
