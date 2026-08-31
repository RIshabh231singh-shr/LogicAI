const { execSync } = require('child_process');
const path = require('path');

const testSuite = [
  'node tests/test_backend_health.js',
  'python tests/test_ai_health.py',
  'node tests/test_service_communication.js',
  'node tests/test_llm_chat.js',
  'node tests/test_document_ingestion.js',
  'node tests/test_chunking.js',
  'node tests/test_embeddings.js',
  'node tests/test_vector_search.js',
  'node tests/test_rag_pipeline.js',
  'node tests/test_advanced_retrieval.js',
  'node tests/test_tool_calling.js',
  'node tests/test_agent_routing.js',
  'node tests/test_memory.js',
  'node tests/test_guardrails.js',
  'node tests/test_evaluation.js',
  'node tests/test_observability.js',
  'node tests/test_production_features.js'
];

console.log('====================================================');
console.log('🚀 RUNNING COGNIVAULT MASTER INTEGRATION TEST SUITE');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

for (const testCmd of testSuite) {
  console.log(`\n▶ Running: ${testCmd}`);
  try {
    execSync(testCmd, {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit'
    });
    console.log(`✅ PASSED: ${testCmd}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAILED: ${testCmd}`);
    failed++;
  }
}

console.log('\n====================================================');
console.log(`📊 MASTER TEST RESULTS: ${passed} Passed, ${failed} Failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL INTEGRATION SUITES PASSED PERFECTLY!');
  process.exit(0);
}
