// LogicAI Backend Gateway Entry Point
require('dotenv').config();
const app = require('./src/index.js');
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend service listening on port ${PORT}`);
  });
}

module.exports = app;
