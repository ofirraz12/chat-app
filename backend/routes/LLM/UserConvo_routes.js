import express, { response } from 'express';
import {
  createSession,
  saveMessage,
  updateSessionTitle,
  getMessages,
  getAllSessions,
  getSession
} from '../../models/llm_models/conversations_model.js';
import { runLLMFlow } from '../../LLM/llmHelper.js'

const router = express.Router();

/** Start a new session */
router.post('/session', async (req, res) => {
  try {
    const { user_id, session_id, title } = req.body;
    const session = await createSession(user_id, session_id, title);
    res.status(201).json({ success: true, data: session });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to create session' });
  }
});

/** Send one message */
router.post('/message', async (req, res) => {
  try {
    const { user_id, session_id, role, message, send_at, model } = req.body;
    let finalResponse = {};
    let title = null;
    let sessionId = session_id;

    if (!message) return res.status(400).json({ message: 'message is required' });

    // create a new session only once
    if (session_id.startsWith("new")) {
      sessionId = "old" + user_id + Date.now().toString();
      title = message.split(" ")[0];
      await createSession(user_id, sessionId, title);
      finalResponse["title"] = title;
      finalResponse["session_id"] = sessionId;  // return this to frontend
    }

    // Save user message
    await saveMessage(user_id, sessionId, role, message, send_at);

    const { trainer_reply } = await runLLMFlow({
      context: "lose weight",
      user_prompt: message,
      user_style: "onBoarding",
      model
    });

    if (!trainer_reply) throw new Error('Trainer reply is empty');

    await saveMessage(user_id, sessionId, "trainer", trainer_reply, new Date().toLocaleString("sv-SE", { timeZone: "Asia/Jerusalem" }));

    res.status(200).json({
      ...finalResponse,
      success: true,
      session_id: sessionId,
      trainer_reply,
    });

  } catch (e) {
    console.error('Unexpected error:', e);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: e.message || 'Server error processing message' });
    }
  }
});



/** Update session title */
router.put('/session', async (req, res) => {
  try {
    const { user_id, session_id, title } = req.body;
    const updated = await updateSessionTitle(user_id, session_id, title);
    res.status(200).json({ success: true, data: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to update session' });
  }
});

/** Fetch recent N messages */
router.get('/message/:userId/:sessionId/:limit', async (req, res) => {
  try {
    const { userId, sessionId, limit } = req.params;
    const messages = await getMessages(userId, sessionId, Number(limit));
    res.json({ success: true, data: messages });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

/** Get session */
router.get('/session/:userId/:sessionId', async (req, res) => {
  try {
    const { userId, sessionId } = req.params;
    const messages = await getMessages(userId, sessionId);
    res.json({ success: true, data: messages });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

/** Fetch all sessions */
router.get('/sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await getAllSessions(userId);
    res.json({ success: true, data: sessions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

export default router;
