import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQL_ADDON_HOST,
  port: Number(process.env.DB_PORT || process.env.MYSQL_ADDON_PORT || 3306),
  user: process.env.DB_USER || process.env.MYSQL_ADDON_USER,
  password: process.env.DB_PASSWORD || process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.DB_NAME || process.env.MYSQL_ADDON_DB,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
  queueLimit: 0,
});
/**
 * Simple query helper using the pool.
 * Returns rows (array) from SELECT/INSERT/UPDATE queries.
 */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * Run a callback inside a DB transaction.
 * Callback receives a connection (conn) — use conn.execute(sql, params).
 * Commits on success, rolls back on error, and always releases the connection.
 */
export async function transaction(callback) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export default pool;
