# AI DEVELOPMENT INSTRUCTIONS

This project is developed phase by phase.

Before making any code changes:

1. Read README.md.
2. Read PRD.md.
3. Read Architecture.md.
4. Read Rules.md.
5. Read Design.md.
6. Read Task.md.
7. Read MEMORY.md.

These files are the project's source of truth.

Do not skip documentation review.

## Development Rules

- **PERMANENT RULE: These files are the source of truth.**
- Work only on the current requested phase.
- Do not implement future phases unless explicitly requested.
- Do not change architecture without approval.
- Do not delete existing working functionality.
- Reuse existing code before creating duplicate code.
- Keep controllers thin.
- Keep business logic in services.
- Keep database logic separated from controllers.
- Keep frontend API calls inside services.
- Validate all user input.
- Never expose environment secrets.
- Never commit .env.
- Add proper error handling.
- Add loading and error states to frontend.
- Update documentation after completing a phase.
- Update MEMORY.md after completing a phase.
- Update Task.md checkboxes after completing a phase.

## Completion Rule

A phase is NOT complete just because code was written.

A phase is complete only when:

1. Implementation is finished.
2. Relevant tests/API tests are performed.
3. Errors are fixed.
4. Documentation is updated.
5. MEMORY.md is updated.
6. Task.md is updated.
7. The project still starts successfully.