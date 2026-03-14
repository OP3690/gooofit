import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FireIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BoltIcon,
  UserIcon,
  ArrowLeftIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CalorieCalculatorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    unit: 'kg-cm',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    goal: 'maintain'
  });
  const [result, setResult] = useState(null);
  const [calorieHistory, setCalorieHistory] = useState([]);

  // CSS to hide number input spinners
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      input[type="number"]::-webkit-outer-spin-button,
      input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0 !important;
        display: none !important;
      }
      input[type="number"] {
        -moz-appearance: textfield !important;
      }
      input[type="number"]:focus {
        outline: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);



  const activityLevels = [
    { level: 'sedentary', name: 'Sedentary', multiplier: 1.2, description: 'Little or no exercise' },
    { level: 'light', name: 'Lightly Active', multiplier: 1.375, description: 'Light exercise 1-3 days/week' },
    { level: 'moderate', name: 'Moderately Active', multiplier: 1.55, description: 'Moderate exercise 3-5 days/week' },
    { level: 'active', name: 'Very Active', multiplier: 1.725, description: 'Hard exercise 6-7 days/week' },
    { level: 'very_active', name: 'Extremely Active', multiplier: 1.9, description: 'Very hard exercise, physical job' },
  ];

  const goals = [
    { value: 'lose', name: 'Lose Weight', adjustment: -500 },
    { value: 'maintain', name: 'Maintain Weight', adjustment: 0 },
    { value: 'gain', name: 'Gain Weight', adjustment: 500 },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateBMR = (weight, height, age, gender) => {
    // Mifflin-St Jeor Equation
    if (gender === 'male') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
  };

  const calculateCalories = () => {
    const { age, gender, weight, height, activityLevel, goal, unit } = formData;
    
    if (!age || !weight || !height) {
      setResult(null);
      return;
    }

    let weightKg, heightCm;

    if (unit === 'kg-cm') {
      weightKg = parseFloat(weight);
      heightCm = parseFloat(height);
    } else if (unit === 'imperial') {
      weightKg = parseFloat(weight) / 2.20462;
      heightCm = parseFloat(height) * 2.54;
    } else if (unit === 'feet') {
      weightKg = parseFloat(weight) / 2.20462;
      heightCm = parseFloat(height) * 30.48;
    }

    const ageNum = parseFloat(age);
    const bmr = calculateBMR(weightKg, heightCm, ageNum, gender);
    
    const activityMultiplier = activityLevels.find(a => a.level === activityLevel)?.multiplier || 1.55;
    const tdee = bmr * activityMultiplier;
    
    const goalAdjustment = goals.find(g => g.value === goal)?.adjustment || 0;
    const targetCalories = Math.round(tdee + goalAdjustment);

    // Calculate macros
    const proteinGrams = Math.round((targetCalories * 0.25) / 4); // 25% of calories, 4 cal/g
    const carbGrams = Math.round((targetCalories * 0.45) / 4); // 45% of calories, 4 cal/g
    const fatGrams = Math.round((targetCalories * 0.30) / 9); // 30% of calories, 9 cal/g

    const newResult = {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories,
      proteinGrams,
      carbGrams,
      fatGrams,
      activityLevel: activityLevels.find(a => a.level === activityLevel)?.name,
      goal: goals.find(g => g.value === goal)?.name
    };

    setResult(newResult);
    
    // Add to history
    setCalorieHistory(prev => [...prev, { ...newResult, date: new Date().toISOString() }]);
  };

  useEffect(() => {
    calculateCalories();
  }, [formData]);

  const getInputLabel = (field) => {
    if (formData.unit === 'kg-cm') {
      return field === 'weight' ? 'Weight (kg)' : 'Height (cm)';
    } else if (formData.unit === 'imperial') {
      return field === 'weight' ? 'Weight (lbs)' : 'Height (inches)';
    } else {
      return field === 'weight' ? 'Weight (lbs)' : 'Height (feet)';
    }
  };

  const getInputPlaceholder = (field) => {
    if (formData.unit === 'kg-cm') {
      return field === 'weight' ? '70' : '170';
    } else if (formData.unit === 'imperial') {
      return field === 'weight' ? '154' : '67';
    } else {
      return field === 'weight' ? '154' : '5.6';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 hover:text-orange-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Home
          </motion.button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Calorie Calculator
          </h1>
          
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
            <motion.button
              onClick={() => navigate('/')}
              className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlayIcon className="w-4 h-4 mr-2" />
              Try Demo
            </motion.button>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Calculate your daily calorie needs based on your activity level and weight goals. 
            Get personalized macronutrient recommendations for optimal nutrition.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FireIcon className="w-6 h-6 mr-2 text-orange-600" />
                Calculate Your Calories
              </h2>

              {/* Unit System */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit System
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="kg-cm">Metric (kg, cm)</option>
                  <option value="imperial">Imperial (lbs, inches)</option>
                  <option value="feet">US Units (lbs, feet)</option>
                </select>
              </div>

              {/* Age */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  step="any"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="25"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Gender */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Weight Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getInputLabel('weight')}
                </label>
                <input
                  type="number"
                  step="any"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder={getInputPlaceholder('weight')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Height Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getInputLabel('height')}
                </label>
                <input
                  type="number"
                  step="any"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder={getInputPlaceholder('height')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Activity Level */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Level
                </label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {activityLevels.map(level => (
                    <option key={level.level} value={level.level}>
                      {level.name} - {level.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Goal */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal
                </label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {goals.map(goal => (
                    <option key={goal.value} value={goal.value}>
                      {goal.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Calculate Button */}
              <motion.button
                onClick={calculateCalories}
                disabled={!formData.age || !formData.weight || !formData.height}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                  formData.age && formData.weight && formData.height
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={formData.age && formData.weight && formData.height ? { scale: 1.02 } : {}}
                whileTap={formData.age && formData.weight && formData.height ? { scale: 0.98 } : {}}
              >
                Calculate Calories
              </motion.button>


            </motion.div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            {/* Your Calorie Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <FireIcon className="w-6 h-6 mr-2 text-orange-600" />
                  Your Calorie Needs
                </h3>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-orange-600 mb-3">
                      {result.targetCalories}
                    </div>
                    <div className="text-lg text-gray-600">calories per day</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-gray-600">BMR</div>
                      <div className="font-semibold text-lg">{result.bmr} cal</div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-gray-600">TDEE</div>
                      <div className="font-semibold text-lg">{result.tdee} cal</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 text-center">Macronutrients</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-blue-700 font-medium">Protein</span>
                        </div>
                        <span className="font-semibold">{result.proteinGrams}g</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-green-700 font-medium">Carbohydrates</span>
                        </div>
                        <span className="font-semibold">{result.carbGrams}g</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                          <span className="text-yellow-700 font-medium">Fat</span>
                        </div>
                        <span className="font-semibold">{result.fatGrams}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Understanding Calories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mt-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <InformationCircleIcon className="w-6 h-6 mr-2 text-orange-600" />
            Understanding Calories
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">What are Calories?</h4>
              <p className="text-gray-600 mb-4">
                Calories are units of energy that your body uses for all its functions. 
                The number of calories you need depends on your age, gender, weight, height, and activity level.
              </p>
              
              <h4 className="font-semibold text-gray-900 mb-3">BMR vs TDEE</h4>
              <div className="space-y-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-900">BMR (Basal Metabolic Rate)</p>
                  <p className="text-sm text-blue-700">Calories burned at complete rest</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-green-900">TDEE (Total Daily Energy Expenditure)</p>
                  <p className="text-sm text-green-700">Total calories burned including activity</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Weight Management</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Lose Weight</p>
                    <p className="text-sm text-gray-600">Eat 500 calories less than TDEE</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Maintain Weight</p>
                    <p className="text-sm text-gray-600">Eat calories equal to TDEE</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-orange-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Gain Weight</p>
                    <p className="text-sm text-gray-600">Eat 500 calories more than TDEE</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer at Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6"
        >
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-2">Important Disclaimer</h4>
              <p className="text-sm text-amber-700">
                Calorie calculations are based on information available in the public domain and are for educational purposes only. 
                Individual calorie needs may vary based on genetics, medical conditions, and other factors. 
                For personalized nutrition advice, please consult with qualified healthcare professionals or registered dietitians.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CalorieCalculatorPage; 