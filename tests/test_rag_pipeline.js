const app = require('../backend/src/index.js');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function runRAGPipelineTest() {
  console.log('[TEST] Starting Python AI Service background process for RAG Pipeline integration test...');
  
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
      // Step 1: Populate Vector Store with Ground-Truth Policy Documents
      console.log('\n--- Step 1: Populating Vector Store with Enterprise Policies ---');
      const testChunks = [
        {
          chunk_id: 'handbook_leave_p24',
          document_id: 'doc_handbook_001',
          text: 'Employee Annual Leave Policy: Regular full-time employees accrue 20 annual leave days per year.',
          page_number: 24,
          metadata: { filename: 'Employee_Handbook.pdf', section: 'leave' }
        },
        {
          chunk_id: 'handbook_sec_p45',
          document_id: 'doc_handbook_001',
          text: 'Security Policy: Passwords must be updated every 90 days and require a minimum of 16 characters.',
          page_number: 45,
          metadata: { filename: 'Employee_Handbook.pdf', section: 'security' }
        }
      ];

      const storeRes = await sendPost('/api/vector/store', { chunks: testChunks });
      console.log('Store Status:', storeRes.statusCode);
      if (storeRes.statusCode !== 200) {
        throw new Error('Populating vector store failed!');
      }

      // Step 2: Execute RAG Query
      console.log('\n--- Step 2: Executing Grounded RAG Query ---');
      const ragQuery = "What is the employee annual leave policy?";
      const ragRes = await sendPost('/api/rag/query', {
        query: ragQuery,
        top_k: 2
      });

      console.log('RAG Query Status:', ragRes.statusCode);
      console.log('RAG Answer Payload:');
      console.log(JSON.stringify(ragRes.body.data, null, 2));

      const ragData = ragRes.body.data;

      if (ragRes.statusCode !== 200 || !ragData.answer || ragData.citations.length === 0) {
        throw new Error('RAG Pipeline test failed to return answer or citations!');
      }

      // Verify Citation Metadata
      const firstCitation = ragData.citations[0];
      console.log('\n--- Source Citation Audit ---');
      console.log('Source File:', firstCitation.source);
      console.log('Page Number:', firstCitation.page);
      console.log('Chunk ID:   ', firstCitation.chunk_id);

      if (firstCitation.source !== 'Employee_Handbook.pdf' || firstCitation.page !== 24) {
        throw new Error('RAG Citation metadata verification failed!');
      }

      console.log('\n✅ All Baseline RAG Pipeline Tests Passed Cleanly!');
      process.exitCode = 0;
    } catch (err) {
      console.error('\n❌ RAG Pipeline Test Runner Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      pyProcess.kill();
    }
  });
}

runRAGPipelineTest().catch(err => {
  console.error('❌ Test runner crash:', err);
  process.exit(1);
});
