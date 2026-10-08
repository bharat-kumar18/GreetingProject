const pool = require('../config/db');

class TemplateModel {
  static async findAll() {
    const query = 'SELECT * FROM templates WHERE deleted_at IS NULL ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM templates WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findActiveById(id) {
    const query = 'SELECT * FROM templates WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(data) {
    const { name, occasion, file_name, file_path, width, height, is_active = true } = data;
    const query = `
      INSERT INTO templates (name, occasion, file_name, file_path, width, height, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [name, occasion, file_name, file_path, width, height, is_active];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }
    
    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = NOW()`);
    
    values.push(id);
    const query = `
      UPDATE templates 
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = `
      UPDATE templates
      SET deleted_at = NOW(), is_active = FALSE, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = TemplateModel;
