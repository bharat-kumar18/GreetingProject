const fs = require('fs/promises');
const path = require('path');

async function runTests() {
  const baseUrl = 'http://localhost:3000/api/generation';
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

    // Ensure output directory exists and is clean
    const outputDir = path.resolve(__dirname, 'storage', 'generated');
    await fs.mkdir(outputDir, { recursive: true });

    // 1. Valid generate
    let res = await fetch(`${baseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: 'tpl-1', recipientId: 'rec-1' })
    });
    let json = await res.json();
    if (res.status !== 201 || !json.success) console.log('ERROR:', json);
    assert(res.status === 201 && json.success === true && json.data.file_name, 'Valid generation returns 201 and output record');
    const outputId = json.data.id;
    const expectedFilename = json.data.file_name;

    // Check if the actual file was created
    const fileExists = await fs.access(path.join(outputDir, expectedFilename)).then(()=>true).catch(()=>false);
    assert(fileExists, 'Generated PNG file exists on disk');

    // 2. GET all outputs
    res = await fetch(`${baseUrl}/outputs`);
    json = await res.json();
    assert(res.status === 200 && json.success === true && json.data.length > 0, 'GET /outputs works');

    // 3. GET output by id
    res = await fetch(`${baseUrl}/outputs/${outputId}`);
    json = await res.json();
    assert(res.status === 200 && json.success === true && json.data.id === outputId, 'GET /outputs/:id works');

    // 4. Download output
    res = await fetch(`${baseUrl}/outputs/${outputId}/download`);
    assert(res.status === 200 && res.headers.get('content-type').includes('image/png'), 'Download endpoint successfully serves the PNG');

    // 5. Invalid input
    res = await fetch(`${baseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: 'tpl-1' }) // missing recipient
    });
    json = await res.json();
    assert(res.status === 400, 'Invalid data returns 400');

    // Cleanup
    await fs.unlink(templatePath).catch(()=>{});
    await fs.unlink(path.join(outputDir, expectedFilename)).catch(()=>{});
    const expectedSvgFilename = expectedFilename.replace('.png', '.svg');
    await fs.unlink(path.join(outputDir, expectedSvgFilename)).catch(()=>{});

    console.log(`\nGeneration Tests finished: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runTests();
