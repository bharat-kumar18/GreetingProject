const express = require('express');
const router = express.Router();
const RecipientController = require('../controllers/recipientController');
const { uploadCsv } = require('../middlewares/upload');

router.get('/', RecipientController.getAllRecipients);
router.get('/:id', RecipientController.getRecipientById);
router.post('/', RecipientController.createRecipient);
router.put('/:id', RecipientController.updateRecipient);
router.delete('/:id', RecipientController.deleteRecipient);

router.post('/import', uploadCsv.single('file'), RecipientController.importCsv);

module.exports = router;
