import { pool } from '../../config/db.js';

/**
 * Insert a brand-new conversation.
 * @param {string} userId
 * @param {string} sessionId
 * @param {Object[]} messages – array of { message, role, send_at }
 */

export const addConversation = async (userId, sessionId, title, messages) => {
    const text = `INSERT INTO user_conversations
                  (user_id, session_id, title, conversation)
                  VALUES ($1, $2, $3, $4)
                  RETURNING *`;
    const values = [userId, sessionId, title, JSON.stringify(messages)];
    const { rows } = await pool.query(text, values);
    return rows[0];
  };  

/** Overwrite an existing conversation, now with title */
export const updateConversation = async (userId, sessionId, title, messages) => {
    const text = `UPDATE user_conversations
                  SET title = $3,
                      conversation = $4,
                      updated_at = NOW()
                  WHERE user_id = $1 AND session_id = $2
                  RETURNING *`;
    const values = [userId, sessionId, title, JSON.stringify(messages)];
    const { rows } = await pool.query(text, values);
    return rows[0];
  };  

/** Delete one session for a user */
export const deleteConversation = async (userId, sessionId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM user_conversations WHERE user_id = $1 AND session_id = $2',
    [userId, sessionId]
  );
  return rowCount > 0;
};

/** Get N most-recent sessions for a user (ordered by updated_at desc) */
export const getRecentConversations = async (userId, limit = 5) => {
  const { rows } = await pool.query(
    `SELECT * FROM user_conversations
     WHERE user_id = $1
     ORDER BY updated_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
};

/** Get every session for a user */
export const getAllConversations = async (userId) => {
  const { rows } = await pool.query(
    'SELECT * FROM user_conversations WHERE user_id = $1 ORDER BY updated_at DESC',
    [userId]
  );
  return rows;
};
