import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  CalculatorIcon, 
  ScaleIcon, 
  FireIcon, 
  HeartIcon,
  BeakerIcon,
  ChartBarIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const HealthCalculator = () => {
  const [searchParams] = useSearchParams();
  const [activeCalculator, setActiveCalculator] = useState('bmi');

  // Set active calculator based on URL parameter
  useEffect(() => {
    const calcParam = searchParams.get('calc');
    if (calcParam && calculators.all.some(calc => calc.id === calcParam)) {
      setActiveCalculator(calcParam);
    }
  }, [searchParams]);

  const calculators = {
    basic: [
      { id: 'bmi', name: 'BMI Calculator', icon: ScaleIcon, color: 'blue' },
      { id: 'calorie', name: 'Calorie Calculator', icon: FireIcon, color: 'orange' },
      { id: 'body-fat', name: 'Body Fat Calculator', icon: UserIcon, color: 'purple' },
      { id: 'bmr', name: 'BMR Calculator', icon: HeartIcon, color: 'red' },
    ],
    nutrition: [
      { id: 'carbohydrate', name: 'Carbohydrate Calculator', icon: BeakerIcon, color: 'green' },
      { id: 'protein', name: 'Protein Calculator', icon: ChartBarIcon, color: 'indigo' },
      { id: 'fat-intake', name: 'Fat Intake Calculator', icon: CogIcon, color: 'yellow' },
    ],
    advanced: [
      { id: 'vitamin', name: 'Vitamin Calculator', icon: BeakerIcon, color: 'teal' },
    ]
  };

  // Flatten all calculators for easier access
  calculators.all = [...calculators.basic, ...calculators.nutrition, ...calculators.advanced];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      orange: 'from-orange-500 to-orange-600',
      purple: 'from-purple-500 to-purple-600',
      red: 'from-red-500 to-red-600',
      green: 'from-green-500 to-green-600',
      indigo: 'from-indigo-500 to-indigo-600',
      yellow: 'from-yellow-500 to-yellow-600',
      teal: 'from-teal-500 to-teal-600'
    };
    return colors[color] || 'from-gray-500 to-gray-600';
  };

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'bmi':
        return <BMICalculator />;
      case 'calorie':
        return <CalorieCalculator />;
      case 'body-fat':
        return <BodyFatCalculator />;
      case 'bmr':
        return <BMRCalculator />;
      case 'carbohydrate':
        return <CarbohydrateCalculator />;
      case 'protein':
        return <ProteinCalculator />;
      case 'fat-intake':
        return <FatIntakeCalculator />;
      case 'vitamin':
        return <VitaminCalculator />;
      default:
        return <BMICalculator />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900">
              Health Calculators
            </h1>
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              <span className="font-medium">Disclaimer:</span> Based on public domain information. Not medical advice. Consult healthcare professionals.
            </div>
          </div>
        </div>
        <p className="text-lg text-gray-600">
          Comprehensive health and fitness calculators to help you achieve your wellness goals
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Calculator Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Calculators</h2>
            
            {/* Basic Calculators */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Basic Health
              </h3>
              <div className="space-y-2">
                {calculators.basic.map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => setActiveCalculator(calc.id)}
                    className={`w-full flex items-center p-3 rounded-lg text-left transition-all duration-300 ${
                      activeCalculator === calc.id
                        ? `bg-gradient-to-r ${getColorClasses(calc.color)} text-white shadow-lg`
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <calc.icon className={`h-5 w-5 mr-3 ${
                      activeCalculator === calc.id ? 'text-white' : 'text-gray-500'
                    }`} />
                    <span className="font-medium">{calc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nutrition Calculators */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Nutrition
              </h3>
              <div className="space-y-2">
                {calculators.nutrition.map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => setActiveCalculator(calc.id)}
                    className={`w-full flex items-center p-3 rounded-lg text-left transition-all duration-300 ${
                      activeCalculator === calc.id
                        ? `bg-gradient-to-r ${getColorClasses(calc.color)} text-white shadow-lg`
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <calc.icon className={`h-5 w-5 mr-3 ${
                      activeCalculator === calc.id ? 'text-white' : 'text-gray-500'
                    }`} />
                    <span className="font-medium">{calc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Calculators */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Advanced
              </h3>
              <div className="space-y-2">
                {calculators.advanced.map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => setActiveCalculator(calc.id)}
                    className={`w-full flex items-center p-3 rounded-lg text-left transition-all duration-300 ${
                      activeCalculator === calc.id
                        ? `bg-gradient-to-r ${getColorClasses(calc.color)} text-white shadow-lg`
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <calc.icon className={`h-5 w-5 mr-3 ${
                      activeCalculator === calc.id ? 'text-white' : 'text-gray-500'
                    }`} />
                    <span className="font-medium">{calc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Calculator Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeCalculator}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            {renderCalculator()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// BMI Calculator Component
const BMICalculator = () => {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    unit: 'kg-cm',
    desiredBMI: ''
  });
  const [result, setResult] = useState(null);

  const calculateBMI = () => {
    if (!formData.weight || !formData.height) return;

    let weight = parseFloat(formData.weight);
    let height = parseFloat(formData.height);

    if (formData.unit === 'imperial') {
      // Convert to metric
      weight = weight * 0.453592; // lbs to kg
      height = height * 0.0254; // inches to meters
    } else if (formData.unit === 'kg-cm') {
      height = height / 100; // cm to meters
    } else {
      // feet-inches
      const feet = Math.floor(height);
      const inches = (height - feet) * 12;
      height = feet * 0.3048 + inches * 0.0254; // feet and inches to meters
      weight = weight * 0.453592; // lbs to kg
    }

    const bmi = weight / (height * height);
    let category = '';
    let color = '';

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-blue-600';
    } else if (bmi < 25) {
      category = 'Normal weight';
      color = 'text-green-600';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'text-yellow-600';
    } else {
      category = 'Obese';
      color = 'text-red-600';
    }

    // Calculate weight needed for desired BMI
    let weightToLose = null;
    let targetWeight = null;
    let weightToGain = null;
    
    if (formData.desiredBMI && !isNaN(parseFloat(formData.desiredBMI))) {
      const desiredBMI = parseFloat(formData.desiredBMI);
      targetWeight = desiredBMI * (height * height);
      
      if (targetWeight < weight) {
        weightToLose = weight - targetWeight;
      } else if (targetWeight > weight) {
        weightToGain = targetWeight - weight;
      }
    }

    setResult({ 
      bmi: bmi.toFixed(1), 
      category, 
      color,
      weightToLose: weightToLose ? weightToLose.toFixed(1) : null,
      weightToGain: weightToGain ? weightToGain.toFixed(1) : null,
      targetWeight: targetWeight ? targetWeight.toFixed(1) : null,
      desiredBMI: formData.desiredBMI
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">BMI Calculator</h2>
        <p className="text-gray-600">Calculate your Body Mass Index to assess your weight status</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit System</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="kg-cm">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lbs, inches)</option>
              <option value="feet">US Units (lbs, feet)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight ({formData.unit === 'kg-cm' ? 'kg' : 'lbs'})
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={formData.unit === 'kg-cm' ? '70' : '154'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height ({formData.unit === 'kg-cm' ? 'cm' : formData.unit === 'imperial' ? 'inches' : 'feet'})
            </label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={formData.unit === 'kg-cm' ? '175' : formData.unit === 'imperial' ? '69' : '5.8'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desired BMI (Optional)
            </label>
            <input
              type="number"
              value={formData.desiredBMI}
              onChange={(e) => setFormData({ ...formData, desiredBMI: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="22.5"
              step="0.1"
              min="15"
              max="40"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your target BMI to see how much weight you need to lose or gain
            </p>
          </div>

          <button
            onClick={calculateBMI}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
          >
            Calculate BMI
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Current BMI</h3>
          {result ? (
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">{result.bmi}</div>
              <div className={`text-xl font-semibold mb-4 ${result.color}`}>{result.category}</div>
              
              {/* Weight Loss/Gain Information */}
              {result.desiredBMI && (result.weightToLose || result.weightToGain) && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">
                    Target BMI: {result.desiredBMI}
                  </h4>
                  
                  {result.weightToLose && (
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-red-600">
                        {result.weightToLose} {formData.unit === 'kg-cm' ? 'kg' : 'lbs'}
                      </div>
                      <div className="text-sm text-red-700">Weight to lose</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Target weight: {result.targetWeight} {formData.unit === 'kg-cm' ? 'kg' : 'lbs'}
                      </div>
                    </div>
                  )}
                  
                  {result.weightToGain && (
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-green-600">
                        {result.weightToGain} {formData.unit === 'kg-cm' ? 'kg' : 'lbs'}
                      </div>
                      <div className="text-sm text-green-700">Weight to gain</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Target weight: {result.targetWeight} {formData.unit === 'kg-cm' ? 'kg' : 'lbs'}
                      </div>
                    </div>
                  )}
                  
                  {!result.weightToLose && !result.weightToGain && (
                    <div className="text-sm text-green-700">
                      You're already at your target BMI!
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-sm mt-4 text-center">
                <p className="font-semibold text-gray-900 mb-2">BMI Categories:</p>
                <div className="space-y-1 inline-block text-left">
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
            </div>
          ) : (
            <div className="text-center text-gray-500">
              Enter your measurements to see your BMI
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Calorie Calculator Component
const CalorieCalculator = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    unit: 'kg-cm',
    activityLevel: 'moderate',
    goal: 'maintain',
    equation: 'mifflin-st-jeor',
    bodyFat: ''
  });
  const [result, setResult] = useState(null);

  const activityLevels = {
    sedentary: { name: 'Sedentary', factor: 1.2, description: 'little or no exercise' },
    light: { name: 'Lightly Active', factor: 1.375, description: 'light exercise 1-3 days/week' },
    moderate: { name: 'Moderately Active', factor: 1.55, description: 'moderate exercise 3-5 days/week' },
    active: { name: 'Very Active', factor: 1.725, description: 'hard exercise 6-7 days/week' },
    veryActive: { name: 'Extra Active', factor: 1.9, description: 'very hard exercise, physical job' }
  };

  const goals = {
    lose: { name: 'Lose Weight', adjustment: -500, description: 'Lose 1 pound per week' },
    lose2: { name: 'Lose Weight (Fast)', adjustment: -1000, description: 'Lose 2 pounds per week' },
    maintain: { name: 'Maintain Weight', adjustment: 0, description: 'Keep current weight' },
    gain: { name: 'Gain Weight', adjustment: 500, description: 'Gain 1 pound per week' }
  };

  const calculateBMR = (weight, height, age, gender, equation, bodyFat) => {
    let bmr = 0;

    switch (equation) {
      case 'mifflin-st-jeor':
        if (gender === 'male') {
          bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
          bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        break;

      case 'harris-benedict':
        if (gender === 'male') {
          bmr = 13.397 * weight + 4.799 * height - 5.677 * age + 88.362;
        } else {
          bmr = 9.247 * weight + 3.098 * height - 4.330 * age + 447.593;
        }
        break;

      case 'katch-mcardle':
        if (bodyFat && bodyFat > 0) {
          const leanMass = weight * (1 - bodyFat / 100);
          bmr = 370 + 21.6 * leanMass;
        } else {
          // Fallback to Mifflin-St Jeor if no body fat percentage
          if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
          } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
          }
        }
        break;

      default:
        if (gender === 'male') {
          bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
          bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
    }

    return Math.round(bmr);
  };

  const calculateCalories = () => {
    if (!formData.age || !formData.weight || !formData.height) return;

    let weight = parseFloat(formData.weight);
    let height = parseFloat(formData.height);
    const age = parseFloat(formData.age);
    const bodyFat = formData.bodyFat ? parseFloat(formData.bodyFat) : null;

    // Convert to metric if needed
    if (formData.unit === 'imperial') {
      weight = weight * 0.453592; // lbs to kg
      height = height * 2.54; // inches to cm
    } else if (formData.unit === 'feet') {
      // Convert feet and inches to cm
      const feet = Math.floor(height);
      const inches = (height - feet) * 12;
      height = feet * 30.48 + inches * 2.54;
      weight = weight * 0.453592; // lbs to kg
    }
    // kg-cm is already in metric units

    // Calculate BMR
    const bmr = calculateBMR(weight, height, age, formData.gender, formData.equation, bodyFat);

    // Calculate TDEE
    const activityFactor = activityLevels[formData.activityLevel].factor;
    const tdee = bmr * activityFactor;

    // Apply goal adjustment
    const goalAdjustment = goals[formData.goal].adjustment;
    const dailyCalories = tdee + goalAdjustment;

    // Calculate weekly calories
    const weeklyCalories = dailyCalories * 7;

    // Calculate weight change per week
    const weeklyWeightChange = goalAdjustment * 7 / 3500; // 3500 calories = 1 pound

    setResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyCalories: Math.round(dailyCalories),
      weeklyCalories: Math.round(weeklyCalories),
      weeklyWeightChange: weeklyWeightChange.toFixed(1),
      activityLevel: activityLevels[formData.activityLevel],
      goal: goals[formData.goal],
      equation: formData.equation
    });
  };

  const getEquationDescription = (equation) => {
    const descriptions = {
      'mifflin-st-jeor': 'Most accurate for most people (recommended)',
      'harris-benedict': 'Revised 1984 equation, widely used',
      'katch-mcardle': 'Most accurate if you know your body fat %'
    };
    return descriptions[equation] || '';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Calorie Calculator</h2>
        <p className="text-gray-600">
          Calculate your daily calorie needs using scientifically validated equations. 
          This calculator helps you determine how many calories you need to maintain, lose, or gain weight.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Unit System */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit System</h3>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="kg-cm">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lbs, inches)</option>
              <option value="feet">US Units (lbs, feet)</option>
            </select>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="25"
                  min="15"
                  max="80"
                />
                <p className="text-xs text-gray-500 mt-1">ages 15 - 80</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight ({formData.unit === 'kg-cm' ? 'kg' : 'lbs'})</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder={formData.unit === 'kg-cm' ? '70' : '154'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height ({formData.unit === 'kg-cm' ? 'cm' : formData.unit === 'imperial' ? 'inches' : 'feet'})</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder={formData.unit === 'kg-cm' ? '175' : formData.unit === 'imperial' ? '69' : '5.8'}
                />
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Level</h3>
            <select
              value={formData.activityLevel}
              onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {Object.entries(activityLevels).map(([key, level]) => (
                <option key={key} value={key}>
                  {level.name}: {level.description}
                </option>
              ))}
            </select>
          </div>

          {/* Goal */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Goal</h3>
            <select
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {Object.entries(goals).map(([key, goal]) => (
                <option key={key} value={key}>
                  {goal.name} - {goal.description}
                </option>
              ))}
            </select>
          </div>

          {/* BMR Equation */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">BMR Equation</h3>
            <select
              value={formData.equation}
              onChange={(e) => setFormData({ ...formData, equation: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="mifflin-st-jeor">Mifflin-St Jeor Equation (Recommended)</option>
              <option value="harris-benedict">Revised Harris-Benedict Equation</option>
              <option value="katch-mcardle">Katch-McArdle Formula (Body Fat %)</option>
            </select>
            <p className="text-xs text-gray-600 mt-2">{getEquationDescription(formData.equation)}</p>
            
            {formData.equation === 'katch-mcardle' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Body Fat Percentage (%)</label>
                <input
                  type="number"
                  value={formData.bodyFat}
                  onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="15"
                  min="1"
                  max="50"
                />
              </div>
            )}
          </div>

          <button
            onClick={calculateCalories}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg text-lg"
          >
            Calculate Calories
          </button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Main Results */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Your Daily Calorie Target</h3>
                <div className="text-4xl font-bold mb-2">{result.dailyCalories}</div>
                <div className="text-lg opacity-90">calories per day</div>
                <div className="mt-4 text-sm opacity-80">
                  {result.goal.name} - {result.goal.description}
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Basal Metabolic Rate (BMR)</div>
                      <div className="text-sm text-gray-600">Calories burned at rest</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{result.bmr} cal</div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Total Daily Energy Expenditure (TDEE)</div>
                      <div className="text-sm text-gray-600">
                        {result.activityLevel.name} - {result.activityLevel.description}
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{result.tdee} cal</div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Weekly Calories</div>
                      <div className="text-sm text-gray-600">Total for 7 days</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{result.weeklyCalories} cal</div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <div className="font-medium text-gray-900">Expected Weight Change</div>
                      <div className="text-sm text-gray-600">Per week</div>
                    </div>
                    <div className={`text-lg font-semibold ${
                      parseFloat(result.weeklyWeightChange) > 0 ? 'text-green-600' : 
                      parseFloat(result.weeklyWeightChange) < 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {result.weeklyWeightChange > 0 ? '+' : ''}{result.weeklyWeightChange} lbs
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Guidelines */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Health Guidelines</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Minimum daily calories: {formData.gender === 'male' ? '1,500' : '1,200'} for health</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>1 pound = 3,500 calories</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Don't lose more than 2 pounds per week for healthy weight loss</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Combine with proper diet and exercise for best results</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <FireIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Your Calories</h3>
              <p className="text-gray-600">
                Enter your information to see your personalized calorie recommendations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Body Fat Calculator Component
const BodyFatCalculator = () => {
  const [formData, setFormData] = useState({
    gender: 'male',
    age: '',
    weight: '',
    height: '',
    neck: '',
    waist: '',
    hip: '',
    unit: 'kg-cm'
  });
  const [result, setResult] = useState(null);

  const bodyFatCategories = {
    male: {
      essential: { min: 2, max: 5, name: 'Essential Fat' },
      athletes: { min: 6, max: 13, name: 'Athletes' },
      fitness: { min: 14, max: 17, name: 'Fitness' },
      average: { min: 18, max: 24, name: 'Average' },
      obese: { min: 25, max: 100, name: 'Obese' }
    },
    female: {
      essential: { min: 10, max: 13, name: 'Essential Fat' },
      athletes: { min: 14, max: 20, name: 'Athletes' },
      fitness: { min: 21, max: 24, name: 'Fitness' },
      average: { min: 25, max: 31, name: 'Average' },
      obese: { min: 32, max: 100, name: 'Obese' }
    }
  };

  const jacksonPollockIdeal = {
    male: {
      20: 8.5, 25: 10.5, 30: 12.7, 35: 13.7, 40: 15.3, 45: 16.4, 50: 18.9, 55: 20.9
    },
    female: {
      20: 17.7, 25: 18.4, 30: 19.3, 35: 21.5, 40: 22.2, 45: 22.9, 50: 25.2, 55: 26.3
    }
  };

  const getBodyFatCategory = (percentage, gender) => {
    const categories = bodyFatCategories[gender];
    for (const [key, category] of Object.entries(categories)) {
      if (percentage >= category.min && percentage <= category.max) {
        return category;
      }
    }
    return categories.obese;
  };

  const getIdealBodyFat = (age, gender) => {
    const ideals = jacksonPollockIdeal[gender];
    const ages = Object.keys(ideals).map(Number).sort((a, b) => a - b);
    
    // Find closest age
    let closestAge = ages[0];
    for (const ageKey of ages) {
      if (Math.abs(age - ageKey) < Math.abs(age - closestAge)) {
        closestAge = ageKey;
      }
    }
    
    return ideals[closestAge];
  };

  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const calculateBodyFatNavy = (gender, weight, height, neck, waist, hip) => {
    let bfp = 0;
    
    if (gender === 'male') {
      // U.S. Navy method for males
      bfp = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
    } else {
      // U.S. Navy method for females
      bfp = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
    }
    
    return Math.max(0, Math.min(100, bfp)); // Clamp between 0-100%
  };

  const calculateBodyFatBMI = (gender, age, bmi) => {
    let bfp = 0;
    
    if (age < 18) {
      // Child/teen formulas
      if (gender === 'male') {
        bfp = 1.51 * bmi - 0.70 * age - 2.2;
      } else {
        bfp = 1.51 * bmi - 0.70 * age + 1.4;
      }
    } else {
      // Adult formulas
      if (gender === 'male') {
        bfp = 1.20 * bmi + 0.23 * age - 16.2;
      } else {
        bfp = 1.20 * bmi + 0.23 * age - 5.4;
      }
    }
    
    return Math.max(0, Math.min(100, bfp)); // Clamp between 0-100%
  };

  const calculateBodyFat = () => {
    if (!formData.age || !formData.weight || !formData.height || !formData.neck || !formData.waist) return;
    if (formData.gender === 'female' && !formData.hip) return;

    let weight = parseFloat(formData.weight);
    let height = parseFloat(formData.height);
    let neck = parseFloat(formData.neck);
    let waist = parseFloat(formData.waist);
    let hip = parseFloat(formData.hip) || 0;
    const age = parseFloat(formData.age);

    // Convert to metric if needed
    if (formData.unit === 'imperial') {
      weight = weight * 0.453592; // lbs to kg
      height = height * 2.54; // inches to cm
      neck = neck * 2.54; // inches to cm
      waist = waist * 2.54; // inches to cm
      hip = hip * 2.54; // inches to cm
    } else if (formData.unit === 'feet') {
      // Convert feet to cm
      const feetToCm = (feet) => feet * 30.48;
      const inchesToCm = (inches) => inches * 2.54;
      
      weight = weight * 0.453592; // lbs to kg
      height = feetToCm(Math.floor(height)) + inchesToCm((height - Math.floor(height)) * 12);
      neck = feetToCm(Math.floor(neck)) + inchesToCm((neck - Math.floor(neck)) * 12);
      waist = feetToCm(Math.floor(waist)) + inchesToCm((waist - Math.floor(waist)) * 12);
      hip = feetToCm(Math.floor(hip)) + inchesToCm((hip - Math.floor(hip)) * 12);
    }
    // kg-cm is already in metric units

    // Calculate BMI
    const bmi = calculateBMI(weight, height);

    // Calculate body fat percentages
    const navyBfp = calculateBodyFatNavy(formData.gender, weight, height, neck, waist, hip);
    const bmiBfp = calculateBodyFatBMI(formData.gender, age, bmi);

    // Calculate fat mass and lean mass
    const fatMassNavy = (navyBfp / 100) * weight;
    const leanMassNavy = weight - fatMassNavy;

    // Get body fat category
    const category = getBodyFatCategory(navyBfp, formData.gender);

    // Get ideal body fat
    const idealBodyFat = getIdealBodyFat(age, formData.gender);
    const fatToLose = Math.max(0, fatMassNavy - ((idealBodyFat / 100) * weight));

    setResult({
      navyBfp: navyBfp.toFixed(1),
      bmiBfp: bmiBfp.toFixed(1),
      category: category,
      fatMass: fatMassNavy.toFixed(1),
      leanMass: leanMassNavy.toFixed(1),
      idealBodyFat: idealBodyFat.toFixed(1),
      fatToLose: fatToLose.toFixed(1),
      bmi: bmi.toFixed(1),
      weight: weight.toFixed(1),
      height: height.toFixed(1)
    });
  };

  const getCategoryColor = (categoryName) => {
    const colors = {
      'Essential Fat': 'text-blue-600',
      'Athletes': 'text-green-600',
      'Fitness': 'text-emerald-600',
      'Average': 'text-yellow-600',
      'Obese': 'text-red-600'
    };
    return colors[categoryName] || 'text-gray-600';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Body Fat Calculator</h2>
        <p className="text-gray-600">
          Estimate your body fat percentage using the U.S. Navy method and BMI method. 
          For best results, measure to the nearest 1/4 inch (0.5 cm).
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Unit System */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit System</h3>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="kg-cm">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lbs, inches)</option>
              <option value="feet">US Units (lbs, feet)</option>
            </select>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="25"
                  min="10"
                  max="80"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight ({formData.unit === 'kg-cm' ? 'kg' : 'lbs'})</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder={formData.unit === 'kg-cm' ? '70' : '154'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height ({formData.unit === 'kg-cm' ? 'cm' : formData.unit === 'imperial' ? 'inches' : 'feet'})</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder={formData.unit === 'kg-cm' ? '175' : formData.unit === 'imperial' ? '69' : '5.8'}
                />
              </div>
            </div>
          </div>

          {/* Body Measurements */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Body Measurements</h3>
            <p className="text-sm text-gray-600 mb-4">
              Measure to the nearest 1/4 inch (0.5 cm) for best results
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Neck Circumference</label>
                <input
                  type="number"
                  value={formData.neck}
                  onChange={(e) => setFormData({ ...formData, neck: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder={formData.unit === 'kg-cm' ? '40' : '16'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Measure below the larynx, sloping downward to the front
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Waist Circumference</label>
                <input
                  type="number"
                  value={formData.waist}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder={formData.unit === 'kg-cm' ? '85' : '34'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.gender === 'male' ? 'Around the navel' : 'At the smallest width'}
                </p>
              </div>

              {formData.gender === 'female' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hip Circumference</label>
                  <input
                    type="number"
                    value={formData.hip}
                    onChange={(e) => setFormData({ ...formData, hip: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder={formData.unit === 'kg-cm' ? '95' : '38'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    At the largest horizontal measure
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={calculateBodyFat}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg text-lg"
          >
            Calculate Body Fat
          </button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Main Results */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Your Body Fat Percentage</h3>
                <div className="text-4xl font-bold mb-2">{result.navyBfp}%</div>
                <div className="text-lg opacity-90">U.S. Navy Method</div>
                <div className={`mt-4 text-sm font-medium ${getCategoryColor(result.category.name).replace('text-', 'text-white/')}`}>
                  {result.category.name}
                </div>
              </div>

              {/* Detailed Results */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Results</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Body Fat (U.S. Navy Method)</div>
                      <div className="text-sm text-gray-600">Most accurate for most people</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{result.navyBfp}%</div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Body Fat (BMI Method)</div>
                      <div className="text-sm text-gray-600">Alternative calculation</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{result.bmiBfp}%</div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Body Fat Mass</div>
                      <div className="text-sm text-gray-600">Total fat weight</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{result.fatMass} kg</div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Lean Body Mass</div>
                      <div className="text-sm text-gray-600">Muscle, bone, organs</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{result.leanMass} kg</div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Ideal Body Fat (Age {formData.age})</div>
                      <div className="text-sm text-gray-600">Jackson & Pollock</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{result.idealBodyFat}%</div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <div className="font-medium text-gray-900">Fat to Lose for Ideal</div>
                      <div className="text-sm text-gray-600">To reach ideal body fat</div>
                    </div>
                    <div className="text-lg font-semibold text-red-600">{result.fatToLose} kg</div>
                  </div>
                </div>
              </div>

              {/* Body Fat Categories */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Body Fat Categories</h3>
                <div className="space-y-3">
                  {Object.entries(bodyFatCategories[formData.gender]).map(([key, category]) => (
                    <div key={key} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          result.category.name === category.name ? 'bg-blue-600' : 'bg-gray-300'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          result.category.name === category.name ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          {category.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {category.min}-{category.max}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Information */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Health Information</h3>
                <div className="space-y-3 text-sm text-green-800">
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Essential fat: {formData.gender === 'male' ? '2-5%' : '10-13%'} (necessary for life)</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Healthy range: {formData.gender === 'male' ? '8-19%' : '21-33%'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Excess body fat can lead to health complications</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Consult a medical professional for personalized advice</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <UserIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Your Body Fat</h3>
              <p className="text-gray-600">
                Enter your measurements to see your body fat percentage and category
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// BMR Calculator Component
const BMRCalculator = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    unit: 'kg-cm',
    equation: 'mifflin-st-jeor',
    bodyFat: ''
  });
  const [result, setResult] = useState(null);

  const activityLevels = {
    sedentary: { 
      name: 'Sedentary: little or no exercise', 
      factor: 1.2, 
      description: 'Little or no exercise' 
    },
    light: { 
      name: 'Exercise 1-3 times/week', 
      factor: 1.375, 
      description: 'Light exercise 1-3 days/week' 
    },
    moderate: { 
      name: 'Exercise 4-5 times/week', 
      factor: 1.55, 
      description: 'Moderate exercise 4-5 days/week' 
    },
    active: { 
      name: 'Daily exercise or intense exercise 3-4 times/week', 
      factor: 1.725, 
      description: 'Hard exercise 6-7 days/week' 
    },
    veryActive: { 
      name: 'Intense exercise 6-7 times/week', 
      factor: 1.9, 
      description: 'Very hard exercise, physical job' 
    },
    extraActive: { 
      name: 'Very intense exercise daily, or physical job', 
      factor: 2.1, 
      description: 'Very hard exercise daily, or physical job' 
    }
  };

  const calculateBMRValue = (weight, height, age, gender, equation, bodyFat) => {
    let bmr = 0;

    switch (equation) {
      case 'mifflin-st-jeor':
        if (gender === 'male') {
          bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
          bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        break;

      case 'harris-benedict':
        if (gender === 'male') {
          bmr = 13.397 * weight + 4.799 * height - 5.677 * age + 88.362;
        } else {
          bmr = 9.247 * weight + 3.098 * height - 4.330 * age + 447.593;
        }
        break;

      case 'katch-mcardle':
        if (bodyFat && bodyFat > 0) {
          const leanMass = weight * (1 - bodyFat / 100);
          bmr = 370 + 21.6 * leanMass;
        } else {
          // Fallback to Mifflin-St Jeor if no body fat percentage
          if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
          } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
          }
        }
        break;

      default:
        if (gender === 'male') {
          bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
          bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
    }

    return Math.round(bmr);
  };

  const calculateBMR = () => {
    if (!formData.age || !formData.weight || !formData.height) return;

    let weight = parseFloat(formData.weight);
    let height = parseFloat(formData.height);
    const age = parseFloat(formData.age);
    const bodyFat = formData.bodyFat ? parseFloat(formData.bodyFat) : null;

    // Convert to metric if needed
    if (formData.unit === 'imperial') {
      weight = weight * 0.453592; // lbs to kg
      height = height * 2.54; // inches to cm
    } else if (formData.unit === 'feet') {
      // Convert feet and inches to cm
      const feet = Math.floor(height);
      const inches = (height - feet) * 12;
      height = feet * 30.48 + inches * 2.54;
      weight = weight * 0.453592; // lbs to kg
    }
    // kg-cm is already in metric units

    // Calculate BMR
    const bmr = calculateBMRValue(weight, height, age, formData.gender, formData.equation, bodyFat);

    // Calculate daily calorie needs for each activity level
    const dailyCalories = {};
    Object.entries(activityLevels).forEach(([key, level]) => {
      dailyCalories[key] = Math.round(bmr * level.factor);
    });

    setResult({
      bmr: bmr,
      dailyCalories: dailyCalories,
      equation: formData.equation,
      weight: weight.toFixed(1),
      height: height.toFixed(1),
      age: age
    });
  };

  const getEquationDescription = (equation) => {
    const descriptions = {
      'mifflin-st-jeor': 'Most accurate for most people (recommended)',
      'harris-benedict': 'Revised 1984 equation, widely used',
      'katch-mcardle': 'Most accurate if you know your body fat %'
    };
    return descriptions[equation] || '';
  };

  const getEquationFormula = (equation, gender) => {
    const formulas = {
      'mifflin-st-jeor': {
        male: 'BMR = 10W + 6.25H - 5A + 5',
        female: 'BMR = 10W + 6.25H - 5A - 161'
      },
      'harris-benedict': {
        male: 'BMR = 13.397W + 4.799H - 5.677A + 88.362',
        female: 'BMR = 9.247W + 3.098H - 4.330A + 447.593'
      },
      'katch-mcardle': {
        male: 'BMR = 370 + 21.6(1 - F)W',
        female: 'BMR = 370 + 21.6(1 - F)W'
      }
    };
    return formulas[equation]?.[gender] || '';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">BMR Calculator</h2>
        <p className="text-gray-600">
          Calculate your Basal Metabolic Rate (BMR) - the amount of energy expended while at rest. 
          This is the foundation for determining your daily calorie needs.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Unit System */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit System</h3>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="kg-cm">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lbs, inches)</option>
              <option value="feet">US Units (lbs, feet)</option>
            </select>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="25"
                  min="15"
                  max="80"
                />
                <p className="text-xs text-gray-500 mt-1">ages 15 - 80</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight ({formData.unit === 'kg-cm' ? 'kg' : 'lbs'})</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={formData.unit === 'kg-cm' ? '70' : '160'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height ({formData.unit === 'kg-cm' ? 'cm' : formData.unit === 'imperial' ? 'inches' : 'feet'})</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={formData.unit === 'kg-cm' ? '175' : formData.unit === 'imperial' ? '70' : '5.8'}
                />
              </div>
            </div>
          </div>

          {/* BMR Equation */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">BMR Equation</h3>
            <select
              value={formData.equation}
              onChange={(e) => setFormData({ ...formData, equation: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="mifflin-st-jeor">Mifflin-St Jeor Equation (Recommended)</option>
              <option value="harris-benedict">Revised Harris-Benedict Equation</option>
              <option value="katch-mcardle">Katch-McArdle Formula (Body Fat %)</option>
            </select>
            <p className="text-xs text-gray-600 mt-2">{getEquationDescription(formData.equation)}</p>
            
            {formData.equation === 'katch-mcardle' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Body Fat Percentage (%)</label>
                <input
                  type="number"
                  value={formData.bodyFat}
                  onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="15"
                  min="1"
                  max="50"
                />
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-1">Formula:</div>
              <div className="text-xs text-blue-800 font-mono">{getEquationFormula(formData.equation, formData.gender)}</div>
              <div className="text-xs text-blue-600 mt-1">
                W = weight (kg), H = height (cm), A = age, F = body fat %
              </div>
            </div>
          </div>

          <button
            onClick={calculateBMR}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg text-lg"
          >
            Calculate BMR
          </button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Main Results */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Your Basal Metabolic Rate</h3>
                <div className="text-4xl font-bold mb-2">{result.bmr.toLocaleString()}</div>
                <div className="text-lg opacity-90">Calories/day</div>
                <div className="mt-4 text-sm opacity-80">
                  Energy needed at complete rest
                </div>
              </div>

              {/* Activity Level Breakdown */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Calorie Needs by Activity Level</h3>
                <div className="space-y-3">
                  {Object.entries(activityLevels).map(([key, level]) => (
                    <div key={key} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                      <div>
                        <div className="font-medium text-gray-900">{level.name}</div>
                        <div className="text-sm text-gray-600">{level.description}</div>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {result.dailyCalories[key].toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BMR Information */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">About BMR</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>BMR represents ~70% of total daily energy expenditure</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Physical activity makes up ~20% of daily calories</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Food digestion (thermogenesis) uses ~10%</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>BMR is measured under very restrictive conditions</span>
                  </div>
                </div>
              </div>

              {/* BMR Variables */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Factors Affecting BMR</h3>
                <div className="space-y-3 text-sm text-green-800">
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>Muscle Mass:</strong> More muscle = higher BMR</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>Age:</strong> BMR decreases with age</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>Genetics:</strong> Hereditary factors influence BMR</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>Weather:</strong> Cold environments raise BMR</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>Diet:</strong> Small, frequent meals increase BMR</span>
                  </div>
                </div>
              </div>

              {/* Exercise Definitions */}
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">Exercise Definitions</h3>
                <div className="space-y-2 text-sm text-yellow-800">
                  <div><strong>Exercise:</strong> 15-30 minutes of elevated heart rate activity</div>
                  <div><strong>Intense Exercise:</strong> 45-120 minutes of elevated heart rate activity</div>
                  <div><strong>Very Intense Exercise:</strong> 2+ hours of elevated heart rate activity</div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <HeartIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Your BMR</h3>
              <p className="text-gray-600">
                Enter your information to see your basal metabolic rate and daily calorie needs
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Carbohydrate Calculator Component
const CarbohydrateCalculator = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    unit: 'kg-cm',
    activity: 'light',
    carbPercentage: 'moderate'
  });
  const [result, setResult] = useState(null);

  const activityLevels = {
    sedentary: { 
      name: 'Sedentary: little or no exercise', 
      factor: 1.2, 
      description: 'Little or no exercise' 
    },
    light: { 
      name: 'Light: exercise 1-3 times/week', 
      factor: 1.375, 
      description: 'Light exercise 1-3 days/week' 
    },
    moderate: { 
      name: 'Moderate: exercise 4-5 times/week', 
      factor: 1.55, 
      description: 'Moderate exercise 4-5 days/week' 
    },
    active: { 
      name: 'Active: daily exercise or intense exercise 3-4 times/week', 
      factor: 1.725, 
      description: 'Hard exercise 6-7 days/week' 
    },
    veryActive: { 
      name: 'Very Active: intense exercise 6-7 times/week', 
      factor: 1.9, 
      description: 'Very hard exercise, physical job' 
    },
    extraActive: { 
      name: 'Extra Active: very intense exercise daily, or physical job', 
      factor: 2.1, 
      description: 'Very hard exercise daily, or physical job' 
    }
  };

  const carbPercentages = {
    low: { 
      name: 'Low Carb (20-30%)', 
      min: 20, 
      max: 30, 
      description: 'Keto, Atkins, or weight loss focused' 
    },
    moderate: { 
      name: 'Moderate (40-50%)', 
      min: 40, 
      max: 50, 
      description: 'Balanced diet, general health' 
    },
    high: { 
      name: 'High Carb (60-75%)', 
      min: 60, 
      max: 75, 
      description: 'Athletic performance, endurance' 
    }
  };

  const calculateBMR = (weight, height, age, gender) => {
    // Mifflin-St Jeor Equation
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  const calculateCarbohydrates = () => {
    if (!formData.age || !formData.weight || !formData.height) return;

    let weight = parseFloat(formData.weight);
    let height = parseFloat(formData.height);
    const age = parseFloat(formData.age);

    // Convert to metric if needed
    if (formData.unit === 'imperial') {
      weight = weight * 0.453592; // lbs to kg
      height = height * 2.54; // inches to cm
    } else if (formData.unit === 'feet') {
      // Convert feet and inches to cm
      const feet = Math.floor(height);
      const inches = (height - feet) * 12;
      height = feet * 30.48 + inches * 2.54;
      weight = weight * 0.453592; // lbs to kg
    }
    // kg-cm is already in metric units

    // Calculate BMR
    const bmr = calculateBMR(weight, height, age, formData.gender);
    
    // Calculate TDEE
    const activityFactor = activityLevels[formData.activity].factor;
    const tdee = Math.round(bmr * activityFactor);

    // Calculate carbohydrate ranges
    const selectedCarb = carbPercentages[formData.carbPercentage];
    const minCarbCalories = Math.round(tdee * selectedCarb.min / 100);
    const maxCarbCalories = Math.round(tdee * selectedCarb.max / 100);
    
    // Convert calories to grams (1g carb = 4 calories)
    const minCarbGrams = Math.round(minCarbCalories / 4);
    const maxCarbGrams = Math.round(maxCarbCalories / 4);
    const avgCarbGrams = Math.round((minCarbGrams + maxCarbGrams) / 2);

    // Calculate other macronutrients
    const avgCarbCalories = Math.round((minCarbCalories + maxCarbCalories) / 2);
    const remainingCalories = tdee - avgCarbCalories;
    const proteinGrams = Math.round((tdee * 0.15) / 4); // 15% protein
    const fatGrams = Math.round((tdee * 0.25) / 9); // 25% fat

    setResult({
      tdee: tdee,
      bmr: Math.round(bmr),
      activityLevel: formData.activity,
      carbPercentage: formData.carbPercentage,
      minCarbGrams: minCarbGrams,
      maxCarbGrams: maxCarbGrams,
      avgCarbGrams: avgCarbGrams,
      minCarbCalories: minCarbCalories,
      maxCarbCalories: maxCarbCalories,
      avgCarbCalories: avgCarbCalories,
      proteinGrams: proteinGrams,
      fatGrams: fatGrams,
      weight: weight.toFixed(1),
      height: height.toFixed(1),
      age: age
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Carbohydrate Calculator</h2>
        <p className="text-gray-600">
          Calculate your daily carbohydrate needs based on your activity level and dietary preferences. 
          Carbohydrates are your body's main source of energy.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Unit System */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit System</h3>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="kg-cm">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lbs, inches)</option>
              <option value="feet">US Units (lbs, feet)</option>
            </select>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="25"
                  min="18"
                  max="80"
                />
                <p className="text-xs text-gray-500 mt-1">ages 18 - 80</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight ({formData.unit === 'kg-cm' ? 'kg' : 'lbs'})</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={formData.unit === 'kg-cm' ? '70' : '160'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height ({formData.unit === 'kg-cm' ? 'cm' : formData.unit === 'imperial' ? 'inches' : 'feet'})</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={formData.unit === 'kg-cm' ? '175' : formData.unit === 'imperial' ? '70' : '5.8'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
              <select
                value={formData.activity}
                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {Object.entries(activityLevels).map(([key, level]) => (
                  <option key={key} value={key}>{level.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Carbohydrate Preference */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Carbohydrate Preference</h3>
            <select
              value={formData.carbPercentage}
              onChange={(e) => setFormData({ ...formData, carbPercentage: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {Object.entries(carbPercentages).map(([key, carb]) => (
                <option key={key} value={key}>{carb.name} - {carb.description}</option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-2">
              {carbPercentages[formData.carbPercentage].description}
            </p>
          </div>

          <button
            onClick={calculateCarbohydrates}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg text-lg"
          >
            Calculate Carbohydrates
          </button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Main Results */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Your Daily Carbohydrate Needs</h3>
                <div className="text-4xl font-bold mb-2">{result.avgCarbGrams}g</div>
                <div className="text-lg opacity-90">Carbohydrates per day</div>
                <div className="mt-4 text-sm opacity-80">
                  Range: {result.minCarbGrams}g - {result.maxCarbGrams}g
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Nutrition Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Total Daily Calories</div>
                      <div className="text-sm text-gray-600">Based on your activity level</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {result.tdee.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Carbohydrates</div>
                      <div className="text-sm text-gray-600">{carbPercentages[result.carbPercentage].min}-{carbPercentages[result.carbPercentage].max}% of calories</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{result.avgCarbGrams}g</div>
                      <div className="text-sm text-gray-600">{result.avgCarbCalories} calories</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Protein</div>
                      <div className="text-sm text-gray-600">~15% of calories</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{result.proteinGrams}g</div>
                      <div className="text-sm text-gray-600">{Math.round(result.proteinGrams * 4)} calories</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <div>
                      <div className="font-medium text-gray-900">Fat</div>
                      <div className="text-sm text-gray-600">~25% of calories</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{result.fatGrams}g</div>
                      <div className="text-sm text-gray-600">{Math.round(result.fatGrams * 9)} calories</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carbohydrate Information */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">About Carbohydrates</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Carbohydrates are your body's main source of energy</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Minimum recommended: 130g per day for adults</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>1 gram of carbohydrate = 4 calories</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Complex carbs are better than simple carbs</span>
                  </div>
                </div>
              </div>

              {/* Types of Carbohydrates */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Types of Carbohydrates</h3>
                <div className="space-y-4 text-sm text-green-800">
                  <div>
                    <div className="font-medium text-green-900 mb-1">Sugars (Simple Carbs)</div>
                    <div className="text-xs">Found in fruits, dairy, candy, cookies, beverages</div>
                  </div>
                  <div>
                    <div className="font-medium text-green-900 mb-1">Starches (Complex Carbs)</div>
                    <div className="text-xs">Found in beans, vegetables, grains</div>
                  </div>
                  <div>
                    <div className="font-medium text-green-900 mb-1">Fiber (Complex Carbs)</div>
                    <div className="text-xs">Found in fruits, whole grains, vegetables, beans</div>
                  </div>
                </div>
              </div>

              {/* Good vs Bad Carbs */}
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">Good vs Bad Carbohydrates</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-green-700 mb-2">✅ Good Carbs</div>
                    <div className="space-y-1 text-green-800">
                      <div>• Low to moderate calories</div>
                      <div>• High in nutrients</div>
                      <div>• High in natural fiber</div>
                      <div>• Low in refined sugars</div>
                      <div>• Whole grains, vegetables, fruits</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-red-700 mb-2">❌ Bad Carbs</div>
                    <div className="space-y-1 text-red-800">
                      <div>• High in calories</div>
                      <div>• Low in nutrients</div>
                      <div>• High in refined sugars</div>
                      <div>• Low in fiber</div>
                      <div>• Processed foods, white bread</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Your Carbs</h3>
              <p className="text-gray-600">
                Enter your information to see your daily carbohydrate needs
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Protein Calculator Component
const ProteinCalculator = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    unit: 'kg-cm',
    activity: 'light',
    proteinLevel: 'moderate',
    isPregnant: false,
    isLactating: false,
    pregnancyTrimester: '1',
    lactationMonths: '6'
  });
  const [result, setResult] = useState(null);

  const activityLevels = {
    sedentary: { 
      name: 'Sedentary: little or no exercise', 
      factor: 1.2, 
      description: 'Little or no exercise' 
    },
    light: { 
      name: 'Light: exercise 1-3 times/week', 
      factor: 1.375, 
      description: 'Light exercise 1-3 days/week' 
    },
    moderate: { 
      name: 'Moderate: exercise 4-5 times/week', 
      factor: 1.55, 
      description: 'Moderate exercise 4-5 days/week' 
    },
    active: { 
      name: 'Active: daily exercise or intense exercise 3-4 times/week', 
      factor: 1.725, 
      description: 'Hard exercise 6-7 days/week' 
    },
    veryActive: { 
      name: 'Very Active: intense exercise 6-7 times/week', 
      factor: 1.9, 
      description: 'Very hard exercise, physical job' 
    },
    extraActive: { 
      name: 'Extra Active: very intense exercise daily, or physical job', 
      factor: 2.1, 
      description: 'Very hard exercise daily, or physical job' 
    }
  };

  const proteinLevels = {
    minimum: { 
      name: 'Minimum (0.8g/kg)', 
      factor: 0.8, 
      description: 'RDA minimum for basic nutrition' 
    },
    moderate: { 
      name: 'Moderate (1.0g/kg)', 
      factor: 1.0, 
      description: 'General health and maintenance' 
    },
    active: { 
      name: 'Active (1.2g/kg)', 
      factor: 1.2, 
      description: 'Regular exercise and fitness' 
    },
    athletic: { 
      name: 'Athletic (1.5g/kg)', 
      factor: 1.5, 
      description: 'Building muscle and strength training' 
    },
    high: { 
      name: 'High (1.8g/kg)', 
      factor: 1.8, 
      description: 'Intense training and muscle building' 
    }
  };

  const pregnancyRequirements = {
    '1': { protein: 1, energy: 375, ratio: 0.04 },
    '2': { protein: 10, energy: 1200, ratio: 0.11 },
    '3': { protein: 31, energy: 1950, ratio: 0.23 }
  };

  const lactationRequirements = {
    '6': { protein: 19, energy: 2800, ratio: 0.11 },
    '12': { protein: 13, energy: 1925, ratio: 0.11 }
  };

  const ageBasedRDA = {
    '1-3': 13,
    '4-8': 19,
    '9-13': 34,
    '14-18-female': 46,
    '14-18-male': 52,
    '19-70-female': 46,
    '19-70-male': 56
  };

  const calculateBMR = (weight, height, age, gender) => {
    // Mifflin-St Jeor Equation
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  const getAgeBasedRDA = (age, gender) => {
    if (age >= 1 && age <= 3) return ageBasedRDA['1-3'];
    if (age >= 4 && age <= 8) return ageBasedRDA['4-8'];
    if (age >= 9 && age <= 13) return ageBasedRDA['9-13'];
    if (age >= 14 && age <= 18) return ageBasedRDA[`14-18-${gender}`];
    if (age >= 19) return ageBasedRDA[`19-70-${gender}`];
    return 46; // Default for women
  };

  const calculateProtein = () => {
    if (!formData.age || !formData.weight || !formData.height) return;

    let weight = parseFloat(formData.weight);
    let height = parseFloat(formData.height);
    const age = parseFloat(formData.age);

    // Convert to metric if needed
    if (formData.unit === 'imperial') {
      weight = weight * 0.453592; // lbs to kg
      height = height * 2.54; // inches to cm
    } else if (formData.unit === 'feet') {
      // Convert feet and inches to cm
      const feet = Math.floor(height);
      const inches = (height - feet) * 12;
      height = feet * 30.48 + inches * 2.54;
      weight = weight * 0.453592; // lbs to kg
    }
    // kg-cm is already in metric units

    // Calculate BMR and TDEE
    const bmr = calculateBMR(weight, height, age, formData.gender);
    const activityFactor = activityLevels[formData.activity].factor;
    const tdee = Math.round(bmr * activityFactor);

    // Calculate protein needs
    const selectedProtein = proteinLevels[formData.proteinLevel];
    let baseProteinGrams = Math.round(weight * selectedProtein.factor);
    
    // Add pregnancy/lactation requirements
    let additionalProtein = 0;
    let additionalEnergy = 0;
    
    if (formData.isPregnant) {
      const pregnancyReq = pregnancyRequirements[formData.pregnancyTrimester];
      additionalProtein = pregnancyReq.protein;
      additionalEnergy = pregnancyReq.energy;
    } else if (formData.isLactating) {
      const lactationReq = lactationRequirements[formData.lactationMonths];
      additionalProtein = lactationReq.protein;
      additionalEnergy = lactationReq.energy;
    }

    const totalProteinGrams = baseProteinGrams + additionalProtein;
    const totalCalories = tdee + additionalEnergy;

    // Calculate percentage of calories from protein
    const proteinCalories = totalProteinGrams * 4; // 1g protein = 4 calories
    const proteinPercentage = Math.round((proteinCalories / totalCalories) * 100);

    // Get age-based RDA for comparison
    const ageBasedRDAValue = getAgeBasedRDA(age, formData.gender);

    setResult({
      weight: weight.toFixed(1),
      height: height.toFixed(1),
      age: age,
      tdee: tdee,
      totalCalories: totalCalories,
      baseProteinGrams: baseProteinGrams,
      additionalProtein: additionalProtein,
      totalProteinGrams: totalProteinGrams,
      proteinCalories: proteinCalories,
      proteinPercentage: proteinPercentage,
      ageBasedRDA: ageBasedRDAValue,
      activityLevel: formData.activity,
      proteinLevel: formData.proteinLevel,
      isPregnant: formData.isPregnant,
      isLactating: formData.isLactating
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Protein Calculator</h2>
        <p className="text-gray-600">
          Calculate your daily protein needs based on your body weight, activity level, and special conditions. 
          Protein is essential for building and repairing tissues.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Unit System */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit System</h3>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="kg-cm">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lbs, inches)</option>
              <option value="feet">US Units (lbs, feet)</option>
            </select>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="25"
                  min="18"
                  max="80"
                />
                <p className="text-xs text-gray-500 mt-1">ages 18 - 80</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight ({formData.unit === 'kg-cm' ? 'kg' : 'lbs'})</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={formData.unit === 'kg-cm' ? '70' : '160'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height ({formData.unit === 'kg-cm' ? 'cm' : formData.unit === 'imperial' ? 'inches' : 'feet'})</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={formData.unit === 'kg-cm' ? '175' : formData.unit === 'imperial' ? '70' : '5.8'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
              <select
                value={formData.activity}
                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(activityLevels).map(([key, level]) => (
                  <option key={key} value={key}>{level.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Protein Level */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Protein Level</h3>
            <select
              value={formData.proteinLevel}
              onChange={(e) => setFormData({ ...formData, proteinLevel: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {Object.entries(proteinLevels).map(([key, protein]) => (
                <option key={key} value={key}>{protein.name} - {protein.description}</option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-2">
              {proteinLevels[formData.proteinLevel].description}
            </p>
          </div>

          {/* Special Conditions */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Conditions</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPregnant"
                  checked={formData.isPregnant}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    isPregnant: e.target.checked,
                    isLactating: e.target.checked ? false : formData.isLactating
                  })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isPregnant" className="ml-2 block text-sm text-gray-900">
                  Pregnant
                </label>
              </div>

              {formData.isPregnant && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pregnancy Trimester</label>
                  <select
                    value={formData.pregnancyTrimester}
                    onChange={(e) => setFormData({ ...formData, pregnancyTrimester: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="1">First Trimester</option>
                    <option value="2">Second Trimester</option>
                    <option value="3">Third Trimester</option>
                  </select>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isLactating"
                  checked={formData.isLactating}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    isLactating: e.target.checked,
                    isPregnant: e.target.checked ? false : formData.isPregnant
                  })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isLactating" className="ml-2 block text-sm text-gray-900">
                  Lactating
                </label>
              </div>

              {formData.isLactating && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lactation Period</label>
                  <select
                    value={formData.lactationMonths}
                    onChange={(e) => setFormData({ ...formData, lactationMonths: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="6">First 6 months</option>
                    <option value="12">After 6 months</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={calculateProtein}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg text-lg"
          >
            Calculate Protein Needs
          </button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Main Results */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Your Daily Protein Needs</h3>
                <div className="text-4xl font-bold mb-2">{result.totalProteinGrams}g</div>
                <div className="text-lg opacity-90">Protein per day</div>
                <div className="mt-4 text-sm opacity-80">
                  {result.proteinPercentage}% of daily calories
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Protein Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Base Protein Need</div>
                      <div className="text-sm text-gray-600">Based on weight and activity</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {result.baseProteinGrams}g
                    </div>
                  </div>
                  
                  {result.additionalProtein > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">Additional Protein</div>
                        <div className="text-sm text-gray-600">
                          {result.isPregnant ? 'Pregnancy requirement' : 'Lactation requirement'}
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        +{result.additionalProtein}g
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Total Daily Calories</div>
                      <div className="text-sm text-gray-600">Including additional energy needs</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {result.totalCalories.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <div>
                      <div className="font-medium text-gray-900">Age-Based RDA</div>
                      <div className="text-sm text-gray-600">Recommended Dietary Allowance</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {result.ageBasedRDA}g
                    </div>
                  </div>
                </div>
              </div>

              {/* Protein Information */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">About Protein</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Protein is essential for building and repairing tissues</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>1 gram of protein = 4 calories</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>RDA minimum: 0.8g per kg of body weight</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Active individuals may need 1.2-1.8g per kg</span>
                  </div>
                </div>
              </div>

              {/* Protein Functions */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Protein Functions</h3>
                <div className="space-y-3 text-sm text-green-800">
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>Antibody:</strong> Protect body from viruses and bacteria</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>Enzyme:</strong> Help chemical reactions throughout body</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>Messenger:</strong> Transmit signals to maintain body processes</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>Structural:</strong> Building blocks for cells and movement</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>Transport:</strong> Move molecules throughout body</span>
                  </div>
                </div>
              </div>

              {/* High Protein Foods */}
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">High Protein Foods</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-yellow-800 mb-2">Complete Proteins</div>
                    <div className="space-y-1 text-yellow-700">
                      <div>• Eggs (6g per large egg)</div>
                      <div>• Chicken breast (31g per 100g)</div>
                      <div>• Greek yogurt (17g per 170g)</div>
                      <div>• Lean beef (26g per 100g)</div>
                      <div>• Fish (20-25g per 100g)</div>
                      <div>• Quinoa (8g per cup)</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-yellow-800 mb-2">Other Good Sources</div>
                    <div className="space-y-1 text-yellow-700">
                      <div>• Lentils (18g per cup)</div>
                      <div>• Almonds (6g per 1/4 cup)</div>
                      <div>• Oats (6g per 1/2 cup)</div>
                      <div>• Broccoli (3g per cup)</div>
                      <div>• Chia seeds (5g per 2 tbsp)</div>
                      <div>• Peanut butter (8g per 2 tbsp)</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Your Protein Needs</h3>
              <p className="text-gray-600">
                Enter your information to see your daily protein requirements
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Fat Intake Calculator Component
const FatIntakeCalculator = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    unit: 'kg-cm',
    activity: 'light',
    fatLevel: 'moderate'
  });
  const [result, setResult] = useState(null);

  const activityLevels = {
    sedentary: { 
      name: 'Sedentary: little or no exercise', 
      factor: 1.2, 
      description: 'Little or no exercise' 
    },
    light: { 
      name: 'Light: exercise 1-3 times/week', 
      factor: 1.375, 
      description: 'Light exercise 1-3 days/week' 
    },
    moderate: { 
      name: 'Moderate: exercise 4-5 times/week', 
      factor: 1.55, 
      description: 'Moderate exercise 4-5 days/week' 
    },
    active: { 
      name: 'Active: daily exercise or intense exercise 3-4 times/week', 
      factor: 1.725, 
      description: 'Hard exercise 6-7 days/week' 
    },
    veryActive: { 
      name: 'Very Active: intense exercise 6-7 times/week', 
      factor: 1.9, 
      description: 'Very hard exercise, physical job' 
    },
    extraActive: { 
      name: 'Extra Active: very intense exercise daily, or physical job', 
      factor: 2.1, 
      description: 'Very hard exercise daily, or physical job' 
    }
  };

  const fatLevels = {
    low: { 
      name: 'Low Fat (20%)', 
      percentage: 20, 
      description: 'Weight loss or heart health focus' 
    },
    moderate: { 
      name: 'Moderate (25%)', 
      percentage: 25, 
      description: 'General health and maintenance' 
    },
    standard: { 
      name: 'Standard (30%)', 
      percentage: 30, 
      description: 'Balanced diet, typical recommendation' 
    },
    higher: { 
      name: 'Higher (35%)', 
      percentage: 35, 
      description: 'Active lifestyle or specific dietary needs' 
    }
  };

  const ageBasedFatRanges = {
    '2-3': { min: 30, max: 40, description: 'Children 2-3 years' },
    '4-18': { min: 25, max: 35, description: 'Children and teens 4-18 years' },
    '19+': { min: 20, max: 35, description: 'Adults 19+ years' }
  };

  const calculateBMR = (weight, height, age, gender) => {
    // Mifflin-St Jeor Equation
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  const getAgeBasedFatRange = (age) => {
    if (age >= 2 && age <= 3) return ageBasedFatRanges['2-3'];
    if (age >= 4 && age <= 18) return ageBasedFatRanges['4-18'];
    if (age >= 19) return ageBasedFatRanges['19+'];
    return ageBasedFatRanges['19+']; // Default for adults
  };

  const calculateFatIntake = () => {
    if (!formData.age || !formData.weight || !formData.height) return;

    let weight = parseFloat(formData.weight);
    let height = parseFloat(formData.height);
    const age = parseFloat(formData.age);

    // Convert to metric if needed
    if (formData.unit === 'imperial') {
      weight = weight * 0.453592; // lbs to kg
      height = height * 2.54; // inches to cm
    } else if (formData.unit === 'feet') {
      // Convert feet and inches to cm
      const feet = Math.floor(height);
      const inches = (height - feet) * 12;
      height = feet * 30.48 + inches * 2.54;
      weight = weight * 0.453592; // lbs to kg
    }
    // kg-cm is already in metric units

    // Calculate BMR and TDEE
    const bmr = calculateBMR(weight, height, age, formData.gender);
    const activityFactor = activityLevels[formData.activity].factor;
    const tdee = Math.round(bmr * activityFactor);

    // Calculate fat needs
    const selectedFat = fatLevels[formData.fatLevel];
    const fatCalories = Math.round(tdee * selectedFat.percentage / 100);
    const fatGrams = Math.round(fatCalories / 9); // 1g fat = 9 calories

    // Calculate saturated fat limits
    const saturatedFatCalories = Math.round(tdee * 0.07); // 7% limit for heart health
    const saturatedFatGrams = Math.round(saturatedFatCalories / 9);
    const maxSaturatedFatCalories = Math.round(tdee * 0.10); // 10% maximum
    const maxSaturatedFatGrams = Math.round(maxSaturatedFatCalories / 9);

    // Get age-based recommendations
    const ageBasedRange = getAgeBasedFatRange(age);
    const ageBasedMinCalories = Math.round(tdee * ageBasedRange.min / 100);
    const ageBasedMaxCalories = Math.round(tdee * ageBasedRange.max / 100);
    const ageBasedMinGrams = Math.round(ageBasedMinCalories / 9);
    const ageBasedMaxGrams = Math.round(ageBasedMaxCalories / 9);

    setResult({
      weight: weight.toFixed(1),
      height: height.toFixed(1),
      age: age,
      tdee: tdee,
      fatPercentage: selectedFat.percentage,
      fatCalories: fatCalories,
      fatGrams: fatGrams,
      saturatedFatGrams: saturatedFatGrams,
      maxSaturatedFatGrams: maxSaturatedFatGrams,
      ageBasedMinGrams: ageBasedMinGrams,
      ageBasedMaxGrams: ageBasedMaxGrams,
      ageBasedRange: ageBasedRange,
      activityLevel: formData.activity,
      fatLevel: formData.fatLevel
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fat Intake Calculator</h2>
        <p className="text-gray-600">
          Calculate your daily fat intake needs based on your age, activity level, and health goals. 
          Fat is essential for proper body function and energy.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Unit System */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit System</h3>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="kg-cm">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lbs, inches)</option>
              <option value="feet">US Units (lbs, feet)</option>
            </select>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="25"
                  min="18"
                  max="80"
                />
                <p className="text-xs text-gray-500 mt-1">ages 18 - 80</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight ({formData.unit === 'kg-cm' ? 'kg' : 'lbs'})</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder={formData.unit === 'kg-cm' ? '70' : '160'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height ({formData.unit === 'kg-cm' ? 'cm' : formData.unit === 'imperial' ? 'inches' : 'feet'})</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder={formData.unit === 'kg-cm' ? '175' : formData.unit === 'imperial' ? '70' : '5.8'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
              <select
                value={formData.activity}
                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                {Object.entries(activityLevels).map(([key, level]) => (
                  <option key={key} value={key}>{level.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fat Level */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fat Intake Level</h3>
            <select
              value={formData.fatLevel}
              onChange={(e) => setFormData({ ...formData, fatLevel: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {Object.entries(fatLevels).map(([key, fat]) => (
                <option key={key} value={key}>{fat.name} - {fat.description}</option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-2">
              {fatLevels[formData.fatLevel].description}
            </p>
          </div>

          <button
            onClick={calculateFatIntake}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg text-lg"
          >
            Calculate Fat Intake
          </button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Main Results */}
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Your Daily Fat Intake</h3>
                <div className="text-4xl font-bold mb-2">{result.fatGrams}g</div>
                <div className="text-lg opacity-90">Fat per day</div>
                <div className="mt-4 text-sm opacity-80">
                  {result.fatPercentage}% of daily calories ({result.fatCalories} calories)
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fat Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Total Daily Calories</div>
                      <div className="text-sm text-gray-600">Based on your activity level</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {result.tdee.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Total Fat</div>
                      <div className="text-sm text-gray-600">{result.fatPercentage}% of calories</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{result.fatGrams}g</div>
                      <div className="text-sm text-gray-600">{result.fatCalories} calories</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Saturated Fat Limit</div>
                      <div className="text-sm text-gray-600">For heart health (7% max)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{result.saturatedFatGrams}g</div>
                      <div className="text-sm text-gray-600">Max {result.maxSaturatedFatGrams}g (10%)</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <div>
                      <div className="font-medium text-gray-900">Age-Based Range</div>
                      <div className="text-sm text-gray-600">{result.ageBasedRange.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{result.ageBasedMinGrams}-{result.ageBasedMaxGrams}g</div>
                      <div className="text-sm text-gray-600">{result.ageBasedRange.min}-{result.ageBasedRange.max}% of calories</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fat Information */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">About Dietary Fat</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Fat is essential for proper body function and energy</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>1 gram of fat = 9 calories</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Limit saturated fat to less than 7% of calories</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Avoid trans fats completely</span>
                  </div>
                </div>
              </div>

              {/* Types of Fat */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Types of Dietary Fat</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-medium text-red-700 mb-1">❌ Unhealthy Fats</div>
                    <div className="space-y-2 text-green-800">
                      <div><strong>Saturated Fat:</strong> Found in red meat, dairy, poultry. Raises LDL cholesterol.</div>
                      <div><strong>Trans Fat:</strong> Found in processed foods. Worst type of fat, avoid completely.</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-green-700 mb-1">✅ Healthy Fats</div>
                    <div className="space-y-2 text-green-800">
                      <div><strong>Monounsaturated:</strong> Found in olive oil, avocados, nuts. Reduces LDL cholesterol.</div>
                      <div><strong>Polyunsaturated:</strong> Found in fish, plant oils. Includes omega-3 fatty acids.</div>
                      <div><strong>Omega-3:</strong> Found in fatty fish. Reduces heart disease risk.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fat Guidelines */}
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">Fat Intake Guidelines</h3>
                <div className="space-y-3 text-sm text-yellow-800">
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>Consume less than 10% of daily calories from saturated fats</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>Limit saturated fat to less than 7% for heart health</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>Replace saturated fats with unsaturated fats when possible</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>Minimize consumption of trans fats</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>Consume less than 300mg of dietary cholesterol per day</span>
                  </div>
                </div>
              </div>

              {/* Age-Based Recommendations */}
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">Age-Based Fat Recommendations</h3>
                <div className="space-y-3 text-sm text-purple-800">
                  <div className="flex justify-between">
                    <span><strong>Children 2-3 years:</strong></span>
                    <span>30-40% of total calories</span>
                  </div>
                  <div className="flex justify-between">
                    <span><strong>Children and teens 4-18 years:</strong></span>
                    <span>25-35% of total calories</span>
                  </div>
                  <div className="flex justify-between">
                    <span><strong>Adults 19+ years:</strong></span>
                    <span>20-35% of total calories</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Your Fat Intake</h3>
              <p className="text-gray-600">
                Enter your information to see your daily fat intake recommendations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Vitamin Calculator Component
const VitaminCalculator = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    selectedVitamin: 'vitamin-a'
  });
  const [result, setResult] = useState(null);

  const vitamins = {
    'vitamin-a': {
      name: 'Vitamin A',
      unit: 'μg/day',
      description: 'Essential for vision, immune function, and cell growth',
      category: 'fat-soluble',
      sources: 'Liver, fish, dairy, orange vegetables, leafy greens'
    },
    'vitamin-d': {
      name: 'Vitamin D',
      unit: 'μg/day',
      description: 'Important for bone health and calcium absorption',
      category: 'fat-soluble',
      sources: 'Sunlight, fatty fish, egg yolks, fortified foods'
    },
    'vitamin-e': {
      name: 'Vitamin E',
      unit: 'mg/day',
      description: 'Antioxidant that protects cells from damage',
      category: 'fat-soluble',
      sources: 'Nuts, seeds, vegetable oils, leafy greens'
    },
    'vitamin-k': {
      name: 'Vitamin K',
      unit: 'μg/day',
      description: 'Essential for blood clotting and bone health',
      category: 'fat-soluble',
      sources: 'Leafy greens, broccoli, vegetable oils, meat'
    },
    'vitamin-c': {
      name: 'Vitamin C',
      unit: 'mg/day',
      description: 'Antioxidant, immune support, collagen synthesis',
      category: 'water-soluble',
      sources: 'Citrus fruits, berries, peppers, broccoli'
    },
    'vitamin-b1': {
      name: 'Thiamine (B₁)',
      unit: 'mg/day',
      description: 'Energy metabolism, nerve function',
      category: 'water-soluble',
      sources: 'Whole grains, pork, legumes, nuts'
    },
    'vitamin-b2': {
      name: 'Riboflavin (B₂)',
      unit: 'mg/day',
      description: 'Energy production, skin and eye health',
      category: 'water-soluble',
      sources: 'Dairy, eggs, lean meats, green vegetables'
    },
    'vitamin-b3': {
      name: 'Niacin (B₃)',
      unit: 'mg/day',
      description: 'Energy metabolism, skin health',
      category: 'water-soluble',
      sources: 'Meat, fish, whole grains, legumes'
    },
    'vitamin-b5': {
      name: 'Pantothenic Acid (B₅)',
      unit: 'mg/day',
      description: 'Energy metabolism, hormone production',
      category: 'water-soluble',
      sources: 'Meat, whole grains, legumes, vegetables'
    },
    'vitamin-b6': {
      name: 'Pyridoxine (B₆)',
      unit: 'mg/day',
      description: 'Protein metabolism, brain function',
      category: 'water-soluble',
      sources: 'Fish, poultry, potatoes, bananas'
    },
    'vitamin-b7': {
      name: 'Biotin (B₇)',
      unit: 'μg/day',
      description: 'Hair, skin, and nail health',
      category: 'water-soluble',
      sources: 'Eggs, nuts, seeds, sweet potatoes'
    },
    'vitamin-b9': {
      name: 'Folic Acid (B₉)',
      unit: 'μg/day',
      description: 'DNA synthesis, red blood cell formation',
      category: 'water-soluble',
      sources: 'Leafy greens, legumes, fortified grains'
    },
    'vitamin-b12': {
      name: 'Cyanocobalamin (B₁₂)',
      unit: 'μg/day',
      description: 'Nerve function, red blood cell formation',
      category: 'water-soluble',
      sources: 'Meat, fish, dairy, fortified foods'
    }
  };

  // RDA values based on age and gender (simplified for common ranges)
  const vitaminRDAs = {
    'vitamin-a': {
      'male': { '19-50': 900, '51+': 900 },
      'female': { '19-50': 700, '51+': 700 }
    },
    'vitamin-d': {
      'male': { '19-70': 15, '71+': 20 },
      'female': { '19-70': 15, '71+': 20 }
    },
    'vitamin-e': {
      'male': { '19+': 15 },
      'female': { '19+': 15 }
    },
    'vitamin-k': {
      'male': { '19+': 120 },
      'female': { '19+': 90 }
    },
    'vitamin-c': {
      'male': { '19+': 90 },
      'female': { '19+': 75 }
    },
    'vitamin-b1': {
      'male': { '19+': 1.2 },
      'female': { '19+': 1.1 }
    },
    'vitamin-b2': {
      'male': { '19+': 1.3 },
      'female': { '19+': 1.1 }
    },
    'vitamin-b3': {
      'male': { '19+': 16 },
      'female': { '19+': 14 }
    },
    'vitamin-b5': {
      'male': { '19+': 5 },
      'female': { '19+': 5 }
    },
    'vitamin-b6': {
      'male': { '19-50': 1.3, '51+': 1.7 },
      'female': { '19-50': 1.3, '51+': 1.5 }
    },
    'vitamin-b7': {
      'male': { '19+': 30 },
      'female': { '19+': 30 }
    },
    'vitamin-b9': {
      'male': { '19+': 400 },
      'female': { '19+': 400 }
    },
    'vitamin-b12': {
      'male': { '19+': 2.4 },
      'female': { '19+': 2.4 }
    }
  };

  const getVitaminRDA = (vitamin, age, gender) => {
    const vitaminData = vitaminRDAs[vitamin];
    if (!vitaminData) return null;

    const genderData = vitaminData[gender];
    if (!genderData) return null;

    // Find the appropriate age range
    if (age >= 19 && age <= 50) {
      return genderData['19-50'] || genderData['19+'];
    } else if (age >= 51 && age <= 70) {
      return genderData['51+'] || genderData['19+'];
    } else if (age >= 71) {
      return genderData['71+'] || genderData['19+'];
    } else {
      return genderData['19+'];
    }
  };

  const calculateVitamin = () => {
    if (!formData.age || !formData.selectedVitamin) return;

    const age = parseFloat(formData.age);
    const vitamin = formData.selectedVitamin;
    const gender = formData.gender;

    const rdaValue = getVitaminRDA(vitamin, age, gender);
    
    if (rdaValue === null) {
      setResult(null);
      return;
    }

    setResult({
      vitamin: vitamin,
      age: age,
      gender: gender,
      rdaValue: rdaValue,
      vitaminInfo: vitamins[vitamin]
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vitamin Calculator</h2>
        <p className="text-gray-600">
          Calculate your daily vitamin requirements based on your age and gender. 
          This calculator shows the Recommended Dietary Allowance (RDA) for all essential vitamins.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="25"
                  min="19"
                  max="80"
                />
                <p className="text-xs text-gray-500 mt-1">ages 19 - 80</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Vitamin</label>
              <select
                value={formData.selectedVitamin}
                onChange={(e) => setFormData({ ...formData, selectedVitamin: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <optgroup label="Fat-Soluble Vitamins">
                  {Object.entries(vitamins).filter(([key, vitamin]) => vitamin.category === 'fat-soluble').map(([key, vitamin]) => (
                    <option key={key} value={key}>{vitamin.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Water-Soluble Vitamins">
                  {Object.entries(vitamins).filter(([key, vitamin]) => vitamin.category === 'water-soluble').map(([key, vitamin]) => (
                    <option key={key} value={key}>{vitamin.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <button
            onClick={calculateVitamin}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg text-lg"
          >
            Calculate Vitamin RDA
          </button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Main Results */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Your Vitamin RDA</h3>
                <div className="text-4xl font-bold mb-2">{result.rdaValue} {result.vitaminInfo.unit}</div>
                <div className="text-lg opacity-90">{result.vitaminInfo.name}</div>
                <div className="mt-4 text-sm opacity-80">
                  Recommended Dietary Allowance for {result.gender === 'male' ? 'males' : 'females'} age {result.age}
                </div>
              </div>

              {/* Vitamin Information */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vitamin Information</h3>
                <div className="space-y-4">
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Description</div>
                    <div className="text-sm text-gray-600">{result.vitaminInfo.description}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Category</div>
                    <div className="text-sm text-gray-600 capitalize">{result.vitaminInfo.category} vitamin</div>
                  </div>

                  <div>
                    <div className="font-medium text-gray-900 mb-1">Food Sources</div>
                    <div className="text-sm text-gray-600">{result.vitaminInfo.sources}</div>
                  </div>
                </div>
              </div>

              {/* Vitamin Categories */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Vitamin Categories</h3>
                <div className="space-y-4 text-sm text-blue-800">
                  <div>
                    <div className="font-medium text-blue-900 mb-2">Fat-Soluble Vitamins</div>
                    <div className="space-y-1">
                      <div>• Vitamin A, D, E, K</div>
                      <div>• Absorbed with dietary fats</div>
                      <div>• Can accumulate in the body</div>
                      <div>• Risk of hypervitaminosis if over-supplemented</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-900 mb-2">Water-Soluble Vitamins</div>
                    <div className="space-y-1">
                      <div>• Vitamin C and B-complex (B₁, B₂, B₃, B₅, B₆, B₇, B₉, B₁₂)</div>
                      <div>• Dissolve in water</div>
                      <div>• Not stored in the body</div>
                      <div>• Need consistent daily intake</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DRI Information */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Dietary Reference Intake (DRI)</h3>
                <div className="space-y-3 text-sm text-green-800">
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>RDA (Recommended Dietary Allowance):</strong> Average daily intake sufficient to meet nutrient requirements of 97-98% of healthy individuals</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>AI (Adequate Intake):</strong> Established when insufficient data exists for RDA</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span><strong>UL (Tolerable Upper Intake Level):</strong> Maximum daily intake unlikely to cause adverse effects</span>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">Important Notes</h3>
                <div className="space-y-3 text-sm text-yellow-800">
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>This calculator is for informational purposes only</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>Always consult a healthcare provider before taking supplements</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>Vitamin needs may vary based on health conditions and medications</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>Pregnant and breastfeeding women have different requirements</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Your Vitamin RDA</h3>
              <p className="text-gray-600">
                Enter your information to see your daily vitamin requirements
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthCalculator; 