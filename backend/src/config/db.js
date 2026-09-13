const { Pool } = require('pg');
const config = require('./env');

let pool = null;

if (config.databaseUrl) {
  pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err.message);
  });
} else {
  console.warn('DATABASE_URL is not set. Database persistence will be disabled.');
}

/**
 * Executes a SQL query against the pool.
 * @param {string} text 
 * @param {Array} params 
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  if (!pool) {
    throw new Error('Database connection is not configured.');
  }
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (config.nodeEnv === 'development' && duration > 500) {
    console.warn(`Slow query (${duration}ms):`, text.slice(0, 100));
  }
  return res;
}

/**
 * Initializes database schema (creates tables if not exist)
 */
async function initDb() {
  if (!pool) return;

  try {
    const client = await pool.connect();
    try {
      console.log('Connecting to PostgreSQL to verify schema...');
      
      // Attempt to enable pgcrypto & vector extensions
      await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";').catch(() => {});
      await client.query('CREATE EXTENSION IF NOT EXISTS "vector";').catch((err) => {
        console.warn('Vector extension not available or requires superuser:', err.message);
      });

      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Projects table
      await client.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT DEFAULT '',
          status VARCHAR(50) DEFAULT 'Ready',
          architecture_summary TEXT DEFAULT 'No documents analyzed yet. Upload documents to generate architecture summary.',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Documents table
      await client.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
          filename VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          cloudinary_public_id VARCHAR(255),
          cloudinary_url TEXT,
          mime_type VARCHAR(100),
          size_bytes BIGINT,
          uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Document chunks table
      await client.query(`
        CREATE TABLE IF NOT EXISTS document_chunks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
          chunk_index INT,
          chunk_text TEXT NOT NULL,
          page_number INT DEFAULT 1,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_document_chunks_user_id ON document_chunks(user_id);
        CREATE INDEX IF NOT EXISTS idx_document_chunks_doc_id ON document_chunks(document_id);
      `);

      console.log('PostgreSQL database schema initialized successfully.');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to initialize database tables:', error.message);
  }
}

module.exports = {
  pool,
  query,
  initDb,
};
