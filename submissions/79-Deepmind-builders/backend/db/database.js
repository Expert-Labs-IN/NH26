import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT || "3306"),
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "inboxai",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z",
});

export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log("MySQL connected successfully");
    conn.release();
    return true;
  } catch (err) {
    console.warn("MySQL unavailable — falling back to JSON file:", err.message);
    return false;
  }
}

export default pool;
