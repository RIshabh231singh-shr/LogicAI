const app = require('../backend/src/index.js');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function runEmbeddingsTest() {
  console.log('[TEST] Starting Python AI Service background process for Embeddings integration test...');
  
  const aiServiceDir = path.resolve(__dirname, '../ai-service');
  const pyProcess = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--port', '8000'], {
    cwd: aiServiceDir,
    env: { ...process.env, PYTHONPATH: aiServiceDir },
    stdio: 'inherit'
  });

  await new Promise(resolve => setTimeout(resolve, 3000));

  const server = app.listen(0, async () => {
    const port = server.address().port;
    console.log(`[TEST] Node Backend listening on test port ${port}`);

    const sendPost = (path, data) => new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const req = http.request(`http://localhost:${port}${path}`, {
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
      // Test 1: Generate Embedding Vector
      console.log('\n--- Test 1: Generate Embedding Vector ---');
      const embedRes = await sendPost('/api/embeddings/generate', {
        text: 'What is the leave policy?'
      });
      console.log('Embedding Status:', embedRes.statusCode);
      console.log('Vector Dimensions:', embedRes.body.data.dimensions);
      console.log('First 5 Vector Values:', embedRes.body.data.embedding.slice(0, 5));

      if (embedRes.statusCode !== 200 || embedRes.body.data.dimensions !== 384) {
        throw new Error('Embedding generation test failed!');
      }

      // Test 2: Semantic Cosine Similarity Ranking (Prompt Benchmark Case)
      console.log('\n--- Test 2: Semantic Cosine Similarity Ranking ---');
      const query = "What is the leave policy?";
      const candidates = [
        "Employees receive 20 annual leave days.",  // Highly relevant
        "The cafeteria opens at 8 AM."              // Completely irrelevant
      ];

      const simRes = await sendPost('/api/embeddings/similarity', { query, candidates });
      console.log('Similarity Status:', simRes.statusCode);
      console.log('Rankings:', JSON.stringify(simRes.body.data.rankings, null, 2));

      const rankings = simRes.body.data.rankings;
      const leaveScore = rankings.find(r => r.text.includes("leave days")).similarity_score;
      const cafeteriaScore = rankings.find(r => r.text.includes("cafeteria")).similarity_score;

      console.log(`\nLeave Policy Similarity Score: ${leaveScore}`);
      console.log(`Cafeteria Similarity Score:    ${cafeteriaScore}`);

      if (leaveScore <= cafeteriaScore) {
        throw new Error('Semantic similarity benchmark failed: Leave policy did not rank above cafeteria!');
      }

      console.log('\n✅ All Embedding & Cosine Similarity Integration Tests Passed Cleanly!');
      process.exitCode = 0;
    } catch (err) {
      console.error('\n❌ Embeddings Test Runner Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      pyProcess.kill();
    }
  });
}

runEmbeddingsTest().catch(err => {
  console.error('❌ Test runner crash:', err);
  process.exit(1);
});
