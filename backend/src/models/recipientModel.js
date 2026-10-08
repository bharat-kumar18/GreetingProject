const pool = require('../config/db');

class RecipientModel {
  static async findAll() {
    const result = await pool.query('SELECT * FROM recipients ORDER BY created_at DESC');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM recipients WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(data) {
    const { name, email, occasion, greeting_date, message } = data;
    const result = await pool.query(
      `INSERT INTO recipients (name, email, occasion, greeting_date, message)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, occasion, greeting_date || null, message || null]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { name, email, occasion, greeting_date, message } = data;
    const result = await pool.query(
      `UPDATE recipients
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           occasion = COALESCE($3, occasion),
           greeting_date = $4,
           message = $5,
           updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [name, email, occasion, greeting_date !== undefined ? greeting_date : null, message !== undefined ? message : null, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM recipients WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = RecipientModel;
