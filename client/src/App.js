import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import './NoSpinner.css';

// Google Analytics
import GoogleAnalytics from './components/GoogleAnalytics';

// Components
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Analytics from './components/Analytics';

import Navigation from './components/Navigation';
import Onboarding from './components/Onboarding';
import BMICalculator from './components/BMICalculator';
import HomePage from './components/HomePage';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';

// Context
import { UserProvider } from './context/UserContext';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState('register'); // 'register' or 'login'

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    
    // Check for register parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('register') === 'true' && !currentUser) {
      setShowOnboarding(true);
      setOnboardingMode('register');
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    setLoading(false);
  }, [currentUser]);

  const handleUserLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setShowOnboarding(false); // Close the modal after successful login
    toast.success(`Welcome back, ${user.name}!`);
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully');
    // Redirect to homepage after logout
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <UserProvider value={{ currentUser, setCurrentUser: handleUserLogin, logout: handleUserLogout }}>
      <GoogleAnalytics />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-purple-50 flex flex-col">
        <Routes>
          {/* Blog Routes - Accessible to everyone */}
          <Route path="/blog" element={<Blog />} />
                            <Route path="/blog/:blogSlug" element={<BlogPost />} />
          
          {/* Home Page - Only show when not logged in */}
          {!currentUser && (
            <Route path="/" element={
              <HomePage
                onStartDemo={() => handleUserLogin({ id: 'demo', name: 'Demo User' })}
                onRegister={() => { setShowOnboarding(true); setOnboardingMode('register'); }}
                onLogin={() => { setShowOnboarding(true); setOnboardingMode('login'); }}
              />
            } />
          )}

          {/* Main App Content - Only show when logged in */}
          {currentUser && (
            <>
              {/* Navigation for logged-in users */}
              <Route path="/*" element={
                <>
                  <Navigation currentUser={currentUser} onLogout={handleUserLogout} />
                  <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/bmi-calculator" element={<BMICalculator />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </>
              } />
            </>
          )}
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Onboarding Modal */}
        {showOnboarding && (
          <Onboarding
            onSuccess={handleUserLogin}
            onClose={() => setShowOnboarding(false)}
            initialMode={onboardingMode}
          />
        )}
      </div>
    </UserProvider>
  );
}

export default App; 