const fs = require('fs');
const path = require('path');
const FormData = require('form-data');


async function runTests() {
  let passed = 0;
  let failed = 0;
  const baseUrl = 'http://localhost:3000/api/templates';

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
    // 1. GET /api/templates
    let res = await fetch(baseUrl);
    let json = await res.json();
    assert(res.status === 200 && json.success === true && Array.isArray(json.data), 'GET /api/templates works');

    // 2. Create valid template
    const validSvgPath = path.resolve(__dirname, 'test.svg');
    const validSvgBlob = new Blob([fs.readFileSync(validSvgPath)], { type: 'image/svg+xml' });
    
    // Instead of using node-fetch which might have formData issues, let's just use form-data package or built in fetch with FormData.
    const form = new FormData();
    form.append('name', 'Test Template');
    form.append('occasion', 'Test Occasion');
    form.append('file', fs.createReadStream(validSvgPath));

    const postRes = await new Promise((resolve, reject) => {
      form.submit(baseUrl, (err, res) => {
        if (err) reject(err);
        else {
          let body = '';
          res.on('data', chunk => body += chunk.toString());
          res.on('end', () => {
            res.data = JSON.parse(body);
            resolve(res);
          });
        }
      });
    });

    assert(postRes.statusCode === 201 && postRes.data.success === true, 'Valid SVG template can be created');
    const templateId = postRes.data.data.id;

    // 3. GET /api/templates/:id
    res = await fetch(`${baseUrl}/${templateId}`);
    json = await res.json();
    assert(res.status === 200 && json.data.id === templateId, 'GET /api/templates/:id works');

    // 4. Update template
    res = await fetch(`${baseUrl}/${templateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Name' })
    });
    json = await res.json();
    assert(res.status === 200 && json.data.name === 'Updated Name', 'Update works');

    // 5. Create invalid SVG template
    const invalidSvgPath = path.resolve(__dirname, 'test-invalid.svg');
    const invalidForm = new FormData();
    invalidForm.append('name', 'Invalid Template');
    invalidForm.append('occasion', 'Test');
    invalidForm.append('file', fs.createReadStream(invalidSvgPath));

    const invalidRes = await new Promise((resolve, reject) => {
      invalidForm.submit(baseUrl, (err, res) => {
        if (err) reject(err);
        else {
          let body = '';
          res.on('data', chunk => body += chunk.toString());
          res.on('end', () => {
            res.data = JSON.parse(body);
            resolve(res);
          });
        }
      });
    });
    assert(invalidRes.statusCode === 400 && invalidRes.data.error.includes('Unsupported placeholder'), 'Invalid SVG is rejected');

    // 6. Delete template
    res = await fetch(`${baseUrl}/${templateId}`, { method: 'DELETE' });
    json = await res.json();
    assert(res.status === 200 && json.success === true, 'Delete works');

    // 7. Verify the deleted template is no longer available
    res = await fetch(`${baseUrl}/${templateId}`);
    json = await res.json();
    assert(res.status === 404, 'Deleted template is unavailable by ID');

    res = await fetch(baseUrl);
    json = await res.json();
    assert(res.status === 200 && !json.data.some(template => template.id === templateId), 'Deleted template is removed from the catalog');

    console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);

  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

runTests();
