const app = require('../backend/src/index.js');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function runDocumentIngestionTest() {
  console.log('[TEST] Starting Python AI Service background process for Document Ingestion integration test...');
  
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

    // Create raw sample document content
    const fileContent = Buffer.from(
      "COGNIVAULT ENTERPRISE KNOWLEDGE PLATFORM POLICY\n\n" +
      "1. Annual Leave Policy: All full-time employees are entitled to 20 business days of paid annual leave.\n" +
      "2. Working Hours: Core working hours are 09:00 AM to 05:00 PM local office time.\n" +
      "3. Security Policy: Multi-factor authentication (MFA) is strictly required for all system access."
    );

    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const filename = 'employee_handbook.txt';
    const mimeType = 'text/plain';

    let body = '';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`;
    body += `Content-Type: ${mimeType}\r\n\r\n`;
    body += fileContent.toString('utf-8');
    body += `\r\n--${boundary}--\r\n`;

    const req = http.request(`http://localhost:${port}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        console.log('\n--- Document Upload Response ---');
        console.log('Status Code:', res.statusCode);
        console.log('Response Body:', responseBody);

        try {
          const json = JSON.parse(responseBody);
          if (
            res.statusCode === 200 &&
            json.success &&
            json.data.document_id &&
            json.data.filename === filename &&
            json.data.total_pages === 1 &&
            json.data.full_text.includes('Annual Leave Policy')
          ) {
            console.log('\n✅ Document Ingestion Integration Test Passed Cleanly!');
            console.log('   Assigned Document ID:', json.data.document_id);
            console.log('   Extracted Pages:', json.data.total_pages);
            console.log('   Total Character Count:', json.data.total_characters);
            process.exitCode = 0;
          } else {
            console.error('❌ Document Ingestion Integration Test Failed!');
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

    req.write(body);
    req.end();
  });
}

runDocumentIngestionTest().catch(err => {
  console.error('❌ Test runner crash:', err);
  process.exit(1);
});
