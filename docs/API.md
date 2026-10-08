# API Documentation

## Endpoints

### 1. Templates
- `GET /api/templates` - Get all reusable SVG templates.
- `GET /api/templates/:id` - Get a specific template.
- `POST /api/templates` - Upload a new SVG template.
- `DELETE /api/templates/:id` - Remove a template from the catalog. This is a soft delete: generated outputs and email history are retained, and the template cannot be used for new generations.

### 2. Recipients
- `GET /api/recipients` - Get all recipients.
- `POST /api/recipients/import` - Bulk import recipients via CSV.
- `PUT /api/recipients/:id` - Update recipient info.
- `DELETE /api/recipients/:id` - Delete recipient.

### 3. Generation (Core)
- `POST /api/generation/preview` 
  - **Body:** `{ templateId: string, recipientId: string }`
  - **Response:** base64 PNG data URL to instantly show on frontend.
- `POST /api/generation/generate`
  - **Body:** `{ templateId: string, recipientId: string }`
  - **Response:** Creates a single physical image and returns Output record.
- `POST /api/generation/batch`
  - **Body:** `{ templateId: string, recipientIds: string[] }`
  - **Response:** Creates a Job record and triggers background rendering.

### 4. Outputs & Jobs
- `GET /api/generation/outputs` - View generated image metadata.
- `GET /api/generation/outputs/:id/download` - Securely download generated PNGs.
- `GET /api/generation/jobs/:id` - Track progress of batch generation.

### 5. Email
- `POST /api/email/send`
  - **Body:** `{ outputId: string }`
  - **Action:** Looks up the related recipient and generated PNG, sends via SMTP, and updates the email status. For Gmail, configure `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER`, `SMTP_PASSWORD` (a Google App Password), and `MAIL_FROM` in `backend/.env`. `TEST_MODE=true` simulates a send and records `simulated`, not `sent`.
