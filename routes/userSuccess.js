const express = require('express');
const router = express.Router();
const UserSuccess = require('../models/UserSuccess');

// GET /api/user-success - Get random user success stories
router.get('/', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get random active user success stories with better randomization
    const userSuccessStories = await UserSuccess.aggregate([
      { $match: { isActive: true } },
      { $addFields: { randomSort: { $rand: {} } } }, // Add random field for better randomization
      { $sort: { randomSort: 1 } }, // Sort by random field
      { $limit: parseInt(limit) }, // Limit the results
      { $project: { randomSort: 0 } } // Remove the random field from output
    ]);

    console.log(`📊 Fetched ${userSuccessStories.length} random user success stories`);

    res.json({
      success: true,
      data: userSuccessStories,
      count: userSuccessStories.length
    });
  } catch (error) {
    console.error('Error fetching user success stories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user success stories',
      error: error.message
    });
  }
});

// GET /api/user-success/random - Get a single random user success story
router.get('/random', async (req, res) => {
  try {
    const userSuccessStory = await UserSuccess.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 1 } }
    ]);

    if (userSuccessStory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No user success stories found'
      });
    }

    res.json({
      success: true,
      data: userSuccessStory[0]
    });
  } catch (error) {
    console.error('Error fetching random user success story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch random user success story',
      error: error.message
    });
  }
});

// GET /api/user-success/country/:country - Get user success stories by country
router.get('/country/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const { limit = 10 } = req.query;
    
    const userSuccessStories = await UserSuccess.find({
      country: { $regex: new RegExp(country, 'i') },
      isActive: true
    })
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: userSuccessStories,
      count: userSuccessStories.length
    });
  } catch (error) {
    console.error('Error fetching user success stories by country:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user success stories by country',
      error: error.message
    });
  }
});

// GET /api/user-success/stats - Get statistics about user success stories
router.get('/stats', async (req, res) => {
  try {
    const totalStories = await UserSuccess.countDocuments({ isActive: true });
    const countries = await UserSuccess.distinct('country');
    const totalWeightLost = await UserSuccess.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$weightLost' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalStories,
        uniqueCountries: countries.length,
        totalWeightLost: totalWeightLost[0]?.total || 0,
        averageWeightLost: totalWeightLost[0]?.total / totalStories || 0
      }
    });
  } catch (error) {
    console.error('Error fetching user success statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user success statistics',
      error: error.message
    });
  }
});

module.exports = router; 