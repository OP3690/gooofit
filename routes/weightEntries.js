const express = require('express');
const { body, validationResult } = require('express-validator');
const WeightEntry = require('../models/WeightEntry');
const User = require('../models/User');
const mongoose = require('mongoose');
const router = express.Router();

// Helper function to calculate BMI
function calculateBMI(weight, height) {
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

// Validation middleware
const validateWeightEntry = [
  body('userId')
    .custom((value) => {
      if (value === 'demo') return true;
      if (!value || !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('User ID must be a valid MongoDB ObjectId or "demo"');
      }
      return true;
    })
    .withMessage('Valid user ID is required'),
  body('weight')
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  body('date')
    .notEmpty().withMessage('Date is required.')
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Date must be in YYYY-MM-DD format.'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('goalId')
    .optional()
    .custom((value) => {
      if (value && value !== 'demo' && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Goal ID must be a valid MongoDB ObjectId or "demo"');
      }
      return true;
    })
    .withMessage('Valid goal ID is required')
];

// Create new weight entry
router.post('/', validateWeightEntry, async (req, res) => {
  if (req.body.userId === 'demo') {
    return res.json({ message: 'Demo user: weight entry not created.' });
  }
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { userId, weight, date, notes, goalId } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Use a timezone-safe approach for the date
    const entryDate = new Date(`${date}T00:00:00.000Z`);

    // Check if entry date is before goal creation date
    if (user.goalCreatedAt && entryDate < new Date(user.goalCreatedAt).setHours(0, 0, 0, 0)) {
      return res.status(400).json({ 
        message: `Cannot add weight entries for dates before your goal creation date (${new Date(user.goalCreatedAt).toLocaleDateString('en-GB')})` 
      });
    }

    // Find existing entry for the same day (UTC)
    const startOfDay = new Date(entryDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);
    
    let weightEntry = await WeightEntry.findOne({
      userId,
      date: { $gte: startOfDay, $lt: endOfDay }
    });

    let message = '';
    let statusCode = 200;

    if (weightEntry) {
      // Update existing entry
      weightEntry.weight = weight;
      weightEntry.notes = notes;
      if (goalId) weightEntry.goalId = goalId;
      message = 'Weight entry updated successfully';
    } else {
      // Create new entry
      weightEntry = new WeightEntry({
        userId,
        weight,
        date: entryDate,
        notes,
        goalId
      });
      message = 'Weight entry created successfully';
      statusCode = 201;
    }

    await weightEntry.save();

    const bmi = weightEntry.calculateBMI(user.height);

    res.status(statusCode).json({
      message,
      entry: {
        id: weightEntry._id,
        weight: weightEntry.weight,
        date: weightEntry.date,
        notes: weightEntry.notes,
        bmi
      }
    });
  } catch (error) {
    console.error('Error creating weight entry:', error);
    res.status(500).json({ message: 'Error creating weight entry' });
  }
});

// Get all weight entries for a user
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { goalId } = req.query;
    console.log('[DEBUG] GET /user/:userId', { userId, goalId }); // Debug log
    if (userId === 'demo') {
      const demoEntries = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const baseWeight = 76 - i * 0.1;
        const fluctuation = (Math.random() - 0.5) * 0.3;
        const weight = Math.round((baseWeight + fluctuation) * 10) / 10;
        demoEntries.push({
          id: `demo-entry-${i}`,
          date: date.toISOString(),
          weight,
          notes: i % 7 === 0 ? 'Weekly check-in' : '',
          bmi: calculateBMI(weight, 170)
        });
      }
      return res.json({
        entries: demoEntries,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalEntries: demoEntries.length,
          hasNext: false,
          hasPrev: false
        }
      });
    }
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Get date range - support both 30 days and all entries
    const { all = false } = req.query;
    let match = {
      userId: new mongoose.Types.ObjectId(userId)
    };
    
    if (!all) {
      // Default to last 30 days
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
      match.date = { $gte: startDate, $lte: today };
    }
    if (goalId) {
      match.goalId = goalId;
    }
    const entries = await WeightEntry.find(match).sort({ date: -1 });
    console.log('[DEBUG] Entries returned:', entries); // Debug log
    return res.json({
      entries,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalEntries: entries.length,
        hasNext: false,
        hasPrev: false
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get weight entry by ID
router.get('/:id', async (req, res) => {
  try {
    const entry = await WeightEntry.findById(req.params.id)
      .populate('userId', 'name height')
      .select('-__v');

    if (!entry) {
      return res.status(404).json({ message: 'Weight entry not found' });
    }

    const bmi = entry.calculateBMI(entry.userId.height);

    res.json({
      ...entry.toObject(),
      bmi
    });
  } catch (error) {
    console.error('Error fetching weight entry:', error);
    res.status(500).json({ message: 'Error fetching weight entry' });
  }
});

// Update weight entry
router.put('/:id', validateWeightEntry, async (req, res) => {
  if (req.body.userId === 'demo' || req.params.id === 'demo') {
    return res.json({ message: 'Demo user: weight entry not updated.' });
  }
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { weight, notes, date, goalId, userId } = req.body;
    console.log('Update request data:', { weight, notes, date, goalId, userId, entryId: req.params.id });
    
    // Validate that the entryId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('Invalid entryId:', req.params.id);
      return res.status(400).json({ 
        message: 'Invalid entryId: must be a valid MongoDB ObjectId' 
      });
    }
    
    const updateData = { weight, notes };
    if (date) {
      updateData.date = new Date(date);
    }
    if (goalId) {
      updateData.goalId = goalId;
    }
    
    const entry = await WeightEntry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name height').select('-__v');

    if (!entry) {
      console.error('Entry not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Weight entry not found' });
    }

    const bmi = entry.calculateBMI(entry.userId.height);

    res.json({
      message: 'Weight entry updated successfully',
      entry: {
        ...entry.toObject(),
        bmi
      }
    });
  } catch (error) {
    console.error('Error updating weight entry:', error);
    res.status(500).json({ message: 'Error updating weight entry', error: error.message });
  }
});

// Delete weight entry
router.delete('/:id', async (req, res) => {
  if (req.params.id === 'demo') {
    return res.json({ message: 'Demo user: weight entry not deleted.' });
  }
  try {
    const entry = await WeightEntry.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Weight entry not found' });
    }
    res.json({ message: 'Weight entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting weight entry:', error);
    res.status(500).json({ message: 'Error deleting weight entry' });
  }
});

// Get weight analytics for a user
router.get('/user/:userId/analytics', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '90', startDate, goalId } = req.query; // days, optional startDate, and goalId

    // Handle demo user
    if (userId === 'demo') {
      const days = parseInt(period);
      const entries = [];
      const startWeight = 76;
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const baseWeight = startWeight - (days - i) * 0.1;
        const fluctuation = (Math.random() - 0.5) * 0.5;
        const weight = Math.round((baseWeight + fluctuation) * 10) / 10;
        entries.push({
          date,
          weight,
          bmi: calculateBMI(weight, 170),
          goalId: 'demo-goal-123',
          createdAt: date
        });
      }
      const weights = entries.map(entry => entry.weight);
      const averageWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
      const weightChange = weights[weights.length - 1] - weights[0];
      let trend = 'stable';
      if (weightChange < -0.5) trend = 'decreasing';
      else if (weightChange > 0.5) trend = 'increasing';
      return res.json({
        analytics: {
          totalEntries: entries.length,
          averageWeight: averageWeight.toFixed(1),
          weightChange: weightChange.toFixed(1),
          trend,
          entries,
          currentWeight: weights[weights.length - 1],
          targetWeight: 70,
          progressToTarget: Math.max(0, Math.min(100, ((startWeight - weights[weights.length - 1]) / (startWeight - 70)) * 100)),
          initialWeight: startWeight
        }
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the correct targetWeight and goalCreatedAt for the current goal
    let targetWeight = user.targetWeight;
    let goalCreatedAt = user.goalCreatedAt;
    
    if (goalId) {
      // Check active goal
      if (user.goalId && user.goalId.toString() === goalId && user.targetWeight) {
        targetWeight = user.targetWeight;
        goalCreatedAt = user.goalCreatedAt;
      } else if (user.pastGoals && Array.isArray(user.pastGoals)) {
        const pastGoal = user.pastGoals.find(g => g.goalId && g.goalId.toString() === goalId && g.targetWeight);
        if (pastGoal) {
          targetWeight = pastGoal.targetWeight;
          goalCreatedAt = pastGoal.startedAt;
        }
      }
    }

    console.log('[ANALYTICS DEBUG]', {
      goalId,
      userGoalId: user.goalId?.toString(),
      userTargetWeight: user.targetWeight,
      foundTargetWeight: targetWeight,
      goalCreatedAt,
      pastGoals: user.pastGoals?.map(g => ({ goalId: g.goalId?.toString(), targetWeight: g.targetWeight }))
    });

    // Build filter for WeightEntry - be more flexible with goalId filtering
    const filter = {
      userId
    };
    
    // If goalId is provided, try to filter by it, but don't make it mandatory
    if (goalId && goalId !== 'undefined' && goalId !== 'null') {
      filter.goalId = goalId;
    }
    
    // If we have a goalCreatedAt, only include entries whose date is on or after the goal was created
    if (goalCreatedAt) {
      // Use date part only (YYYY-MM-DD) to avoid time-based filtering issues
      const goalDate = new Date(goalCreatedAt);
      const goalDateStr = goalDate.toISOString().slice(0, 10); // 'YYYY-MM-DD'
      const startOfGoalDate = new Date(goalDateStr + 'T00:00:00.000Z');
      filter.date = { $gte: startOfGoalDate };
    } else if (startDate) {
      // Fallback to startDate if no goalCreatedAt
      filter.date = { $gte: new Date(startDate) };
    } else {
      // Default to period days back
      const filterStartDate = new Date();
      filterStartDate.setDate(filterStartDate.getDate() - parseInt(period));
      filter.date = { $gte: filterStartDate };
    }
    
    // Debug log for filter
    console.log('[ANALYTICS FILTER]', filter);

    // First, try with the filter as is
    let entries = await WeightEntry.find(filter).sort({ date: 1 });
    
    // If no entries found and we were filtering by goalId, try without goalId filter
    if (entries.length === 0 && filter.goalId) {
      console.log('[ANALYTICS] No entries found with goalId filter, trying without goalId');
      delete filter.goalId;
      entries = await WeightEntry.find(filter).sort({ date: 1 });
    }

    if (entries.length === 0) {
      return res.json({
        message: 'No weight entries found for the specified period and goal',
        analytics: {
          totalEntries: 0,
          averageWeight: 0,
          weightChange: 0,
          trend: 'stable',
          bmiTrend: [],
          currentWeight: user.currentWeight || 0,
          targetWeight,
          progressToTarget: 0,
          initialWeight: user.currentWeight || 0
        }
      });
    }

    // Calculate analytics
    const weights = entries.map(entry => entry.weight);
    
    // Find initialWeight: first entry in the filtered results (goal start weight)
    const initialWeight = entries[0].weight;
    
    // Find currentWeight: latest entry in the filtered results
    const currentWeight = entries[entries.length - 1].weight;

    const averageWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
    const weightChange = currentWeight && initialWeight ? currentWeight - initialWeight : 0;
    
    // Determine trend
    let trend = 'stable';
    if (weightChange > 0.5) trend = 'increasing';
    else if (weightChange < -0.5) trend = 'decreasing';
    
    // Calculate progress to target using initialWeight for this goal and correct targetWeight
    const progressToTarget = (initialWeight && currentWeight && targetWeight && initialWeight !== targetWeight)
      ? ((initialWeight - currentWeight) / (initialWeight - targetWeight)) * 100
      : 0;

    // Calculate BMI trend
    const bmiTrend = entries.map(entry => ({
      date: entry.date,
      weight: entry.weight,
      bmi: entry.calculateBMI(user.height)
    }));

    console.log('[PROGRESS DEBUG]', {
      initialWeight,
      currentWeight,
      targetWeight,
      progressToTarget: Math.max(0, Math.min(100, progressToTarget))
    });

    // Before sending response, log the entries
    console.log('[ANALYTICS FINAL ENTRIES]', entries);
    res.json({
      message: entries.length === 0 ? 'No weight entries found for the specified period and goal' : 'Success',
      analytics: {
        totalEntries: entries.length,
        averageWeight: averageWeight.toFixed(1),
        weightChange: weightChange.toFixed(1),
        trend,
        entries,
        bmiTrend,
        currentWeight,
        targetWeight,
        progressToTarget: Math.max(0, Math.min(100, progressToTarget)),
        initialWeight
      }
    });
  } catch (error) {
    console.error('Error fetching weight analytics:', error);
    res.status(500).json({ message: 'Error fetching weight analytics' });
  }
});

// Helper functions
function calculateWeeklySummary(entries, height) {
  const weeks = {};
  
  entries.forEach(entry => {
    const weekStart = new Date(entry.date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }
    weeks[weekKey].push(entry);
  });

  return Object.keys(weeks).map(weekKey => {
    const weekEntries = weeks[weekKey];
    const weights = weekEntries.map(entry => entry.weight);
    const avgWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
    
    return {
      week: weekKey,
      averageWeight: avgWeight.toFixed(1),
      entries: weekEntries.length,
      bmi: (avgWeight / Math.pow(height / 100, 2)).toFixed(1)
    };
  });
}

function calculateMonthlySummary(entries, height) {
  const months = {};
  
  entries.forEach(entry => {
    const monthKey = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!months[monthKey]) {
      months[monthKey] = [];
    }
    months[monthKey].push(entry);
  });

  return Object.keys(months).map(monthKey => {
    const monthEntries = months[monthKey];
    const weights = monthEntries.map(entry => entry.weight);
    const avgWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
    
    return {
      month: monthKey,
      averageWeight: avgWeight.toFixed(1),
      entries: monthEntries.length,
      bmi: (avgWeight / Math.pow(height / 100, 2)).toFixed(1)
    };
  });
}

function calculateProgressToTarget(currentWeight, targetWeight, initialWeight) {
  const totalChange = Math.abs(initialWeight - targetWeight);
  const currentChange = Math.abs(currentWeight - targetWeight);
  
  if (totalChange === 0) return 100;
  
  const progress = ((totalChange - currentChange) / totalChange) * 100;
  return Math.max(0, Math.min(100, progress.toFixed(1)));
}

module.exports = router; 