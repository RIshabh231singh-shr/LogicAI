const app = require('../backend/src/index.js');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function runLLMChatTest() {
  console.log('[TEST] Starting Python AI Service background process for LLM Chat integration test...');
  
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

    // Helper to send HTTP POST
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
      // Test 1: Standard Chat
      console.log('\n--- Test 1: Standard LLM Chat Request ---');
      const chatRes = await sendPost('/api/chat', {
        prompt: 'Explain what an LLM context window is.',
        system_prompt: 'You are a helpful GenAI mentor.',
        temperature: 0.5
      });
      console.log('Chat Status:', chatRes.statusCode);
      console.log('Chat Data:', JSON.stringify(chatRes.body, null, 2));
      
      if (chatRes.statusCode !== 200 || !chatRes.body.success || !chatRes.body.data.content) {
        throw new Error('Standard LLM Chat Test Failed!');
      }

      // Test 2: Structured Output Chat
      console.log('\n--- Test 2: Structured JSON LLM Response ---');
      const structRes = await sendPost('/api/chat', {
        prompt: 'Classify employee policy inquiry.',
        structured: true
      });
      console.log('Structured Status:', structRes.statusCode);
      console.log('Structured Data:', JSON.stringify(structRes.body, null, 2));

      if (structRes.statusCode !== 200 || !structRes.body.success || !structRes.body.data.structured) {
        throw new Error('Structured LLM Chat Test Failed!');
      }

      console.log('\n✅ All LLM Chat Service Tests Passed Cleanly!');
      process.exitCode = 0;
    } catch (err) {
      console.error('\n❌ LLM Chat Test Runner Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      pyProcess.kill();
    }
  });
}

runLLMChatTest().catch(err => {
  console.error('❌ Test runner crash:', err);
  process.exit(1);
});
