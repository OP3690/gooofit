import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  ArrowLeftIcon, 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordPopup = ({ isOpen, onClose, onBackToLogin }) => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  // Countries data
  const countries = [
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'Germany', code: '+49', flag: '🇩🇪' },
    { name: 'France', code: '+33', flag: '🇫🇷' },
    { name: 'Japan', code: '+81', flag: '🇯🇵' },
    { name: 'South Korea', code: '+82', flag: '🇰🇷' },
    { name: 'Singapore', code: '+65', flag: '🇸🇬' },
    { name: 'Brazil', code: '+55', flag: '🇧🇷' },
    { name: 'Mexico', code: '+52', flag: '🇲🇽' },
    { name: 'Spain', code: '+34', flag: '🇪🇸' },
    { name: 'Italy', code: '+39', flag: '🇮🇹' },
    { name: 'Netherlands', code: '+31', flag: '🇳🇱' },
    { name: 'Sweden', code: '+46', flag: '🇸🇪' },
    { name: 'Norway', code: '+47', flag: '🇳🇴' },
    { name: 'Denmark', code: '+45', flag: '🇩🇰' },
    { name: 'Finland', code: '+358', flag: '🇫🇮' },
    { name: 'Switzerland', code: '+41', flag: '🇨🇭' },
    { name: 'Austria', code: '+43', flag: '🇦🇹' },
    { name: 'Belgium', code: '+32', flag: '🇧🇪' },
    { name: 'Poland', code: '+48', flag: '🇵🇱' },
    { name: 'Czech Republic', code: '+420', flag: '🇨🇿' },
    { name: 'Hungary', code: '+36', flag: '🇭🇺' },
    { name: 'Romania', code: '+40', flag: '🇷🇴' },
    { name: 'Bulgaria', code: '+359', flag: '🇧🇬' },
    { name: 'Croatia', code: '+385', flag: '🇭🇷' },
    { name: 'Slovenia', code: '+386', flag: '🇸🇮' },
    { name: 'Slovakia', code: '+421', flag: '🇸🇰' },
    { name: 'Lithuania', code: '+370', flag: '🇱🇹' },
    { name: 'Latvia', code: '+371', flag: '🇱🇻' },
    { name: 'Estonia', code: '+372', flag: '🇪🇪' },
    { name: 'Ireland', code: '+353', flag: '🇮🇪' },
    { name: 'Portugal', code: '+351', flag: '🇵🇹' },
    { name: 'Greece', code: '+30', flag: '🇬🇷' },
    { name: 'Cyprus', code: '+357', flag: '🇨🇾' },
    { name: 'Malta', code: '+356', flag: '🇲🇹' },
    { name: 'Luxembourg', code: '+352', flag: '🇱🇺' },
    { name: 'Iceland', code: '+354', flag: '🇮🇸' },
    { name: 'New Zealand', code: '+64', flag: '🇳🇿' },
    { name: 'South Africa', code: '+27', flag: '🇿🇦' },
    { name: 'Egypt', code: '+20', flag: '🇪🇬' },
    { name: 'Morocco', code: '+212', flag: '🇲🇦' },
    { name: 'Tunisia', code: '+216', flag: '🇹🇳' },
    { name: 'Algeria', code: '+213', flag: '🇩🇿' },
    { name: 'Libya', code: '+218', flag: '🇱🇾' },
    { name: 'Sudan', code: '+249', flag: '🇸🇩' },
    { name: 'Ethiopia', code: '+251', flag: '🇪🇹' },
    { name: 'Kenya', code: '+254', flag: '🇰🇪' },
    { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
    { name: 'Ghana', code: '+233', flag: '🇬🇭' },
    { name: 'Uganda', code: '+256', flag: '🇺🇬' },
    { name: 'Tanzania', code: '+255', flag: '🇹🇿' },
    { name: 'Zimbabwe', code: '+263', flag: '🇿🇼' },
    { name: 'Zambia', code: '+260', flag: '🇿🇲' },
    { name: 'Botswana', code: '+267', flag: '🇧🇼' },
    { name: 'Namibia', code: '+264', flag: '🇳🇦' },
    { name: 'Mozambique', code: '+258', flag: '🇲🇿' },
    { name: 'Angola', code: '+244', flag: '🇦🇴' },
    { name: 'Cameroon', code: '+237', flag: '🇨🇲' },
    { name: 'Senegal', code: '+221', flag: '🇸🇳' },
    { name: 'Mali', code: '+223', flag: '🇲🇱' },
    { name: 'Burkina Faso', code: '+226', flag: '🇧🇫' },
    { name: 'Niger', code: '+227', flag: '🇳🇪' },
    { name: 'Chad', code: '+235', flag: '🇹🇩' },
    { name: 'Central African Republic', code: '+236', flag: '🇨🇫' },
    { name: 'Gabon', code: '+241', flag: '🇬🇦' },
    { name: 'Congo', code: '+242', flag: '🇨🇬' },
    { name: 'Democratic Republic of the Congo', code: '+243', flag: '🇨🇩' },
    { name: 'Rwanda', code: '+250', flag: '🇷🇼' },
    { name: 'Burundi', code: '+257', flag: '🇧🇮' },
    { name: 'Somalia', code: '+252', flag: '🇸🇴' },
    { name: 'Djibouti', code: '+253', flag: '🇩🇯' },
    { name: 'Eritrea', code: '+291', flag: '🇪🇷' },
    { name: 'Comoros', code: '+269', flag: '🇰🇲' },
    { name: 'Seychelles', code: '+248', flag: '🇸🇨' },
    { name: 'Mauritius', code: '+230', flag: '🇲🇺' },
    { name: 'Madagascar', code: '+261', flag: '🇲🇬' },
    { name: 'Malawi', code: '+265', flag: '🇲🇼' },
    { name: 'Lesotho', code: '+266', flag: '🇱🇸' },
    { name: 'Eswatini', code: '+268', flag: '🇸🇿' },
    { name: 'Equatorial Guinea', code: '+240', flag: '🇬🇶' },
    { name: 'Sao Tome and Principe', code: '+239', flag: '🇸🇹' },
    { name: 'Cape Verde', code: '+238', flag: '🇨🇻' },
    { name: 'Guinea-Bissau', code: '+245', flag: '🇬🇼' },
    { name: 'Guinea', code: '+224', flag: '🇬🇳' },
    { name: 'Sierra Leone', code: '+232', flag: '🇸🇱' },
    { name: 'Liberia', code: '+231', flag: '🇱🇷' },
    { name: 'Cote d\'Ivoire', code: '+225', flag: '🇨🇮' },
    { name: 'Togo', code: '+228', flag: '🇹🇬' },
    { name: 'Benin', code: '+229', flag: '🇧🇯' },
    { name: 'Gambia', code: '+220', flag: '🇬🇲' }
  ];

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleMethodSelect = (selectedMethod) => {
    if (selectedMethod === 'mobile') {
      toast.error('SMS service coming soon! Please use email for now.');
      return;
    }
    setMethod(selectedMethod);
    setError('');
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country.name);
    setCountryCode(country.code);
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = method === 'email' 
        ? { method, email }
        : { method, mobileNumber: `${countryCode}${mobileNumber}`, countryCode };

      const response = await api.post('/users/forgot-password', payload);
      
      if (response.data.success) {
        setStep(3);
        setCountdown(60);
        toast.success(`Verification code sent to your ${method === 'email' ? 'email' : 'mobile'}!`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send verification code. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const identifier = method === 'email' ? email : `${countryCode}${mobileNumber}`;
      const response = await api.post('/users/verify-otp', {
        method,
        identifier,
        otp
      });

      if (response.data.success) {
        setStep(4);
        toast.success('OTP verified successfully!');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const identifier = method === 'email' ? email : `${countryCode}${mobileNumber}`;
      const response = await api.post('/users/reset-password', {
        method,
        identifier,
        otp,
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        toast.success('Password reset successfully!');
        onClose();
        onBackToLogin();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');

    try {
      const payload = method === 'email' 
        ? { method, email }
        : { method, mobileNumber: `${countryCode}${mobileNumber}`, countryCode };

      const response = await api.post('/users/forgot-password', payload);
      
      if (response.data.success) {
        setCountdown(60);
        toast.success(`New verification code sent to your ${method === 'email' ? 'email' : 'mobile'}!`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to resend verification code. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setMethod('email');
    setEmail('');
    setMobileNumber('');
    setCountryCode('+91');
    setSelectedCountry('India');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLoading(false);
    setCountdown(0);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            
            {step > 1 && (
              <button
                onClick={handleBack}
                className="absolute top-4 left-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                {step === 1 && (
                  <ShieldCheckIcon className="w-8 h-8" />
                )}
                {step === 2 && (
                  method === 'email' ? (
                    <EnvelopeIcon className="w-8 h-8" />
                  ) : (
                    <DevicePhoneMobileIcon className="w-8 h-8" />
                  )
                )}
                {step === 3 && (
                  <KeyIcon className="w-8 h-8" />
                )}
                {step === 4 && (
                  <CheckCircleIcon className="w-8 h-8" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold mb-2">
                {step === 1 && 'Forgot Password'}
                {step === 2 && `Enter ${method === 'email' ? 'Email' : 'Mobile Number'}`}
                {step === 3 && 'Verify OTP'}
                {step === 4 && 'Reset Password'}
              </h2>
              
              <p className="text-white/90 text-sm">
                {step === 1 && 'Choose how you want to reset your password'}
                {step === 2 && method === 'email' && 'We\'ll send a verification code to your email'}
                {step === 2 && method === 'mobile' && 'We\'ll send a verification code to your mobile'}
                {step === 3 && 'Enter the verification code we sent you'}
                {step === 4 && 'Create a new secure password'}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Method Selection */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleMethodSelect('email')}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                        method === 'email'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                      }`}
                    >
                      <EnvelopeIcon className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-center">
                        <div className="font-semibold">Email</div>
                        <div className="text-xs text-gray-500">Send to email</div>
                      </div>
                    </button>

                    <button
                      disabled
                      className="relative group p-4 rounded-2xl border-2 transition-all duration-200 bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                    >
                      <DevicePhoneMobileIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <div className="text-center">
                        <div className="font-semibold text-gray-500">Mobile</div>
                        <div className="text-xs text-gray-400">Send via SMS</div>
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10 shadow-lg border border-gray-700">
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-400">⚠️</span>
                          <span>SMS service coming soon!</span>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={method === 'mobile'}
                    className={`w-full py-3 px-6 rounded-2xl font-semibold transition-all duration-200 transform ${
                      method === 'mobile'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105'
                    }`}
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {/* Step 2: Input Email or Mobile */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {method === 'email' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <div className="relative">
                          <select
                            value={selectedCountry}
                            onChange={(e) => {
                              const country = countries.find(c => c.name === e.target.value);
                              handleCountrySelect(country);
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                          >
                            {countries.map((country) => (
                              <option key={country.name} value={country.name}>
                                {country.flag} {country.name} ({country.code})
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mobile Number
                        </label>
                        <div className="flex space-x-3">
                          <div className="w-24">
                            <input
                              type="text"
                              value={countryCode}
                              readOnly
                              className="w-full px-3 py-3 border border-gray-300 rounded-2xl bg-gray-50 text-center font-medium"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="tel"
                              value={mobileNumber}
                              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                              placeholder="Enter mobile number"
                              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-center">
                      <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSendOTP}
                    disabled={loading || (method === 'email' ? !email : !mobileNumber)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send Verification Code'
                    )}
                  </button>
                </motion.div>
              )}

              {/* Step 3: OTP Verification */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                      <KeyIcon className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-gray-600 mb-6">
                      We've sent a verification code to your {method === 'email' ? 'email' : 'mobile'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-center text-lg font-mono tracking-widest"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-center">
                      <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length !== 6}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </div>
                      ) : (
                        'Verify Code'
                      )}
                    </button>

                    <button
                      onClick={handleResendOTP}
                      disabled={loading || countdown > 0}
                      className="w-full py-3 px-6 rounded-2xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {countdown > 0 ? (
                        <div className="flex items-center">
                          <ClockIcon className="w-5 h-5 mr-2" />
                          Resend in {countdown}s
                        </div>
                      ) : (
                        'Resend Code'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Reset Password */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-gray-600 mb-6">
                      Create a new secure password for your account
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-center">
                      <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleResetPassword}
                    disabled={loading || !newPassword || !confirmPassword}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Resetting...
                      </div>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ForgotPasswordPopup; 