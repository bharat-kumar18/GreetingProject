# Design & UI Specification

## Pages

### 1. Dashboard
- Total templates
- Total recipients
- Generated images
- Recent generation jobs

### 2. Templates
- Template cards
- Occasion
- Preview
- Active/inactive
- Create/upload template

### 3. Recipient Import
- CSV upload
- Table preview
- Validation errors
- Import button

### 4. Personalize / Preview
- Select template
- Enter/select recipient
- Show live preview
- Generate image

### 5. Batch Generation
- Select template
- Show recipient count
- Generate all
- Progress
- Success/failure summary

### 6. Generated Outputs
- Recipient name
- Email
- Occasion
- Filename
- Preview
- Download
- Email status

## UX Rules

1. Preview before final generation.
2. Never silently ignore invalid recipients.
3. Show which rows failed.
4. Long messages should wrap rather than overflow.
5. Buttons should show loading states.
6. Generated filename should be deterministic.
