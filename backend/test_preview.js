const fs = require('fs/promises');
const path = require('path');

async function runTests() {
  const baseUrl = 'http://localhost:3000/api/generation/preview';
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
    // Wait for server to start if running via mock
    await new Promise(r => setTimeout(r, 1000));

    // Create a dummy SVG file for the template
    const templatePath = path.resolve(__dirname, 'test-template.svg');
    await fs.writeFile(templatePath, `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><text x="50" y="50">{{name}}</text><text x="50" y="100">{{occasion}}</text><text x="50" y="150">{{message}}</text></svg>`);

    // 1. Valid preview
    let res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: 'tpl-1', recipientId: 'rec-1' })
    });
    let json = await res.json();
    if (res.status !== 200 || !json.success) console.log('ERROR:', json);
    assert(res.status === 200 && json.success === true && json.data.previewUrl.startsWith('data:image/png;base64,'), 'Valid preview returns base64 URL');

    // 2. Long text
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: 'tpl-1', recipientId: 'rec-2' })
    });
    json = await res.json();
    assert(res.status === 200 && json.success === true && json.data.previewUrl.startsWith('data:image/png;base64,'), 'Long text preview works');

    // 3. Missing template
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: 'invalid-tpl', recipientId: 'rec-1' })
    });
    json = await res.json();
    assert(res.status === 404 && json.error === 'Template not found', 'Missing template returns 404');

    // 4. Missing recipient
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: 'tpl-1', recipientId: 'invalid-rec' })
    });
    json = await res.json();
    assert(res.status === 404 && json.error === 'Recipient not found', 'Missing recipient returns 404');

    // 5. Invalid data (missing parameters)
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: 'tpl-1' })
    });
    json = await res.json();
    assert(res.status === 400 && json.error.includes('required'), 'Invalid data returns 400');

    // Cleanup
    await fs.unlink(templatePath).catch(()=>{});

    console.log(`\nPreview Tests finished: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runTests();
