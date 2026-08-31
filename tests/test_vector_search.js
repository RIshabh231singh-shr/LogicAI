const app = require('../backend/src/index.js');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function runVectorSearchTest() {
  console.log('[TEST] Starting Python AI Service background process for Vector Search integration test...');
  
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
      // Step 1: Store Chunks into Vector Database
      console.log('\n--- Step 1: Storing Document Chunks in Vector Store ---');
      const chunksToStore = [
        {
          chunk_id: 'doc_101_c0',
          document_id: 'doc_101',
          text: 'Employees are granted 20 paid vacation leave days per calendar year.',
          page_number: 1,
          metadata: { category: 'hr_policy', department: 'all' }
        },
        {
          chunk_id: 'doc_101_c1',
          document_id: 'doc_101',
          text: 'Healthcare and medical insurance coverage begins on day one of employment.',
          page_number: 2,
          metadata: { category: 'benefits', department: 'all' }
        },
        {
          chunk_id: 'doc_102_c0',
          document_id: 'doc_102',
          text: 'The company cafeteria serves breakfast between 8:00 AM and 10:00 AM daily.',
          page_number: 1,
          metadata: { category: 'facilities', department: 'all' }
        }
      ];

      const storeRes = await sendPost('/api/vector/store', { chunks: chunksToStore });
      console.log('Store Status:', storeRes.statusCode);
      console.log('Stored Chunk Count:', storeRes.body.data.stored_count);

      if (storeRes.statusCode !== 200 || storeRes.body.data.stored_count !== 3) {
        throw new Error('Vector chunk storage test failed!');
      }

      // Step 2: Perform Top-K Vector Search (Top 2)
      console.log('\n--- Step 2: Performing Top-K Similarity Search (query="vacation leave", top_k=2) ---');
      const searchRes = await sendPost('/api/vector/search', {
        query: 'vacation leave',
        top_k: 2
      });

      console.log('Search Status:', searchRes.statusCode);
      console.log('Retrieved Chunks Count:', searchRes.body.data.retrieved_count);
      console.log('Retrieved Chunks (Inspected BEFORE LLM):');
      console.log(JSON.stringify(searchRes.body.data.retrieved_chunks, null, 2));

      const retrieved = searchRes.body.data.retrieved_chunks;
      if (searchRes.statusCode !== 200 || retrieved.length !== 2) {
        throw new Error('Top-K vector search failed to return expected 2 chunks!');
      }

      if (retrieved[0].chunk_id !== 'doc_101_c0') {
        throw new Error(`Expected top chunk 'doc_101_c0' (leave policy), but got '${retrieved[0].chunk_id}'`);
      }

      // Step 3: Metadata Filtering Test
      console.log('\n--- Step 3: Metadata Filtered Vector Search (filter category="benefits") ---');
      const filterRes = await sendPost('/api/vector/search', {
        query: 'policy info',
        top_k: 5,
        metadata_filter: { category: 'benefits' }
      });

      console.log('Filtered Count:', filterRes.body.data.retrieved_count);
      console.log('Filtered Chunk ID:', filterRes.body.data.retrieved_chunks[0].chunk_id);

      if (filterRes.body.data.retrieved_chunks[0].chunk_id !== 'doc_101_c1') {
        throw new Error('Metadata filtering test failed!');
      }

      console.log('\n✅ All Vector Database & Retrieval Tests Passed Cleanly!');
      process.exitCode = 0;
    } catch (err) {
      console.error('\n❌ Vector Search Test Runner Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      pyProcess.kill();
    }
  });
}

runVectorSearchTest().catch(err => {
  console.error('❌ Test runner crash:', err);
  process.exit(1);
});
