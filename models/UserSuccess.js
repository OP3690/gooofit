const mongoose = require('mongoose');

const userSuccessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  countryCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  flag: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  weightLost: {
    type: Number,
    required: true,
    min: 0.75,
    max: 10
  },
  duration: {
    type: String,
    required: true,
    enum: ['2 weeks', '1 month', '1.5 months', '2 months', '3 months', '4 months', '5 months', '6 months']
  },
  durationInDays: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSuccessSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('UserSuccess', userSuccessSchema); 