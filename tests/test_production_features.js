const app = require('../backend/src/index.js');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function runProductionFeaturesTest() {
  console.log('[TEST] Starting Python AI Service background process for Production Features integration test...');
  
  const aiServiceDir = path.resolve(__dirname, '../ai-service');
  const pyProcess = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--port', '8000'], {
    cwd: aiServiceDir,
    env: { ...process.env, PYTHONPATH: aiServiceDir },
    stdio: 'inherit'
  });

  await new Promise(resolve => setTimeout(resolve, 3000));

  const sendDirectPost = (endpoint, data) => new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request(`http://localhost:8000${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  try {
    // 1. Initial Query (Cache Miss)
    console.log('\n--- Step 1: Initial Query (Cache Miss expected) ---');
    const query1 = "What is the annual leave policy?";
    const res1 = await sendDirectPost('/api/v1/cache/chat', { prompt: query1 });

    console.log('Query 1 Status:', res1.statusCode);
    console.log('Query 1 Cached:', res1.body.cached);

    if (res1.statusCode !== 200 || res1.body.cached !== false) {
      throw new Error('Initial query should have been a Cache Miss!');
    }

    // 2. Semantically Similar Query (Cache Hit)
    console.log('\n--- Step 2: Semantically Similar Query (Cache Hit expected) ---');
    const query2 = "What is the annual leave policy?";
    const res2 = await sendDirectPost('/api/v1/cache/chat', { prompt: query2 });

    console.log('Query 2 Status:', res2.statusCode);
    console.log('Query 2 Cached:', res2.body.cached);
    console.log('Similarity Score:', res2.body.similarity_score);

    if (res2.statusCode !== 200 || res2.body.cached !== true || res2.body.similarity_score < 0.95) {
      throw new Error('Semantically similar query failed to trigger a Cache Hit!');
    }

    console.log('\n✅ All Production Features & Semantic Caching Tests Passed Cleanly!');
    process.exitCode = 0;
  } catch (err) {
    console.error('\n❌ Production Features Test Runner Error:', err.message);
    process.exitCode = 1;
  } finally {
    pyProcess.kill();
  }
}

runProductionFeaturesTest().catch(err => {
  console.error('❌ Test runner crash:', err);
  process.exit(1);
});
