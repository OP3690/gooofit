import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './NoSpinner.css';

// Context (needed immediately)
import { UserProvider } from './context/UserContext';

// Lazy-load heavy components to reduce initial bundle and TBT
const GoogleAnalytics = lazy(() => import('./components/GoogleAnalytics'));
const PerformanceMonitor = lazy(() => import('./components/PerformanceOptimizer').then(m => ({ default: m.PerformanceMonitor })));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Profile = lazy(() => import('./components/Profile'));
const Analytics = lazy(() => import('./components/Analytics'));
const Navigation = lazy(() => import('./components/Navigation'));
const Onboarding = lazy(() => import('./components/Onboarding'));
const BMICalculator = lazy(() => import('./components/BMICalculator'));
const BMICalculatorPage = lazy(() => import('./components/BMICalculatorPage'));
const BrandAssets = lazy(() => import('./components/BrandAssets'));
const CalorieCalculatorPage = lazy(() => import('./components/CalorieCalculatorPage'));
const BodyFatCalculatorPage = lazy(() => import('./components/BodyFatCalculatorPage'));
const BMRCalculatorPage = lazy(() => import('./components/BMRCalculatorPage'));
const CarbohydrateCalculatorPage = lazy(() => import('./components/CarbohydrateCalculatorPage'));
const ProteinCalculatorPage = lazy(() => import('./components/ProteinCalculatorPage'));
const FatIntakeCalculatorPage = lazy(() => import('./components/FatIntakeCalculatorPage'));
const VitaminCalculatorPage = lazy(() => import('./components/VitaminCalculatorPage'));
const HealthCalculator = lazy(() => import('./components/HealthCalculator'));
const HomePage = lazy(() => import('./components/HomePage'));
const Blog = lazy(() => import('./components/Blog'));
const BlogPost = lazy(() => import('./components/BlogPost'));
const Careers = lazy(() => import('./components/Careers'));
const MealTracker = lazy(() => import('./components/MealTracker'));
const Contact = lazy(() => import('./components/Contact'));

function PageFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="loading" aria-hidden="true" />
    </div>
  );
}

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
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    
    // Check for register parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('register') === 'true' && !savedUser) {
      setShowOnboarding(true);
      setOnboardingMode('register');
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check for login parameter in URL
    if (urlParams.get('login') === 'true' && !savedUser) {
      setShowOnboarding(true);
      setOnboardingMode('login');
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    setLoading(false);
  }, []); // Empty dependency array - only run once on mount

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
        <div className="text-center">
          <div className="loading mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <UserProvider value={{ currentUser, setCurrentUser: handleUserLogin, logout: handleUserLogout }}>
      <Suspense fallback={null}>
        <GoogleAnalytics />
        <PerformanceMonitor />
      </Suspense>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-purple-50 flex flex-col">
        <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Blog Routes - Accessible to everyone */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:blogSlug" element={<BlogPost />} />
          
          {/* Careers Route - Accessible to everyone */}
          <Route path="/careers" element={<Careers />} />
          
          {/* Contact Route - Only accessible to non-logged-in users */}
          {!currentUser && (
            <Route path="/contact" element={<Contact />} />
          )}
          
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
                <Route path="/meal-tracker" element={<MealTracker />} />

                <Route path="/bmi-calculator" element={<BMICalculator />} />
                <Route path="/health-calculator" element={<HealthCalculator />} />
                <Route path="/contact" element={<Navigate to="/" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
                </>
              } />
            </>
        )}

        {/* Public Calculator Routes - Accessible to everyone */}
        <Route path="/bmi-calculator-page" element={<BMICalculatorPage />} />
        <Route path="/calorie-calculator-page" element={<CalorieCalculatorPage />} />
        <Route path="/body-fat-calculator-page" element={<BodyFatCalculatorPage />} />
        <Route path="/bmr-calculator-page" element={<BMRCalculatorPage />} />
        <Route path="/carbohydrate-calculator-page" element={<CarbohydrateCalculatorPage />} />
        <Route path="/protein-calculator-page" element={<ProteinCalculatorPage />} />
        <Route path="/fat-intake-calculator-page" element={<FatIntakeCalculatorPage />} />
        <Route path="/vitamin-calculator-page" element={<VitaminCalculatorPage />} />
        
        {/* Brand Assets Route - Accessible to everyone */}
        <Route path="/brand-assets" element={<BrandAssets />} />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </Suspense>

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