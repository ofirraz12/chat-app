import { createSession, saveMessage } from '../../models/llm_models/conversations_model.js'
import { runLLMFlow } from '../../LLM/llmHelper.js';

export async function processUserMessage({ user_id, session_id, role, message, send_at, model }) {
    if (!message) throw new Error('Message is required');
    let received_at = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Jerusalem" })
    let sessionId = session_id;
    let title = null;
    const feedback = {};

    // Handle new session creation
    if (session_id.startsWith("new")) {
        const tempSessionId = session_id;
        sessionId = "old" + user_id + Date.now().toString();
        title = message.split(" ")[0];
        await createSession(user_id, sessionId, title);
        feedback.title = title;
        feedback.session_id = sessionId;
        feedback.temp_id = tempSessionId;
    }

    // Save user message
    await saveMessage(user_id, sessionId, role, message, received_at);

    // Run LLM Flow
    const { trainer_reply } = await runLLMFlow({
        user_id,
        session_id: sessionId,
        user_prompt: message,
        user_style: "onBoarding",
        model
    });

    if (!trainer_reply) throw new Error('Trainer reply is empty');

    // Save trainer reply
    await saveMessage(user_id, sessionId, "trainer", trainer_reply, new Date().toLocaleString("sv-SE", { timeZone: "Asia/Jerusalem" }));

    return {
        ...feedback,
        success: true,
        session_id: sessionId,
        trainer_reply,
    };
}
