import axios from 'axios';
import toast from 'react-hot-toast';

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // If we're in production and the environment variable is not set, use the production server
  if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL) {
    return 'https://gooofit.onrender.com/api';
  }
  // Use environment variable if available, otherwise use localhost:3001 for development
  return process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

// Debug: Log the API URL being used
console.log('🔍 API_BASE_URL:', API_BASE_URL);
console.log('🔍 REACT_APP_API_URL env var:', process.env.REACT_APP_API_URL);
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000, // Increased timeout to 20 seconds (Render free tier can be slow)
});

// Simple cache for API responses
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedResponse = (key) => {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedResponse = (key, data) => {
  apiCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Clear cache function for manual cache management
export const clearApiCache = () => {
  apiCache.clear();
  console.log('[API] Cache cleared');
};

// Clear specific cache entries
export const clearCacheForUser = (userId) => {
  const keysToDelete = [];
  for (const [key] of apiCache) {
    if (key.includes(`user_${userId}`) || key.includes(`analytics_${userId}`)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => apiCache.delete(key));
  console.log(`[API] Cleared ${keysToDelete.length} cache entries for user ${userId}`);
};

// Utility function to validate MongoDB ObjectId
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  // MongoDB ObjectId is a 24-character hex string
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Utility function to validate and sanitize API parameters
export const validateApiParams = (params) => {
  const validated = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'userId' || key === 'goalId') {
        if (isValidObjectId(value)) {
          validated[key] = value;
        } else {
          throw new Error(`Invalid ${key}: must be a valid MongoDB ObjectId`);
        }
      } else {
        validated[key] = value;
      }
    }
  }
  return validated;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add authentication token from localStorage
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing currentUser from localStorage:', error);
        // Clear invalid data from localStorage
        localStorage.removeItem('currentUser');
      }
    }
    
    // For demo users, don't add auth headers
    if (config.url?.includes('/demo') || 
        config.params?.userId === 'demo' || 
        config.url?.includes('/users/demo') || 
        config.url?.includes('/user/demo/analytics')) {
      // Remove any existing auth header for demo requests
      delete config.headers.Authorization;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    
    // Don't show toast errors for demo users or network errors that are expected
    const isDemoUser = error.config?.url?.includes('/demo') || 
                      (typeof error.config?.data === 'string' && error.config?.data?.includes('demo')) ||
                      error.config?.params?.userId === 'demo' ||
                      error.config?.url?.includes('demo') ||
                      error.config?.url?.includes('/users/demo') ||
                      error.config?.url?.includes('/user/demo/analytics');
    
    const isNetworkError = !error.response && error.message === 'Network Error';
    const isTimeoutError = error.code === 'ECONNABORTED' || (typeof error.message === 'string' && error.message.includes('timeout'));
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isExpectedFailure = isDemoUser || isNetworkError || isTimeoutError;
    
    // Handle authentication errors silently for demo users or when token might not be ready
    if (isAuthError && (isDemoUser || !localStorage.getItem('currentUser'))) {
      // Don't show auth errors for demo users or when no user is logged in
      return Promise.reject(error);
    }
    
    // Show authentication errors for debugging
    if (isAuthError && !isDemoUser) {
      const message = error.response?.data?.message || 'Authentication failed';
      console.error('[API] Auth error:', message);
      toast.error(message);
      
      // If token is invalid or expired, clear user data and redirect to login
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('[API] Clearing invalid user data and redirecting to login');
        localStorage.removeItem('currentUser');
        // Redirect to login page
        window.location.href = '/?login=true';
      }
    }
    
    // Only show errors for unexpected failures
    if (!isExpectedFailure && !isAuthError) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// User API calls
export const userAPI = {
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  getUser: async (userId) => {
    if (!isValidObjectId(userId) && userId !== 'demo') {
      throw new Error('Invalid userId: must be a valid MongoDB ObjectId or "demo"');
    }
    
    // Temporarily disable caching to ensure fresh data
    // const cacheKey = `user_${userId}`;
    // const cached = getCachedResponse(cacheKey);
    // if (cached) {
    //   console.log('[API] Returning cached user data for:', userId);
    //   return cached;
    // }
    
    // Use special demo route for demo users
    const endpoint = userId === 'demo' ? '/users/demo' : `/users/${userId}`;
    const response = await api.get(endpoint);
    
    // Cache the response
    // setCachedResponse(cacheKey, response.data);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    if (!isValidObjectId(userId) && userId !== 'demo') {
      throw new Error('Invalid userId: must be a valid MongoDB ObjectId or "demo"');
    }
    const response = await api.put(`/users/${userId}`, userData);
    
    // Clear the cache for this user since data has been updated
    const cacheKey = `user_${userId}`;
    localStorage.removeItem(cacheKey);
    
    return response.data.user || response.data; // Return user data directly
  },

  getQuickEdit: async (userId) => {
    const response = await api.get(`/users/${userId}/quick-edit`);
    return response.data.data || [];
  },
  setQuickEdit: async (userId, items) => {
    const response = await api.put(`/users/${userId}/quick-edit`, { items });
    return response.data.data || [];
  },

  deleteUser: async (userId) => {
    if (!isValidObjectId(userId) && userId !== 'demo') {
      throw new Error('Invalid userId: must be a valid MongoDB ObjectId or "demo"');
    }
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  getBMIAnalytics: async (userId) => {
    if (!isValidObjectId(userId) && userId !== 'demo') {
      throw new Error('Invalid userId: must be a valid MongoDB ObjectId or "demo"');
    }
    const response = await api.get(`/users/${userId}/bmi-analytics`);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  register: async (data) => {
    // Use longer timeout for registration (30 seconds) as Render free tier can be slow to wake up
    const response = await api.post('/users/register', data, {
      timeout: 30000 // 30 seconds for registration
    });
    return response.data;
  },

  login: async (data) => {
    const response = await api.post('/users/login', data);
    return response.data;
  },

  discardGoal: async (userId) => {
    if (!isValidObjectId(userId) && userId !== 'demo') {
      throw new Error('Invalid userId: must be a valid MongoDB ObjectId or "demo"');
    }
    const response = await api.post(`/users/${userId}/discard-goal`);
    
    // Clear the cache for this user since data has been updated
    const cacheKey = `user_${userId}`;
    localStorage.removeItem(cacheKey);
    
    return response.data.user || response.data; // Return user data directly
  },

  achieveGoal: async (userId) => {
    if (!isValidObjectId(userId) && userId !== 'demo') {
      throw new Error('Invalid userId: must be a valid MongoDB ObjectId or "demo"');
    }
    const response = await api.post(`/users/${userId}/achieve-goal`);
    
    // Clear the cache for this user since data has been updated
    const cacheKey = `user_${userId}`;
    localStorage.removeItem(cacheKey);
    
    return response.data.user || response.data; // Return user data directly
  }
};

// Weight Entry API calls
export const weightEntryAPI = {
  createEntry: async (entryData) => {
    // Validate required fields
    if (!entryData.userId || !isValidObjectId(entryData.userId)) {
      throw new Error('Invalid userId: must be a valid MongoDB ObjectId');
    }
    if (!entryData.goalId || !isValidObjectId(entryData.goalId)) {
      throw new Error('Invalid goalId: must be a valid MongoDB ObjectId');
    }
    const response = await api.post('/weight-entries', entryData);
    return response.data;
  },

  getUserEntries: async (userId, { startDate, endDate, goalId }) => {
    if (!isValidObjectId(userId) && userId !== 'demo') {
      throw new Error('Invalid userId: must be a valid MongoDB ObjectId or "demo"');
    }
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (goalId && isValidObjectId(goalId)) params.goalId = goalId;
    const response = await api.get(`/weight-entries/user/${userId}`, { params });
    return response.data;
  },

  getEntry: async (entryId) => {
    if (!isValidObjectId(entryId)) {
      throw new Error('Invalid entryId: must be a valid MongoDB ObjectId');
    }
    const response = await api.get(`/weight-entries/${entryId}`);
    return response.data;
  },

  updateEntry: async (entryId, entryData) => {
    if (!isValidObjectId(entryId)) {
      throw new Error('Invalid entryId: must be a valid MongoDB ObjectId');
    }
    // Validate goalId if present
    if (entryData.goalId && !isValidObjectId(entryData.goalId)) {
      throw new Error('Invalid goalId: must be a valid MongoDB ObjectId');
    }
    const response = await api.put(`/weight-entries/${entryId}`, entryData);
    return response.data;
  },

  deleteEntry: async (entryId) => {
    if (!isValidObjectId(entryId)) {
      throw new Error('Invalid entryId: must be a valid MongoDB ObjectId');
    }
    const response = await api.delete(`/weight-entries/${entryId}`);
    return response.data;
  },

  getAnalytics: async (userId, params = {}) => {
    if (!isValidObjectId(userId) && userId !== 'demo') {
      throw new Error('Invalid userId: must be a valid MongoDB ObjectId or "demo"');
    }
    
    // Build query parameters
    const queryParams = {};
    if (params.period) queryParams.period = params.period;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.goalId) queryParams.goalId = params.goalId;
    if (params.all) queryParams.all = params.all;
    
    console.log('[API] getAnalytics params:', { userId, queryParams });
    
    // Check cache first
    const cacheKey = `analytics_${userId}_${JSON.stringify(queryParams)}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      console.log('[API] Returning cached analytics data for:', userId);
      return cached;
    }
    
    // Use special demo route for demo users
    const endpoint = userId === 'demo' ? '/weight-entries/user/demo/analytics' : `/weight-entries/user/${userId}/analytics`;
    const response = await api.get(endpoint, {
      params: queryParams
    });
    
    // Cache the response
    setCachedResponse(cacheKey, response.data);
    return response.data;
  }
};

// Careers API calls
export const careersAPI = {
  applyForJob: async (formData) => {
    const response = await api.post('/careers/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Utility functions
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 100) / 100;
};

export const getBMICategory = (bmi) => {
  if (!bmi) return null;
  
  if (bmi < 16.0) return { category: 'Extreme Underweight', color: 'text-blue-600' };
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-500' };
  if (bmi < 25.0) return { category: 'Normal', color: 'text-green-600' };
  if (bmi < 30.0) return { category: 'Overweight', color: 'text-yellow-600' };
  if (bmi < 35.0) return { category: 'Obese Class-1', color: 'text-orange-600' };
  if (bmi < 40.0) return { category: 'Obese Class-2', color: 'text-red-600' };
  return { category: 'Obese Class-3', color: 'text-red-700' };
};

export const getBMIPosition = (bmi) => {
  if (!bmi) return 0;
  
  // Map BMI to percentage position on the meter (0-100)
  if (bmi < 16.0) return 5;
  if (bmi < 18.5) return 15;
  if (bmi < 25.0) return 35;
  if (bmi < 30.0) return 55;
  if (bmi < 35.0) return 75;
  if (bmi < 40.0) return 90;
  return 95;
};

export default api; 

// Food API (user-scoped additions)
export const foodAPI = {
  addUserFood: async ({ userId, name, category, calories, fat, cholesterol, quantity, unit }) => {
    if (!isValidObjectId(userId)) throw new Error('Invalid userId');
    const response = await api.post('/meals/food', { name, category, calories, fat, cholesterol, quantity, unit });
    return response.data;
  },
};