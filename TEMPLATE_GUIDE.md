# SVG Template Creation Guide

This guide explains how to properly create, format, and export reusable SVG templates for the Personalized Greetings application.

## 1. Core Concept: Master Templates vs. Final Greetings

The SVG you upload acts as a **Reusable Master Template**. 
You should **NEVER** hardcode a specific recipient's name (like "Happy Birthday Rahul") into the template. 

Instead, use **Dynamic Placeholders** (like "Happy Birthday {{name}}"). The backend template engine will dynamically replace these placeholders with the actual recipient's information every time a preview or final image is generated.

### Static vs. Dynamic Content

* **Static Content**: Remains exactly the same for every single recipient. This includes:
  * Your company logos (e.g., the Logistics logo)
  * Background images or colors
  * General decorative illustrations
  * Borders
  * Standard greeting headings ("Happy Birthday", "Congratulations")
* **Design Elements**: All graphic structures
* **Dynamic Content**: Text that changes per recipient. This is represented by placeholders:
  * `{{name}}` (Required)
  * `{{occasion}}` (Required)
  * `{{date}}` (Optional)
  * `{{message}}` (Optional)

---

## 2. Step-by-Step Creation Process

You can use standard vector design software like **Figma**, **Adobe Illustrator**, or **Inkscape**.

1. **Design the Greeting**: Lay out your static content (backgrounds, illustrations, logos).
2. **Add Text Placeholders**: Use the Text tool (`T`) to create editable text nodes where dynamic data should appear.
   * Type exactly `{{name}}` where the recipient's name goes.
   * Type exactly `{{occasion}}` where the occasion name goes.
   * Do the same for `{{message}}` or `{{date}}` if your design supports them.
3. **Format the Placeholders**: You can style these placeholders (font size, color, font family). The backend will preserve your styling when replacing the text.
4. **Group and Organize**: Keep your SVG organized. 
5. **Export**: Export the design as an SVG file. **(CRITICAL: See the Export Rules below)**.

---

## 3. Critical Export Rules (Must Read)

If your SVG gets rejected during upload with `Missing required placeholder`, it is almost always caused by one of these two export mistakes:

### Rule A: Do NOT Convert Text to Paths (Outlines)
For the backend to replace `{{name}}` with "Rahul", the placeholder **must exist as editable `<text>`**.
* **Illustrator**: When exporting to SVG, ensure "Font" is set to "SVG" or "Editable Text". Do NOT select "Convert to Outlines" or "Paths".
* **Figma**: Figma generally exports text natively. If you accidentally flattened or outlined the text layer (`Ctrl/Cmd + Shift + O`), undo it. It must remain a text layer.
* **Inkscape**: Do not use "Object to Path" on your text nodes.

If the text is converted to a vector path, the backend sees only a shape, not the characters `{{name}}`, and will reject the template.

### Rule B: Avoid Styling Partial Words
Do not apply different colors or styles to parts of the placeholder. For example, if you color `{{` in red and `name}}` in blue, your design tool will split the word into multiple `<tspan>` tags. The backend validator will fail to detect the complete string because the SVG source code physically splits it into pieces.
* Always style the entire `{{name}}` block uniformly.

### Rule C: Embed Images (No External Links)
Our backend image renderer (Sharp) blocks external network requests for security. 
* Do **NOT** use linked images like `<image href="http://example.com/logo.png">` or `<image href="./local_logo.png">`.
* **Always Embed** raster graphics (PNGs/JPGs) as Base64. (In Illustrator, choose "Embed" instead of "Link" in SVG options. Figma does this automatically).

---

## 4. How the System Processes Your Upload

1. **Validation**: The system reads the raw SVG code. It securely searches for `{{name}}` and `{{occasion}}` using regex that tolerates typical formatting spaces. If it can't find them, or if it finds external `<image>` links, it instantly rejects the file.
2. **Storage**: If valid, the untouched SVG is saved as a Master Template.
3. **Preview/Generation**: When you select a recipient, the `templateEngine` loads a copy of the Master Template in memory, securely swaps `{{name}}` with the recipient's real name using Regex replacement (preserving your exact `<text>` coordinates and styles), and renders a personalized image for you.
