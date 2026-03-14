import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlayIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const activityLevels = [
  { level: 'sedentary', name: 'Sedentary', multiplier: 1.2, description: 'Little or no exercise' },
  { level: 'light', name: 'Lightly Active', multiplier: 1.375, description: 'Light exercise 1-3 days/week' },
  { level: 'moderate', name: 'Moderately Active', multiplier: 1.55, description: 'Moderate exercise 3-5 days/week' },
  { level: 'active', name: 'Very Active', multiplier: 1.725, description: 'Hard exercise 6-7 days/week' },
  { level: 'very_active', name: 'Extremely Active', multiplier: 1.9, description: 'Very hard exercise, physical job' },
];

const goals = [
  { value: 'maintenance', name: 'Maintenance', multiplier: 0.25, description: 'Maintain current weight' },
  { value: 'weight_loss', name: 'Weight Loss', multiplier: 0.20, description: 'Lose weight' },
  { value: 'muscle_gain', name: 'Muscle Gain', multiplier: 0.30, description: 'Build muscle' },
];

const FatIntakeCalculatorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    unit: 'kg-cm',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    goal: 'maintenance',
  });
  const [result, setResult] = useState(null);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fat calculation logic
  const calculateFat = () => {
    const { age, gender, weight, height, unit, activityLevel, goal } = formData;
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
    // Estimate BMR (Mifflin-St Jeor)
    const bmr = gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
    // TDEE
    const activityMultiplier = activityLevels.find(a => a.level === activityLevel)?.multiplier || 1.55;
    const tdee = bmr * activityMultiplier;
    // Fat: 20-35% of calories (depending on goal)
    const goalMultiplier = goals.find(g => g.value === goal)?.multiplier || 0.25;
    const fatPercentage = goalMultiplier * 100;
    const fatCals = tdee * goalMultiplier;
    const fatGrams = Math.round(fatCals / 9); // 1g fat = 9 kcal
    setResult({
      tdee: Math.round(tdee),
      fatGrams,
      fatCals: Math.round(fatCals),
      fatPercentage: Math.round(fatPercentage),
    });
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
          <h1 className="text-3xl font-bold text-gray-900">Fat Intake Calculator</h1>
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
            Calculate your daily fat intake needs based on your body weight, activity level, and fitness goals. Learn about healthy fats and their role in your nutrition plan.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Section */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FireIcon className="w-6 h-6 mr-2 text-orange-600" />
                Calculate Your Fat Intake Needs
              </h2>
              {/* Unit System */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit System</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
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
              {/* Weight */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight ({formData.unit === 'kg-cm' ? 'kg' : 'lbs'})</label>
                <input
                  type="number"
                  step="any"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder={formData.unit === 'kg-cm' ? '70' : '154'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              {/* Height */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Height ({formData.unit === 'kg-cm' ? 'cm' : formData.unit === 'imperial' ? 'inches' : 'feet'})</label>
                <input
                  type="number"
                  step="any"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder={formData.unit === 'kg-cm' ? '175' : formData.unit === 'imperial' ? '69' : '5.8'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              {/* Activity Level */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {activityLevels.map((level) => (
                    <option key={level.level} value={level.level}>
                      {level.name} - {level.description}
                    </option>
                  ))}
                </select>
              </div>
              {/* Goal */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Goal</label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {goals.map((goal) => (
                    <option key={goal.value} value={goal.value}>
                      {goal.name} - {goal.description}
                    </option>
                  ))}
                </select>
              </div>
              {/* Calculate Button */}
              <motion.button
                onClick={calculateFat}
                disabled={!formData.age || !formData.weight || !formData.height}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                  formData.age && formData.weight && formData.height
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={formData.age && formData.weight && formData.height ? { scale: 1.02 } : {}}
                whileTap={formData.age && formData.weight && formData.height ? { scale: 0.98 } : {}}
              >
                Calculate Fat Intake
              </motion.button>
            </motion.div>
          </div>
          {/* Results Section */}
          <div>
            {result && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <FireIcon className="w-6 h-6 mr-2 text-orange-600" />
                  Your Fat Intake Needs
                </h3>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-3">
                      {result.fatGrams}g
                    </div>
                    <div className="text-lg text-gray-600">per day</div>
                    <div className="text-sm text-gray-500 mt-1">({result.fatCals} kcal, {result.fatPercentage}% of daily calories)</div>
                  </div>
                  <div className="bg-white rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 text-center">Estimated Daily Calorie Needs</h4>
                    <div className="text-center text-orange-700 font-semibold text-lg mb-2">{result.tdee} kcal</div>
                    <div className="text-sm text-gray-500">Based on your BMR and activity level</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        {/* Educational Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mt-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <InformationCircleIcon className="w-6 h-6 mr-2 text-orange-600" />
            Understanding Dietary Fats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">What are Dietary Fats?</h4>
              <p className="text-gray-600 mb-4">
                Dietary fats are essential macronutrients that provide energy, support cell growth, protect organs, and help absorb vitamins. They're crucial for hormone production and brain health.
              </p>
              <h4 className="font-semibold text-gray-900 mb-3">Recommended Intake</h4>
              <p className="text-gray-600 mb-4">
                The American Heart Association recommends 20-35% of daily calories from fat. This varies based on goals: 20-25% for weight loss, 25-30% for maintenance, and 30-35% for muscle building.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Types of Fats</h4>
              <ul className="list-disc pl-5 text-gray-700 text-sm space-y-2">
                <li><strong>Healthy Fats:</strong> Monounsaturated and polyunsaturated fats (olive oil, nuts, avocados)</li>
                <li><strong>Essential Fats:</strong> Omega-3 and Omega-6 fatty acids (fish, flaxseeds)</li>
                <li><strong>Limit:</strong> Saturated fats and avoid trans fats</li>
              </ul>
              <h4 className="font-semibold text-gray-900 mt-6 mb-3">Why Fats Matter</h4>
              <p className="text-gray-600 mb-4">
                Fats provide sustained energy, support brain function, help absorb fat-soluble vitamins (A, D, E, K), and are essential for cell membrane structure and hormone production.
              </p>
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
                Fat intake calculations are based on information available in the public domain and are for educational purposes only. For personalized nutrition or health advice, consult with qualified healthcare professionals.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FatIntakeCalculatorPage; 