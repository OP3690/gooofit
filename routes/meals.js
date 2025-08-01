const express = require('express');
const router = express.Router();
const MealEntry = require('../models/MealEntry');
const foodDatabase = require('../data/foodDatabase');
const auth = require('../middleware/auth');

// Get food database with search and filter
router.get('/food-database', async (req, res) => {
  try {
    const { search, category, limit = 50 } = req.query;
    
    let filteredFoods = [...foodDatabase];
    
    // Search by name or Hinglish name
    if (search) {
      const searchLower = search.toLowerCase();
      filteredFoods = filteredFoods.filter(food => 
        food.name.toLowerCase().includes(searchLower) ||
        (food.hinglish && food.hinglish.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by category
    if (category && category !== 'all') {
      filteredFoods = filteredFoods.filter(food => food.category === category);
    }
    
    // Get unique categories
    const categories = [...new Set(foodDatabase.map(food => food.category))];
    
    // Limit results
    const limitedFoods = filteredFoods.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        foods: limitedFoods,
        categories,
        total: filteredFoods.length,
        showing: limitedFoods.length
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
    const { foodName, quantity, unit, mealType, date, notes } = req.body;
    
    // Find food in database
    const food = foodDatabase.find(f => f.name === foodName);
    if (!food) {
      return res.status(400).json({ success: false, message: 'Food not found in database' });
    }
    
    // Calculate nutrition based on quantity
    const multiplier = quantity / 100; // Assuming base values are per 100g
    const calculatedCalories = Math.round(food.calories * multiplier);
    const calculatedFat = Math.round(food.fat * multiplier * 10) / 10;
    const calculatedCholesterol = Math.round(food.cholesterol * multiplier);
    
    const mealEntry = new MealEntry({
      userId: req.user.id,
      foodName,
      quantity,
      unit,
      calories: calculatedCalories,
      fat: calculatedFat,
      cholesterol: calculatedCholesterol,
      mealType: mealType || 'snack',
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