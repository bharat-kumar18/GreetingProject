const EmailService = require('../services/emailService');

class EmailController {
  static async sendEmail(req, res) {
    try {
      const { outputId } = req.body;
      if (!outputId) {
        return res.status(400).json({ success: false, error: 'outputId is required' });
      }

      const updatedOutput = await EmailService.sendGreetingEmail(outputId);

      res.status(200).json({
        success: true,
        data: updatedOutput,
        message: process.env.TEST_MODE === 'true' ? 'Simulated email sent' : 'Email sent successfully'
      });
    } catch (error) {
      if (error.message === 'Output not found' || error.message === 'Recipient not found') {
        res.status(404).json({ success: false, error: error.message });
      } else if (error.message === 'Email already sent' || error.message === 'Email is already sending' || error.message === 'Email is already sending or has already been sent') {
        res.status(400).json({ success: false, error: error.message });
      } else {
        console.error('Email error:', error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
      }
    }
  }
}

module.exports = EmailController;
