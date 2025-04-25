import { pool } from '../../config/db.js';

/** Create a new session */
export const createSession = async (userId, sessionId, title = 'New Chat') => {
  const text = `INSERT INTO user_sessions (user_id, session_id, title) VALUES ($1, $2, $3) RETURNING *`;
  const values = [userId, sessionId, title];
  const { rows } = await pool.query(text, values);
  return rows[0];
};

/** Save a single message */
export const saveMessage = async (userId, sessionId, role, message, sendAt = new Date()) => {
  const text = `INSERT INTO user_messages (user_id, session_id, role, message, send_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
  const values = [userId, sessionId, role, message, sendAt];
  const { rows } = await pool.query(text, values);
  return rows[0];
};

/** Update session title */
export const updateSessionTitle = async (userId, sessionId, newTitle) => {
  const text = `UPDATE user_sessions SET title = $3, updated_at = NOW() WHERE user_id = $1 AND session_id = $2 RETURNING *`;
  const values = [userId, sessionId, newTitle];
  const { rows } = await pool.query(text, values);
  return rows[0];
};

/** Get N messages for context */
export const getMessages = async (userId, sessionId, limit = 20) => {
  const text = `SELECT role, message, send_at FROM user_messages WHERE user_id = $1 AND session_id = $2 ORDER BY send_at DESC LIMIT $3`;
  const values = [userId, sessionId, limit];
  const { rows } = await pool.query(text, values);
  return rows.reverse(); // return in chronological order
};

/** Get messages for session */
export const getSession = async (userId, sessionId) => {
  const text = `SELECT role, message, send_at FROM user_messages WHERE user_id = $1 AND session_id = $2 ORDER BY send_at`;
  const values = [userId, sessionId];
  const { rows } = await pool.query(text, values);
  return rows;
};

/** Get all sessions for a user */
export const getAllSessions = async (userId) => {
  const text = `SELECT * FROM user_sessions WHERE user_id = $1 ORDER BY updated_at DESC`;
  const { rows } = await pool.query(text, [userId]);
  return rows;
};

