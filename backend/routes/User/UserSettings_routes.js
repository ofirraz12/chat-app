import express from 'express';
const router = express.Router();
const { createSettings, getSettings, updateSettings } = await import('../../models/User/UserSettings_model.js');

// Create settings for a user
router.post('/create', async (req, res) => {
  try {
    const { userId, settings } = req.body; // `settings` is an object with key-value pairs
    const result = await createSettings(userId, settings);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating settings:', error);
    res.status(500).json({ error: 'Error creating settings' });
  }
});

// Get settings for a user
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await getSettings(userId);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error('Error retrieving settings:', error);
    res.status(500).json({ error: 'Error retrieving settings' });
  }
});

// Update settings dynamically for a user
router.put('/update', async (req, res) => {
  try {
    const { userId, settings } = req.body; // `settings` is an object with key-value pairs
    const result = await updateSettings(userId, settings);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Error updating settings' });
  }
});

export default router;
