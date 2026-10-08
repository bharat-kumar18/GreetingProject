const EventEmitter = require('events');

class MockPool extends EventEmitter {
  constructor() {
    super();
    this.idCounter = 1;
    this.recipients = [
      { id: 'rec-1', name: 'Alice Smith', email: 'alice@example.com', occasion: 'Birthday', message: 'Wishing you a day filled with happiness and a year filled with joy.', greeting_date: '2026-10-15' },
      { id: 'rec-2', name: 'Bob Jones', email: 'bob@example.com', occasion: 'Birthday', message: 'Happy Birthday! Hope all your wishes come true.', greeting_date: '2026-10-18' },
      { id: 'rec-3', name: 'Charlie & Diana', email: 'charlie.diana@example.com', occasion: 'Anniversary', message: 'Happy Anniversary to a wonderful couple!', greeting_date: '2026-11-01' },
      { id: 'rec-4', name: 'Sir Reginald Hargreeves', email: 'reginald@umbrella.com', occasion: 'Anniversary', message: 'Here is a very long message that should test the text wrapping capabilities of the rendering engine to ensure nothing clips or overflows off the right edge of the card.', greeting_date: '2026-11-05' },
      { id: 'rec-5', name: 'Emma Watson', email: 'emma@example.com', occasion: 'Event', message: '', greeting_date: '2026-12-25' }
    ];
    this.templates = [
      { id: 'tpl-1', name: 'Test Template', occasion: 'Birthday', file_name: 'test.svg', file_path: require('path').resolve(__dirname, '../../test.svg'), is_active: true, deleted_at: null },
      { id: 'tpl-2', name: 'Vibrant Birthday', occasion: 'Birthday', file_name: 'birthday.svg', file_path: require('path').resolve(__dirname, '../../templates/birthday.svg'), is_active: true, deleted_at: null },
      { id: 'tpl-3', name: 'Elegant Anniversary', occasion: 'Anniversary', file_name: 'anniversary.svg', file_path: require('path').resolve(__dirname, '../../templates/anniversary.svg'), is_active: true, deleted_at: null }
    ];
    this.jobs = [];
    this.outputs = [];
  }
  async query(text, params) {
    if (text === 'SELECT 1') return { rows: [{ '?column?': 1 }] };
    
    if (text.includes('INSERT INTO recipients')) {
      const r = {
        id: `uuid-${this.idCounter++}`,
        name: params[0],
        email: params[1],
        occasion: params[2],
        greeting_date: params[3],
        message: params[4],
        created_at: new Date()
      };
      this.recipients.push(r);
      return { rows: [r] };
    }
    
    if (text.includes('SELECT * FROM recipients ORDER BY created_at DESC')) {
      return { rows: this.recipients };
    }
    
    if (text.includes('SELECT * FROM templates WHERE deleted_at IS NULL')) {
      return { rows: this.templates.filter(t => t.deleted_at === null) };
    }
    
    if (text.includes('SELECT * FROM templates WHERE id = $1 AND deleted_at IS NULL')) {
      return { rows: this.templates.filter(t => t.id === params[0] && t.deleted_at === null) };
    }

    if (text.includes('SELECT * FROM templates WHERE id = $1')) {
      return { rows: this.templates.filter(t => t.id === params[0]) };
    }

    if (text.includes('UPDATE templates') && text.includes('SET deleted_at = NOW()')) {
      const template = this.templates.find(t => t.id === params[0] && t.deleted_at === null);
      if (template) {
        template.deleted_at = new Date();
        template.is_active = false;
        return { rows: [template] };
      }
      return { rows: [] };
    }

    if (text.includes('SELECT * FROM recipients WHERE id = $1')) {
      return { rows: this.recipients.filter(r => r.id === params[0]) };
    }

    if (text.includes('INSERT INTO generated_outputs')) {
      const o = {
        id: `out-${this.idCounter++}`,
        job_id: params[0],
        template_id: params[1],
        recipient_id: params[2],
        file_name: params[3],
        file_path: params[4],
        format: params[5],
        email_status: params[6],
        created_at: new Date()
      };
      if (!this.outputs) this.outputs = [];
      this.outputs.push(o);
      return { rows: [o] };
    }

    if (text.includes('INSERT INTO generation_jobs')) {
      const j = {
        id: `job-${this.idCounter++}`,
        template_id: params[0],
        total_count: params[1],
        success_count: 0,
        failed_count: 0,
        status: 'pending',
        created_at: new Date()
      };
      this.jobs.push(j);
      return { rows: [j] };
    }

    if (text.includes('UPDATE generation_jobs')) {
      const j = this.jobs.find(job => job.id === params[3]);
      if (j) {
        j.success_count = params[0];
        j.failed_count = params[1];
        j.status = params[2];
        if (params[2] === 'completed' || params[2] === 'failed') {
          j.completed_at = new Date();
        }
      }
      return { rows: [j] };
    }

    if (text.includes('SELECT * FROM generation_jobs WHERE id = $1')) {
      return { rows: this.jobs.filter(j => j.id === params[0]) };
    }

    if (text.includes('SELECT * FROM generated_outputs ORDER BY created_at DESC')) {
      return { rows: this.outputs || [] };
    }

    if (text.includes('SELECT * FROM generated_outputs WHERE id = $1')) {
      return { rows: (this.outputs || []).filter(o => o.id === params[0]) };
    }

    if (text.includes('UPDATE generated_outputs SET email_status = $1 WHERE id = $2')) {
      const o = (this.outputs || []).find(o => o.id === params[1]);
      if (o) {
        o.email_status = params[0];
        return { rows: [o] };
      }
      return { rows: [] };
    }

    if (text.includes('UPDATE generated_outputs') && text.includes("SET email_status = 'sending'")) {
      const o = (this.outputs || []).find(
        o => o.id === params[0] && o.email_status !== 'sent' && o.email_status !== 'sending'
      );
      if (o) {
        o.email_status = 'sending';
        return { rows: [o] };
      }
      return { rows: [] };
    }

    if (text.includes('UPDATE recipients')) {
      const idIndex = params.length - 1;
      const id = params[idIndex];
      const rIndex = this.recipients.findIndex(r => r.id === id);
      if (rIndex > -1) {
        if (params[0]) this.recipients[rIndex].name = params[0];
        if (params[1]) this.recipients[rIndex].email = params[1];
        if (params[2]) this.recipients[rIndex].occasion = params[2];
        if (params[3] !== null) this.recipients[rIndex].greeting_date = params[3];
        if (params[4] !== null) this.recipients[rIndex].message = params[4];
        return { rows: [this.recipients[rIndex]] };
      }
      return { rows: [] };
    }

    if (text.includes('DELETE FROM recipients')) {
      const r = this.recipients.find(r => r.id === params[0]);
      this.recipients = this.recipients.filter(r => r.id !== params[0]);
      return { rows: r ? [r] : [] };
    }
    
    return { rows: [] };
  }
}

const pool = new MockPool();
module.exports = pool;
