# PRD — Personalized Greeting Image Automation

## 1. Problem

Organizations may need hundreds of greeting images. Manually editing every image is slow and error-prone.

## 2. Objective

Create one reusable greeting design and automatically generate personalized outputs for multiple recipients.

## 3. Required placeholders

| Placeholder | Required | Example |
|---|---|---|
| `{{name}}` | Yes | Rahul Sharma |
| `{{occasion}}` | Yes | Happy Birthday |
| `{{date}}` | No | 25 September 2026 |
| `{{message}}` | No | Have a fantastic year ahead! |

## 4. Functional Requirements

1. Store reusable greeting templates.
2. Support at least 3 visually different templates.
3. Accept recipient data from structured data.
4. Preview a personalized greeting.
5. Generate one image.
6. Generate images in batch.
7. Validate missing/invalid data.
8. Handle long names/messages.
9. Use meaningful output filenames.
10. Map each generated image to the correct email address.
11. Keep template, recipient, rendering, and email concerns separate.

## 5. Bonus Requirements

- Occasion-based template selection.
- Preview before generation.
- Automatic text wrapping/resizing.
- Multiple output sizes.
- Email sending through a test account.

## 6. Non-functional Requirements

- Maintainable code.
- Clear API boundaries.
- Safe input handling.
- No credentials in source code.
- Scalable batch design.

## 7. Acceptance Criteria

A sample dataset containing at least 5 recipients can generate at least 5 personalized images from reusable templates without manual image editing.
