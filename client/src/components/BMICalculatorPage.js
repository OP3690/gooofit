import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ScaleIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const BMICalculatorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    unit: 'kg-cm',
    weight: '',
    height: '',
    desiredBMI: ''
  });
  const [result, setResult] = useState(null);
  const [bmiHistory, setBmiHistory] = useState([]);

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
    { level: 'Sedentary', multiplier: 1.2, description: 'Little or no exercise' },
    { level: 'Lightly Active', multiplier: 1.375, description: 'Light exercise 1-3 days/week' },
    { level: 'Moderately Active', multiplier: 1.55, description: 'Moderate exercise 3-5 days/week' },
    { level: 'Very Active', multiplier: 1.725, description: 'Hard exercise 6-7 days/week' },
    { level: 'Extremely Active', multiplier: 1.9, description: 'Very hard exercise, physical job' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const convertWeight = (weight, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return weight;
    if (fromUnit === 'kg-cm' && toUnit === 'imperial') return weight * 2.20462;
    if (fromUnit === 'imperial' && toUnit === 'kg-cm') return weight / 2.20462;
    if (fromUnit === 'feet' && toUnit === 'kg-cm') return weight / 2.20462;
    if (fromUnit === 'kg-cm' && toUnit === 'feet') return weight * 2.20462;
    return weight;
  };

  const convertHeight = (height, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return height;
    if (fromUnit === 'kg-cm' && toUnit === 'imperial') return height / 2.54;
    if (fromUnit === 'imperial' && toUnit === 'kg-cm') return height * 2.54;
    if (fromUnit === 'feet' && toUnit === 'kg-cm') return height * 30.48;
    if (fromUnit === 'kg-cm' && toUnit === 'feet') return height / 30.48;
    return height;
  };

  const calculateBMI = () => {
    const { weight, height, unit, desiredBMI } = formData;
    
    if (!weight || !height) {
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

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    
    let category, color, description;
    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'blue';
      description = 'You may need to gain weight for better health.';
    } else if (bmi < 25) {
      category = 'Normal weight';
      color = 'green';
      description = 'Great! You are in the healthy weight range.';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'yellow';
      description = 'Consider weight loss for better health.';
    } else {
      category = 'Obese';
      color = 'red';
      description = 'Weight loss is recommended for health improvement.';
    }

    let targetWeight = null;
    let weightToLose = null;
    let weightToGain = null;

    if (desiredBMI) {
      targetWeight = desiredBMI * (heightM * heightM);
      if (targetWeight > weightKg) {
        weightToGain = targetWeight - weightKg;
      } else {
        weightToLose = weightKg - targetWeight;
      }
    }

    const newResult = {
      bmi: bmi.toFixed(1),
      category,
      color,
      description,
      weightKg: weightKg.toFixed(1),
      heightCm: heightCm.toFixed(1),
      targetWeight: targetWeight ? targetWeight.toFixed(1) : null,
      weightToLose: weightToLose ? weightToLose.toFixed(1) : null,
      weightToGain: weightToGain ? weightToGain.toFixed(1) : null
    };

    setResult(newResult);
    
    // Add to history
    setBmiHistory(prev => [...prev, { ...newResult, date: new Date().toISOString() }]);
  };

  useEffect(() => {
    calculateBMI();
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
            BMI Calculator
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
            Calculate your Body Mass Index to assess your weight status and understand your health risks. 
            Get personalized recommendations and track your progress over time.
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
                <ScaleIcon className="w-6 h-6 mr-2 text-orange-600" />
                Calculate Your BMI
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

              {/* Desired BMI Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desired BMI (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  name="desiredBMI"
                  value={formData.desiredBMI}
                  onChange={handleInputChange}
                  placeholder="22.0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your target BMI to see how much weight you need to gain or lose
                </p>
              </div>

              {/* Calculate Button */}
              <motion.button
                onClick={calculateBMI}
                disabled={!formData.weight || !formData.height}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                  formData.weight && formData.height
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={formData.weight && formData.height ? { scale: 1.02 } : {}}
                whileTap={formData.weight && formData.height ? { scale: 0.98 } : {}}
              >
                Calculate BMI
              </motion.button>

            </motion.div>

            {/* Understanding BMI Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8 mt-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <InformationCircleIcon className="w-6 h-6 mr-2 text-orange-600" />
                Understanding BMI
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What is BMI?</h4>
                  <p className="text-gray-600 mb-4">
                    Body Mass Index (BMI) is a simple calculation using your height and weight to estimate body fat. 
                    It's a useful screening tool but doesn't directly measure body fat.
                  </p>
                  
                  <h4 className="font-semibold text-gray-900 mb-3">BMI Formula</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-center font-mono text-lg">
                      BMI = weight (kg) / height (m)²
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Health Implications</h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Normal BMI (18.5-24.9)</p>
                        <p className="text-sm text-gray-600">Associated with lowest health risks</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">High BMI (≥25)</p>
                        <p className="text-sm text-gray-600">Increased risk of heart disease, diabetes</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <XCircleIcon className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Very High BMI (≥30)</p>
                        <p className="text-sm text-gray-600">Significantly increased health risks</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            {/* Your Current BMI Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <ScaleIcon className="w-6 h-6 mr-2 text-orange-600" />
                  Your Current BMI
                </h3>
                
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-orange-600 mb-3">
                    {result.bmi}
                  </div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${
                    result.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    result.color === 'green' ? 'bg-green-100 text-green-800' :
                    result.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.category}
                  </div>
                </div>

                <p className="text-gray-700 mb-6 text-center text-lg">{result.description}</p>

                {result.targetWeight && (
                  <div className="bg-white rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4 text-center">Weight Goal Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Weight:</span>
                        <span className="font-medium">{result.targetWeight} kg</span>
                      </div>
                      {result.weightToLose && (
                        <div className="flex justify-between text-red-600">
                          <span>Weight to Lose:</span>
                          <span className="font-medium">{result.weightToLose} kg</span>
                        </div>
                      )}
                      {result.weightToGain && (
                        <div className="flex justify-between text-green-600">
                          <span>Weight to Gain:</span>
                          <span className="font-medium">{result.weightToGain} kg</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* BMI Categories */}
                <div className="text-sm text-center">
                  <p className="font-semibold text-gray-900 mb-3">BMI Categories:</p>
                  <div className="space-y-2 inline-block text-left">
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      <span className="text-blue-700 font-medium">Underweight:</span>
                      <span className="text-gray-600 ml-1">&lt; 18.5</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-green-700 font-medium">Normal weight:</span>
                      <span className="text-gray-600 ml-1">18.5 - 24.9</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                      <span className="text-yellow-700 font-medium">Overweight:</span>
                      <span className="text-gray-600 ml-1">25 - 29.9</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                      <span className="text-red-700 font-medium">Obese:</span>
                      <span className="text-gray-600 ml-1">≥ 30</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

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
                BMI calculations are based on information available in the public domain and are for educational purposes only. 
                BMI doesn't account for muscle mass, bone density, age, sex, or ethnicity. For personalized health advice, 
                please consult with qualified healthcare professionals.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BMICalculatorPage; 