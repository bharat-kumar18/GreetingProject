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
    await new Promise(r => setTimeout(r, 1000));

    const templatePath = path.resolve(__dirname, 'test-template.svg');
    await fs.writeFile(templatePath, `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><text x="50" y="50">{{name}}</text><text x="50" y="100">{{occasion}}</text><text x="50" y="150">{{message}}</text></svg>`);

    // 1. Valid batch generation
    // rec-1 (valid), rec-2 (long text), rec-3 (dup), rec-4 (dup), rec-5 (valid) -> 5 recipients
    // invalid-rec (invalid id) -> 1 invalid
    let res = await fetch(`${baseUrl}/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        templateId: 'tpl-1', 
        recipientIds: ['rec-1', 'rec-2', 'rec-3', 'rec-4', 'rec-5', 'invalid-rec']
      })
    });
    
    let json = await res.json();
    assert(res.status === 202 && json.success === true && json.data.id, 'Batch job created successfully (202)');
    
    const jobId = json.data.id;
    assert(json.data.total_count === 6, 'Job tracks total count correctly');

    // Polling for completion
    let jobData;
    for (let i = 0; i < 20; i++) {
      res = await fetch(`${baseUrl}/jobs/${jobId}`);
      json = await res.json();
      jobData = json.data;
      if (jobData.status === 'completed' || jobData.status === 'failed') {
        break;
      }
      await new Promise(r => setTimeout(r, 500));
    }

    assert(jobData.status === 'completed', 'Batch job completes successfully even with 1 failure');
    assert(jobData.success_count === 5, 'Job tracked exactly 5 successes');
    assert(jobData.failed_count === 1, 'Job tracked exactly 1 failure');

    // Verify files were actually generated for the valid ones
    res = await fetch(`${baseUrl}/outputs`);
    json = await res.json();
    const jobOutputs = json.data.filter(o => o.job_id === jobId);
    assert(jobOutputs.length === 5, 'Generated exactly 5 output records');

    // Cleanup
    await fs.unlink(templatePath).catch(()=>{});

    console.log(`\nBatch Generation Tests finished: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runTests();
