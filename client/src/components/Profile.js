import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Save, Edit, Target, Scale } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUser } from '../context/UserContext';
import { userAPI, calculateBMI, getBMICategory, getBMIPosition } from '../services/api';
import { weightEntryAPI } from '../services/api';

const Profile = () => {
  const { currentUser, setCurrentUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Debug modalLoading state changes
  useEffect(() => {
    console.log('[PROFILE] modalLoading state changed to:', modalLoading);
  }, [modalLoading]);

  const [userProfile, setUserProfile] = useState(null);
  const [bmiAnalytics, setBmiAnalytics] = useState(null);
  const [weightEntries, setWeightEntries] = useState([]);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [pastGoalsPage, setPastGoalsPage] = useState(1);
  const PAST_GOALS_PER_PAGE = 3;

  // Reset modalLoading when modals are closed
  useEffect(() => {
    if (!isCreatingGoal && !isEditingGoal) {
      console.log('[PROFILE] All modals closed, resetting modalLoading to false');
      setModalLoading(false);
    }
  }, [isCreatingGoal, isEditingGoal]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  // ENABLED: For goal management functions
  const loadUserProfile = useCallback(async () => {
    console.log('[PROFILE] loadUserProfile called, current loading state:', loading);
    // Prevent multiple simultaneous calls
    if (loading) {
      console.log('Profile loading already in progress, skipping...');
      return;
    }
    
    try {
      console.log('[PROFILE] Setting loading to true');
      setLoading(true);
      const profile = await userAPI.getUser(currentUser.id);
      setUserProfile(profile);
      calculateBMIAnalytics(profile);
      
      // Load weight entries for the current goal
      if (profile && profile.goalId) {
        try {
          console.log('[PROFILE] Loading weight entries for goalId:', profile.goalId);
          const entriesResponse = await weightEntryAPI.getUserEntries(currentUser.id, {
            goalId: profile.goalId
          });
          console.log('[PROFILE] Weight entries response:', entriesResponse);
          if (entriesResponse && entriesResponse.entries) {
            setWeightEntries(entriesResponse.entries);
            console.log('[PROFILE] Set weight entries:', entriesResponse.entries.length, 'entries');
          } else {
            console.log('[PROFILE] No entries found in response');
          setWeightEntries([]);
        }
        } catch (entriesError) {
          console.error('Error loading weight entries:', entriesError);
          setWeightEntries([]);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Don't show toast error for data loading
    } finally {
      console.log('[PROFILE] Setting loading to false');
      setLoading(false);
    }
  }, [currentUser?.id, loading]);

  useEffect(() => {
    if (currentUser && currentUser.id !== 'demo') {
      // For real users, load actual profile data from backend
      console.log('[PROFILE] Real user - loading actual profile data from backend');
      loadUserProfile();
    } else if (currentUser && currentUser.id === 'demo') {
      const demoProfile = {
        id: 'demo',
        name: 'Demo User',
        email: 'demo@example.com',
        mobileNumber: '+1234567890',
        gender: 'Other',
        age: 25,
        height: 170,
        currentWeight: 70,
        targetWeight: 65,
        goalStatus: 'active',
        goalCreatedAt: new Date().toISOString(),
        pastGoals: [
          {
            goalId: 'demo-goal-1',
            targetWeight: 68,
            currentWeight: 75,
            status: 'achieved',
            startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            goalId: 'demo-goal-2',
            targetWeight: 70,
            currentWeight: 78,
            status: 'discarded',
            startedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
      setUserProfile(demoProfile);
      calculateBMIAnalytics(demoProfile);
    }
    // Reset loading state when component mounts
    setLoading(false);
  }, [currentUser, loadUserProfile]);

  // ENABLED: Goal expiration check
  useEffect(() => {
    if (
      userProfile &&
      userProfile.goalStatus === 'active' &&
      userProfile.targetDate &&
      new Date(userProfile.targetDate) < new Date()
    ) {
      (async () => {
        try {
          await userAPI.discardGoal(userProfile.id, { status: 'expired' });
          await loadUserProfile();
        } catch (e) {
          console.error('Goal expiration check failed:', e);
        }
      })();
    }
  }, [userProfile, loadUserProfile]);

  const calculateBMIAnalytics = (profile) => {
    if (!profile) return;

    // Defensive checks
    const currentWeight = Number(profile.currentWeight);
    const targetWeight = Number(profile.targetWeight);
    const height = Number(profile.height);

    if (
      isNaN(currentWeight) ||
      isNaN(targetWeight) ||
      isNaN(height)
    ) {
      setBmiAnalytics(null);
      return;
    }

    // Ensure BMI values are numbers
    const currentBMI = Number(calculateBMI(currentWeight, height));
    const targetBMI = Number(calculateBMI(targetWeight, height));

    if (isNaN(currentBMI) || isNaN(targetBMI)) {
      setBmiAnalytics(null);
      return;
    }
    setBmiAnalytics({
      currentBMI,
      targetBMI,
      currentCategory: getBMICategory(currentBMI),
      targetCategory: getBMICategory(targetBMI),
      currentPosition: getBMIPosition(currentBMI),
      targetPosition: getBMIPosition(targetBMI)
    });
  };

  const onSubmit = async (data) => {
    // Only set loading to true when form is actually submitted
    setLoading(true);
    try {
      const payload = {
        // Always include required user fields
        name: data.name,
        gender: data.gender,
        age: parseFloat(data.age),
        email: data.email,
        mobileNumber: data.mobile, // Map mobile back to mobileNumber for API
        height: parseFloat(data.height),
        currentWeight: parseFloat(data.currentWeight),
        // Only include goal fields if they are provided
        ...(data.targetWeight && { targetWeight: parseFloat(data.targetWeight) }),
        ...(data.targetDate && { targetDate: new Date(data.targetDate).toISOString() }),
        ...(data.targetWeight && data.targetDate && { 
          goalStatus: 'active',
          goalCreatedAt: new Date().toISOString()
        })
        // Don't set goalId here - let the backend generate it
      };

      const response = await userAPI.updateUser(currentUser.id, payload);
      toast.success('Profile updated successfully!');
      
      // After successful update, update user context with new goalId
      if (response && response.user && response.user.goalId) {
        setUserProfile(response.user);
        if (setCurrentUser) {
          setCurrentUser(prev => ({ ...prev, goalId: response.user.goalId }));
        }
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (userProfile) {
      reset({
        ...userProfile,
        // Map mobileNumber to mobile for form compatibility
        mobile: userProfile.mobileNumber,
        targetDate: userProfile.targetDate ? userProfile.targetDate.split('T')[0] : ''
      });
    }
    setIsEditing(true);
    // Reset loading state when entering edit mode
    setLoading(false);
  };

  const handleDiscardGoal = async () => {
    try {
      console.log('[PROFILE] Discarding goal for user:', userProfile.id);
      await userAPI.discardGoal(userProfile.id);
      toast.success('Goal discarded');
      await loadUserProfile();
    } catch (err) {
      console.error('[PROFILE] Error discarding goal:', err);
      toast.error('Failed to discard goal');
    }
  };

  const handleAchieveGoal = async () => {
    try {
      console.log('[PROFILE] Achieving goal for user:', userProfile.id);
      await userAPI.achieveGoal(userProfile.id);
      toast.success('Goal marked as achieved!');
      await loadUserProfile();
    } catch (err) {
      console.error('[PROFILE] Error achieving goal:', err);
      toast.error('Failed to mark goal as achieved');
    }
  };

  const handleCreateGoal = () => {
    console.log('[PROFILE] handleCreateGoal called, resetting modalLoading to false');
    setModalLoading(false);
    reset({
      height: userProfile.height,
      currentWeight: userProfile.currentWeight,
      targetWeight: '',
      targetDate: ''
    });
    setIsCreatingGoal(true);
  };

  const onSubmitGoal = async (data) => {
    try {
      console.log('[PROFILE] Starting goal creation with data:', data);
      setModalLoading(true);
      
      // First, set the goal status to active
      console.log('[PROFILE] Setting goal status to active...');
      await userAPI.updateUser(currentUser.id, { goalStatus: 'active' });
      
      // Then, set the goal fields one by one to avoid validation issues
      const goalPayload = {
        height: parseFloat(data.height),
        currentWeight: parseFloat(data.currentWeight),
        targetWeight: parseFloat(data.targetWeight),
        targetDate: new Date(data.targetDate).toISOString(),
        goalCreatedAt: new Date().toISOString()
      };
      
      console.log('[PROFILE] Updating user with goal payload:', goalPayload);
      const response = await userAPI.updateUser(currentUser.id, goalPayload);
      console.log('[PROFILE] Goal creation response:', response);
      
      setUserProfile(response);
      calculateBMIAnalytics(response);
      toast.success('Goal created successfully!');
      setIsCreatingGoal(false);
      await loadUserProfile();
    } catch (error) {
      console.error('Goal creation error:', error);
      toast.error('Failed to create goal');
    } finally {
      console.log('[PROFILE] Goal creation completed, setting modal loading to false');
      setModalLoading(false);
    }
  };

  const handleReopenGoal = async (goal) => {
    try {
      // Copy goal data to active fields and set goalStatus to 'active'
      await userAPI.updateUser(userProfile.id, {
        currentWeight: goal.currentWeight,
        targetWeight: goal.targetWeight,
        targetDate: goal.targetDate,
        goalStatus: 'active'
      });
      toast.success('Goal reopened!');
      await loadUserProfile();
    } catch (err) {
      toast.error('Failed to reopen goal');
    }
  };

  const onSubmitEditGoal = async (data) => {
    try {
      setModalLoading(true);
      
      // First, ensure the goal status is active
      await userAPI.updateUser(currentUser.id, { goalStatus: 'active' });
      
      // Then, update the goal fields
      const goalPayload = {
        height: parseFloat(data.height),
        currentWeight: parseFloat(data.currentWeight),
        targetWeight: parseFloat(data.targetWeight),
        targetDate: new Date(data.targetDate).toISOString(),
        goalCreatedAt: new Date().toISOString()
      };
      
      const response = await userAPI.updateUser(currentUser.id, goalPayload);
      setUserProfile(response);
      calculateBMIAnalytics(response);
      toast.success('Goal updated successfully!');
      setIsEditingGoal(false);
      await loadUserProfile();
    } catch (error) {
      console.error('Goal update error:', error);
      toast.error('Failed to update goal');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading && !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No profile data available.</p>
      </div>
    );
  }

  if (currentUser && currentUser.id === 'demo' && isCreatingGoal) {
    setIsCreatingGoal(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Personal Info and Goals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Personal Information</h2>
              </div>
              {!isEditing && (
                  <button onClick={handleEdit} className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
              )}
            </div>
            </div>
            <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
                      className="input-field"
                        defaultValue={userProfile.name}
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                  </div>
                  {/* Email */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' } })}
                      className="input-field"
                        defaultValue={userProfile.email}
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                  </div>
                  {/* Mobile */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Mobile *</label>
                    <input
                      type="tel"
                      {...register('mobile', { required: 'Mobile number is required', pattern: { value: /^\+?[\d\s-()]+$/, message: 'Invalid mobile number' } })}
                      className="input-field"
                        defaultValue={userProfile.mobileNumber}
                    />
                    {errors.mobile && <p className="text-sm text-red-600">{errors.mobile.message}</p>}
                  </div>
                  {/* Gender */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Gender *</label>
                      <select {...register('gender', { required: 'Gender is required' })} className="input-field" defaultValue={userProfile.gender}>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <p className="text-sm text-red-600">{errors.gender.message}</p>}
                  </div>
                  {/* Age */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Age *</label>
                    <input
                      type="number"
                      {...register('age', { required: 'Age is required', min: { value: 13, message: 'Age must be at least 13' }, max: { value: 120, message: 'Age cannot exceed 120' } })}
                      className="input-field"
                        defaultValue={userProfile.age}
                    />
                    {errors.age && <p className="text-sm text-red-600">{errors.age.message}</p>}
                  </div>
                  {/* Height */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Height (cm) *</label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('height', { required: 'Height is required', min: { value: 100, message: 'Height must be at least 100 cm' }, max: { value: 250, message: 'Height cannot exceed 250 cm' } })}
                      className="input-field"
                        defaultValue={userProfile.height}
                    />
                    {errors.height && <p className="text-sm text-red-600">{errors.height.message}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Name</span>
                    <div className="font-semibold text-gray-900">{userProfile.name || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Email</span>
                    <div className="font-semibold text-gray-900">{userProfile.email || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Mobile</span>
                    <div className="font-semibold text-gray-900">{userProfile.mobileNumber || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Gender</span>
                    <div className="font-semibold text-gray-900 capitalize">{userProfile.gender || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Age</span>
                    <div className="font-semibold text-gray-900">{userProfile.age || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Height (cm)</span>
                    <div className="font-semibold text-gray-900">{userProfile.height || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Current Weight (kg)</span>
                    <div className="font-semibold text-gray-900">{userProfile.currentWeight || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Target Weight (kg)</span>
                    <div className="font-semibold text-gray-900">{userProfile.targetWeight || '-'}</div>
                  </div>
              </div>
            )}
            </div>
          </div>
          
          {/* Current Goal Status */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                  </div>
                <h2 className="text-xl font-bold text-white">Current Goal Status</h2>
                        </div>
                          </div>
            <div className="p-6">
              {userProfile.goalStatus === 'active' ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-semibold text-green-800">Active Goal</span>
                          </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Target Weight</span>
                        <div className="font-bold text-lg text-gray-900">{userProfile.targetWeight} kg</div>
                          </div>
                      <div>
                        <span className="text-sm text-gray-500">Current Weight</span>
                        <div className="font-bold text-lg text-gray-900">{userProfile.currentWeight} kg</div>
                        </div>
                      <div>
                        <span className="text-sm text-gray-500">Progress</span>
                        <div className="font-bold text-lg text-gray-900">
                          {userProfile.currentWeight && userProfile.targetWeight && userProfile.goalInitialWeight
                            ? `${Math.round(((userProfile.goalInitialWeight - userProfile.currentWeight) / (userProfile.goalInitialWeight - userProfile.targetWeight)) * 100)}%`
                            : '0%'}
                </div>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button onClick={() => setIsEditingGoal(true)} className="btn-secondary">
                        Modify Goal
                      </button>
                      <button onClick={handleDiscardGoal} className="btn-danger">
                        Discard Goal
                      </button>
                      <button onClick={handleAchieveGoal} className="btn-success">
                        Achieve Goal
                      </button>
                    </div>
                </div>
              </div>
            ) : (
                <div className="text-center py-8">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Goal</h3>
                  <p className="text-gray-600 mb-6">Set a weight goal to unlock analytics, progress, and milestones.</p>
                  <button onClick={() => setIsCreatingGoal(true)} className="btn-primary">
                    Create Goal
                  </button>
              </div>
            )}
            </div>
          </div>

          {/* Past Goals */}
            {userProfile.pastGoals && userProfile.pastGoals.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                </div>
                  <h2 className="text-xl font-bold text-white">Past Goals</h2>
                      </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userProfile.pastGoals
                    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)) // Sort in descending order
                    .slice((pastGoalsPage - 1) * PAST_GOALS_PER_PAGE, pastGoalsPage * PAST_GOALS_PER_PAGE)
                    .map((goal, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`status-badge ${
                          goal.status === 'achieved' ? 'status-achieved' : 'status-discarded'
                        }`}>
                          {goal.status === 'achieved' ? 'ACHIEVED' : 'DISCARDED'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(goal.startedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-gray-500">Target Weight</span>
                          <div className="font-semibold text-lg">{goal.targetWeight} kg</div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Starting Weight</span>
                          <div className="font-semibold">{goal.currentWeight} kg</div>
                        </div>
                        {goal.targetDate && (
                          <div>
                            <span className="text-xs text-gray-500">Target Date</span>
                            <div className="font-semibold">{new Date(goal.targetDate).toLocaleDateString()}</div>
                          </div>
                        )}
                      </div>
                      {goal.status === 'discarded' && (
                        <button
                          onClick={() => handleReopenGoal(goal)}
                          className="w-full mt-3 btn-secondary text-sm hover:bg-gray-600 hover:text-white transition-colors duration-200"
                        >
                          Reopen Goal
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {userProfile.pastGoals.length > PAST_GOALS_PER_PAGE && (
                  <div className="flex items-center justify-center space-x-2 mt-6">
                  <button
                      onClick={() => setPastGoalsPage(Math.max(1, pastGoalsPage - 1))}
                    disabled={pastGoalsPage === 1}
                      className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                    <span className="text-sm text-gray-600">
                    Page {pastGoalsPage} of {Math.ceil(userProfile.pastGoals.length / PAST_GOALS_PER_PAGE)}
                  </span>
                  <button
                      onClick={() => setPastGoalsPage(Math.min(Math.ceil(userProfile.pastGoals.length / PAST_GOALS_PER_PAGE), pastGoalsPage + 1))}
                    disabled={pastGoalsPage === Math.ceil(userProfile.pastGoals.length / PAST_GOALS_PER_PAGE)}
                      className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>

        {/* Right Column - BMI Analytics */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Scale className="w-5 h-5 text-white" />
        </div>
                <h2 className="text-xl font-bold text-white">BMI Analytics</h2>
              </div>
            </div>
            <div className="p-6">
              {bmiAnalytics ? (
                <div className="space-y-6">
                  {/* Current BMI Display */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">{bmiAnalytics.currentBMI}</div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      bmiAnalytics.currentBMI < 16 ? 'bg-red-100 text-red-800' :
                      bmiAnalytics.currentBMI < 18.5 ? 'bg-blue-100 text-blue-800' :
                      bmiAnalytics.currentBMI < 25 ? 'bg-green-100 text-green-800' :
                      bmiAnalytics.currentBMI < 30 ? 'bg-yellow-100 text-yellow-800' :
                      bmiAnalytics.currentBMI < 35 ? 'bg-orange-100 text-orange-800' :
                      bmiAnalytics.currentBMI < 40 ? 'bg-red-100 text-red-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {bmiAnalytics.currentBMI < 16 ? 'Extreme Underweight' :
                       bmiAnalytics.currentBMI < 18.5 ? 'Underweight' :
                       bmiAnalytics.currentBMI < 25 ? 'Normal' :
                       bmiAnalytics.currentBMI < 30 ? 'Overweight' :
                       bmiAnalytics.currentBMI < 35 ? 'Obese Class-1' :
                       bmiAnalytics.currentBMI < 40 ? 'Obese Class-2' :
                       'Obese Class-3'}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Current BMI</p>
                    </div>

                  {/* BMI Progress Bar */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">BMI Range</span>
                      <span className="font-medium">{bmiAnalytics.currentBMI} / 24.9 (Normal)</span>
                  </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          bmiAnalytics.currentBMI < 16 ? 'bg-red-500' :
                          bmiAnalytics.currentBMI < 18.5 ? 'bg-blue-500' :
                          bmiAnalytics.currentBMI < 25 ? 'bg-green-500' :
                          bmiAnalytics.currentBMI < 30 ? 'bg-yellow-500' :
                          bmiAnalytics.currentBMI < 35 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((bmiAnalytics.currentBMI / 40) * 100, 100)}%` }}
                      ></div>
                  </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>16.0</span>
                      <span>18.5</span>
                      <span>25.0</span>
                      <span>30.0</span>
                      <span>35.0</span>
                      <span>40.0</span>
                </div>
                </div>

                  {/* Health Insights */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Health Insights</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      {bmiAnalytics.currentBMI < 16 && (
                        <p>• Consider gaining weight for better health</p>
                      )}
                      {bmiAnalytics.currentBMI >= 16 && bmiAnalytics.currentBMI < 18.5 && (
                        <p>• Consider gaining weight for better health</p>
                      )}
                      {bmiAnalytics.currentBMI >= 18.5 && bmiAnalytics.currentBMI < 25 && (
                        <p>• You're in the healthy weight range!</p>
                      )}
                      {bmiAnalytics.currentBMI >= 25 && bmiAnalytics.currentBMI < 30 && (
                        <p>• Consider weight loss for better health</p>
                      )}
                      {bmiAnalytics.currentBMI >= 30 && (
                        <p>• Consult a healthcare provider for weight management</p>
              )}
            </div>
                </div>
                  
                  {/* BMI Scale */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">BMI Categories</h4>
                    <div className="space-y-2 text-sm">
                      <div className={`flex justify-between items-center p-2 rounded ${
                        bmiAnalytics.currentBMI < 16 ? 'bg-red-100 border border-red-200' : ''
                      }`}>
                        <span className="text-gray-600">Extreme Underweight</span>
                        <span className="font-medium">&lt; 16.0</span>
                </div>
                      <div className={`flex justify-between items-center p-2 rounded ${
                        bmiAnalytics.currentBMI >= 16 && bmiAnalytics.currentBMI < 18.5 ? 'bg-blue-100 border border-blue-200' : ''
                      }`}>
                        <span className="text-gray-600">Underweight</span>
                        <span className="font-medium">16.0 - 18.4</span>
                </div>
                      <div className={`flex justify-between items-center p-2 rounded ${
                        bmiAnalytics.currentBMI >= 18.5 && bmiAnalytics.currentBMI < 25 ? 'bg-green-100 border border-green-200' : ''
                      }`}>
                        <span className="text-gray-600">Normal</span>
                        <span className="font-medium">18.5 - 24.9</span>
                </div>
                      <div className={`flex justify-between items-center p-2 rounded ${
                        bmiAnalytics.currentBMI >= 25 && bmiAnalytics.currentBMI < 30 ? 'bg-yellow-100 border border-yellow-200' : ''
                      }`}>
                        <span className="text-gray-600">Overweight</span>
                        <span className="font-medium">25.0 - 29.9</span>
                </div>
                      <div className={`flex justify-between items-center p-2 rounded ${
                        bmiAnalytics.currentBMI >= 30 && bmiAnalytics.currentBMI < 35 ? 'bg-orange-100 border border-orange-200' : ''
                      }`}>
                        <span className="text-gray-600">Obese Class-1</span>
                        <span className="font-medium">30.0 - 34.9</span>
                </div>
                      <div className={`flex justify-between items-center p-2 rounded ${
                        bmiAnalytics.currentBMI >= 35 && bmiAnalytics.currentBMI < 40 ? 'bg-red-100 border border-red-200' : ''
                      }`}>
                        <span className="text-gray-600">Obese Class-2</span>
                        <span className="font-medium">35.0 - 39.9</span>
                </div>
                      <div className={`flex justify-between items-center p-2 rounded ${
                        bmiAnalytics.currentBMI >= 40 ? 'bg-red-100 border border-red-200' : ''
                      }`}>
                        <span className="text-gray-600">Obese Class-3</span>
                        <span className="font-medium">≥ 40.0</span>
              </div>
            </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">BMI Data Not Available</h3>
                  <p className="text-gray-600">Enter valid weight and height to see BMI analytics.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isCreatingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <form onSubmit={handleSubmit(onSubmitGoal)} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md space-y-6">
            <h2 className="text-xl font-bold mb-4 text-center">Create New Goal</h2>
            <div className="flex flex-col space-y-2">
              <label className="block text-xs font-medium text-gray-500">Height (cm) *</label>
              <input
                type="number"
                step="0.1"
                {...register('height', { required: 'Height is required', min: { value: 100, message: 'Height must be at least 100 cm' }, max: { value: 250, message: 'Height cannot exceed 250 cm' } })}
                className="input-field"
              />
              {errors.height && <p className="text-sm text-red-600">{errors.height.message}</p>}
            </div>
            <div className="flex flex-col space-y-2">
              <label className="block text-xs font-medium text-gray-500">Current Weight *</label>
              <input
                type="number"
                step="0.1"
                {...register('currentWeight', { required: 'Current weight is required', min: { value: 20, message: 'Weight must be at least 20 kg' }, max: { value: 500, message: 'Weight cannot exceed 500 kg' } })}
                className="input-field"
              />
              {errors.currentWeight && <p className="text-sm text-red-600">{errors.currentWeight.message}</p>}
            </div>
            <div className="flex flex-col space-y-2">
              <label className="block text-xs font-medium text-gray-500">Target Weight *</label>
              <input
                type="number"
                step="0.1"
                {...register('targetWeight', { required: 'Target weight is required', min: { value: 20, message: 'Target weight must be at least 20 kg' }, max: { value: 500, message: 'Target weight cannot exceed 500 kg' } })}
                className="input-field"
              />
              {errors.targetWeight && <p className="text-sm text-red-600">{errors.targetWeight.message}</p>}
            </div>
            <div className="flex flex-col space-y-2">
              <label className="block text-xs font-medium text-gray-500">Target Date *</label>
              <input
                type="date"
                {...register('targetDate', { required: 'Target date is required' })}
                className="input-field"
              />
              {errors.targetDate && <p className="text-sm text-red-600">{errors.targetDate.message}</p>}
            </div>
            <div className="flex items-center justify-end space-x-4 pt-4">
              <button type="button" onClick={() => {
                console.log('[PROFILE] Create goal modal cancelled, resetting modalLoading to false');
                setModalLoading(false);
                setIsCreatingGoal(false);
              }} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={modalLoading} className="btn-primary">
                {modalLoading ? 'Saving...' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      )}
      {isEditingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <form onSubmit={handleSubmit(onSubmitEditGoal)} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md space-y-6">
            <h2 className="text-xl font-bold mb-4 text-center">Edit Active Goal</h2>
            <div className="flex flex-col space-y-2">
              <label className="block text-xs font-medium text-gray-500">Height (cm) *</label>
              <input
                type="number"
                step="0.1"
                {...register('height', { required: 'Height is required', min: { value: 100, message: 'Height must be at least 100 cm' }, max: { value: 250, message: 'Height cannot exceed 250 cm' } })}
                className="input-field"
              />
              {errors.height && <p className="text-sm text-red-600">{errors.height.message}</p>}
            </div>
            <div className="flex flex-col space-y-2">
              <label className="block text-xs font-medium text-gray-500">Current Weight *</label>
              <input
                type="number"
                step="0.1"
                {...register('currentWeight', { required: 'Current weight is required', min: { value: 20, message: 'Weight must be at least 20 kg' }, max: { value: 500, message: 'Weight cannot exceed 500 kg' } })}
                className="input-field"
              />
              {errors.currentWeight && <p className="text-sm text-red-600">{errors.currentWeight.message}</p>}
            </div>
            <div className="flex flex-col space-y-2">
              <label className="block text-xs font-medium text-gray-500">Target Weight *</label>
              <input
                type="number"
                step="0.1"
                {...register('targetWeight', { required: 'Target weight is required', min: { value: 20, message: 'Target weight must be at least 20 kg' }, max: { value: 500, message: 'Target weight cannot exceed 500 kg' } })}
                className="input-field"
              />
              {errors.targetWeight && <p className="text-sm text-red-600">{errors.targetWeight.message}</p>}
            </div>
            <div className="flex flex-col space-y-2">
              <label className="block text-xs font-medium text-gray-500">Target Date *</label>
              <input
                type="date"
                {...register('targetDate', { required: 'Target date is required' })}
                className="input-field"
              />
              {errors.targetDate && <p className="text-sm text-red-600">{errors.targetDate.message}</p>}
            </div>
            <div className="flex items-center justify-end space-x-4 pt-4">
              <button type="button" onClick={() => {
                console.log('[PROFILE] Edit goal modal cancelled, resetting modalLoading to false');
                setModalLoading(false);
                setIsEditingGoal(false);
              }} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={modalLoading} className="btn-primary">{modalLoading ? 'Saving...' : 'Update Goal'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile; 