const pool = require('../config/db');

class DashboardService {
  static async getStats() {
    const templatesQuery = 'SELECT COUNT(*) FROM templates';
    const recipientsQuery = 'SELECT COUNT(*) FROM recipients';
    const outputsQuery = 'SELECT COUNT(*) FROM generated_outputs';

    const [templatesResult, recipientsResult, outputsResult] = await Promise.all([
      pool.query(templatesQuery),
      pool.query(recipientsQuery),
      pool.query(outputsQuery)
    ]);

    return {
      totalTemplates: parseInt(templatesResult.rows[0].count, 10),
      totalRecipients: parseInt(recipientsResult.rows[0].count, 10),
      generatedImages: parseInt(outputsResult.rows[0].count, 10)
    };
  }
}

module.exports = DashboardService;
