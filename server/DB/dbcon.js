import mysql from 'mysql2/promise';

const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,             
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,

  ssl: {
    ca: process.env.DB_SSL_CA,
    servername: process.env.DB_SSL_SERVERNAME, 
  },
});

module.exports = pool;


// Update the export to include the pool
export default {
    query: (sql, params) => pool.query(sql, params),
    getConnection: () => pool.getConnection(), // Add this line
    pool: pool // Export the pool directly just in case
};