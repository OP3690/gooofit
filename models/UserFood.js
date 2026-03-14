const mongoose = require('mongoose');

const userFoodSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Beverages',
        'Snacks',
        'Dairy',
        'Grains',
        'Pulses',
        'Vegetables',
        'Eggs',
        'Soups',
        'Condiments',
        'Meat',
        'Fish',
        'Fruits',
        'Nuts',
        'Fats',
        'Sweeteners',
        'Desserts',
        // Additional user categories
        'Fruit',
        'Cold Drinks',
        'Juice',
        'Other',
      ],
    },
    calories: { type: Number, required: true },
    fat: { type: Number, required: true },
    cholesterol: { type: Number, required: true },
    quantity: { type: Number, default: null },
    unit: { type: String, default: '' },
  },
  { timestamps: true }
);

// Unique per user by name
userFoodSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('UserFood', userFoodSchema);

