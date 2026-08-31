const app = require('../backend/src/index.js');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function runChunkingTest() {
  console.log('[TEST] Starting Python AI Service background process for Chunking integration test...');
  
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
      const sampleText = 
        "Cognivault Enterprise Platform Architecture Document.\n\n" +
        "Section 1: Security and Access Control.\n" +
        "All API endpoints require JWT authentication. Role-based access control (RBAC) enforces strict authorization.\n\n" +
        "Section 2: Retrieval Augmented Generation.\n" +
        "Documents are parsed into clean text, segmented into chunks, embedded into dense vector representations, and indexed in PostgreSQL pgvector.\n\n" +
        "Section 3: Microservice Communication.\n" +
        "The Node.js backend acts as an API gateway while the Python FastAPI service handles complex GenAI tasks.";

      // Test 1: Fixed-size Chunking with Overlap
      console.log('\n--- Test 1: Fixed-size Chunking (chunk_size=150, chunk_overlap=30) ---');
      const fixedRes = await sendPost('/api/documents/chunk', {
        text: sampleText,
        strategy: 'fixed',
        chunk_size: 150,
        chunk_overlap: 30,
        document_id: 'doc_sec_001',
        metadata: { page: 1, category: 'architecture' }
      });
      console.log('Fixed Chunking Status:', fixedRes.statusCode);
      console.log('Chunk Count:', fixedRes.body.data.chunk_count);
      console.log('First 2 Chunks:', JSON.stringify(fixedRes.body.data.chunks.slice(0, 2), null, 2));

      if (fixedRes.statusCode !== 200 || fixedRes.body.data.chunk_count < 2) {
        throw new Error('Fixed-size chunking failed!');
      }

      // Test 2: Sentence-boundary Chunking
      console.log('\n--- Test 2: Sentence-boundary Chunking (chunk_size=200) ---');
      const sentenceRes = await sendPost('/api/documents/chunk', {
        text: sampleText,
        strategy: 'sentence',
        chunk_size: 200,
        document_id: 'doc_sec_002'
      });
      console.log('Sentence Chunking Status:', sentenceRes.statusCode);
      console.log('Chunk Count:', sentenceRes.body.data.chunk_count);

      if (sentenceRes.statusCode !== 200 || sentenceRes.body.data.chunk_count < 1) {
        throw new Error('Sentence chunking failed!');
      }

      // Test 3: Edge Case (Overlap >= Chunk Size)
      console.log('\n--- Test 3: Edge Case Validation (Overlap >= Size) ---');
      const invalidRes = await sendPost('/api/documents/chunk', {
        text: sampleText,
        chunk_size: 100,
        chunk_overlap: 100
      });
      console.log('Edge Case Error Status:', invalidRes.statusCode);
      if (invalidRes.statusCode !== 502 && invalidRes.statusCode !== 400) {
        throw new Error('Edge case validation failed to catch invalid overlap bounds!');
      }

      console.log('\n✅ All Document Chunking Integration Tests Passed Cleanly!');
      process.exitCode = 0;
    } catch (err) {
      console.error('\n❌ Chunking Test Runner Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      pyProcess.kill();
    }
  });
}

runChunkingTest().catch(err => {
  console.error('❌ Test runner crash:', err);
  process.exit(1);
});
