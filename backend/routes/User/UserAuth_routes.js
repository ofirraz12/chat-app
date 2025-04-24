import express from 'express';
import { createSettings } from '../../models/User/UserSettings_model.js';
const router = express.Router();
import { createUser, LoginUser, SignOut } from '../../models/User/UserAuth_model.js';

// Route to create a new user (Sign Up)
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Create the user
        const userResult = await createUser(name, email, password);
        if (!userResult.success) {
            return res.status(400).json(userResult);
        }

        // Create default settings for the user
        const userId = userResult.user.id;
        const settingsResult = await createSettings(userId);
        if (!settingsResult.success) {
            console.error('Error creating user settings:', settingsResult.message);
            return res.status(500).json({ error: 'User created but failed to create settings' });
        }

        // Return the user and settings creation success response
        res.status(201).json({
            success: true,
            message: 'User and settings created successfully',
            user: userResult.user,
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const id = req.body.id;
        const result = await SignOut(id);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error login out:', error);
        res.status(500).json({ error: 'Error login out' });
    }
});

// Route for user sign-in
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("post: ", {email, password})
        const result = await LoginUser(email, password);
        if (result.success) {
            console.log("status 200")
            res.status(200).json(result);
        } else {
            console.log("status 401")
            res.status(401).json({ message: result.message });
        }
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ error: 'Error during sign-in' });
    }
});

export default router;
