// config/db.js - MySQL Connection Pool Configuration
const mysql = require("mysql2/promise");
require("dotenv").config();

const dbPool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ecommerce_db",
  waitForConnections: true,
  connectionLimit: 10, // max concurrent connections
  queueLimit: 0, // unlimited waiting requests
});

module.exports = dbPool;
