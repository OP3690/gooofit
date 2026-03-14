import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const PasswordReset = ({ onBackToLogin }) => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend OTP
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/users/forgot-password', { email });
      toast.success('OTP sent successfully! Check your email.');
      setOtpSent(true);
      setStep(2);
      setCountdown(60); // 60 seconds countdown
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/users/verify-otp', { email, otp });
      toast.success('OTP verified successfully!');
      setStep(3);
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/users/reset-password', {
        email,
        otp,
        newPassword,
        confirmPassword
      });
      toast.success('Password reset successfully!');
      onBackToLogin();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      await axios.post('/api/users/forgot-password', { email });
      toast.success('OTP resent successfully!');
      setCountdown(60);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
        <p className="text-sm text-gray-600">Enter your email address and we'll send you an OTP to reset your password.</p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          placeholder="Enter your email address"
          disabled={loading}
        />
      </div>

      <button
        onClick={handleSendOTP}
        disabled={loading || !email}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
      >
        {loading ? 'Sending OTP...' : 'Send OTP'}
      </button>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Enter OTP</h2>
        <p className="text-sm text-gray-600">
          We've sent a 6-digit OTP to <span className="font-medium text-orange-600">{email}</span>
        </p>
      </div>

      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
          OTP Code
        </label>
        <input
          type="text"
          id="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg font-mono tracking-widest text-sm"
          placeholder="000000"
          maxLength={6}
          disabled={loading}
        />
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleVerifyOTP}
          disabled={loading || otp.length !== 6}
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-600 mb-2">
          Didn't receive the OTP?
        </p>
        <button
          onClick={handleResendOTP}
          disabled={countdown > 0 || loading}
          className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Set New Password</h2>
        <p className="text-sm text-gray-600">Enter your new password below.</p>
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            placeholder="Enter new password"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <EyeIcon className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
        {newPassword && newPassword.length < 6 && (
          <p className="mt-1 text-xs text-red-600 flex items-center">
            <ExclamationCircleIcon className="h-3 w-3 mr-1" />
            Password must be at least 6 characters
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            placeholder="Confirm new password"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <EyeIcon className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="mt-1 text-xs text-red-600 flex items-center">
            <ExclamationCircleIcon className="h-3 w-3 mr-1" />
            Passwords do not match
          </p>
        )}
        {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
          <p className="mt-1 text-xs text-green-600 flex items-center">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Passwords match
          </p>
        )}
      </div>

      <button
        onClick={handleResetPassword}
        disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
      >
        {loading ? 'Resetting Password...' : 'Reset Password'}
      </button>
    </motion.div>
  );

  return (
    <div className="w-full">
      {/* Back Button */}
      <button
        onClick={onBackToLogin}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Login
      </button>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step >= stepNumber
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-6 h-1 mx-1 ${
                    step > stepNumber ? 'bg-orange-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default PasswordReset; 