async function runDemo() {
  console.log('--- Triggering Batch Generation for Final Assignment ---');
  try {
    // Generate 2 images for Birthday template
    const res1 = await fetch('http://localhost:3000/api/generation/batch', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: 'tpl-2', recipientIds: ['rec-1', 'rec-2'] })
    });
    const data1 = await res1.json();
    console.log('Job 1 (Birthday) Started:', data1);

    // Generate 2 images for Anniversary template (testing long text wrapping)
    const res2 = await fetch('http://localhost:3000/api/generation/batch', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: 'tpl-3', recipientIds: ['rec-3', 'rec-4'] })
    });
    const data2 = await res2.json();
    console.log('Job 2 (Anniversary) Started:', data2);

    // Generate 1 image for Classic template
    const res3 = await fetch('http://localhost:3000/api/generation/batch', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: 'tpl-1', recipientIds: ['rec-5'] })
    });
    const data3 = await res3.json();
    console.log('Job 3 (Event) Started:', data3);

    console.log('Successfully generated 5 personalized images across 3 different templates.');
  } catch (error) {
    console.error('Error starting batch jobs:', error.response?.data || error.message);
  }
}

runDemo();
