import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Target,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { calculateBMI, weightEntryAPI, userAPI, isValidObjectId } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, ReferenceLine } from 'recharts';

const Analytics = () => {
  const { currentUser } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState('90');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const ENTRIES_PER_PAGE = 7;
  const [userProfile, setUserProfile] = useState(null);
  const [showGoalNotification, setShowGoalNotification] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // ENABLED: For real user data loading
  const loadUserProfileAndAnalytics = async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      
      // For demo users, we'll get analytics from backend but set a demo profile
      if (currentUser.id === 'demo') {
        console.log('🔍 Loading analytics for demo user...');
        // Load analytics data from backend (which has consistent demo data)
        const analyticsResponse = await weightEntryAPI.getAnalytics(currentUser.id, {
          period: selectedPeriod
        });
        
        console.log('📊 Demo analytics response:', analyticsResponse);
        
        if (analyticsResponse.analytics) {
          console.log('✅ Setting analytics data for demo user');
          setAnalytics(analyticsResponse.analytics);
          
          // Set demo user profile
    setUserProfile({
      id: 'demo',
      name: 'Demo User',
      email: 'demo@example.com',
      mobile: '+1234567890',
      gender: 'male',
      age: 30,
      height: 170,
            currentWeight: analyticsResponse.analytics.currentWeight,
            targetWeight: analyticsResponse.analytics.targetWeight,
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
      } else {
        // Load user profile for real users
        const profile = await userAPI.getUser(currentUser.id);
        setUserProfile(profile);
        
        // Load analytics data
        const analyticsResponse = await weightEntryAPI.getAnalytics(currentUser.id, {
          period: selectedPeriod,
          goalId: profile.goalId
        });
        
        if (analyticsResponse.analytics) {
          setAnalytics(analyticsResponse.analytics);
        }
      }
    } catch (error) {
      console.error('❌ Error loading analytics:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Don't show toast error for data loading
    } finally {
    setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser?.id) return;
    
    // For both demo and real users, load data from backend
    // This ensures consistency in data structure and behavior
    console.log('Loading analytics data from backend for user:', currentUser.id);
    loadUserProfileAndAnalytics();
  }, [currentUser?.id, selectedPeriod]);

  // Reset attempt flag when user changes
  useEffect(() => {
    setHasAttemptedLoad(false);
  }, [currentUser?.id]);

  const getTrendIcon = () => {
    if (!analytics || !analytics.trend) return <Minus className="w-4 h-4 text-gray-600" />;
    
    if (analytics.trend === 'decreasing') return <ArrowDown className="w-4 h-4 text-success-600" />;
    if (analytics.trend === 'increasing') return <ArrowUp className="w-4 h-4 text-danger-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (!analytics || !analytics.trend) return 'text-gray-600';
    
    if (analytics.trend === 'decreasing') return 'text-success-600';
    if (analytics.trend === 'increasing') return 'text-danger-600';
    return 'text-gray-600';
  };

  // Function to get trend-based background color
  const getTrendBackgroundColor = (trend) => {
    switch (trend?.toLowerCase()) {
      case 'decreasing':
        return 'bg-green-50 border-green-200';
      case 'increasing':
        return 'bg-red-50 border-red-200';
      case 'stable':
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Function to get trend-based text color
  const getTrendTextColor = (trend) => {
    switch (trend?.toLowerCase()) {
      case 'decreasing':
        return 'text-green-700';
      case 'increasing':
        return 'text-red-700';
      case 'stable':
      default:
        return 'text-gray-700';
    }
  };

  // Function to get trend-based icon color
  const getTrendIconColor = (trend) => {
    switch (trend?.toLowerCase()) {
      case 'decreasing':
        return 'from-green-500 to-emerald-500';
      case 'increasing':
        return 'from-red-500 to-pink-500';
      case 'stable':
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your analytics...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  // Check if analytics data is available
  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No analytics data available</p>
        <p className="text-sm text-gray-500 mt-2">
          Try refreshing the page or check your connection
        </p>
      </div>
    );
  }

  // Check if user has no active goal
  const hasNoActiveGoal = !userProfile || userProfile.goalStatus !== 'active';

  // Use analytics.entries if present, otherwise fallback to analytics.bmiTrend
  const entries = analytics?.entries || analytics?.bmiTrend || [];
  
  // Calculate BMI for all entries if user has height
  const entriesWithBMI = entries.map(entry => ({
    ...entry,
    bmi: userProfile?.height ? calculateBMI(entry.weight, userProfile.height) : null
  }));
  
  // Sort entries by date in ascending order (oldest first) for proper graph display
  const sortedEntries = [...entriesWithBMI].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Calculate median weight for trend line (using last 90 days)
  const calculateMedianWeight = (data) => {
    if (data.length === 0) return null;
    const weights = data.map(entry => entry.weight).filter(w => w && typeof w === 'number');
    if (weights.length === 0) return null;
    
    weights.sort((a, b) => a - b);
    const mid = Math.floor(weights.length / 2);
    return weights.length % 2 === 0 
      ? (weights[mid - 1] + weights[mid]) / 2 
      : weights[mid];
  };
  
  const last90Days = sortedEntries.slice(-90);
  const medianWeight = calculateMedianWeight(last90Days);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-5 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Goal Creation Notification */}
      {hasNoActiveGoal && showGoalNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 shadow-xl border border-orange-400/20 relative overflow-hidden"
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
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {userProfile?.goalStatus === 'achieved' ? 'Goal Achieved!' : 'No Active Goal Found'}
                </h3>
                <p className="text-orange-100 text-lg">
                  {userProfile?.goalStatus === 'achieved' 
                    ? "Congratulations! You've reached your target. Set a new goal to continue your journey!"
                    : "Create a weight loss goal to unlock detailed analytics and progress insights!"
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
      )}

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
      >
          <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Analytics
          </h1>
          <p className="text-gray-600 text-lg">
            Detailed insights into your weight journey
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadUserProfileAndAnalytics}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-orange-500/25"
            title="Refresh Analytics"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Overview Cards Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Summary Statistics</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`backdrop-blur-sm rounded-xl p-4 shadow-md border hover:shadow-lg transition-all duration-300 ${getTrendBackgroundColor(analytics?.trend)}`}
        >
          <div className="flex items-center justify-between">
            <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalEntries || 0}</p>
            </div>
              <div className={`w-10 h-10 bg-gradient-to-r ${getTrendIconColor(analytics?.trend)} rounded-lg flex items-center justify-center shadow-md`}>
                <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
            <div className="mt-2">
              <p className="text-xs text-gray-600 font-medium">
              Last {selectedPeriod} days
            </p>
          </div>
        </motion.div>

        {/* Average Weight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`backdrop-blur-sm rounded-xl p-4 shadow-md border hover:shadow-lg transition-all duration-300 ${getTrendBackgroundColor(analytics?.trend)}`}
        >
          <div className="flex items-center justify-between">
            <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Average Weight</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.averageWeight || '0.0'} kg</p>
            </div>
              <div className={`w-10 h-10 bg-gradient-to-r ${getTrendIconColor(analytics?.trend)} rounded-lg flex items-center justify-center shadow-md`}>
                <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
            <div className="mt-2">
              <p className="text-xs text-gray-600 font-medium">
              Over {selectedPeriod} days
            </p>
          </div>
        </motion.div>

        {/* Weight Change */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`backdrop-blur-sm rounded-xl p-4 shadow-md border hover:shadow-lg transition-all duration-300 ${getTrendBackgroundColor(analytics?.trend)}`}
        >
          <div className="flex items-center justify-between">
            <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Weight Change</p>
                <p className={`text-2xl font-bold ${getTrendTextColor(analytics?.trend)}`}>{analytics?.weightChange || '0.0'} kg</p>
            </div>
              <div className={`w-10 h-10 bg-gradient-to-r ${getTrendIconColor(analytics?.trend)} rounded-lg flex items-center justify-center shadow-md`}>
              {getTrendIcon()}
            </div>
          </div>
            <div className="mt-2">
              <p className={`text-xs font-medium ${getTrendTextColor(analytics?.trend)}`}>
                {analytics?.trend || 'Stable'}
              </p>
          </div>
        </motion.div>

        {/* Progress to Target */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`backdrop-blur-sm rounded-xl p-4 shadow-md border hover:shadow-lg transition-all duration-300 ${getTrendBackgroundColor(analytics?.trend)}`}
        >
          <div className="flex items-center justify-between">
            <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Progress to Target</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.progressToTarget?.toFixed(1) || '0.0'}%</p>
            </div>
              <div className={`w-10 h-10 bg-gradient-to-r ${getTrendIconColor(analytics?.trend)} rounded-lg flex items-center justify-center shadow-md`}>
                <Target className="w-5 h-5 text-white" />
            </div>
          </div>
            <div className="mt-2">
              <p className="text-xs text-gray-600 font-medium">
                Goal Progress
              </p>
          </div>
        </motion.div>

          {/* Latest Weight - Additional Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`backdrop-blur-sm rounded-xl p-4 shadow-md border hover:shadow-lg transition-all duration-300 lg:block hidden ${getTrendBackgroundColor(analytics?.trend)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Latest Weight</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.currentWeight || '0.0'} kg</p>
              </div>
              <div className={`w-10 h-10 bg-gradient-to-r ${getTrendIconColor(analytics?.trend)} rounded-lg flex items-center justify-center shadow-md`}>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-600 font-medium">
                Current
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Progress Trend Analysis Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
              </div>
          <h2 className="text-xl font-bold text-gray-900">Progress Trend Analysis</h2>
            </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Last 7 Days */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`backdrop-blur-sm rounded-xl p-4 shadow-md border hover:shadow-lg transition-all duration-300 text-center ${getTrendBackgroundColor(analytics?.trend)}`}
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${getTrendIconColor(analytics?.trend)} rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md`}>
              <ArrowUp className="w-6 h-6 text-white" />
            </div>
            <p className={`text-2xl font-bold mb-1 ${getTrendTextColor(analytics?.trend)}`}>0.0 kg</p>
            <p className="text-xs text-gray-600 font-semibold">Last 7 Days</p>
          </motion.div>

          {/* Last 30 Days */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`backdrop-blur-sm rounded-xl p-4 shadow-md border hover:shadow-lg transition-all duration-300 text-center ${getTrendBackgroundColor(analytics?.trend)}`}
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${getTrendIconColor(analytics?.trend)} rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md`}>
              <Calendar className="w-6 h-6 text-white" />
              </div>
            <p className={`text-2xl font-bold mb-1 ${getTrendTextColor(analytics?.trend)}`}>0.0 kg</p>
            <p className="text-xs text-gray-600 font-semibold">Last 30 Days</p>
          </motion.div>

          {/* Total Change */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`backdrop-blur-sm rounded-xl p-4 shadow-md border hover:shadow-lg transition-all duration-300 text-center ${getTrendBackgroundColor(analytics?.trend)}`}
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${getTrendIconColor(analytics?.trend)} rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md`}>
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className={`text-2xl font-bold mb-1 ${getTrendTextColor(analytics?.trend)}`}>0.0 kg</p>
            <p className="text-xs text-gray-600 font-semibold">Total Change</p>
          </motion.div>

          {/* Weekly Average - Additional Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`backdrop-blur-sm rounded-xl p-4 shadow-md border hover:shadow-lg transition-all duration-300 text-center ${getTrendBackgroundColor(analytics?.trend)}`}
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${getTrendIconColor(analytics?.trend)} rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md`}>
              <TrendingUp className="w-6 h-6 text-white" />
          </div>
            <p className={`text-2xl font-bold mb-1 ${getTrendTextColor(analytics?.trend)}`}>0.0 kg</p>
            <p className="text-xs text-gray-600 font-semibold">Weekly Average</p>
        </motion.div>
        </div>
      </motion.div>

      {/* Charts Section */}
      {entries && entries.length > 0 ? (
        <div className="space-y-8">
          {/* Enhanced Weight & BMI Trend Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              <div>
                  <h2 className="text-2xl font-bold text-gray-900">Weight & BMI Trend ({selectedPeriod} Days)</h2>
                  <p className="text-gray-600">Track your weight and BMI changes over time</p>
              </div>
                </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <ResponsiveContainer width="100%" height={450}>
              <LineChart 
                data={sortedEntries} 
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  yAxisId="left" 
                        domain={['dataMin - 2', 'dataMax + 2']}
                        label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontWeight: 'bold' } }}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                        domain={['dataMin - 1', 'dataMax + 1']}
                        label={{ value: 'BMI', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#6b7280', fontWeight: 'bold' } }}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{
                          backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          padding: '12px'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [
                          name === 'weight' ? `${value} kg` : value.toFixed(1),
                          name === 'weight' ? 'Weight' : 'BMI'
                        ]}
                      />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3b82f6" 
                        strokeWidth={4}
                        dot={{ fill: '#3b82f6', strokeWidth: 3, r: 6, stroke: '#ffffff' }}
                        activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 3, fill: '#ffffff' }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="bmi" 
                  stroke="#10b981" 
                        strokeWidth={4}
                        dot={{ fill: '#10b981', strokeWidth: 3, r: 6, stroke: '#ffffff' }}
                        activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 3, fill: '#ffffff' }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Add reference lines for better visualization */}
                      <ReferenceLine 
                        yAxisId="left"
                        y={sortedEntries[0]?.weight} 
                        stroke="#3b82f6" 
                        strokeDasharray="5 5" 
                        strokeOpacity={0.5}
                        label={{ value: 'Starting Weight', position: 'top', fill: '#3b82f6', fontSize: 10 }}
                      />
                      <ReferenceLine 
                        yAxisId="right"
                        y={25} 
                        stroke="#f59e0b" 
                        strokeDasharray="3 3" 
                        strokeOpacity={0.7}
                        label={{ value: 'Overweight Threshold', position: 'top', fill: '#f59e0b', fontSize: 10 }}
                />
              </LineChart>
            </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Weight Distribution and BMI Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weight Distribution */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Weight Distribution</h2>
                    <p className="text-gray-600">Visualize your weight entries over time</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <ResponsiveContainer width="100%" height={350}>
              <BarChart 
                      data={sortedEntries} 
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                        domain={['dataMin - 1', 'dataMax + 1']}
                        label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontWeight: 'bold' } }}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{
                          backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          padding: '12px'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [`${value} kg`, 'Weight']}
                />
                <Bar 
                  dataKey="weight" 
                        fill="url(#weightGradient)"
                        radius={[6, 6, 0, 0]}
                        stroke="#3b82f6"
                        strokeWidth={1}
                      />
                      <defs>
                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                      <ReferenceLine
                        y={medianWeight}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        strokeWidth={2}
                        label={{ value: 'Median Weight', position: 'top', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }}
                      />
              </BarChart>
            </ResponsiveContainer>
                </div>
              </div>
          </motion.div>

            {/* BMI Trends */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">BMI Trends</h2>
                    <p className="text-gray-600">Monitor your BMI changes over time</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <ResponsiveContainer width="100%" height={350}>
              <LineChart 
                      data={sortedEntries} 
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                        domain={['dataMin - 0.5', 'dataMax + 0.5']}
                        label={{ value: 'BMI', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontWeight: 'bold' } }}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{
                          backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          padding: '12px'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value) => [value.toFixed(1), 'BMI']}
                />
                <Line 
                  type="monotone" 
                  dataKey="bmi" 
                  stroke="#10b981" 
                        strokeWidth={4}
                        dot={{ fill: '#10b981', strokeWidth: 3, r: 5, stroke: '#ffffff' }}
                        activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 3, fill: '#ffffff' }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <ReferenceLine
                        y={25}
                        stroke="#f59e0b"
                        strokeDasharray="3 3"
                  strokeWidth={2} 
                        label={{ value: 'Overweight Threshold', position: 'top', fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }}
                      />
                      <ReferenceLine
                        y={18.5}
                        stroke="#3b82f6"
                        strokeDasharray="3 3"
                        strokeWidth={2}
                        strokeOpacity={0.7}
                        label={{ value: 'Normal Weight', position: 'bottom', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }}
                      />
              </LineChart>
            </ResponsiveContainer>
                </div>
              </div>
          </motion.div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm"
        >
          <div className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 px-6 py-6 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-14 translate-x-14"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
            
            <div className="flex items-center space-x-3 relative z-10">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/30">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white drop-shadow-sm">No Data Available</h3>
            </div>
          </div>
          <div className="p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BarChart3 className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Weight Entries Found</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">Start tracking your weight to see analytics and trends. Add your first weight entry to unlock detailed insights!</p>
          </div>
        </motion.div>
      )}

      {/* Historical Weight Logs Table */}
      {entries && entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Weight Logs</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Weight (kg)</th>
                  <th className="px-4 py-2 text-left">BMI</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {sortedEntries.slice((page - 1) * ENTRIES_PER_PAGE, page * ENTRIES_PER_PAGE).map((entry, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="px-4 py-2">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 font-semibold">{entry.weight}</td>
                    <td className="px-4 py-2">{entry.bmi}</td>
                    <td className="px-4 py-2 text-gray-500 italic">{entry.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-end items-center mt-2 space-x-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="text-xs text-gray-600">Page {page} of {Math.ceil(sortedEntries.length / ENTRIES_PER_PAGE)}</span>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold disabled:opacity-50"
              onClick={() => setPage(p => Math.min(Math.ceil(sortedEntries.length / ENTRIES_PER_PAGE), p + 1))}
              disabled={page === Math.ceil(sortedEntries.length / ENTRIES_PER_PAGE)}
            >
              Next
            </button>
          </div>
        </motion.div>
      )}

      {/* BMI Category Breakdown */}
      {entries && entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">BMI Category Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(() => {
              const latestBMI = sortedEntries[sortedEntries.length - 1]?.bmi;
              const getBMICategory = (bmi) => {
                if (!bmi || typeof bmi !== 'number') return { name: 'Unknown', color: 'gray', bg: 'from-gray-400 to-gray-500', text: 'text-gray-700' };
                if (bmi < 18.5) return { name: 'Underweight', color: 'yellow', bg: 'from-yellow-400 to-yellow-500', text: 'text-yellow-700' };
                if (bmi < 25) return { name: 'Normal', color: 'green', bg: 'from-green-400 to-green-500', text: 'text-green-700' };
                if (bmi < 30) return { name: 'Overweight', color: 'orange', bg: 'from-orange-400 to-orange-500', text: 'text-orange-700' };
                return { name: 'Obese', color: 'red', bg: 'from-red-400 to-red-500', text: 'text-red-700' };
              };
              
              const currentCategory = getBMICategory(latestBMI);
              const categories = [
                { name: 'Underweight', range: '< 18.5', color: 'yellow', bg: 'from-yellow-50 to-yellow-100', border: 'border-yellow-200' },
                { name: 'Normal', range: '18.5 - 24.9', color: 'green', bg: 'from-green-50 to-green-100', border: 'border-green-200' },
                { name: 'Overweight', range: '25.0 - 29.9', color: 'orange', bg: 'from-orange-50 to-orange-100', border: 'border-orange-200' },
                { name: 'Obese', range: '≥ 30.0', color: 'red', bg: 'from-red-50 to-red-100', border: 'border-red-200' }
              ];
              
              return categories.map((category, index) => {
                const isCurrent = category.name === currentCategory.name;
                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      isCurrent 
                        ? `bg-gradient-to-br ${category.bg} ${category.border} shadow-lg scale-105` 
                        : `bg-gradient-to-br ${category.bg} ${category.border} opacity-75`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold ${isCurrent ? category.text : 'text-gray-600'}`}>
                        {category.name}
                      </h4>
                      {isCurrent && (
                        <div className={`w-3 h-3 bg-${category.color}-500 rounded-full animate-pulse`}></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{category.range}</p>
                    {isCurrent && (
                      <p className={`text-lg font-bold ${category.text}`}>
                        Current: {latestBMI && typeof latestBMI === 'number' ? latestBMI.toFixed(1) : '0.0'}
                      </p>
                    )}
                  </div>
                );
              });
            })()}
          </div>
          
          {/* BMI Trend Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">BMI Trend Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Starting BMI: </span>
                <span className="font-semibold">{sortedEntries[0]?.bmi && typeof sortedEntries[0].bmi === 'number' ? sortedEntries[0].bmi.toFixed(1) : '0.0'}</span>
              </div>
              <div>
                <span className="text-gray-600">Current BMI: </span>
                <span className="font-semibold">{sortedEntries[sortedEntries.length - 1]?.bmi && typeof sortedEntries[sortedEntries.length - 1].bmi === 'number' ? sortedEntries[sortedEntries.length - 1].bmi.toFixed(1) : '0.0'}</span>
            </div>
              <div>
                <span className="text-gray-600">BMI Change: </span>
                <span className={`font-semibold ${sortedEntries[sortedEntries.length - 1]?.bmi < sortedEntries[0]?.bmi ? 'text-green-600' : 'text-red-600'}`}>
                  {sortedEntries[sortedEntries.length - 1]?.bmi && sortedEntries[0]?.bmi && typeof sortedEntries[sortedEntries.length - 1].bmi === 'number' && typeof sortedEntries[0].bmi === 'number' ? (sortedEntries[sortedEntries.length - 1].bmi - sortedEntries[0].bmi).toFixed(1) : '0.0'}
                </span>
            </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics; 