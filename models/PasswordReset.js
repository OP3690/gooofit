const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false, // Now optional since we support mobile
    lowercase: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: false, // Now optional since we support email
    trim: true
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  method: {
    type: String,
    required: true,
    enum: ['email', 'mobile'],
    default: 'email'
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // OTP expires in 10 minutes
      return new Date(Date.now() + 10 * 60 * 1000);
    }
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for automatic cleanup of expired OTPs
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for email/mobile lookups
passwordResetSchema.index({ email: 1, method: 1 });
passwordResetSchema.index({ mobileNumber: 1, method: 1 });

// Method to check if OTP is valid and not expired
passwordResetSchema.methods.isValid = function() {
  return !this.used && this.expiresAt > new Date();
};

// Method to mark OTP as used
passwordResetSchema.methods.markAsUsed = function() {
  this.used = true;
  return this.save();
};

// Static method to find valid OTP for email
passwordResetSchema.statics.findValidOTPByEmail = function(email, otp) {
  return this.findOne({
    email: email.toLowerCase(),
    otp: otp,
    method: 'email',
    used: false,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to find valid OTP for mobile
passwordResetSchema.statics.findValidOTPByMobile = function(mobileNumber, otp) {
  return this.findOne({
    mobileNumber: mobileNumber,
    otp: otp,
    method: 'mobile',
    used: false,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to find valid OTP (generic)
passwordResetSchema.statics.findValidOTP = function(identifier, otp, method) {
  if (method === 'mobile') {
    return this.findValidOTPByMobile(identifier, otp);
  } else {
    return this.findValidOTPByEmail(identifier, otp);
  }
};

// Static method to invalidate all OTPs for an email
passwordResetSchema.statics.invalidateAllOTPsByEmail = function(email) {
  return this.updateMany(
    { email: email.toLowerCase(), method: 'email' },
    { used: true }
  );
};

// Static method to invalidate all OTPs for a mobile number
passwordResetSchema.statics.invalidateAllOTPsByMobile = function(mobileNumber) {
  return this.updateMany(
    { mobileNumber: mobileNumber, method: 'mobile' },
    { used: true }
  );
};

// Static method to invalidate all OTPs (generic)
passwordResetSchema.statics.invalidateAllOTPs = function(identifier, method) {
  if (method === 'mobile') {
    return this.invalidateAllOTPsByMobile(identifier);
  } else {
    return this.invalidateAllOTPsByEmail(identifier);
  }
};

module.exports = mongoose.model('PasswordReset', passwordResetSchema); 