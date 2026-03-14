import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Scale, 
  Calendar,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  Pencil,
  Plus
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { calculateBMI, getBMICategory, userAPI, weightEntryAPI, isValidObjectId } from '../services/api';

import { Tooltip as ReactTooltip } from 'react-tooltip';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

console.log('DASHBOARD FILE LOADED');

function formatGridDate(date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Timezone-safe date formatter
const formatDateToYYYYMMDD = (dateInput) => {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Dashboard = () => {
  const { currentUser, setCurrentUser } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [goalEntries, setGoalEntries] = useState([]);
  const [showGoalNotification, setShowGoalNotification] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showViewToday, setShowViewToday] = useState(false);
  const [showViewEntry, setShowViewEntry] = useState(false);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [showWeightEntry, setShowWeightEntry] = useState(false);
  const [addEntryDate, setAddEntryDate] = useState(null);
  const bmiBarRef = useRef(null);
  const [barWidth, setBarWidth] = useState(0);

  // Get the latest weight entry (most recent date)
  const getLatestWeight = () => {
    if (!goalEntries || goalEntries.length === 0) {
      // Fall back to user's current weight from profile when no entries exist
      return userProfile?.currentWeight || 0;
    }
    
    // Sort entries by date (newest first) and get the first one
    const sortedEntries = [...goalEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestWeight = sortedEntries[0]?.weight || 0;
    
    return latestWeight;
  };

  // Get the initial weight for the current goal
  const getInitialWeight = () => {
    // Priority: goalInitialWeight from user profile > first entry weight > current weight
    if (userProfile?.goalInitialWeight) {
      return userProfile.goalInitialWeight;
    }
    
    if (goalEntries && goalEntries.length > 0) {
      // Sort entries by date (oldest first) and get the first one
      const sortedEntries = [...goalEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
      return sortedEntries[0]?.weight || 0;
    }
    
    return userProfile?.currentWeight || 0;
  };

  // Stats object to maintain compatibility
  const stats = {
    currentWeight: getLatestWeight(),
    targetWeight: userProfile?.targetWeight || 0,
    height: userProfile?.height || 0,
    targetDate: userProfile?.targetDate ? new Date(userProfile.targetDate) : new Date(),
    goalStartDate: userProfile?.goalCreatedAt ? new Date(userProfile.goalCreatedAt) : new Date(),
    // Use the new getInitialWeight function
    initialWeight: getInitialWeight()
  };
  
  // Debug logging for weight progress - moved to useEffect to prevent excessive logging
  useEffect(() => {
    if (userProfile && goalEntries.length > 0) {
  console.log('[WEIGHT PROGRESS DEBUG]', {
    userProfile: {
      goalInitialWeight: userProfile?.goalInitialWeight,
      currentWeight: userProfile?.currentWeight,
      targetWeight: userProfile?.targetWeight,
      goalStatus: userProfile?.goalStatus
    },
    goalEntries: {
      count: goalEntries.length,
      firstEntry: goalEntries[0],
      lastEntry: goalEntries[goalEntries.length - 1]
    },
    stats: {
      initialWeight: stats.initialWeight,
      currentWeight: stats.currentWeight,
      targetWeight: stats.targetWeight
    },
    weightLost: stats.initialWeight - stats.currentWeight,
    totalWeightToLose: stats.initialWeight - stats.targetWeight
  });
    }
  }, [userProfile, goalEntries, stats.initialWeight, stats.currentWeight, stats.targetWeight]);

  // Helper: check if today's weight is logged (local date comparison)
  function isSameDay(dateA, dateB) {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
  const todaysEntry = goalEntries.find(entry => isSameDay(entry.date, new Date()));
  const hasLoggedToday = Boolean(todaysEntry);

  // Helper: get last 30 days with weights
  function getLast30DaysGrid(entries) {
    const today = new Date();
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10); // 'YYYY-MM-DD' in UTC
      days.push({
        date: dateStr, // always string
        weight: null,
        notes: '',
      });
    }
    
    // Debug: print all entries and grid days
    // console.log('[DEBUG] Entries for grid mapping:', entries);
    // console.log('[DEBUG] Grid days:', days.map(day => day.date));
    
    // Map entries to days using robust UTC date comparison
    entries.forEach(entry => {
      const entryDateStr = new Date(entry.date).toISOString().slice(0, 10);
      days.forEach(day => {
        if (entryDateStr === day.date) {
          day.weight = entry.weight;
          day.notes = entry.notes || '';
          day.entry = entry; // Store the full entry object for the pencil icon
          // Debug: print mapping
          // console.log(`[DEBUG] Mapped entry ${entry.weight} to day ${day.date}`);
        }
      });
    });
    
    // Add current weight as an entry for the goal creation date if no entry exists for that date
    if (userProfile && userProfile.goalCreatedAt && userProfile.currentWeight) {
      const goalDateStr = new Date(userProfile.goalCreatedAt).toISOString().slice(0, 10);
      const goalDateDay = days.find(day => day.date === goalDateStr);
      
      if (goalDateDay && goalDateDay.weight === null) {
        // No entry exists for goal creation date, add current weight
        goalDateDay.weight = userProfile.currentWeight;
        goalDateDay.notes = 'Goal start weight';
        goalDateDay.entry = {
          id: 'goal-start',
          date: goalDateStr,
          weight: userProfile.currentWeight,
          notes: 'Goal start weight',
          goalId: userProfile.goalId
        };
          // console.log(`[DEBUG] Added goal start weight ${userProfile.currentWeight} to day ${goalDateStr}`);
      }
    }
    
    return days;
  }

  // Helper: get color class for % change
  function getWeightChangeColor(pct, idx, days) {
    if (pct === null) return 'bg-gray-100';

    // Consistent weight: between -0.2% and +0.2%
    if (pct >= -0.2 && pct <= 0.2) return 'bg-green-100'; // light green

    // Check for 3 consecutive >1% decrease (dark red)
    let darkRed = true;
    let count = 0;
    let checkIdx = idx;
    let prevIdx;
    while (count < 3 && checkIdx < days.length) {
      // Find previous entry
      prevIdx = checkIdx + 1;
      while (prevIdx < days.length && days[prevIdx].weight === null) prevIdx++;
      if (prevIdx >= days.length || days[checkIdx].weight === null || days[prevIdx].weight === null) {
        darkRed = false;
        break;
      }
      const change = ((days[checkIdx].weight - days[prevIdx].weight) / days[prevIdx].weight) * 100;
      if (change > -1) {
        darkRed = false;
        break;
      }
      checkIdx = prevIdx;
      count++;
    }
    if (darkRed && count === 3) return 'bg-red-900 text-white';

    // Increase
    if (pct > 0.001 && pct <= 0.3) return 'bg-yellow-100'; // light yellow
    if (pct > 0.3 && pct <= 0.5) return 'bg-red-100'; // light red
    if (pct > 0.5) return 'bg-red-500 text-white'; // red

    // Decrease
    if (pct < -0.001 && pct >= -0.3) return 'bg-green-50'; // lightest green
    if (pct < -0.3 && pct >= -0.5) return 'bg-green-200'; // light green
    if (pct < -0.5 && pct >= -1) return 'bg-green-500 text-white'; // green

    return 'bg-gray-100';
  }

  // Helper: find entry by date (now using simple string comparison)
  function findEntryByDate(entries, date) {
    return entries?.find(e => e.date === date);
  }

  // Helper: get weight at or before a given date
  function getWeightAtOrBefore(date) {
    // Entries are sorted descending by date
    const entry = goalEntries.find(e => new Date(e.date) <= date);
    return entry ? entry.weight : null;
  }

  // Helper: get median weight in a date range
  function getMedianWeightInRange(start, end) {
    const s = toDateOnly(start);
    const e = toDateOnly(end);
    const weights = goalEntries
      .filter(ei => {
        const d = toDateOnly(ei.date);
        return d >= s && d <= e;
      })
      .map(ei => ei.weight)
      .sort((a, b) => a - b);
    if (weights.length === 0) return null;
    const mid = Math.floor(weights.length / 2);
    return weights.length % 2 !== 0 ? weights[mid] : (weights[mid - 1] + weights[mid]) / 2;
  }

  // Helper: get latest entry before or at a given date
  function getLatestWeightBeforeOrAt(date) {
    const d = toDateOnly(date);
    const entry = goalEntries.find(ei => toDateOnly(ei.date) <= d);
    return entry ? entry.weight : null;
  }

  // Helper: convert to date-only (strip time)
  function toDateOnly(date) {
    return new Date(new Date(date).toISOString().slice(0, 10));
  }

  // Helper: get latest entry at or before a given date (date-only)
  function getLatestEntryAtOrBefore(date) {
    const d = toDateOnly(date);
    return goalEntries.find(ei => toDateOnly(ei.date) <= d) || null;
  }

  // When mapping entries to days, use only the date part for comparison
  const getEntryForDate = (date) => {
    const dateStr = date.toISOString().slice(0, 10); // 'YYYY-MM-DD'
    return (goalEntries || []).find(entry => {
      const entryDateStr = new Date(entry.date).toISOString().slice(0, 10);
      return entryDateStr === dateStr;
    });
  };

  // Always use userProfile.goalId as the active goalId, but validate it
  const activeGoalId = userProfile && userProfile.goalId && (userProfile.goalId === 'demo' || isValidObjectId(userProfile.goalId)) ? userProfile.goalId : null;

  // Filter entries for the current goalId
  const goalEntriesFiltered = goalEntries.filter(entry => !activeGoalId || entry.goalId === activeGoalId);

  // Removed loadUserProfile and loadGoalEntries functions - now handled in single useEffect

  // Single useEffect to handle all data loading
  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    if (currentUser.id === 'demo') {
      // Demo user - use demo data
      console.log('[DASHBOARD] Demo user - using demo data');
      const demoProfile = {
        id: 'demo',
        name: 'Demo User',
        email: 'demo@example.com',
        mobile: '+1234567890',
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
      };
      
      // Generate 30 days of demo entries with deterministic data
      const demoEntries = [];
      const today = new Date();
      const seed = 12345; // Fixed seed for consistent results
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const baseWeight = 76 - i * 0.1;
        
        // Deterministic fluctuation based on day and seed
        const deterministicRandom = ((seed + i) * 9301 + 49297) % 233280;
        const normalizedRandom = deterministicRandom / 233280;
        const fluctuation = (normalizedRandom - 0.5) * 0.2; // Reduced fluctuation range
        
        const weight = Math.round((baseWeight + fluctuation) * 10) / 10;
        demoEntries.push({
          id: `demo-entry-${i}`,
          date: date.toISOString().slice(0, 10),
          weight,
          notes: i % 7 === 0 ? 'Weekly check-in' : ''
        });
      }
      
      setUserProfile(demoProfile);
      setGoalEntries(demoEntries);
      setIsLoading(false);
    } else if (currentUser && currentUser.id && currentUser.id !== 'demo' && !userProfile) {
      // Real user - load data from backend (only if we don't have data yet)
      console.log('[DASHBOARD] Real user - loading actual data from backend');
      
      const loadData = async (retryCount = 0) => {
        try {
          setIsLoading(true);
          
          // Load user profile first
          console.log('[DASHBOARD] Loading user profile for user:', currentUser.id);
      const profile = await userAPI.getUser(currentUser.id);
          console.log('[DASHBOARD] User profile response:', profile);
      setUserProfile(profile);
          
          // Then load goal entries if we have a goalId
          if (profile && profile.goalId) {
            console.log('[DASHBOARD] User profile loaded, now loading goal entries');
            console.log('[DASHBOARD] UserProfile goalId:', profile.goalId);
            
      const response = await weightEntryAPI.getAnalytics(currentUser.id, { 
        all: true,
              goalId: profile.goalId 
      });
            
            console.log('[DASHBOARD] Goal entries response:', response);
      if (response.analytics) {
              const entries = (response.analytics.entries || []).map(entry => ({
          id: entry.id || entry._id,
          date: entry.date,
          weight: entry.weight,
          notes: entry.notes || '',
          goalId: entry.goalId
              }));
              console.log('[DASHBOARD] Setting goal entries:', entries);
              setGoalEntries(entries);
              console.log('[DASHBOARD] Goal entries state set successfully');
            }
      }
    } catch (error) {
          console.error('Error loading data:', error);
          
          // Retry logic for network errors
          if (retryCount < 2 && (error.message === 'Network Error' || error.code === 'ECONNABORTED')) {
            console.log(`[DASHBOARD] Retrying data load (attempt ${retryCount + 1})...`);
            setTimeout(() => loadData(retryCount + 1), 2000); // Retry after 2 seconds
            return;
          }
          
          // Set error state for user feedback
          setError(error.message || 'Failed to load data');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
    }
  }, [currentUser?.id]);

  // Debug logging for goal entries changes
  useEffect(() => {
    if (userProfile && goalEntries.length > 0) {
      console.log('[DASHBOARD] Goal entries updated, recalculating stats');
    }
  }, [goalEntries.length]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('[DASHBOARD] Loading timeout reached, setting loading to false');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Force refresh data when component becomes visible (for cases where data might be stale)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUser && currentUser.id && (!userProfile || goalEntries.length === 0)) {
        console.log('[DASHBOARD] Page became visible, refreshing data...');
        // This will trigger the main useEffect above
        window.location.reload();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser?.id, userProfile, goalEntries.length]);

  useEffect(() => {
    function updateBarWidth() {
      if (bmiBarRef.current) {
        setBarWidth(bmiBarRef.current.offsetWidth);
      }
    }
    updateBarWidth();
    window.addEventListener('resize', updateBarWidth);
    return () => window.removeEventListener('resize', updateBarWidth);
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.id === 'demo') {
      // Generate demo userProfile and stats
      const demoProfile = {
        id: 'demo',
        name: 'Demo User',
        email: 'demo@example.com',
        mobile: '+1234567890',
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
      };
      // Generate 30 days of demo entries with deterministic data
      const demoEntries = [];
      const today = new Date();
      const seed = 12345; // Fixed seed for consistent results
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const baseWeight = 76 - i * 0.1;
        
        // Deterministic fluctuation based on day and seed
        const deterministicRandom = ((seed + i) * 9301 + 49297) % 233280;
        const normalizedRandom = deterministicRandom / 233280;
        const fluctuation = (normalizedRandom - 0.5) * 0.2; // Reduced fluctuation range
        
        const weight = Math.round((baseWeight + fluctuation) * 10) / 10;
        demoEntries.push({
          id: `demo-entry-${i}`,
          date: date.toISOString().slice(0, 10),
          weight,
          notes: i % 7 === 0 ? 'Weekly check-in' : ''
        });
      }
      setUserProfile(demoProfile);
      setGoalEntries(demoEntries);
      setIsLoading(false);
    }
  }, [currentUser]);

  // Removed duplicate useEffect hooks that were causing infinite loops

  const handleEntryAdded = () => {
    console.log('[DASHBOARD] Entry added, reloading fresh data...');
    if (currentUser && currentUser.id) {
      // Trigger a page reload to get fresh data
      window.location.reload();
    }
  };

  const handleEntryUpdated = () => {
    console.log('[DASHBOARD] Entry updated, reloading fresh data...');
    if (currentUser && currentUser.id) {
      // Trigger a page reload to get fresh data
      window.location.reload();
              }
  };

  const refreshData = () => {
    console.log('[DASHBOARD] Manual refresh requested...');
    if (currentUser && currentUser.id) {
      // Trigger a page reload to get fresh data
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Check if userProfile is loaded
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  // Check if user has no active goal
  const hasNoActiveGoal = !userProfile || userProfile.goalStatus !== 'active';
  
  // Show helpful message for real users without active goals
  if (hasNoActiveGoal && currentUser && currentUser.id !== 'demo') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mx-4 mt-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Your weight management overview
            </p>
          </div>
        </motion.div>

        {/* Goal Achieved Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-4 mt-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 shadow-xl border border-orange-200/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {userProfile?.goalStatus === 'achieved' ? 'Goal Achieved!' : 'No Active Goal Found'}
                </h3>
                <p className="text-orange-100 text-lg">
                  {userProfile?.goalStatus === 'achieved' 
                    ? "Congratulations! You've reached your target. Set a new goal to continue your journey!"
                    : "Create a weight loss goal to unlock your beautiful dashboard and track your progress!"
                  }
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/profile'}
              className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {userProfile?.goalStatus === 'achieved' ? 'Set New Goal' : 'Create Goal'}
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-4 mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Quick Overview</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Current Weight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="backdrop-blur-sm rounded-xl p-4 shadow-md border hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Current Weight</p>
                  <p className="text-2xl font-bold text-gray-900">{userProfile?.currentWeight || 0} kg</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Height */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="backdrop-blur-sm rounded-xl p-4 shadow-md border hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Height</p>
                  <p className="text-2xl font-bold text-gray-900">{userProfile?.height || 0} cm</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* BMI */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="backdrop-blur-sm rounded-xl p-4 shadow-md border hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">BMI</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userProfile?.height && userProfile?.currentWeight 
                      ? ((userProfile.currentWeight / Math.pow(userProfile.height / 100, 2)).toFixed(1))
                      : '0.0'
                    }
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Goal Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="backdrop-blur-sm rounded-xl p-4 shadow-md border hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-red-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Status</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userProfile?.goalStatus === 'achieved' ? '🎉 Achieved' : 'No Goal'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mx-4 mt-6 text-center"
        >
          <p className="text-gray-600 mb-4">
            {userProfile?.goalStatus === 'achieved' 
              ? "Ready for your next fitness challenge? Set a new goal and continue your amazing journey!"
              : "Start your weight management journey today by creating your first goal!"
            }
          </p>
          {userProfile?.goalStatus === 'achieved' && (
            <p className="text-sm text-gray-500 mb-4">
              🎉 You've successfully reached your target weight! Keep up the great work!
            </p>
          )}
        </motion.div>
      </div>
    );
  }
  
  // Don't show preview for demo user without goal
  if (hasNoActiveGoal && currentUser && currentUser.id === 'demo') {
      return null;
    }

  const currentBMI = calculateBMI(getLatestWeight(), userProfile?.height || 0);
  const targetBMI = calculateBMI(stats.targetWeight, stats.height);
  const weightDifference = getLatestWeight() - stats.targetWeight;
  const daysRemaining = Math.max(0, Math.ceil((stats.targetDate - new Date()) / (1000 * 60 * 60 * 24)));
  
  // Calculate weight change from initial weight to current weight
  const recentWeightChange = getLatestWeight() - stats.initialWeight;
  console.log('[TREND DEBUG]', {
    latestWeight: getLatestWeight(),
    initialWeight: stats.initialWeight,
    recentWeightChange,
    trendText: recentWeightChange < -0.2 ? 'Losing' : recentWeightChange > 0.2 ? 'Gaining' : 'Stable'
  });

  const getTrendIcon = () => {
    if (recentWeightChange < -0.2) return <ArrowDown className="w-4 h-4 text-success-600" />;
    if (recentWeightChange > 0.2) return <ArrowUp className="w-4 h-4 text-danger-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendText = () => {
    if (recentWeightChange < -0.2) return 'Losing weight';
    if (recentWeightChange > 0.2) return 'Gaining weight';
    return 'Stable';
  };

  const getTrendColor = () => {
    if (recentWeightChange < -0.2) return 'text-success-600';
    if (recentWeightChange > 0.2) return 'text-danger-600';
    return 'text-gray-600';
  };

  // Updated BMI Segments: Extreme Underweight and Obese-3 are 7% each, rest distributed proportionally
  const bmiSegments = [
    { label: 'Underweight', min: 0, max: 18.5, width: 14.7 },    // 7% + 7.7% = 14.7%
    { label: 'Normal', min: 18.5, max: 25.0, width: 20.2 },      // unchanged
    { label: 'Overweight', min: 25.0, max: 30.0, width: 15.0 },  // unchanged
    { label: 'Obese-1', min: 30.0, max: 35.0, width: 15.0 },     // unchanged
    { label: 'Obese-2', min: 35.0, max: 40.0, width: 15.0 },     // unchanged
    { label: 'Obese-3', min: 40.0, max: 45.0, width: 20.1 },     // 15% + 7% = 22%, but fudge to 20.1% for 100%
  ];
  const totalWidth = bmiSegments.reduce((sum, seg) => sum + seg.width, 0);
  function getBMIMarkerPixelPosition(bmi) {
    if (!barWidth || !bmi) return 2;
    let leftPx = 0;
    for (let i = 0; i < bmiSegments.length; i++) {
      const seg = bmiSegments[i];
      const segWidthPx = (seg.width / totalWidth) * barWidth;
      if (bmi < seg.max || i === bmiSegments.length - 1) {
        const segRange = seg.max - seg.min;
        const withinSeg = Math.max(0, Math.min(1, (bmi - seg.min) / (segRange === 0 ? 1 : segRange)));
        let pos = leftPx + withinSeg * segWidthPx;
        // Clamp position to bar, inset by 2px from each side
        pos = Math.max(2, Math.min(barWidth - 5, pos));
        console.log('[BMI Marker]', {
          bmi,
          segmentIndex: i,
          segMin: seg.min,
          segMax: seg.max,
          segWidthPx,
          leftPx,
          withinSeg,
          markerPosPx: pos,
          barWidth
        });
        return pos;
      }
      leftPx += segWidthPx;
    }
    return barWidth - 5;
  }

  // Enhanced milestone logic
  const today = new Date();
  const totalDays = Math.max(1, Math.ceil((stats.targetDate - today) / (1000 * 60 * 60 * 24)));
  // Calculate total weight to lose and total goal days ONCE
  const totalWeightToLose = stats.initialWeight - stats.targetWeight;
  const totalGoalDays = Math.max(1, Math.ceil((stats.targetDate - stats.goalStartDate) / (1000 * 60 * 60 * 24)));
  const months = 3;
  const daysPerMonth = Math.round((Math.ceil((stats.targetDate - today) / (1000 * 60 * 60 * 24))) / months);
  const milestonePercents = [0.4, 0.35, 0.25];
  const milestoneLabels = ['Milestone-1', 'Milestone-2', 'Milestone-3'];
  const milestoneWeights = milestonePercents.map(p => +(p * totalWeightToLose).toFixed(1));
  const milestoneCumulative = milestoneWeights.reduce((arr, w, i) => {
    arr.push((arr[i - 1] || 0) + w);
    return arr;
  }, []);
  const milestoneDeficits = milestoneWeights.map((w, i) => {
    const waterLoss = i === 0 ? 1.5 : 0;
    return Math.round(((w - waterLoss) * 7700) / 30);
  });
  // Calculate milestone start/end dates based on milestonePercents
  let milestoneDates = [];
  let runningDays = 0;
  for (let i = 0; i < milestonePercents.length; i++) {
    runningDays += Math.round(milestonePercents[i] * totalGoalDays);
    const d = new Date(stats.goalStartDate);
    d.setDate(d.getDate() + runningDays);
    milestoneDates.push(d);
  }
  // Milestone start dates
  const milestoneStartDates = [stats.goalStartDate, ...milestoneDates.slice(0, -1)];
  // Determine achieved/current/future
  const currentLost = Math.max(0, stats.initialWeight - getLatestWeight());
  const achievedMilestoneIdx = milestoneCumulative.findIndex(w => currentLost < w);
  const currentMilestoneIdx = achievedMilestoneIdx === -1 ? months - 1 : achievedMilestoneIdx;

  // Use analytics data for progress calculation - no local recalculation
  const weightLost = stats.initialWeight - getLatestWeight();
  // Expected progress: how much should have been lost by now
  const daysSinceStart = Math.max(0, Math.floor((new Date() - new Date(stats.goalStartDate)) / (1000 * 60 * 60 * 24)));
  const expectedProgress = totalWeightToLose * (daysSinceStart / totalGoalDays);
  // Initial weight date (for display)
  // Use goal creation date if available, otherwise use the first weight entry date
  const initialWeightDate = userProfile?.goalCreatedAt || (goalEntries.length > 0 ? goalEntries[0]?.date : null);

  // Color logic
  let progressColor = 'bg-green-500';
  if (weightLost < expectedProgress * 0.8) progressColor = 'bg-red-500';
  else if (weightLost < expectedProgress) progressColor = 'bg-yellow-400';

  // Milestone marker positions (as % of bar)
  const milestonePositions = milestoneCumulative.map(w => totalWeightToLose > 0 ? (w / totalWeightToLose) * 100 : 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      {/* Goal Creation Notification */}
      {hasNoActiveGoal && showGoalNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 shadow-xl border border-orange-400/20 relative"
        >
          {/* Close button */}
          <button
            onClick={() => setShowGoalNotification(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">No Active Goal Found</h3>
                <p className="text-orange-100 text-lg">
                  Set up your weight loss goal to start tracking your progress and achieve your fitness targets!
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/profile'}
              className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Create Goal
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back, <span className="font-semibold text-gray-900">{currentUser.name}</span>! Here's your progress overview.
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25"
        >
          <Activity className="w-8 h-8 text-white" />
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Weight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Current Weight</p>
              <p className="text-3xl font-bold text-gray-900">{getLatestWeight()} kg</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Scale className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {getTrendText()}
            </span>
          </div>
        </motion.div>

        {/* Target Weight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Target Weight</p>
              {hasNoActiveGoal ? (
                <div>
                  <p className="text-lg font-semibold text-gray-400 mb-1">Not Set</p>
                  <p className="text-xs text-orange-600 font-medium">Set a goal to get started</p>
                </div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">{stats.targetWeight} kg</p>
              )}
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {Math.abs(weightDifference).toFixed(1)} kg to go
            </p>
          </div>
        </motion.div>

        {/* Current BMI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Current BMI</p>
              <p className="text-3xl font-bold text-gray-900">{currentBMI || 'N/A'}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="mt-4">
            {getBMICategory(currentBMI) ? (
            <span className={`text-sm font-medium ${getBMICategory(currentBMI).color}`}>
                {getBMICategory(currentBMI).category}
            </span>
            ) : (
              <span className="text-sm font-medium text-gray-500">
                BMI not available
              </span>
            )}
          </div>
        </motion.div>

        {/* Days Remaining */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Days Remaining</p>
              {hasNoActiveGoal ? (
                <div>
                  <p className="text-lg font-semibold text-gray-400 mb-1">No Goal Set</p>
                  <p className="text-xs text-orange-600 font-medium">Create a goal to see timeline</p>
                </div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">{daysRemaining}</p>
              )}
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Target: {stats.targetDate.toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Progress</h3>
          
          {hasNoActiveGoal ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">No Goal Set</h4>
              <p className="text-gray-600 mb-4">
                Set up your weight loss goal to start tracking your progress and see meaningful insights.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/profile'}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Set Your Goal
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-nowrap justify-between items-center mb-1 text-[12px] text-gray-500 gap-x-4">
                <span>Initial Weight: <span className="font-semibold text-gray-700">{stats.initialWeight} kg</span>{initialWeightDate ? ` (on ${new Date(initialWeightDate).toLocaleDateString()})` : ''}</span>
                <span>Goal Start Date: <span className="font-semibold text-gray-700">{stats.goalStartDate ? new Date(stats.goalStartDate).toLocaleDateString() : 'N/A'}</span></span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Progress to Target</span>
                <span className="text-sm font-medium text-primary-600">
                  {Math.abs(weightDifference).toFixed(1)} kg remaining
                </span>
              </div>
              {/* After Progress to Target, add an overall weight progress bar */}
              <div className="w-full h-4 rounded-full bg-gray-200 mb-2 mt-1 relative overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                  style={{ width: `${(weightLost / totalWeightToLose * 100).toFixed(1)}%` }}
                />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-700 whitespace-nowrap pointer-events-none">
                  {weightLost > 0 ? `-${weightLost.toFixed(1)} kg lost` : '0.0 kg'}
                </span>
              </div>
              {/* Milestone Progress (moved here, chart removed) */}
              <div className="mt-2 space-y-2">
                <h4 className="text-sm font-semibold text-gray-800 mb-1">Milestone Progress</h4>
                
                {/* Helpful nudge explaining kcal/day */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-600 mt-0.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-xs text-blue-800">
                      <span className="font-medium">💡 Pro Tip:</span> The <span className="font-semibold">kcal/day</span> shows your daily calorie deficit target. This is the amount of calories you need to burn (through diet + exercise) each day to reach your milestone weight goal.
                    </div>
                  </div>
                </div>
                {milestoneLabels.map((label, i) => {
                  // Milestone info
                  const milestoneTarget = milestoneWeights[i];
                  const milestoneStart = milestoneStartDates[i];
                  const milestoneEnd = milestoneDates[i];
                  const daysLeft = Math.max(0, Math.ceil((milestoneEnd - new Date()) / (1000 * 60 * 60 * 24)));
                  const kcalPerDay = milestoneDeficits[i];
                  
                  // Calculate achieved weight loss for this milestone using analytics data
                  let achieved = 0;
                  let achievedPct = 0;
                  
                  if (i === 0) {
                    // First milestone: from initial weight to current weight
                    achieved = Math.max(0, stats.initialWeight - getLatestWeight());
                  } else {
                    // Other milestones: calculate based on milestone targets
                    const previousMilestoneWeight = milestoneCumulative[i - 1];
                    const currentLost = Math.max(0, stats.initialWeight - getLatestWeight());
                    achieved = Math.max(0, currentLost - previousMilestoneWeight);
                  }
                  
                  achievedPct = milestoneTarget > 0 ? Math.max(0, Math.min(100, (achieved / milestoneTarget) * 100)) : 0;
                  
                  // Improved milestone background color logic
                  const now = new Date();
                  const milestoneHasStarted = now >= milestoneStart;
                  const milestoneBg = achievedPct >= 100
                    ? 'bg-green-100'
                    : (milestoneHasStarted && achievedPct < 100)
                      ? 'bg-red-100'
                      : 'bg-gray-50';
                      
                  // Data for BarChart
                  const data = [
                    { name: label, Required: milestoneTarget, Achieved: achieved > 0 ? achieved : 0 }
                  ];
                  
                  return (
                    <div key={label} className={`rounded-lg p-2 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between ${milestoneBg}`}>
                      <div className="flex-1 mb-1 md:mb-0 min-w-[110px]">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-700 text-xs whitespace-nowrap">{label}</span>
                          <span className="text-gray-500 text-xs">Target: <span className="font-bold text-gray-700">{milestoneTarget} kg</span></span>
                          <span className="text-gray-500 text-xs">{kcalPerDay} kcal/day</span>
                          <span className="text-gray-500 text-xs">{daysLeft} days left</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-[90px] max-w-[160px]">
                        <ResponsiveContainer width="100%" height={16}>
                          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }} barCategoryGap={2}>
                            <XAxis type="number" hide domain={[0, Math.max(milestoneTarget, achieved)]} />
                            <YAxis type="category" dataKey="name" hide />
                            <Bar dataKey="Required" fill="#d1d5db" barSize={7} radius={[4, 4, 4, 4]} />
                            <Bar dataKey="Achieved" fill={achievedPct >= 100 ? '#22c55e' : '#f59e42'} barSize={7} radius={[4, 4, 4, 4]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col items-end min-w-[50px]">
                        <span className="text-xs font-semibold text-gray-700">{achieved > 0 ? `-${achieved.toFixed(1)} kg` : '0.0 kg'}</span>
                        <span className="text-[11px] text-gray-500">{achievedPct.toFixed(1)}% achieved</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* BMI Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">BMI Progress</h3>
          
          {hasNoActiveGoal ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">BMI Tracking Ready</h4>
              <p className="text-gray-600 mb-4">
                Set up your weight loss goal to see your BMI progress and track your journey to a healthier you.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/profile'}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Set Your Goal
              </motion.button>
            </div>
          ) : (
            <>
              {/* BMI Classification Bar */}
              <div className="mb-6">
                <div ref={bmiBarRef} className="relative w-full h-8 flex rounded-full overflow-hidden shadow-sm">
                  {/* Segments */}
                  {bmiSegments.map((seg, idx) => {
                    const segWidth = `${seg.width}%`;
                    const isCurrent = currentBMI && currentBMI >= seg.min && currentBMI < seg.max;
                    const isTarget = targetBMI && targetBMI >= seg.min && targetBMI < seg.max;
                    let redLine = null;
                    let greenLine = null;
                    if (isCurrent) {
                      const segRange = seg.max - seg.min;
                      const withinSeg = Math.max(0, Math.min(1, (currentBMI - seg.min) / (segRange === 0 ? 1 : segRange)));
                      redLine = (
                        <div
                          className="absolute top-0 bottom-0"
                          style={{ left: `calc(${withinSeg * 100}% - 1px)`, width: '2px', background: 'red', borderRadius: '2px', zIndex: 10 }}
                        />
                      );
                    }
                    if (isTarget) {
                      const segRange = seg.max - seg.min;
                      const withinSeg = Math.max(0, Math.min(1, (targetBMI - seg.min) / (segRange === 0 ? 1 : segRange)));
                      greenLine = (
                        <div
                          className="absolute top-0 bottom-0"
                          style={{ left: `calc(${withinSeg * 100}% - 1px)`, width: '2px', background: '#065f46', borderRadius: '2px', zIndex: 10 }}
                        />
                      );
                    }
                    // Determine border color for target BMI
                    let borderClass = '';
                    if (isCurrent) borderClass = 'border-4 border-black';
                    else if (isTarget) {
                      borderClass = 'border-4 ' + (
                        seg.label === 'Underweight' ? 'border-blue-400' :
                        seg.label === 'Normal' ? 'border-green-500' :
                        seg.label === 'Overweight' ? 'border-yellow-400' :
                        seg.label === 'Obese-1' ? 'border-orange-400' :
                        seg.label === 'Obese-2' ? 'border-red-400' :
                        'border-red-700'
                      );
                    }
                    return (
                      <div
                        key={seg.label}
                        className={`h-full relative ${borderClass}`}
                        style={{ width: segWidth, background: seg.label === 'Underweight' ? '#38bdf8' :
                                                             seg.label === 'Normal' ? '#22c55e' :
                                                             seg.label === 'Overweight' ? '#facc15' :
                                                             seg.label === 'Obese-1' ? '#fb923c' :
                                                             seg.label === 'Obese-2' ? '#f87171' :
                                                             '#dc2626' }}
                        title={`${seg.label} (${seg.min}–${seg.max === 45.0 ? '40.0+' : seg.max})`}
                      >
                        {redLine}
                        {greenLine}
                      </div>
                    );
                  })}
                </div>
                {/* BMI Scale Labels */}
                <div className="flex w-full mt-2" style={{ fontSize: '0.7rem' }}>
                  <span className="text-gray-700 text-center" style={{ flexBasis: '14.7%' }}>Underweight</span>
                  <span className="text-gray-700 text-center" style={{ flexBasis: '20.2%' }}>Normal</span>
                  <span className="text-gray-700 text-center" style={{ flexBasis: '15.0%' }}>Overweight</span>
                  <span className="text-gray-700 text-center" style={{ flexBasis: '15.0%' }}>Obese-1</span>
                  <span className="text-gray-700 text-center" style={{ flexBasis: '15.0%' }}>Obese-2</span>
                  <span className="text-gray-700 text-center" style={{ flexBasis: '20.1%' }}>Obese-3</span>
                </div>
                <div className="flex w-full" style={{ fontSize: '0.7rem' }}>
                  <span className="text-gray-400 text-center" style={{ flexBasis: '14.7%' }}>&lt;18.5</span>
                  <span className="text-gray-400 text-center" style={{ flexBasis: '20.2%' }}>18.5</span>
                  <span className="text-gray-400 text-center" style={{ flexBasis: '15.0%' }}>25.0</span>
                  <span className="text-gray-400 text-center" style={{ flexBasis: '15.0%' }}>30.0</span>
                  <span className="text-gray-400 text-center" style={{ flexBasis: '15.0%' }}>35.0</span>
                  <span className="text-gray-400 text-center" style={{ flexBasis: '20.1%' }}>40.0+</span>
                </div>
              </div>
              {/* Existing BMI cards and points to go */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{currentBMI || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Current BMI</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getBMICategory(currentBMI)?.category || 'Not available'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{targetBMI || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Target BMI</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getBMICategory(targetBMI)?.category || 'Not available'}
                    </p>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900">
                    {currentBMI && targetBMI ? `${(currentBMI - targetBMI).toFixed(1)} BMI points to go` : 'BMI not available'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {currentBMI && targetBMI ? (currentBMI > targetBMI ? 'Need to lose weight' : 'Need to gain weight') : 'Set your goal to see recommendations'}
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Recent Weight Entries Grid (30 Days) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Weight Entries (30 Days)</h3>
        {userProfile && userProfile.goalCreatedAt && (
          <p className="text-sm text-gray-600 mb-4">
            📅 You can add/edit entries from {new Date(userProfile.goalCreatedAt).toLocaleDateString('en-GB')} onwards. 
            Locked dates are before your goal creation.
          </p>
        )}
        <div className="grid grid-cols-6 gap-2">
          {(() => {
            const days = getLast30DaysGrid(goalEntriesFiltered).reverse();
            // console.log('DAYS GRID FINAL:', days);
            // console.log('RECENT ENTRIES DEBUG:', goalEntriesFiltered);
            let prevWeight = null;
            return days.map((day, idx) => {
              let pct = null;
              if (day.weight !== null) {
                // Find the most recent previous day with a weight entry
                let prevIdx = idx + 1;
                while (prevIdx < days.length && days[prevIdx].weight === null) {
                  prevIdx++;
                }
                if (prevIdx < days.length && days[prevIdx].weight !== null) {
                  pct = ((day.weight - days[prevIdx].weight) / days[prevIdx].weight) * 100;
                }
              }
              const color = getWeightChangeColor(pct, idx, days) || 'bg-gray-100';
              const tooltip = day.weight !== null && days[idx + 1] && days[idx + 1].weight !== null
                ? `${pct > 0 ? '+' : ''}${pct?.toFixed(1)}%\n${day.weight} kg` :
                (day.weight !== null ? `${day.weight} kg` : 'No entry');
              if (day.weight !== null) prevWeight = day.weight;

              // Check if date is before goal creation date (allow goal creation date itself)
              const isBeforeGoalCreation = userProfile && userProfile.goalCreatedAt && 
                new Date(day.date + 'T00:00:00') < new Date(userProfile.goalCreatedAt).setHours(0, 0, 0, 0);
              
              // Pencil icon for last 7 days, but only if not before goal creation
              const isRecent7 = idx < 7;
              const entryForDay = day.entry;
              const canEdit = isRecent7 && !isBeforeGoalCreation;
              
              // Debug logging for the first few days
              // if (idx < 3) {
              //   console.log(`Day ${day.date}: weight=${day.weight}, hasEntry=${!!entryForDay}, canEdit=${canEdit}, isBeforeGoal=${isBeforeGoalCreation}`);
              // }
              
              return (
                <div
                  key={idx}
                  className={`h-20 flex flex-col items-start justify-start rounded-lg border text-xs font-semibold relative ${color} p-2 ${
                    isBeforeGoalCreation ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  }`}
                  data-tooltip-id={`weight-tooltip-${idx}`}
                  data-tooltip-content={isBeforeGoalCreation ? 'Before goal creation date' : tooltip}
                >
                  <span className="mb-1 mt-0.5 text-gray-700">{formatGridDate(new Date(day.date))}</span>
                  <span className="mt-auto text-lg font-bold text-gray-900">{day.weight !== null ? `${day.weight} Kg` : '-'}</span>
                  
                  {/* Show pencil icon only if editable */}
                  {canEdit && (
                    entryForDay ? (
                      <button
                        className={`absolute bottom-1 right-1 p-1 rounded-full bg-blue-100 hover:bg-blue-200`}
                        title="View Entry"
                        onClick={() => { setViewingEntry(entryForDay); setShowViewEntry(true); }}
                        style={{ lineHeight: 0 }}
                      >
                        <Pencil className="w-3 h-3 text-blue-600" />
                      </button>
                    ) : (
                      <button
                        className={`absolute bottom-1 right-1 p-1 rounded-full bg-gray-100 hover:bg-green-100`}
                        title="Add Entry"
                        onClick={() => { setAddEntryDate(day.date); setShowWeightEntry(true); }}
                        style={{ lineHeight: 0 }}
                      >
                        <Plus className="w-3 h-3 text-green-600" />
                      </button>
                    )
                  )}
                  
                  {/* Show lock icon for dates before goal creation */}
                  {isBeforeGoalCreation && (
                    <div className="absolute bottom-1 right-1 p-1 rounded-full bg-gray-200">
                      <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <ReactTooltip id={`weight-tooltip-${idx}`} place="top" effect="solid" />
                </div>
              );
            });
          })()}
        </div>
      </motion.div>

      {/* Floating Add Weight Button */}
      <button
        className={`fixed bottom-8 right-8 z-50 ${hasLoggedToday ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl transition-all duration-200 focus:outline-none focus:ring-4 ${hasLoggedToday ? 'focus:ring-blue-300' : 'focus:ring-red-300'}`}
        title={hasLoggedToday ? "View Today's Entry" : "Add Weight Entry"}
        onClick={() => hasLoggedToday ? setShowViewToday(true) : setShowWeightEntry(true)}
      >
        <Scale className="w-8 h-8" />
        <span className="sr-only">{hasLoggedToday ? "View Today's Entry" : "Add Weight Entry"}</span>
      </button>
      {/* Weight Entry Modal */}
      {showWeightEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="bg-gradient-to-br from-white via-blue-50 to-cyan-50 rounded-2xl shadow-2xl border border-blue-200 px-0 py-0 max-w-2xl w-full relative flex flex-col items-center"
            style={{ boxShadow: '0 8px 40px 0 rgba(16, 112, 202, 0.10), 0 1.5px 8px 0 rgba(0,0,0,0.04)' }}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-3xl font-bold focus:outline-none bg-white/70 rounded-full w-10 h-10 flex items-center justify-center shadow-md transition"
              onClick={() => setShowWeightEntry(false)}
              aria-label="Close"
              style={{ lineHeight: 1 }}
            >
              &times;
            </button>
            <div className="w-full flex flex-col items-center pt-8 pb-2 px-8 border-b border-blue-100 mb-2">
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-blue-100 text-blue-600 rounded-full p-2 flex items-center justify-center shadow-sm">
                  <Scale className="w-7 h-7" />
                </span>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {addEntryDate ? `Weight Entry: ${new Date(addEntryDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}` : 'Weight Entry'}
                </h2>
              </div>
              <p className="text-gray-500 text-sm text-center">Track your daily weight progress</p>
            </div>
            <div className="w-full px-8 pb-8 pt-2">
              <SimpleWeightEntryForm
                onEntryAdded={handleEntryAdded}
                defaultDate={addEntryDate}
                goalId={activeGoalId}
                onClose={() => setShowWeightEntry(false)}
                userProfile={userProfile}
              />
            </div>
          </motion.div>
        </div>
      )}
      {/* View Today's Entry Modal */}
      {showViewToday && todaysEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="bg-gradient-to-br from-white via-blue-50 to-cyan-50 rounded-2xl shadow-2xl border border-blue-200 px-0 py-0 max-w-md w-full relative flex flex-col items-center"
            style={{ boxShadow: '0 8px 40px 0 rgba(16, 112, 202, 0.10), 0 1.5px 8px 0 rgba(0,0,0,0.04)' }}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-3xl font-bold focus:outline-none bg-white/70 rounded-full w-10 h-10 flex items-center justify-center shadow-md transition"
              onClick={() => setShowViewToday(false)}
              aria-label="Close"
              style={{ lineHeight: 1 }}
            >
              &times;
            </button>
            <div className="w-full flex flex-col items-center pt-8 pb-2 px-8 border-b border-blue-100 mb-2">
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-blue-100 text-blue-600 rounded-full p-2 flex items-center justify-center shadow-sm">
                  <Scale className="w-7 h-7" />
                </span>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Today's Weight Entry</h2>
              </div>
            </div>
            <div className="w-full px-8 pb-8 pt-2 flex flex-col items-center">
              <div className="text-4xl font-extrabold text-blue-700 mb-2">{todaysEntry.weight} kg</div>
              <div className="text-lg text-gray-700 mb-1">{new Date(todaysEntry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                onClick={() => { setEditingEntry(todaysEntry); setShowViewToday(false); }}
              >
                Edit
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* View Entry Modal */}
      {showViewEntry && viewingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="bg-gradient-to-br from-white via-blue-50 to-cyan-50 rounded-2xl shadow-2xl border border-blue-200 px-0 py-0 max-w-md w-full relative flex flex-col items-center"
            style={{ boxShadow: '0 8px 40px 0 rgba(16, 112, 202, 0.10), 0 1.5px 8px 0 rgba(0,0,0,0.04)' }}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-3xl font-bold focus:outline-none bg-white/70 rounded-full w-10 h-10 flex items-center justify-center shadow-md transition"
              onClick={() => setShowViewEntry(false)}
              aria-label="Close"
              style={{ lineHeight: 1 }}
            >
              &times;
            </button>
            <div className="w-full flex flex-col items-center pt-8 pb-2 px-8 border-b border-blue-100 mb-2">
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-blue-100 text-blue-600 rounded-full p-2 flex items-center justify-center shadow-sm">
                  <Scale className="w-7 h-7" />
                </span>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Weight Entry: {new Date(viewingEntry.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                </h2>
              </div>
            </div>
            <div className="w-full px-8 pb-8 pt-2 flex flex-col items-center">
              <div className="text-4xl font-extrabold text-blue-700 mb-2">{viewingEntry.weight} kg</div>
              <div className="text-lg text-gray-700 mb-1">{new Date(viewingEntry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
              {viewingEntry.notes && (
                <div className="text-sm text-gray-600 mb-4 text-center max-w-xs">
                  {viewingEntry.notes}
                </div>
              )}
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                onClick={() => { setEditingEntry(viewingEntry); setShowViewEntry(false); }}
              >
                Edit
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl shadow-2xl border border-blue-200 px-8 py-8 max-w-md w-full relative flex flex-col items-center"
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-3xl font-bold focus:outline-none bg-white/70 rounded-full w-10 h-10 flex items-center justify-center shadow-md transition"
              onClick={() => setEditingEntry(null)}
              aria-label="Close"
              style={{ lineHeight: 1 }}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Weight Entry</h2>
                            <EditWeightEntryForm entry={editingEntry} onClose={() => { setEditingEntry(null); }} userProfile={userProfile} goalEntries={goalEntries} onEntryUpdated={handleEntryUpdated} />
          </motion.div>
        </div>
      )}
    </div>
  );
};

function SimpleWeightEntryForm({ onEntryAdded, defaultDate, goalId, onClose, userProfile }) {
  const { currentUser } = useUser();
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(() => {
    if (defaultDate) {
      // Ensure defaultDate is in YYYY-MM-DD format
      const dateObj = new Date(defaultDate);
      return dateObj.toISOString().slice(0, 10);
    }
    return new Date().toISOString().slice(0, 10);
  });

  // Check if selected date is before goal creation (allow goal creation date itself)
  const isBeforeGoalCreation = userProfile && userProfile.goalCreatedAt && 
    new Date(date + 'T00:00:00') < new Date(userProfile.goalCreatedAt).setHours(0, 0, 0, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight) return;
    
    // Check if date is before goal creation
    if (isBeforeGoalCreation) {
      alert('Cannot add weight entries for dates before your goal creation date.');
      return;
    }
    
    // Validate goalId
    if (!goalId || (goalId !== 'demo' && !isValidObjectId(goalId))) {
      alert('Invalid goal ID. Please refresh the page and try again.');
      return;
    }
    
    setLoading(true);
    try {
      const entryData = {
        weight: parseFloat(weight),
        notes,
        userId: currentUser.id,
        date,
        goalId
      };
      console.log('Sending weight entry data:', entryData);
      await weightEntryAPI.createEntry(entryData);
      
      onEntryAdded();
      onClose();
    } catch (error) {
      console.error('Failed to add weight entry:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add weight entry. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={userProfile?.goalCreatedAt ? new Date(userProfile.goalCreatedAt).toISOString().slice(0, 10) : undefined}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 pr-10 ${
              isBeforeGoalCreation 
                ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        {isBeforeGoalCreation && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠️</span>
            Cannot add entries for dates before your goal creation date ({new Date(userProfile.goalCreatedAt).toLocaleDateString('en-GB')})
          </p>
        )}
        {userProfile && userProfile.goalCreatedAt && (
          <p className="mt-1 text-sm text-blue-600">
            📅 You can add entries from {new Date(userProfile.goalCreatedAt).toLocaleDateString('en-GB')} onwards
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
        <input
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your weight"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Any notes about today's weight..."
        />
      </div>
      
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !weight || isBeforeGoalCreation}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Adding...' : 'Add Entry'}
        </button>
      </div>
    </form>
  );
}

function EditWeightEntryForm({ entry, onClose, userProfile, goalEntries, onEntryUpdated }) {
  const { currentUser } = useUser();
  const [weight, setWeight] = useState(entry.weight);
  const [notes, setNotes] = useState(entry.notes || '');
  const [loading, setLoading] = useState(false);
  // Fix: Check for both _id (MongoDB) and id (frontend) fields
  const isNew = !(entry._id || entry.id);
  
  function findEntryByDate(entries, date) {
    return entries?.find(e => {
      const d = new Date(e.date);
      const t = new Date(date);
      return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
    });
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Fix: Use _id (MongoDB) or id (frontend) field
      const entryId = entry._id || entry.id;
      let existing = entryId ? entry : findEntryByDate(goalEntries, entry.date);
      
      // Always send date as 'YYYY-MM-DD'
      const dateStr = typeof entry.date === 'string' ? entry.date : new Date(entry.date).toISOString().slice(0, 10);
      
      // Fix: Use _id (MongoDB) or id (frontend) field for existing entry
      const existingId = existing._id || existing.id;
      
      if (existing && existingId) {
        // Always use the current user's active goalId from userProfile
        const goalId = userProfile?.goalId;
        
        console.log('Edit entry data:', { 
          entryId: existingId, 
          weight, 
          notes, 
          userId: currentUser.id, 
          date: dateStr, 
          goalId,
          userProfile: userProfile?.goalId,
          isValidObjectId: isValidObjectId(existingId)
        });
        
        // Check if the entry ID is valid
        if (!existingId || (existingId !== 'demo' && !isValidObjectId(existingId))) {
          console.error('Invalid entry ID:', existingId);
          alert('Cannot update: Invalid entry ID. Please try refreshing the page.');
          return;
        }
        
        if (!goalId || (goalId !== 'demo' && !isValidObjectId(goalId))) {
          alert('Cannot update: No valid goal ID found.');
          return;
        }
        
        await weightEntryAPI.updateEntry(existingId, { weight, notes, userId: currentUser.id, date: dateStr, goalId });
        // Refresh the dashboard data after updating
        if (onEntryUpdated) {
          onEntryUpdated();
        }
        onClose();
      } else {
        alert('Cannot update: No existing entry for this date.');
      }
    } catch (err) {
      console.error('Error updating weight entry:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save entry.';
      alert(`Failed to save entry: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-4">
      <h2 className="text-lg font-semibold text-center text-gray-900 mb-2">
        Edit Weight Entry for: {formatGridDate(new Date(entry.date))}
      </h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
        <input
          type="number"
          step="0.1"
          className="input-field w-full"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          className="input-field w-full"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? (isNew ? 'Adding...' : 'Saving...') : (isNew ? 'Add Entry' : 'Save Changes')}
      </button>
    </form>
  );
}

export default Dashboard; 