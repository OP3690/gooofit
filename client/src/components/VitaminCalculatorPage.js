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

const lifestyleFactors = [
  { value: 'none', name: 'None', description: 'No special factors' },
  { value: 'vegetarian', name: 'Vegetarian', description: 'Plant-based diet' },
  { value: 'vegan', name: 'Vegan', description: 'Strictly plant-based diet' },
  { value: 'pregnant', name: 'Pregnant', description: 'Pregnancy increases needs' },
  { value: 'breastfeeding', name: 'Breastfeeding', description: 'Nursing increases needs' },
  { value: 'smoker', name: 'Smoker', description: 'Smoking affects absorption' },
  { value: 'alcohol', name: 'Regular Alcohol', description: 'Alcohol affects absorption' },
];

const VitaminCalculatorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    unit: 'kg-cm',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    lifestyle: 'none',
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

  // Vitamin calculation logic
  const calculateVitamins = () => {
    const { age, gender, weight, height, unit, activityLevel, lifestyle } = formData;
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
    
    // Base vitamin recommendations (RDA values in mg/mcg)
    const baseVitamins = {
      vitaminA: gender === 'male' ? 900 : 700, // mcg
      vitaminC: gender === 'male' ? 90 : 75, // mg
      vitaminD: 15, // mcg (same for both genders)
      vitaminE: 15, // mg (same for both genders)
      vitaminK: gender === 'male' ? 120 : 90, // mcg
      vitaminB1: gender === 'male' ? 1.2 : 1.1, // mg
      vitaminB2: gender === 'male' ? 1.3 : 1.1, // mg
      vitaminB3: gender === 'male' ? 16 : 14, // mg
      vitaminB6: gender === 'male' ? 1.3 : 1.3, // mg
      vitaminB12: 2.4, // mcg (same for both genders)
      folate: 400, // mcg (same for both genders)
      biotin: 30, // mcg (same for both genders)
      pantothenicAcid: 5, // mg (same for both genders)
    };

    // Apply lifestyle adjustments
    const adjustments = {
      none: 1.0,
      vegetarian: 1.1,
      vegan: 1.2,
      pregnant: 1.3,
      breastfeeding: 1.4,
      smoker: 1.15,
      alcohol: 1.1,
    };

    const adjustment = adjustments[lifestyle] || 1.0;

    // Calculate adjusted vitamin needs
    const adjustedVitamins = {};
    Object.keys(baseVitamins).forEach(vitamin => {
      adjustedVitamins[vitamin] = Math.round(baseVitamins[vitamin] * adjustment);
    });

    // Special adjustments for specific vitamins based on lifestyle
    if (lifestyle === 'vegan') {
      adjustedVitamins.vitaminB12 = Math.round(adjustedVitamins.vitaminB12 * 1.5); // B12 needs higher for vegans
      adjustedVitamins.vitaminD = Math.round(adjustedVitamins.vitaminD * 1.2); // D needs higher for vegans
    }
    if (lifestyle === 'pregnant') {
      adjustedVitamins.folate = Math.round(adjustedVitamins.folate * 1.5); // Folate needs higher during pregnancy
      adjustedVitamins.vitaminD = Math.round(adjustedVitamins.vitaminD * 1.2);
    }
    if (lifestyle === 'breastfeeding') {
      adjustedVitamins.vitaminC = Math.round(adjustedVitamins.vitaminC * 1.2);
      adjustedVitamins.vitaminD = Math.round(adjustedVitamins.vitaminD * 1.2);
    }

    setResult({
      vitamins: adjustedVitamins,
      lifestyle: lifestyle,
      adjustment: adjustment,
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
          <h1 className="text-3xl font-bold text-gray-900">Vitamin Calculator</h1>
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
            Calculate your daily vitamin needs based on your age, gender, and lifestyle factors. Learn about essential vitamins and their role in maintaining optimal health.
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
                Calculate Your Vitamin Needs
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
              {/* Lifestyle Factors */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Lifestyle Factors</label>
                <select
                  name="lifestyle"
                  value={formData.lifestyle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {lifestyleFactors.map((factor) => (
                    <option key={factor.value} value={factor.value}>
                      {factor.name} - {factor.description}
                    </option>
                  ))}
                </select>
              </div>
              {/* Calculate Button */}
              <motion.button
                onClick={calculateVitamins}
                disabled={!formData.age || !formData.weight || !formData.height}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                  formData.age && formData.weight && formData.height
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={formData.age && formData.weight && formData.height ? { scale: 1.02 } : {}}
                whileTap={formData.age && formData.weight && formData.height ? { scale: 0.98 } : {}}
              >
                Calculate Vitamin Needs
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
                  Your Vitamin Needs
                </h3>
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 text-center">Daily Vitamin Recommendations</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Vitamin A:</strong> {result.vitamins.vitaminA} mcg</div>
                      <div><strong>Vitamin C:</strong> {result.vitamins.vitaminC} mg</div>
                      <div><strong>Vitamin D:</strong> {result.vitamins.vitaminD} mcg</div>
                      <div><strong>Vitamin E:</strong> {result.vitamins.vitaminE} mg</div>
                      <div><strong>Vitamin K:</strong> {result.vitamins.vitaminK} mcg</div>
                      <div><strong>Vitamin B1:</strong> {result.vitamins.vitaminB1} mg</div>
                      <div><strong>Vitamin B2:</strong> {result.vitamins.vitaminB2} mg</div>
                      <div><strong>Vitamin B3:</strong> {result.vitamins.vitaminB3} mg</div>
                      <div><strong>Vitamin B6:</strong> {result.vitamins.vitaminB6} mg</div>
                      <div><strong>Vitamin B12:</strong> {result.vitamins.vitaminB12} mcg</div>
                      <div><strong>Folate:</strong> {result.vitamins.folate} mcg</div>
                      <div><strong>Biotin:</strong> {result.vitamins.biotin} mcg</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 text-center">Lifestyle Adjustment</h4>
                    <div className="text-center text-orange-700 font-semibold text-lg mb-2">
                      {lifestyleFactors.find(f => f.value === result.lifestyle)?.name}
                    </div>
                    <div className="text-sm text-gray-500 text-center">
                      Adjustment factor: {result.adjustment}x
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
            Understanding Vitamins
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">What are Vitamins?</h4>
              <p className="text-gray-600 mb-4">
                Vitamins are essential micronutrients that your body needs in small amounts to function properly. They play crucial roles in metabolism, immunity, and overall health.
              </p>
              <h4 className="font-semibold text-gray-900 mb-3">Fat-Soluble Vitamins</h4>
              <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                <li><strong>Vitamin A:</strong> Vision, immune function, cell growth</li>
                <li><strong>Vitamin D:</strong> Bone health, immune system, mood</li>
                <li><strong>Vitamin E:</strong> Antioxidant, skin health</li>
                <li><strong>Vitamin K:</strong> Blood clotting, bone health</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Water-Soluble Vitamins</h4>
              <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                <li><strong>Vitamin C:</strong> Immune system, collagen production</li>
                <li><strong>B Vitamins:</strong> Energy metabolism, nervous system</li>
                <li><strong>Folate:</strong> DNA synthesis, cell division</li>
                <li><strong>Biotin:</strong> Hair, skin, nail health</li>
              </ul>
              <h4 className="font-semibold text-gray-900 mt-6 mb-3">Best Sources</h4>
              <p className="text-gray-600 mb-4">
                Get vitamins from a balanced diet rich in fruits, vegetables, whole grains, lean proteins, and healthy fats. Supplements may be needed for specific deficiencies or lifestyle factors.
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
                Vitamin calculations are based on general RDA guidelines and are for educational purposes only. Individual needs may vary. For personalized nutrition advice or if you have specific health conditions, consult with qualified healthcare professionals.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VitaminCalculatorPage; 