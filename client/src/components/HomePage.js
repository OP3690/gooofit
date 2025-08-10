import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  SparklesIcon,
  CalculatorIcon,
  ScaleIcon,
  BeakerIcon,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/outline';
import ForgotPasswordPopup from './ForgotPasswordPopup';
import UserSuccessCards from './UserSuccessCards';
import { trackPageViewConversion } from './GoogleAnalytics';
import SEO from './SEO';

const HomePage = ({ onStartDemo, onRegister, onLogin }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

    // Wrapper functions with conversion tracking
  const handleRegister = () => {
    trackPageViewConversion();
    onRegister();
  };

  const handleLogin = () => {
    trackPageViewConversion();
    onLogin();
  };

  const handleStartDemo = () => {
    trackPageViewConversion();
    onStartDemo();
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: ChartBarIcon,
      title: "AI-Powered Analytics",
      description: "Track your weight loss progress with AI-powered insights and body composition analysis that adapts to your unique journey.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FlagIcon,
      title: "Personalized Weight Loss Plans",
      description: "Get customized weight loss strategies including intermittent fasting, high protein diets, and metabolic flexibility training.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: DevicePhoneMobileIcon,
      title: "Smart Weight Loss Apps",
      description: "Access your personalized weight loss dashboard anywhere with our mobile-optimized AI weight loss coach.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: ShieldCheckIcon,
      title: "Medical-Grade Security",
      description: "Your weight loss data is protected with enterprise-grade security. Your privacy is our top priority.",
      color: "from-indigo-500 to-blue-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Lost 15kg in 6 months with Intermittent Fasting",
      content: "GoooFit's AI-powered platform made my weight loss journey incredible. The intermittent fasting tracker and body composition analysis helped me understand my progress better than ever.",
      rating: 5,
      avatar: "🏃‍♀️"
    },
    {
      name: "Mike Chen",
      role: "Lost 8kg in 3 months with High Protein Diet",
      content: "The personalized weight loss plan feature is amazing. I love how it adapts my high protein diet and calorie deficit calculations to keep me on track.",
      rating: 5,
      avatar: "💪"
    },
    {
      name: "Emma Davis",
      role: "Lost 12kg in 4 months with Metabolic Flexibility Training",
      content: "Finally found an app that actually helps me stay consistent with my weight loss goals. The metabolic flexibility tracking and mindful eating features are perfect for my lifestyle.",
      rating: 5,
      avatar: "🎯"
    }
  ];

  const stats = [
    {
      number: "15,000+",
      label: "Active Weight Loss Users",
      icon: UserGroupIcon,
      color: "text-blue-500"
    },
    {
      number: "95%",
      label: "Success Rate",
      icon: TrophyIcon,
      color: "text-green-500"
    },
    {
      number: "50+",
      label: "Weight Loss Strategies",
      icon: ChartBarIcon,
      color: "text-purple-500"
    }
  ];

  const healthCalculators = [
    {
      icon: ScaleIcon,
      title: "BMI Calculator",
      description: "Calculate your Body Mass Index to assess your weight status and health risks.",
      color: "from-blue-500 to-cyan-500",
      features: ["Instant BMI calculation", "Weight category assessment", "Health risk evaluation"]
    },
    {
      icon: FireIcon,
      title: "Calorie Calculator",
      description: "Determine your daily calorie needs based on activity level and weight goals.",
      color: "from-orange-500 to-red-500",
      features: ["BMR calculation", "Activity level adjustment", "Weight goal planning"]
    },
    {
      icon: HeartIconSolid,
      title: "Body Fat Calculator",
      description: "Estimate your body fat percentage using proven measurement methods.",
      color: "from-purple-500 to-pink-500",
      features: ["Navy method calculation", "BMI method alternative", "Body composition analysis"]
    },
    {
      icon: CalculatorIcon,
      title: "BMR Calculator",
      description: "Calculate your Basal Metabolic Rate to understand your body's energy needs.",
      color: "from-green-500 to-emerald-500",
      features: ["Multiple formula options", "Activity level multipliers", "Daily calorie planning"]
    },
    {
      icon: BeakerIcon,
      title: "Carbohydrate Calculator",
      description: "Calculate your daily carbohydrate needs for optimal energy and health.",
      color: "from-indigo-500 to-blue-500",
      features: ["Carb calculations", "Energy planning", "Dietary recommendations"]
    },
    {
      icon: FireIcon,
      title: "Protein Calculator",
      description: "Determine your protein needs for muscle building and weight management.",
      color: "from-green-500 to-emerald-500",
      features: ["Protein calculations", "Muscle building", "Weight management"]
    },
    {
      icon: HeartIcon,
      title: "Fat Intake Calculator",
      description: "Calculate your daily fat intake for optimal health and nutrition.",
      color: "from-purple-500 to-pink-500",
      features: ["Fat calculations", "Health optimization", "Nutrition planning"]
    },
    {
      icon: SparklesIcon,
      title: "Vitamin Calculator",
      description: "Get personalized vitamin recommendations based on age and gender.",
      color: "from-yellow-500 to-orange-500",
      features: ["RDA calculations", "Vitamin information", "Health recommendations"]
    }
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

  const trendingTopics = [
    {
      icon: FireIcon,
      title: "Intermittent Fasting",
      description: "A revolutionary approach to weight loss that combines eating and fasting, offering numerous health benefits.",
      color: "from-orange-500 to-red-500",
      keywords: ["intermittent fasting", "16/8 fasting", "fasting diet", "fasting weight loss"]
    },
    {
      icon: BoltIcon,
      title: "High-Intensity Interval Training (HIIT)",
      description: "A fast-paced workout that burns calories and boosts metabolism, perfect for busy schedules.",
      color: "from-blue-500 to-cyan-500",
      keywords: ["HIIT", "high-intensity interval training", "workout", "burn calories"]
    },
    {
      icon: HeartIcon,
      title: "Mindful Eating",
      description: "Practicing mindful eating to reduce overeating and improve overall health and weight loss.",
      color: "from-purple-500 to-pink-500",
      keywords: ["mindful eating", "eating habits", "weight loss", "healthy eating"]
    },
    {
      icon: SparklesIcon,
      title: "Metabolic Flexibility",
      description: "Training your body to burn calories efficiently, regardless of your activity level.",
      color: "from-yellow-500 to-orange-500",
      keywords: ["metabolic flexibility", "fat loss", "weight loss", "exercise"]
    },
    {
      icon: ScaleIcon,
      title: "Body Composition Tracking",
      description: "Monitoring your body's fat, muscle, and water percentage to ensure optimal health and weight loss.",
      color: "from-indigo-500 to-blue-500",
      keywords: ["body composition", "weight loss", "fitness", "health"]
    },
    {
      icon: HeartIconSolid,
      title: "Calorie Deficit",
      description: "Understanding and achieving a calorie deficit is the cornerstone of weight loss.",
      color: "from-green-500 to-emerald-500",
      keywords: ["calorie deficit", "weight loss", "calories", "nutrition"]
    }
  ];

  return (
    <>
      <SEO
        title="GoooFit - #1 Weight Loss Platform | Lose Weight Fast with AI Coach"
        description="Transform your weight loss journey with GoooFit's AI-powered platform. Access intermittent fasting plans, high protein diets, and personalized weight loss programs. Track body composition and achieve sustainable results."
        canonical="https://gooofit.com/"
        keywords="weight loss, lose weight fast, intermittent fasting weight loss, high protein diet weight loss, personalized weight loss plan, body composition tracking, AI weight loss coach, sustainable weight loss habits, medical weight loss programs, metabolic flexibility training, calorie calculator weight loss, mindful eating weight loss, rapid weight loss diet plan, holistic weight management, BMI calculator, protein calculator, BMR calculator"
        schemaData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "GoooFit",
          "applicationCategory": "HealthApplication",
          "operatingSystem": "Web Browser",
          "description": "AI-powered weight loss and management platform",
          "url": "https://gooofit.com",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1247"
          },
          "featureList": [
            "AI-Powered Analytics",
            "Personalized Weight Loss Plans",
            "Body Composition Tracking",
            "Intermittent Fasting Tracker",
            "High Protein Diet Plans",
            "Calorie Calculator",
            "BMI Calculator",
            "Progress Analytics"
          ]
        }}
        articleData={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Transform Your Weight Loss Journey with AI-Powered Technology",
          "description": "Discover how GoooFit's AI-powered platform can help you achieve sustainable weight loss through personalized plans, body composition tracking, and intelligent insights.",
          "image": "https://gooofit.com/og-image.svg",
          "author": {
            "@type": "Organization",
            "name": "GoooFit"
          },
          "publisher": {
            "@type": "Organization",
            "name": "GoooFit",
            "logo": {
              "@type": "ImageObject",
              "url": "https://gooofit.com/logo.png"
            }
          },
          "datePublished": "2025-01-15",
          "dateModified": "2025-01-15",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://gooofit.com"
          }
        }}
      />
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
                href="#health-calculators" 
                className="text-gray-600 hover:text-orange-500 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Health Tools
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
                onClick={handleLogin}
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
                onClick={handleRegister}
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 text-orange-700 font-medium text-sm mb-4">
                <FireIcon className="w-4 h-4 mr-2" />
                Transform Your Life from Today
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight"
            >
              Transform Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-purple-600"> Weight Loss Journey</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-gray-600 mb-6 max-w-4xl mx-auto leading-relaxed"
            >
              Join thousands of users achieving sustainable weight loss with our AI-powered platform. 
              Access cutting-edge weight loss strategies including intermittent fasting, high protein diets, 
              and personalized plans. Track body composition and celebrate your progress with confidence.
            </motion.p>

            {/* --- Success Stories Section (IN HERO) --- */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col items-center justify-center mb-6"
            >
              <span className="inline-flex items-center px-3 py-1 mb-3 rounded-full bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 text-orange-700 font-semibold text-xs uppercase tracking-wider shadow-sm">
                <TrophyIcon className="w-4 h-4 mr-2" /> Success Stories
              </span>
              <div className="w-full max-w-3xl">
                <UserSuccessCards />
              </div>
            </motion.div>

            {/* --- END Success Stories Section --- */}

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            >
              <motion.button
                onClick={handleRegister}
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
                onClick={handleStartDemo}
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
              className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-600"
            >
              <motion.div 
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm"
                whileHover={{ scale: 1.05 }}
              >
                <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                <span className="font-medium">Secure & Private</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm"
                whileHover={{ scale: 1.05 }}
              >
                <StarIcon className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Free at the Moment</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm"
                whileHover={{ scale: 1.05 }}
              >
                <UserGroupIcon className="h-4 w-4 text-blue-500" />
                <span className="font-medium">1000+ Happy Users</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trending Keywords Section - SEO Boost */}
      <section className="py-16 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 text-green-700 font-medium text-sm mb-4">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Trending in 2025
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Latest Weight Loss Trends & Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay ahead with cutting-edge weight loss strategies and technologies that are transforming lives in 2025
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingTopics.map((topic, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${topic.color} shadow-lg group-hover:shadow-xl transition-all duration-300 mr-4`}>
                      <topic.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{topic.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">{topic.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {topic.keywords.map((keyword, keywordIndex) => (
                      <span 
                        key={keywordIndex}
                        className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-medium rounded-full border border-green-200"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
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

      {/* Health Calculator Section */}
      <section id="health-calculators" className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 text-blue-700 font-medium text-sm mb-4">
              <CalculatorIcon className="w-4 h-4 mr-2" />
              Free Health Tools
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Professional Weight Loss Calculators
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-4">
              Access our comprehensive suite of weight loss and fitness calculators designed by experts. 
              Get accurate calculations for BMI, calories, body fat, BMR, nutrition, and vitamins to support your weight loss journey.
            </p>
            <p className="text-sm text-gray-500 max-w-3xl mx-auto">
              All calculations are based on scientific research and public domain information. 
              For personalized medical advice, please consult healthcare professionals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {healthCalculators.map((calculator, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${calculator.color} shadow-lg group-hover:shadow-xl transition-all duration-300 mr-4`}>
                      <calculator.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{calculator.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">{calculator.description}</p>
                  <ul className="space-y-2 mb-6">
                    {calculator.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <motion.button
                      onClick={() => navigate(
                        calculator.title === 'BMI Calculator' ? '/bmi-calculator-page' : 
                        calculator.title === 'Calorie Calculator' ? '/calorie-calculator-page' : 
                        calculator.title === 'Body Fat Calculator' ? '/body-fat-calculator-page' : 
                        calculator.title === 'BMR Calculator' ? '/bmr-calculator-page' : 
                        calculator.title === 'Carbohydrate Calculator' ? '/carbohydrate-calculator-page' : 
                        calculator.title === 'Protein Calculator' ? '/protein-calculator-page' : 
                        calculator.title === 'Fat Intake Calculator' ? '/fat-intake-calculator-page' : 
                        calculator.title === 'Vitamin Calculator' ? '/vitamin-calculator-page' : 
                        '/health-calculator'
                      )}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg group-hover:shadow-xl"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Try Calculator
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* SEO-Friendly Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Why Use Our Health Calculators?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Scientifically Accurate</h4>
                <p className="text-sm text-gray-600">Based on peer-reviewed research and established medical formulas</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BoltIcon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Instant Results</h4>
                <p className="text-sm text-gray-600">Get accurate calculations instantly with our optimized algorithms</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">User-Friendly</h4>
                <p className="text-sm text-gray-600">Designed for everyone, from fitness beginners to health professionals</p>
              </div>
            </div>
          </motion.div>
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
            <h2 className="text-5xl font-bold text-white mb-6">Ready to Start Your Weight Loss Journey in 2025?</h2>
            <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of users who are already achieving sustainable weight loss with our AI-powered platform. 
              Access cutting-edge strategies like intermittent fasting, high protein diets, and personalized weight loss plans.
            </p>
            <motion.button
              onClick={handleRegister}
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
                Transform your weight loss journey in 2025 with our AI-powered platform. Track body composition, 
                access personalized weight loss plans, and achieve sustainable results with confidence.
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
                <li><a href="/blog" className="text-gray-400 hover:text-orange-500 transition-colors">Blog</a></li>
                <li><a href="/careers" className="text-gray-400 hover:text-orange-500 transition-colors">Careers</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-orange-500 transition-colors">Contact</a></li>
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
    </>
  );
};

export default HomePage; 