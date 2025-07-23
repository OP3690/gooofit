const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const router = express.Router();
const WeightEntry = require('../models/WeightEntry');
const { sendWelcomeEmail, sendPasswordResetEmail, generateOTP } = require('../services/emailService');
const PasswordReset = require('../models/PasswordReset');

// Validation middleware for full user updates
const validateUserData = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('age')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Age must be between 1 and 120'),
  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
  body('currentWeight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Current weight must be between 20 and 500 kg'),
  body('targetWeight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Target weight must be between 20 and 500 kg'),
  body('targetDate')
    .optional()
    .isISO8601()
    .custom((value) => {
      if (!value) return true;
      const targetDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (targetDate <= today) {
        throw new Error('Target date must be a future date');
      }
      return true;
    })
    .withMessage('Target date must be a future date')
];

// Add a new validation middleware for goal creation only
const validateGoalData = [
  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
  body('currentWeight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Current weight must be between 20 and 500 kg'),
  body('targetWeight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Target weight must be between 20 and 500 kg'),
  body('targetDate')
    .optional()
    .isISO8601()
    .custom((value) => {
      if (!value) return true;
      const targetDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (targetDate <= today) {
        throw new Error('Target date must be a future date');
      }
      return true;
    })
    .withMessage('Target date must be a future date')
];

// Validation middleware for goal updates (more lenient)
const validateGoalUpdate = [
  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
  body('currentWeight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Current weight must be between 20 and 500 kg'),
  body('targetWeight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Target weight must be between 20 and 500 kg'),
  body('targetDate')
    .optional()
    .isISO8601()
    .custom((value) => {
      if (!value) return true;
      const targetDate = new Date(value);
      const today = new Date();
      // Add 1 day to today to be more lenient with timezone issues
      today.setDate(today.getDate() + 1);
      today.setHours(0, 0, 0, 0);
      if (targetDate <= today) {
        throw new Error('Target date must be at least 1 day in the future');
      }
      return true;
    })
    .withMessage('Target date must be at least 1 day in the future')
];

// Registration (Onboarding + Weight Goal)
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('mobileNumber').matches(/^\+[0-9]{1,4}[0-9]{10,15}$/).withMessage('Valid international mobile number is required'),
  body('country').isLength({ min: 2 }).withMessage('Country is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('age').isInt({ min: 13, max: 120 }).withMessage('Age must be between 13 and 120'),
  body('height').isFloat({ min: 100, max: 250 }).withMessage('Height must be between 100 and 250 cm'),
  body('currentWeight').isFloat({ min: 20, max: 300 }).withMessage('Weight must be between 20 and 300 kg'),
  body('goalWeight').isFloat({ min: 20, max: 300 }).withMessage('Goal weight must be between 20 and 300 kg'),
  body('targetDate').isISO8601().custom((value) => {
    const targetDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (targetDate <= today) {
      throw new Error('Target date must be a future date');
    }
    return true;
  }).withMessage('Target date must be a future date'),
  body('daysToTarget').isInt({ min: 1, max: 3650 }).withMessage('Days to target must be between 1 and 3650')
], async (req, res) => {
  try {
    console.log('🔍 Registration attempt with data:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    
    const { name, email, mobileNumber, country, password, gender, age, height, currentWeight, goalWeight, targetDate, daysToTarget } = req.body;
    
    console.log('✅ Validation passed, checking for existing user...');
    
    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { mobileNumber }] });
    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email);
      return res.status(400).json({ message: 'Email or mobile number already registered' });
    }
    
    console.log('✅ No existing user found, creating new user...');
    
    // Create a new goal ID
    const goalId = new mongoose.Types.ObjectId();
    
    const user = new User({
      name,
      email,
      mobileNumber,
      country,
      password,
      gender,
      age: Number(age),
      height: Number(height),
      currentWeight: Number(currentWeight),
      goalWeight: Number(goalWeight),
      targetWeight: Number(goalWeight), // Set targetWeight to match goalWeight
      targetDate: new Date(targetDate),
      daysToTarget: Number(daysToTarget),
      goalId: goalId,
      goalInitialWeight: Number(currentWeight),
      goalCreatedAt: new Date(), // Set the goal creation date
      goalStatus: 'active', // Ensure goal status is set to active
    });
    
    console.log('✅ User object created, saving to database...');
    
    // Save the user first
    await user.save();
    
    console.log('✅ User saved successfully, migrating goal IDs...');
    
    // Migrate any existing UUID goalIds to ObjectIds (if needed)
    await migrateGoalIds(user);
    
    console.log('✅ Goal IDs migrated, creating initial weight entry...');
    
    // Create initial weight entry for the goal
    try {
      const WeightEntry = require('../models/WeightEntry');
      const entryDate = new Date(user.goalCreatedAt);
      entryDate.setUTCHours(0, 0, 0, 0);
      
      const existingEntry = await WeightEntry.findOne({
        userId: user._id,
        goalId: user.goalId,
        date: { $gte: entryDate, $lt: new Date(entryDate.getTime() + 24 * 60 * 60 * 1000) }
      });
      
      if (!existingEntry) {
        const createdEntry = await WeightEntry.create({
          userId: user._id,
          weight: user.currentWeight,
          date: entryDate,
          goalId: user.goalId,
          notes: 'Auto-created for goal start'
        });
        console.log('✅ Initial weight entry created:', createdEntry._id);
      } else {
        console.log('✅ Initial weight entry already exists');
      }
    } catch (weightEntryError) {
      console.error('Failed to create initial weight entry:', weightEntryError);
      // Don't fail registration if weight entry creation fails
    }
    
    console.log('✅ Initial weight entry created, sending welcome email...');
    
    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
      console.log('Welcome email sent successfully to:', user.email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }
    
    console.log('✅ Registration completed successfully!');
    
    res.status(201).json({ 
      message: 'Registration successful', 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        mobileNumber: user.mobileNumber,
        country: user.country,
        goalId: user.goalId?.toString(), 
        goalInitialWeight: user.goalInitialWeight,
        targetDate: user.targetDate,
        daysToTarget: user.daysToTarget
      } 
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error message:', error.message);
    if (error.errors) {
      console.error('❌ Validation errors:', error.errors);
    }
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    // Generate JWT
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender,
        height: user.height,
        currentWeight: user.currentWeight,
        targetWeight: user.targetWeight,
        targetDate: user.targetDate,
        goalInitialWeight: user.goalInitialWeight,
        goalStatus: user.goalStatus,
        goalCreatedAt: user.goalCreatedAt,
        goalId: user.goalId?.toString()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Create new user profile
router.post('/', validateUserData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const userData = req.body;
    const user = new User(userData);
    // Migrate any existing UUID goalIds to ObjectIds
    await migrateGoalIds(user);
    await user.save();

    // Automatically create a weight entry for the goal start date if it doesn't exist
    if (user.goalId && user.goalCreatedAt && user.currentWeight) {
      const WeightEntry = require('../models/WeightEntry');
      const entryDate = new Date(user.goalCreatedAt);
      entryDate.setUTCHours(0, 0, 0, 0);
      const startOfDay = new Date(entryDate);
      const endOfDay = new Date(entryDate);
      endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);
      const existingEntry = await WeightEntry.findOne({
        userId: user._id,
        goalId: user.goalId,
        date: { $gte: startOfDay, $lt: endOfDay }
      });
      if (!existingEntry) {
        const createdEntry = await WeightEntry.create({
          userId: user._id,
          weight: user.currentWeight,
          date: entryDate,
          goalId: user.goalId,
          notes: 'Auto-created for goal start'
        });
        console.log('[AUTO-WEIGHT-ENTRY]', createdEntry);
      }
    }

    res.status(201).json({
      message: 'User profile created successfully',
      user: {
        id: user._id,
        name: user.name,
        gender: user.gender,
        age: user.age,
        height: user.height,
        currentWeight: user.currentWeight,
        targetWeight: user.targetWeight,
        targetDate: user.targetDate,
        currentBMI: user.currentBMI,
        targetBMI: user.targetBMI
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user profile' });
  }
});

// Get all users (for demo purposes)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    // Handle demo user
    if (req.params.id === 'demo') {
      return res.json({
        id: 'demo',
        name: 'Demo User',
        email: 'demo@example.com',
        mobileNumber: '+1234567890',
        gender: 'male',
        age: 30,
        height: 170,
        currentWeight: 74.2,
        targetWeight: 70,
        targetDate: new Date(Date.now() + 83 * 24 * 60 * 60 * 1000),
        goalStatus: 'active',
        goalCreatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        goalId: 'demo-goal-123',
        pastGoals: [],
        goals: [],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      });
    }
    
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Return a consistent user object including goalCreatedAt
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      gender: user.gender,
      age: user.age,
      height: user.height,
      currentWeight: user.currentWeight,
      targetWeight: user.targetWeight,
      targetDate: user.targetDate,
      goalStatus: user.goalStatus,
      goalCreatedAt: user.goalCreatedAt,
      goalId: user.goalId?.toString(),
      pastGoals: user.pastGoals,
      goals: user.goals,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update user profile
router.put('/:id', async (req, res, next) => {
  // Handle demo user
  if (req.params.id === 'demo') {
    // Return a realistic demo user object, matching the GET /users/:id response
    return res.json({
      message: 'Demo user profile updated successfully',
      user: {
        id: 'demo',
        name: 'Demo User',
        email: 'demo@example.com',
        mobileNumber: '+1234567890',
        gender: 'male',
        age: 30,
        height: 170,
        currentWeight: 74.2,
        targetWeight: 70,
        targetDate: new Date(Date.now() + 83 * 24 * 60 * 60 * 1000),
        goalStatus: 'active',
        goalCreatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        goalId: 'demo-goal-123',
        pastGoals: [],
        goals: [],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    });
  }
  
  // Determine if this is a goal-only update or full user update
  const goalFields = ['height', 'currentWeight', 'targetWeight', 'targetDate', 'goalStatus', 'goalCreatedAt', 'goalId', 'goalInitialWeight'];
  const userFields = ['name', 'email', 'mobileNumber', 'country', 'password', 'gender', 'age', 'goalWeight', 'daysToTarget', 'activityLevel'];
  const keys = Object.keys(req.body);
  
  const hasGoalFields = keys.some(k => goalFields.includes(k));
  const hasUserFields = keys.some(k => userFields.includes(k));
  
  // Apply appropriate validation
  if (hasGoalFields && !hasUserFields) {
    // Goal-only update - use lenient validation
    console.log('[GOAL UPDATE] Goal update handler called', req.body);
    await Promise.all(validateGoalUpdate.map(mw => mw.run(req)));
  } else if (hasUserFields) {
    // Full user update - use strict validation
    console.log('[USER UPDATE] Full user update handler called', req.body);
    await Promise.all(validateUserData.map(mw => mw.run(req)));
  }
  
  next();
}, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle goal-specific updates
    if (req.body.targetWeight !== undefined || req.body.targetDate !== undefined) {
      // This is a goal update
      if (req.body.targetWeight && req.body.targetDate) {
        // Creating or updating a goal with both fields
        if (!user.goalId || user.goalStatus !== 'active') {
          // New goal or reactivating goal
          user.goalId = new mongoose.Types.ObjectId();
          user.goalStatus = 'active';
          user.goalCreatedAt = new Date();
          user.goalInitialWeight = req.body.currentWeight !== undefined ? Number(req.body.currentWeight) : user.currentWeight;
        }
        
        // Update goal fields
        user.targetWeight = req.body.targetWeight;
        user.targetDate = req.body.targetDate;
        
        // Automatically create a weight entry for the goal start date if it doesn't exist
        if (user.goalId && user.goalCreatedAt && user.currentWeight) {
          const WeightEntry = require('../models/WeightEntry');
          const entryDate = new Date(user.goalCreatedAt);
          entryDate.setUTCHours(0, 0, 0, 0);
          const startOfDay = new Date(entryDate);
          const endOfDay = new Date(entryDate);
          endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);
          
          // Check for any existing entry on this date (regardless of goalId)
          const existingEntry = await WeightEntry.findOne({
            userId: user._id,
            date: { $gte: startOfDay, $lt: endOfDay }
          });
          
          if (!existingEntry) {
            try {
              const createdEntry = await WeightEntry.create({
                userId: user._id,
                weight: user.currentWeight,
                date: entryDate,
                goalId: user.goalId,
                notes: 'Auto-created for goal start'
              });
              console.log('[AUTO-WEIGHT-ENTRY] Created:', createdEntry._id);
            } catch (entryError) {
              console.error('[AUTO-WEIGHT-ENTRY] Failed to create entry:', entryError.message);
              // Don't fail the entire goal creation if weight entry creation fails
            }
          } else {
            console.log('[AUTO-WEIGHT-ENTRY] Entry already exists for date:', entryDate);
          }
        }
      } else if (req.body.targetWeight || req.body.targetDate) {
        // Partial goal update - only update the provided fields
        if (req.body.targetWeight) {
          user.targetWeight = req.body.targetWeight;
        }
        if (req.body.targetDate) {
          user.targetDate = req.body.targetDate;
        }
        // Don't change goal status for partial updates
      } else {
        // Clearing goal (setting to undefined)
        user.targetWeight = undefined;
        user.targetDate = undefined;
        user.goalStatus = 'none';
        user.goalCreatedAt = undefined;
        user.goalId = undefined;
      }
    }

    // Update other allowed fields
    const allowedFields = ['height', 'currentWeight', 'goalStatus', 'goalCreatedAt', 'goalInitialWeight'];
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        user[key] = req.body[key];
      }
    }

    // Update user fields if provided
    const userFields = ['name', 'email', 'mobileNumber', 'country', 'gender', 'age', 'goalWeight', 'daysToTarget', 'activityLevel'];
    for (const key of userFields) {
      if (req.body[key] !== undefined) {
        user[key] = req.body[key];
      }
    }

    // Migrate any existing UUID goalIds to ObjectIds
    await migrateGoalIds(user);
    await user.save();
    
    // Check for goal expiry
    await checkAndExpireGoal(user);
    
    res.json({
      message: 'User profile updated successfully',
      user: { ...user.toObject(), goalId: user.goalId?.toString(), goalInitialWeight: user.goalInitialWeight }
    });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error updating user profile',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Get BMI analytics for a user
router.get('/:id/bmi-analytics', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentBMI = parseFloat(user.currentBMI);
    const targetBMI = parseFloat(user.targetBMI);
    
    const analytics = {
      currentBMI,
      targetBMI,
      currentCategory: user.getBMICategory(currentBMI),
      targetCategory: user.getBMICategory(targetBMI),
      bmiDifference: (currentBMI - targetBMI).toFixed(1),
      weightDifference: (user.currentWeight - user.targetWeight).toFixed(1),
      progressPercentage: calculateProgressPercentage(user.currentWeight, user.targetWeight, user.targetDate)
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching BMI analytics:', error);
    res.status(500).json({ message: 'Error fetching BMI analytics' });
  }
});

// Helper function to calculate progress percentage
function calculateProgressPercentage(currentWeight, targetWeight, targetDate) {
  const today = new Date();
  const target = new Date(targetDate);
  const totalDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  
  if (totalDays <= 0) return 100;
  
  // This is a simplified calculation - in a real app, you'd use historical data
  const weightDiff = Math.abs(currentWeight - targetWeight);
  const estimatedProgress = Math.min(weightDiff / 10, 1); // Assume 10kg is max difference
  
  return Math.round(estimatedProgress * 100);
}

// Helper function to migrate UUID goalIds to ObjectIds
async function migrateGoalIds(user) {
  if (user.pastGoals && Array.isArray(user.pastGoals)) {
    user.pastGoals.forEach(goal => {
      // If goalId is a UUID string (36 characters with hyphens), convert it to ObjectId
      if (goal.goalId && typeof goal.goalId === 'string' && goal.goalId.length === 36 && goal.goalId.includes('-')) {
        goal.goalId = new mongoose.Types.ObjectId();
      }
      // If goalId is missing, create a new one
      if (!goal.goalId) {
        goal.goalId = new mongoose.Types.ObjectId();
      }
    });
  }
  
  // Also ensure the main goalId is an ObjectId
  if (user.goalId && typeof user.goalId === 'string' && user.goalId.length === 36 && user.goalId.includes('-')) {
    user.goalId = new mongoose.Types.ObjectId();
  }
  if (!user.goalId && (user.targetWeight || user.targetDate)) {
    user.goalId = new mongoose.Types.ObjectId();
  }
}

// Discard current goal
router.post('/:id/discard-goal', async (req, res) => {
  try {
    // Handle demo user
    if (req.params.id === 'demo') {
      return res.json({
        message: 'Goal discarded successfully',
        user: {
          id: 'demo',
          name: 'Demo User',
          email: 'demo@example.com',
          mobile: '+1234567890',
          gender: 'male',
          age: 30,
          height: 170,
          currentWeight: 74.2,
          targetWeight: undefined,
          targetDate: undefined,
          goalStatus: 'discarded',
          goalCreatedAt: undefined,
          goalId: undefined,
          pastGoals: [],
          goals: [],
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.targetWeight || !user.targetDate) return res.status(400).json({ message: 'No active goal to discard' });
    
    // Migrate any existing UUID goalIds to ObjectIds
    await migrateGoalIds(user);
    
    // Move current goal to pastGoals
    user.pastGoals.push({
      goalId: user.goalId || new mongoose.Types.ObjectId(),
      currentWeight: user.currentWeight,
      targetWeight: user.targetWeight,
      targetDate: user.targetDate,
      startedAt: user.goalCreatedAt || user.createdAt,
      endedAt: new Date(),
      status: 'discarded'
    });
    
    // Clear current goal
    user.targetWeight = undefined;
    user.targetDate = undefined;
    user.goalStatus = 'discarded';
    user.goalCreatedAt = undefined;
    user.goalId = undefined;
    
    await user.save();
    res.json({ 
      message: 'Goal discarded successfully', 
      user: { ...user.toObject(), goalId: user.goalId?.toString(), goalInitialWeight: user.goalInitialWeight }
    });
  } catch (error) {
    console.error('Error discarding goal:', error);
    res.status(500).json({ message: 'Error discarding goal' });
  }
});

// Achieve current goal
router.post('/:id/achieve-goal', async (req, res) => {
  try {
    // Handle demo user
    if (req.params.id === 'demo') {
      return res.json({
        message: 'Goal marked as achieved successfully',
        user: {
          id: 'demo',
          name: 'Demo User',
          email: 'demo@example.com',
          mobile: '+1234567890',
          gender: 'male',
          age: 30,
          height: 170,
          currentWeight: 74.2,
          targetWeight: undefined,
          targetDate: undefined,
          goalStatus: 'achieved',
          goalCreatedAt: undefined,
          goalId: undefined,
          pastGoals: [],
          goals: [],
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.targetWeight || !user.targetDate) return res.status(400).json({ message: 'No active goal to achieve' });
    
    // Migrate any existing UUID goalIds to ObjectIds
    await migrateGoalIds(user);
    
    // Move current goal to pastGoals
    user.pastGoals.push({
      goalId: user.goalId || new mongoose.Types.ObjectId(),
      currentWeight: user.currentWeight,
      targetWeight: user.targetWeight,
      targetDate: user.targetDate,
      startedAt: user.goalCreatedAt || user.createdAt,
      endedAt: new Date(),
      status: 'achieved'
    });
    
    // Clear current goal
    user.targetWeight = undefined;
    user.targetDate = undefined;
    user.goalStatus = 'achieved';
    user.goalCreatedAt = undefined;
    user.goalId = undefined;
    
    await user.save();
    res.json({ 
      message: 'Goal marked as achieved successfully', 
      user: { ...user.toObject(), goalId: user.goalId?.toString(), goalInitialWeight: user.goalInitialWeight }
    });
  } catch (error) {
    console.error('Error achieving goal:', error);
    res.status(500).json({ message: 'Error achieving goal' });
  }
});

// Middleware to check and expire goal if needed
async function checkAndExpireGoal(user) {
  if (user.targetDate && new Date(user.targetDate) < new Date()) {
    // Migrate any existing UUID goalIds to ObjectIds
    await migrateGoalIds(user);
    
    user.pastGoals.push({
      goalId: user.goalId || new mongoose.Types.ObjectId(),
      currentWeight: user.currentWeight,
      targetWeight: user.targetWeight,
      targetDate: user.targetDate,
      startedAt: user.goalCreatedAt || user.createdAt,
      endedAt: new Date(),
      status: 'expired'
    });
    user.targetWeight = undefined;
    user.targetDate = undefined;
    user.goalStatus = 'expired';
    user.goalCreatedAt = undefined;
    user.goalId = undefined;
    
    await user.save();
  }
}

// Password Reset Routes

// Request password reset (send OTP)
router.post('/forgot-password', [
  body('method').isIn(['email', 'mobile']).withMessage('Method must be either email or mobile'),
  body('email').optional().isEmail().withMessage('Valid email is required when method is email'),
  body('mobileNumber').optional().isMobilePhone().withMessage('Valid mobile number is required when method is mobile'),
  body('countryCode').optional().isString().withMessage('Country code is required when method is mobile')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { method, email, mobileNumber, countryCode } = req.body;
    
    let user, identifier, fullMobileNumber;
    
    if (method === 'email') {
      console.log('🔐 Forgot password request received for email:', email);
      
      // Check if user exists by email
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        console.log('❌ User not found:', email);
        return res.status(404).json({ message: 'No account found with this email address' });
      }
      identifier = email.toLowerCase();
      
    } else if (method === 'mobile') {
      console.log('🔐 Forgot password request received for mobile:', mobileNumber);
      
      // Construct full mobile number with country code
      fullMobileNumber = `${countryCode}${mobileNumber}`;
      
      // Check if user exists by mobile number
      user = await User.findOne({ mobileNumber: fullMobileNumber });
      if (!user) {
        console.log('❌ User not found:', fullMobileNumber);
        return res.status(404).json({ message: 'No account found with this mobile number' });
      }
      identifier = fullMobileNumber;
    }

    console.log('✅ User found:', user.name, method === 'email' ? user.email : user.mobileNumber);

    // Generate OTP
    const otp = generateOTP();
    console.log('🔢 Generated OTP:', otp);
    
    // Invalidate any existing OTPs
    await PasswordReset.invalidateAllOTPs(identifier, method);
    console.log('🗑️ Invalidated existing OTPs');
    
    // Create new password reset record
    const passwordReset = new PasswordReset({
      email: method === 'email' ? identifier : null,
      mobileNumber: method === 'mobile' ? identifier : null,
      otp: otp,
      method: method
    });
    await passwordReset.save();
    console.log('💾 Password reset record saved');
    
    let result;
    
    if (method === 'email') {
      // Send password reset email
      console.log('📧 Attempting to send password reset email...');
      result = await sendPasswordResetEmail(email, user.name, otp);
      console.log('📧 Email result:', result);
    } else {
      // Send SMS OTP
      console.log('📱 Attempting to send SMS OTP...');
      const { sendSMSOTP } = require('../services/twilioService');
      result = await sendSMSOTP(fullMobileNumber, otp);
      console.log('📱 SMS result:', result);
    }
    
    if (result && result.success) {
      console.log(`✅ Password reset ${method === 'email' ? 'email' : 'SMS'} sent successfully`);
      res.json({ 
        success: true,
        message: `Password reset OTP sent successfully via ${method}`,
        method: method,
        identifier: method === 'email' ? email : fullMobileNumber
      });
    } else {
      console.log(`❌ ${method === 'email' ? 'Email' : 'SMS'} sending failed, deleting password reset record`);
      // Delete the password reset record if sending failed
      await passwordReset.deleteOne();
      res.status(500).json({ message: `Failed to send password reset ${method === 'email' ? 'email' : 'SMS'}. Please try again.` });
    }
    
  } catch (error) {
    console.error('❌ Password reset request error:', error);
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
});

// Verify OTP and reset password
router.post('/reset-password', [
  body('method').isIn(['email', 'mobile']).withMessage('Method must be either email or mobile'),
  body('identifier').isString().withMessage('Identifier (email or mobile) is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => value === req.body.newPassword).withMessage('Passwords do not match')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { method, identifier, otp, newPassword } = req.body;
    
    // Find valid OTP
    const passwordReset = await PasswordReset.findValidOTP(identifier, otp, method);
    if (!passwordReset) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    // Find user based on method
    let user;
    if (method === 'email') {
      user = await User.findOne({ email: identifier.toLowerCase() });
    } else {
      user = await User.findOne({ mobileNumber: identifier });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Mark OTP as used
    await passwordReset.markAsUsed();
    
    res.json({ success: true, message: 'Password reset successfully' });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Verify OTP (for frontend validation)
router.post('/verify-otp', [
  body('method').isIn(['email', 'mobile']).withMessage('Method must be either email or mobile'),
  body('identifier').isString().withMessage('Identifier (email or mobile) is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { method, identifier, otp } = req.body;
    
    // Find valid OTP
    const passwordReset = await PasswordReset.findValidOTP(identifier, otp, method);
    if (!passwordReset) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    res.json({ success: true, message: 'OTP verified successfully' });
    
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

module.exports = router; 