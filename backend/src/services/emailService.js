const nodemailer = require('nodemailer');
const fs = require('fs/promises');
const path = require('path');
const OutputModel = require('../models/outputModel');
const RecipientModel = require('../models/recipientModel');
const TemplateModel = require('../models/templateModel');

class EmailService {
  static async sendGreetingEmail(outputId) {
    let sendClaimed = false;
    try {
      // 1. Fetch output
      const output = await OutputModel.findById(outputId);
      if (!output) throw new Error('Output not found');
      if (output.email_status === 'sent') throw new Error('Email already sent');
      if (output.email_status === 'sending') throw new Error('Email is already sending');

      const isTestMode = process.env.TEST_MODE === 'true';
      const smtpUser = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
      const smtpPassword = (process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '').trim();
      if (!isTestMode && (!process.env.SMTP_HOST || !smtpUser || !smtpPassword)) {
        throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in backend/.env.');
      }

      // Claim the output atomically so duplicate requests cannot send twice.
      const claimedOutput = await OutputModel.claimEmailSend(outputId);
      if (!claimedOutput) {
        throw new Error('Email is already sending or has already been sent');
      }
      sendClaimed = true;

      // 3. Fetch recipient
      const recipient = await RecipientModel.findById(output.recipient_id);
      if (!recipient) throw new Error('Recipient not found');

      // 4. Fetch template to get the occasion for the subject line
      const template = await TemplateModel.findById(output.template_id);
      
      // 5. Send email
      if (isTestMode) {
        console.log(`[TEST MODE] Would send greeting email with attachment ${output.file_name}`);
      } else {
        const smtpPort = Number.parseInt(process.env.SMTP_PORT || '587', 10);
        if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
          throw new Error('SMTP_PORT must be a valid port number between 1 and 65535.');
        }
        const attachmentPath = path.resolve(
          __dirname,
          '../../../backend/storage/generated',
          path.basename(output.file_name)
        );
        await fs.access(attachmentPath);

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPassword,
          },
        });

        const subject = `Your Personalized ${template ? template.occasion : 'Greeting'}!`;
        const text = `Hi ${recipient.name},\n\nWe have generated a personalized greeting just for you!\n\n${recipient.message ? `"${recipient.message}"\n\n` : ''}Please find it attached.\n\nBest regards,\nThe Greeting Team`;
        const html = `<p>Hi <strong>${recipient.name}</strong>,</p><p>We have generated a personalized greeting just for you!</p>${recipient.message ? `<blockquote>${recipient.message}</blockquote>` : ''}<p>Please find it attached.</p><p>Best regards,<br/>The Greeting Team</p>`;

        await transporter.sendMail({
          from: process.env.MAIL_FROM || process.env.SMTP_FROM || smtpUser,
          to: recipient.email,
          subject: subject,
          text: text,
          html: html,
          attachments: [
            {
              filename: output.file_name,
              path: attachmentPath,
              cid: 'greeting-image'
            }
          ]
        });
      }

      // Test mode deliberately never marks an undelivered email as sent.
      const updatedOutput = await OutputModel.updateEmailStatus(outputId, isTestMode ? 'simulated' : 'sent');
      return updatedOutput;

    } catch (error) {
      // Revert or mark failed if we know the output exists
      if (outputId && sendClaimed) {
        try {
          const output = await OutputModel.findById(outputId);
          if (output && output.email_status === 'sending') {
            await OutputModel.updateEmailStatus(outputId, 'failed');
          }
        } catch (e) {
          console.error('Failed to update email status to failed:', e);
        }
      }
      throw error;
    }
  }
}

module.exports = EmailService;
