import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Oisd1086',
  database: process.env.DB_NAME || 'book',
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    ca: process.env.DB_SSL_CA,
  },
});

// Update the export to include the pool
export default {
    query: (sql, params) => pool.query(sql, params),
    getConnection: () => pool.getConnection(), // Add this line
    pool: pool // Export the pool directly just in case
};