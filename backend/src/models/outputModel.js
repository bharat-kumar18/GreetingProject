const pool = require('../config/db');

class OutputModel {
  static async create(data) {
    const { job_id, template_id, recipient_id, file_name, file_path, format, email_status } = data;
    const result = await pool.query(
      `INSERT INTO generated_outputs (job_id, template_id, recipient_id, file_name, file_path, format, email_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [job_id || null, template_id, recipient_id, file_name, file_path, format || 'png', email_status || 'not_sent']
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query('SELECT * FROM generated_outputs ORDER BY created_at DESC');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM generated_outputs WHERE id = $1', [id]);
    return result.rows[0];
  }
  static async updateEmailStatus(id, status) {
    const result = await pool.query(
      'UPDATE generated_outputs SET email_status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) throw new Error('Output not found');
    return result.rows[0];
  }

  static async claimEmailSend(id) {
    const result = await pool.query(
      `UPDATE generated_outputs
       SET email_status = 'sending'
       WHERE id = $1 AND email_status NOT IN ('sent', 'sending')
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = OutputModel;
