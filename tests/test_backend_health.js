const app = require('../backend/src/index.js');
const http = require('http');

const server = app.listen(0, async () => {
  const port = server.address().port;
  http.get(`http://localhost:${port}/health`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Node Backend Health Response:', data);
      const json = JSON.parse(data);
      if (json.status === 'ok') {
        console.log('✅ Node Backend Health Check Passed!');
      } else {
        console.error('❌ Node Backend Health Check Failed!');
        process.exitCode = 1;
      }
      server.close();
    });
  }).on('error', (err) => {
    console.error('❌ Request error:', err);
    process.exitCode = 1;
    server.close();
  });
});
