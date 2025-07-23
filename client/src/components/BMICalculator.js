import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateBMI, getBMICategory } from '../services/api';
import { Calculator, TrendingUp, TrendingDown, Target, Info, Zap, Heart, Scale } from 'lucide-react';
import './NoSpinner.css';

const bmiSegments = [
  { label: 'Underweight', min: 0, max: 18.5, color: '#3b82f6', bgColor: '#dbeafe', textColor: '#1e40af' },
  { label: 'Normal', min: 18.5, max: 25, color: '#10b981', bgColor: '#d1fae5', textColor: '#047857' },
  { label: 'Overweight', min: 25, max: 30, color: '#f59e0b', bgColor: '#fef3c7', textColor: '#d97706' },
  { label: 'Obese-1', min: 30, max: 35, color: '#f97316', bgColor: '#fed7aa', textColor: '#ea580c' },
  { label: 'Obese-2', min: 35, max: 40, color: '#ef4444', bgColor: '#fecaca', textColor: '#dc2626' },
  { label: 'Obese-3', min: 40, max: 60, color: '#991b1b', bgColor: '#fecaca', textColor: '#991b1b' },
];

const BMI_MIN = 0;
const BMI_MAX = 60;
const TICKS = [0, 18.5, 25, 30, 35, 40];

// Custom visual widths for each segment (must sum to 100)
const bmiVisualWidths = [15, 25, 20, 15, 12.5, 12.5];

// Helper to get legend color for a given BMI
function getBMISegmentColor(bmi) {
  if (!bmi) return '#000';
  for (let i = 0; i < bmiSegments.length; i++) {
    if (bmi < bmiSegments[i].max) return bmiSegments[i].color;
  }
  return bmiSegments[bmiSegments.length - 1].color;
}

// Helper to get marker position as a percentage using custom visual widths
function getVisualPos(bmi) {
  if (!bmi) return 0;
  let acc = 0;
  for (let i = 0; i < bmiSegments.length; i++) {
    const seg = bmiSegments[i];
    const segWidth = bmiVisualWidths[i];
    if (bmi >= seg.max) {
      acc += segWidth;
    } else if (bmi > seg.min) {
      const segRatio = (bmi - seg.min) / (seg.max - seg.min);
      acc += segRatio * segWidth;
      break;
    } else {
      break;
    }
  }
  return acc;
}

function BMISegmentBar({ userBMI, targetBMI }) {
  const barRef = React.useRef(null);
  const youLabelRef = React.useRef(null);
  const targetLabelRef = React.useRef(null);
  const [barWidth, setBarWidth] = React.useState(0);
  const [labelWidths, setLabelWidths] = React.useState({ you: 0, target: 0 });
  
  React.useEffect(() => {
    if (barRef.current) setBarWidth(barRef.current.offsetWidth);
    const handleResize = () => {
      if (barRef.current) setBarWidth(barRef.current.offsetWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  React.useEffect(() => {
    setLabelWidths({
      you: youLabelRef.current ? youLabelRef.current.offsetWidth : 0,
      target: targetLabelRef.current ? targetLabelRef.current.offsetWidth : 0,
    });
  }, [userBMI, targetBMI, barWidth]);

  // Use getVisualPos for marker positions
  const youPosPercent = userBMI ? getVisualPos(userBMI) : null;
  const targetPosPercent = targetBMI ? getVisualPos(targetBMI) : null;
  
  // Offset logic for label overlap
  let youLabelStyle = { transform: 'translateX(-50%)' };
  let targetLabelStyle = { transform: 'translateX(-50%)' };
  
  if (
    youPosPercent !== null && targetPosPercent !== null &&
    Math.abs(youPosPercent - targetPosPercent) < (labelWidths.you / 2 + labelWidths.target / 2 + 8)
  ) {
    // If overlap, nudge left/right
    if (youPosPercent < targetPosPercent) {
      youLabelStyle = { transform: `translateX(-70%)` };
      targetLabelStyle = { transform: `translateX(-30%)` };
    } else {
      youLabelStyle = { transform: `translateX(-30%)` };
      targetLabelStyle = { transform: `translateX(-70%)` };
    }
  }

  return (
    <motion.div 
      className="w-full flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Segments and Legend in one flex row for perfect alignment */}
      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="relative w-full h-12 flex items-center mb-2">
          {/* Segments */}
          <div className="w-full h-6 flex rounded-full overflow-hidden shadow-lg border-2 border-white">
            {bmiSegments.map((seg, idx) => (
              <motion.div 
                key={idx}
                className="h-full relative group"
                style={{
                  width: `${bmiVisualWidths[idx]}%`,
                  background: seg.color,
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </motion.div>
            ))}
          </div>
          
          {/* You Marker */}
          <AnimatePresence>
          {youPosPercent !== null && (
              <motion.div
              className="absolute flex flex-col items-center"
              style={{ left: `calc(${youPosPercent}% - 0.5px)` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
                <div className="w-2 h-10 bg-red-500 rounded-full shadow-lg border-2 border-white" />
              <span
                ref={youLabelRef}
                  className="text-xs text-red-600 font-bold mt-1 whitespace-nowrap bg-white px-2 py-1 rounded-full shadow-sm"
                style={youLabelStyle}
                >
                  You
                </span>
              </motion.div>
          )}
          </AnimatePresence>
          
          {/* Target Marker */}
          <AnimatePresence>
          {targetPosPercent !== null && (
              <motion.div
              className="absolute flex flex-col items-center"
              style={{ left: `calc(${targetPosPercent}% - 0.5px)` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200, delay: 0.1 }}
            >
                <div className="w-2 h-10 bg-green-500 rounded-full shadow-lg border-2 border-white" />
              <span
                ref={targetLabelRef}
                  className="text-xs text-green-600 font-bold mt-1 whitespace-nowrap bg-white px-2 py-1 rounded-full shadow-sm"
                style={targetLabelStyle}
                >
                  Target
                </span>
              </motion.div>
          )}
          </AnimatePresence>
        </div>
        
        {/* Legend - perfectly aligned with segments above */}
        <div className="w-full flex mb-2">
          {bmiSegments.map((seg, idx) => (
            <motion.span
              key={idx}
              className="text-center text-sm font-semibold px-1"
              style={{
                color: seg.textColor,
                width: `${bmiVisualWidths[idx]}%`,
                minWidth: 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {seg.label}
            </motion.span>
          ))}
        </div>
      </div>
      
      {/* Ticks */}
      <div className="flex justify-between w-full max-w-4xl text-xs text-gray-500 mt-2">
        {TICKS.map((tick, idx) => (
          <span key={idx} className="text-center flex-1 font-medium">
            {tick}{idx === TICKS.length - 1 ? '+' : ''}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function HealthInsights({ bmi, category, weightDiff, requiredWeight }) {
  const getInsights = () => {
    if (!bmi) return [];
    
    const insights = [];
    
    if (bmi < 18.5) {
      insights.push({
        icon: TrendingUp,
        title: "Underweight",
        description: "Consider gaining weight through a balanced diet with healthy fats and proteins.",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      });
    } else if (bmi >= 18.5 && bmi < 25) {
      insights.push({
        icon: Heart,
        title: "Healthy Range",
        description: "Great! You're in the healthy BMI range. Maintain your current lifestyle.",
        color: "text-green-600",
        bgColor: "bg-green-50"
      });
    } else if (bmi >= 25 && bmi < 30) {
      insights.push({
        icon: TrendingDown,
        title: "Overweight",
        description: "Focus on a calorie deficit diet and regular exercise to reach a healthy weight.",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50"
      });
    } else {
      insights.push({
        icon: Zap,
        title: "Obese",
        description: "Consider consulting a healthcare professional for a personalized weight loss plan.",
        color: "text-red-600",
        bgColor: "bg-red-50"
      });
    }
    
    if (weightDiff && Math.abs(weightDiff) > 0.1) {
      insights.push({
        icon: Target,
        title: weightDiff > 0 ? "Weight Loss Goal" : "Weight Gain Goal",
        description: weightDiff > 0 
          ? `Aim to lose ${Math.abs(weightDiff).toFixed(1)} kg to reach your target BMI.`
          : `Aim to gain ${Math.abs(weightDiff).toFixed(1)} kg to reach your target BMI.`,
        color: weightDiff > 0 ? "text-purple-600" : "text-indigo-600",
        bgColor: weightDiff > 0 ? "bg-purple-50" : "bg-indigo-50"
      });
    }
    
    return insights;
  };

  const insights = getInsights();

  return (
    <AnimatePresence>
      {insights.length > 0 && (
        <motion.div 
          className="w-full max-w-4xl mx-auto mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Health Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                className={`${insight.bgColor} rounded-xl p-4 border border-gray-200 shadow-sm`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-start gap-3">
                  <div className={`${insight.color} p-2 rounded-lg bg-white shadow-sm`}>
                    <insight.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${insight.color} mb-1`}>
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const BMICalculator = () => {
  const [form, setForm] = useState({ age: '', height: '', weight: '', desiredBMI: '' });
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.age || form.age < 1 || form.age > 120) {
      newErrors.age = 'Please enter a valid age (1-120)';
    }
    
    if (!form.height || form.height < 50 || form.height > 300) {
      newErrors.height = 'Please enter a valid height (50-300 cm)';
    }
    
    if (!form.weight || form.weight < 20 || form.weight > 500) {
      newErrors.weight = 'Please enter a valid weight (20-500 kg)';
    }
    
    if (form.desiredBMI && (form.desiredBMI < 10 || form.desiredBMI > 60)) {
      newErrors.desiredBMI = 'Please enter a valid desired BMI (10-60)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const height = parseFloat(form.height);
    const weight = parseFloat(form.weight);
    const desiredBMI = parseFloat(form.desiredBMI);
    
    const bmi = calculateBMI(weight, height);
    const category = getBMICategory(bmi);
    
    let requiredWeight = null;
    let weightDiff = null;
    
    if (desiredBMI && height) {
      requiredWeight = (desiredBMI * (height / 100) * (height / 100));
      weightDiff = (weight - requiredWeight);
    }
    
    setResult({ bmi, category, requiredWeight, weightDiff });
    setIsCalculating(false);
  };

  const handleReset = () => {
    setForm({ age: '', height: '', weight: '', desiredBMI: '' });
    setResult(null);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-xl opacity-30"></div>
            <div className="relative bg-white rounded-full p-4 shadow-xl border border-blue-100">
              <Calculator className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            BMI Calculator
          </h1>
          
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Calculate your Body Mass Index and discover personalized health insights to achieve your wellness goals.
          </p>
        </motion.div>

        {/* Main Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Input Form */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Scale className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Your Measurements</h2>
        </div>
            
            <form onSubmit={handleCalculate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    onWheel={e => e.target.blur()}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      errors.age ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    placeholder="Enter your age"
                  />
                  {errors.age && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.age}
                    </motion.p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Height (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={form.height}
                    onChange={handleChange}
                    onWheel={e => e.target.blur()}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      errors.height ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    placeholder="Enter height in cm"
                  />
                  {errors.height && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.height}
                    </motion.p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Weight (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    onWheel={e => e.target.blur()}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      errors.weight ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    placeholder="Enter weight in kg"
                  />
                  {errors.weight && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.weight}
                    </motion.p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Desired BMI <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    name="desiredBMI"
                    value={form.desiredBMI}
                    onChange={handleChange}
                    onWheel={e => e.target.blur()}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      errors.desiredBMI ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    placeholder="e.g., 22.5"
                  />
                  {errors.desiredBMI && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.desiredBMI}
                    </motion.p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
              <button
                type="submit"
                  disabled={isCalculating}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCalculating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" />
                Calculate BMI
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200"
                >
                  Reset
              </button>
              </div>
            </form>
          </motion.div>

          {/* Results Section */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Your Results</h2>
            </div>
            
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Your BMI is</h3>
                    <div className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
                      {Number(result.bmi).toFixed(1)}
                    </div>
                    <div className="text-xl font-semibold mb-4">
                      Category: 
                      <span 
                        className="ml-2 px-3 py-1 rounded-full text-sm font-bold"
                        style={{ 
                          color: result.category?.color || '#000',
                          backgroundColor: result.category?.color ? `${result.category.color}20` : '#f3f4f6'
                        }}
                    >
                        {result.category?.category || 'Unknown'}
                    </span>
                    </div>
                  </div>
                  
                  {form.desiredBMI && result.requiredWeight && (
                    <motion.div 
                      className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Target Analysis</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-600">Target Weight:</span>
                          <div className="text-2xl font-bold text-purple-600">
                            {Number(result.requiredWeight).toFixed(1)} kg
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Weight Difference:</span>
                          <div className={`text-xl font-bold ${result.weightDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {result.weightDiff > 0 ? '+' : ''}{Number(result.weightDiff).toFixed(1)} kg
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                        {result.weightDiff > 0
                              ? `You need to lose ${Math.abs(Number(result.weightDiff)).toFixed(1)} kg`
                          : result.weightDiff < 0
                                ? `You need to gain ${Math.abs(Number(result.weightDiff)).toFixed(1)} kg`
                                : 'Perfect! You are at your target weight!'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-12 h-12 text-gray-400" />
                </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Ready to Calculate</h3>
                  <p className="text-gray-500">Enter your measurements and click "Calculate BMI" to see your results.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* BMI Scale Visualization */}
        <AnimatePresence>
          {result && (
            <motion.div 
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">BMI Scale</h2>
              </div>
              
              <BMISegmentBar 
                userBMI={result?.bmi} 
                targetBMI={form.desiredBMI ? Number(form.desiredBMI) : null} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Health Insights */}
        <HealthInsights 
          bmi={result?.bmi}
          category={result?.category}
          weightDiff={result?.weightDiff}
          requiredWeight={result?.requiredWeight}
        />
      </div>
    </div>
  );
};

export default BMICalculator; 