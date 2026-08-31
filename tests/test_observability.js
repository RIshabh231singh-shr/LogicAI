const app = require('../backend/src/index.js');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function runObservabilityTest() {
  console.log('[TEST] Starting Python AI Service background process for Observability integration test...');
  
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

  const sendDirectGet = (endpoint) => new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:8000${endpoint}`, { method: 'GET' }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.end();
  });

  try {
    // Populate store & execute RAG query
    await sendDirectPost('/api/v1/vector/store', {
      chunks: [{ chunk_id: 'obs_chunk_1', text: 'Telemetry tracking policy.', page_number: 1, metadata: { filename: 'obs.pdf' } }]
    });

    console.log('\n--- Step 1: Executing Traced RAG Query ---');
    const ragRes = await sendDirectPost('/api/v1/rag/query', { query: 'Telemetry tracking policy' });
    console.log('RAG Response Trace ID:', ragRes.body.trace_id);

    if (ragRes.statusCode !== 200 || !ragRes.body.trace_id) {
      throw new Error('Traced RAG query execution failed to return trace_id!');
    }

    // Fetch Telemetry Traces
    console.log('\n--- Step 2: Fetching Observability Telemetry Traces ---');
    const traceRes = await sendDirectGet('/api/v1/telemetry/traces');
    console.log('Trace Telemetry Response:');
    console.log(JSON.stringify(traceRes.body, null, 2));

    const traces = traceRes.body.traces;
    if (traceRes.statusCode !== 200 || traces.length === 0) {
      throw new Error('Telemetry trace history request failed!');
    }

    const latestTrace = traces[traces.length - 1];
    console.log('\n--- Telemetry Audit ---');
    console.log('Trace ID:         ', latestTrace.trace_id);
    console.log('Total Latency MS: ', latestTrace.total_latency_ms);
    console.log('Tokens Consumed:  ', latestTrace.llm_usage.total_tokens);
    console.log('Estimated Cost USD:', latestTrace.estimated_cost_usd);

    if (typeof latestTrace.total_latency_ms !== 'number' || latestTrace.llm_usage.total_tokens === 0) {
      throw new Error('Telemetry trace audit failed to record latency or token usage!');
    }

    console.log('\n✅ All GenAI Observability & Telemetry Tests Passed Cleanly!');
    process.exitCode = 0;
  } catch (err) {
    console.error('\n❌ Observability Test Runner Error:', err.message);
    process.exitCode = 1;
  } finally {
    pyProcess.kill();
  }
}

runObservabilityTest().catch(err => {
  console.error('❌ Test runner crash:', err);
  process.exit(1);
});
