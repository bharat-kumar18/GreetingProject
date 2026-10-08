const path = require('path');
const fs = require('fs/promises');
const RenderingService = require('./src/services/renderingService');
const { replacePlaceholders } = require('./src/utils/templateEngine');

async function createTestTemplate() {
  const templatePath = path.resolve(__dirname, 'test-template.svg');
  const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <text id="name" x="50" y="50">{{name}}</text>
  <text id="occ" x="50" y="100">{{occasion}}</text>
  <text id="date" x="50" y="150">{{date}}</text>
  <text id="msg" x="50" y="200">{{message}}</text>
</svg>`;
  await fs.writeFile(templatePath, svg, 'utf8');
  return templatePath;
}

async function createInvalidTestTemplate() {
  const templatePath = path.resolve(__dirname, 'test-invalid-template.svg');
  const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <text id="name" x="50" y="50">{{name}}</text>
  <text id="occ" x="50" y="100">{{occasion}}</text>
  <text id="date" x="50" y="150">{{unsupported}}</text>
</svg>`;
  await fs.writeFile(templatePath, svg, 'utf8');
  return templatePath;
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const templatePath = await createTestTemplate();
    const invalidTemplatePath = await createInvalidTestTemplate();

    // 1. Normal name & 2. empty optional message & 3. SVG to PNG conversion
    let res = await RenderingService.renderGreeting(templatePath, {
      name: 'Rahul Sharma',
      occasion: 'Happy Birthday'
    });
    assert(res.success && res.pngFile === 'happy_birthday_rahul_sharma.png', 'Normal name, empty optional message, filename sanitization, SVG to PNG conversion works');

    // 4. Special characters (XML escaping)
    const xmlSvg = replacePlaceholders(`<svg>{{name}} {{occasion}}</svg>`, { name: 'Me & You <3', occasion: '"Quotes"' });
    assert(xmlSvg.includes('Me &amp; You &lt;3') && xmlSvg.includes('&quot;Quotes&quot;'), 'Special characters are properly XML escaped');

    // 5. Long name
    res = await RenderingService.renderGreeting(templatePath, {
      name: 'Hubert Blaine Wolfeschlegelsteinhausenbergerdorff Sr.',
      occasion: 'Anniversary'
    });
    assert(res.pngFile.includes('anniversary_hubert_blaine_wolfeschlegelsteinhausen'), 'Long name handles correctly (renders properly)');

    // 6. Long message (Text wrapping)
    const longMessage = 'This is a very long message that should definitely be wrapped onto multiple lines so it does not overflow the SVG boundaries!';
    const wrappedSvg = replacePlaceholders(`<svg><text x="50">{{message}}</text></svg>`, { name: 'A', occasion: 'B', message: longMessage });
    assert(wrappedSvg.includes('<tspan x="50" dy="1.2em">'), 'Long message triggers text wrapping into <tspan> tags');

    // 7. Missing required placeholder
    try {
      await RenderingService.renderGreeting(templatePath, { occasion: 'Only Occasion' });
      assert(false, 'Missing required placeholder should throw');
    } catch (e) {
      assert(e.message.includes('Missing required placeholders'), 'Missing required placeholder properly throws error');
    }

    // 8. Unsupported placeholder
    try {
      await RenderingService.renderGreeting(invalidTemplatePath, { name: 'A', occasion: 'B' });
      assert(false, 'Unsupported placeholder should throw');
    } catch (e) {
      assert(e.message.includes('Unsupported placeholder found'), 'Unsupported placeholder properly throws error');
    }

    console.log(`\nRendering Tests finished: ${passed} passed, ${failed} failed.`);

    // Cleanup
    await fs.unlink(templatePath).catch(()=>{});
    await fs.unlink(invalidTemplatePath).catch(()=>{});

  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

runTests();
