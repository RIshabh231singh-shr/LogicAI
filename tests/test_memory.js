const app = require('../backend/src/index.js');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function runMemoryTest() {
  console.log('[TEST] Starting Python AI Service background process for Memory integration test...');
  
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
    const sessionId = 'session_user_rishabh_101';

    // Turn 1: Initial Question
    console.log('\n--- Turn 1: User asks initial policy question ---');
    const turn1Res = await sendDirectPost('/api/v1/memory/chat', {
      session_id: sessionId,
      prompt: 'What is the leave policy?'
    });

    console.log('Turn 1 Status:', turn1Res.statusCode);
    console.log('Turn 1 Response:', turn1Res.body.response);
    console.log('Stored History Count:', turn1Res.body.history.length);

    if (turn1Res.statusCode !== 200 || turn1Res.body.history.length !== 2) {
      throw new Error('Turn 1 memory persistence failed!');
    }

    // Turn 2: Follow-Up Question referencing "that"
    console.log('\n--- Turn 2: Follow-up question referencing "that" ---');
    const turn2Res = await sendDirectPost('/api/v1/memory/chat', {
      session_id: sessionId,
      prompt: 'How many days does that give me?'
    });

    console.log('Turn 2 Status:', turn2Res.statusCode);
    console.log('Turn 2 Response:', turn2Res.body.response);
    console.log('Stored History Count:', turn2Res.body.history.length);

    if (turn2Res.statusCode !== 200 || turn2Res.body.history.length !== 4) {
      throw new Error('Turn 2 memory context resolution failed!');
    }

    // Verify history contains Turn 1 prompt
    const turn1PromptInHistory = turn2Res.body.history[0].content;
    console.log('Audit Stored Turn 1 Prompt:', turn1PromptInHistory);

    if (!turn1PromptInHistory.includes('leave policy')) {
      throw new Error('Conversation history audit failed: Turn 1 prompt missing from memory!');
    }

    console.log('\n✅ All Memory & Multi-Turn Context Resolution Tests Passed Cleanly!');
    process.exitCode = 0;
  } catch (err) {
    console.error('\n❌ Memory Test Runner Error:', err.message);
    process.exitCode = 1;
  } finally {
    pyProcess.kill();
  }
}

runMemoryTest().catch(err => {
  console.error('❌ Test runner crash:', err);
  process.exit(1);
});
