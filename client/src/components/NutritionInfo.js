import React, { useState } from 'react';
import { FaChartPie, FaChartBar, FaTable, FaInfoCircle } from 'react-icons/fa';

const NutritionInfo = () => {
  const [activeTab, setActiveTab] = useState('energy');

  const energyExpenditure = [
    { activity: "Sleeping", energy: 57 },
    { activity: "Lying quietly", energy: 69 },
    { activity: "Sitting quietly", energy: 81 },
    { activity: "Standing quietly", energy: 93 },
    { activity: "Writing", energy: 102 },
    { activity: "Typing", energy: 105 },
    { activity: "Reading", energy: 95 },
    { activity: "Watching TV", energy: 85 },
    { activity: "Walking slowly", energy: 150 },
    { activity: "Walking normally", energy: 200 },
    { activity: "Walking fast", energy: 300 },
    { activity: "Running", energy: 600 },
    { activity: "Cycling", energy: 400 },
    { activity: "Swimming", energy: 500 },
    { activity: "Dancing", energy: 350 },
    { activity: "Cooking", energy: 120 },
    { activity: "Cleaning", energy: 180 },
    { activity: "Gardening", energy: 250 },
    { activity: "Weight lifting", energy: 450 },
    { activity: "Yoga", energy: 150 },
  ];

  const dietaryAllowances = [
    { group: "Adult Man", weight: 60, energy: 2320, protein: 60, fat: 25, calcium: 600, iron: 17 },
    { group: "Adult Woman", weight: 55, energy: 1900, protein: 55, fat: 20, calcium: 600, iron: 21 },
    { group: "Pregnant Woman", weight: 55, energy: 2200, protein: 78, fat: 30, calcium: 1200, iron: 35 },
    { group: "Lactating Mother", weight: 55, energy: 2400, protein: 74, fat: 30, calcium: 1200, iron: 21 },
    { group: "Children (1-3 years)", weight: 13, energy: 1240, protein: 16.7, fat: 27, calcium: 600, iron: 9 },
    { group: "Children (4-6 years)", weight: 20, energy: 1690, protein: 20.1, fat: 25, calcium: 600, iron: 13 },
    { group: "Children (7-9 years)", weight: 25, energy: 1950, protein: 29.5, fat: 35, calcium: 600, iron: 16 },
    { group: "Adolescent Boys", weight: 45, energy: 2450, protein: 54.3, fat: 35, calcium: 800, iron: 21 },
    { group: "Adolescent Girls", weight: 40, energy: 2060, protein: 51.9, fat: 35, calcium: 800, iron: 27 },
  ];

  const standardPortions = [
    { foodGroup: "Cereals & Millets", portion: 30, energy: 108, protein: 3.5, carbs: 23, fat: 0.5 },
    { foodGroup: "Pulses", portion: 15, energy: 52, protein: 3.0, carbs: 8, fat: 0.5 },
    { foodGroup: "Green Leafy Vegetables", portion: 25, energy: 6, protein: 1.0, carbs: 1, fat: 0.0 },
    { foodGroup: "Other Vegetables", portion: 50, energy: 10, protein: 1.0, carbs: 2, fat: 0.0 },
    { foodGroup: "Fruits", portion: 100, energy: 60, protein: 1.0, carbs: 15, fat: 0.0 },
    { foodGroup: "Milk", portion: 100, energy: 67, protein: 3.2, carbs: 4.4, fat: 4.1 },
    { foodGroup: "Eggs", portion: 50, energy: 80, protein: 6.0, carbs: 0.0, fat: 6.0 },
    { foodGroup: "Fish", portion: 50, energy: 45, protein: 8.0, carbs: 0.0, fat: 1.0 },
    { foodGroup: "Meat", portion: 50, energy: 60, protein: 8.0, carbs: 0.0, fat: 3.0 },
    { foodGroup: "Fats & Oils", portion: 5, energy: 45, protein: 0.0, carbs: 0.0, fat: 5.0 },
  ];

  const glycemicIndex = [
    { food: "Glucose", gi: 103 },
    { food: "White bread", gi: 75 },
    { food: "Wheat bread", gi: 74 },
    { food: "Rice (white)", gi: 73 },
    { food: "Rice (brown)", gi: 68 },
    { food: "Potato (boiled)", gi: 78 },
    { food: "Sweet potato", gi: 44 },
    { food: "Carrots", gi: 39 },
    { food: "Apple", gi: 36 },
    { food: "Banana", gi: 51 },
    { food: "Orange", gi: 43 },
    { food: "Mango", gi: 51 },
    { food: "Milk", gi: 27 },
    { food: "Yogurt", gi: 14 },
    { food: "Lentils", gi: 29 },
    { food: "Chickpeas", gi: 28 },
    { food: "Kidney beans", gi: 24 },
    { food: "Peanuts", gi: 14 },
    { food: "Almonds", gi: 0 },
    { food: "Walnuts", gi: 0 },
  ];

  const getGILevel = (gi) => {
    if (gi >= 70) return { level: "High", color: "text-red-600", bgColor: "bg-red-100" };
    if (gi >= 56) return { level: "Medium", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    return { level: "Low", color: "text-green-600", bgColor: "bg-green-100" };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Nutrition Information</h1>
          <p className="text-gray-600">Comprehensive nutrition data and dietary guidelines</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex justify-center">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'energy', name: 'Energy Expenditure', icon: FaChartBar },
                { id: 'dietary', name: 'Dietary Allowances', icon: FaTable },
                { id: 'portions', name: 'Standard Portions', icon: FaChartPie },
                { id: 'glycemic', name: 'Glycemic Index', icon: FaInfoCircle }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-orange-600 shadow-sm border border-orange-200'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Energy Expenditure Tab */}
        {activeTab === 'energy' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Energy Expenditure (Kcal/hr)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {energyExpenditure.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{item.activity}</span>
                      <span className="text-orange-600 font-bold">{item.energy} kcal</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(item.energy / 600) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dietary Allowances Tab */}
        {activeTab === 'dietary' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Dietary Allowances (RDA)</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Energy (kcal)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protein (g)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fat (g)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calcium (mg)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Iron (mg)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dietaryAllowances.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.group}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.weight}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.energy}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.protein}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fat}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.calcium}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.iron}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Standard Portions Tab */}
        {activeTab === 'portions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Standard Portion Sizes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {standardPortions.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">{item.foodGroup}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Portion:</span>
                        <span className="text-sm font-medium">{item.portion}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Energy:</span>
                        <span className="text-sm font-medium text-orange-600">{item.energy} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Protein:</span>
                        <span className="text-sm font-medium text-blue-600">{item.protein}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Carbs:</span>
                        <span className="text-sm font-medium text-green-600">{item.carbs}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fat:</span>
                        <span className="text-sm font-medium text-red-600">{item.fat}g</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Glycemic Index Tab */}
        {activeTab === 'glycemic' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Glycemic Index (GI) Values</h2>
              <div className="mb-4">
                <div className="flex space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>Low GI (0-55)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span>Medium GI (56-69)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span>High GI (70+)</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {glycemicIndex.map((item, index) => {
                  const giLevel = getGILevel(item.gi);
                  return (
                    <div key={index} className={`p-4 rounded-lg border ${giLevel.bgColor}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{item.food}</span>
                        <span className={`font-bold ${giLevel.color}`}>{item.gi}</span>
                      </div>
                      <div className="mt-1">
                        <span className={`text-xs font-medium ${giLevel.color}`}>{giLevel.level} GI</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionInfo; 