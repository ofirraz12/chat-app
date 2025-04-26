import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import { connectDB, closeDB } from './config/db.js';
import { loadSummaries } from './routes/LLM/llm_routes.js';
import { WebSocketServer } from 'ws';
import { setupWebSocketConnection } from './routes/wsConnection/chatConnection.js';

import UserAuthRoutes from './routes/User/UserAuth_routes.js';
import UserSettingsRoutes from './routes/User/UserSettings_routes.js'; 
import UserProfileRoutes from './routes/User/UserProfile_routes.js';
import LLM_Routes from './routes/LLM/llm_routes.js';
import ConvRoutes from './routes/LLM/UserConvo_routes.js';

dotenv.config();
const app = express();
const server = http.createServer(app);  // Use http server for both WS + Express
const wss = new WebSocketServer({ server });  // Attach WS to same HTTP server
const PORT = process.env.PORT || 5000;
const ServerUrl = process.env.SERVER_URL;
const AppState = process.env.APP_STATE;

// Load LLM Tool/Scripts summaries
loadSummaries();

// Connect to DB
connectDB();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// REST API Routes
app.use("/api/auth", UserAuthRoutes);
app.use("/api/usersettings", UserSettingsRoutes);
app.use("/api/userprofile", UserProfileRoutes);
app.use("/api/llm", LLM_Routes);
app.use("/api/llm/conversation", ConvRoutes);

// Serve React frontend and static assets
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildPath = path.join(__dirname, 'frontend', 'build');

app.use(express.static(buildPath));
app.use('/get/profilePic', express.static(path.join(__dirname, 'UsersUploads/ProfilePic')));

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Fallback for React SPA
app.get('*', (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('not found');
    }
});

// WebSocket Handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    setupWebSocketConnection(ws);  // Custom logic for WS in this function
});

// Start both HTTP & WS
server.listen(PORT, () => {
    console.log(`HTTP + WebSocket Server is running on: ${ServerUrl}`);

    if (AppState === 'prod') {
        setInterval(async () => {
            try {
                const res = await fetch(`${ServerUrl}/health`);
                const data = await res.json();
                console.log('Self-ping success:', data);
            } catch (err) {
                console.error('Self-ping failed:', err.message);
            }
        }, 4 * 60 * 1000);
    }
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await closeDB();
    process.exit(0);
});
