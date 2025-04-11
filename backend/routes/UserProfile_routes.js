import express from 'express';
const { 
    createProfile,
    updateProfile,
    deleteProfile,
    getProfile,
    addProfilePicture
  } = await import('../models/UserProfile_model.js');

import rateLimit from 'express-rate-limit';
import { upload } from '../utils/FileUtils.js';
const URL = "http://192.168.1.32:5000"


const router = express.Router();
router.use(express.urlencoded({ extended: true }));


// Create a new profile
router.post('/create', async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await createProfile(userId);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Error creating profile' });
  }
});

// Update a user's profile
router.put('/update', async (req, res) => {
  try {
    const { userId, profileInfo } = req.body;
    const result = await updateProfile(userId, profileInfo);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// Delete a user's profile
router.delete('/delete/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await deleteProfile(userId);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Error deleting profile' });
  }
});


const profilePicRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 60, 
  handler: (req, res) => {
    res.status(200).json({
      message: 'You have exceeded the request limit. Please wait before trying again.',
    });
  },
});

// Get a user's profile
router.get('/:userId', profilePicRateLimiter, async (req, res) => {

  try {
    const { userId } = req.params;
    const result = await getProfile(userId);

    if (result) {
      const ProfilePicName = result.profile.profile_picture;
      const profilePicUrl = `${URL}/get/profilePic/${ProfilePicName}`;
      
      res.status(200).json({ ...result, profilePicUrl });
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    console.error('Error retrieving profile:', error);
    res.status(500).json({ error: 'Error retrieving profile' });
  }
});

// Route to handle profile picture upload
router.post('/UpdateProfilePicture', upload.single('profilePicture'), async (req, res) => {

  const userId = req.body.userId;

  try {
    console.log('Request received to UpdateProfilePicture');

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const resultDB = await addProfilePicture(req.file.originalname, userId)

    if (resultDB.success == true){
    res.status(200).json({
      
      message: 'Profile picture uploaded successfully'

    })} else res.status(500).json(resultDB.message);
  } catch (error) {
    console.error('Error in UpdateProfilePicture route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
