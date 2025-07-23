import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Save, Edit, Target, Scale } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUser } from '../context/UserContext';
import { userAPI, calculateBMI, getBMICategory, getBMIPosition, isValidObjectId } from '../services/api';
import { weightEntryAPI } from '../services/api';

const Profile = () => {
  const { currentUser, setCurrentUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [bmiAnalytics, setBmiAnalytics] = useState(null);
  const [weightEntries, setWeightEntries] = useState([]);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [pastGoalsPage, setPastGoalsPage] = useState(1);
  const PAST_GOALS_PER_PAGE = 3;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    if (currentUser && currentUser.id !== 'demo') {
      loadUserProfile();
      // Fetch weight entries for progress bar
      (async () => {
        try {
          const today = new Date();
          const startDate = userProfile?.createdAt ? new Date(userProfile.createdAt) : new Date();
          const entries = await weightEntryAPI.getUserEntries(currentUser.id, {
            startDate: startDate.toISOString().slice(0, 10),
            endDate: today.toISOString().slice(0, 10)
          });
          setWeightEntries(entries.entries || []);
        } catch (e) {
          setWeightEntries([]);
        }
      })();
    } else if (currentUser && currentUser.id === 'demo') {
      const demoProfile = {
        id: 'demo',
        name: 'Demo User',
        email: 'demo@example.com',
        mobile: '+1234567890',
        gender: 'Other',
        age: 30,
        height: 170,
        currentWeight: 75,
        targetWeight: 70,
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        goalStatus: 'active',
        goalCreatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        pastGoals: [
          {
            goalId: 'demo-goal-1',
            currentWeight: 80,
            targetWeight: 75,
            targetDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            startedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
            endedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'achieved',
          },
        ],
      };
      setUserProfile(demoProfile);
      calculateBMIAnalytics(demoProfile);
      // Generate demo weight entries for the active goal period
      const days = 30;
      const entries = [];
      const startWeight = 76;
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const baseWeight = startWeight - (days - i) * 0.1;
        const fluctuation = (Math.random() - 0.5) * 0.5;
        const weight = Math.round((baseWeight + fluctuation) * 10) / 10;
        entries.push({
          date: date.toISOString(),
          weight,
          bmi: calculateBMI(weight, 170),
          notes: i % 7 === 0 ? 'Weekly check-in' : ''
        });
      }
      setWeightEntries(entries);
      setIsCreatingGoal(false);
    }
  }, [currentUser, userProfile?.createdAt]);

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
        } catch (e) {}
      })();
    }
  }, [userProfile]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await userAPI.getUser(currentUser.id);
      setUserProfile(profile);
      calculateBMIAnalytics(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

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
  };

  const handleDiscardGoal = async () => {
    try {
      await userAPI.discardGoal(userProfile.id);
      toast.success('Goal discarded');
      await loadUserProfile();
    } catch (err) {
      toast.error('Failed to discard goal');
    }
  };

  const handleAchieveGoal = async () => {
    try {
      await userAPI.achieveGoal(userProfile.id);
      toast.success('Goal marked as achieved!');
      await loadUserProfile();
    } catch (err) {
      toast.error('Failed to mark goal as achieved');
    }
  };

  const handleCreateGoal = () => {
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
      setLoading(true);
      
      // First, set the goal status to active
      await userAPI.updateUser(currentUser.id, { goalStatus: 'active' });
      
      // Then, set the goal fields one by one to avoid validation issues
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
      toast.success('Goal created successfully!');
      setIsCreatingGoal(false);
      await loadUserProfile();
    } catch (error) {
      console.error('Goal creation error:', error);
      toast.error('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const handleReopenGoal = async (goal) => {
    try {
      // Copy goal data to active fields and set goalStatus to 'active'
      const updated = await userAPI.updateUser(userProfile.id, {
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
      setLoading(true);
      
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
      setLoading(false);
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
    <div className="max-w-5xl mx-auto mt-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Personal Info Card (col-span-2) */}
        <div className="flex-1 flex flex-col min-h-[480px]">
          <div className="bg-white rounded-xl shadow p-8 pt-12 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <User className="w-6 h-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              </div>
              {!isEditing && (
                <button onClick={handleEdit} className="btn-secondary flex items-center space-x-2"><Edit className="w-4 h-4" /><span>Edit</span></button>
              )}
            </div>
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                  {/* Name */}
                  <div className="flex flex-col space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Name *</label>
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
                      className="input-field"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                  </div>
                  {/* Email */}
                  <div className="flex flex-col space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Email *</label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' } })}
                      className="input-field"
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                  </div>
                  {/* Mobile */}
                  <div className="flex flex-col space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Mobile *</label>
                    <input
                      type="tel"
                      {...register('mobile', { required: 'Mobile number is required', pattern: { value: /^\+?[\d\s-()]+$/, message: 'Invalid mobile number' } })}
                      className="input-field"
                    />
                    {errors.mobile && <p className="text-sm text-red-600">{errors.mobile.message}</p>}
                  </div>
                  {/* Gender */}
                  <div className="flex flex-col space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Gender *</label>
                    <select {...register('gender', { required: 'Gender is required' })} className="input-field">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <p className="text-sm text-red-600">{errors.gender.message}</p>}
                  </div>
                  {/* Age */}
                  <div className="flex flex-col space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Age *</label>
                    <input
                      type="number"
                      {...register('age', { required: 'Age is required', min: { value: 13, message: 'Age must be at least 13' }, max: { value: 120, message: 'Age cannot exceed 120' } })}
                      className="input-field"
                    />
                    {errors.age && <p className="text-sm text-red-600">{errors.age.message}</p>}
                  </div>
                  {/* Height */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <div><span className="text-xs text-gray-500">Name</span><div className="font-semibold text-gray-900">{userProfile.name || '-'}</div></div>
                <div><span className="text-xs text-gray-500">Email</span><div className="font-semibold text-gray-900">{userProfile.email || '-'}</div></div>
                <div><span className="text-xs text-gray-500">Mobile</span><div className="font-semibold text-gray-900">{userProfile.mobileNumber || '-'}</div></div>
                <div><span className="text-xs text-gray-500">Gender</span><div className="font-semibold text-gray-900">{userProfile.gender || '-'}</div></div>
                <div><span className="text-xs text-gray-500">Age</span><div className="font-semibold text-gray-900">{userProfile.age || '-'}</div></div>
                <div><span className="text-xs text-gray-500">Height (cm)</span><div className="font-semibold text-gray-900">{userProfile.height || '-'}</div></div>
                <div><span className="text-xs text-gray-500">Current Weight (kg)</span><div className="font-semibold text-gray-900">{userProfile.currentWeight || '-'}</div></div>
              </div>
            )}
          </div>
          
          {/* Main Section (Active Goal, Past Goals) */}
          <div className="flex flex-col space-y-8 flex-1">
            {/* Active Goal Card or Create Goal Nudge */}
            {userProfile.goalStatus === 'active' && userProfile.currentWeight && userProfile.targetWeight && userProfile.targetDate ? (
              <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between border border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center"><Target className="w-5 h-5 text-primary-600 mr-2" />Active Weight Goal</h3>
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-6 text-sm text-gray-700 mb-2">
                    <div>Start: <span className="font-semibold">{userProfile.goalCreatedAt ? new Date(userProfile.goalCreatedAt).toLocaleDateString() : (userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : '-')}</span></div>
                    <div>Target: <span className="font-semibold">{userProfile.targetWeight} kg</span></div>
                    <div>By: <span className="font-semibold">{userProfile.targetDate ? new Date(userProfile.targetDate).toLocaleDateString() : '-'}</span></div>
                  </div>
                  {/* Progress Bar with color logic */}
                  {(() => {
                    // Use the oldest weight entry as initial weight
                    const sortedEntries = weightEntries.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
                    const initialWeight = sortedEntries.length > 0 ? sortedEntries[0].weight : userProfile.currentWeight;
                    const current = Number(userProfile.currentWeight);
                    const target = Number(userProfile.targetWeight);
                    const lost = initialWeight - current;
                    const total = initialWeight - target;
                    let percent = total !== 0 ? (lost / total) * 100 : 0;
                    if (percent < 0) percent = 0;
                    if (percent > 100) percent = 100;
                    let barColor = 'bg-red-200';
                    if (current > initialWeight) barColor = 'bg-red-500';
                    else if (percent < 25) barColor = 'bg-red-200';
                    else if (percent < 50) barColor = 'bg-yellow-200';
                    else if (percent < 75) barColor = 'bg-green-200';
                    else barColor = 'bg-green-500';
                    // Days to go calculation
                    const today = new Date();
                    const targetDate = new Date(userProfile.targetDate);
                    const daysToGo = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
                    return (
                      <>
                        <div className="w-full bg-gray-100 rounded-full h-3 mb-2 relative">
                          <div
                            className={`${barColor} h-3 rounded-full transition-all`}
                            style={{ width: `${percent}%` }}
                          ></div>
                          <span className="absolute right-2 top-0 text-xs text-gray-700 font-semibold">{percent.toFixed(0)}%</span>
                        </div>
                        <div className="grid grid-cols-3 w-full text-xs text-gray-500 mt-1 mb-2">
                          <div className="text-left">
                            Progress: {(current - target).toFixed(2)} kg to go
                          </div>
                          <div className="text-center">
                            {/* Days to Go aligned under Target */}
                            Days to Go: <span className="font-semibold">{daysToGo >= 0 ? daysToGo : 0}</span>
                          </div>
                          <div className="text-right">
                            Lost: <span className="font-semibold">{(initialWeight - current > 0 ? '-' : '') + Math.abs((initialWeight - current).toFixed(1))} kg</span>
                          </div>
                        </div>
                        {sortedEntries.length === 0 && <div className="text-center text-xs text-red-500">No weight entries found for this goal period.</div>}
                      </>
                    );
                  })()}
                </div>
                <div className="flex flex-col md:flex-row md:space-x-2 items-end md:items-center mt-4 md:mt-0">
                  <button onClick={handleDiscardGoal} className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition mb-1 md:mb-0">Discard</button>
                  <button onClick={handleAchieveGoal} className="px-3 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition mb-1 md:mb-0">Achieve</button>
                  <button onClick={() => {
                    reset({
                      height: userProfile.height,
                      currentWeight: userProfile.currentWeight,
                      targetWeight: userProfile.targetWeight,
                      targetDate: userProfile.targetDate ? userProfile.targetDate.split('T')[0] : ''
                    });
                    setIsEditingGoal(true);
                  }} className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition">Modify</button>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 flex flex-col items-center justify-center">
                <h3 className="text-xl font-bold mb-2">No Active Goal</h3>
                <p className="text-gray-600 mb-4">Set a weight goal to unlock analytics, progress, and milestones.</p>
                <button onClick={handleCreateGoal} className="btn-primary">Create Goal</button>
              </div>
            )}
            {/* Past Goals Section */}
            {userProfile.pastGoals && userProfile.pastGoals.length > 0 && (
              <div className="overflow-y-auto max-h-[340px] pr-2 flex flex-col">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Past Goals</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                  {userProfile.pastGoals.slice().reverse().slice((pastGoalsPage-1)*PAST_GOALS_PER_PAGE, pastGoalsPage*PAST_GOALS_PER_PAGE).map((goal, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow p-4 border border-gray-200 flex flex-col space-y-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${goal.status === 'achieved' ? 'bg-green-500' : goal.status === 'discarded' ? 'bg-red-500' : goal.status === 'expired' ? 'bg-gray-400' : 'bg-gray-400'}`}></span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}</span>
                      </div>
                      <div className="text-sm text-gray-700">Start: <span className="font-semibold">{goal.startedAt ? new Date(goal.startedAt).toLocaleDateString() : '-'}</span></div>
                      <div className="text-sm text-gray-700">Target: <span className="font-semibold">{goal.targetWeight} kg</span></div>
                      <div className="text-sm text-gray-700">By: <span className="font-semibold">{goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : '-'}</span></div>
                      <div className="text-sm text-gray-700">Ended: <span className="font-semibold">{goal.endedAt ? new Date(goal.endedAt).toLocaleDateString() : '-'}</span></div>
                      {(goal.status === 'achieved' || goal.status === 'expired') && (
                        <button onClick={() => handleReopenGoal(goal)} className="mt-2 px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition">Reopen Goal</button>
                      )}
                    </div>
                  ))}
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-end items-center mt-2 space-x-2">
                  <button
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold disabled:opacity-50"
                    onClick={() => setPastGoalsPage(p => Math.max(1, p - 1))}
                    disabled={pastGoalsPage === 1}
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-600">
                    Page {pastGoalsPage} of {Math.ceil(userProfile.pastGoals.length / PAST_GOALS_PER_PAGE)}
                  </span>
                  <button
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold disabled:opacity-50"
                    onClick={() => setPastGoalsPage(p => Math.min(Math.ceil(userProfile.pastGoals.length / PAST_GOALS_PER_PAGE), p + 1))}
                    disabled={pastGoalsPage === Math.ceil(userProfile.pastGoals.length / PAST_GOALS_PER_PAGE)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* BMI Analytics Sidebar (col-span-1) */}
        <div className="w-full lg:w-[340px] flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card flex flex-col min-h-[480px] max-h-[600px] p-8 justify-between sticky top-0"
            style={{ minWidth: '320px', maxWidth: '340px' }}
          >
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex items-center space-x-2 mb-6">
                <Scale className="w-5 h-5 text-primary-600" />
                <h3 className="text-2xl font-semibold text-gray-900">BMI Analytics</h3>
              </div>
              {bmiAnalytics ? (
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Current BMI */}
                    <div className="text-center p-4 bg-blue-50 rounded-lg flex flex-col items-center justify-center">
                      <p className="text-3xl font-bold text-blue-600">{!isNaN(Number(bmiAnalytics.currentBMI)) ? Number(bmiAnalytics.currentBMI).toFixed(2) : '-'}</p>
                      <p className="text-sm text-gray-600">Current BMI</p>
                      <p className={`text-xs font-semibold mt-1 ${bmiAnalytics.currentCategory?.color || ''}`}>{bmiAnalytics.currentCategory?.category || '-'}</p>
                    </div>
                    {/* Target BMI */}
                    <div className="text-center p-4 bg-green-50 rounded-lg flex flex-col items-center justify-center">
                      <p className="text-3xl font-bold text-green-600">{!isNaN(Number(bmiAnalytics.targetBMI)) ? Number(bmiAnalytics.targetBMI).toFixed(2) : '-'}</p>
                      <p className="text-sm text-gray-600">Target BMI</p>
                      <p className={`text-xs font-semibold mt-1 ${bmiAnalytics.targetCategory?.color || ''}`}>{bmiAnalytics.targetCategory?.category || '-'}</p>
                    </div>
                  </div>
                  {/* BMI Difference */}
                  <div className="text-center p-4 bg-purple-50 rounded-lg flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {!isNaN(Number(bmiAnalytics.currentBMI)) && !isNaN(Number(bmiAnalytics.targetBMI))
                        ? Math.abs(Number(bmiAnalytics.currentBMI) - Number(bmiAnalytics.targetBMI)).toFixed(1)
                        : '-'}
                    </p>
                    <p className="text-sm text-gray-600">BMI points to go</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {!isNaN(Number(bmiAnalytics.currentBMI)) && !isNaN(Number(bmiAnalytics.targetBMI))
                        ? (Number(bmiAnalytics.currentBMI) > Number(bmiAnalytics.targetBMI)
                            ? 'Need to lose weight'
                            : (Number(bmiAnalytics.currentBMI) < Number(bmiAnalytics.targetBMI)
                                ? 'Need to gain weight'
                                : 'At target BMI'))
                        : 'Enter valid weight and height to see BMI points to go'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">BMI data not available. Enter valid weight and height to see BMI analytics.</p>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 my-4" />
            {/* BMI Scale - always at the bottom */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">BMI Scale</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-600">Extreme Underweight</span>
                  <span>&lt; 16.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-500">Underweight</span>
                  <span>16.0 – 18.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Normal</span>
                  <span>18.5 – 24.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">Overweight</span>
                  <span>25.0 – 29.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600">Obese Class-1</span>
                  <span>30.0 – 34.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Obese Class-2</span>
                  <span>35.0 – 39.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Obese Class-3</span>
                  <span>&ge; 40.0</span>
                </div>
              </div>
            </div>
          </motion.div>
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
              <button type="button" onClick={() => setIsCreatingGoal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Create Goal'}</button>
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
              <button type="button" onClick={() => setIsEditingGoal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Update Goal'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile; 