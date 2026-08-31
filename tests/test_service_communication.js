const app = require('../backend/src/index.js');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function runCommunicationTest() {
  console.log('[TEST] Starting Python AI Service background process for integration test...');
  
  const aiServiceDir = path.resolve(__dirname, '../ai-service');
  const pyProcess = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--port', '8000'], {
    cwd: aiServiceDir,
    env: { ...process.env, PYTHONPATH: aiServiceDir },
    stdio: 'inherit'
  });

  // Wait 3 seconds for Python server to bind port
  await new Promise(resolve => setTimeout(resolve, 3000));

  const server = app.listen(0, async () => {
    const port = server.address().port;
    console.log(`[TEST] Node Backend listening on test port ${port}`);

    const postData = JSON.stringify({ message: 'Hello from Node Backend Gateway!' });

    const req = http.request(`http://localhost:${port}/api/ai/echo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        console.log('[TEST] Integrated Response Body:', responseBody);
        try {
          const json = JSON.parse(responseBody);
          if (json.success && json.aiServiceResponse && json.aiServiceResponse.service === 'python-ai-service') {
            console.log('✅ End-to-End Inter-Service Communication Test Passed!');
            process.exitCode = 0;
          } else {
            console.error('❌ Inter-Service Communication Test Failed!');
            process.exitCode = 1;
          }
        } catch (e) {
          console.error('❌ Failed to parse response JSON:', e);
          process.exitCode = 1;
        } finally {
          server.close();
          pyProcess.kill();
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ Request error:', err);
      process.exitCode = 1;
      server.close();
      pyProcess.kill();
    });

    req.write(postData);
    req.end();
  });
}

runCommunicationTest().catch(err => {
  console.error('❌ Test runner crash:', err);
  process.exit(1);
});
