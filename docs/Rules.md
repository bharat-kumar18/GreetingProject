# Project Rules

## Architecture Rules

1. Frontend never directly accesses PostgreSQL.
2. Controllers never contain complex rendering logic.
3. Rendering logic stays inside `services`.
4. Database queries stay separate from controllers as the project grows.
5. Template SVG remains generic.
6. Recipient-specific data is never hardcoded into templates.

## Placeholder Rules

Allowed:
- `{{name}}`
- `{{occasion}}`
- `{{date}}`
- `{{message}}`

Unknown placeholders should be reported during validation.

## File Rules

- Use lowercase kebab-case for API route files.
- Use camelCase for JS variables/functions.
- Use PascalCase for React components.
- Never commit `.env`.
- Never commit real email credentials.

## Output Rules

Example:
`birthday_rahul_sharma.png`

Generated files must be linked to a recipient and generation job.

## Git Rules

- `main` = stable branch.
- `develop` = integration branch.
- `feature/*` = individual feature work.
- Commit one logical change at a time.
