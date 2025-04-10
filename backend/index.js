import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, closeDB } from './config/db.js';  // Use pool instead of client
import UserAuthRoutes from './routes/UserAuth_routes.js';
import UserSettingsRoutes from './routes/UserSettings_routes.js'; 
import UserProfileRoutes from './routes/UserProfile_routes.js';

const app = express();
dotenv.config();
const PORT = 5000;
const ServerUrl = `http://localhost:${PORT}`;
const FrontEndUrl = `http://localhost:8081`;

// Middleware
app.use(cors({
    origin: FrontEndUrl, 
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

// Serve static files from the React frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildPath = path.join(__dirname, 'frontend', 'build');

app.use(express.static(buildPath));

// Serve static files for user uploads
app.use('/get/profilePic',
     express.static(path.join(__dirname, 'UsersUploads/ProfilePic')));

// const uploadDir = path.join(__dirname, 'UsersUploads/ProfilePic');
// app.use('/upload/profilePic', express.static(uploadDir));

// Serve React app for any route not handled by API
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on: ${ServerUrl}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await closeDB();
    process.exit(0);
});
