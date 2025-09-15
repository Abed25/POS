import db from "../config/db.mjs";

export async function createUser(username, hashedPassword, role) {
  const [result] = await db.execute(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, hashedPassword, role]
  );
  return result.insertId;
}

export async function findUserByUsername(username) {
  const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  return rows[0];
}
