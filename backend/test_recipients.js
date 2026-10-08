const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function runTests() {
  const baseUrl = 'http://localhost:3000/api/recipients';
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
    // Wait a bit for server
    await new Promise(r => setTimeout(r, 1000));

    // 1. POST valid recipient
    let res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: ' John Doe ',
        email: ' JOHN@doe.com ',
        occasion: 'Birthday'
      })
    });
    let json = await res.json();
    assert(res.status === 201 && json.data.name === 'John Doe' && json.data.email === 'john@doe.com', 'Create valid recipient (whitespace trimmed)');
    const rId = json.data.id;

    // 2. GET all
    res = await fetch(baseUrl);
    json = await res.json();
    assert(res.status === 200 && Array.isArray(json.data) && json.data.length > 0, 'GET /api/recipients works');

    // 3. GET by id
    res = await fetch(`${baseUrl}/${rId}`);
    json = await res.json();
    assert(res.status === 200 && json.data.id === rId, 'GET /api/recipients/:id works');

    // 4. PUT update
    res = await fetch(`${baseUrl}/${rId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John Doe', email: 'john@doe.com', occasion: 'Anniversary' })
    });
    json = await res.json();
    assert(res.status === 200 && json.data.occasion === 'Anniversary', 'PUT /api/recipients/:id works');

    // 5. POST invalid recipient (missing name)
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad@bad.com', occasion: 'Missing Name' })
    });
    json = await res.json();
    assert(res.status === 400 && json.error.includes('Name is required'), 'POST invalid recipient fails with 400');

    // 6. CSV Import
    const csvContent = `name,email,occasion,greeting_date,message
Alice,alice@example.com,Birthday,2024-10-01,Happy BD!
,bademail.com,None,,
Bob,bob@example.com,Anniversary,invalid-date,Cheers`;
    
    const csvPath = path.resolve(__dirname, 'test.csv');
    fs.writeFileSync(csvPath, csvContent);

    const form = new FormData();
    form.append('file', fs.createReadStream(csvPath));

    const csvRes = await new Promise((resolve, reject) => {
      form.submit(`${baseUrl}/import`, (err, res) => {
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

    // 207 Multi-Status since we have some valid, some invalid
    assert(csvRes.statusCode === 207, 'CSV Import returns 207 for mixed results');
    assert(csvRes.data.data.successCount === 1, 'CSV Import success count is correct');
    assert(csvRes.data.data.errorCount === 2, 'CSV Import error count is correct');
    
    // Check specific errors
    const errors = csvRes.data.data.errors;
    assert(errors[0].row === 3 && errors[0].errors.includes('Name is required') && errors[0].errors.includes('Invalid email format'), 'CSV Import row 3 validation errors correct');
    assert(errors[1].row === 4 && errors[1].errors.includes('Invalid greeting_date format'), 'CSV Import row 4 date validation error correct');

    // Cleanup
    fs.unlinkSync(csvPath);

    // 7. DELETE
    res = await fetch(`${baseUrl}/${rId}`, { method: 'DELETE' });
    json = await res.json();
    assert(res.status === 200 && json.success === true, 'DELETE /api/recipients/:id works');

    console.log(`\nRecipient Tests finished: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runTests();
