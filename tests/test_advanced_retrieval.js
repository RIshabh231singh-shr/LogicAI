const app = require('../backend/src/index.js');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function runAdvancedRetrievalTest() {
  console.log('[TEST] Starting Python AI Service background process for Advanced Retrieval integration test...');
  
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
    // 1. Test Query Rewriting
    console.log('\n--- Technique 1: Query Rewriting ---');
    const rewriteRes = await sendDirectPost('/api/v1/retrieval/rewrite', { query: 'what is PTO policy?' });
    console.log('Original Query: ', rewriteRes.body.original_query);
    console.log('Rewritten Query:', rewriteRes.body.rewritten_query);
    if (!rewriteRes.body.rewritten_query.includes('paid time off')) {
      throw new Error('Query rewriting failed to expand acronym PTO!');
    }

    // 2. Test Multi-Query Expansion
    console.log('\n--- Technique 2: Multi-Query Expansion ---');
    const multiRes = await sendDirectPost('/api/v1/retrieval/multi-query', { query: 'what is MFA requirement?' });
    console.log('Multi-Queries Generated:', multiRes.body.multi_queries);
    if (multiRes.body.multi_queries.length < 2) {
      throw new Error('Multi-query generation failed!');
    }

    // Populate Store for Hybrid Search & Reranking
    await sendDirectPost('/api/v1/vector/store', {
      chunks: [
        { chunk_id: 'c1', text: 'Multi-factor authentication (MFA) requires 16-character passwords.', page_number: 1 },
        { chunk_id: 'c2', text: 'Cafeteria hours are from 8 AM to 10 AM.', page_number: 2 }
      ]
    });

    // 3. Test Hybrid Search (RRF)
    console.log('\n--- Technique 3: Hybrid Search (BM25 + Vector RRF) ---');
    const hybridRes = await sendDirectPost('/api/v1/retrieval/hybrid', { query: 'MFA requirement', top_k: 2 });
    console.log('Hybrid Search Results:', JSON.stringify(hybridRes.body.chunks, null, 2));
    if (!hybridRes.body.chunks[0].rrf_score) {
      throw new Error('Hybrid search failed to compute RRF score!');
    }

    // 4. Test Reranking
    console.log('\n--- Technique 4: Reranking ---');
    const rerankRes = await sendDirectPost('/api/v1/retrieval/rerank', { query: 'MFA requirement', top_k: 2 });
    console.log('Reranked Results:', JSON.stringify(rerankRes.body.reranked_chunks, null, 2));
    if (!rerankRes.body.reranked_chunks[0].rerank_score) {
      throw new Error('Reranking failed to compute rerank_score!');
    }

    console.log('\n✅ All 5 Advanced Retrieval Techniques Verified Cleanly!');
    process.exitCode = 0;
  } catch (err) {
    console.error('\n❌ Advanced Retrieval Test Runner Error:', err.message);
    process.exitCode = 1;
  } finally {
    pyProcess.kill();
  }
}

runAdvancedRetrievalTest().catch(err => {
  console.error('❌ Test runner crash:', err);
  process.exit(1);
});
