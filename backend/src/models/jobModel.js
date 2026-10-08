const pool = require('../config/db');

class JobModel {
  static async create(templateId, totalCount) {
    const result = await pool.query(
      `INSERT INTO generation_jobs (template_id, total_count, status)
       VALUES ($1, $2, 'pending') RETURNING *`,
      [templateId, totalCount]
    );
    return result.rows[0];
  }

  static async updateCounts(id, successCount, failedCount, status) {
    let completedAtClause = '';
    if (status === 'completed' || status === 'failed') {
      completedAtClause = ', completed_at = NOW()';
    }

    const result = await pool.query(
      `UPDATE generation_jobs
       SET success_count = $1, failed_count = $2, status = $3${completedAtClause}
       WHERE id = $4 RETURNING *`,
      [successCount, failedCount, status, id]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM generation_jobs WHERE id = $1', [id]);
    return result.rows[0];
  }
}

module.exports = JobModel;
