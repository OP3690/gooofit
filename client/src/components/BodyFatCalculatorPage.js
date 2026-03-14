import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  HeartIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
  ScaleIcon,
  ArrowLeftIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const BodyFatCalculatorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    unit: 'kg-cm',
    gender: 'male',
    age: '',
    weight: '',
    height: '',
    neck: '',
    waist: '',
    hip: ''
  });
  const [result, setResult] = useState(null);
  const [bodyFatHistory, setBodyFatHistory] = useState([]);

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



  const bodyFatCategories = [
    { category: 'Essential Fat', men: '2-5%', women: '10-13%', color: '#3B82F6' },
    { category: 'Athletes', men: '6-13%', women: '14-20%', color: '#10B981' },
    { category: 'Fitness', men: '14-17%', women: '21-24%', color: '#F59E0B' },
    { category: 'Average', men: '18-24%', women: '25-31%', color: '#8B5CF6' },
    { category: 'Obese', men: '25%+', women: '32%+', color: '#EF4444' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateBodyFat = () => {
    const { gender, age, weight, height, neck, waist, hip, unit } = formData;
    
    if (!age || !weight || !height || !neck || !waist || (gender === 'female' && !hip)) {
      setResult(null);
      return;
    }

    let weightKg, heightCm, neckCm, waistCm, hipCm;

    if (unit === 'kg-cm') {
      weightKg = parseFloat(weight);
      heightCm = parseFloat(height);
      neckCm = parseFloat(neck);
      waistCm = parseFloat(waist);
      hipCm = gender === 'female' ? parseFloat(hip) : 0;
    } else if (unit === 'imperial') {
      weightKg = parseFloat(weight) / 2.20462;
      heightCm = parseFloat(height) * 2.54;
      neckCm = parseFloat(neck) * 2.54;
      waistCm = parseFloat(waist) * 2.54;
      hipCm = gender === 'female' ? parseFloat(hip) * 2.54 : 0;
    } else if (unit === 'feet') {
      weightKg = parseFloat(weight) / 2.20462;
      heightCm = parseFloat(height) * 30.48;
      neckCm = parseFloat(neck) * 30.48;
      waistCm = parseFloat(waist) * 30.48;
      hipCm = gender === 'female' ? parseFloat(hip) * 30.48 : 0;
    }

    const ageNum = parseFloat(age);
    let bodyFatPercentage;

    // U.S. Navy Method
    if (gender === 'male') {
      bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
    } else {
      bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
    }

    // BMI Method (alternative calculation)
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    let bmiBodyFat;
    
    if (gender === 'male') {
      bmiBodyFat = (1.20 * bmi) + (0.23 * ageNum) - 1.62;
    } else {
      bmiBodyFat = (1.20 * bmi) + (0.23 * ageNum) - 5.4;
    }

    // Determine category
    let category, color, description;
    if (gender === 'male') {
      if (bodyFatPercentage < 6) {
        category = 'Essential Fat';
        color = 'blue';
        description = 'Essential fat for basic physiological functions.';
      } else if (bodyFatPercentage < 14) {
        category = 'Athletes';
        color = 'green';
        description = 'Excellent fitness level, typical of athletes.';
      } else if (bodyFatPercentage < 18) {
        category = 'Fitness';
        color = 'yellow';
        description = 'Good fitness level, healthy body composition.';
      } else if (bodyFatPercentage < 25) {
        category = 'Average';
        color = 'purple';
        description = 'Average body fat level for general population.';
      } else {
        category = 'Obese';
        color = 'red';
        description = 'High body fat level, consider weight loss.';
      }
    } else {
      if (bodyFatPercentage < 14) {
        category = 'Essential Fat';
        color = 'blue';
        description = 'Essential fat for basic physiological functions.';
      } else if (bodyFatPercentage < 21) {
        category = 'Athletes';
        color = 'green';
        description = 'Excellent fitness level, typical of athletes.';
      } else if (bodyFatPercentage < 25) {
        category = 'Fitness';
        color = 'yellow';
        description = 'Good fitness level, healthy body composition.';
      } else if (bodyFatPercentage < 32) {
        category = 'Average';
        color = 'purple';
        description = 'Average body fat level for general population.';
      } else {
        category = 'Obese';
        color = 'red';
        description = 'High body fat level, consider weight loss.';
      }
    }

    // Calculate fat mass and lean mass
    const fatMass = (bodyFatPercentage / 100) * weightKg;
    const leanMass = weightKg - fatMass;

    // Jackson & Pollock ideal body fat for age
    let idealBodyFat;
    if (gender === 'male') {
      idealBodyFat = 1.1 * ageNum + 0.4;
    } else {
      idealBodyFat = 1.2 * ageNum + 5.4;
    }

    const fatToLose = Math.max(0, bodyFatPercentage - idealBodyFat);
    const weightToLose = (fatToLose / 100) * weightKg;

    const newResult = {
      bodyFatPercentage: bodyFatPercentage.toFixed(1),
      bmiBodyFat: bmiBodyFat.toFixed(1),
      category,
      color,
      description,
      fatMass: fatMass.toFixed(1),
      leanMass: leanMass.toFixed(1),
      idealBodyFat: idealBodyFat.toFixed(1),
      fatToLose: fatToLose.toFixed(1),
      weightToLose: weightToLose.toFixed(1),
      weightKg: weightKg.toFixed(1)
    };

    setResult(newResult);
    
    // Add to history
    setBodyFatHistory(prev => [...prev, { ...newResult, date: new Date().toISOString() }]);
  };

  useEffect(() => {
    calculateBodyFat();
  }, [formData]);

  const getInputLabel = (field) => {
    if (formData.unit === 'kg-cm') {
      return field === 'weight' ? 'Weight (kg)' : 
             field === 'height' ? 'Height (cm)' :
             field === 'neck' ? 'Neck (cm)' :
             field === 'waist' ? 'Waist (cm)' :
             'Hip (cm)';
    } else if (formData.unit === 'imperial') {
      return field === 'weight' ? 'Weight (lbs)' : 
             field === 'height' ? 'Height (inches)' :
             field === 'neck' ? 'Neck (inches)' :
             field === 'waist' ? 'Waist (inches)' :
             'Hip (inches)';
    } else {
      return field === 'weight' ? 'Weight (lbs)' : 
             field === 'height' ? 'Height (feet)' :
             field === 'neck' ? 'Neck (feet)' :
             field === 'waist' ? 'Waist (feet)' :
             'Hip (feet)';
    }
  };

  const getInputPlaceholder = (field) => {
    if (formData.unit === 'kg-cm') {
      return field === 'weight' ? '70' : 
             field === 'height' ? '170' :
             field === 'neck' ? '38' :
             field === 'waist' ? '80' :
             '95';
    } else if (formData.unit === 'imperial') {
      return field === 'weight' ? '154' : 
             field === 'height' ? '67' :
             field === 'neck' ? '15' :
             field === 'waist' ? '32' :
             '37';
    } else {
      return field === 'weight' ? '154' : 
             field === 'height' ? '5.6' :
             field === 'neck' ? '1.25' :
             field === 'waist' ? '2.67' :
             '3.08';
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
            Body Fat Calculator
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
            Estimate your body fat percentage using proven measurement methods. 
            Get detailed body composition analysis and personalized recommendations.
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
                <HeartIcon className="w-6 h-6 mr-2 text-purple-600" />
                Calculate Body Fat
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="kg-cm">Metric (kg, cm)</option>
                  <option value="imperial">Imperial (lbs, inches)</option>
                  <option value="feet">US Units (lbs, feet)</option>
                </select>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Neck Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getInputLabel('neck')}
                </label>
                <input
                  type="number"
                  step="any"
                  name="neck"
                  value={formData.neck}
                  onChange={handleInputChange}
                  placeholder={getInputPlaceholder('neck')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Waist Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getInputLabel('waist')}
                </label>
                <input
                  type="number"
                  step="any"
                  name="waist"
                  value={formData.waist}
                  onChange={handleInputChange}
                  placeholder={getInputPlaceholder('waist')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Hip Input (for females) */}
              {formData.gender === 'female' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getInputLabel('hip')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="hip"
                    value={formData.hip}
                    onChange={handleInputChange}
                    placeholder={getInputPlaceholder('hip')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Calculate Button */}
              <motion.button
                onClick={calculateBodyFat}
                disabled={!formData.age || !formData.weight || !formData.height || !formData.neck || !formData.waist || (formData.gender === 'female' && !formData.hip)}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                  formData.age && formData.weight && formData.height && formData.neck && formData.waist && (formData.gender === 'male' || formData.hip)
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={formData.age && formData.weight && formData.height && formData.neck && formData.waist && (formData.gender === 'male' || formData.hip) ? { scale: 1.02 } : {}}
                whileTap={formData.age && formData.weight && formData.height && formData.neck && formData.waist && (formData.gender === 'male' || formData.hip) ? { scale: 0.98 } : {}}
              >
                Calculate Body Fat
              </motion.button>

            </motion.div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            {/* Your Body Fat Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <HeartIcon className="w-6 h-6 mr-2 text-orange-600" />
                  Your Body Fat Analysis
                </h3>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-orange-600 mb-3">
                      {result.bodyFatPercentage}%
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      result.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      result.color === 'green' ? 'bg-green-100 text-green-800' :
                      result.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      result.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.category}
                    </div>
                  </div>

                  <p className="text-gray-700 text-center">{result.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-gray-600">Fat Mass</div>
                      <div className="font-semibold text-lg">{result.fatMass} kg</div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-gray-600">Lean Mass</div>
                      <div className="font-semibold text-lg">{result.leanMass} kg</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 text-center">Additional Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">BMI Method:</span>
                        <span className="font-semibold">{result.bmiBodyFat}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Ideal Body Fat:</span>
                        <span className="font-semibold">{result.idealBodyFat}%</span>
                      </div>
                      {parseFloat(result.fatToLose) > 0 && (
                        <div className="flex justify-between items-center text-red-600">
                          <span>Fat to Lose:</span>
                          <span className="font-semibold">{result.fatToLose}%</span>
                        </div>
                      )}
                      {parseFloat(result.weightToLose) > 0 && (
                        <div className="flex justify-between items-center text-red-600">
                          <span>Weight to Lose:</span>
                          <span className="font-semibold">{result.weightToLose} kg</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Understanding Body Fat Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mt-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <InformationCircleIcon className="w-6 h-6 mr-2 text-orange-600" />
            Understanding Body Fat
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">What is Body Fat?</h4>
              <p className="text-gray-600 mb-4">
                Body fat percentage is the proportion of fat mass to total body weight. 
                It's a better indicator of health than weight alone.
              </p>
              
              <h4 className="font-semibold text-gray-900 mb-3">Measurement Methods</h4>
              <div className="space-y-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-900">U.S. Navy Method</p>
                  <p className="text-sm text-blue-700">Uses body measurements for estimation</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-green-900">BMI Method</p>
                  <p className="text-sm text-green-700">Uses BMI and age for estimation</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Body Fat Categories</h4>
              <div className="space-y-3">
                {bodyFatCategories.map((category, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`w-3 h-3 rounded-full mr-3 mt-2`} style={{ backgroundColor: category.color }}></div>
                    <div>
                      <p className="font-medium text-gray-900">{category.category}</p>
                      <p className="text-sm text-gray-600">Men: {category.men} | Women: {category.women}</p>
                    </div>
                  </div>
                ))}
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
                Body fat calculations are based on information available in the public domain and are for educational purposes only. 
                These methods provide estimates and may not be as accurate as professional body composition testing. 
                For precise measurements, consult with qualified healthcare professionals or fitness experts.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BodyFatCalculatorPage; 