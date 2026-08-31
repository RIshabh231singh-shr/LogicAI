const app = require('../backend/src/index.js');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function runToolCallingTest() {
  console.log('[TEST] Starting Python AI Service background process for Tool Calling integration test...');
  
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
    // 1. Tool 1: get_employee_details()
    console.log('\n--- Tool Call 1: get_employee_details() ---');
    const empRes = await sendDirectPost('/api/v1/tools/process', { prompt: 'Show me employee details for E101' });
    console.log('Tool Selected (Inspected BEFORE execution):', JSON.stringify(empRes.body.tool_call, null, 2));
    console.log('Tool Execution Result:', JSON.stringify(empRes.body.execution_result, null, 2));

    if (empRes.body.tool_call.tool_name !== 'get_employee_details' || empRes.body.execution_result.data.name !== 'Rishabh Singh') {
      throw new Error('get_employee_details tool test failed!');
    }

    // 2. Tool 2: get_leave_balance()
    console.log('\n--- Tool Call 2: get_leave_balance() ---');
    const leaveRes = await sendDirectPost('/api/v1/tools/process', { prompt: 'How many leave balance days does E101 have left?' });
    console.log('Tool Selected:', JSON.stringify(leaveRes.body.tool_call, null, 2));
    console.log('Tool Execution Result:', JSON.stringify(leaveRes.body.execution_result, null, 2));

    if (leaveRes.body.tool_call.tool_name !== 'get_leave_balance' || leaveRes.body.execution_result.data.remaining_leave_days !== 14) {
      throw new Error('get_leave_balance tool test failed!');
    }

    // 3. Tool 3: search_company_policy()
    console.log('\n--- Tool Call 3: search_company_policy() ---');
    const policyRes = await sendDirectPost('/api/v1/tools/process', { prompt: 'What is the company remote work policy?' });
    console.log('Tool Selected:', JSON.stringify(policyRes.body.tool_call, null, 2));
    console.log('Tool Execution Result:', JSON.stringify(policyRes.body.execution_result, null, 2));

    if (policyRes.body.tool_call.tool_name !== 'search_company_policy' || policyRes.body.execution_result.matches.length === 0) {
      throw new Error('search_company_policy tool test failed!');
    }

    console.log('\n✅ All Tool Calling & Schema Selection Tests Passed Cleanly!');
    process.exitCode = 0;
  } catch (err) {
    console.error('\n❌ Tool Calling Test Runner Error:', err.message);
    process.exitCode = 1;
  } finally {
    pyProcess.kill();
  }
}

runToolCallingTest().catch(err => {
  console.error('❌ Test runner crash:', err);
  process.exit(1);
});
