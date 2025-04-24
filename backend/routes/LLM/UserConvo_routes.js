// routes/UserConvo_routes.js
import express from 'express';
import {
  addConversation,
  updateConversation,
  deleteConversation,
  getRecentConversations,
  getAllConversations,
} from '../../models/llm_models/conversations_model.js';

const router = express.Router();

/**
 * Body shape for add / update:
 * {
 *   user_id: "...",
 *   session_id: "...",
 *   conversation: [ { message:"", role:"user|trainer", send_at:"2025-04-24T10:00:00Z" }, ... ]
 * }
 */


/* ---------- CREATE ---------- */
router.post('/', async (req, res) => {
  try {
    const { user_id, session_id, title, conversation } = req.body;
    const convo = await addConversation(user_id, session_id, title, conversation);    
    res.status(201).json({ success: true, data: convo });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to add conversation' });
  }
});

/* ---------- UPDATE (overwrite) ---------- */
router.put('/', async (req, res) => {
    try {
      const { user_id, session_id, title, conversation } = req.body;
      const convo = await updateConversation(user_id, session_id, title, conversation);
      res.status(200).json({ success: true, data: convo });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, message: 'Failed to update conversation' });
    }
});

/* ---------- DELETE one session ---------- */
router.delete('/', async (req, res) => {
  try {
    const { user_id, session_id } = req.body;
    const ok = await deleteConversation(user_id, session_id);
    res.status(ok ? 200 : 404).json({ success: ok });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to delete conversation' });
  }
});

/* ---------- GET recent N ---------- */
router.get('/recent/:userId/:limit', async (req, res) => {
  try {
    const { userId, limit } = req.params;
    const rows = await getRecentConversations(userId, Number(limit));
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

/* ---------- GET all ---------- */
router.get('/all/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const rows = await getAllConversations(userId);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

export default router;
