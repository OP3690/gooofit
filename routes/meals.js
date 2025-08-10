const express = require('express');
const router = express.Router();
const MealEntry = require('../models/MealEntry');
const Food = require('../models/Food');
const auth = require('../middleware/auth');
const UserFood = require('../models/UserFood');

// Get food database with search and filter (includes user-specific foods when authenticated)
router.get('/food-database', async (req, res) => {
  try {
    const { search, category, userId } = req.query;
    
    let query = {};
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      query.$or = [
        { name: { $regex: searchLower, $options: 'i' } },
        { hinglish: { $regex: searchLower, $options: 'i' } }
      ];
    }
    
    // Apply category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Get global foods
    const globalFoods = await Food.find(query).select('name fat cholesterol calories protein category hinglish cholesterolFlag');

    // If a userId is provided/valid, also fetch that user's custom foods
    let userFoods = [];
    if (userId) {
      const ufQuery = {};
      ufQuery.userId = userId;
      if (category && category !== 'all') ufQuery.category = category;
      if (search) {
        ufQuery.name = { $regex: search, $options: 'i' };
      }
      userFoods = await UserFood.find(ufQuery)
        .select('name calories fat cholesterol category quantity unit createdAt')
        .sort({ createdAt: -1 });
    }
    
    // Get unique categories (union of global + user)
    const categoriesGlobal = await Food.distinct('category');
    const categoriesUser = userFoods.length > 0 ? [...new Set(userFoods.map(f => f.category))] : [];
    const categories = Array.from(new Set([...categoriesGlobal, ...categoriesUser]));
    
    // Build combined list; tag user foods
    const foodsCombined = [
      // Put user foods first so they appear on page 1
      ...userFoods.map(f => ({ ...f.toObject(), protein: 0, hinglish: '', cholesterolFlag: (f.cholesterol || 0) <= 50 ? 'Good' : 'Bad', isUserFood: true })),
      ...globalFoods.map(f => ({ ...f.toObject(), isUserFood: false }))
    ];

    const foods = foodsCombined
      .map(item => {
      // If quantity/unit present, format display name (e.g., Banana (1 Piece))
      if (item.isUserFood && item.quantity && item.unit) {
        const unitLabel = String(item.unit).trim();
        const normalized = unitLabel.toLowerCase().endsWith('s') ? unitLabel : unitLabel; // keep as provided
        const count = Number(item.quantity);
        const singular = normalized.replace(/s$/i, '');
        const label = count === 1 ? singular : normalized;
        return { ...item, displayName: `${item.name} (${count} ${label})` };
      }
      return { ...item, displayName: item.name };
      });

    // Total count for current query
    const total = foods.length;
    
    res.json({
      success: true,
      data: {
        foods: foods,
        categories: categories,
        total: total,
        showing: foods.length
      }
    });
  } catch (error) {
    console.error('Error fetching food database:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add meal entry
router.post('/add', auth, async (req, res) => {
  try {
    const { foodName, quantity, originalQuantity, unit, mealType, mealTime, date, notes } = req.body;
    
    // Find food in database (check both global and user-specific foods)
    let food = await Food.findOne({ name: foodName });
    if (!food) {
      // Check user-specific foods
      food = await UserFood.findOne({ name: foodName, userId: req.user.id });
    }
    if (!food) {
      return res.status(400).json({ success: false, message: 'Food not found in database' });
    }
    
    // Calculate nutrition based on quantity (which is now in grams)
    const multiplier = quantity / 100; // Assuming base values are per 100g
    const calculatedCalories = Math.round((food.calories || 0) * multiplier);
    const calculatedFat = Math.round((food.fat || 0) * multiplier * 10) / 10;
    const calculatedProtein = Math.round((food.protein || 0) * multiplier * 10) / 10;
    const calculatedCarbs = Math.round((food.carbs || 0) * multiplier * 10) / 10;
    const calculatedCholesterol = Math.round((food.cholesterol || 0) * multiplier);
    
    const mealEntry = new MealEntry({
      userId: req.user.id,
      foodName,
      quantity,
      originalQuantity: originalQuantity, // Always use the originalQuantity from frontend
      unit,
      calories: calculatedCalories,
      fat: calculatedFat,
      protein: calculatedProtein,
      carbs: calculatedCarbs,
      cholesterol: calculatedCholesterol,
      mealType: mealType || 'snack',
      mealTime: mealTime || '',
      date: date ? new Date(date) : new Date(),
      notes: notes || ''
    });
    
    await mealEntry.save();
    
    res.status(201).json({
      success: true,
      message: 'Meal entry added successfully',
      data: mealEntry
    });
  } catch (error) {
    console.error('Error adding meal entry:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's meal entries
router.get('/entries', auth, async (req, res) => {
  try {
    const { date, mealType, limit = 50 } = req.query;
    
    let query = { userId: req.user.id };
    
    // Filter by date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Filter by meal type
    if (mealType && mealType !== 'all') {
      query.mealType = mealType;
    }
    
    const mealEntries = await MealEntry.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: mealEntries
    });
  } catch (error) {
    console.error('Error fetching meal entries:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all meal entries for a user (for calendar view) - no auth required
router.get('/entries/all', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    // Fetch all meal entries for the user without limit
    const mealEntries = await MealEntry.find({ userId })
      .sort({ date: -1 });
    
    res.json({
      success: true,
      data: mealEntries
    });
  } catch (error) {
    console.error('Error fetching all meal entries:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add a user-specific food
router.post('/food', auth, async (req, res) => {
  try {
    const { name, category, calories, fat, cholesterol, quantity, unit } = req.body;
    if (!name || !category || calories == null || fat == null || cholesterol == null) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const doc = await UserFood.create({
      userId: req.user.id,
      name: name.trim(),
      category,
      calories: Number(calories),
      fat: Number(fat),
      cholesterol: Number(cholesterol),
      quantity: quantity != null ? Number(quantity) : null,
      unit: unit ? String(unit) : '',
    });
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Food item already exists for this user' });
    }
    console.error('Error creating user food:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a user-specific food
router.delete('/food/:id', auth, async (req, res) => {
  try {
    const deleted = await UserFood.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Food not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user food:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get daily nutrition summary
router.get('/daily-summary', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    const mealEntries = await MealEntry.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate totals
    const totals = mealEntries.reduce((acc, meal) => {
      acc.calories += meal.calories;
      acc.fat += meal.fat;
      acc.cholesterol += meal.cholesterol;
      return acc;
    }, { calories: 0, fat: 0, cholesterol: 0 });
    
    // Group by meal type
    const byMealType = mealEntries.reduce((acc, meal) => {
      if (!acc[meal.mealType]) {
        acc[meal.mealType] = [];
      }
      acc[meal.mealType].push(meal);
      return acc;
    }, {});
    
    // Calculate meal type totals
    const mealTypeTotals = {};
    Object.keys(byMealType).forEach(type => {
      mealTypeTotals[type] = byMealType[type].reduce((acc, meal) => {
        acc.calories += meal.calories;
        acc.fat += meal.fat;
        acc.cholesterol += meal.cholesterol;
        return acc;
      }, { calories: 0, fat: 0, cholesterol: 0 });
    });
    
    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        totals,
        mealTypeTotals,
        mealCount: mealEntries.length,
        meals: byMealType
      }
    });
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get weekly nutrition summary
router.get('/weekly-summary', auth, async (req, res) => {
  try {
    const { startDate } = req.query;
    let weekStart = startDate ? new Date(startDate) : new Date();
    
    // Get start of week (Sunday)
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - day);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const mealEntries = await MealEntry.find({
      userId: req.user.id,
      date: { $gte: weekStart, $lte: weekEnd }
    });
    
    // Group by day
    const dailyData = {};
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      
      const dayEntries = mealEntries.filter(meal => {
        const mealDate = new Date(meal.date);
        return mealDate.toDateString() === currentDate.toDateString();
      });
      
      const dayTotals = dayEntries.reduce((acc, meal) => {
        acc.calories += meal.calories;
        acc.fat += meal.fat;
        acc.cholesterol += meal.cholesterol;
        return acc;
      }, { calories: 0, fat: 0, cholesterol: 0 });
      
      dailyData[dateKey] = {
        date: dateKey,
        totals: dayTotals,
        mealCount: dayEntries.length
      };
    }
    
    // Calculate week totals
    const weekTotals = mealEntries.reduce((acc, meal) => {
      acc.calories += meal.calories;
      acc.fat += meal.fat;
      acc.cholesterol += meal.cholesterol;
      return acc;
    }, { calories: 0, fat: 0, cholesterol: 0 });
    
    res.json({
      success: true,
      data: {
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        dailyData,
        weekTotals,
        totalMeals: mealEntries.length
      }
    });
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get monthly nutrition summary
router.get('/monthly-summary', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
    
    const mealEntries = await MealEntry.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Group by day
    const dailyData = {};
    const daysInMonth = endDate.getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(targetYear, targetMonth - 1, day);
      const dateKey = currentDate.toISOString().split('T')[0];
      
      const dayEntries = mealEntries.filter(meal => {
        const mealDate = new Date(meal.date);
        return mealDate.toDateString() === currentDate.toDateString();
      });
      
      const dayTotals = dayEntries.reduce((acc, meal) => {
        acc.calories += meal.calories;
        acc.fat += meal.fat;
        acc.cholesterol += meal.cholesterol;
        return acc;
      }, { calories: 0, fat: 0, cholesterol: 0 });
      
      dailyData[dateKey] = {
        date: dateKey,
        totals: dayTotals,
        mealCount: dayEntries.length
      };
    }
    
    // Calculate month totals
    const monthTotals = mealEntries.reduce((acc, meal) => {
      acc.calories += meal.calories;
      acc.fat += meal.fat;
      acc.cholesterol += meal.cholesterol;
      return acc;
    }, { calories: 0, fat: 0, cholesterol: 0 });
    
    // Calculate averages
    const daysWithMeals = Object.values(dailyData).filter(day => day.mealCount > 0).length;
    const averages = {
      calories: daysWithMeals > 0 ? Math.round(monthTotals.calories / daysWithMeals) : 0,
      fat: daysWithMeals > 0 ? Math.round(monthTotals.fat / daysWithMeals * 10) / 10 : 0,
      cholesterol: daysWithMeals > 0 ? Math.round(monthTotals.cholesterol / daysWithMeals) : 0
    };
    
    res.json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth,
        dailyData,
        monthTotals,
        averages,
        totalMeals: mealEntries.length,
        daysWithMeals
      }
    });
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update meal entry
router.put('/:id', auth, async (req, res) => {
  try {
    const { foodName, quantity, originalQuantity, unit, mealType, mealTime, date, notes, calories, fat, protein, carbs, cholesterol } = req.body;
    
    // Find the meal entry and verify ownership
    const mealEntry = await MealEntry.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!mealEntry) {
      return res.status(404).json({ success: false, message: 'Meal entry not found' });
    }
    
    // Update the meal entry
    const updatedMeal = await MealEntry.findByIdAndUpdate(
      req.params.id,
      {
        foodName,
        quantity,
        originalQuantity: originalQuantity, // Always use the originalQuantity from frontend
        unit,
        calories,
        fat,
        protein,
        carbs,
        cholesterol,
        mealType,
        mealTime,
        date: date ? new Date(date) : mealEntry.date,
        notes: notes || ''
      },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Meal entry updated successfully',
      data: updatedMeal
    });
  } catch (error) {
    console.error('Error updating meal entry:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete meal entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const mealEntry = await MealEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!mealEntry) {
      return res.status(404).json({ success: false, message: 'Meal entry not found' });
    }
    
    res.json({
      success: true,
      message: 'Meal entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meal entry:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 