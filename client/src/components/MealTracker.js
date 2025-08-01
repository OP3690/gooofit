import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaChartPie, 
  FaCalendarAlt,
  FaUtensils,
  FaTrash,
  FaEdit
} from 'react-icons/fa';

const MealTracker = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [foodDatabase, setFoodDatabase] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mealEntries, setMealEntries] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Meal entry form state
  const [showMealForm, setShowMealForm] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pieces');
  const [mealType, setMealType] = useState('snack');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchFoodDatabase();
    fetchDailySummary();
    fetchMealEntries();
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDailySummary();
    } else if (activeTab === 'weekly') {
      fetchWeeklySummary();
    } else if (activeTab === 'monthly') {
      fetchMonthlySummary();
    }
  }, [activeTab, selectedDate]);

  const fetchFoodDatabase = async () => {
    try {
      setLoading(true);
      const response = await api.get('/meals/food-database');
      if (response.data.success) {
        setFoodDatabase(response.data.data.foods);
        setCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching food database:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMealEntries = async () => {
    try {
      const response = await api.get(`/meals/entries?date=${selectedDate}`);
      if (response.data.success) {
        setMealEntries(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching meal entries:', error);
    }
  };

  const fetchDailySummary = async () => {
    try {
      const response = await api.get(`/meals/daily-summary?date=${selectedDate}`);
      if (response.data.success) {
        setDailySummary(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching daily summary:', error);
    }
  };

  const fetchWeeklySummary = async () => {
    try {
      const response = await api.get(`/meals/weekly-summary?startDate=${selectedDate}`);
      if (response.data.success) {
        setWeeklySummary(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const currentDate = new Date(selectedDate);
      const response = await api.get(`/meals/monthly-summary?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`);
      if (response.data.success) {
        setMonthlySummary(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
    }
  };

  const handleAddMeal = async () => {
    if (!selectedFood) return;

    try {
      setLoading(true);
      const response = await api.post('/meals/add', {
        foodName: selectedFood.name,
        quantity,
        unit,
        mealType,
        date: selectedDate,
        notes
      });

      if (response.data.success) {
        setShowMealForm(false);
        setSelectedFood(null);
        setQuantity(1);
        setUnit('pieces');
        setMealType('snack');
        setNotes('');
        fetchMealEntries();
        fetchDailySummary();
      }
    } catch (error) {
      console.error('Error adding meal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm('Are you sure you want to delete this meal entry?')) return;

    try {
      const response = await api.delete(`/meals/${mealId}`);
      if (response.data.success) {
        fetchMealEntries();
        fetchDailySummary();
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const filteredFoods = foodDatabase.filter(food => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = food.name.toLowerCase().includes(searchLower);
    const hinglishMatch = food.hinglish && food.hinglish.toLowerCase().includes(searchLower);
    const matchesSearch = nameMatch || hinglishMatch;
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCalorieGoal = () => {
    // This could be calculated based on user's BMR, activity level, and goals
    return 2000; // Default calorie goal
  };

  const getCalorieProgress = () => {
    if (!dailySummary) return 0;
    const goal = getCalorieGoal();
    return Math.min((dailySummary.totals.calories / goal) * 100, 100);
  };

  const getMealTypeIcon = (type) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return icons[type] || '🍽️';
  };

  const getMealTypeColor = (type) => {
    const colors = {
      breakfast: 'bg-yellow-100 text-yellow-800',
      lunch: 'bg-orange-100 text-orange-800',
      dinner: 'bg-purple-100 text-purple-800',
      snack: 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🍽️ Meal Tracker</h1>
          <p className="text-gray-600">Track your nutrition and maintain a healthy diet</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex justify-center">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: FaChartPie },
                { id: 'add-meal', name: 'Add Meal', icon: FaPlus },
                { id: 'food-database', name: 'Food Database', icon: FaSearch },
                { id: 'weekly', name: 'Weekly View', icon: FaCalendarAlt },
                { id: 'monthly', name: 'Monthly View', icon: FaCalendarAlt }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-orange-600 shadow-sm border border-orange-200'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Date Selector */}
        <div className="mb-6">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Daily Summary Cards */}
            {dailySummary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Calories</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dailySummary.totals.calories}
                      </p>
                      <p className="text-sm text-gray-500">/ {getCalorieGoal()} goal</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 text-xl">🔥</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getCalorieProgress()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Fat (g)</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dailySummary.totals.fat}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-xl">🥑</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cholesterol (mg)</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dailySummary.totals.cholesterol}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 text-xl">🥚</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Meals Today</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dailySummary.mealCount}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xl">🍽️</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Meal Type Breakdown */}
            {dailySummary && dailySummary.mealTypeTotals && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Meal Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(dailySummary.mealTypeTotals).map(([type, totals]) => (
                    <div key={type} className="text-center p-4 rounded-lg bg-gray-50">
                      <div className="text-2xl mb-2">{getMealTypeIcon(type)}</div>
                      <p className="text-sm font-medium text-gray-600 capitalize">{type}</p>
                      <p className="text-lg font-bold text-gray-900">{totals.calories} cal</p>
                      <p className="text-xs text-gray-500">{totals.fat}g fat</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's Meals */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Today's Meals</h3>
              </div>
              <div className="p-6">
                {mealEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <FaUtensils className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No meals recorded</h3>
                    <p className="mt-1 text-sm text-gray-500">Add your first meal to start tracking!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mealEntries.map((meal) => (
                      <div key={meal._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl">{getMealTypeIcon(meal.mealType)}</span>
                          <div>
                            <p className="font-medium text-gray-900">{meal.foodName}</p>
                            <p className="text-sm text-gray-500">
                              {meal.quantity} {meal.unit} • {meal.calories} calories
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMealTypeColor(meal.mealType)}`}>
                            {meal.mealType}
                          </span>
                          <button
                            onClick={() => handleDeleteMeal(meal._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Meal Tab */}
        {activeTab === 'add-meal' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Meal</h2>
            
            <div className="space-y-6">
              {/* Food Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Food
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for food..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <FaSearch className="absolute right-3 top-3 text-gray-400" />
                </div>
                
                {/* Category Filter */}
                <div className="mt-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Food List */}
                <div className="mt-4 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                  {filteredFoods.slice(0, 20).map((food) => (
                    <div
                      key={food.name}
                      onClick={() => setSelectedFood(food)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                        selectedFood?.name === food.name ? 'bg-orange-50 border-orange-200' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{food.name}</p>
                          {food.hinglish && (
                            <p className="text-sm text-gray-400 italic">{food.hinglish}</p>
                          )}
                          <p className="text-sm text-gray-500">{food.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{food.calories} cal</p>
                          <p className="text-sm text-gray-500">{food.fat}g fat</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meal Details */}
              {selectedFood && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit
                      </label>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="pieces">Pieces</option>
                        <option value="grams">Grams</option>
                        <option value="cups">Cups</option>
                        <option value="tsp">Teaspoons</option>
                        <option value="tbsp">Tablespoons</option>
                        <option value="ml">Milliliters</option>
                        <option value="slices">Slices</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meal Type
                      </label>
                      <select
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Add any notes about this meal..."
                    />
                  </div>

                  {/* Nutrition Preview */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Nutrition Preview</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Calories</p>
                        <p className="font-medium">{Math.round(selectedFood.calories * quantity / 100)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fat (g)</p>
                        <p className="font-medium">{(selectedFood.fat * quantity / 100).toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cholesterol (mg)</p>
                        <p className="font-medium">{Math.round(selectedFood.cholesterol * quantity / 100)}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleAddMeal}
                    disabled={loading}
                    className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding...' : 'Add Meal'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Food Database Tab */}
        {activeTab === 'food-database' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Food Database</h2>
              <p className="text-gray-600 mt-1">Browse and search our comprehensive food database</p>
            </div>
            
            <div className="p-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search foods..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Food Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Food Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calories
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fat (g)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cholesterol (mg)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFoods.slice(0, 50).map((food, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{food.name}</div>
                          {food.hinglish && (
                            <div className="text-xs text-gray-400 italic">{food.hinglish}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {food.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {food.calories}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {food.fat}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {food.cholesterol}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Weekly View Tab */}
        {activeTab === 'weekly' && weeklySummary && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Nutrition Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
              {Object.entries(weeklySummary.dailyData).map(([date, data]) => (
                <div key={date} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-2">{data.totals.calories}</p>
                  <p className="text-xs text-gray-500">calories</p>
                  <p className="text-xs text-gray-400 mt-1">{data.mealCount} meals</p>
                </div>
              ))}
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Week Totals</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Calories</p>
                  <p className="font-bold text-lg">{weeklySummary.weekTotals.calories}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Fat</p>
                  <p className="font-bold text-lg">{weeklySummary.weekTotals.fat}g</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Meals</p>
                  <p className="font-bold text-lg">{weeklySummary.totalMeals}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly View Tab */}
        {activeTab === 'monthly' && monthlySummary && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Nutrition Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-6">
              {Object.entries(monthlySummary.dailyData).map(([date, data]) => (
                <div key={date} className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">
                    {new Date(date).getDate()}
                  </p>
                  <p className="text-sm font-medium text-gray-900">{data.totals.calories}</p>
                  {data.mealCount > 0 && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full mx-auto mt-1"></div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Month Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Calories</p>
                  <p className="font-bold text-lg">{monthlySummary.monthTotals.calories}</p>
                </div>
                <div>
                  <p className="text-gray-600">Daily Average</p>
                  <p className="font-bold text-lg">{monthlySummary.averages.calories}</p>
                </div>
                <div>
                  <p className="text-gray-600">Days with Meals</p>
                  <p className="font-bold text-lg">{monthlySummary.daysWithMeals}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Meals</p>
                  <p className="font-bold text-lg">{monthlySummary.totalMeals}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealTracker; 