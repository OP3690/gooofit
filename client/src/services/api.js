import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    // Add any auth tokens here if needed
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
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    toast.error(message);
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
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    if (!isValidObjectId(userId) && userId !== 'demo') {
      throw new Error('Invalid userId: must be a valid MongoDB ObjectId or "demo"');
    }
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
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
    const response = await api.post('/users/register', data);
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
    return response.data;
  },

  achieveGoal: async (userId) => {
    if (!isValidObjectId(userId) && userId !== 'demo') {
      throw new Error('Invalid userId: must be a valid MongoDB ObjectId or "demo"');
    }
    const response = await api.post(`/users/${userId}/achieve-goal`);
    return response.data;
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
    
    const response = await api.get(`/weight-entries/user/${userId}/analytics`, {
      params: queryParams
    });
    return response.data;
  }
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