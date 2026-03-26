import { Pool } from 'pg'
import { logger } from './logger'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Test connection on import
pool.query('SELECT NOW()')
  .then(() => logger.info('✅ PostgreSQL connected'))
  .catch((err) => {
    logger.error(`❌ PostgreSQL connection failed: ${err.message}`)
    process.exit(1)
  })

pool.on('error', (err) => {
  logger.error(`Unexpected PG pool error: ${err.message}`)
})

export default pool
