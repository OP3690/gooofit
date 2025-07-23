import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  FlagIcon, 
  DevicePhoneMobileIcon, 
  ShieldCheckIcon,
  StarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  HeartIcon,
  BoltIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import ForgotPasswordPopup from './ForgotPasswordPopup';

const HomePage = ({ onStartDemo, onRegister, onLogin }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: ChartBarIcon,
      title: "Smart Analytics",
      description: "Track your progress with beautiful charts and AI-powered insights that help you understand your weight loss journey better.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FlagIcon,
      title: "Goal Setting",
      description: "Set personalized weight loss goals and track your progress with our intuitive dashboard and milestone celebrations.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: DevicePhoneMobileIcon,
      title: "Mobile Optimized",
      description: "Access your weight management dashboard anywhere, anytime with our mobile-responsive design.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: ShieldCheckIcon,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security. Your privacy is our top priority.",
      color: "from-indigo-500 to-blue-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Lost 15kg in 6 months",
      content: "GoooFit made my weight loss journey so much easier. The analytics helped me understand my patterns and stay motivated.",
      rating: 5,
      avatar: "🏃‍♀️"
    },
    {
      name: "Mike Chen",
      role: "Lost 8kg in 3 months",
      content: "The goal setting feature is amazing. I love how it celebrates my milestones and keeps me on track.",
      rating: 5,
      avatar: "💪"
    },
    {
      name: "Emma Davis",
      role: "Lost 12kg in 4 months",
      content: "Finally found an app that actually helps me stay consistent. The mobile experience is perfect for my busy lifestyle.",
      rating: 5,
      avatar: "🎯"
    }
  ];

  const stats = [
    { number: "100+", label: "Users Onboarded in Last 30 days", icon: UserGroupIcon, color: "text-blue-600" },
    { number: "4.7kg", label: "Average Weight Loss", icon: ArrowTrendingUpIcon, color: "text-green-600" },
    { number: "73.28%", label: "Users Updates Daily Weight", icon: HeartIcon, color: "text-red-600" }
  ];

  // Fitness Logo Component - Goal Achieved
  const FitnessLogo = () => (
    <div className="flex items-center space-x-2">
      <div className="relative">
        {/* Goal Achieved Logo */}
        <div className="w-10 h-10 relative">
          {/* Background circle with gradient */}
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg border-2 border-green-600 relative overflow-hidden">
            {/* Success sparkle effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            
            {/* Goal target design */}
            <div className="w-6 h-6 flex items-center justify-center relative">
              {/* Target rings */}
              <div className="w-5 h-5 relative">
                {/* Outer ring */}
                <div className="absolute inset-0 w-5 h-5 border-2 border-white rounded-full"></div>
                {/* Middle ring */}
                <div className="absolute inset-1 w-3 h-3 border-2 border-white rounded-full"></div>
                {/* Inner ring */}
                <div className="absolute inset-2 w-1 h-1 bg-white rounded-full"></div>
              </div>
              
              {/* Checkmark for achievement */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 relative">
                  {/* Checkmark stroke */}
                  <div className="absolute top-0 left-0 w-1 h-1 bg-green-600 rounded-full transform rotate-45"></div>
                  <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-green-600 rounded-full transform rotate-45"></div>
                  <div className="absolute top-1 left-1 w-1 h-1 bg-green-600 rounded-full transform rotate-45"></div>
                  <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-green-600 rounded-full transform rotate-45"></div>
                  <div className="absolute top-2 left-2 w-1 h-1 bg-green-600 rounded-full transform rotate-45"></div>
                </div>
              </div>
              
              {/* Success sparkles */}
              <div className="absolute -top-1 -right-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
              <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
              <div className="absolute -top-0.5 -left-0.5 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
            </div>
          </div>
        </div>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
        GoooFit
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <FitnessLogo />
              </motion.div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <motion.a 
                href="#features" 
                className="text-gray-600 hover:text-orange-500 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Features
              </motion.a>
              <motion.a 
                href="#testimonials" 
                className="text-gray-600 hover:text-orange-500 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Testimonials
              </motion.a>
              <motion.a 
                href="#about" 
                className="text-gray-600 hover:text-orange-500 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
              >
                About
              </motion.a>
              <motion.button
                onClick={onLogin}
                className="text-gray-600 hover:text-orange-500 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Login
              </motion.button>
              <motion.button
                onClick={() => setShowForgotPassword(true)}
                className="text-gray-600 hover:text-orange-500 transition-colors font-medium text-sm"
                whileHover={{ scale: 1.05 }}
              >
                Forgot Password?
              </motion.button>
              <motion.button
                onClick={onRegister}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-orange-200 to-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 text-orange-700 font-medium text-sm mb-6">
                <FireIcon className="w-4 h-4 mr-2" />
                Transform Your Life from Today
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-8xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Transform Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-purple-600"> Weight Loss Journey</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed"
            >
              Join thousands of users who are achieving their weight loss goals with confidence. 
              Track, analyze, and celebrate your progress with our intelligent weight management platform.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <motion.button
                onClick={onRegister}
                className="group bg-gradient-to-r from-orange-500 to-red-500 text-white px-10 py-5 rounded-full text-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-orange-500/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center">
                  Start Your Journey
                  <BoltIcon className="w-5 h-5 ml-2 group-hover:animate-pulse" />
                </span>
              </motion.button>
              <motion.button
                onClick={onStartDemo}
                className="border-2 border-orange-500 text-orange-600 px-10 py-5 rounded-full text-xl font-semibold hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Demo
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600"
            >
              <motion.div 
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
                whileHover={{ scale: 1.05 }}
              >
                <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                <span className="font-medium">Secure & Private</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
                whileHover={{ scale: 1.05 }}
              >
                <StarIcon className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Free at the Moment</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
                whileHover={{ scale: 1.05 }}
              >
                <UserGroupIcon className="h-5 w-5 text-blue-500" />
                <span className="font-medium">100+ Happy Users</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex justify-center mb-6">
                  <div className={`p-4 rounded-full bg-gradient-to-br ${stat.color.replace('text-', 'bg-')} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
                    <stat.icon className={`h-12 w-12 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-5xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-orange-50 via-red-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Why Choose GoooFit?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive weight management platform combines cutting-edge technology with user-friendly design to help you achieve your goals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      <feature.icon className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied users who have transformed their lives with GoooFit.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="text-3xl mr-4">{testimonial.avatar}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-orange-600 font-medium">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic leading-relaxed">"{testimonial.content}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-500/20 via-red-500/20 to-purple-600/20"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of users who are already achieving their weight loss goals with GoooFit.
            </p>
            <motion.button
              onClick={onRegister}
              className="bg-white text-orange-600 px-10 py-5 rounded-full text-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/25 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center">
                Get Started Today
                <TrophyIcon className="w-6 h-6 ml-2 group-hover:animate-bounce" />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <FitnessLogo />
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Transform your weight loss journey with our intelligent platform. Track, analyze, and celebrate your progress with confidence.
              </p>
              <div className="flex space-x-4">
                <motion.a 
                  href="#" 
                  className="text-gray-400 hover:text-orange-500 transition-colors p-2 rounded-full bg-gray-800 hover:bg-gray-700"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-gray-400 hover:text-orange-500 transition-colors p-2 rounded-full bg-gray-800 hover:bg-gray-700"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-gray-400 hover:text-orange-500 transition-colors p-2 rounded-full bg-gray-800 hover:bg-gray-700"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </motion.a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 GoooFit. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Forgot Password Popup */}
      <ForgotPasswordPopup
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => {
          setShowForgotPassword(false);
          onLogin();
        }}
      />

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default HomePage; 