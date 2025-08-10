import React, { useState, useEffect, useRef } from 'react';
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaChartPie, 
  FaCalendarAlt,
  FaUtensils,
  FaTrash,
  FaEdit,
  FaInfoCircle,
  FaRegStar,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaTimes,
  FaCheckCircle
} from 'react-icons/fa';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Area, 
  AreaChart,
  ScatterChart,
  Scatter,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import api, { userAPI, foodAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';

const MealTracker = () => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [recentPeriod, setRecentPeriod] = useState('today'); // today, yesterday, 7, 15, 30, 60, 90
  const [expandedDates, setExpandedDates] = useState({}); // { 'YYYY-MM-DD': true }
  const [recentPage, setRecentPage] = useState(1); // pagination for aggregated dates
  const [showAddFood, setShowAddFood] = useState(false);
  const [newFood, setNewFood] = useState({ name: '', category: 'Beverages', calories: '', fat: '', cholesterol: '', quantity: '', unit: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [foodPendingDelete, setFoodPendingDelete] = useState(null);
  const [quickEditFoods, setQuickEditFoods] = useState([]); // array of food names or ids
  const [quickSearchTerm, setQuickSearchTerm] = useState('');
  const [quickEditLoaded, setQuickEditLoaded] = useState(false);
  const quickEditLastSavedJsonRef = useRef('');

  // Persist Quick Edit list in localStorage so it survives reloads
  useEffect(() => {
    (async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const effectiveUser = currentUser || storedUser || {};
        const uid = effectiveUser.id || effectiveUser._id;
        if (uid) {
          try {
            const items = await userAPI.getQuickEdit(uid);
            if (Array.isArray(items)) {
              setQuickEditFoods(items);
              setQuickEditLoaded(true);
              return;
            }
          } catch (err) {
            // Fall back to local storage on auth/network errors
          }
        }
        // Fallback when no uid or API failed
        const saved = JSON.parse(localStorage.getItem('quickEditFoods') || '[]');
        if (Array.isArray(saved)) setQuickEditFoods(saved);
        setQuickEditLoaded(true);
      } catch {}
    })();
  }, [currentUser]);

  useEffect(() => {
    (async () => {
      try {
        // Do not persist until initial load has completed
        if (!quickEditLoaded) return;
        const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const effectiveUser = currentUser || storedUser || {};
        const uid = effectiveUser.id || effectiveUser._id;
        const json = JSON.stringify(quickEditFoods);
        localStorage.setItem('quickEditFoods', json);
        // Skip network call if nothing changed
        if (quickEditLastSavedJsonRef.current === json) return;
        if (uid) {
          try {
            await userAPI.setQuickEdit(
              uid,
              (quickEditFoods || []).map((q, i) => ({ name: q.name, order: i }))
            );
            quickEditLastSavedJsonRef.current = json;
          } catch (err) {
            // ignore transient errors; localStorage stays in sync
          }
        }
      } catch {}
    })();
  }, [quickEditLoaded, quickEditFoods, currentUser]);

  // Reset pagination and expanded state when period changes
  useEffect(() => {
    setRecentPage(1);
    setExpandedDates({});
  }, [recentPeriod]);

  // Export Historical Meal Logs to CSV (uses current filtered data)
  const downloadHistoricalCSV = () => {
    try {
      const meals = (getFilteredMeals ? getFilteredMeals() : mealEntries || [])
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      const headers = ['Date', 'Time', 'Food', 'Quantity', 'Unit', 'Meal Type', 'Calories', 'Fat (g)', 'Cholesterol (mg)'];
      const rows = meals.map((m) => [
        new Date(m.date).toISOString().slice(0, 10),
        m.mealTime || '',
        (m.foodName || '').replace(/"/g, '""'),
        typeof m.quantity === 'number' ? m.quantity.toFixed(2) : (m.quantity || ''),
        m.unit || '',
        m.mealType || 'snack',
        m.calories || 0,
        typeof m.fat === 'number' ? Math.round(m.fat * 10) / 10 : 0,
        m.cholesterol || 0,
      ]);
      const toCsvLine = (arr) => arr
        .map((val) => {
          const str = String(val ?? '');
          return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
        })
        .join(',');
      const csv = [toCsvLine(headers), ...rows.map(toCsvLine)].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historical_meal_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Historical Meal Logs CSV:', error);
    }
  };
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
  const [currentPage, setCurrentPage] = useState(1);
  // Fixed at 10 records per page for Historical Meal Logs
  const [itemsPerPage] = useState(10);
  const [latestWeight, setLatestWeight] = useState(null);
  const [dummyDataGenerated, setDummyDataGenerated] = useState(false);
  const [showAddMealPopup, setShowAddMealPopup] = useState(false);
  const [mealTime, setMealTime] = useState('');
  const [selectedFoodForHistory, setSelectedFoodForHistory] = useState(null);
  const [calendarPage, setCalendarPage] = useState(1);
  // Removed quickFilterDays state as we now always show last 90 days
  
  // User profile state
  const [userProfile, setUserProfile] = useState(null);
  
  // Edit meal state
  const [showEditMealPopup, setShowEditMealPopup] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editMealType, setEditMealType] = useState('');
  const [editMealTime, setEditMealTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  // Delete confirmation state
  const [showDeleteConfirmPopup, setShowDeleteConfirmPopup] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);

  // Meal entry form state
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [mealType, setMealType] = useState('');
  const [notes, setNotes] = useState('');

  // Nutrition Information Data
  const energyExpenditure = [
    { activity: "Sleeping", energy: 57 },
    { activity: "Lying quietly", energy: 69 },
    { activity: "Sitting quietly", energy: 81 },
    { activity: "Standing quietly", energy: 93 },
    { activity: "Writing", energy: 102 },
    { activity: "Typing", energy: 108 },
    { activity: "Light office work", energy: 114 },
    { activity: "Walking (slow 3km/hr)", energy: 165 },
    { activity: "Walking (normal 4km/hr)", energy: 210 },
    { activity: "Walking (fast 6km/hr)", energy: 300 },
    { activity: "Walking (very fast 8km/hr)", energy: 420 },
    { activity: "Jogging (8km/hr)", energy: 480 },
    { activity: "Running (10km/hr)", energy: 600 },
    { activity: "Running (12km/hr)", energy: 750 },
    { activity: "Cycling (slow)", energy: 240 },
    { activity: "Cycling (moderate)", energy: 420 },
    { activity: "Cycling (fast)", energy: 660 },
    { activity: "Swimming (slow)", energy: 360 },
    { activity: "Swimming (fast)", energy: 720 },
    { activity: "Dancing", energy: 300 },
    { activity: "Aerobics", energy: 420 },
    { activity: "Badminton", energy: 420 },
    { activity: "Tennis", energy: 480 },
    { activity: "Cricket", energy: 300 },
    { activity: "Football", energy: 540 },
    { activity: "Basketball", energy: 600 },
    { activity: "Volleyball", energy: 180 },
    { activity: "Table tennis", energy: 240 },
    { activity: "Golf", energy: 270 },
    { activity: "Gardening", energy: 330 },
    { activity: "Housework (light)", energy: 180 },
    { activity: "Housework (heavy)", energy: 300 },
    { activity: "Cooking", energy: 150 },
    { activity: "Washing dishes", energy: 120 },
    { activity: "Driving car", energy: 120 },
    { activity: "Climbing stairs", energy: 660 },
    { activity: "Weight lifting", energy: 480 },
    { activity: "Yoga", energy: 180 },
    { activity: "Meditation", energy: 108 },
  ];

  const dietaryAllowances = [
    { group: "Adult Man", weight: 60, energy: 2320, protein: 60, fat: 25, calcium: 600, iron: 17 },
    { group: "Adult Woman", weight: 55, energy: 1900, protein: 55, fat: 20, calcium: 600, iron: 21 },
    { group: "Pregnant Woman", weight: 55, energy: 2200, protein: 78, fat: 30, calcium: 1200, iron: 35 },
    { group: "Lactating Mother", weight: 55, energy: 2400, protein: 74, fat: 30, calcium: 1200, iron: 21 },
    { group: "Children (1-3 years)", weight: 13, energy: 1240, protein: 16.7, fat: 27, calcium: 600, iron: 9 },
    { group: "Children (4-6 years)", weight: 20, energy: 1690, protein: 20.1, fat: 25, calcium: 600, iron: 13 },
    { group: "Children (7-9 years)", weight: 25, energy: 1950, protein: 29.5, fat: 35, calcium: 600, iron: 16 },
    { group: "Adolescent Boys", weight: 45, energy: 2450, protein: 54.3, fat: 35, calcium: 800, iron: 21 },
    { group: "Adolescent Girls", weight: 40, energy: 2060, protein: 51.9, fat: 35, calcium: 800, iron: 27 },
  ];

  const standardPortions = [
    { foodGroup: "Cereals & Millets", portion: 30, energy: 108, protein: 3.5, carbs: 23, fat: 0.5 },
    { foodGroup: "Pulses", portion: 15, energy: 52, protein: 3.0, carbs: 8, fat: 0.5 },
    { foodGroup: "Green Leafy Vegetables", portion: 25, energy: 6, protein: 1.0, carbs: 1, fat: 0.0 },
    { foodGroup: "Other Vegetables", portion: 50, energy: 10, protein: 1.0, carbs: 2, fat: 0.0 },
    { foodGroup: "Fruits", portion: 100, energy: 60, protein: 1.0, carbs: 15, fat: 0.0 },
    { foodGroup: "Milk", portion: 100, energy: 67, protein: 3.2, carbs: 4.4, fat: 4.1 },
    { foodGroup: "Eggs", portion: 50, energy: 80, protein: 6.0, carbs: 0.0, fat: 6.0 },
    { foodGroup: "Fish", portion: 50, energy: 45, protein: 8.0, carbs: 0.0, fat: 1.0 },
    { foodGroup: "Meat", portion: 50, energy: 60, protein: 8.0, carbs: 0.0, fat: 3.0 },
    { foodGroup: "Fats & Oils", portion: 5, energy: 45, protein: 0.0, carbs: 0.0, fat: 5.0 },
  ];

  const glycemicIndex = [
    { food: "Glucose", gi: 100 },
    { food: "White bread", gi: 75 },
    { food: "Wheat bread", gi: 74 },
    { food: "Rice (white)", gi: 73 },
    { food: "Rice (brown)", gi: 68 },
    { food: "Potato (boiled)", gi: 78 },
    { food: "Sweet potato", gi: 44 },
    { food: "Carrots", gi: 39 },
    { food: "Apple", gi: 36 },
    { food: "Banana", gi: 51 },
    { food: "Orange", gi: 43 },
    { food: "Mango", gi: 51 },
    { food: "Milk", gi: 27 },
    { food: "Yogurt", gi: 14 },
    { food: "Lentils", gi: 29 },
    { food: "Chickpeas", gi: 28 },
    { food: "Kidney beans", gi: 24 },
    { food: "Peanuts", gi: 14 },
    { food: "Almonds", gi: 0 },
    { food: "Walnuts", gi: 0 },
  ];

  const getGILevel = (gi) => {
    if (gi >= 70) return { level: "High", color: "text-red-600", bgColor: "bg-red-100" };
    if (gi >= 56) return { level: "Medium", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    return { level: "Low", color: "text-green-600", bgColor: "bg-green-100" };
  };

  // Demo helpers
  const getDemoFoods = () => [
    { name: 'Tea (1 cup)', category: 'Beverages', calories: 70, fat: 2.9, cholesterol: 10, hinglish: 'Chai', unit: 'cups' },
    { name: 'Coffee (1 cup)', category: 'Beverages', calories: 70, fat: 2.9, cholesterol: 10, hinglish: 'Coffee', unit: 'cups' },
    { name: 'Masala Chai (1 cup)', category: 'Beverages', calories: 45, fat: 1.5, cholesterol: 5 },
    { name: 'Chapati (1 piece)', category: 'Grains', calories: 120, fat: 3, cholesterol: 0, unit: 'pieces' },
    { name: 'Rice (1 cup)', category: 'Grains', calories: 206, fat: 0.4, cholesterol: 0, unit: 'cups' },
    { name: 'Dal (1 cup)', category: 'Legumes', calories: 198, fat: 7, cholesterol: 0, unit: 'cups' },
    { name: 'Chicken Curry (150g)', category: 'Non-veg', calories: 250, fat: 12, cholesterol: 70, unit: 'grams' },
    { name: 'Paneer Curry (150g)', category: 'Veg', calories: 280, fat: 20, cholesterol: 60, unit: 'grams' },
    { name: 'Green Salad (150g)', category: 'Veg', calories: 60, fat: 3, cholesterol: 0, unit: 'grams' },
    { name: 'Banana (1 piece)', category: 'Fruits', calories: 89, fat: 0.3, cholesterol: 0, unit: 'pieces' },
    { name: 'Apple (1 piece)', category: 'Fruits', calories: 95, fat: 0.3, cholesterol: 0, unit: 'pieces' },
    { name: 'Omelette (2 eggs)', category: 'Eggs', calories: 180, fat: 14, cholesterol: 370, unit: 'pieces' },
    { name: 'Poha (1 plate)', category: 'Breakfast', calories: 250, fat: 8, cholesterol: 0, unit: 'grams' },
    { name: 'Idli (2 pieces)', category: 'Breakfast', calories: 140, fat: 1.2, cholesterol: 0, unit: 'pieces' },
  ];

  const generateDemoMealsUsingFoods = (foods, days = 30) => {
    const today = new Date();
    const meals = [];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const perDayMeals = 2 + Math.floor(Math.random() * 3); // 2-4 meals
      for (let j = 0; j < perDayMeals; j++) {
        const food = foods[Math.floor(Math.random() * foods.length)];
        const qtyOptions = food.unit === 'pieces' ? [1, 2] : food.unit === 'cups' ? [0.5, 1, 1.5] : [100, 150, 200];
        const qty = qtyOptions[Math.floor(Math.random() * qtyOptions.length)];
        let gramsEq = qty;
        if (food.unit === 'cups') gramsEq = qty * 240;
        if (food.unit === 'pieces' && /Chapati|Idli|Omelette/i.test(food.name)) gramsEq = qty * 50;
        if (food.unit === 'pieces' && /Banana|Apple/i.test(food.name)) gramsEq = qty * 120;
        if (food.unit === 'grams') gramsEq = qty; // already grams
        const calories = Math.round((food.calories || 0) * (gramsEq / 100));
        const fat = Math.round(((food.fat || 0) * (gramsEq / 100)) * 10) / 10;
        const cholesterol = Math.round((food.cholesterol || 0) * (gramsEq / 100));
        const fatCalories = fat * 9;
        const remaining = Math.max(0, calories - fatCalories);
        const protein = Math.round(((remaining * 0.2) / 4) * 10) / 10; // ~20% protein
        const carbs = Math.round(((remaining * 0.65) / 4) * 10) / 10;   // ~65% carbs
        meals.push({
          _id: `${dateStr}-${j}-${Math.random().toString(36).slice(2, 6)}`,
          userId: 'demo',
          foodName: food.name,
          quantity: gramsEq,
          unit: food.unit || 'grams',
          calories,
          fat,
          protein,
          carbs,
          cholesterol,
          mealType: mealTypes[j % mealTypes.length],
          mealTime: `${6 + j * 4}:00`,
          date: dateStr,
          notes: 'demo'
        });
      }
    }
    return meals.reverse(); // chronological
  };

  useEffect(() => {
    console.log('🔍 MealTracker useEffect triggered');
    console.log('🔍 API base URL:', process.env.REACT_APP_API_URL || 'http://localhost:3001/api');
    fetchFoodDatabase();
    fetchDailySummary();
    fetchMealEntries();
    fetchLatestWeight();
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (currentUser && currentUser.id !== 'demo') {
        try {
          const profile = await userAPI.getUser(currentUser.id);
          setUserProfile(profile);
          console.log('🔍 User profile loaded:', profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else if (currentUser && currentUser.id === 'demo') {
        // Demo user profile data
        const demoProfile = {
          id: 'demo',
          name: 'Demo User',
          email: 'demo@example.com',
          mobileNumber: '+1234567890',
          gender: 'Male',
          age: 32,
          height: 165,
          currentWeight: 78.3,
          targetWeight: 68,
          goalStatus: 'active'
        };
        setUserProfile(demoProfile);
        console.log('🔍 Demo profile loaded:', demoProfile);
      }
    };

    if (currentUser) {
      loadUserProfile();
    }
  }, [currentUser?.id]);

  // Initial data loading on component mount
  useEffect(() => {
    console.log('🚀 Component mounted, loading initial data...');
    fetchFoodDatabase();
    fetchMealEntries();
    fetchLatestWeight();
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDailySummary();
      fetchMealEntries(); // Add this line to fetch meal entries
    } else if (activeTab === 'weekly') {
      fetchWeeklySummary();
    } else if (activeTab === 'monthly') {
      fetchMonthlySummary();
    }
  }, [activeTab, selectedDate, userProfile]);

  // Recompute summaries when meals arrive/change for the active tab
  useEffect(() => {
    if (!mealEntries || mealEntries.length === 0) return;
    if (activeTab === 'weekly') fetchWeeklySummary();
    if (activeTab === 'monthly') fetchMonthlySummary();
  }, [mealEntries, activeTab]);

  // Recalculate weekly summary when mealEntries changes
  useEffect(() => {
    if (activeTab === 'weekly' && mealEntries) {
      fetchWeeklySummary();
    }
  }, [mealEntries, activeTab]);

  // Set daily summary ready and calculate weekly summary when mealEntries are loaded
  useEffect(() => {
    if (mealEntries && activeTab === 'dashboard') {
      setDailySummary({ ready: true });
      fetchWeeklySummary(); // Also calculate weekly summary for dashboard
    }
  }, [mealEntries, activeTab]);

  const fetchFoodDatabase = async () => {
    try {
      console.log('🔍 Fetching food database...');
      setLoading(true);
      
      // Use the api service instead of direct fetch
      // Include userId so API also returns user-specific foods
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const effectiveUser = currentUser || storedUser || {};
      const uid = effectiveUser.id || effectiveUser._id;
      // For demo, request global defaults only (no userId). If API not available, fall back locally
      const response = await api.get('/meals/food-database', { params: (uid && uid !== 'demo') ? { userId: uid } : {} });
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response data:', response.data);
      
      if (response.data.success) {
        console.log('🔍 Setting food database with', response.data.data.foods.length, 'items');
        setFoodDatabase(response.data.data.foods);
        setCategories(response.data.data.categories);
      } else {
        console.error('🔍 API returned success: false');
        if (uid === 'demo') {
          const demoFoods = getDemoFoods();
          setFoodDatabase(demoFoods);
          setCategories([...new Set(demoFoods.map(f => f.category))]);
        }
      }
    } catch (error) {
      console.error('🔍 Error fetching food database:', error);
      console.error('🔍 Error details:', error.response?.data || error.message);
      const storedUser2 = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const effectiveUser2 = currentUser || storedUser2 || {};
      if ((effectiveUser2.id || effectiveUser2._id) === 'demo') {
        const demoFoods = getDemoFoods();
        setFoodDatabase(demoFoods);
        setCategories([...new Set(demoFoods.map(f => f.category))]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMealEntries = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const effectiveUser = currentUser || storedUser || {};
      const userId = effectiveUser.id || effectiveUser._id;
      
      if (!userId) {
        console.error('❌ No user ID found in localStorage');
        return;
      }
      // Demo path: synthesize entries locally using default foods
      if (userId === 'demo') {
        const foods = (foodDatabase && foodDatabase.length > 0) ? foodDatabase : getDemoFoods();
        const demoMeals = generateDemoMealsUsingFoods(foods, 45);
        
        // Ensure meals for current week
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        
        // Ensure 7-8 meals today
        const todayStr = today.toISOString().split('T')[0];
        const todays = demoMeals.filter(m => m.date === todayStr);
        if (todays.length < 7) {
          const toAdd = 7 - todays.length + Math.floor(Math.random() * 2); // 7 or 8
          for (let i = 0; i < toAdd; i++) {
            const food = foods[Math.floor(Math.random() * foods.length)];
            const qty = food.unit === 'pieces' ? 1 : (food.unit === 'cups' ? 1 : 150);
            let gramsEq = qty;
            if (food.unit === 'cups') gramsEq = qty * 240;
            if (food.unit === 'pieces') gramsEq = 50;
            const calories = Math.round((food.calories || 0) * (gramsEq / 100));
            const fat = Math.round(((food.fat || 0) * (gramsEq / 100)) * 10) / 10;
            const cholesterol = Math.round((food.cholesterol || 0) * (gramsEq / 100));
            const fatCalories = fat * 9;
            const remaining = Math.max(0, calories - fatCalories);
            const protein = Math.round(((remaining * 0.2) / 4) * 10) / 10; // ~20% protein
            const carbs = Math.round(((remaining * 0.65) / 4) * 10) / 10;   // ~65% carbs
            demoMeals.push({
              _id: `${todayStr}-extra-${i}-${Math.random().toString(36).slice(2,6)}`,
              userId: 'demo',
              foodName: food.name,
              quantity: gramsEq,
              unit: food.unit || 'grams',
              calories,
              fat,
              protein,
              carbs,
              cholesterol,
              mealType: ['breakfast','lunch','dinner','snack'][i % 4],
              mealTime: `${8 + i}:00`,
              date: todayStr,
              notes: 'demo extra'
            });
          }
        }
        
        // Ensure at least 2-3 meals for each day of current week
        for (let i = 0; i < 7; i++) {
          const weekDay = new Date(weekStart);
          weekDay.setDate(weekStart.getDate() + i);
          const weekDayStr = weekDay.toISOString().split('T')[0];
          const weekDayMeals = demoMeals.filter(m => m.date === weekDayStr);
          
          if (weekDayMeals.length < 2) {
            const toAdd = 2 - weekDayMeals.length + Math.floor(Math.random() * 2); // 2 or 3
            for (let j = 0; j < toAdd; j++) {
              const food = foods[Math.floor(Math.random() * foods.length)];
              const qty = food.unit === 'pieces' ? 1 : (food.unit === 'cups' ? 1 : 150);
              let gramsEq = qty;
              if (food.unit === 'cups') gramsEq = qty * 240;
              if (food.unit === 'pieces') gramsEq = 50;
              const calories = Math.round((food.calories || 0) * (gramsEq / 100));
              const fat = Math.round(((food.fat || 0) * (gramsEq / 100)) * 10) / 10;
              const cholesterol = Math.round((food.cholesterol || 0) * (gramsEq / 100));
              const fatCalories = fat * 9;
              const remaining = Math.max(0, calories - fatCalories);
              const protein = Math.round(((remaining * 0.2) / 4) * 10) / 10; // ~20% protein
              const carbs = Math.round(((remaining * 0.65) / 4) * 10) / 10;   // ~65% carbs
              demoMeals.push({
                _id: `${weekDayStr}-week-${j}-${Math.random().toString(36).slice(2,6)}`,
                userId: 'demo',
                foodName: food.name,
                quantity: gramsEq,
                unit: food.unit || 'grams',
                calories,
                fat,
                protein,
                carbs,
                cholesterol,
                mealType: ['breakfast','lunch','dinner','snack'][j % 4],
                mealTime: `${8 + j * 4}:00`,
                date: weekDayStr,
                notes: 'demo week'
              });
            }
          }
        }
        
        // sort by date desc then time desc so recent meals work
        demoMeals.sort((a,b) => (b.date.localeCompare(a.date)) || ((b.mealTime||'').localeCompare(a.mealTime||'')));
        setMealEntries(demoMeals);
        return;
      }
      
      console.log('🔍 Fetching meals for user:', userId);
      
      // Fetch all meals for the user using the new route
      const response = await api.get(`/meals/entries/all?userId=${userId}`);
      console.log('🔍 API Response:', response.data);
      console.log('🔍 API Response success:', response.data.success);
      console.log('🔍 API Response data length:', response.data.data?.length);
      
      if (response.data.success) {
        setMealEntries(response.data.data);
        console.log('✅ Set meal entries:', response.data.data.length, 'meals');
        console.log('✅ First few meals:', response.data.data.slice(0, 3));
        
        // Check if any meals have today's date
        const today = new Date().toISOString().split('T')[0];
        const todaysMeals = response.data.data.filter(meal => meal.date === today);
        console.log('🔍 Meals with today\'s date in API response:', todaysMeals.length);
        console.log('🔍 Today\'s meals from API:', todaysMeals);
      } else {
        console.log('❌ API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error fetching meal entries:', error);
    }
  };

  const fetchDailySummary = async () => {
    try {
      // Since we're calculating everything from mealEntries, we don't need the API call
      // Just set a flag to indicate daily summary is ready
      setDailySummary({ ready: true });
    } catch (error) {
      console.error('Error setting daily summary:', error);
      setDailySummary({ ready: true });
    }
  };

  const fetchWeeklySummary = async () => {
    try {
      // Calculate weekly summary from mealEntries instead of API call
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
      
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = weekEnd.toISOString().split('T')[0];
      
      console.log('🔍 Calculating weekly summary for:', weekStartStr, 'to', weekEndStr);
      
      // Create complete week structure with all 7 days
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        const dayStr = day.toISOString().split('T')[0];
        weekDays.push(dayStr);
      }
      
      console.log('🔍 Week days:', weekDays);
      
      if (!mealEntries || mealEntries.length === 0) {
        console.log('🔍 No meal entries available for weekly summary');
        // Initialize with empty data for all days
        const emptyDailyData = {};
        weekDays.forEach(day => {
          emptyDailyData[day] = { totals: { calories: 0, fat: 0, protein: 0, carbs: 0, cholesterol: 0 } };
        });
        setWeeklySummary({
          weekTotals: { calories: 0, fat: 0, protein: 0, carbs: 0, cholesterol: 0 },
          totalMeals: 0,
          dailyData: emptyDailyData
        });
        return;
      }
      
      // Filter meals for the current week
      const weeklyMeals = mealEntries.filter(meal => {
        // Add null check for meal
        if (!meal || !meal.date) {
          console.log('🔍 Skipping meal with no date in weekly summary:', meal);
          return false;
        }
        
        const mealDate = meal.date;
        let mealDateStr = mealDate;
        
        // Handle ISO format dates
        if (mealDate.includes('T')) {
          mealDateStr = mealDate.split('T')[0];
        }
        
        return mealDateStr >= weekStartStr && mealDateStr <= weekEndStr;
      });
      
      console.log('🔍 Weekly meals found:', weeklyMeals.length);
      
      // Calculate totals
      const weekTotals = weeklyMeals.reduce((total, meal) => {
        // Add null check for meal
        if (!meal) {
          console.log('🔍 Skipping null meal in weekly summary reduce');
          return total;
        }
        
        let mealCalories = 0;
        let mealFat = 0;
        let mealProtein = 0;
        let mealCarbs = 0;
        let mealCholesterol = 0;
        
        if (meal.foodItems && Array.isArray(meal.foodItems) && meal.foodItems.length > 0) {
          meal.foodItems.forEach(item => {
            if (item && typeof item === 'object') {
              mealCalories += ((item.calories || 0) * (item.quantity || 0));
              mealFat += ((item.fat || 0) * (item.quantity || 0));
              mealCholesterol += ((item.cholesterol || 0) * (item.quantity || 0));
            }
          });
        } else {
          mealCalories = meal.calories || 0;
          mealFat = meal.fat || 0;
          mealProtein = meal.protein || 0;
          mealCarbs = meal.carbs || 0;
          mealCholesterol = meal.cholesterol || 0;
        }
        
        return {
          calories: total.calories + mealCalories,
          fat: total.fat + mealFat,
          protein: total.protein + mealProtein,
          carbs: total.carbs + mealCarbs,
          cholesterol: total.cholesterol + mealCholesterol
        };
      }, { calories: 0, fat: 0, protein: 0, carbs: 0, cholesterol: 0 });
      
      // Initialize daily data for all week days
      const dailyData = {};
      weekDays.forEach(day => {
        dailyData[day] = { totals: { calories: 0, fat: 0, protein: 0, carbs: 0, cholesterol: 0 } };
      });
      
      // Group meals by day
      weeklyMeals.forEach(meal => {
        // Add null check for meal
        if (!meal || !meal.date) {
          console.log('🔍 Skipping meal with no date in daily data forEach');
          return;
        }
        
        let mealDateStr = meal.date;
        if (meal.date.includes('T')) {
          mealDateStr = meal.date.split('T')[0];
        }
        
        if (!dailyData[mealDateStr]) {
          dailyData[mealDateStr] = { totals: { calories: 0, fat: 0, protein: 0, carbs: 0, cholesterol: 0 } };
        }
        
        let mealCalories = 0;
        let mealFat = 0;
        let mealProtein = 0;
        let mealCarbs = 0;
        let mealCholesterol = 0;
        
        if (meal.foodItems && Array.isArray(meal.foodItems) && meal.foodItems.length > 0) {
          meal.foodItems.forEach(item => {
            if (item && typeof item === 'object') {
              mealCalories += ((item.calories || 0) * (item.quantity || 0));
              mealFat += ((item.fat || 0) * (item.quantity || 0));
              mealCholesterol += ((item.cholesterol || 0) * (item.quantity || 0));
            }
          });
        } else {
          mealCalories = meal.calories || 0;
          mealFat = meal.fat || 0;
          mealProtein = meal.protein || 0;
          mealCarbs = meal.carbs || 0;
          mealCholesterol = meal.cholesterol || 0;
        }
        
        dailyData[mealDateStr].totals.calories += mealCalories;
        dailyData[mealDateStr].totals.fat += mealFat;
        dailyData[mealDateStr].totals.protein += mealProtein;
        dailyData[mealDateStr].totals.carbs += mealCarbs;
        dailyData[mealDateStr].totals.cholesterol += mealCholesterol;
      });
      
      const weeklySummaryData = {
        weekTotals,
        totalMeals: weeklyMeals.length,
        dailyData
      };
      
      console.log('🔍 Calculated weekly summary:', weeklySummaryData);
      setWeeklySummary(weeklySummaryData);
      
    } catch (error) {
      console.error('Error calculating weekly summary:', error);
      setWeeklySummary({
        weekTotals: { calories: 0, fat: 0, protein: 0, carbs: 0, cholesterol: 0 },
        totalMeals: 0,
        dailyData: {}
      });
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const effectiveUser = currentUser || storedUser || {};
      const userId = effectiveUser.id || effectiveUser._id;
      if (userId === 'demo') {
        // Compute monthly summary locally from mealEntries
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const filtered = (mealEntries || []).filter(m => new Date(m.date) >= ninetyDaysAgo);
        const totals = filtered.reduce((acc, m) => {
          acc.calories += m.calories || 0;
          acc.fat += m.fat || 0;
          acc.cholesterol += m.cholesterol || 0;
          return acc;
        }, { calories: 0, fat: 0, cholesterol: 0 });
        const days = new Set(filtered.map(m => new Date(m.date).toISOString().slice(0,10))).size || 1;
        setMonthlySummary({
          averages: {
            calories: Math.round(totals.calories / days),
            fat: Math.round((totals.fat / days) * 10) / 10,
            cholesterol: Math.round(totals.cholesterol / days),
          }
        });
        return;
      }
      const currentDate = new Date(selectedDate);
      const response = await api.get(`/meals/monthly-summary?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`);
      if (response.data.success) {
        setMonthlySummary(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
    }
  };

  const fetchLatestWeight = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const effectiveUser = currentUser || storedUser || {};
      const userId = effectiveUser.id || effectiveUser._id;
      
      if (!userId) {
        console.log('No user ID found, using default weight');
        return;
      }
      
      // Correct endpoint lives under /api/weight-entries/latest/:userId
      const response = await api.get(`/weight-entries/latest/${userId}`);
      if (response.data.success) {
        setLatestWeight(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching latest weight:', error);
      // Use default weight if API fails
      setLatestWeight({ weight: 78.3 });
    }
  };

  const generateDummyData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const effectiveUser = currentUser || storedUser || {};
      const userId = effectiveUser.id || effectiveUser._id;
      
      if (!userId) {
        console.log('No user ID found, cannot generate dummy data');
        return;
      }

      const goals = getMacronutrientGoals();
      const today = new Date();
      
      // Generate 35 days of varied data
      for (let i = 34; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Create varied consumption patterns
        const variation = 0.3 + (Math.random() * 0.4); // 30-70% variation
        const isHighDay = Math.random() > 0.6; // 40% chance of high consumption
        const isLowDay = Math.random() > 0.7; // 30% chance of low consumption
        
        let calorieMultiplier = variation;
        if (isHighDay) calorieMultiplier = 0.8 + (Math.random() * 0.4); // 80-120%
        if (isLowDay) calorieMultiplier = 0.4 + (Math.random() * 0.3); // 40-70%
        
        const dailyCalories = Math.round(goals.tdee * calorieMultiplier);
        const dailyFat = Math.round(goals.fat.grams * calorieMultiplier * (0.8 + Math.random() * 0.4));
        const dailyProtein = Math.round(goals.protein.grams * calorieMultiplier * (0.7 + Math.random() * 0.6));
        const dailyCarbs = Math.round(goals.carbs.grams * calorieMultiplier * (0.6 + Math.random() * 0.8));
        const dailyCholesterol = Math.round(goals.cholesterol.mg * calorieMultiplier * (0.5 + Math.random() * 0.6));
        
        // Generate 2-4 meals per day
        const mealCount = 2 + Math.floor(Math.random() * 3);
        const meals = ['breakfast', 'lunch', 'dinner', 'snack'];
        
        for (let j = 0; j < mealCount; j++) {
          const mealType = meals[j];
          const mealCalories = Math.round(dailyCalories / mealCount * (0.8 + Math.random() * 0.4));
          
          const dummyMeal = {
            userId: userId,
            foodName: `Dummy ${mealType} food`,
            quantity: 100,
            unit: 'grams',
            calories: mealCalories,
            fat: Math.round(dailyFat / mealCount * (0.7 + Math.random() * 0.6)),
            cholesterol: Math.round(dailyCholesterol / mealCount * (0.5 + Math.random() * 0.8)),
            mealType: mealType,
            date: dateStr,
            notes: `Dummy ${mealType} meal`
          };
          
          try {
            await api.post('/meals/add', dummyMeal);
          } catch (error) {
            console.log(`Dummy meal already exists for ${dateStr} ${mealType}`);
          }
        }
      }
      
      setDummyDataGenerated(true);
      // Refresh data after generating dummy data
      fetchDailySummary();
      fetchMealEntries();
      fetchWeeklySummary();
      fetchMonthlySummary();
      
    } catch (error) {
      console.error('Error generating dummy data:', error);
    }
  };



  const handleAddMeal = async () => {
    if (!selectedFood || !quantity || quantity <= 0) return;
    
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const effectiveUser = currentUser || storedUser || {};
      const userId = effectiveUser.id || effectiveUser._id;
      
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      // Convert units to grams for calculation
      let gramsEquivalent = parseFloat(quantity);
      if (unit === 'cups') gramsEquivalent = parseFloat(quantity) * 240; // 1 cup = 240g
      else if (unit === 'tsp') gramsEquivalent = parseFloat(quantity) * 5; // 1 tsp = 5g
      else if (unit === 'tbsp') gramsEquivalent = parseFloat(quantity) * 15; // 1 tbsp = 15g
      else if (unit === 'ml') gramsEquivalent = parseFloat(quantity); // 1ml ≈ 1g for most foods
      else if (unit === 'pieces') gramsEquivalent = parseFloat(quantity) * 50; // 1 piece ≈ 50g
      else if (unit === 'slices') gramsEquivalent = parseFloat(quantity) * 30; // 1 slice ≈ 30g

      const mealData = {
        userId: userId,
        foodName: selectedFood.name,
        // Send quantity in grams so backend nutrition math is correct
        quantity: parseFloat(gramsEquivalent),
        unit: unit,
        calories: Math.round((selectedFood.calories || 0) * gramsEquivalent / 100),
        fat: Math.round(selectedFood.fat * gramsEquivalent / 100 * 10) / 10,
        protein: Math.round((selectedFood.protein || 0) * gramsEquivalent / 100 * 10) / 10,
        carbs: Math.round((selectedFood.carbs || 0) * gramsEquivalent / 100 * 10) / 10,
        cholesterol: Math.round(selectedFood.cholesterol * gramsEquivalent / 100),
        mealType: mealType,
        mealTime: mealTime || new Date().toTimeString().slice(0, 5), // Use current time if not provided
        date: selectedDate,
        notes: notes
      };

      // For demo user, skip API and update local state directly
      if (userId === 'demo') {
        const newMeal = {
          ...mealData,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        setMealEntries(prevEntries => ([...(prevEntries || []), newMeal]));
        setSelectedFood(null);
        setQuantity('');
        setUnit('grams');
        setMealType('breakfast');
        setMealTime('');
        setNotes('');
        setShowAddMealPopup(false);
        fetchDailySummary();
        fetchWeeklySummary();
        fetchMonthlySummary();
        toast.success('Meal added (demo)');
        return;
      }

      const response = await api.post('/meals/add', mealData);
      
      if (response.data.success) {
        // Reset form
        setSelectedFood(null);
        setQuantity('');
        setUnit('grams');
        setMealType('breakfast');
        setMealTime('');
        setNotes('');
        setShowAddMealPopup(false);
        
        // Immediately add the new meal to local state for instant update
        const newMeal = {
          ...mealData,
          _id: response.data.data?._id || response.data.mealId || Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        
        setMealEntries(prevEntries => {
          const updatedEntries = [...(prevEntries || []), newMeal];
          console.log('✅ Updated mealEntries immediately:', updatedEntries.length, 'meals');
          return updatedEntries;
        });
        
        // Also refresh from server to ensure consistency
        fetchMealEntries();
        fetchDailySummary();
        fetchWeeklySummary();
        fetchMonthlySummary();
        
        toast.success('Meal added successfully!');
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      toast.error('Failed to add meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = (meal) => {
    // Show custom confirmation popup
    setMealToDelete(meal);
    setShowDeleteConfirmPopup(true);
  };

  const confirmDeleteMeal = async () => {
    if (!mealToDelete) return;

    try {
      const response = await api.delete(`/meals/${mealToDelete._id}`);
      if (response.data.success) {
        fetchMealEntries();
        fetchDailySummary();
        toast.success('Meal deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast.error('Failed to delete meal. Please try again.');
    } finally {
      setShowDeleteConfirmPopup(false);
      setMealToDelete(null);
    }
  };

  const cancelDeleteMeal = () => {
    setShowDeleteConfirmPopup(false);
    setMealToDelete(null);
  };

  const handleEditMeal = (meal) => {
    // Check if meal is from today or yesterday only
    const mealDate = new Date(meal.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1); // Start of yesterday
    
    if (mealDate < yesterday) {
      toast.error('You can only edit meals from today or yesterday.');
      return;
    }
    
    // Set editing meal and populate form
    setEditingMeal(meal);
    setEditQuantity(meal.quantity.toString());
    setEditUnit(meal.unit);
    setEditMealType(meal.mealType);
    setEditMealTime(meal.mealTime || '');
    setEditNotes(meal.notes || '');
    setShowEditMealPopup(true);
  };

  const handleUpdateMeal = async () => {
    if (!editingMeal || !editQuantity || editQuantity <= 0) return;
    
    setLoading(true);
    try {
      // Convert units to grams for calculation
      let gramsEquivalent = parseFloat(editQuantity);
      if (editUnit === 'cups') gramsEquivalent = parseFloat(editQuantity) * 240;
      else if (editUnit === 'tsp') gramsEquivalent = parseFloat(editQuantity) * 5;
      else if (editUnit === 'tbsp') gramsEquivalent = parseFloat(editQuantity) * 15;
      else if (editUnit === 'ml') gramsEquivalent = parseFloat(editQuantity);
      else if (editUnit === 'pieces') gramsEquivalent = parseFloat(editQuantity) * 50;
      else if (editUnit === 'slices') gramsEquivalent = parseFloat(editQuantity) * 30;

      const updatedMealData = {
        foodName: editingMeal.foodName,
        quantity: parseFloat(editQuantity),
        unit: editUnit,
                                    calories: Math.round((editingMeal.calories || 0) * gramsEquivalent / ((editingMeal.quantity || 1) * (editingMeal.unit === 'cups' ? 240 : editingMeal.unit === 'tsp' ? 5 : editingMeal.unit === 'tbsp' ? 15 : editingMeal.unit === 'ml' ? 1 : editingMeal.unit === 'pieces' ? 50 : editingMeal.unit === 'slices' ? 30 : 1))),
        fat: Math.round(editingMeal.fat * gramsEquivalent / (editingMeal.quantity * (editingMeal.unit === 'cups' ? 240 : editingMeal.unit === 'tsp' ? 5 : editingMeal.unit === 'tbsp' ? 15 : editingMeal.unit === 'ml' ? 1 : editingMeal.unit === 'pieces' ? 50 : editingMeal.unit === 'slices' ? 30 : 1)) * 10) / 10,
        cholesterol: Math.round(editingMeal.cholesterol * gramsEquivalent / (editingMeal.quantity * (editingMeal.unit === 'cups' ? 240 : editingMeal.unit === 'tsp' ? 5 : editingMeal.unit === 'tbsp' ? 15 : editingMeal.unit === 'ml' ? 1 : editingMeal.unit === 'pieces' ? 50 : editingMeal.unit === 'slices' ? 30 : 1))),
        mealType: editMealType,
        mealTime: editMealTime || new Date().toTimeString().slice(0, 5),
        date: editingMeal.date,
        notes: editNotes
      };

      const response = await api.put(`/meals/${editingMeal._id}`, updatedMealData);
      
      if (response.data.success) {
        // Reset form
        setEditingMeal(null);
        setEditQuantity('');
        setEditUnit('grams');
        setEditMealType('breakfast');
        setEditMealTime('');
        setEditNotes('');
        setShowEditMealPopup(false);
        
        // Refresh data
        fetchDailySummary();
        fetchMealEntries();
        fetchWeeklySummary();
        fetchMonthlySummary();
        
        toast.success('Meal updated successfully!');
      }
    } catch (error) {
      console.error('Error updating meal:', error);
      toast.error('Failed to update meal. Please try again.');
    } finally {
      setLoading(false);
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

  // Debug logging
  console.log('🔍 Current foodDatabase length:', foodDatabase.length);
  console.log('🔍 Current filteredFoods length:', filteredFoods.length);
  console.log('🔍 Current searchTerm:', searchTerm);
  console.log('🔍 Current selectedCategory:', selectedCategory);

  // Pagination logic
  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage);
  const paginatedFoods = filteredFoods.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to first page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const getCalorieGoal = () => {
    // Use the same calculation as getCalorieDetails for consistency
    const details = getCalorieDetails();
    return details.tdee;
  };

  const getCalorieDetails = () => {
    try {
      // Get user data from userProfile state, UserContext, and localStorage as fallback
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const localStorageProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      
      // Use userProfile state if available, otherwise fallback to currentUser or localStorage
      const userData = userProfile || currentUser || storedUser;
    
    // Use actual user data with fallbacks
    const currentWeight = latestWeight ? latestWeight.weight : (userData.currentWeight || userData.weight || localStorageProfile.currentWeight || localStorageProfile.weight || 78.3);
    const height = userData.height || localStorageProfile.height || storedUser.height || 165;
    const age = userData.age || localStorageProfile.age || storedUser.age || 32;
    const gender = userData.gender || localStorageProfile.gender || storedUser.gender || 'male';
    const activityLevel = userData.activityLevel || localStorageProfile.activityLevel || storedUser.activityLevel || 'moderate';
    
    let bmr;
    if (gender.toLowerCase() === 'male') {
      bmr = (10 * currentWeight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * currentWeight) + (6.25 * height) - (5 * age) - 161;
    }
    
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      hard: 1.725,
      very_hard: 1.9
    };
    
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);
    
      return {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        weight: currentWeight,
        height,
        age,
        gender,
        activityLevel
      };
    } catch (error) {
      console.error('Error in getCalorieDetails:', error);
      // Return default values if there's an error
      return {
        bmr: 1658,
        tdee: 2576,
        weight: 78.3,
        height: 165,
        age: 32,
        gender: 'male',
        activityLevel: 'moderate'
      };
    }
  };

  const getMacronutrientGoals = () => {
    const details = getCalorieDetails();
    
    // Add safety checks
    if (!details || !details.tdee || !details.weight) {
      console.log('🔍 No calorie details available, using defaults');
      return {
        carbs: { grams: 354, percentage: 55, range: { min: 289, max: 418 } },
        protein: { grams: 129, percentage: 20, range: { min: 64, max: 225 } },
        fat: { grams: 71, percentage: 24.8, range: { min: 57, max: 100 } },
        cholesterol: { mg: 300 },
        tdee: 2576,
        bmr: 1658,
        activityLevel: 'moderate'
      };
    }
    
    const tdee = details.tdee;
    const weight = details.weight;
    
    // Scientific AMDR (Acceptable Macronutrient Distribution Ranges) calculations
    // Using user's actual age, height, and latest weight from BMR formula
    
    // Carbs: 45-65% of TDEE (using 55% as midpoint)
    const carbPercentage = 0.55;
    const carbGrams = Math.round((tdee * carbPercentage) / 4);
    
    // Protein: Using preferred target of 129g (slightly lower than calculated 145g)
    const proteinPercentage = 0.20; // 20% of TDEE for 129g protein
    const proteinByCalories = Math.round((tdee * proteinPercentage) / 4);
    const proteinByWeight = Math.round(weight * 1.2); // 1.2g/kg for active individuals
    const proteinGrams = 129; // Using your preferred target
    
    // Fat: Using preferred target of 71g (slightly lower than calculated 79g)
    const fatPercentage = 0.248; // 24.8% of TDEE for 71g fat
    const fatGrams = 71; // Using your preferred target
    
    // Cholesterol: Maximum 300mg per day (heart-healthy limit)
    const cholesterolMg = 300;
    
    return {
      carbs: {
        grams: carbGrams,
        percentage: Math.round(carbPercentage * 100 * 100) / 100,
        range: {
          min: Math.round((tdee * 0.45) / 4),  // 45% minimum
          max: Math.round((tdee * 0.65) / 4)   // 65% maximum
        }
      },
      protein: {
        grams: proteinGrams,
        percentage: Math.round(proteinPercentage * 100 * 100) / 100,
        range: {
          min: Math.round((tdee * 0.10) / 4),  // 10% minimum
          max: Math.round((tdee * 0.35) / 4)   // 35% maximum
        },
        byWeight: proteinByWeight
      },
      fat: {
        grams: fatGrams,
        percentage: Math.round(fatPercentage * 100 * 100) / 100,
        range: {
          min: Math.round((tdee * 0.20) / 9),  // 20% minimum
          max: Math.round((tdee * 0.35) / 9)   // 35% maximum
        }
      },
      cholesterol: {
        mg: cholesterolMg
      },
      tdee: tdee,
      bmr: details.bmr,
      activityLevel: details.activityLevel
    };
  };

  const getCalorieProgress = () => {
    if (!dailySummary || !dailySummary.totals) return 0;
    const goal = getCalorieGoal();
    return Math.min(((dailySummary.totals.calories || 0) / goal) * 100, 100);
  };

  const getDailyCalorieConsumptionData = () => {
    console.log('🔍 getDailyCalorieConsumptionData called');
    
    if (!mealEntries) {
      console.log('🔍 No mealEntries, returning empty array');
      return [];
    }
    
    // Get today's meals using the same logic as getTodaysNutritionData
    const today = new Date().toISOString().split('T')[0];
    console.log('🔍 Today\'s date for chart:', today);
    
    const todaysMeals = mealEntries.filter(meal => {
      // Handle both date formats: YYYY-MM-DD and YYYY-MM-DDTHH:mm:ss.sssZ
      if (meal.date === today) {
        return true; // Direct match
      }
      
      // If meal.date is in ISO format, extract the date part
      if (meal.date.includes('T')) {
        const extractedDate = meal.date.split('T')[0];
        return extractedDate === today;
      }
      
      return false;
    });
    
    console.log('🔍 Today\'s meals for chart:', todaysMeals.length);
    
    const timeSlots = [];
    const hourlyData = {};
    const dailyGoal = getCalorieGoal();
    
    // Create time slots from 6 AM to 9 PM (15 hours)
    const timePoints = [
      { hour: 6, label: '6 AM' },
      { hour: 9, label: '9 AM' },
      { hour: 12, label: '12 PM' },
      { hour: 15, label: '3 PM' },
      { hour: 18, label: '6 PM' },
      { hour: 21, label: '9 PM' }
    ];
    
    // Calculate expected calorie distribution throughout the day
    // Typical distribution: 20% breakfast, 30% lunch, 35% dinner, 15% snacks
    const expectedDistribution = {
      6: 0,    // 6 AM - start of day
      9: dailyGoal * 0.20,   // 9 AM - breakfast
      12: dailyGoal * 0.50,  // 12 PM - breakfast + lunch
      15: dailyGoal * 0.65,  // 3 PM - breakfast + lunch + snacks
      18: dailyGoal * 0.80,  // 6 PM - breakfast + lunch + snacks + dinner
      21: dailyGoal          // 9 PM - full day
    };
    
    // Initialize hourly data with actual consumption
    timePoints.forEach(({ hour, label }) => {
      hourlyData[hour] = { 
        time: label, 
        actualCalories: 0, 
        expectedCalories: expectedDistribution[hour],
        meals: [],
        mealCount: 0
      };
    });
    
    // Distribute actual meals across time slots
    if (todaysMeals.length > 0) {
      // Create a more realistic distribution based on meal types
      const mealDistribution = {
        breakfast: [6, 9],   // Breakfast between 6-9 AM
        lunch: [12, 15],     // Lunch between 12-3 PM
        dinner: [18, 21],    // Dinner between 6-9 PM
        snack: [9, 12, 15, 18] // Snacks throughout the day
      };
      
      todaysMeals.forEach(meal => {
        // Add null check for meal
        if (!meal) {
          console.log('🔍 Skipping null meal in forEach');
          return;
        }
        
        // Calculate meal calories
        let mealCalories = 0;
        if (meal.foodItems && Array.isArray(meal.foodItems) && meal.foodItems.length > 0) {
          meal.foodItems.forEach(item => {
            if (item && typeof item === 'object') {
              mealCalories += ((item.calories || 0) * (item.quantity || 0));
            }
          });
        } else {
          mealCalories = meal.calories || 0;
        }
        
        // Assign meal to appropriate time slot based on meal type
        const mealType = meal.mealType?.toLowerCase() || 'snack';
        const possibleHours = mealDistribution[mealType] || mealDistribution.snack;
        const assignedHour = possibleHours[Math.floor(Math.random() * possibleHours.length)];
        
        if (hourlyData[assignedHour]) {
          hourlyData[assignedHour].actualCalories += mealCalories;
          hourlyData[assignedHour].meals.push({
            name: meal.notes || `${meal.mealType} meal`,
            calories: mealCalories,
            type: meal.mealType
          });
          hourlyData[assignedHour].mealCount++;
        }
      });
    }
    
    // Convert to cumulative data
    let cumulativeActual = 0;
    timePoints.forEach(({ hour }) => {
      const hourData = hourlyData[hour];
      cumulativeActual += hourData.actualCalories;
      
      timeSlots.push({
        time: hourData.time,
        actualCalories: cumulativeActual,
        expectedCalories: hourData.expectedCalories,
        meal: hourData.meals.length > 0 ? hourData.meals.map(m => `${m.type}: ${m.name}`).join('; ') : 'No meals consumed',
        mealCount: hourData.mealCount,
        deficit: hourData.expectedCalories - cumulativeActual,
        deficitPercentage: hourData.expectedCalories > 0 ? ((hourData.expectedCalories - cumulativeActual) / hourData.expectedCalories * 100) : 0
      });
    });
    
    console.log('🔍 Enhanced chart data generated:', timeSlots);
    return timeSlots;
  };

  const getTodaysNutritionData = () => {
    if (!mealEntries || !Array.isArray(mealEntries)) {
      return { calories: 0, fat: 0, protein: 0, carbs: 0, cholesterol: 0, mealCount: 0 };
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const todaysMeals = mealEntries.filter(meal => {
      if (!meal || !meal.date) return false;
      
      // Normalize the meal date to YYYY-MM-DD format
      let mealDateStr = meal.date;
      
      // If meal.date is in ISO format, extract the date part
      if (meal.date.includes('T')) {
        mealDateStr = meal.date.split('T')[0];
      }
      
      // Also handle if meal.date is a Date object
      if (meal.date instanceof Date) {
        mealDateStr = meal.date.toISOString().split('T')[0];
      }
      
      const isToday = mealDateStr === today;
      if (isToday) {
        console.log('✅ Found today\'s meal:', meal);
      }
      
      return isToday;
    });
    
    console.log('📊 Today\'s meals found:', todaysMeals.length);
    console.log('📊 Today\'s meals:', todaysMeals);
    
    console.log('🔍 Today\'s meals found:', todaysMeals.length);
    console.log('🔍 Today\'s meals:', todaysMeals);
    
    const nutritionData = todaysMeals.reduce((total, meal) => {
      // Add null check for meal
      if (!meal) {
        console.log('🔍 Skipping null meal in reduce');
        return total;
      }
      
      console.log('🔍 Processing meal:', meal);
      console.log('🔍 Meal structure check - foodItems:', meal.foodItems);
      console.log('🔍 Meal structure check - flat fields:', { 
                                        calories: meal.calories || 0, 
        fat: meal.fat || 0, 
        protein: meal.protein || 0, 
        carbs: meal.carbs || 0, 
        cholesterol: meal.cholesterol || 0
      });
      
      // Handle both old structure (foodItems array) and new structure (flat fields)
      let mealCalories = 0;
      let mealFat = 0;
      let mealProtein = 0;
      let mealCarbs = 0;
      let mealCholesterol = 0;
      
      if (meal.foodItems && Array.isArray(meal.foodItems) && meal.foodItems.length > 0) {
        // Old structure with foodItems array
        console.log('🔍 Using foodItems array structure');
        meal.foodItems.forEach(item => {
          if (item && typeof item === 'object') {
            mealCalories += ((item.calories || 0) * (item.quantity || 0));
            mealFat += ((item.fat || 0) * (item.quantity || 0));
            mealCholesterol += ((item.cholesterol || 0) * (item.quantity || 0));
          }
        });
      } else {
        // New structure with flat fields - these are already calculated totals
        console.log('🔍 Using flat fields structure');
        mealCalories = meal.calories || 0;
        mealFat = meal.fat || 0;
        mealProtein = meal.protein || 0;
        mealCarbs = meal.carbs || 0;
        mealCholesterol = meal.cholesterol || 0;
        
        // Ensure we're using the calculated totals, not per-100g values
        console.log('🔍 Using calculated totals:', { mealCalories, mealFat, mealProtein, mealCarbs, mealCholesterol });
      }
      
      console.log('🔍 Calculated meal nutrition:', { mealCalories, mealFat, mealProtein, mealCarbs, mealCholesterol });
      
      const newTotal = {
        calories: total.calories + mealCalories,
        fat: total.fat + mealFat,
        protein: total.protein + mealProtein,
        carbs: total.carbs + mealCarbs,
        cholesterol: total.cholesterol + mealCholesterol,
        mealCount: total.mealCount + 1
      };
      
      console.log('🔍 Running total after this meal:', newTotal);
      return newTotal;
    }, { calories: 0, fat: 0, protein: 0, carbs: 0, cholesterol: 0, mealCount: 0 });
    
    console.log('🔍 Final nutrition data:', nutritionData);
    console.log('🎯 Returning nutrition data for dashboard display');
    return nutritionData;
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

  // Helper function to get filtered meals based on quick filter
  const getFilteredMeals = () => {
    const filterDate = new Date();
    filterDate.setDate(filterDate.getDate() - 90); // Always show last 90 days
    
    return mealEntries.filter(meal => {
      // Add null check for meal
      if (!meal || !meal.date) {
        console.log('🔍 Skipping meal with no date in getFilteredMeals:', meal);
        return false;
      }
      return new Date(meal.date) >= filterDate;
    });
  };

  // Helper function to check if a meal can be edited (today or yesterday only)
  const canEditMeal = (meal) => {
    // Add null check for meal
    if (!meal || !meal.date) {
      console.log('🔍 Cannot edit meal with no date:', meal);
      return false;
    }
    
    const mealDate = new Date(meal.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1); // Start of yesterday
    
    return mealDate >= yesterday;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full z-10">
        <div className="p-6">
          {/* Logo/Header */}
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Meal Tracker</h1>
            <p className="text-sm text-gray-600 mt-1">Track your nutrition journey</p>
        </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: FaChartPie },
                { id: 'food-database', name: 'Food Database', icon: FaSearch },
                { id: 'nutrition-info', name: 'Nutrition Info', icon: FaInfoCircle },
                { id: 'weekly', name: 'Weekly View', icon: FaCalendarAlt },
                { id: 'monthly', name: 'Monthly View', icon: FaCalendarAlt }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                      ? 'bg-orange-100 text-orange-700 border border-orange-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.name}
                  </button>
                );
              })}
          </nav>
          </div>
        </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="p-8">

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-8 text-white -mt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
                  <p className="text-orange-100 text-lg">Track your nutrition journey today</p>
                  {/* removed period helper text per request */}
                </div>
                <div className="flex items-center space-x-6">
                  {/* Add Meal CTA for better mobile UX */}
                  <div className="text-center">
                    <button
                      onClick={() => setShowAddMealPopup(true)}
                      className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <span className="text-xl">+</span>
                      <span className="hidden sm:inline">Add Meal</span>
                    </button>
                    <p className="text-xs text-orange-100 mt-1">Quick Add</p>
                  </div>
                  
                  <div className="text-right ml-4">
                    {(() => {
                      const goals = getMacronutrientGoals();
                      return (
                        <>
                          <div className="text-4xl font-bold">{goals.tdee}</div>
                          <div className="text-orange-100">Daily Goal (kcal)</div>
                          <div className="text-orange-100 text-sm mt-1">
                            Fat: {goals.fat.percentage}% | Protein: {goals.protein.percentage}% | Carbs: {goals.carbs.percentage}%
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Removed large Add Meal button to declutter the dashboard */}

            {/* Enhanced Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Calories</p>
                      <p className="text-3xl font-bold text-gray-900">
                      {getTodaysNutritionData().calories}
                      </p>
                      <p className="text-sm text-gray-500">/ {getCalorieGoal()} goal</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl">🔥</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all duration-500"
                                                      style={{ width: `${Math.min(((getTodaysNutritionData()?.calories || 0) / getCalorieGoal()) * 100, 100)}%` }}
                      ></div>
                    </div>
                                          <p className="text-xs text-gray-500 mt-2">{Math.round(((getTodaysNutritionData()?.calories || 0) / getCalorieGoal()) * 100)}% of daily goal</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Fat (g)</p>
                      <p className="text-3xl font-bold text-gray-900">
                      {Math.round(getTodaysNutritionData().fat * 10) / 10}
                      </p>
                      <p className="text-sm text-gray-500">/ {getMacronutrientGoals().fat.grams}g recommended</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl">🥑</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-red-400 to-pink-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((getTodaysNutritionData().fat / getMacronutrientGoals().fat.grams) * 100, 100)}%` }}
                      ></div>
                    </div>
                  <p className="text-xs text-gray-500 mt-2">{Math.round((getTodaysNutritionData().fat / getMacronutrientGoals().fat.grams) * 100)}% of daily fat</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Cholesterol (mg)</p>
                      <p className="text-3xl font-bold text-gray-900">
                      {Math.round(getTodaysNutritionData().cholesterol)}
                      </p>
                      <p className="text-sm text-gray-500">/ {getMacronutrientGoals().cholesterol.mg}mg limit</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl">❤️</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((getTodaysNutritionData().cholesterol / getMacronutrientGoals().cholesterol.mg) * 100, 100)}%` }}
                      ></div>
                    </div>
                  <p className="text-xs text-gray-500 mt-2">{Math.round((getTodaysNutritionData().cholesterol / getMacronutrientGoals().cholesterol.mg) * 100)}% of daily limit</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Meals Today</p>
                      <p className="text-3xl font-bold text-gray-900">
                      {getTodaysNutritionData().mealCount}
                      </p>
                      <p className="text-sm text-gray-500">meals logged</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl">📊</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <p className="text-xs text-gray-500">Tracking active</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Meals moved to bottom with pagination/period filter */}

            {/* Enhanced Charts Section */}
            {(dailySummary || mealEntries) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Nutrition Breakdown Pie Chart */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Daily Goals Breakdown</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={(() => {
                            const goals = getMacronutrientGoals();
                            const consumed = getTodaysNutritionData();
                            return [
                              { 
                                name: 'Fat', 
                                required: goals.fat.grams, 
                                consumed: Math.round(consumed.fat * 10) / 10,
                                requiredColor: '#ef4444',
                                consumedColor: '#fca5a5'
                              },
                              { 
                                name: 'Protein', 
                                required: goals.protein.grams, 
                                consumed: Math.round((consumed.protein || 0) * 10) / 10,
                                requiredColor: '#3b82f6',
                                consumedColor: '#93c5fd'
                              },
                              { 
                                name: 'Carbs', 
                                required: goals.carbs.grams, 
                                consumed: Math.round((consumed.carbs || 0) * 10) / 10,
                                requiredColor: '#10b981',
                                consumedColor: '#6ee7b7'
                              },
                            ];
                          })()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const required = payload.find(p => p.dataKey === 'required');
                                const consumed = payload.find(p => p.dataKey === 'consumed');
                                
                                return (
                                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                    <p className="font-semibold text-gray-900 mb-2">{label}</p>
                                    <div className="space-y-1">
                                      <p className="text-sm">
                                        <span className="font-medium text-gray-700">Daily Goal:</span> 
                                        <span className="ml-2 text-gray-900">{required?.value}g</span>
                                      </p>
                                      <p className="text-sm">
                                        <span className="font-medium text-gray-700">Today's Intake:</span> 
                                        <span className="ml-2 text-gray-900">{consumed?.value}g</span>
                                      </p>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        <Legend />
                          <Bar dataKey="required" fill="#8884d8" name="Required" />
                          <Bar dataKey="consumed" fill="#82ca9d" name="Consumed" />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Macronutrient Goals vs Consumed Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Required vs Consumed</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {(() => {
                        const goals = getMacronutrientGoals();
                        const consumed = getTodaysNutritionData();
                        return (
                          <>
                            <div className="text-center">
                              <p className="text-gray-600">Fat</p>
                              <p className="font-bold text-red-600">{goals.fat.grams}g</p>
                              <p className="text-xs text-red-400">{Math.round(consumed.fat * 10) / 10}g consumed</p>
                              <p className="text-xs text-gray-500">{Math.round((consumed.fat / goals.fat.grams) * 100)}% of goal</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">Protein</p>
                              <p className="font-bold text-blue-600">{goals.protein.grams}g</p>
                              <p className="text-xs text-blue-400">{Math.round((consumed.protein || 0) * 10) / 10}g consumed</p>
                              <p className="text-xs text-gray-500">{Math.round(((consumed.protein || 0) / goals.protein.grams) * 100)}% of goal</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">Carbs</p>
                              <p className="font-bold text-green-600">{goals.carbs.grams}g</p>
                              <p className="text-xs text-green-400">{Math.round((consumed.carbs || 0) * 10) / 10}g consumed</p>
                              <p className="text-xs text-gray-500">{Math.round(((consumed.carbs || 0) / goals.carbs.grams) * 100)}% of goal</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">Cholesterol</p>
                              <p className="font-bold text-yellow-600">{goals.cholesterol.mg}mg</p>
                              <p className="text-xs text-yellow-400">{Math.round(consumed.cholesterol)}mg consumed</p>
                              <p className="text-xs text-gray-500">{Math.round((consumed.cholesterol / goals.cholesterol.mg) * 100)}% of limit</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Calorie Progress Area Chart */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Daily Calorie Progress</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={getDailyCalorieConsumptionData()}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" />
                        <YAxis domain={[0, getCalorieGoal()]} />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            const data = props.payload;
                            const actualCalories = data.actualCalories;
                            const expectedCalories = data.expectedCalories;
                            const deficit = data.deficit;
                            const deficitPercentage = data.deficitPercentage;
                            const mealInfo = data.meal;
                            const mealCount = data.mealCount;
                            
                            if (name === 'actualCalories') {
                              return [
                                `${Math.round(actualCalories)} kcal (${mealCount} meal${mealCount > 1 ? 's' : ''})`, 
                                'Actual Consumption'
                              ];
                            } else if (name === 'expectedCalories') {
                              return [
                                `${Math.round(expectedCalories)} kcal`, 
                                'Expected Consumption'
                              ];
                            }
                            return [value, name];
                          }}
                          labelFormatter={(label) => `${label}`}
                        />
                        <Legend />
                        <ReferenceLine y={getCalorieGoal()} stroke="#ef4444" strokeDasharray="3 3" label="Daily Goal" />
                        <Area 
                          type="monotone" 
                          dataKey="expectedCalories" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          fillOpacity={0.3} 
                          fill="url(#colorExpected)"
                          name="Expected Consumption"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="actualCalories" 
                          stroke="#f97316" 
                          strokeWidth={3}
                          fillOpacity={0.8} 
                          fill="url(#colorActual)"
                          name="Actual Consumption"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 space-y-4">
                    {/* Main Stats */}
                    <div className="flex justify-center">
                      <div className="inline-flex items-center space-x-6 bg-gray-50 rounded-lg px-6 py-3">
                                                <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Consumed</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {getTodaysNutritionData()?.calories || 0} kcal
                          </p>
                          <p className="text-xs text-gray-500">
                            {Math.round(((getTodaysNutritionData()?.calories || 0) / getCalorieGoal()) * 100)}% of goal
                          </p>
                      </div>
                        <div className="w-px h-12 bg-gray-300"></div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-600">Daily Goal</p>
                          <p className="text-2xl font-bold text-gray-900">{getCalorieGoal()} kcal</p>
                          <p className="text-xs text-gray-500">TDEE: {getCalorieDetails().tdee} kcal</p>
                      </div>
                        <div className="w-px h-12 bg-gray-300"></div>
                                                <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Remaining</p>
                          <p className="text-2xl font-bold text-green-600">
                            {Math.max(0, getCalorieGoal() - (getTodaysNutritionData()?.calories || 0))} kcal
                          </p>
                          <p className="text-xs text-gray-500">Available for today</p>
                      </div>
                    </div>
                  </div>
                    
                    {/* Actual Consumption Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Today's Consumption Pattern</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-600">Meals Logged</p>
                          <p className="text-lg font-bold text-blue-600">
                            {getTodaysNutritionData().mealCount}
                          </p>
                          <p className="text-xs text-gray-500">Today</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-600">Latest Meal</p>
                          <p className="text-lg font-bold text-green-600">
                            {(() => {
                              const todaysMeals = mealEntries ? mealEntries.filter(meal => meal.date === new Date().toISOString().split('T')[0]) : [];
                              if (todaysMeals.length > 0) {
                                const latestMeal = todaysMeals.sort((a, b) => {
                                  // Convert time strings to comparable values (e.g., "9:00" -> 900, "14:30" -> 1430)
                                  const timeA = (a.mealTime || '00:00').replace(':', '');
                                  const timeB = (b.mealTime || '00:00').replace(':', '');
                                  return parseInt(timeB) - parseInt(timeA);
                                })[0];
                                return latestMeal.mealTime || '--:--';
                              }
                              return 'None';
                            })()}
                          </p>
                          <p className="text-xs text-gray-500">Time</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-600">Consumption Rate</p>
                          <p className="text-lg font-bold text-purple-600">
                            {(() => {
                              const now = new Date();
                              const hoursSince6AM = Math.max(0, now.getHours() - 6);
                              const todaysCalories = getTodaysNutritionData()?.calories || 0;
                              if (hoursSince6AM > 0) {
                                return Math.round(todaysCalories / hoursSince6AM);
                              }
                              return 0;
                            })()} kcal/hr
                          </p>
                          <p className="text-xs text-gray-500">Since 6 AM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {/* Trend Visualization Section - Removed Weekly Details to avoid duplication */}
            {false && (
              <div className="space-y-8">
                {/* Weekly Overview Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Weekly Nutrition Summary 📊</h2>
                      <p className="text-blue-100 text-lg">Your nutrition patterns over the past week</p>
                      <p className="text-blue-100 mt-2">Week of: {new Date().toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric' 
                      })}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold">{weeklySummary?.weekTotals?.calories ? Math.round(weeklySummary.weekTotals.calories / 7) : 0}</div>
                      <div className="text-blue-100">Daily Average (kcal)</div>
                    </div>
                  </div>
                </div>

                {/* Weekly Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Calories</p>
                        <p className="text-3xl font-bold text-gray-900">{weeklySummary?.weekTotals?.calories || 0}</p>
                        <p className="text-sm text-gray-500">kcal this week</p>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl">🔥</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Fat</p>
                        <p className="text-3xl font-bold text-gray-900">{weeklySummary?.weekTotals?.fat ? Math.round(weeklySummary.weekTotals.fat * 100) / 100 : 0}</p>
                        <p className="text-sm text-gray-500">grams this week</p>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl">🥑</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Meals</p>
                        <p className="text-3xl font-bold text-gray-900">{weeklySummary?.totalMeals || 0}</p>
                        <p className="text-sm text-gray-500">meals logged</p>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl">🍽️</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Goal Achievement</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {weeklySummary?.weekTotals?.calories ? Math.round((weeklySummary.weekTotals.calories / (getCalorieGoal() * 7)) * 100) : 0}%
                        </p>
                        <p className="text-sm text-gray-500">of weekly goal</p>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl">📈</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Daily Calorie Trend */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Daily Calorie Trend</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={weeklySummary?.dailyData ? Object.entries(weeklySummary.dailyData).map(([date, data]) => ({
                            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                            calories: data?.totals?.calories || 0,
                            goal: getCalorieGoal(),
                            date: date
                          })) : []}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip formatter={(value, name) => [
                            `${value} kcal`, 
                            name === 'calories' ? 'Consumed' : 'Daily Goal'
                          ]} />
                          <Legend />
                          <Bar dataKey="calories" fill="#f97316" name="Consumed" />
                          <Bar dataKey="goal" fill="#e5e7eb" name="Daily Goal" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Macronutrient Distribution */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Weekly Macronutrient Distribution</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Fat', value: (weeklySummary?.weekTotals?.fat || 0) * 9, color: '#ef4444' },
                              { name: 'Protein', value: Math.round((weeklySummary?.weekTotals?.calories || 0) * 0.15), color: '#3b82f6' },
                              { name: 'Carbs', value: Math.round((weeklySummary?.weekTotals?.calories || 0) * 0.55), color: '#10b981' },
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: 'Fat', value: (weeklySummary?.weekTotals?.fat || 0) * 9, color: '#ef4444' },
                              { name: 'Protein', value: Math.round((weeklySummary?.weekTotals?.calories || 0) * 0.15), color: '#3b82f6' },
                              { name: 'Carbs', value: Math.round((weeklySummary?.weekTotals?.calories || 0) * 0.55), color: '#10b981' },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${Math.round(value)} kcal`, 'Calories']} />
                          <Legend formatter={(value) => {
                          if (value.includes('Required')) {
                            return value.split(' ')[0] + ' (Required)';
                          } else if (value.includes('Consumed')) {
                            return value.split(' ')[0] + ' (Consumed)';
                          }
                          return value;
                        }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Daily Breakdown */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Daily Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {weeklySummary?.dailyData ? Object.entries(weeklySummary.dailyData).map(([date, data]) => (
                      <div key={date} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-2">{data?.totals?.calories || 0}</p>
                        <p className="text-xs text-gray-500">calories</p>
                        <p className="text-xs text-gray-400 mt-1">{data?.mealCount || 0} meals</p>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{ width: `${Math.min(((data?.totals?.calories || 0) / getCalorieGoal()) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )) : []}
                  </div>
                </div>

                {/* Weekly Insights */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Weekly Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-600">Average Daily Calories</p>
                      <p className="text-2xl font-bold text-orange-600">{weeklySummary?.weekTotals?.calories ? Math.round(weeklySummary.weekTotals.calories / 7) : 0}</p>
                      <p className="text-xs text-gray-500">vs {getCalorieGoal()} goal</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Most Active Day</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {(() => {
                                                const maxDay = weeklySummary?.dailyData ? Object.entries(weeklySummary.dailyData).reduce((max, [date, data]) =>
                        (data?.totals?.calories || 0) > (max?.calories || 0) ? { date, calories: data?.totals?.calories || 0 } : max
                      , { date: '', calories: 0 }) : { date: '', calories: 0 };
                          return new Date(maxDay.date).toLocaleDateString('en-US', { weekday: 'long' });
                        })()}
                      </p>
                      <p className="text-xs text-gray-500">highest calorie intake</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Consistency Score</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(() => {
                          const avgCalories = (weeklySummary?.weekTotals?.calories || 0) / 7;
                          const goal = getCalorieGoal();
                          const consistency = Math.max(0, 100 - Math.abs((avgCalories - goal) / goal * 100));
                          return Math.round(consistency);
                        })()}%
                      </p>
                      <p className="text-xs text-gray-500">goal adherence</p>
                    </div>
                  </div>
                </div>

                {/* Meal Time Analytics - Weekly (Last 7 Days) */}
                {true ? (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 pb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Meal Time Analytics ⏰ (Last 7 Days)</h3>
                                          <div className="space-y-6 mb-2">
                      {/* Meal Time Distribution */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-4">Meal Time Distribution</h4>
                          <div className="space-y-3">
                            {(() => {
                              const mealTimes = {
                                breakfast: [],
                                lunch: [],
                                dinner: [],
                                snack: []
                              };
                              
                              // Get all meal entries for the last 7 days
                              const ninetyDaysAgo = new Date();
                              ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 7);
                              
                              // This would ideally fetch from API, but for now using current mealEntries
                              // In a real implementation, you'd fetch all meals from the last 90 days
                              mealEntries?.forEach(meal => {
                                if (meal && meal.mealTime && new Date(meal.date) >= ninetyDaysAgo) {
                                  const time = meal.mealTime;
                                  const hour = parseInt(time.split(':')[0]);
                                  mealTimes[meal.mealType]?.push(hour);
                                }
                              });
                              
                              const hasData = Object.values(mealTimes).some(times => times.length > 0);
                              
                              if (!hasData) {
                                return (
                                  <div className="text-center py-8 text-gray-500">
                                    <p>No meal time data available for the last 7 days</p>
                                    <p className="text-sm">Add meals with time to see analytics</p>
                                  </div>
                                );
                              }
                              
                              return Object.entries(mealTimes).map(([type, times]) => {
                                if (times.length === 0) return null;
                                
                                const avgHour = Math.round(times.reduce((sum, h) => sum + h, 0) / times.length);
                                const avgTime = `${avgHour.toString().padStart(2, '0')}:00`;
                                const variance = Math.sqrt(times.reduce((sum, h) => sum + Math.pow(h - avgHour, 2), 0) / times.length);
                                
                                return (
                                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                      <span className="w-3 h-3 rounded-full mr-3 bg-orange-500"></span>
                                      <span className="font-medium text-gray-900 capitalize">{type}</span>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-gray-900">{avgTime}</p>
                                      <p className="text-xs text-gray-500">
                                        {variance > 2 ? '⚠️ Inconsistent' : '✅ Consistent'} 
                                        ({variance.toFixed(1)}h variance)
                                      </p>
                                      <p className="text-xs text-gray-400">{times.length} meals</p>
                                    </div>
                                  </div>
                                );
                              }).filter(Boolean);
                            })()}
                          </div>
                        </div>
                        
                        {/* Analytics Insights */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-4">Analytics Insights</h4>
                          <div className="space-y-4">
                            {(() => {
                              const ninetyDaysAgo = new Date();
                              ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 7);
                              
                              const recentMeals = mealEntries.filter(meal => new Date(meal.date) >= ninetyDaysAgo);
                              const mealsWithTime = recentMeals.filter(meal => meal.mealTime);
                              
                              if (mealsWithTime.length === 0) {
                                return (
                                  <div className="text-center py-8 text-gray-500">
                                    <p>No time data available for insights</p>
                                    <p className="text-sm">Add meals with time to see analytics</p>
                                  </div>
                                );
                              }

                              // Calculate insights
                              const mealTimes = mealsWithTime.map(meal => {
                                const time = meal.mealTime;
                                const hour = parseInt(time.split(':')[0]);
                                const minute = parseInt(time.split(':')[1]);
                                return hour + minute / 60;
                              });

                              const avgMealTime = mealTimes.reduce((sum, time) => sum + time, 0) / mealTimes.length;
                              const earlyMeals = mealTimes.filter(time => time < 10).length;
                              const lateMeals = mealTimes.filter(time => time > 20).length;
                              const regularMeals = mealTimes.filter(time => time >= 10 && time <= 20).length;

                              // Find most active hour
                              const hourCounts = {};
                              mealTimes.forEach(time => {
                                const hour = Math.floor(time);
                                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
                              });
                              const mostActiveHour = Object.entries(hourCounts).reduce((max, [hour, count]) => 
                                count > max.count ? { hour: parseInt(hour), count } : max
                              , { hour: 0, count: 0 });

                              // Calculate consistency score
                              const timeVariance = Math.sqrt(mealTimes.reduce((sum, time) => sum + Math.pow(time - avgMealTime, 2), 0) / mealTimes.length);
                              const consistencyScore = Math.max(0, 100 - (timeVariance * 10));

                              return (
                                <>
                                  {/* Consistency Score */}
                                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-semibold text-gray-900">Meal Time Consistency</h5>
                                      <span className="text-2xl font-bold text-blue-600">{Math.round(consistencyScore)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${consistencyScore}%` }}
                                      ></div>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {consistencyScore > 80 ? 'Excellent consistency' : 
                                       consistencyScore > 60 ? 'Good consistency' : 
                                       consistencyScore > 40 ? 'Moderate consistency' : 'Needs improvement'}
                                    </p>
                                  </div>

                                  {/* Most Active Hour */}
                                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 mb-2">Peak Meal Time</h5>
                                    <div className="flex items-center justify-between">
                                      <span className="text-lg font-bold text-green-600">
                                        {mostActiveHour.hour}:00
                                      </span>
                                      <span className="text-sm text-gray-600">
                                        {mostActiveHour.count} meals
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                      Most frequent meal time in the last 7 days
                                    </p>
                                  </div>

                                  {/* Meal Distribution */}
                                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 mb-3">Meal Time Distribution</h5>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Early Meals (Before 10 AM)</span>
                                        <span className="font-semibold text-purple-600">{earlyMeals}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Regular Hours (10 AM - 8 PM)</span>
                                        <span className="font-semibold text-purple-600">{regularMeals}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Late Meals (After 8 PM)</span>
                                        <span className="font-semibold text-purple-600">{lateMeals}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Recommendations */}
                                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 mb-2">Recommendations</h5>
                                    <div className="space-y-2 text-sm">
                                      {lateMeals > regularMeals * 0.3 && (
                                        <div className="flex items-start">
                                          <span className="text-yellow-600 mr-2">⚠️</span>
                                          <span className="text-gray-700">Consider reducing late-night meals for better digestion</span>
                                        </div>
                                      )}
                                      {earlyMeals < regularMeals * 0.2 && (
                                        <div className="flex items-start">
                                          <span className="text-blue-600 mr-2">💡</span>
                                          <span className="text-gray-700">Try adding more breakfast meals for better metabolism</span>
                                        </div>
                                      )}
                                      {consistencyScore < 60 && (
                                        <div className="flex items-start">
                                          <span className="text-orange-600 mr-2">📅</span>
                                          <span className="text-gray-700">Establish more regular meal times for better routine</span>
                                        </div>
                                      )}
                                      {consistencyScore > 80 && (
                                        <div className="flex items-start">
                                          <span className="text-green-600 mr-2">🎉</span>
                                          <span className="text-gray-700">Excellent meal timing consistency! Keep it up</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        

                      </div>
                      
                      {/* Meal Time Chart */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-3">
                           <h4 className="font-medium text-gray-900 mb-4">Daily Meal Pattern (Last 7 Days)</h4>
                          <div className="h-72">
                          {(() => {
                            const ninetyDaysAgo = new Date();
                            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 7);
                            
                            const filteredMeals = mealEntries.filter(meal => {
                              return new Date(meal.date) >= ninetyDaysAgo;
                            });
                            
                            if (filteredMeals.length === 0) {
                              return (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                  <div className="text-center">
                                    <p>No meal data available for the last 7 days</p>
                                    <p className="text-sm">Add meals to see the pattern</p>
                                  </div>
                                </div>
                              );
                            }
                            
                              // Create detailed meal data by hour and meal type
                              const timeSlots = Array.from({ length: 24 }, (_, i) => i);
                              const mealDataByHour = timeSlots.map(hour => {
                                const mealsInHour = filteredMeals.filter(meal => {
                                  let mealHour = 12;
                                    if (meal.mealTime) {
                                    mealHour = parseInt(meal.mealTime.split(':')[0]);
                                    } else {
                                      switch (meal.mealType) {
                                      case 'breakfast': mealHour = 8; break;
                                      case 'lunch': mealHour = 13; break;
                                      case 'dinner': mealHour = 19; break;
                                      case 'snack': mealHour = 15; break;
                                      default: mealHour = 12;
                                    }
                                  }
                                  return mealHour === hour;
                                });
                                
                                // Group by meal type
                                const breakfastCount = mealsInHour.filter(meal => meal.mealType === 'breakfast').length;
                                const lunchCount = mealsInHour.filter(meal => meal.mealType === 'lunch').length;
                                const dinnerCount = mealsInHour.filter(meal => meal.mealType === 'dinner').length;
                                const snackCount = mealsInHour.filter(meal => meal.mealType === 'snack').length;
                                    
                                    return {
                                  hour: hour,
                                  breakfast: breakfastCount,
                                  lunch: lunchCount,
                                  dinner: dinnerCount,
                                  snack: snackCount,
                                  total: mealsInHour.length,
                                  avgCalories: mealsInHour.length > 0 ? Math.round(mealsInHour.reduce((sum, meal) => sum + (meal.calories || 0), 0) / mealsInHour.length) : 0
                                };
                              });
                              
                              return (
                                <ResponsiveContainer width="100%" height="100%">
                                  <ComposedChart
                                    data={mealDataByHour}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                  <XAxis 
                                      dataKey="hour" 
                                      tickFormatter={(value) => `${value}:00`}
                                      label={{ value: 'Time of Day', position: 'insideBottom', offset: -10, style: { fontSize: '12px', fontWeight: 'bold' } }}
                                      tick={{ fontSize: 11 }}
                                  />
                                  <YAxis 
                                      label={{ value: 'Number of Meals', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fontWeight: 'bold' } }}
                                      tick={{ fontSize: 11 }}
                                  />
                                  <Tooltip 
                                    formatter={(value, name, props) => [
                                        `${value} meals`, 
                                        name.charAt(0).toUpperCase() + name.slice(1)
                                      ]}
                                      labelFormatter={(label) => `Time: ${label}:00`}
                                      contentStyle={{ 
                                        backgroundColor: 'white', 
                                        border: '1px solid #ccc',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                      }}
                                    />
                                    <Legend 
                                      verticalAlign="top" 
                                      height={36}
                                      wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    
                                    {/* Stacked bars for meal types */}
                                    <Bar dataKey="breakfast" stackId="a" fill="#FF6B6B" radius={[4, 0, 0, 4]} />
                                    <Bar dataKey="lunch" stackId="a" fill="#4ECDC4" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="dinner" stackId="a" fill="#45B7D1" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="snack" stackId="a" fill="#96CEB4" radius={[0, 4, 4, 0]} />
                                    
                                    {/* Trend line for total meals */}
                                    <Line 
                                      type="monotone" 
                                      dataKey="total" 
                                      stroke="#FF8C42" 
                                      strokeWidth={3}
                                      dot={{ fill: '#FF8C42', strokeWidth: 2, r: 4 }}
                                      activeDot={{ r: 6, stroke: '#FF8C42', strokeWidth: 2, fill: '#fff' }}
                                    />
                                  </ComposedChart>
                              </ResponsiveContainer>
                            );
                          })()}
                        </div>
                        
                        {/* Top 10 Most Frequent Meals Table */}
                        <div className="mt-4">
                           <h4 className="font-medium text-gray-900 mb-2">Top 10 Most Frequent Meals (Last 7 Days)</h4>
                          <div className="h-32">
                            {(() => {
                              const ninetyDaysAgo = new Date();
                              ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 7);
                              
                              const filteredMeals = mealEntries.filter(meal => {
                                return new Date(meal.date) >= ninetyDaysAgo;
                              });
                              
                              if (filteredMeals.length === 0) {
                                return (
                                  <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                      <p>No meal data available for the last 7 days</p>
                                      <p className="text-sm">Add meals to see frequent meal analysis</p>
                      </div>
                                  </div>
                                );
                              }
                              
                              // Count frequency of each food item
                              const foodFrequency = {};
                              filteredMeals.forEach(meal => {
                                const foodName = meal.foodName;
                                if (foodFrequency[foodName]) {
                                  foodFrequency[foodName]++;
                                } else {
                                  foodFrequency[foodName] = 1;
                                }
                              });
                              
                              // Convert to array and sort by frequency (descending), take top 10
                              const topFoods = Object.entries(foodFrequency)
                                .map(([foodName, count]) => ({ foodName, count }))
                                .sort((a, b) => b.count - a.count)
                                .slice(0, 10);
                              
                              const totalMeals = filteredMeals.length;
                              
                              return (
                                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="text-left py-1.5 px-2 font-semibold text-gray-700 w-8">Rank</th>
                                        <th className="text-left py-1.5 px-2 font-semibold text-gray-700 w-40">Food Item</th>
                                        <th className="text-center py-1.5 px-1 font-semibold text-gray-700 w-12">Count</th>
                                        <th className="text-center py-1.5 px-1 font-semibold text-gray-700 w-16">Total Kcal</th>
                                        <th className="text-center py-1.5 px-1 font-semibold text-gray-700 w-16">Total Fat (G)</th>
                                        <th className="text-center py-1.5 px-1 font-semibold text-gray-700 w-16">Total Chol. (MG)</th>
                                        <th className="text-center py-1.5 px-2 font-semibold text-gray-700 w-20">%</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {topFoods.map((food, index) => {
                                        const percentage = totalMeals > 0 ? ((food.count / totalMeals) * 100).toFixed(1) : 0;
                                        const colors = [
                                          'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
                                          'bg-pink-500', 'bg-indigo-500', 'bg-orange-500', 'bg-teal-500', 'bg-cyan-500'
                                        ];
                                        
                                        return (
                                          <tr key={food.foodName} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-1 px-2 w-8">
                                              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                                                {index + 1}
                                              </div>
                                            </td>
                                            <td className="py-1 px-2 font-medium text-gray-700 w-40 truncate" title={food.foodName}>
                                              {food.foodName}
                                            </td>
                                            <td className="py-1 px-1 text-center font-semibold text-gray-800 text-xs w-12">
                                              {food.count}
                                            </td>
                                            <td className="py-1 px-1 text-center text-xs text-gray-600 w-16">
                                              {(() => {
                                                // Try multiple matching strategies for user-added meals
                                                const foodData = foodDatabase.find(f => {
                                                  const dbName = f.name.toLowerCase();
                                                  const mealName = food.foodName.toLowerCase();
                                                  
                                                  // Exact match
                                                  if (dbName === mealName) return true;
                                                  
                                                  // Contains match (either direction)
                                                  if (dbName.includes(mealName) || mealName.includes(dbName)) return true;
                                                  
                                                  // First word match
                                                  if (dbName.split(' ')[0] === mealName.split(' ')[0]) return true;
                                                  
                                                  // Common food name variations
                                                  const commonMatches = {
                                                    'greek yogurt': ['yogurt', 'curd', 'dahi'],
                                                    'salmon': ['fish', 'salmon'],
                                                    'cottage cheese': ['paneer', 'cheese'],
                                                    'milk': ['doodh', 'milk'],
                                                    'chicken breast': ['chicken', 'murgh'],
                                                    'oatmeal': ['oats', 'dalia'],
                                                    'sweet potato': ['shakarkand', 'potato'],
                                                    'eggs': ['egg', 'anda'],
                                                    'bread': ['roti', 'bread']
                                                  };
                                                  
                                                  for (const [key, variations] of Object.entries(commonMatches)) {
                                                    if (variations.some(v => mealName.includes(v) || dbName.includes(v))) {
                                                      return true;
                                                    }
                                                  }
                                                  
                                                  return false;
                                                });
                                                
                                                return foodData ? ((foodData.calories || 0) * (food.count || 0)).toFixed(0) : '--';
                                              })()}
                                            </td>
                                            <td className="py-1 px-1 text-center text-xs text-gray-600 w-16">
                                              {(() => {
                                                // Try multiple matching strategies for user-added meals
                                                const foodData = foodDatabase.find(f => {
                                                  const dbName = f.name.toLowerCase();
                                                  const mealName = food.foodName.toLowerCase();
                                                  
                                                  // Exact match
                                                  if (dbName === mealName) return true;
                                                  
                                                  // Contains match (either direction)
                                                  if (dbName.includes(mealName) || mealName.includes(dbName)) return true;
                                                  
                                                  // First word match
                                                  if (dbName.split(' ')[0] === mealName.split(' ')[0]) return true;
                                                  
                                                  // Common food name variations
                                                  const commonMatches = {
                                                    'greek yogurt': ['yogurt', 'curd', 'dahi'],
                                                    'salmon': ['fish', 'salmon'],
                                                    'cottage cheese': ['paneer', 'cheese'],
                                                    'milk': ['doodh', 'milk'],
                                                    'chicken breast': ['chicken', 'murgh'],
                                                    'oatmeal': ['oats', 'dalia'],
                                                    'sweet potato': ['shakarkand', 'potato'],
                                                    'eggs': ['egg', 'anda'],
                                                    'bread': ['roti', 'bread']
                                                  };
                                                  
                                                  for (const [key, variations] of Object.entries(commonMatches)) {
                                                    if (variations.some(v => mealName.includes(v) || dbName.includes(v))) {
                                                      return true;
                                                    }
                                                  }
                                                  
                                                  return false;
                                                });
                                                
                                                return foodData ? (foodData.fat * food.count).toFixed(1) : '--';
                                              })()}
                                            </td>
                                            <td className="py-1 px-1 text-center text-xs text-gray-600 w-16">
                                              {(() => {
                                                // Try multiple matching strategies for user-added meals
                                                const foodData = foodDatabase.find(f => {
                                                  const dbName = f.name.toLowerCase();
                                                  const mealName = food.foodName.toLowerCase();
                                                  
                                                  // Exact match
                                                  if (dbName === mealName) return true;
                                                  
                                                  // Contains match (either direction)
                                                  if (dbName.includes(mealName) || mealName.includes(dbName)) return true;
                                                  
                                                  // First word match
                                                  if (dbName.split(' ')[0] === mealName.split(' ')[0]) return true;
                                                  
                                                  // Common food name variations
                                                  const commonMatches = {
                                                    'greek yogurt': ['yogurt', 'curd', 'dahi'],
                                                    'salmon': ['fish', 'salmon'],
                                                    'cottage cheese': ['paneer', 'cheese'],
                                                    'milk': ['doodh', 'milk'],
                                                    'chicken breast': ['chicken', 'murgh'],
                                                    'oatmeal': ['oats', 'dalia'],
                                                    'sweet potato': ['shakarkand', 'potato'],
                                                    'eggs': ['egg', 'anda'],
                                                    'bread': ['roti', 'bread']
                                                  };
                                                  
                                                  for (const [key, variations] of Object.entries(commonMatches)) {
                                                    if (variations.some(v => mealName.includes(v) || dbName.includes(v))) {
                                                      return true;
                                                    }
                                                  }
                                                  
                                                  return false;
                                                });
                                                
                                                return foodData ? (foodData.cholesterol * food.count).toFixed(0) : '--';
                                              })()}
                                            </td>
                                            <td className="py-1 px-2 text-center w-20">
                                              <div className="flex items-center justify-center space-x-1">
                                                <div className="w-8 bg-gray-200 rounded-full h-1.5">
                                                  <div 
                                                    className={`${colors[index % colors.length]} h-1.5 rounded-full transition-all duration-300`}
                                                    style={{ width: `${percentage}%` }}
                                                  ></div>
                                                </div>
                                                <span className="text-xs font-medium text-gray-700 min-w-[2rem]">
                                                  {percentage}%
                                                </span>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                        {/* Meal Pattern Insights */}
                        <div className="lg:col-span-1">
                          <h4 className="font-medium text-gray-900 mb-3">Pattern Insights</h4>
                          <div className="space-y-3">
                            {(() => {
                              const ninetyDaysAgo = new Date();
                              ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 7);
                              
                              const filteredMeals = mealEntries.filter(meal => {
                                return new Date(meal.date) >= ninetyDaysAgo;
                              });
                              
                              if (filteredMeals.length === 0) {
                                return (
                                  <div className="text-center py-8 text-gray-500">
                                    <p>No data available</p>
                                  </div>
                                );
                              }

                              // Calculate insights
                              const mealTypeCounts = {
                                breakfast: filteredMeals.filter(meal => meal.mealType === 'breakfast').length,
                                lunch: filteredMeals.filter(meal => meal.mealType === 'lunch').length,
                                dinner: filteredMeals.filter(meal => meal.mealType === 'dinner').length,
                                snack: filteredMeals.filter(meal => meal.mealType === 'snack').length
                              };

                              const totalMeals = filteredMeals.length;
                              const avgMealsPerDay = (totalMeals / 90).toFixed(1);
                              
                              // Find peak hours
                              const hourCounts = {};
                              filteredMeals.forEach(meal => {
                                let hour = 12;
                                if (meal.mealTime) {
                                  hour = parseInt(meal.mealTime.split(':')[0]);
                                } else {
                                  switch (meal.mealType) {
                                    case 'breakfast': hour = 8; break;
                                    case 'lunch': hour = 13; break;
                                    case 'dinner': hour = 19; break;
                                    case 'snack': hour = 15; break;
                                  }
                                }
                                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
                              });

                              const peakHour = Object.entries(hourCounts).reduce((max, [hour, count]) => 
                                count > max.count ? { hour: parseInt(hour), count } : max
                              , { hour: 0, count: 0 });

                              // Calculate meal distribution percentages
                              const breakfastPct = ((mealTypeCounts.breakfast / totalMeals) * 100).toFixed(1);
                              const lunchPct = ((mealTypeCounts.lunch / totalMeals) * 100).toFixed(1);
                              const dinnerPct = ((mealTypeCounts.dinner / totalMeals) * 100).toFixed(1);
                              const snackPct = ((mealTypeCounts.snack / totalMeals) * 100).toFixed(1);

                              return (
                                <>
                                  {/* Meal Distribution Summary */}
                                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 mb-2">Meal Distribution</h5>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                          <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                                          <span className="text-sm text-gray-700">Breakfast</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{breakfastPct}%</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                          <div className="w-3 h-3 rounded-full bg-teal-400 mr-2"></div>
                                          <span className="text-sm text-gray-700">Lunch</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{lunchPct}%</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                          <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                                          <span className="text-sm text-gray-700">Dinner</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{dinnerPct}%</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                          <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                                          <span className="text-sm text-gray-700">Snack</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{snackPct}%</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Key Statistics */}
                                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 mb-2">Key Statistics</h5>
                                    <div className="space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Meals</span>
                                        <span className="font-semibold text-gray-900">{totalMeals}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Avg/Day</span>
                                        <span className="font-semibold text-gray-900">{avgMealsPerDay}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Peak Hour</span>
                                        <span className="font-semibold text-gray-900">{peakHour.hour}:00</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                          <span className="text-sm text-gray-600">Peak Count</span>
                                          <button 
                                            className="ml-1 text-blue-500 hover:text-blue-700 transition-colors"
                                            title="Peak Count represents the number of meals consumed at the most frequent meal time in the last 90 days"
                                          >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                          </button>
                                        </div>
                                        <span className="font-semibold text-gray-900">{peakHour.count}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Meal Type Analysis */}
                                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 mb-2">Quick Tips</h5>
                                    <div className="space-y-1 text-xs">
                                      {mealTypeCounts.breakfast < mealTypeCounts.lunch * 0.5 && (
                                        <div className="flex items-start">
                                          <span className="text-blue-600 mr-1">💡</span>
                                          <span className="text-gray-700">Add more breakfast meals</span>
                                        </div>
                                      )}
                                      {mealTypeCounts.snack > mealTypeCounts.dinner && (
                                        <div className="flex items-start">
                                          <span className="text-yellow-600 mr-1">⚠️</span>
                                          <span className="text-gray-700">High snack consumption</span>
                                        </div>
                                      )}
                                      {avgMealsPerDay < 2.5 && (
                                        <div className="flex items-start">
                                          <span className="text-orange-600 mr-1">📊</span>
                                          <span className="text-gray-700">More regular meal timing</span>
                                        </div>
                                      )}
                                      {avgMealsPerDay > 4 && (
                                        <div className="flex items-start">
                                          <span className="text-green-600 mr-1">🎯</span>
                                          <span className="text-gray-700">Good meal frequency</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Additional Metrics */}
                                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-3 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 mb-2">Optimal Meal Times</h5>
                                    <div className="space-y-1 text-xs">
                                      {/* Meal Timing Recommendations */}
                                      <div>
                                        <div className="space-y-1">
                                          <div className="flex items-start space-x-1">
                                            <span className="font-medium text-blue-600 min-w-[45px] text-xs">Breakfast:</span>
                                            <span className="text-gray-700 text-xs">7:00 AM - 9:00 AM</span>
                                          </div>
                                          <div className="text-gray-500 text-xs ml-[49px] -mt-1">
                                            Eat within 1-2 hours of waking for metabolism
                                          </div>
                                          
                                          <div className="flex items-start space-x-1">
                                            <span className="font-medium text-green-600 min-w-[45px] text-xs">Lunch:</span>
                                            <span className="text-gray-700 text-xs">12:30 PM - 2:30 PM</span>
                                          </div>
                                          <div className="text-gray-500 text-xs ml-[49px] -mt-1">
                                            4-5 hour gap from breakfast for digestion
                                          </div>
                                          
                                          <div className="flex items-start space-x-1">
                                            <span className="font-medium text-orange-600 min-w-[45px] text-xs">Dinner:</span>
                                            <span className="text-gray-700 text-xs">6:00 PM - 8:00 PM</span>
                                          </div>
                                          <div className="text-gray-500 text-xs ml-[49px] -mt-1">
                                            2-3 hours before bedtime for better sleep
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>



                    </div>
                  </div>
                ) : null}

                {/* Historical Meal Logs */}
                {mealEntries?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Historical Meal Logs 📋</h3>
                  <div className="overflow-x-auto flex-1">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fat (g)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cholesterol (mg)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getFilteredMeals()
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice((currentPage - 1) * 10, currentPage * 10)
                            .map((meal, index) => (
                              <tr key={meal._id || index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {new Date(meal.date).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {meal.mealTime || '--:--'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div>
                                    <div className="font-medium">{meal.foodName}</div>
                                    {meal.notes && (
                                      <div className="text-xs text-gray-500 italic">{meal.notes}</div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {parseFloat(meal.quantity).toFixed(2)} {meal.unit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    meal.mealType === 'breakfast' ? 'bg-yellow-100 text-yellow-800' :
                                    meal.mealType === 'lunch' ? 'bg-orange-100 text-orange-800' :
                                    meal.mealType === 'dinner' ? 'bg-purple-100 text-purple-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">
                                  {meal.calories || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                  {meal.fat}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                                  {meal.cholesterol}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex space-x-2">
                                    {canEditMeal(meal) ? (
                                  <button
                                        onClick={() => handleEditMeal(meal)}
                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                        title="Edit meal"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                    ) : (
                                      <span className="text-gray-400 cursor-not-allowed" title="Can only edit meals from today or yesterday">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </span>
                                    )}
                                    <button
                                      onClick={() => handleDeleteMeal(meal)}
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                      title="Delete meal"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {getFilteredMeals().length > 10 && (
                      <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, getFilteredMeals().length)} of {getFilteredMeals().length} meals
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <span className="px-3 py-1 text-sm text-gray-700">
                            Page {currentPage} of {Math.ceil(getFilteredMeals().length / 10)}
                          </span>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(getFilteredMeals().length / 10), prev + 1))}
                            disabled={currentPage === Math.ceil(getFilteredMeals().length / 10)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Recent Meals - Bottom Section with Period Tabs and Aggregation */}
            {Array.isArray(mealEntries) && mealEntries.length > 0 && (
              <div className="mt-10">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Recent Meals</h3>
                    <button onClick={() => setShowAddMealPopup(true)} className="text-orange-600 hover:text-orange-700 font-medium">Add meal</button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      { id: 'today', label: 'Today' },
                      { id: 'yesterday', label: 'Yesterday' },
                      { id: '7', label: 'Last 7 Days' },
                      { id: '15', label: '15 Days' },
                      { id: '30', label: '30 Days' },
                      { id: '60', label: '60 Days' },
                      { id: '90', label: '90 Days' },
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => setRecentPeriod(p.id)}
                        className={`px-3 py-1.5 rounded-full text-sm border ${recentPeriod === p.id ? 'bg-orange-100 text-orange-700 border-orange-200' : 'text-gray-600 hover:text-gray-900 border-gray-200 hover:bg-gray-50'}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const now = new Date();
                    let start = new Date(now);
                    let end = new Date(now);
                    start.setHours(0,0,0,0);
                    end.setHours(23,59,59,999);
                    if (recentPeriod === 'yesterday') {
                      start.setDate(start.getDate() - 1);
                      end.setDate(end.getDate() - 1);
                    } else if (['7','15','30','60','90'].includes(recentPeriod)) {
                      start.setDate(start.getDate() - (parseInt(recentPeriod, 10) - 1));
                    }

                    const inRange = (d) => {
                      // Normalize incoming date string 'YYYY-MM-DD' without timezone shifts
                      const dateStr = typeof d === 'string' && d.length >= 10 ? d.slice(0,10) : new Date(d).toISOString().slice(0,10);
                      const s = new Date(start); s.setHours(0,0,0,0);
                      const e = new Date(end); e.setHours(23,59,59,999);
                      const dd = new Date(dateStr + 'T12:00:00');
                      return dd >= s && dd <= e;
                    };

                    const filtered = [...(mealEntries || [])]
                      .filter(m => inRange(m.date))
                      .sort((a,b) => (b.date || '').localeCompare(a.date || '') || (b.mealTime || '').localeCompare(a.mealTime || ''));

                    // Aggregation per day for non-today/yesterday ranges
                    const showAggregates = !['today', 'yesterday'].includes(recentPeriod);
                    let aggregates = [];
                    if (showAggregates) {
                      const byDate = new Map();
                      filtered.forEach(m => {
                        const key = new Date(m.date).toISOString().slice(0,10);
                        if (!byDate.has(key)) byDate.set(key, { date: key, calories: 0, fat: 0, protein: 0, carbs: 0, cholesterol: 0, count: 0, meals: [] });
                        const acc = byDate.get(key);
                        acc.calories += m.calories || 0;
                        acc.fat += m.fat || 0;
                        acc.protein += m.protein || 0;
                        acc.carbs += m.carbs || 0;
                        acc.cholesterol += m.cholesterol || 0;
                        acc.count += 1;
                        acc.meals.push(m);
                      });
                      aggregates = Array.from(byDate.values()).sort((a,b) => new Date(b.date) - new Date(a.date));
                    }

                    return (
                      <div className="mt-6">
                        {showAggregates ? (
                          <div className="space-y-4">
                            {(() => {
                              const pageSize = 5;
                              const totalPages = Math.max(1, Math.ceil(aggregates.length / pageSize));
                              const safePage = Math.min(recentPage, totalPages);
                              const startIdx = (safePage - 1) * pageSize;
                              const pageItems = aggregates.slice(startIdx, startIdx + pageSize);
                              return (
                                <>
                                  {pageItems.map((d) => {
                                  const isOpen = !!expandedDates[d.date];
                                  const idxInAgg = aggregates.findIndex(a => a.date === d.date);
                                  const prevAgg = idxInAgg >= 0 && idxInAgg + 1 < aggregates.length ? aggregates[idxInAgg + 1] : null;
                                  const calDelta = prevAgg ? d.calories - (prevAgg.calories || 0) : 0;
                                  const proteinDelta = prevAgg ? Math.round((d.protein - (prevAgg.protein || 0)) * 10) / 10 : 0;
                                  const calDeltaClass = calDelta > 0 ? 'text-red-600' : calDelta < 0 ? 'text-green-600' : 'text-gray-500';
                                  const proteinDeltaClass = proteinDelta > 0 ? 'text-red-600' : proteinDelta < 0 ? 'text-green-600' : 'text-gray-500';
                                  return (
                                    <div key={d.date} className="border rounded-lg transition hover:shadow-md">
                                  <button
                                    onClick={() => setExpandedDates(prev => ({ ...prev, [d.date]: !prev[d.date] }))}
                                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 rounded-lg"
                                    aria-expanded={isOpen}
                                  >
                                    <div className="text-left">
                                      <p className="font-semibold text-gray-900">{new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                          <p className="text-xs text-gray-500">
                                            {d.count} meals • Fat {Math.round(d.fat*10)/10}g • Protein {Math.round(d.protein*10)/10}g • Carbs {Math.round(d.carbs*10)/10}g
                                          </p>
                                    </div>
                                        {/* Middle delta chips */}
                                        <div className="flex items-center space-x-3">
                                          {(() => {
                                            const calChip = `px-2 py-0.5 rounded-full text-xs font-semibold ${calDelta > 0 ? 'bg-red-100 text-red-700' : calDelta < 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`;
                                            const protChip = `px-2 py-0.5 rounded-full text-xs font-semibold ${proteinDelta > 0 ? 'bg-red-100 text-red-700' : proteinDelta < 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`;
                                            const calArrow = calDelta > 0 ? '▲' : calDelta < 0 ? '▼' : '•';
                                            const protArrow = proteinDelta > 0 ? '▲' : proteinDelta < 0 ? '▼' : '•';
                                            return (
                                              <>
                                                <span className={calChip}>{`${calArrow} ${calDelta > 0 ? '+' : calDelta < 0 ? '' : ''}${calDelta} kcal`}</span>
                                                <span className={protChip}>{`${protArrow} ${proteinDelta > 0 ? '+' : proteinDelta < 0 ? '' : ''}${proteinDelta}g protein`}</span>
                                              </>
                                            );
                                          })()}
                                        </div>
                                    <div className="flex items-center space-x-3">
                                      <p className="text-sm text-gray-600">Calories</p>
                                          <div className="text-right">
                                            <p className="text-lg font-bold text-orange-600">{d.calories}</p>
                                          </div>
                                      <span className={`transform transition ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
                                    </div>
                                  </button>
                                  {isOpen && (
                                    <div className="px-4 pb-4 divide-y divide-gray-100">
                                      {d.meals
                                        .sort((a,b) => (a.mealTime || '').localeCompare(b.mealTime || ''))
                                        .map((meal, idx) => (
                                          <div key={meal._id || idx} className="py-3 flex items-center justify-between">
                                            <div>
                                              <p className="text-sm font-medium text-gray-900">{meal.foodName}</p>
                                              <p className="text-xs text-gray-500">{meal.mealType?.charAt(0).toUpperCase() + meal.mealType?.slice(1)} • {meal.mealTime || '--:--'}</p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                              <span className="text-sm text-gray-600">{parseFloat(meal.quantity).toFixed(0)} {meal.unit}</span>
                                              <span className="font-semibold text-orange-600">{meal.calories || 0} cal</span>
                                              {(recentPeriod === 'today' || recentPeriod === 'yesterday') && (
                                                <button onClick={() => handleEditMeal(meal)} className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                                  {/* Pagination */}
                                  {aggregates.length > pageSize && (
                                    <div className="flex items-center justify-between pt-2">
                                      <p className="text-xs text-gray-500">Page {Math.min(recentPage, Math.ceil(aggregates.length / pageSize))} of {Math.ceil(aggregates.length / pageSize)}</p>
                                      <div className="space-x-2">
                                        <button
                                          className="px-3 py-1.5 text-sm border rounded disabled:opacity-50"
                                          onClick={() => setRecentPage(p => Math.max(1, p - 1))}
                                          disabled={recentPage <= 1}
                                        >
                                          Prev
                                        </button>
                                        <button
                                          className="px-3 py-1.5 text-sm border rounded disabled:opacity-50"
                                          onClick={() => setRecentPage(p => Math.min(Math.ceil(aggregates.length / pageSize), p + 1))}
                                          disabled={recentPage >= Math.ceil(aggregates.length / pageSize)}
                                        >
                                          Next
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {[...(filtered || [])]
                              .sort((a, b) => (b.mealTime || '00:00').localeCompare(a.mealTime || '00:00'))
                              .map((meal, idx) => {
                              const mealDate = new Date(meal.date);
                              const mealDateStr = mealDate.toISOString().slice(0,10);
                              const todayStr = new Date().toISOString().slice(0,10);
                              const isToday = mealDateStr === todayStr;
                              const isLatest = idx === 0;
                              return (
                                <div key={meal._id || idx} className="py-3 flex items-center justify-between">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center space-x-3">
                                      <p className="font-medium text-gray-900 truncate">{meal.foodName}</p>
                                      <div className="flex items-center space-x-2">
                                        {recentPeriod === 'today' && isLatest && (
                                          <span className="text-[10px] uppercase tracking-wide bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Latest</span>
                                        )}
                                        {isToday && <span className="text-[10px] uppercase tracking-wide bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Today</span>}
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {meal.mealType?.charAt(0).toUpperCase() + meal.mealType?.slice(1) || 'Meal'} • {meal.mealTime || '--:--'} • {mealDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">{parseFloat(meal.quantity).toFixed(0)} {meal.unit}</span>
                                    <span className="font-semibold text-orange-600">{meal.calories || 0} cal</span>
                                    <span className="text-xs text-gray-500">{Math.round((meal.protein||0)*10)/10}g protein</span>
                                    <span className="text-xs text-gray-500">{Math.round((meal.carbs||0)*10)/10}g carbs</span>
                                    {(recentPeriod === 'today' || recentPeriod === 'yesterday') && (
                                      <button onClick={() => handleEditMeal(meal)} className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {filtered.length === 0 && (
                              <div className="py-6 text-center text-sm text-gray-500">No meals in this period</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Meal Tab - Removed to fix errors */}
        {false && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Add New Meal 🍽️</h2>
                  <p className="text-green-100 text-lg">Track your nutrition intake</p>
                  <p className="text-green-100 mt-2">Date: {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{dailySummary?.totals.calories || 0}</div>
                  <div className="text-green-100">Calories Today</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Food Selection Panel */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <FaSearch className="text-blue-600 text-sm" />
                  </span>
                  Select Food
                </h3>
                
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for food items..."
                      value={searchTerm || ''}
                      onChange={(e) => setSearchTerm(e.target.value || '')}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                  
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                    <select
                      value={selectedCategory || 'all'}
                      onChange={(e) => setSelectedCategory(e.target.value || 'all')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Categories</option>
                      {categories?.map((category) => (
                        <option key={category || 'unknown'} value={category || 'unknown'}>{category || 'Unknown'}</option>
                      ))}
                    </select>
                  </div>

                  {/* Food List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(() => {
                      const filteredFoods = foodDatabase?.filter(food => {
                        if (!food || !food.name) return false;
                        const searchLower = (searchTerm || '').toLowerCase();
                        const categoryMatch = selectedCategory === 'all' || food.category === selectedCategory;
                        return (food.name.toLowerCase().includes(searchLower) ||
                               (food.hinglish && food.hinglish.toLowerCase().includes(searchLower))) && categoryMatch;
                      }) || [];
                      
                      return filteredFoods.map((food, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedFood?.name === food?.name
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedFood(food);
                          setSelectedFoodForHistory(food?.name || '');
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{food?.name || 'Unknown Food'}</h4>
                            <p className="text-xs text-gray-500 italic">{food?.hinglish || ''}</p>
                            <div className="flex items-center mt-1 space-x-3">
                              <span className="text-xs font-semibold text-orange-600">{(food?.calories || 0)} cal</span>
                              <span className="text-xs text-red-600">{(food?.fat || 0)}g fat</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                (food?.cholesterol || 0) <= 50 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {(food?.cholesterol || 0)}mg ❤️
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {food?.category || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ));
                    })()}
                  </div>

                  {/* Recent Meal History for Selected Food (show latest 3) */}
                  {selectedFoodForHistory && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3 text-sm">Recent History for "{selectedFoodForHistory}"</h4>
                      <div className="space-y-2">
                        {[...(mealEntries || [])]
                          .filter(meal => meal.foodName === selectedFoodForHistory)
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .slice(0, 3)
                          .map((meal, index) => {
                            const mealDate = new Date(meal.date);
                            const mealDateStr = mealDate.toISOString().slice(0, 10);
                            const todayStr = new Date().toISOString().slice(0, 10);
                            const isToday = mealDateStr === todayStr;
                            const isLatest = index === 0;
                            return (
                              <div key={index} className="p-2 bg-gray-50 rounded text-xs flex items-center justify-between">
                                <div className="min-w-0">
                                  <div className="flex items-center space-x-2">
                                <span className="text-gray-600">
                                      {mealDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                    {isLatest && (<span className="text-[10px] uppercase bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">Latest</span>)}
                                    {isToday && (<span className="text-[10px] uppercase bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Today</span>)}
                              </div>
                                  <div className="text-gray-500 mt-1 truncate">
                                {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)} • {meal.mealTime || '--:--'}
                              </div>
                            </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-gray-500">{parseFloat(meal.quantity).toFixed(0)} {meal.unit}</span>
                                  <span className="font-semibold text-orange-600">{meal?.calories || 0} cal</span>
                          </div>
                              </div>
                            );
                          })}
                        {([...(mealEntries || [])].filter(meal => meal.foodName === selectedFoodForHistory).length === 0) && (
                          <div className="text-center py-2 text-gray-500 text-xs">No previous entries for this food</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Meal Details Panel */}
              <div className="space-y-6">
                {selectedFood ? (
                  <>
                    {/* Selected Food Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <FaPlus className="text-green-600 text-sm" />
                        </span>
                        Selected Food
                      </h3>
                      
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{selectedFood.name}</h4>
                            {selectedFood.hinglish && (
                              <p className="text-sm text-gray-600 italic">{selectedFood.hinglish}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">{selectedFood.category}</p>
                          </div>
                          <div className="text-right">
                                                          <p className="text-2xl font-bold text-green-600">{(selectedFood?.calories || 0)} cal</p>
                            <p className="text-sm text-gray-500">per 100g</p>
                          </div>
                        </div>
                      </div>

                      {/* Nutrition Chart */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Nutrition Breakdown</h4>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Fat', value: selectedFood?.fat || 0, color: '#ef4444' },
                                  { name: 'Protein', value: Math.round(((selectedFood?.calories || 0)) * 0.15 / 4), color: '#3b82f6' },
                                  { name: 'Carbs', value: Math.round((((selectedFood?.calories || 0)) - (((selectedFood?.fat || 0)) * 9) - (Math.round(((selectedFood?.calories || 0)) * 0.15 / 4) * 4)) / 4), color: '#10b981' },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}g`}
                              >
                                {[
                                  { name: 'Fat', value: selectedFood?.fat || 0, color: '#ef4444' },
                                  { name: 'Protein', value: Math.round(((selectedFood?.calories || 0)) * 0.15 / 4), color: '#3b82f6' },
                                  { name: 'Carbs', value: Math.round((((selectedFood?.calories || 0)) - (((selectedFood?.fat || 0)) * 9) - (Math.round(((selectedFood?.calories || 0)) * 0.15 / 4) * 4)) / 4), color: '#10b981' },
                                ].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`${value}g`, 'Amount']} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Meal Details Form */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quantity
                            </label>
                            <input
                              type="number"
                              value={quantity || ''}
                              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.1"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Unit
                            </label>
                            <select
                              value={unit || ''}
                              onChange={(e) => setUnit(e.target.value || '')}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Unit</option>
                              <option value="grams">grams</option>
                              <option value="cups">cups</option>
                              <option value="tsp">tsp</option>
                              <option value="tbsp">tbsp</option>
                              <option value="ml">ml</option>
                              <option value="pieces">pieces</option>
                              <option value="slices">slices</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meal Type
                          </label>
                          <select
                            value={mealType || ''}
                            onChange={(e) => setMealType(e.target.value || '')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Meal Type</option>
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="snack">Snack</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                          </label>
                          <textarea
                            value={notes || ''}
                            onChange={(e) => setNotes(e.target.value || '')}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add any notes about this meal..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Nutrition Preview */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Nutrition Preview</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-gray-600 text-sm">Calories</p>
                          <p className="text-xl font-bold text-orange-600">
                            {(() => {
                              if (!selectedFood || quantity <= 0) return 0;
                              // Convert units to grams for calculation
                              let gramsEquivalent = quantity;
                              if (unit === 'cups') gramsEquivalent = quantity * 240; // 1 cup = 240g
                              else if (unit === 'tsp') gramsEquivalent = quantity * 5; // 1 tsp = 5g
                              else if (unit === 'tbsp') gramsEquivalent = quantity * 15; // 1 tbsp = 15g
                              else if (unit === 'ml') gramsEquivalent = quantity; // 1ml ≈ 1g for most foods
                              else if (unit === 'pieces') gramsEquivalent = quantity * 50; // 1 piece ≈ 50g
                              else if (unit === 'slices') gramsEquivalent = quantity * 30; // 1 slice ≈ 30g
                              
                              return Math.round((selectedFood.calories || 0) * gramsEquivalent / 100);
                            })()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 text-sm">Fat (g)</p>
                          <p className="text-xl font-bold text-red-600">
                            {(() => {
                              if (!selectedFood || quantity <= 0) return 0;
                              let gramsEquivalent = quantity;
                              if (unit === 'cups') gramsEquivalent = quantity * 240;
                              else if (unit === 'tsp') gramsEquivalent = quantity * 5;
                              else if (unit === 'tbsp') gramsEquivalent = quantity * 15;
                              else if (unit === 'ml') gramsEquivalent = quantity;
                              else if (unit === 'pieces') gramsEquivalent = quantity * 50;
                              else if (unit === 'slices') gramsEquivalent = quantity * 30;
                              
                              return ((selectedFood.fat || 0) * gramsEquivalent / 100).toFixed(1);
                            })()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 text-sm">Cholesterol (mg)</p>
                          <p className="text-xl font-bold text-yellow-600">
                            {(() => {
                              if (!selectedFood || quantity <= 0) return 0;
                              let gramsEquivalent = quantity;
                              if (unit === 'cups') gramsEquivalent = quantity * 240;
                              else if (unit === 'tsp') gramsEquivalent = quantity * 5;
                              else if (unit === 'tbsp') gramsEquivalent = quantity * 15;
                              else if (unit === 'ml') gramsEquivalent = quantity;
                              else if (unit === 'pieces') gramsEquivalent = quantity * 50;
                              else if (unit === 'slices') gramsEquivalent = quantity * 30;
                              
                              return Math.round((selectedFood.cholesterol || 0) * gramsEquivalent / 100);
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        await handleAddMeal();
                        setShowAddMealPopup(false);
                        setSelectedFood(null);
                        setQuantity(1);
                        setUnit('grams');
                        setMealType('breakfast');
                        setMealTime('');
                        setNotes('');
                        setSearchTerm(''); // Clear search term
                      }}
                      disabled={loading}
                      className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Adding Meal...
                        </span>
                      ) : (
                        'Add Meal'
                      )}
                    </button>
                  </>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaSearch className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Food</h3>
                    <p className="text-gray-600">Search and select a food item from the list to add it to your meal diary.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Food Database Tab */}
        {activeTab === 'food-database' && (
          <>
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
                {/* Quick Edit Manager moved below table */}
                {/* Add Food CTA */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setShowAddFood(true)}
                    className="inline-flex items-center px-3 py-2 text-sm rounded-md bg-orange-600 text-white hover:bg-orange-700"
                  >
                    + Add Food
                  </button>
                </div>

                {/* Add Food Modal */}
                {showAddFood && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Add Custom Food</h3>
                        <button onClick={() => setShowAddFood(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-700 mb-1">Food Item</label>
                          <input value={newFood.name} onChange={e=>setNewFood(prev=>({...prev,name:e.target.value}))} className="w-full px-3 py-2 border rounded-md" placeholder="e.g., Almonds (roasted)" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Quantity</label>
                          <input type="number" step="0.01" value={newFood.quantity} onChange={e=>setNewFood(prev=>({...prev,quantity:e.target.value}))} className="w-full px-3 py-2 border rounded-md" placeholder="e.g., 1" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Unit</label>
                          <select value={newFood.unit} onChange={e=>setNewFood(prev=>({...prev,unit:e.target.value}))} className="w-full px-3 py-2 border rounded-md">
                            <option value="">Select Unit</option>
                            <option value="grams">grams</option>
                            <option value="cups">cups</option>
                            <option value="tsp">tsp</option>
                            <option value="tbsp">tbsp</option>
                            <option value="ml">ml</option>
                            <option value="pieces">pieces</option>
                            <option value="slices">slices</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Category</label>
                          <select value={newFood.category} onChange={e=>setNewFood(prev=>({...prev,category:e.target.value}))} className="w-full px-3 py-2 border rounded-md">
                            {[...new Set([...(categories||[]), 'Fruit', 'Cold Drinks', 'Juice', 'Other'])].map(c => (<option key={c} value={c}>{c}</option>))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Calories (kcal)
                            <button type="button" className="ml-1 text-gray-400" title="Use values provided by your nutritionist or trusted internet sources.">ⓘ</button>
                          </label>
                          <input type="number" value={newFood.calories} onChange={e=>setNewFood(prev=>({...prev,calories:e.target.value}))} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Fat (g)
                            <button type="button" className="ml-1 text-gray-400" title="Use values provided by your nutritionist or trusted internet sources.">ⓘ</button>
                          </label>
                          <input type="number" step="0.1" value={newFood.fat} onChange={e=>setNewFood(prev=>({...prev,fat:e.target.value}))} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Cholesterol (mg)
                            <button type="button" className="ml-1 text-gray-400" title="Use values provided by your nutritionist or trusted internet sources.">ⓘ</button>
                          </label>
                          <input type="number" value={newFood.cholesterol} onChange={e=>setNewFood(prev=>({...prev,cholesterol:e.target.value}))} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end space-x-2">
                        <button onClick={()=>setShowAddFood(false)} className="px-4 py-2 text-sm rounded-md border">Cancel</button>
                        <button
                          onClick={async ()=>{
                            try{
                              const storedUser = JSON.parse(localStorage.getItem('currentUser')||'{}');
                              const userId = (currentUser?.id||currentUser?._id||storedUser?.id||storedUser?._id);
                              if(!userId){ console.error('No user id'); return; }
                              if(!newFood.name || !newFood.category) return;
                              await foodAPI.addUserFood({ userId, ...newFood, calories:Number(newFood.calories), fat:Number(newFood.fat), cholesterol:Number(newFood.cholesterol), quantity: newFood.quantity? Number(newFood.quantity): null, unit: newFood.unit||'' });
                              toast.success('New food item added');
                              setShowAddFood(false);
                              setNewFood({ name:'', category: categories?.[0]||'Beverages', calories:'', fat:'', cholesterol:'', quantity:'', unit:'' });
                              // Refresh list with userId to include custom food
                              const response = await api.get('/meals/food-database', { params: { userId } });
                              if(response.data?.success){
                                setFoodDatabase(response.data.data.foods);
                                setCategories(response.data.data.categories);
                                // Jump to first page so the user sees their item immediately
                                setCurrentPage(1);
                              }
                            }catch(err){
                              console.error('Add food failed', err);
                            }
                          }}
                          className="px-4 py-2 text-sm rounded-md bg-orange-600 text-white hover:bg-orange-700"
                        >
                          Save Food
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                    <span className="ml-3 text-gray-600">Loading food database...</span>
                  </div>
                ) : (
                  <>
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Edit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Pin user foods to the top of page 1 */}
                        {(() => {
                          const userFirst = (foods) => {
                            const userFoods = foods.filter(f => f.isUserFood);
                            const others = foods.filter(f => !f.isUserFood);
                            return [...userFoods, ...others];
                          };
                          const pageItems = currentPage === 1 ? userFirst(paginatedFoods) : paginatedFoods;
                          return pageItems.map((food, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className="text-sm font-medium text-gray-900">{food.displayName || food.name}</div>
                                {food.isUserFood && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">Only for you</span>
                                )}
                                {!food.isUserFood && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">Default</span>
                                )}
                              </div>
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
                              {food?.calories || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {food?.fat || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                (food?.cholesterol || 0) <= 50
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {food?.cholesterol || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {food.isUserFood ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                    className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                                    onClick={() => {
                                      setShowAddFood(true);
                                      setNewFood({
                                        name: food.name,
                                        category: food.category,
                                        calories: String(food.calories||''),
                                        fat: String(food.fat||''),
                                        cholesterol: String(food.cholesterol||''),
                                        quantity: String(food.quantity||''),
                                        unit: food.unit||''
                                      });
                                    }}
                                  >Edit</button>
                                  <button
                                    className="px-2 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50"
                                    onClick={() => { setFoodPendingDelete(food); setShowDeleteConfirm(true); }}
                                  >Delete</button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                            {/* Quick Edit action button (Food Database page) */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {(() => {
                                const inQuick = quickEditFoods.find(q => q.name === (food.displayName || food.name));
                                const canAdd = quickEditFoods.length < 10 && !inQuick;
                                return (
                                  <button
                                    className={`inline-flex items-center px-2 py-1 text-xs rounded ${canAdd ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                    disabled={!canAdd}
                                    onClick={() => {
                                      if (!canAdd) return;
                                      setQuickEditFoods(prev => [...prev, { name: (food.displayName || food.name) }]);
                                      toast.success('Added to Quick Edit');
                                    }}
                                    title={inQuick ? 'Already in Quick Edit' : (quickEditFoods.length >= 10 ? 'Quick Edit is full (10 items)' : 'Add to Quick Edit')}
                                  >
                                    <FaRegStar className="mr-1" /> Add
                                  </button>
                                );
                              })()}
                            </td>
                          </tr>
                          ));
                        })()}
                      </tbody>
                    </table>

                    {/* Quick Edit Manager moved outside the Food Database container */}

                    {/* Beautiful Delete Confirmation Modal */}
                    {showDeleteConfirm && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                          <div className="flex items-start space-x-3">
                            <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold">!</div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900">Delete food item?</h4>
                              <p className="text-sm text-gray-600 mt-1">Do you really want to delete <span className="font-bold text-gray-900">{foodPendingDelete?.displayName || foodPendingDelete?.name}</span>? This action cannot be undone.</p>
                            </div>
                          </div>
                          <div className="mt-6 flex justify-end space-x-3">
                            <button
                              className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
                              onClick={() => { setShowDeleteConfirm(false); setFoodPendingDelete(null); }}
                            >Cancel</button>
                            <button
                              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                              onClick={async () => {
                                try {
                                  const toDelete = foodPendingDelete;
                                  setShowDeleteConfirm(false);
                                  setFoodPendingDelete(null);
                                  await api.delete(`/meals/food/${toDelete._id}`);
                                  toast.success('Food item deleted');
                                  const storedUser = JSON.parse(localStorage.getItem('currentUser')||'{}');
                                  const userId = (currentUser?.id||currentUser?._id||storedUser?.id||storedUser?._id);
                                  const resp = await api.get('/meals/food-database', { params: { userId } });
                                  if(resp.data?.success){
                                    setFoodDatabase(resp.data.data.foods);
                                    setCategories(resp.data.data.categories);
                                    setCurrentPage(1);
                                  }
                                } catch(e){ console.error('Delete user food failed', e); }
                              }}
                            >Delete</button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Enhanced Pagination Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                      {/* Page Info */}
                      <div className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredFoods.length)} of {filteredFoods.length} foods
                      </div>
                      
                      {/* Pagination Buttons */}
                      <div className="flex items-center space-x-2">
                        {/* First Page */}
                        <button
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        >
                          First
                        </button>
                        
                        {/* Previous Page */}
                        <button
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="flex items-center space-x-1">
                          {(() => {
                            const pages = [];
                            const maxVisiblePages = 7;
                            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                            
                            if (endPage - startPage + 1 < maxVisiblePages) {
                              startPage = Math.max(1, endPage - maxVisiblePages + 1);
                            }
                            
                            // Add first page and ellipsis if needed
                            if (startPage > 1) {
                              pages.push(
                                <button
                                  key={1}
                                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                  onClick={() => setCurrentPage(1)}
                                >
                                  1
                                </button>
                              );
                              if (startPage > 2) {
                                pages.push(
                                  <span key="ellipsis1" className="px-2 text-gray-500">
                                    ...
                                  </span>
                                );
                              }
                            }
                            
                            // Add visible page numbers
                            for (let i = startPage; i <= endPage; i++) {
                              pages.push(
                                <button
                                  key={i}
                                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    currentPage === i
                                      ? 'bg-orange-600 text-white border border-orange-600'
                                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                  }`}
                                  onClick={() => setCurrentPage(i)}
                                >
                                  {i}
                                </button>
                              );
                            }
                            
                            // Add last page and ellipsis if needed
                            if (endPage < totalPages) {
                              if (endPage < totalPages - 1) {
                                pages.push(
                                  <span key="ellipsis2" className="px-2 text-gray-500">
                                    ...
                                  </span>
                                );
                              }
                              pages.push(
                                <button
                                  key={totalPages}
                                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                  onClick={() => setCurrentPage(totalPages)}
                                >
                                  {totalPages}
                                </button>
                              );
                            }
                            
                            return pages;
                          })()}
                        </div>
                        
                        {/* Next Page */}
                        <button
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                        
                        {/* Last Page */}
                        <button
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                        >
                          Last
                        </button>
                      </div>
                      
                      {/* Fixed at 10 records per page */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Showing 10 records per page</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Edit Manager (outside of the table container) */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-orange-800">Quick Edit List</h4>
                <span className="text-xs text-orange-700">{quickEditFoods.length}/10</span>
              </div>
              {quickEditFoods.length === 0 ? (
                <p className="text-sm text-orange-700">Add items using the “Add” buttons in the Food Database table above. You can add up to 10 and reorder them here.</p>
              ) : (
                <div className="space-y-2">
                  {quickEditFoods.map((q, idx) => (
                    <div key={q.name} className="flex items-center justify-between bg-white rounded border border-orange-200 px-3 py-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{q.name}</span>
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-600 hover:text-gray-800 disabled:opacity-40" disabled={idx===0} onClick={() => setQuickEditFoods(prev => { const arr=[...prev]; const t=arr[idx]; arr[idx]=arr[idx-1]; arr[idx-1]=t; return arr; })}><FaArrowUp /></button>
                        <button className="text-gray-600 hover:text-gray-800 disabled:opacity-40" disabled={idx===quickEditFoods.length-1} onClick={() => setQuickEditFoods(prev => { const arr=[...prev]; const t=arr[idx]; arr[idx]=arr[idx+1]; arr[idx+1]=t; return arr; })}><FaArrowDown /></button>
                        <button className="text-red-600 hover:text-red-700" onClick={() => setQuickEditFoods(prev => prev.filter((_,i)=>i!==idx))}><FaTimes /></button>
                      </div>
                    </div>
                  ))}
          </div>
              )}
            </div>
          </div>
          </>
        )}

        {/* Nutrition Info Tab */}
        {activeTab === 'nutrition-info' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Nutrition Information</h2>
            <div className="flex flex-col space-y-6">
              {/* Energy Expenditure (4 columns, high to low) */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Expenditure</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Activity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Energy (kcal/hr)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Activity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Energy (kcal/hr)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(() => {
                        const sorted = [...energyExpenditure].sort((a,b) => b.energy - a.energy);
                        const rows = [];
                        for (let i = 0; i < sorted.length; i += 2) {
                          const a = sorted[i];
                          const b = sorted[i+1];
                          rows.push(
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-normal text-sm font-medium text-gray-900 break-words">{a?.activity || ''}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{a?.energy ?? ''}</td>
                              <td className="px-4 py-3 whitespace-normal text-sm font-medium text-gray-900 break-words">{b?.activity || ''}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{b?.energy ?? ''}</td>
                            </tr>
                          );
                        }
                        return rows;
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Standard Portions (right of Energy Expenditure) */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Standard Portions</h3>
                <div>
                  <table className="min-w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Food Group</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Portion (g)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Energy (kcal)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Protein (g)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Carbs (g)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Fat (g)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {standardPortions.map((portion, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-normal text-sm font-medium text-gray-900 break-words">{portion.foodGroup}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{portion.portion}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{portion.energy}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{portion.protein}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{portion.carbs}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{portion.fat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dietary Allowances */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dietary Allowances</h3>
                <div>
                  <table className="min-w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                          Group
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                          Weight (kg)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                          Energy (kcal)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                          Protein (g)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                          Fat (g)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                          Calcium (mg)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                          Iron (mg)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dietaryAllowances.map((group, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-normal text-sm font-medium text-gray-900 break-words">
                            {group.group}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {group.weight}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {group.energy}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {group.protein}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {group.fat}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {group.calcium}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {group.iron}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>


              {/* Glycemic Index – explainer with right sidebar */}
              <div className="bg-white p-6 rounded-lg shadow-sm border md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Glycemic Index (GI)</h3>
                <div className="grid grid-cols-1 gap-6">
                  {/* Main GI explainer */}
                  <div>
                    <p className="text-sm text-gray-700 mb-4">GI is a 0–100 scale that shows how fast a carbohydrate food raises blood sugar compared to pure glucose (GI 100). High‑GI foods act quickly and can spike glucose; low‑GI foods are slower and steadier.</p>

                    {/* Visual scale */}
                    <div className="mb-6">
                      <div className="relative h-3 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500">
                        <span className="absolute -top-6 left-0 text-xs font-medium text-green-700">Low ≤ 55</span>
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-yellow-700">Medium 56–69</span>
                        <span className="absolute -top-6 right-0 text-xs font-medium text-red-700">High ≥ 70</span>
                </div>
              </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* How it works */}
                      <div className="bg-gray-50 rounded-md p-5 border">
                        <p className="text-sm font-semibold text-gray-900 mb-3">How it works</p>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2"><FaInfoCircle className="mt-0.5 text-gray-500"/><span><span className="font-medium">Carbohydrates only:</span> GI applies to carb‑containing foods.</span></li>
                          <li className="flex items-start gap-2"><FaInfoCircle className="mt-0.5 text-gray-500"/><span><span className="font-medium">Reference food:</span> Glucose is GI 100.</span></li>
                          <li className="flex items-start gap-2"><FaInfoCircle className="mt-0.5 text-gray-500"/><span><span className="font-medium">Ranking:</span> A food with GI 70 raises blood sugar ~30% less than glucose.</span></li>
                          <li className="flex items-start gap-2"><FaInfoCircle className="mt-0.5 text-gray-500"/><span className="flex flex-wrap items-center gap-2"><span className="font-medium">Categories:</span>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">Low ≤ 55</span>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">Medium 56–69</span>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">High ≥ 70</span>
                          </span></li>
                        </ul>
                      </div>

                      {/* Factors affecting GI */}
                      <div className="bg-gray-50 rounded-md p-5 border">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Factors affecting GI</p>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          <li>Processing and refinement</li>
                          <li>Fiber content</li>
                          <li>Cooking method (e.g., cook and cool rice to lower GI)</li>
                          <li>Ripeness of fruits/vegetables</li>
                          <li>Fat and protein with the meal</li>
                        </ul>
                      </div>

                      {/* Why it’s important */}
                      <div className="bg-gray-50 rounded-md p-5 border">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Why is GI important?</p>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2"><FaCheckCircle className="mt-0.5 text-green-600"/><span>Helpful for blood sugar management</span></li>
                          <li className="flex items-start gap-2"><FaCheckCircle className="mt-0.5 text-green-600"/><span>May support weight management via better satiety</span></li>
                          <li className="flex items-start gap-2"><FaCheckCircle className="mt-0.5 text-green-600"/><span>Fits within a balanced, nutrient‑dense eating pattern</span></li>
                        </ul>
                      </div>

                      {/* Important considerations */}
                      <div className="bg-gray-50 rounded-md p-5 border">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Important considerations</p>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2"><FaInfoCircle className="mt-0.5 text-gray-500"/><span>GI is one input. Also consider portions, nutrients, and overall diet quality.</span></li>
                          <li className="flex items-start gap-2"><FaInfoCircle className="mt-0.5 text-gray-500"/><span>Individual responses vary; track how foods affect you.</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glycemic Index – table with right sidebar (symmetric cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2 items-stretch">
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Glycemic Index</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Food
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Glycemic Index (GI)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {glycemicIndex.map((food, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {food.food}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {food.gi}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </div>
                <aside className="bg-gray-50 rounded-lg shadow-sm p-6 border h-full flex flex-col">
                  <p className="text-sm font-semibold text-gray-900 mb-4">Low‑GI friendly choices</p>
                  <div className="space-y-3 mb-4 flex-1 overflow-auto">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Fruits</p>
                      <div className="flex flex-wrap gap-2">
                        {['Apples','Berries','Oranges','Lemons','Limes','Grapefruit'].map(i=> <span key={i} className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{i}</span>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Non‑starchy vegetables</p>
                      <div className="flex flex-wrap gap-2">
                        {['Broccoli','Cauliflower','Carrots','Spinach','Tomatoes'].map(i=> <span key={i} className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-800 border border-green-200">{i}</span>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Whole grains</p>
                      <div className="flex flex-wrap gap-2">
                        {['Quinoa','Barley','Buckwheat','Farro','Oats'].map(i=> <span key={i} className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">{i}</span>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Legumes</p>
                      <div className="flex flex-wrap gap-2">
                        {['Lentils','Black beans','Chickpeas','Kidney beans'].map(i=> <span key={i} className="px-2 py-1 text-xs rounded-full bg-teal-50 text-teal-800 border border-teal-200">{i}</span>)}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-gray-900 mb-2">Very low / no‑GI foods</p>
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Meat & poultry</p>
                      <div className="flex flex-wrap gap-2">
                        {['Beef','Bison','Lamb','Pork','Chicken','Turkey','Duck','Goose'].map(i=> <span key={i} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{i}</span>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Seafood</p>
                      <div className="flex flex-wrap gap-2">
                        {['Tuna','Salmon','Shrimp','Mackerel','Anchovies','Sardines'].map(i=> <span key={i} className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-800 border border-blue-200">{i}</span>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Oils, nuts, seeds</p>
                      <div className="flex flex-wrap gap-2">
                        {['Olive oil','Coconut oil','Avocado oil','Vegetable oil','Almonds','Macadamia','Walnuts','Pistachios','Chia','Sesame','Hemp','Flax'].map(i=> <span key={i} className="px-2 py-1 text-xs rounded-full bg-amber-50 text-amber-800 border border-amber-200">{i}</span>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Herbs & spices</p>
                      <div className="flex flex-wrap gap-2">
                        {['Turmeric','Black pepper','Cumin','Dill','Basil','Rosemary','Cinnamon'].map(i=> <span key={i} className="px-2 py-1 text-xs rounded-full bg-purple-50 text-purple-800 border border-purple-200">{i}</span>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Some pastas</p>
                      <div className="flex flex-wrap gap-2">
                        {['Semolina pasta','Whole‑grain pasta'].map(i=> <span key={i} className="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">{i}</span>)}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-gray-900 mb-2">Limit high‑GI foods</p>
                  <div className="space-y-3">
                    {[
                      {title:'Bread', items:['White bread','Bagels','Naan','Pita bread']},
                      {title:'Rice', items:['White rice','Jasmine rice','Arborio rice']},
                      {title:'Cereals', items:['Instant oats','Breakfast cereals']},
                      {title:'Starchy vegetables', items:['Mashed potatoes','Potatoes','French fries']},
                      {title:'Baked goods', items:['Cake','Doughnuts','Cookies','Croissants','Muffins']},
                      {title:'Snacks', items:['Chocolate','Crackers','Microwave popcorn','Chips','Pretzels']},
                      {title:'Sugary drinks', items:['Soda','Fruit juice','Sports drinks']}
                    ].map(section => (
                      <div key={section.title} className="">
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{section.title}</p>
                        <div className="flex flex-wrap gap-2">
                          {section.items.map(i=> <span key={i} className="px-2 py-1 text-xs rounded-full bg-red-50 text-red-800 border border-red-200">{i}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </div>
          </div>
        )}

        {/* Weekly View Tab */}
        {activeTab === 'weekly' && weeklySummary && (
          <div className="space-y-8">
            {/* Weekly Overview Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Weekly Nutrition Summary 📊</h2>
                  <p className="text-blue-100 text-lg">Your nutrition patterns over the past week (Last 7 days)</p>
                  <p className="text-blue-100 mt-2">Week of: {new Date().toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric' 
                  })}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{weeklySummary?.weekTotals?.calories ? Math.round(weeklySummary.weekTotals.calories / 7) : 0}</div>
                  <div className="text-blue-100">Daily Average (kcal)</div>
                </div>
              </div>
            </div>

            {/* Weekly Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Calories</p>
                    <p className="text-3xl font-bold text-gray-900">{weeklySummary?.weekTotals?.calories || 0}</p>
                    <p className="text-sm text-gray-500">kcal this week</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">🔥</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Fat</p>
                    <p className="text-3xl font-bold text-gray-900">{weeklySummary?.weekTotals?.fat ? Math.round(weeklySummary.weekTotals.fat * 100) / 100 : 0}</p>
                    <p className="text-sm text-gray-500">grams this week</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">🥑</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Meals</p>
                    <p className="text-3xl font-bold text-gray-900">{weeklySummary.totalMeals}</p>
                    <p className="text-sm text-gray-500">meals logged</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">🍽️</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Goal Achievement</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {weeklySummary?.weekTotals?.calories ? Math.round((weeklySummary.weekTotals.calories / (getCalorieGoal() * 7)) * 100) : 0}%
                    </p>
                    <p className="text-sm text-gray-500">of weekly goal</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">📈</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Calorie Trend */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Daily Calorie Trend (This Week)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={weeklySummary?.dailyData ? Object.entries(weeklySummary.dailyData).map(([date, data]) => {
                        const goal = getCalorieGoal();
                        const consumed = data?.totals?.calories || 0;
                        const deficit = goal - consumed;
                        const deficitPercentage = goal > 0 ? ((deficit / goal) * 100) : 0;
                        
                        return {
                        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                          calories: consumed,
                          goal: goal,
                          deficit: deficit,
                          deficitPercentage: deficitPercentage,
                        date: date
                        };
                      }) : []}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[-100, 100]} />
                      <ReferenceLine yAxisId="right" y={0} stroke="#666" strokeDasharray="3 3" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'deficitPercentage') {
                            const percentage = parseFloat(value);
                            return [`${percentage.toFixed(2)}%`, 'Deficit %'];
                          }
                          if (name === 'calories') {
                            return [`${value} kcal`, 'Kcal Consumed'];
                          }
                          if (name === 'goal') {
                            return [`${value} kcal`, 'Req. Kcal'];
                          }
                          return [`${value} kcal`, name];
                        }}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="calories" fill="#f97316" name="Consumed" />
                      <Bar yAxisId="left" dataKey="goal" fill="#e5e7eb" name="Daily Goal" />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="deficitPercentage" 
                        stroke="#dc2626" 
                        strokeWidth={3}
                        dot={{ fill: '#dc2626', strokeWidth: 2, r: 5 }}
                        name="deficitPercentage"
                        connectNulls={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Macronutrient Distribution */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Weekly Macronutrient Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Fat', value: (weeklySummary?.weekTotals?.fat || 0) * 9, color: '#ef4444' },
                          { name: 'Protein', value: Math.round((weeklySummary?.weekTotals?.calories || 0) * 0.15), color: '#3b82f6' },
                          { name: 'Carbs', value: Math.round((weeklySummary?.weekTotals?.calories || 0) * 0.55), color: '#10b981' },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Fat', value: (weeklySummary?.weekTotals?.fat || 0) * 9, color: '#ef4444' },
                          { name: 'Protein', value: Math.round((weeklySummary?.weekTotals?.calories || 0) * 0.15), color: '#3b82f6' },
                          { name: 'Carbs', value: Math.round((weeklySummary?.weekTotals?.calories || 0) * 0.55), color: '#10b981' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${Math.round(value)} kcal`, 'Calories']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Daily Breakdown */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Daily Breakdown (This Week)</h3>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weeklySummary?.dailyData ? Object.entries(weeklySummary.dailyData).map(([date, data]) => (
                  <div key={date} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-2">{data?.totals?.calories || 0}</p>
                    <p className="text-xs text-gray-500">calories</p>
                    <p className="text-xs text-gray-400 mt-1">{data?.mealCount || 0} meals</p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${Math.min(((data?.totals?.calories || 0) / getCalorieGoal()) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )) : []}
              </div>
            </div>

            {/* Weekly Insights */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Weekly Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Average Daily Calories</p>
                  <p className="text-2xl font-bold text-orange-600">{weeklySummary?.weekTotals?.calories ? Math.round(weeklySummary.weekTotals.calories / 7) : 0}</p>
                  <p className="text-xs text-gray-500">vs {getCalorieGoal()} goal</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Most Active Day</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(() => {
                      const maxDay = weeklySummary?.dailyData ? Object.entries(weeklySummary.dailyData).reduce((max, [date, data]) => 
                        (data?.totals?.calories || 0) > (max?.calories || 0) ? { date, calories: data?.totals?.calories || 0 } : max
                      , { date: '', calories: 0 }) : { date: '', calories: 0 };
                      return new Date(maxDay.date).toLocaleDateString('en-US', { weekday: 'long' });
                    })()}
                  </p>
                  <p className="text-xs text-gray-500">highest calorie intake</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Consistency Score</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(() => {
                      const avgCalories = (weeklySummary?.weekTotals?.calories || 0) / 7;
                      const goal = getCalorieGoal();
                      const consistency = Math.max(0, 100 - Math.abs((avgCalories - goal) / goal * 100));
                      return Math.round(consistency);
                    })()}%
                  </p>
                  <p className="text-xs text-gray-500">goal adherence</p>
                </div>
              </div>
            </div>

            {/* Weekly charts shown above; 90-day analytics moved to Monthly View */}
            {false && mealEntries?.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Meal Time Analytics ⏰ (Last 90 Days)</h3>
                <div className="space-y-6">
                  {/* Meal Time Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Meal Time Distribution</h4>
                      <div className="space-y-3">
                        {(() => {
                          const mealTimes = {
                            breakfast: [],
                            lunch: [],
                            dinner: [],
                            snack: []
                          };
                          
                          // Get all meal entries for the last 90 days
                          const ninetyDaysAgo = new Date();
                          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                          
                          // This would ideally fetch from API, but for now using current mealEntries
                          // In a real implementation, you'd fetch all meals from the last 90 days
                          mealEntries?.forEach(meal => {
                            if (meal && meal.mealTime && new Date(meal.date) >= ninetyDaysAgo) {
                              const time = meal.mealTime;
                              const hour = parseInt(time.split(':')[0]);
                              mealTimes[meal.mealType]?.push(hour);
                            }
                          });
                          
                          const hasData = Object.values(mealTimes).some(times => times.length > 0);
                          
                          if (!hasData) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                <p>No meal time data available for the last 90 days</p>
                                <p className="text-sm">Add meals with time to see analytics</p>
                              </div>
                            );
                          }
                          
                          return Object.entries(mealTimes).map(([type, times]) => {
                            if (times.length === 0) return null;
                            
                            const avgHour = Math.round(times.reduce((sum, h) => sum + h, 0) / times.length);
                            const avgTime = `${avgHour.toString().padStart(2, '0')}:00`;
                            const variance = Math.sqrt(times.reduce((sum, h) => sum + Math.pow(h - avgHour, 2), 0) / times.length);
                            
                            return (
                              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                  <span className="w-3 h-3 rounded-full mr-3 bg-orange-500"></span>
                                  <span className="font-medium text-gray-900 capitalize">{type}</span>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-900">{avgTime}</p>
                                  <p className="text-xs text-gray-500">
                                    {variance > 2 ? '⚠️ Inconsistent' : '✅ Consistent'} 
                                    ({variance.toFixed(1)}h variance)
                                  </p>
                                  <p className="text-xs text-gray-400">{times.length} meals</p>
                                </div>
                              </div>
                            );
                          }).filter(Boolean);
                        })()}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Meal Timing Insights (90 Days)</h4>
                      <div className="space-y-3">
                        {(() => {
                          const insights = [];
                          
                          // Check for inconsistent meal times
                          const mealTimes = {
                            breakfast: [],
                            lunch: [],
                            dinner: [],
                            snack: []
                          };
                          
                          const ninetyDaysAgo = new Date();
                          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                          
                          // Debug: Log meal entries to see what data we have
                                                            console.log('Total meal entries:', mealEntries?.length || 0);
                                                      console.log('Meal entries with mealTime:', mealEntries?.filter(meal => meal.mealTime)?.length || 0);
                          
                          mealEntries?.forEach(meal => {
                            if (meal && meal.mealTime && new Date(meal.date) >= ninetyDaysAgo) {
                              const time = meal.mealTime;
                              const hour = parseInt(time.split(':')[0]);
                              if (!isNaN(hour) && meal.mealType && mealTimes[meal.mealType]) {
                                mealTimes[meal.mealType].push(hour);
                              }
                            }
                          });
                          
                          // Debug: Log meal times data
                          console.log('Meal times by type:', mealTimes);
                          
                          // Check if we have any meal times data at all
                          const totalMealsWithTime = Object.values(mealTimes).reduce((sum, times) => sum + times.length, 0);
                          
                          if (totalMealsWithTime === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                <p>No meal timing data available for the last 90 days</p>
                                <p className="text-sm mt-2">Add meals with time to get insights</p>
                                <div className="mt-4 text-xs text-gray-400">
                                  <p>Debug info:</p>
                                  <p>Total meals: {mealEntries?.length || 0}</p>
                                  <p>Meals with time: {mealEntries?.filter(meal => meal.mealTime)?.length || 0}</p>
                                  <p>Meals in last 90 days: {mealEntries?.filter(meal => new Date(meal.date) >= ninetyDaysAgo)?.length || 0}</p>
                                </div>
                              </div>
                            );
                          }
                          
                          Object.entries(mealTimes).forEach(([type, times]) => {
                            if (times.length > 1) {
                              const avgHour = times.reduce((sum, h) => sum + h, 0) / times.length;
                              const variance = Math.sqrt(times.reduce((sum, h) => sum + Math.pow(h - avgHour, 2), 0) / times.length);
                              
                              if (variance > 2) {
                                insights.push({
                                  type: type,
                                  message: `Your ${type} times vary by ~${Math.round(variance)} hours over 90 days`,
                                  severity: 'warning'
                                });
                              } else {
                                insights.push({
                                  type: type,
                                  message: `Great! Your ${type} times are consistent over 90 days`,
                                  severity: 'success'
                                });
                              }
                            } else if (times.length === 1) {
                              insights.push({
                                type: type,
                                message: `Only 1 ${type} recorded in the last 90 days at ${times[0]}:00`,
                                severity: 'info'
                              });
                            }
                          });
                          
                          // If no insights were generated, show a general message
                          if (insights.length === 0) {
                            insights.push({
                              type: 'general',
                              message: `You have ${totalMealsWithTime} meals with time data in the last 90 days`,
                              severity: 'info'
                            });
                          }
                          
                          return insights.map((insight, index) => (
                            <div key={index} className={`p-3 rounded-lg ${
                              insight.severity === 'warning' 
                                ? 'bg-yellow-50 border border-yellow-200' 
                                : insight.severity === 'success'
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-blue-50 border border-blue-200'
                            }`}>
                              <div className="flex items-center">
                                <span className={`mr-2 ${
                                  insight.severity === 'warning' ? 'text-yellow-600' : 
                                  insight.severity === 'success' ? 'text-green-600' : 'text-blue-600'
                                }`}>
                                  {insight.severity === 'warning' ? '⚠️' : 
                                   insight.severity === 'success' ? '✅' : 'ℹ️'}
                                </span>
                                <p className={`text-sm ${
                                  insight.severity === 'warning' ? 'text-yellow-800' : 
                                  insight.severity === 'success' ? 'text-green-800' : 'text-blue-800'
                                }`}>
                                  {insight.message}
                                </p>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Meal Time Chart */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Daily Meal Pattern (Last 90 Days)</h4>
                    <div className="h-80">
                      {(() => {
                        const ninetyDaysAgo = new Date();
                        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                        
                        const filteredMeals = mealEntries.filter(meal => {
                          return new Date(meal.date) >= ninetyDaysAgo;
                        });
                        
                        if (filteredMeals.length === 0) {
                          return (
                            <div className="flex items-center justify-center h-full text-gray-500">
                              <div className="text-center">
                                <p>No meal data available for the last 90 days</p>
                                <p className="text-sm">Add meals to see the pattern</p>
                              </div>
                            </div>
                          );
                        }
                        
                        // Process data for different meal types
                        const mealTypeData = {
                          breakfast: [],
                          lunch: [],
                          dinner: [],
                          snack: []
                        };
                        
                        filteredMeals.forEach(meal => {
                          let timeInHours = 12;
                          
                          if (meal.mealTime) {
                            const time = meal.mealTime;
                            const hour = parseInt(time.split(':')[0]);
                            const minute = parseInt(time.split(':')[1]);
                            timeInHours = hour + minute / 60;
                          } else {
                            switch (meal.mealType) {
                              case 'breakfast': timeInHours = 8; break;
                              case 'lunch': timeInHours = 13; break;
                              case 'dinner': timeInHours = 19; break;
                              case 'snack': timeInHours = 15; break;
                              default: timeInHours = 12;
                            }
                          }
                          
                          const dataPoint = {
                            time: timeInHours,
                            mealType: meal.mealType,
                            calories: meal?.calories || 0,
                            x: timeInHours,
                                                          y: meal?.calories || 0,
                            hasTime: !!meal.mealTime,
                            foodName: meal.foodName
                          };
                          
                          if (mealTypeData[meal.mealType]) {
                            mealTypeData[meal.mealType].push(dataPoint);
                          }
                        });
                        
                        return (
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart
                              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis 
                                type="number" 
                                dataKey="x" 
                                domain={[0, 24]}
                                tickFormatter={(value) => `${Math.floor(value)}:00`}
                                label={{ value: 'Time of Day', position: 'insideBottom', offset: -10 }}
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis 
                                dataKey="y"
                                label={{ value: 'Calories', angle: -90, position: 'insideLeft' }}
                                tick={{ fontSize: 12 }}
                              />
                              <Tooltip 
                                formatter={(value, name, props) => [
                                  `${props.payload?.calories || 0} calories`, 
                                  `${props.payload.mealType} at ${Math.floor(props.payload.time)}:${Math.round((props.payload.time % 1) * 60).toString().padStart(2, '0')}${props.payload.hasTime ? '' : ' (estimated)'}`
                                ]}
                                labelFormatter={(label) => `Time: ${Math.floor(label)}:${Math.round((label % 1) * 60).toString().padStart(2, '0')}`}
                              />
                              <Legend />
                              
                              {/* Breakfast - Yellow */}
                              <Scatter 
                                data={mealTypeData.breakfast} 
                                dataKey="calories" 
                                fill="#fbbf24" 
                                name="Breakfast"
                                shape="circle"
                              />
                              
                              {/* Lunch - Orange */}
                              <Scatter 
                                data={mealTypeData.lunch} 
                                dataKey="calories" 
                                fill="#f97316" 
                                name="Lunch"
                                shape="circle"
                              />
                              
                              {/* Dinner - Purple */}
                              <Scatter 
                                data={mealTypeData.dinner} 
                                dataKey="calories" 
                                fill="#8b5cf6" 
                                name="Dinner"
                                shape="circle"
                              />
                              
                              {/* Snack - Green */}
                              <Scatter 
                                data={mealTypeData.snack} 
                                dataKey="calories" 
                                fill="#10b981" 
                                name="Snack"
                                shape="circle"
                              />
                              
                              {/* Trend Lines for each meal type */}
                              {Object.entries(mealTypeData).map(([mealType, data]) => {
                                if (data.length > 1) {
                                  // Calculate trend line
                                  const sortedData = data.sort((a, b) => a.time - b.time);
                                  const trendData = sortedData.map((point, index) => ({
                                    time: point.time,
                                    calories: point?.calories || 0,
                                    trend: index > 0 ? 
                                                                              ((sortedData[index]?.calories || 0) + (sortedData[index-1]?.calories || 0)) / 2 : 
                                                                              point?.calories || 0
                                  }));
                                  
                                  const colors = {
                                    breakfast: '#fbbf24',
                                    lunch: '#f97316',
                                    dinner: '#8b5cf6',
                                    snack: '#10b981'
                                  };
                                  
                                  return (
                                    <Line
                                      key={`trend-${mealType}`}
                                      type="monotone"
                                      data={trendData}
                                      dataKey="trend"
                                      stroke={colors[mealType]}
                                      strokeWidth={2}
                                      strokeDasharray="5 5"
                                      dot={false}
                                      name={`${mealType} trend`}
                                    />
                                  );
                                }
                                return null;
                              })}
                            </ScatterChart>
                          </ResponsiveContainer>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Historical Meal Logs */}
            {mealEntries?.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Historical Meal Logs 📋</h3>
                  <button
                    onClick={downloadHistoricalCSV}
                    className="inline-flex items-center px-3 py-1.5 text-sm rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
                    title="Download CSV"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                    </svg>
                    Download CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal Type</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fat (g)</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cholesterol (mg)</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredMeals()
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice((currentPage - 1) * 10, currentPage * 10)
                        .map((meal, index) => (
                          <tr key={meal._id || index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                              {new Date(meal.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                              {meal.mealTime || '--:--'}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                              <div>
                                <div className="font-medium">{meal.foodName}</div>
                                {meal.notes && (
                                  <div className="text-xs text-gray-500 italic">{meal.notes}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                              {parseFloat(meal.quantity).toFixed(2)} {meal.unit}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${
                                (meal.mealType || 'snack') === 'breakfast' ? 'bg-yellow-100 text-yellow-800' :
                                (meal.mealType || 'snack') === 'lunch' ? 'bg-orange-100 text-orange-800' :
                                (meal.mealType || 'snack') === 'dinner' ? 'bg-purple-100 text-purple-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {(meal.mealType || 'snack').charAt(0).toUpperCase() + (meal.mealType || 'snack').slice(1)}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-orange-600 text-right">{meal?.calories || 0}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-right">{typeof meal.fat === 'number' ? Math.round(meal.fat * 10) / 10 : 0}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-right">{meal?.cholesterol || 0}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                              <div className="flex items-center justify-center space-x-3">
                                {canEditMeal(meal) ? (
                              <button
                                    onClick={() => handleEditMeal(meal)}
                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                    title="Edit meal"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                ) : (
                                  <span className="text-gray-400 cursor-not-allowed" title="Can only edit meals from today or yesterday">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </span>
                                )}
                                <button
                                  onClick={() => handleDeleteMeal(meal)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                  title="Delete meal"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                {getFilteredMeals().length > 10 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, getFilteredMeals().length)} of {getFilteredMeals().length} meals
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-700">
                        Page {currentPage} of {Math.ceil(getFilteredMeals().length / 10)}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(getFilteredMeals().length / 10), prev + 1))}
                        disabled={currentPage === Math.ceil(getFilteredMeals().length / 10)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Monthly View Tab */}
        {activeTab === 'monthly' && monthlySummary && (
          <div className="space-y-8">
            {/* Monthly Overview Header */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Nutrition Summary 📅</h2>
                  <p className="text-green-100 text-lg">Your nutrition patterns over the last 90 days</p>
                  <p className="text-green-100 mt-2">Period: Last 90 days</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{monthlySummary?.averages?.calories || 0}</div>
                  <div className="text-green-100">Daily Average (kcal)</div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Calories</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {(() => {
                        const filteredMeals = getFilteredMeals();
                        return filteredMeals.reduce((sum, meal) => sum + (meal?.calories || 0), 0);
                      })()}
                    </p>
                    <p className="text-sm text-gray-500">kcal in 90 days</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">🔥</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Days with Meals</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {(() => {
                        const filteredMeals = getFilteredMeals();
                        const uniqueDays = new Set(filteredMeals.map(meal => new Date(meal.date).toISOString().split('T')[0]));
                        return uniqueDays.size;
                      })()}
                    </p>
                    <p className="text-sm text-gray-500">out of 90 days</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">📊</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Meals</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {(() => {
                        const filteredMeals = getFilteredMeals();
                        return filteredMeals.length;
                      })()}
                    </p>
                    <p className="text-sm text-gray-500">meals logged</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">🍽️</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Consistency</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {(() => {
                        const filteredMeals = getFilteredMeals();
                        const uniqueDays = new Set(filteredMeals.map(meal => new Date(meal.date).toISOString().split('T')[0]));
                        return Math.round((uniqueDays.size / 90) * 100);
                      })()}%
                    </p>
                    <p className="text-sm text-gray-500">tracking days</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">📈</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Charts */}
            <div className="space-y-8">
              {/* Full Length Daily Calorie Trend */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Daily Calorie Trend (Last 90 Days)</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={(() => {
                        const filteredMeals = getFilteredMeals();
                        const dailyData = {};
                        
                        // Group meals by date
                        filteredMeals.forEach(meal => {
                          const date = new Date(meal.date).toISOString().split('T')[0];
                          if (!dailyData[date]) {
                            dailyData[date] = { calories: 0, fat: 0, cholesterol: 0 };
                          }
                          dailyData[date].calories += (meal?.calories || 0);
                                                      dailyData[date].fat += (meal?.fat || 0);
                            dailyData[date].cholesterol += (meal?.cholesterol || 0);
                        });
                        
                        return Object.entries(dailyData).map(([date, data]) => {
                          const goal = getCalorieGoal();
                          const consumed = data.calories || 0;
                          const deficit = goal - consumed;
                          const deficitPercentage = goal > 0 ? ((deficit / goal) * 100) : 0;
                          
                          return {
                          day: new Date(date).getDate(),
                            calories: consumed,
                            goal: goal,
                            deficit: deficit,
                            deficitPercentage: deficitPercentage,
                          date: date
                          };
                        }).sort((a, b) => new Date(a.date) - new Date(b.date));
                      })()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[-100, 100]} />
                      <ReferenceLine yAxisId="right" y={0} stroke="#666" strokeDasharray="3 3" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'deficitPercentage') {
                            const percentage = parseFloat(value);
                            return [`${percentage.toFixed(2)}%`, 'Deficit %'];
                          }
                          if (name === 'calories') {
                            return [`${value} kcal`, 'Kcal Consumed'];
                          }
                          if (name === 'goal') {
                            return [`${value} kcal`, 'Req. Kcal'];
                          }
                          return [`${value} kcal`, name];
                        }}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="calories" fill="#f97316" name="Consumed" />
                      <Bar yAxisId="left" dataKey="goal" fill="#e5e7eb" name="Daily Goal" />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="deficitPercentage" 
                        stroke="#dc2626" 
                        strokeWidth={3}
                        dot={{ fill: '#dc2626', strokeWidth: 2, r: 5 }}
                        name="deficitPercentage"
                        connectNulls={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

                                          {/* Advanced Analytics Dashboard */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-8">Advanced Analytics (Last 90 Days)</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                  {/* Weekly Pattern Analysis */}
                  <div className="h-96">
                    <h4 className="text-lg font-medium text-gray-800 mb-6">Weekly Calorie Pattern</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(() => {
                        const filteredMeals = getFilteredMeals();
                          const weeklyData = {};
                        
                        filteredMeals.forEach(meal => {
                            const date = new Date(meal.date);
                            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
                            if (!weeklyData[dayOfWeek]) {
                              weeklyData[dayOfWeek] = { calories: 0, count: 0 };
                            }
                            weeklyData[dayOfWeek].calories += (meal?.calories || 0);
                            weeklyData[dayOfWeek].count += 1;
                          });
                          
                          return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
                            day: day,
                                                          avgCalories: weeklyData[day] ? Math.round((weeklyData[day]?.calories || 0) / (weeklyData[day]?.count || 1)) : 0,
                                                          totalMeals: weeklyData[day] ? (weeklyData[day]?.count || 0) : 0
                        }));
                      })()}
                        margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                      <YAxis />
                        <Tooltip formatter={(value, name) => [
                          name === 'avgCalories' ? `${value} kcal` : `${value} meals`,
                          name === 'avgCalories' ? 'Avg Calories' : 'Total Meals'
                        ]} />
                        <Legend />
                        <Bar dataKey="avgCalories" fill="#10b981" name="Avg Calories" />
                        <Bar dataKey="totalMeals" fill="#3b82f6" name="Total Meals" />
                    </BarChart>
                  </ResponsiveContainer>
                  </div>

                  {/* Meal Type Distribution with Calories */}
                  <div className="h-96">
                    <h4 className="text-lg font-medium text-gray-800 mb-6">Meal Type Analysis</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={(() => {
                            const mealTypeData = {};
                            const filteredMeals = getFilteredMeals();
                            
                            filteredMeals.forEach(meal => {
                              // Add null check for meal
                              if (!meal || !meal.mealType) {
                                console.log('🔍 Skipping meal with no mealType in mealTypeData forEach');
                                return;
                              }
                              
                              if (!mealTypeData[meal.mealType]) {
                                mealTypeData[meal.mealType] = { calories: 0, count: 0 };
                              }
                              mealTypeData[meal.mealType].calories += (meal.calories || 0);
                              mealTypeData[meal.mealType].count += 1;
                            });
                            
                            // Calculate total calories for percentage
                            const totalCalories = Object.values(mealTypeData).reduce((sum, data) => sum + (data?.calories || 0), 0);
                            
                            const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
                            return Object.entries(mealTypeData).map(([type, data], index) => ({
                              name: type.charAt(0).toUpperCase() + type.slice(1),
                              calories: data?.calories || 0,
                              count: data.count,
                                                              percentage: totalCalories > 0 ? Math.round(((data?.calories || 0) / totalCalories) * 100) : 0,
                              color: colors[index % colors.length]
                            }));
                          })()}
                          cx="50%"
                          cy="50%"
                          outerRadius={95}
                          fill="#8884d8"
                          dataKey="calories"
                          label={({ percentage }) => `${percentage}%`}
                        >
                          {(() => {
                            const mealTypeData = {};
                            const filteredMeals = getFilteredMeals();
                            
                            filteredMeals.forEach(meal => {
                              if (!meal || !meal.mealType) return;
                              if (!mealTypeData[meal.mealType]) {
                                mealTypeData[meal.mealType] = { calories: 0, count: 0 };
                              }
                              mealTypeData[meal.mealType].calories += (meal?.calories || 0);
                              mealTypeData[meal.mealType].count += 1;
                            });
                            
                            const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
                            return Object.entries(mealTypeData).map(([type, data], index) => (
                              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ));
                          })()}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [
                          `${value} kcal`,
                          `${props.payload.name} (${props.payload.count} meals)`
                        ]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Meal Time Analytics (Last 90 Days) - moved from Weekly to Monthly */}
              {mealEntries?.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Meal Time Analytics ⏰ (Last 90 Days)</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Meal Time Distribution</h4>
                      <div className="space-y-3">
                        {(() => {
                          const mealTimes = { breakfast: [], lunch: [], dinner: [], snack: [] };
                          const ninetyDaysAgo = new Date();
                          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                          mealEntries?.forEach(meal => {
                            if (meal && meal.mealTime && new Date(meal.date) >= ninetyDaysAgo) {
                              const hour = parseInt((meal.mealTime || '00:00').split(':')[0]);
                              if (!isNaN(hour) && meal.mealType && mealTimes[meal.mealType]) {
                                mealTimes[meal.mealType].push(hour);
                              }
                            }
                          });
                          const hasData = Object.values(mealTimes).some(t => t.length > 0);
                          if (!hasData) return <div className="text-gray-500 text-sm">No data for last 90 days</div>;
                          return Object.entries(mealTimes).map(([type, times]) => {
                            if (!times.length) return null;
                            const avgHour = Math.round(times.reduce((s, h) => s + h, 0) / times.length);
                            const variance = Math.sqrt(times.reduce((s, h) => s + Math.pow(h - avgHour, 2), 0) / times.length);
                            return (
                              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <span className="inline-block w-2 h-2 rounded-full bg-orange-400"></span>
                                  <span className="capitalize text-sm text-gray-700">{type}</span>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-gray-900">{String(avgHour).padStart(2, '0')}:00</div>
                                  <div className="text-xs text-gray-500">{times.length} meals • {variance.toFixed(1)}h variance</div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Meal Timing Insights (90 Days)</h4>
                      <div className="space-y-2">
                        {(() => {
                          const mealTimes = { breakfast: [], lunch: [], dinner: [], snack: [] };
                          const ninetyDaysAgo = new Date();
                          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                          mealEntries?.forEach(meal => {
                            if (meal && meal.mealTime && new Date(meal.date) >= ninetyDaysAgo) {
                              const hour = parseInt((meal.mealTime || '00:00').split(':')[0]);
                              if (!isNaN(hour) && meal.mealType && mealTimes[meal.mealType]) {
                                mealTimes[meal.mealType].push(hour);
                              }
                            }
                          });
                          const insights = Object.entries(mealTimes).flatMap(([type, times]) => {
                            if (!times.length) return [];
                            const avg = times.reduce((s, h) => s + h, 0) / times.length;
                            const variance = Math.sqrt(times.reduce((s, h) => s + Math.pow(h - avg, 2), 0) / times.length);
                            const consistent = variance <= 2;
                            return [{ type, msg: consistent ? `✅ ${type} times are consistent` : `⚠️ ${type} times vary by ~${variance.toFixed(1)}h` }];
                          });
                          if (!insights.length) return <div className="text-gray-500 text-sm">No insights available</div>;
                          return insights.map((i, idx) => (
                            <div key={idx} className={`p-3 rounded ${i.msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{i.msg}</div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                  {/* Daily Meal Pattern Scatter (Last 90 Days) */}
                  <div className="mt-8">
                    <h4 className="font-medium text-gray-900 mb-4">Daily Meal Pattern (Last 90 Days)</h4>
                    <div className="h-80">
                      {(() => {
                        const ninetyDaysAgo = new Date();
                        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                        const categorized = { breakfast: [], lunch: [], dinner: [], snack: [] };
                        (mealEntries || [])
                          .filter(m => m && m.mealTime && new Date(m.date) >= ninetyDaysAgo)
                          .forEach(m => {
                            const hour = parseInt((m.mealTime || '00:00').split(':')[0]);
                            const calories = m.calories || 0;
                            const type = (m.mealType || 'other').toLowerCase();
                            const point = { hour: isNaN(hour) ? 0 : hour, calories };
                            if (categorized[type]) categorized[type].push(point);
                          });
                        const series = [
                          { key: 'breakfast', name: 'Breakfast', color: '#f97316' },
                          { key: 'lunch', name: 'Lunch', color: '#10b981' },
                          { key: 'dinner', name: 'Dinner', color: '#3b82f6' },
                          { key: 'snack', name: 'Snack', color: '#ef4444' },
                        ].filter(s => categorized[s.key] && categorized[s.key].length > 0);
                        const hasAny = series.length > 0;
                        if (!hasAny) return <div className="text-center text-gray-500 py-8">No data for last 90 days</div>;
                        return (
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                              <CartesianGrid />
                              <XAxis type="number" dataKey="hour" name="Hour" domain={[0, 23]} tickFormatter={(h) => `${h}:00`} />
                              <YAxis type="number" dataKey="calories" name="Calories" />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => {
                                if (name === 'hour') return [`${value}:00`, 'Time'];
                                if (name === 'calories') return [`${value} kcal`, 'Calories'];
                                return [value, name];
                              }} />
                              <Legend />
                              {series.map(s => (
                                <Scatter key={s.key} name={s.name} data={categorized[s.key]} fill={s.color} />
                              ))}
                            </ScatterChart>
                          </ResponsiveContainer>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Monthly Calendar View */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">90-Day Calendar View</h3>
              

              
              {/* Pagination Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  Showing page {calendarPage} of {Math.ceil(90 / 30)}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCalendarPage(prev => Math.max(1, prev - 1))}
                    disabled={calendarPage === 1}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCalendarPage(prev => Math.min(Math.ceil(90 / 30), prev + 1))}
                    disabled={calendarPage === Math.ceil(90 / 30)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center p-2 text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days for last 90 days - 30 days per page in descending order */}
                {(() => {
                  const days = [];
                  const today = new Date();
                  
                  // Create a map of dates with meal data
                  const mealDataMap = {};
                  mealEntries?.forEach(meal => {
                    if (!meal || !meal.date) {
                      console.log('🔍 Skipping meal with no date in calendar forEach');
                      return;
                    }
                    const mealDate = new Date(meal.date).toISOString().split('T')[0];
                    if (!mealDataMap[mealDate]) {
                      mealDataMap[mealDate] = { calories: 0, mealCount: 0 };
                    }
                                                  mealDataMap[mealDate].calories += (meal?.calories || 0);
                    mealDataMap[mealDate].mealCount += 1;
                  });
                  
                  // Calculate start and end indices for current page (descending order)
                  const startIndex = (calendarPage - 1) * 30;
                  const endIndex = Math.min(startIndex + 30, 90);
                  
                  // Generate calendar for current page (30 days in descending order - latest first)
                  for (let i = startIndex; i < endIndex; i++) {
                    const date = new Date();
                    // For descending order: show latest dates first
                    // Page 1: days 0-29 (today to 29 days ago)
                    // Page 2: days 30-59 (30 days ago to 59 days ago)
                    // Page 3: days 60-89 (60 days ago to 89 days ago)
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const dayData = mealDataMap[dateStr];
                    const hasMeals = dayData && (dayData.calories || 0) > 0;
                    
                    days.push(
                      <div key={i} className={`p-2 text-center border rounded-lg ${hasMeals ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="text-sm font-medium text-gray-900">{date.getDate()}</div>
                        <div className="text-xs text-gray-500">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                        {hasMeals && (
                          <>
                            <div className="text-xs text-green-600 font-bold">{dayData.calories || 0}</div>
                            <div className="text-xs text-gray-500">{dayData.mealCount} meals</div>
                          </>
                        )}
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </div>

            {/* Monthly Insights */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">90-Day Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Average Daily Calories</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(() => {
                      const ninetyDaysAgo = new Date();
                      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                      
                      const recentMeals = mealEntries.filter(meal => new Date(meal.date) >= ninetyDaysAgo);
                                              const totalCalories = recentMeals.reduce((sum, meal) => sum + (meal?.calories || 0), 0);
                      const daysWithMeals = new Set(recentMeals.map(meal => new Date(meal.date).toISOString().split('T')[0])).size;
                      
                      return daysWithMeals > 0 ? Math.round(totalCalories / daysWithMeals) : 0;
                    })()}
                  </p>
                  <p className="text-xs text-gray-500">vs {getCalorieGoal()} goal</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Best Tracking Week</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(() => {
                      const ninetyDaysAgo = new Date();
                      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                      
                      const recentMeals = mealEntries.filter(meal => new Date(meal.date) >= ninetyDaysAgo);
                      const mealDataMap = {};
                      
                      recentMeals.forEach(meal => {
                        const mealDate = new Date(meal.date).toISOString().split('T')[0];
                        if (!mealDataMap[mealDate]) {
                          mealDataMap[mealDate] = 0;
                        }
                        mealDataMap[mealDate] += (meal.calories || 0);
                      });
                      
                      const weekTotals = [];
                      const entries = Object.entries(mealDataMap);
                      for (let i = 0; i < entries.length; i += 7) {
                        const week = entries.slice(i, i + 7);
                        const weekTotal = week.reduce((sum, [date, calories]) => sum + calories, 0);
                        weekTotals.push({ week: Math.floor(i / 7) + 1, total: weekTotal });
                      }
                      
                      if (weekTotals.length === 0) return 'N/A';
                      const bestWeek = weekTotals.reduce((max, week) => week.total > max.total ? week : max);
                      return `Week ${bestWeek.week}`;
                    })()}
                  </p>
                  <p className="text-xs text-gray-500">highest calorie week</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tracking Streak</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(() => {
                      const ninetyDaysAgo = new Date();
                      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                      
                      const recentMeals = mealEntries.filter(meal => new Date(meal.date) >= ninetyDaysAgo);
                      const mealDataMap = {};
                      
                      recentMeals.forEach(meal => {
                        const mealDate = new Date(meal.date).toISOString().split('T')[0];
                        if (!mealDataMap[mealDate]) {
                          mealDataMap[mealDate] = 0;
                        }
                        mealDataMap[mealDate] += (meal.calories || 0);
                      });
                      
                      let maxStreak = 0;
                      let currentStreak = 0;
                      
                      // Check last 90 days in reverse order
                      for (let i = 89; i >= 0; i--) {
                        const date = new Date();
                        date.setDate(date.getDate() - i);
                        const dateStr = date.toISOString().split('T')[0];
                        
                        if (mealDataMap[dateStr] && mealDataMap[dateStr] > 0) {
                          currentStreak++;
                          maxStreak = Math.max(maxStreak, currentStreak);
                        } else {
                          currentStreak = 0;
                        }
                      }
                      
                      return maxStreak;
                    })()} days
                  </p>
                  <p className="text-xs text-gray-500">longest consecutive days</p>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      
      {/* Floating Add Meal Button */}
      <button
        onClick={() => setShowAddMealPopup(true)}
        className="fixed bottom-8 right-8 w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-[9999] hover:scale-110"
        title="Add New Meal"
      >
        <FaPlus className="text-3xl" />
      </button>

      {/* Add Meal Popup */}
      {showAddMealPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-t-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Add New Meal 🍽️</h2>
                  <p className="text-orange-100 text-sm">Track your nutrition intake</p>
                </div>
                <button
                  onClick={() => setShowAddMealPopup(false)}
                  className="text-white hover:text-orange-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Food Search (Add Meal shows read-only Quick Edit chips) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Quick Edit</h3>
                    <span className="text-xs text-gray-500">{quickEditFoods.length}/10</span>
                  </div>
                  {/* Quick Edit integrated into the list below (no separate dropdown) */}
                  
                  {/* Search Input */}
                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="Search for food items..."
                      value={quickSearchTerm || ''}
                      onChange={(e) => setQuickSearchTerm(e.target.value || '')}
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                  
                  {/* Food List (with Quick Edit action) */}
                  <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                    {(() => {
                      let filteredFoods = foodDatabase?.filter(food => {
                        if (!food || !food.name) return false;
                        const searchLower = (quickSearchTerm || '').toLowerCase();
                        return food.name.toLowerCase().includes(searchLower) ||
                               (food.hinglish && food.hinglish.toLowerCase().includes(searchLower));
                      }) || [];
                       const searchLowerOuter = (quickSearchTerm || '').toLowerCase();
                       if ((filteredFoods.length === 0) && searchLowerOuter.length > 1) {
                         return (
                           <div className="p-4 text-center">
                             <p className="text-sm text-gray-600">No foods found for "{quickSearchTerm}".</p>
                             <p className="text-xs text-gray-500 mt-1">Tip: You can add this item in Food Database using <span className="font-medium text-orange-600">Add Food</span>.</p>
                           </div>
                         );
                       }
                      // Build prioritized list in the exact order defined by Quick Edit
                      const quickOrdered = (quickEditFoods || [])
                        .map((q, idx) => ({ name: q.name, order: Number.isFinite(q.order) ? q.order : idx }))
                        .sort((a, b) => a.order - b.order)
                        .map(q => q.name);

                      const nameOf = (f) => (f.displayName || f.name);
                      const inQuickSet = new Set(quickOrdered);

                      // First: quick edit items that match the current filter, in their defined order
                      const quickItems = quickOrdered
                        .map(n => filteredFoods.find(f => nameOf(f) === n))
                        .filter(Boolean);

                      // Then: fill up to 10 with defaults (non-quick) that match the filter
                      const nonQuick = filteredFoods.filter(f => !inQuickSet.has(nameOf(f)));
                      const fillCount = Math.max(0, 10 - quickItems.length);
                      const defaultFill = nonQuick.slice(0, fillCount);

                      const prioritized = [...quickItems, ...defaultFill, ...nonQuick.slice(fillCount)];

                      return prioritized.slice(0, 8).map((food) => {
                        const inQuickEdit = quickEditFoods.find(q => q.name === (food.displayName || food.name));
                        const canAddQuick = quickEditFoods.length < 10 && !inQuickEdit;
                        return (
                        <div
                          key={food?.name || Math.random()}
                        onClick={() => setSelectedFood(food)}
                        className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-all ${
                            selectedFood?.name === food?.name ? 'bg-orange-50 border-orange-200' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">{food?.name || 'Unknown Food'}</p>
                              {food?.hinglish && (
                              <p className="text-xs text-gray-500 italic">{food.hinglish}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                  {food?.category || 'Unknown'}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  (food?.cholesterol || 0) <= 50
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                  {(food?.cholesterol || 0)}mg
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-2">
                              <p className="font-bold text-gray-900 text-sm">{(food?.calories || 0)} cal</p>
                              <p className="text-xs text-gray-500">{(food?.fat || 0)}g fat</p>
                              {/* Add-to-Quick-Edit action is managed on Food Database page, not here */}
                          </div>
                        </div>
                      </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Right Column - Meal Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Meal Details</h3>
                  
                  {/* Placeholder when no food selected */}
                  {!selectedFood && (
                    <div className="text-center py-8 text-gray-500">
                      <FaSearch className="mx-auto text-4xl mb-2 text-gray-300" />
                      <p>Search and select a food item to add to your meal diary</p>
                    </div>
                  )}

                  {/* Selected Food Details */}
                  {selectedFood && (
                    <>
                      {/* Selected Food Card */}
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{selectedFood?.name || 'Unknown Food'}</h4>
                        <p className="text-sm text-gray-600 mb-2">{selectedFood?.hinglish || ''}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{selectedFood?.category || 'Unknown'}</span>
                          <span className="text-lg font-bold text-orange-600">{(selectedFood?.calories || 0)} cal per 100g</span>
                        </div>
                      </div>

                      {/* Meal Entry Form */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                              type="number"
                              value={quantity || ''}
                              onChange={(e) => setQuantity(e.target.value || '')}
                              placeholder="Enter quantity"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <select
                              value={unit || ''}
                              onChange={(e) => setUnit(e.target.value || '')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                              <option value="">Select Unit</option>
                              <option value="grams">grams</option>
                              <option value="cups">cups</option>
                              <option value="tsp">tsp</option>
                              <option value="tbsp">tbsp</option>
                              <option value="ml">ml</option>
                              <option value="pieces">pieces</option>
                              <option value="slices">slices</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                            <select
                              value={mealType || ''}
                              onChange={(e) => setMealType(e.target.value || '')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                              <option value="">Select Meal Type</option>
                              <option value="breakfast">Breakfast</option>
                              <option value="lunch">Lunch</option>
                              <option value="dinner">Dinner</option>
                              <option value="snack">Snack</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Time</label>
                            <input
                              type="time"
                              value={mealTime}
                              onChange={(e) => setMealTime(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Add any notes about this meal..."
                          />
                        </div>

                        {/* Nutrition Preview */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2 text-sm">Nutrition Preview</h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                              <p className="text-gray-600 text-xs">Calories</p>
                              <p className="text-lg font-bold text-orange-600">
                                {(() => {
                                  if (!selectedFood || !quantity || parseFloat(quantity) <= 0) return 0;
                                  let gramsEquivalent = parseFloat(quantity);
                                  if (unit === 'cups') gramsEquivalent = parseFloat(quantity) * 240; // 1 cup = 240g
                                  else if (unit === 'tsp') gramsEquivalent = parseFloat(quantity) * 5; // 1 tsp = 5g
                                  else if (unit === 'tbsp') gramsEquivalent = parseFloat(quantity) * 15; // 1 tbsp = 15g
                                  else if (unit === 'ml') gramsEquivalent = parseFloat(quantity); // 1ml ≈ 1g for most foods
                                  else if (unit === 'pieces') gramsEquivalent = parseFloat(quantity) * 50; // 1 piece ≈ 50g
                                  else if (unit === 'slices') gramsEquivalent = parseFloat(quantity) * 30; // 1 slice ≈ 30g
                                  
                                  return Math.round(((selectedFood?.calories || 0)) * gramsEquivalent / 100);
                                })()}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600 text-xs">Fat (g)</p>
                              <p className="text-lg font-bold text-red-600">
                                {(() => {
                                  if (!selectedFood || !quantity || parseFloat(quantity) <= 0) return 0;
                                  let gramsEquivalent = parseFloat(quantity);
                                  if (unit === 'cups') gramsEquivalent = parseFloat(quantity) * 240; // 1 cup = 240g
                                  else if (unit === 'tsp') gramsEquivalent = parseFloat(quantity) * 5; // 1 tsp = 5g
                                  else if (unit === 'tbsp') gramsEquivalent = parseFloat(quantity) * 15; // 1 tbsp = 15g
                                  else if (unit === 'ml') gramsEquivalent = parseFloat(quantity); // 1ml ≈ 1g for most foods
                                  else if (unit === 'pieces') gramsEquivalent = parseFloat(quantity) * 50; // 1 piece ≈ 50g
                                  else if (unit === 'slices') gramsEquivalent = parseFloat(quantity) * 30; // 1 slice ≈ 30g
                                  
                                  return ((selectedFood.fat || 0) * gramsEquivalent / 100).toFixed(1);
                                })()}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600 text-xs">Cholesterol (mg)</p>
                              <p className="text-lg font-bold text-yellow-600">
                                {(() => {
                                  if (!selectedFood || !quantity || parseFloat(quantity) <= 0) return 0;
                                  let gramsEquivalent = parseFloat(quantity);
                                  if (unit === 'cups') gramsEquivalent = parseFloat(quantity) * 240; // 1 cup = 240g
                                  else if (unit === 'tsp') gramsEquivalent = parseFloat(quantity) * 5; // 1 tsp = 5g
                                  else if (unit === 'tbsp') gramsEquivalent = parseFloat(quantity) * 15; // 1 tbsp = 15g
                                  else if (unit === 'ml') gramsEquivalent = parseFloat(quantity); // 1ml ≈ 1g for most foods
                                  else if (unit === 'pieces') gramsEquivalent = parseFloat(quantity) * 50; // 1 piece ≈ 50g
                                  else if (unit === 'slices') gramsEquivalent = parseFloat(quantity) * 30; // 1 slice ≈ 30g
                                  
                                  return Math.round((selectedFood.cholesterol || 0) * gramsEquivalent / 100);
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={() => {
                              setShowAddMealPopup(false);
                              setSelectedFood(null);
                              setQuantity('');
                              setUnit('');
                              setMealType('');
                              setMealTime('');
                              setNotes('');
                              setSearchTerm(''); // Clear search term
                              setSelectedFoodForHistory(null); // Clear food history
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              await handleAddMeal();
                              setShowAddMealPopup(false);
                              setSelectedFood(null);
                              setQuantity('');
                              setUnit('');
                              setMealType('');
                              setMealTime('');
                              setNotes('');
                              setSearchTerm(''); // Clear search term
                              setSelectedFoodForHistory(null); // Clear food history
                            }}
                            disabled={loading || !quantity || quantity <= 0 || !unit || !mealType}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                          >
                            {loading ? (
                              <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Adding...
                              </span>
                            ) : (
                              'Add Meal'
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Meal Popup */}
      {showEditMealPopup && editingMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Edit Meal ✏️</h2>
                  <p className="text-blue-100 text-sm">Update your meal details</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditMealPopup(false);
                    setEditingMeal(null);
                    setEditQuantity('');
                    setEditUnit('grams');
                    setEditMealType('breakfast');
                    setEditMealTime('');
                    setEditNotes('');
                  }}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Selected Food Card */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{editingMeal.foodName}</h4>
                    <p className="text-sm text-gray-600 mt-1">Original Date: {new Date(editingMeal.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  <div className="text-right">
                                                <p className="text-2xl font-bold text-blue-600">{editingMeal?.calories || 0} cal</p>
                    <p className="text-sm text-gray-500">original value</p>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      placeholder="Enter quantity"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Unit</option>
                      <option value="grams">grams</option>
                      <option value="cups">cups</option>
                      <option value="tsp">tsp</option>
                      <option value="tbsp">tbsp</option>
                      <option value="ml">ml</option>
                      <option value="pieces">pieces</option>
                      <option value="slices">slices</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meal Type
                    </label>
                    <select
                      value={editMealType}
                      onChange={(e) => setEditMealType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Meal Type</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meal Time
                    </label>
                    <input
                      type="time"
                      value={editMealTime}
                      onChange={(e) => setEditMealTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any notes about this meal..."
                  />
                </div>

                {/* Nutrition Preview */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 text-sm">Updated Nutrition Preview</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-gray-600 text-xs">Calories</p>
                      <p className="text-lg font-bold text-orange-600">
                        {(() => {
                          if (!editQuantity || parseFloat(editQuantity) <= 0) return editingMeal?.calories || 0;
                          let gramsEquivalent = parseFloat(editQuantity);
                          if (editUnit === 'cups') gramsEquivalent = parseFloat(editQuantity) * 240;
                          else if (editUnit === 'tsp') gramsEquivalent = parseFloat(editQuantity) * 5;
                          else if (editUnit === 'tbsp') gramsEquivalent = parseFloat(editQuantity) * 15;
                          else if (editUnit === 'ml') gramsEquivalent = parseFloat(editQuantity);
                          else if (editUnit === 'pieces') gramsEquivalent = parseFloat(editQuantity) * 50;
                          else if (editUnit === 'slices') gramsEquivalent = parseFloat(editQuantity) * 30;
                          
                                                        return Math.round(((editingMeal?.calories || 0)) * gramsEquivalent / (((editingMeal?.quantity || 1)) * (editingMeal?.unit === 'cups' ? 240 : editingMeal?.unit === 'tsp' ? 5 : editingMeal?.unit === 'tbsp' ? 15 : editingMeal?.unit === 'ml' ? 1 : editingMeal?.unit === 'pieces' ? 50 : editingMeal?.unit === 'slices' ? 30 : 1)));
                        })()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 text-xs">Fat (g)</p>
                      <p className="text-lg font-bold text-red-600">
                        {(() => {
                          if (!editQuantity || parseFloat(editQuantity) <= 0) return editingMeal.fat;
                          let gramsEquivalent = parseFloat(editQuantity);
                          if (editUnit === 'cups') gramsEquivalent = parseFloat(editQuantity) * 240;
                          else if (editUnit === 'tsp') gramsEquivalent = parseFloat(editQuantity) * 5;
                          else if (editUnit === 'tbsp') gramsEquivalent = parseFloat(editQuantity) * 15;
                          else if (editUnit === 'ml') gramsEquivalent = parseFloat(editQuantity);
                          else if (editUnit === 'pieces') gramsEquivalent = parseFloat(editQuantity) * 50;
                          else if (editUnit === 'slices') gramsEquivalent = parseFloat(editQuantity) * 30;
                          
                          return (editingMeal.fat * gramsEquivalent / (editingMeal.quantity * (editingMeal.unit === 'cups' ? 240 : editingMeal.unit === 'tsp' ? 5 : editingMeal.unit === 'tbsp' ? 15 : editingMeal.unit === 'ml' ? 1 : editingMeal.unit === 'pieces' ? 50 : editingMeal.unit === 'slices' ? 30 : 1))).toFixed(1);
                        })()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 text-xs">Cholesterol (mg)</p>
                      <p className="text-lg font-bold text-yellow-600">
                        {(() => {
                          if (!editQuantity || parseFloat(editQuantity) <= 0) return editingMeal.cholesterol;
                          let gramsEquivalent = parseFloat(editQuantity);
                          if (editUnit === 'cups') gramsEquivalent = parseFloat(editQuantity) * 240;
                          else if (editUnit === 'tsp') gramsEquivalent = parseFloat(editQuantity) * 5;
                          else if (editUnit === 'tbsp') gramsEquivalent = parseFloat(editQuantity) * 15;
                          else if (editUnit === 'ml') gramsEquivalent = parseFloat(editQuantity);
                          else if (editUnit === 'pieces') gramsEquivalent = parseFloat(editQuantity) * 50;
                          else if (editUnit === 'slices') gramsEquivalent = parseFloat(editQuantity) * 30;
                          
                          return Math.round(editingMeal.cholesterol * gramsEquivalent / (editingMeal.quantity * (editingMeal.unit === 'cups' ? 240 : editingMeal.unit === 'tsp' ? 5 : editingMeal.unit === 'tbsp' ? 15 : editingMeal.unit === 'ml' ? 1 : editingMeal.unit === 'pieces' ? 50 : editingMeal.unit === 'slices' ? 30 : 1)));
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setShowEditMealPopup(false);
                      setEditingMeal(null);
                      setEditQuantity('');
                      setEditUnit('grams');
                      setEditMealType('breakfast');
                      setEditMealTime('');
                      setEditNotes('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateMeal}
                    disabled={loading || !editQuantity || editQuantity <= 0 || !editUnit || !editMealType}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </span>
                    ) : (
                      'Update Meal'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirmPopup && mealToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-t-2xl p-6 text-white text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Delete Meal</h2>
              <p className="text-red-100">This action cannot be undone</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Meal Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{mealToDelete.foodName}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    mealToDelete.mealType === 'breakfast' ? 'bg-yellow-100 text-yellow-800' :
                    mealToDelete.mealType === 'lunch' ? 'bg-orange-100 text-orange-800' :
                    mealToDelete.mealType === 'dinner' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {mealToDelete.mealType.charAt(0).toUpperCase() + mealToDelete.mealType.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(mealToDelete.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time</p>
                    <p className="font-medium text-gray-900">{mealToDelete.mealTime || '--:--'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Quantity</p>
                    <p className="font-medium text-gray-900">{parseFloat(mealToDelete.quantity).toFixed(2)} {mealToDelete.unit}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Calories</p>
                    <p className="font-medium text-gray-900">{mealToDelete.calories} cal</p>
                  </div>
                </div>
                {mealToDelete.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-gray-600 text-sm">Notes</p>
                    <p className="text-gray-900 text-sm italic">{mealToDelete.notes}</p>
                  </div>
                )}
              </div>

              {/* Warning Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Are you absolutely sure?</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>This will permanently delete this meal entry and remove it from your nutrition tracking history.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={cancelDeleteMeal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteMeal}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-pink-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </span>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealTracker; 