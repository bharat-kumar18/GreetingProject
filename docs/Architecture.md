# Architecture

## 1. High-Level Architecture

```text
                    +----------------------+
                    |    React Frontend    |
                    |----------------------|
                    | Templates             |
                    | Recipients            |
                    | Preview               |
                    | Batch Generate        |
                    +----------+-----------+
                               |
                               | HTTP/JSON
                               v
                    +----------------------+
                    |   Express REST API    |
                    |----------------------|
                    | Dashboard Controller  |
                    | Template Controller   |
                    | Recipient Controller  |
                    | Generation Controller |
                    | Email Controller      |
                    +----------+-----------+
                               |
             +-----------------+------------------+
             |                                    |
             v                                    v
     +---------------+                    +---------------+
     | PostgreSQL    |                    | SVG Engine    |
     |---------------|                    |---------------|
     | templates     |                    | placeholders  |
     | recipients    |                    | wrapping     |
     | jobs          |                    | escaping     |
     | outputs       |                    +-------+-------+
     +---------------+                            |
                                                  v
                                           +-------------+
                                           | Sharp       |
                                           | PNG/JPG     |
                                           +------+------+
                                                  |
                                                  v
                                         generated images
```

## 2. Layer Responsibilities

### Frontend
Only presentation and user interaction.

### Controller
Receives request, validates basic request shape, calls service.

### Service
Contains business logic.

### Repository / Database
Stores metadata only. Binary generated images should be stored on filesystem or object storage in production.

### Rendering Engine
Takes an SVG template and recipient data and returns a rendered image.

### Email Service
Receives recipient email + generated output path and handles delivery.

## 3. Data Flow

```text
Recipient CSV/JSON
      |
      v
Validation
      |
      v
Recipient records
      |
      +------> Template selection
      |
      v
Placeholder replacement
      |
      v
SVG
      |
      v
Sharp
      |
      v
PNG
      |
      v
Output record
      |
      +------> Preview / Download / Email
```

## 4. Security

- Environment variables for DB/email secrets.
- File type validation.
- Filename sanitization.
- SVG input should be treated as untrusted if users can upload arbitrary SVGs.
- Never expose filesystem paths directly.
