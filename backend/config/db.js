import pkg from 'pg';
const { Pool } = pkg;  // Use default import to access Pool
import dotenv from 'dotenv';

dotenv.config();

const AppState = process.env.APP_STATE // dev | prod
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: String(process.env.PG_PASSWORD),
  port: process.env.PG_PORT,
  ssl: AppState === 'prod' ? { rejectUnauthorized: false } : false, // Render requires SSL, but allows self-signed
});

async function connectDB() {
  try {
    await pool.connect();
    console.log('Connected to the database');
  } catch (err) {
    console.error('Connection error', err.stack);
  }
}

async function closeDB() {
  try {
    await pool.end();
    console.log('Database connection closed');
  } catch (err) {
    console.error('Error closing the connection', err.stack);
  }
}

export { pool, connectDB, closeDB };
