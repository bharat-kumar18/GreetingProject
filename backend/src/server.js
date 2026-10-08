const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://greeting-frontend-rwsn.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Greeting API is running' });
});

const templateRoutes = require('./routes/templateRoutes');
app.use('/api/templates', templateRoutes);

const recipientRoutes = require('./routes/recipientRoutes');
app.use('/api/recipients', recipientRoutes);

const generationRoutes = require('./routes/generationRoutes');
app.use('/api/generation', generationRoutes);

const emailRoutes = require('./routes/emailRoutes');
app.use('/api/email', emailRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// Serve static templates
app.use('/backend/templates', express.static(path.join(__dirname, '../templates')));

const PORT = process.env.PORT || 3000;

async function startServer() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Add your PostgreSQL connection string to backend/.env.');
  } else {
    try {
      await pool.query('SELECT 1');
      console.log('PostgreSQL connected successfully');
    } catch (error) {
      console.error('PostgreSQL connection failed:', error.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
