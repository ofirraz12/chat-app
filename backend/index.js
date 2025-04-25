import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import { connectDB, closeDB } from './config/db.js';  // Use pool instead of client
import { loadSummaries, getSummaries } from './routes/LLM/llm_routes.js';

import { WebSocketServer } from 'ws';
import { setupWebSocketConnection } from './routes/wsConnection/chatConnection.js';

import UserAuthRoutes from './routes/User/UserAuth_routes.js';
import UserSettingsRoutes from './routes/User/UserSettings_routes.js'; 
import UserProfileRoutes from './routes/User/UserProfile_routes.js';
import LLM_Routes from './routes/LLM/llm_routes.js';
import ConvRoutes from './routes/LLM/UserConvo_routes.js'

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
const ServerUrl = process.env.SERVER_URL;
const AppState = process.env.APP_STATE

loadSummaries()
// Middleware
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true 
}));
app.use(express.json());

connectDB();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

// API Routes
app.use("/api/auth", UserAuthRoutes);
app.use("/api/usersettings", UserSettingsRoutes);
app.use("/api/userprofile", UserProfileRoutes);
app.use("/api/llm", LLM_Routes);
app.use("/api/llm/conversation", ConvRoutes);

// Serve static files from the React frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildPath = path.join(__dirname, 'frontend', 'build');

app.use(express.static(buildPath));

// Serve static files for user uploads
app.use('/get/profilePic',
     express.static(path.join(__dirname, 'UsersUploads/ProfilePic')));

// Serve React app for any route not handled by API
app.get("/health", (req, res) => {
    res.status(200).json({status: 'ok'})
})

app.get('*', (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
  
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('not found');
    }
  });


const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  setupWebSocketConnection(ws); 
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on: ${ServerUrl}`);

    if (AppState === 'prod') {
        setInterval(async () => {
          try {
            const res = await fetch(`${ServerUrl}/health`);
            const data = await res.json();
            console.log('Self-ping success:', data);
          } catch (err) {
            console.error('Self-ping failed:', err.message);
          }
        }, 4 * 60 * 1000); // Every 4 minutes
      }
});



// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await closeDB();
    process.exit(0);
});
