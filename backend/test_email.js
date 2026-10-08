const fs = require('fs');
// Ensure we use mock DB for this test
if (fs.existsSync('src/config/db.js.bak')) {
  console.log('db.js.bak exists, skipping swap');
} else {
  fs.copyFileSync('src/config/db.js', 'src/config/db.js.bak');
  fs.copyFileSync('src/config/db_mock.js', 'src/config/db.js');
}

// Enable test mode for email service
process.env.TEST_MODE = 'true';

const EmailService = require('./src/services/emailService');
const OutputModel = require('./src/models/outputModel');

async function testEmail() {
  try {
    console.log('Fetching mock output rec-1-output...');
    let outputId = 'out-1';
    let output = await OutputModel.findById(outputId);
    if (!output) {
      console.log('Mock output out-1 not found! Creating one for testing...');
      output = await OutputModel.create({
        template_id: 'tpl-1',
        recipient_id: 'rec-1',
        file_name: 'test.png',
        file_path: '/path/to/test.png',
        format: 'png',
        email_status: 'not_sent'
      });
      outputId = output.id; // Use real UUID
    }

    console.log('Testing EmailService.sendGreetingEmail with ID:', outputId);
    const result = await EmailService.sendGreetingEmail(outputId);
    console.log('EmailService success result:', result);

    if (result.email_status === 'sent') {
      console.log('SUCCESS! Email status updated to sent.');
    } else {
      console.error('FAILED! Email status is', result.email_status);
    }
  } catch (error) {
    console.error('TEST FAILED with error:', error);
  } finally {
    // Restore real DB
    fs.copyFileSync('src/config/db.js.bak', 'src/config/db.js');
    fs.unlinkSync('src/config/db.js.bak');
    console.log('Restored db.js');
  }
}

testEmail();
