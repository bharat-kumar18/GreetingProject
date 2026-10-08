# MEMORY — Project Continuity File

This file is the project's source of truth for continuity between development sessions.

## Current Project

Personalized Greeting Image Generation & Email-Ready Automation.

## Locked Stack

Frontend: React + Vite
Backend: Node.js + Express
Database: PostgreSQL
Renderer: Sharp
Template format: SVG
API style: REST

## Core Placeholders

`{{name}}`
`{{occasion}}`
`{{date}}`
`{{message}}`

## Locked Flow

```text
Template SVG
  +
Recipient Data
  |
  v
Validation
  |
  v
Placeholder Engine
  |
  v
Rendered SVG
  |
  v
Sharp
  |
  v
PNG/JPG
  |
  +--> Preview
  +--> Download
  +--> Email
```

## Current Phase

All Phases (1-15) and Hardening successfully completed.

## Next Phase

Project is ready for production deployment.

## Recent Fixes
- Implemented real dashboard statistics linking frontend UI to backend SQL counts via a dedicated API `/api/dashboard/stats`.

## Important Decisions

1. Keep SVG templates reusable.
2. Keep rendering logic out of React.
3. Keep email logic out of the rendering service.
4. Store metadata in PostgreSQL.
5. Store generated files separately.
6. Build single-image generation before batch generation.
7. Build preview before final generation.

## Do Not Break

Do not rename placeholders without updating:
- frontend forms
- backend validator
- rendering service
- documentation
- sample data

## Assignment Evidence

Minimum target:
- 3 templates
- 5 recipients
- 5 generated personalized images
- README
- email mapping explanation
