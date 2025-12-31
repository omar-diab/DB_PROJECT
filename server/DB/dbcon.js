import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env (if present)
dotenv.config();

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT;

if (!process.env.DB_USER) {
  console.warn('Warning: DB_USER is not set — defaulting to root. Create a .env file to configure your database credentials.');
}

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
});

// Verify DB connectivity early and provide a clear log if credentials are wrong
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection successful');
  } catch (err) {
    console.error('Database connection failed. Check your DB credentials in .env. Error:', err.message);
  }
})();

// Update the export to include the pool
export default {
  query: (sql, params) => pool.query(sql, params),
  getConnection: () => pool.getConnection(), // Add this line
  pool: pool // Export the pool directly just in case
};