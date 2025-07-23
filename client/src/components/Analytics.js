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

  const loadUserProfileAndAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await userAPI.getUser(currentUser.id);
      setUserProfile(profile);
      
      // Get active goalId from userProfile
      const activeGoalId = profile && profile.goalId && (profile.goalId === 'demo' || isValidObjectId(profile.goalId)) ? profile.goalId : null;
      
      // Pass goalCreatedAt as startDate if present, and goalId for goal-level analytics
      const params = { period: selectedPeriod };
      if (profile.goalCreatedAt) {
        params.startDate = profile.goalCreatedAt;
      }
      if (activeGoalId) {
        params.goalId = activeGoalId;
      }
      
      const response = await weightEntryAPI.getAnalytics(currentUser.id, params);
      if (response.analytics) {
        setAnalytics(response.analytics);
      } else {
        // No data available, show empty state
        setAnalytics({
          totalEntries: 0,
          averageWeight: 0,
          weightChange: 0,
          trend: 'stable',
          entries: [],
          currentWeight: profile.currentWeight || 0,
          targetWeight: profile.targetWeight || 0,
          progressToTarget: 0,
          initialWeight: profile.currentWeight || 0
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics({
        totalEntries: 0,
        averageWeight: 0,
        weightChange: 0,
        trend: 'stable',
        entries: [],
        currentWeight: 0,
        targetWeight: 0,
        progressToTarget: 0,
        initialWeight: 0
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedPeriod]);

  const generateSampleAnalytics = useCallback(() => {
    const days = parseInt(selectedPeriod);
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
        notes: i % 7 === 0 ? 'Weekly check-in' : '',
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
    setAnalytics({
      totalEntries: entries.length,
      averageWeight: averageWeight.toFixed(1),
      weightChange: weightChange.toFixed(1),
      trend,
      entries,
      currentWeight: weights[weights.length - 1],
      targetWeight: 70,
      progressToTarget: Math.max(0, Math.min(100, ((startWeight - weights[weights.length - 1]) / (startWeight - 70)) * 100)),
      initialWeight: startWeight
    });
    setUserProfile({
      id: 'demo',
      name: 'Demo User',
      email: 'demo@example.com',
      mobile: '+1234567890',
      gender: 'male',
      age: 30,
      height: 170,
      currentWeight: weights[weights.length - 1],
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
    setLoading(false);
  }, [selectedPeriod]);

  useEffect(() => {
    if (currentUser && currentUser.id !== 'demo') {
      loadUserProfileAndAnalytics();
    } else if (currentUser && currentUser.id === 'demo') {
      // Demo user - generate sample analytics data
      generateSampleAnalytics();
    }
  }, [currentUser, loadUserProfileAndAnalytics, generateSampleAnalytics]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Check if analytics data is available
  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No analytics data available</p>
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Goal Creation Notification */}
      {hasNoActiveGoal && showGoalNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl p-6 shadow-xl border border-indigo-400/20 relative"
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
                <h3 className="text-xl font-bold text-white mb-1">No Active Goal Found</h3>
                <p className="text-indigo-100 text-lg">
                  Create a weight loss goal to unlock detailed analytics and progress insights!
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/profile'}
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Create Goal
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-success-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Detailed insights into your weight journey</p>
          </div>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field w-28"
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="90" selected>90 days</option>
          </select>
          <button
            onClick={loadUserProfileAndAnalytics}
            className="ml-2 px-3 py-1 rounded bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition"
            title="Refresh Analytics"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalEntries || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Last {selectedPeriod} days
            </p>
          </div>
        </motion.div>

        {/* Average Weight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Weight</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.averageWeight || '0.0'} kg</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Over {selectedPeriod} days
            </p>
          </div>
        </motion.div>

        {/* Weight Change */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Weight Change</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.weightChange} kg</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              {getTrendIcon()}
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {analytics.trend === 'decreasing' ? 'Losing' : 
               analytics.trend === 'increasing' ? 'Gaining' : 'Stable'}
            </span>
          </div>
        </motion.div>

        {/* Progress to Target */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Progress to Target</p>
              <p className="text-2xl font-bold text-gray-900">{analytics && typeof analytics.progressToTarget === 'number' && !isNaN(analytics.progressToTarget) ? analytics.progressToTarget.toFixed(1) : '0'}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                style={{ width: `${Math.min(analytics?.progressToTarget || 0, 100)}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Trend Indicator */}
      {entries && entries.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Trend Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Weekly Progress */}
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {(() => {
                  const lastWeek = sortedEntries.slice(-7);
                  if (lastWeek.length < 2) return '0.0';
                  const lastWeight = lastWeek[lastWeek.length - 1].weight;
                  const firstWeight = lastWeek[0].weight;
                  return (lastWeight && firstWeight && typeof lastWeight === 'number' && typeof firstWeight === 'number') ? (lastWeight - firstWeight).toFixed(1) : '0.0';
                })()} kg
              </p>
              <p className="text-sm text-gray-600">Last 7 Days</p>
            </div>

            {/* Monthly Progress */}
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {(() => {
                  const lastMonth = sortedEntries.slice(-30);
                  if (lastMonth.length < 2) return '0.0';
                  const lastWeight = lastMonth[lastMonth.length - 1].weight;
                  const firstWeight = lastMonth[0].weight;
                  return (lastWeight && firstWeight && typeof lastWeight === 'number' && typeof firstWeight === 'number') ? (lastWeight - firstWeight).toFixed(1) : '0.0';
                })()} kg
              </p>
              <p className="text-sm text-gray-600">Last 30 Days</p>
            </div>

            {/* Overall Progress */}
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {(() => {
                  if (sortedEntries.length < 2) return '0.0';
                  const lastWeight = sortedEntries[sortedEntries.length - 1].weight;
                  const firstWeight = sortedEntries[0].weight;
                  return (lastWeight && firstWeight && typeof lastWeight === 'number' && typeof firstWeight === 'number') ? (lastWeight - firstWeight).toFixed(1) : '0.0';
                })()} kg
              </p>
              <p className="text-sm text-gray-600">Total Change</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts Section */}
      {entries && entries.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Weight & BMI Trend Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Weight & BMI Trend (90 Days)</h3>
                <p className="text-gray-600 text-sm">Track your weight and BMI changes over time</p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Weight (kg)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">BMI</span>
                </div>
              </div>
            </div>
            
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
                  domain={['auto', 'auto']} 
                  tickFormatter={v => `${v} kg`}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#374151', fontSize: 14 } }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={['auto', 'auto']} 
                  tickFormatter={v => v && typeof v === 'number' ? v.toFixed(1) : ''}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  label={{ value: 'BMI', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#374151', fontSize: 14 } }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={d => new Date(d).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  formatter={(value, name) => [
                    name === 'Weight (kg)' ? `${value || 0} kg` : (value && typeof value === 'number' ? value.toFixed(1) : '0.0'),
                    name
                  ]}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{ paddingBottom: '10px' }}
                />
                
                {/* Weight Line with Area */}
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="bmiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }} 
                  activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                  name="Weight (kg)"
                  connectNulls={true}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="bmi" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }} 
                  activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
                  name="BMI"
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
            
            {/* Chart Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1].weight : 0} kg
                </p>
                <p className="text-sm text-gray-600">Latest Weight</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {sortedEntries.length > 0 && sortedEntries[sortedEntries.length - 1].bmi ? sortedEntries[sortedEntries.length - 1].bmi.toFixed(1) : '0.0'}
                </p>
                <p className="text-sm text-gray-600">Latest BMI</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {(() => {
                  if (sortedEntries.length < 2) return '0.0';
                  const lastWeight = sortedEntries[sortedEntries.length - 1].weight;
                  const firstWeight = sortedEntries[0].weight;
                  return (lastWeight && firstWeight && typeof lastWeight === 'number' && typeof firstWeight === 'number') ? (lastWeight - firstWeight).toFixed(1) : '0.0';
                })()} kg
                </p>
                <p className="text-sm text-gray-600">Total Change</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {(() => {
                    if (sortedEntries.length === 0) return '0.0';
                    const validWeights = sortedEntries.filter(entry => entry.weight && typeof entry.weight === 'number');
                    if (validWeights.length === 0) return '0.0';
                    const average = validWeights.reduce((sum, entry) => sum + entry.weight, 0) / validWeights.length;
                    return average.toFixed(1);
                  })()} kg
                </p>
                <p className="text-sm text-gray-600">Average Weight</p>
              </div>
            </div>
          </motion.div>

          {/* Weight Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={sortedEntries.slice(-30)} // Last 30 entries (most recent)
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
                  domain={['auto', 'auto']} 
                  tickFormatter={v => `${v} kg`}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={d => new Date(d).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  formatter={(value) => [`${value} kg`, 'Weight']}
                />
                <Bar 
                  dataKey="weight" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  name="Weight"
                />
                {/* Median Weight Reference Line */}
                {medianWeight !== null && (
                  <ReferenceLine y={medianWeight} stroke="#10b981" strokeDasharray="3 3" label="Median Weight" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* BMI Category Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">BMI Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                data={sortedEntries.slice(-30)} // Last 30 entries (most recent)
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
                  domain={['auto', 'auto']} 
                  tickFormatter={v => v && typeof v === 'number' ? v.toFixed(1) : ''}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={d => new Date(d).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  formatter={(value) => [value && typeof value === 'number' ? value.toFixed(1) : '0.0', 'BMI']}
                />
                <Line 
                  type="monotone" 
                  dataKey="bmi" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#10b981' }} 
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  name="BMI"
                  connectNulls={true}
                />
                {/* BMI Category Reference Lines */}
                <ReferenceLine y={18.5} stroke="#f59e0b" strokeDasharray="3 3" label="Underweight" />
                <ReferenceLine y={25} stroke="#10b981" strokeDasharray="3 3" label="Normal" />
                <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="3 3" label="Overweight" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">Start adding weight entries to see your analytics</p>
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