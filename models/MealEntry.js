const mongoose = require('mongoose');

const mealEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['grams', 'cups', 'tsp', 'ml', 'pieces', 'slices', 'tbsp']
  },
  calories: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    default: 0
  },
  protein: {
    type: Number,
    default: 0
  },
  carbs: {
    type: Number,
    default: 0
  },
  cholesterol: {
    type: Number,
    default: 0
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    default: 'snack'
  },
  mealTime: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
mealEntrySchema.index({ userId: 1, date: -1 });
mealEntrySchema.index({ userId: 1, mealType: 1, date: -1 });

module.exports = mongoose.model('MealEntry', mealEntrySchema); 