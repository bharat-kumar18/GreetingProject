# Personalized Greeting Image Automation

A full-stack system for generating personalized greeting images from reusable SVG templates.

## Assignment Goal

One reusable visual template can produce many personalized images by replacing:
- `{{name}}`
- `{{occasion}}`
- `{{date}}`
- `{{message}}`

The system supports template management, recipient data, preview, single generation, and batch generation.

## Stack

### Frontend
- React + Vite
- React Router
- Axios
- CSS

### Backend
- Node.js
- Express
- PostgreSQL
- `pg`
- Sharp for SVG -> PNG rendering
- Multer for uploads
- Nodemailer-ready email service

### Storage
- SVG templates: `backend/templates/`
- Generated images: `backend/storage/generated/`
- Uploaded data: `backend/storage/uploads/`

## Project Flow

```text
User
  |
  v
React Frontend
  |
  | REST API
  v
Express Backend
  |
  +--> PostgreSQL (templates, recipients, jobs)
  |
  +--> SVG Template Engine
  |       |
  |       +--> {{name}}
  |       +--> {{occasion}}
  |       +--> {{date}}
  |       +--> {{message}}
  |
  v
Sharp Renderer
  |
  v
PNG/JPG output
  |
  +--> Preview
  +--> Download
  +--> Email mapping
```

## Run

Run the backend and frontend in separate PowerShell terminals. The frontend UI is served at `http://localhost:5173`; the backend API runs at `http://localhost:3000`. Opening the backend root redirects to the frontend.

### Backend
```bash
Set-Location .\backend
npm install
Copy-Item .env.example .env
# Edit .env and set DATABASE_URL to a valid PostgreSQL connection string
# Gmail: set SMTP_USER and MAIL_FROM to your Gmail address, and SMTP_PASSWORD to a Google App Password.
npm run dev
```

The email action is available for each generated image in the Generated Images page. For Gmail, enable 2-Step Verification and create an App Password in your Google Account; put that App Password in `SMTP_PASSWORD` in `backend/.env` (never use your normal Google account password). The configured sender address must be the Gmail account used for SMTP authentication. `TEST_MODE=true` simulates the send without delivering email; simulated sends are not marked as delivered.

From inside `backend`, you can also run `node server.js`. The actual server implementation is in `backend\src\server.js`. To start it from the project root, run `npm --prefix .\backend start` after installing dependencies.

You can also run rendering tests in the backend:
```bash
node test_rendering.js
node run_tests.js
```

When upgrading an existing database, apply this one-time schema change before starting the updated backend:
```sql
ALTER TABLE templates ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
```
New databases receive this column from `backend/database/schema.sql`.

### Frontend
```bash
Set-Location .\frontend
npm install
npm run dev
```

Open `http://localhost:5173` to use the greeting dashboard. Use `npm run build` in `frontend` to create a production build.

## Important Rule

Do not put recipient-specific text directly into an SVG template. Templates remain reusable. Personalization happens only through placeholder data.
