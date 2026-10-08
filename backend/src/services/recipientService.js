const fs = require('fs');
const csv = require('csv-parser');
const RecipientModel = require('../models/recipientModel');

class RecipientService {
  static validate(data) {
    const errors = [];
    const sanitized = {};

    // 1. Name
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.push('Name is required');
    } else {
      sanitized.name = data.name.trim();
      if (sanitized.name.length > 200) errors.push('Name must be under 200 characters');
    }

    // 2. Email
    if (!data.email || typeof data.email !== 'string' || data.email.trim() === '') {
      errors.push('Email is required');
    } else {
      sanitized.email = data.email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitized.email)) {
        errors.push('Invalid email format');
      }
      if (sanitized.email.length > 320) errors.push('Email must be under 320 characters');
    }

    // 3. Occasion
    if (!data.occasion || typeof data.occasion !== 'string' || data.occasion.trim() === '') {
      errors.push('Occasion is required');
    } else {
      sanitized.occasion = data.occasion.trim();
      if (sanitized.occasion.length > 100) errors.push('Occasion must be under 100 characters');
    }

    // 4. Greeting Date
    if (data.greeting_date && data.greeting_date.trim() !== '') {
      const parsedDate = new Date(data.greeting_date.trim());
      if (isNaN(parsedDate.getTime())) {
        errors.push('Invalid greeting_date format');
      } else {
        sanitized.greeting_date = parsedDate.toISOString().split('T')[0];
      }
    } else {
      sanitized.greeting_date = null;
    }

    // 5. Message
    if (data.message && data.message.trim() !== '') {
      sanitized.message = data.message.trim();
      if (sanitized.message.length > 1000) errors.push('Message must be under 1000 characters');
    } else {
      sanitized.message = null;
    }

    return { isValid: errors.length === 0, errors, sanitized };
  }

  static async createRecipient(data) {
    const { isValid, errors, sanitized } = this.validate(data);
    if (!isValid) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    return await RecipientModel.create(sanitized);
  }

  static async updateRecipient(id, data) {
    const { isValid, errors, sanitized } = this.validate(data);
    if (!isValid) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    const updated = await RecipientModel.update(id, sanitized);
    if (!updated) {
      throw new Error('Recipient not found');
    }
    return updated;
  }

  static async getAllRecipients() {
    return await RecipientModel.findAll();
  }

  static async getRecipientById(id) {
    const recipient = await RecipientModel.findById(id);
    if (!recipient) throw new Error('Recipient not found');
    return recipient;
  }

  static async deleteRecipient(id) {
    const deleted = await RecipientModel.delete(id);
    if (!deleted) throw new Error('Recipient not found');
    return deleted;
  }

  static async processCsvImport(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      const validRecords = [];
      let rowIndex = 1;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          rowIndex++;
          const validation = this.validate(data);
          
          if (validation.isValid) {
            validRecords.push(validation.sanitized);
          } else {
            errors.push({
              row: rowIndex,
              data: data,
              errors: validation.errors
            });
          }
        })
        .on('end', async () => {
          try {
            // Remove the temporary CSV file
            fs.unlinkSync(filePath);

            // If there are valid records, save them to the DB
            const savedRecords = [];
            for (const record of validRecords) {
              const saved = await RecipientModel.create(record);
              savedRecords.push(saved);
            }

            resolve({
              totalProcessed: rowIndex - 1,
              successCount: savedRecords.length,
              errorCount: errors.length,
              errors,
              savedRecords
            });
          } catch (e) {
            reject(e);
          }
        })
        .on('error', (err) => {
          try { fs.unlinkSync(filePath); } catch(e){}
          reject(err);
        });
    });
  }
}

module.exports = RecipientService;
