const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  mobileNumber: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    match: [/^\+[0-9]{1,4}[0-9]{10,15}$/, 'Please use a valid international mobile number']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    minlength: [2, 'Country code must be at least 2 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [13, 'Age must be at least 13'],
    max: [120, 'Age cannot exceed 120']
  },
  height: {
    type: Number,
    required: false,
    min: [100, 'Height must be at least 100 cm'],
    max: [250, 'Height cannot exceed 250 cm']
  },
  currentWeight: {
    type: Number,
    required: false,
    min: [20, 'Weight must be at least 20 kg'],
    max: [300, 'Weight cannot exceed 300 kg']
  },
  goalWeight: {
    type: Number,
    required: false,
    min: [20, 'Goal weight must be at least 20 kg'],
    max: [300, 'Goal weight cannot exceed 300 kg']
  },
  targetWeight: {
    type: Number,
    required: false,
    min: [20, 'Target weight must be at least 20 kg'],
    max: [300, 'Target weight cannot exceed 300 kg']
  },
  targetDate: {
    type: Date,
    required: false
  },
  daysToTarget: {
    type: Number,
    required: false,
    min: [1, 'Days to target must be at least 1']
  },
  activityLevel: {
    type: String,
    required: false,
    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
    default: 'sedentary'
  },
  goalStatus: {
    type: String,
    enum: ['active', 'achieved', 'discarded', 'expired', 'none'],
    default: 'active'
  },
  goalId: { type: mongoose.Schema.Types.ObjectId, required: false },
  pastGoals: [
    {
      goalId: { type: mongoose.Schema.Types.ObjectId, required: false },
      currentWeight: Number,
      targetWeight: Number,
      targetDate: Date,
      startedAt: { type: Date, default: Date.now },
      endedAt: Date,
      status: { type: String, enum: ['achieved', 'discarded', 'expired'], required: true },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  goalCreatedAt: { type: Date },
  goalInitialWeight: { type: Number },
}, {
  timestamps: true
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Ensure all pastGoals have goalId before saving
userSchema.pre('save', function(next) {
  if (this.pastGoals && Array.isArray(this.pastGoals)) {
    this.pastGoals.forEach(goal => {
      if (!goal.goalId) {
        goal.goalId = new mongoose.Types.ObjectId();
      }
    });
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for current BMI calculation
userSchema.virtual('currentBMI').get(function() {
  if (this.height && this.currentWeight) {
    const heightInMeters = this.height / 100;
    return (this.currentWeight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
});

// Virtual for goal BMI calculation
userSchema.virtual('goalBMI').get(function() {
  if (this.height && this.goalWeight) {
    const heightInMeters = this.height / 100;
    return (this.goalWeight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
});

// Method to get BMI category
userSchema.methods.getBMICategory = function(bmi) {
  if (bmi < 16.0) return 'Extreme Underweight';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25.0) return 'Normal';
  if (bmi < 30.0) return 'Overweight';
  if (bmi < 35.0) return 'Obese Class-1';
  if (bmi < 40.0) return 'Obese Class-2';
  return 'Obese Class-3';
};

// Ensure virtuals are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema); 