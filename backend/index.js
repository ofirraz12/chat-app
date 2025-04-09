// backend/index.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const { OLLAMA_URL, OLLAMA_MODEL, PORT } = process.env;

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await axios.post(
      `${OLLAMA_URL}/chat/completions`,
      { model: OLLAMA_MODEL, messages },
      { responseType: 'stream' }
    );
    // stream tokens back to the client in real time:
    response.data.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
