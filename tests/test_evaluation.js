const app = require('../backend/src/index.js');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function runEvaluationTest() {
  console.log('[TEST] Starting Python AI Service background process for RAG Evaluation integration test...');
  
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
    // Populate store with ground-truth evaluation chunks
    await sendDirectPost('/api/v1/vector/store', {
      chunks: [
        {
          chunk_id: 'eval_chunk_001',
          text: 'Employee Annual Leave Policy: Regular full-time employees accrue 20 annual leave days per year.',
          page_number: 24,
          metadata: { filename: 'Employee_Handbook.pdf' }
        },
        {
          chunk_id: 'eval_chunk_002',
          text: 'Password Security Requirements: Passwords must be updated every 90 days and require a minimum of 16 characters.',
          page_number: 45,
          metadata: { filename: 'Employee_Handbook.pdf' }
        },
        {
          chunk_id: 'eval_chunk_003',
          text: 'Remote Work Policy: Employees may work remotely up to 2 days per week with manager approval.',
          page_number: 12,
          metadata: { filename: 'Company_Policies.pdf' }
        }
      ]
    });

    // Load dataset from tests/datasets/rag_eval_dataset.json
    const datasetPath = path.resolve(__dirname, 'datasets/rag_eval_dataset.json');
    const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

    console.log('\n--- Running RAG Evaluation Dataset Benchmark ---');
    const evalRes = await sendDirectPost('/api/v1/eval/run', { items: dataset });

    console.log('Eval Status Code:', evalRes.statusCode);
    console.log('Aggregate Metric Scores:');
    console.log(JSON.stringify(evalRes.body.aggregate_scores, null, 2));

    const agg = evalRes.body.aggregate_scores;

    if (evalRes.statusCode !== 200 || agg.mean_context_recall < 0.8 || agg.mean_answer_relevance < 0.8) {
      throw new Error('RAG Evaluation benchmark failed quality threshold!');
    }

    console.log('\n✅ All RAG Evaluation Benchmark Tests Passed Cleanly!');
    process.exitCode = 0;
  } catch (err) {
    console.error('\n❌ RAG Evaluation Test Runner Error:', err.message);
    process.exitCode = 1;
  } finally {
    pyProcess.kill();
  }
}

runEvaluationTest().catch(err => {
  console.error('❌ Test runner crash:', err);
  process.exit(1);
});
