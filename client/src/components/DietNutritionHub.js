import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaAppleAlt, FaLeaf, FaFish, FaSeedling, FaDumbbell, FaCalculator, FaBookOpen, FaHeart, FaLightbulb, FaChartLine } from 'react-icons/fa';

const DietNutritionHub = () => {
  const [activeTab, setActiveTab] = useState('trends');
  const [selectedDiet, setSelectedDiet] = useState(null);

  const dietTrends = [
    {
      id: 'intermittent-fasting',
      name: 'Intermittent Fasting',
      icon: <FaClock className="text-2xl text-blue-600" />,
      description: 'Time-restricted eating patterns for weight loss and health benefits',
      benefits: ['Weight loss', 'Improved metabolism', 'Better insulin sensitivity', 'Cellular repair'],
      methods: ['16:8 Method', '5:2 Method', 'Eat-Stop-Eat', 'Alternate Day Fasting'],
      tips: ['Start gradually', 'Stay hydrated', 'Choose nutrient-dense foods', 'Listen to your body']
    },
    {
      id: 'keto',
      name: 'Keto Diet / Ketogenic Diet',
      icon: <FaFire className="text-2xl text-orange-600" />,
      description: 'High-fat, low-carbohydrate diet that induces ketosis',
      benefits: ['Rapid weight loss', 'Reduced appetite', 'Improved mental clarity', 'Stable energy levels'],
      foods: ['Avocados', 'Nuts & seeds', 'Fatty fish', 'Eggs', 'Coconut oil', 'Butter'],
      restrictions: ['Grains', 'Sugars', 'Most fruits', 'Starchy vegetables'],
      tips: ['Monitor ketone levels', 'Stay hydrated', 'Get enough electrolytes', 'Plan meals ahead']
    },
    {
      id: 'mediterranean',
      name: 'Mediterranean Diet',
      icon: <FaLeaf className="text-2xl text-green-600" />,
      description: 'Heart-healthy diet based on Mediterranean region eating patterns',
      benefits: ['Heart health', 'Longevity', 'Weight management', 'Reduced inflammation'],
      foods: ['Olive oil', 'Fish & seafood', 'Vegetables', 'Whole grains', 'Nuts', 'Legumes'],
      tips: ['Use olive oil daily', 'Eat fish 2-3 times/week', 'Include plenty of vegetables', 'Enjoy meals with family']
    },
    {
      id: 'plant-based',
      name: 'Plant-Based Diet for Weight Loss',
      icon: <FaSeedling className="text-2xl text-emerald-600" />,
      description: 'Whole food, plant-based approach to sustainable weight loss',
      benefits: ['Lower calorie density', 'High fiber content', 'Rich in nutrients', 'Sustainable'],
      foods: ['Vegetables', 'Fruits', 'Legumes', 'Whole grains', 'Nuts & seeds'],
      tips: ['Focus on whole foods', 'Include protein sources', 'Plan balanced meals', 'Stay hydrated']
    },
    {
      id: 'high-protein',
      name: 'High Protein Meals',
      icon: <FaDumbbell className="text-2xl text-purple-600" />,
      description: 'Protein-rich meals to support muscle building and weight loss',
      benefits: ['Increased satiety', 'Muscle preservation', 'Higher metabolism', 'Better body composition'],
      sources: ['Lean meats', 'Fish', 'Eggs', 'Dairy', 'Legumes', 'Plant proteins'],
      tips: ['Aim for 1.6-2.2g protein per kg body weight', 'Distribute throughout the day', 'Combine with strength training']
    }
  ];

  const nutritionTools = [
    {
      id: 'calorie-calculator',
      name: 'Calorie Calculator for Weight Loss',
      icon: <FaCalculator className="text-2xl text-red-600" />,
      description: 'Calculate your daily calorie needs for weight loss',
      features: ['BMR calculation', 'Activity level adjustment', 'Weight loss targets', 'Macro breakdown']
    },
    {
      id: 'meal-planner',
      name: 'Weight Loss Meal Plans',
      icon: <FaBookOpen className="text-2xl text-indigo-600" />,
      description: 'Structured meal plans designed for weight loss success',
      features: ['Weekly meal plans', 'Shopping lists', 'Nutritional information', 'Recipe collection']
    },
    {
      id: 'portion-control',
      name: 'Portion Control Tips',
      icon: <FaLightbulb className="text-2xl text-yellow-600" />,
      description: 'Learn effective portion control strategies',
      features: ['Visual guides', 'Hand portion method', 'Plate method', 'Mindful eating techniques']
    }
  ];

  const healthyRecipes = [
    {
      id: 'breakfast-bowl',
      name: 'Protein-Packed Breakfast Bowl',
      calories: 320,
      protein: '25g',
      carbs: '28g',
      fat: '12g',
      ingredients: ['Greek yogurt', 'Berries', 'Nuts', 'Honey', 'Chia seeds'],
      instructions: ['Mix yogurt with honey', 'Top with berries and nuts', 'Sprinkle chia seeds', 'Serve immediately']
    },
    {
      id: 'quinoa-salad',
      name: 'Mediterranean Quinoa Salad',
      calories: 280,
      protein: '12g',
      carbs: '45g',
      fat: '8g',
      ingredients: ['Quinoa', 'Cherry tomatoes', 'Cucumber', 'Olives', 'Feta cheese', 'Olive oil'],
      instructions: ['Cook quinoa according to package', 'Chop vegetables', 'Mix ingredients', 'Dress with olive oil']
    },
    {
      id: 'grilled-salmon',
      name: 'Grilled Salmon with Vegetables',
      calories: 380,
      protein: '35g',
      carbs: '15g',
      fat: '22g',
      ingredients: ['Salmon fillet', 'Broccoli', 'Carrots', 'Lemon', 'Herbs', 'Olive oil'],
      instructions: ['Season salmon', 'Grill 4-5 minutes per side', 'Roast vegetables', 'Serve with lemon']
    }
  ];

  const renderDietCard = (diet) => (
    <motion.div
      key={diet.id}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
    >
      <div className="flex items-center mb-4">
        {diet.icon}
        <h3 className="text-xl font-semibold ml-3 text-gray-800">{diet.name}</h3>
      </div>
      <p className="text-gray-600 mb-4">{diet.description}</p>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Key Benefits:</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {diet.benefits?.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>
        
        {diet.methods && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Methods:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {diet.methods.map((method, index) => (
                <li key={index}>{method}</li>
              ))}
            </ul>
          </div>
        )}
        
        {diet.tips && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Tips:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {diet.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderRecipeCard = (recipe) => (
    <motion.div
      key={recipe.id}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{recipe.name}</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div className="text-center">
          <div className="font-medium text-gray-800">{recipe.calories}</div>
          <div className="text-gray-500">Calories</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-800">{recipe.protein}</div>
          <div className="text-gray-500">Protein</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-800">{recipe.carbs}</div>
          <div className="text-gray-500">Carbs</div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Ingredients:</h4>
        <div className="flex flex-wrap gap-2">
          {recipe.ingredients.map((ingredient, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {ingredient}
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
          {recipe.instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Diet & Nutrition Hub
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Discover proven diet strategies, nutrition tools, and healthy recipes to support your weight loss journey
          </motion.p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8">
          {[
            { id: 'trends', name: 'Diet Trends', icon: <FaChartLine /> },
            { id: 'tools', name: 'Nutrition Tools', icon: <FaCalculator /> },
            { id: 'recipes', name: 'Healthy Recipes', icon: <FaAppleAlt /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 mx-2 mb-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'trends' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Popular Diet Trends</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dietTrends.map(renderDietCard)}
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Nutrition Tools & Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nutritionTools.map((tool) => (
                  <motion.div
                    key={tool.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500"
                  >
                    <div className="flex items-center mb-4">
                      {tool.icon}
                      <h3 className="text-xl font-semibold ml-3 text-gray-800">{tool.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{tool.description}</p>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Features:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {tool.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recipes' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Healthy Weight Loss Recipes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {healthyRecipes.map(renderRecipeCard)}
              </div>
            </div>
          )}
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Start Your Journey?</h3>
            <p className="text-gray-600 mb-6">
              Track your nutrition, plan your meals, and monitor your progress with our comprehensive tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Start Meal Planning
              </button>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Calculate Calories
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DietNutritionHub;
