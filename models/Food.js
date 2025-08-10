const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  fat: {
    type: Number,
    required: true
  },
  cholesterol: {
    type: Number,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true,
    default: 0
  },
  carbs: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Beverages', 'Snacks', 'Dairy', 'Grains', 'Pulses', 'Vegetables', 'Eggs', 'Soups', 'Condiments', 'Meat', 'Fish', 'Fruits', 'Nuts', 'Fats', 'Sweeteners', 'Desserts']
  },
  hinglish: {
    type: String,
    required: true
  },
  cholesterolFlag: {
    type: String,
    required: true,
    enum: ['Good', 'Bad']
  }
}, {
  timestamps: true
});

// Create indexes for better performance
foodSchema.index({ name: 1 });
foodSchema.index({ category: 1 });
foodSchema.index({ cholesterolFlag: 1 });

module.exports = mongoose.model('Food', foodSchema); 