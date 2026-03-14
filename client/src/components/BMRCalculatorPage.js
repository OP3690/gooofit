import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlayIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const formulas = [
  {
    value: 'mifflin',
    label: 'Mifflin-St Jeor',
    description: 'Most accurate for general population',
  },
  {
    value: 'harris',
    label: 'Harris-Benedict',
    description: 'Older, still widely used',
  },
  {
    value: 'katch',
    label: 'Katch-McArdle',
    description: 'Best if you know your body fat %',
  },
];

const activityLevels = [
  { level: 'sedentary', name: 'Sedentary', multiplier: 1.2, description: 'Little or no exercise' },
  { level: 'light', name: 'Lightly Active', multiplier: 1.375, description: 'Light exercise 1-3 days/week' },
  { level: 'moderate', name: 'Moderately Active', multiplier: 1.55, description: 'Moderate exercise 3-5 days/week' },
  { level: 'active', name: 'Very Active', multiplier: 1.725, description: 'Hard exercise 6-7 days/week' },
  { level: 'very_active', name: 'Extremely Active', multiplier: 1.9, description: 'Very hard exercise, physical job' },
];

const BMRCalculatorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    unit: 'kg-cm',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    formula: 'mifflin',
    bodyFat: '', // for Katch-McArdle
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

  const calculateBMR = () => {
    const { age, gender, weight, height, unit, formula, bodyFat } = formData;
    if (!age || !weight || !height || (formula === 'katch' && !bodyFat)) {
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
    let bmr = 0;
    let usedFormula = '';
    if (formula === 'mifflin') {
      bmr = gender === 'male'
        ? 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
      usedFormula = 'Mifflin-St Jeor';
    } else if (formula === 'harris') {
      bmr = gender === 'male'
        ? 13.397 * weightKg + 4.799 * heightCm - 5.677 * ageNum + 88.362
        : 9.247 * weightKg + 3.098 * heightCm - 4.33 * ageNum + 447.593;
      usedFormula = 'Harris-Benedict';
    } else if (formula === 'katch') {
      // Katch-McArdle requires body fat %
      const bf = parseFloat(bodyFat);
      const leanMass = weightKg * (1 - bf / 100);
      bmr = 370 + 21.6 * leanMass;
      usedFormula = 'Katch-McArdle';
    }
    // Calculate TDEE for each activity level
    const tdee = activityLevels.map((a) => ({
      ...a,
      calories: Math.round(bmr * a.multiplier),
    }));
    setResult({ bmr: Math.round(bmr), usedFormula, tdee });
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
          <h1 className="text-3xl font-bold text-gray-900">BMR Calculator</h1>
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
            Estimate your Basal Metabolic Rate (BMR) and daily calorie needs using the most accurate scientific formulas. Learn how your body burns energy at rest and how activity affects your calorie requirements.
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
                Calculate Your BMR
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
              {/* Formula */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Formula</label>
                <select
                  name="formula"
                  value={formData.formula}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {formulas.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formulas.find((f) => f.value === formData.formula)?.description}
                </p>
              </div>
              {/* Body Fat % for Katch-McArdle */}
              {formData.formula === 'katch' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body Fat %</label>
                  <input
                    type="number"
                    step="any"
                    name="bodyFat"
                    value={formData.bodyFat}
                    onChange={handleInputChange}
                    placeholder="15"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              )}
              {/* Calculate Button */}
              <motion.button
                onClick={calculateBMR}
                disabled={
                  !formData.age || !formData.weight || !formData.height ||
                  (formData.formula === 'katch' && !formData.bodyFat)
                }
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                  formData.age && formData.weight && formData.height && (formData.formula !== 'katch' || formData.bodyFat)
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={formData.age && formData.weight && formData.height && (formData.formula !== 'katch' || formData.bodyFat) ? { scale: 1.02 } : {}}
                whileTap={formData.age && formData.weight && formData.height && (formData.formula !== 'katch' || formData.bodyFat) ? { scale: 0.98 } : {}}
              >
                Calculate BMR
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
                  Your BMR & Calorie Needs
                </h3>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-orange-600 mb-3">{result.bmr}</div>
                    <div className="text-lg text-gray-600">BMR (kcal/day)</div>
                    <div className="text-sm text-gray-500 mt-1">({result.usedFormula} Formula)</div>
                  </div>
                  <div className="bg-white rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 text-center">Estimated Daily Calorie Needs</h4>
                    <div className="space-y-2">
                      {result.tdee.map((a) => (
                        <div key={a.level} className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">{a.name}</span>
                          <span className="font-semibold text-orange-700">{a.calories} kcal</span>
                          <span className="text-xs text-gray-400">{a.description}</span>
                        </div>
                      ))}
                    </div>
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
            Understanding BMR
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">What is BMR?</h4>
              <p className="text-gray-600 mb-4">
                Basal Metabolic Rate (BMR) is the number of calories your body needs to maintain basic physiological functions at rest. It is the foundation for calculating your daily calorie needs.
              </p>
              <h4 className="font-semibold text-gray-900 mb-3">Why is BMR Important?</h4>
              <p className="text-gray-600 mb-4">
                Knowing your BMR helps you estimate how many calories you need to maintain, lose, or gain weight. Your total daily energy expenditure (TDEE) is your BMR multiplied by an activity factor.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">BMR Formulas</h4>
              <ul className="list-disc pl-5 text-gray-700 text-sm space-y-2">
                <li><strong>Mifflin-St Jeor:</strong> <span className="text-gray-500">(10 × weight [kg]) + (6.25 × height [cm]) - (5 × age [y]) + 5 (men) / -161 (women)</span></li>
                <li><strong>Harris-Benedict:</strong> <span className="text-gray-500">(13.397 × weight [kg]) + (4.799 × height [cm]) - (5.677 × age [y]) + 88.362 (men) / (9.247 × weight [kg]) + (3.098 × height [cm]) - (4.33 × age [y]) + 447.593 (women)</span></li>
                <li><strong>Katch-McArdle:</strong> <span className="text-gray-500">370 + (21.6 × lean body mass [kg])</span></li>
              </ul>
              <h4 className="font-semibold text-gray-900 mt-6 mb-3">Activity Multipliers</h4>
              <ul className="list-disc pl-5 text-gray-700 text-sm space-y-2">
                {activityLevels.map((a) => (
                  <li key={a.level}><span className="font-medium">{a.name}:</span> {a.multiplier}x - {a.description}</li>
                ))}
              </ul>
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
                BMR calculations are based on information available in the public domain and are for educational purposes only. For personalized nutrition or health advice, consult with qualified healthcare professionals.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BMRCalculatorPage; 