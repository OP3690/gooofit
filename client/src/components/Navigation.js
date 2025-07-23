import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserIcon, 
  ChartBarIcon, 
  CalculatorIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navigation = ({ currentUser, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'BMI Calculator', href: '/bmi-calculator', icon: CalculatorIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  {/* Goal Achieved Logo */}
                  <div className="w-10 h-10 relative group-hover:scale-110 transition-transform duration-300">
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
                            <div className="absolute top-0 left-0 w-0.5 h-0.5 bg-green-600 rounded-full transform rotate-45"></div>
                            <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-green-600 rounded-full transform rotate-45"></div>
                            <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-green-600 rounded-full transform rotate-45"></div>
                            <div className="absolute top-1.5 left-1.5 w-0.5 h-0.5 bg-green-600 rounded-full transform rotate-45"></div>
                            <div className="absolute top-2 left-2 w-0.5 h-0.5 bg-green-600 rounded-full transform rotate-45"></div>
                          </div>
                        </div>
                        
                        {/* Success sparkles */}
                        <div className="absolute -top-0.5 -right-0.5 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping"></div>
                        <div className="absolute -bottom-0.5 -left-0.5 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
                        <div className="absolute -top-0.25 -left-0.25 w-0.25 h-0.25 bg-yellow-300 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent group-hover:from-green-700 group-hover:to-emerald-700 transition-all duration-300">
                  GoooFit
                </span>
              </Link>
            </div>
          </div>

          {/* User Menu, Navigation Links, and Mobile Menu Button - Right Aligned */}
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-2 transition-all duration-300 ${
                    isActive(item.href) ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                  {item.name}
                  
                  {/* Active indicator */}
                  {isActive(item.href) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>

            {/* User Info */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                Welcome, <span className="font-semibold text-gray-900">{currentUser?.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-600 bg-white hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 transition-all duration-300"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block mx-3 rounded-lg px-4 py-3 text-base font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <item.icon className={`h-5 w-5 mr-3 transition-all duration-300 ${
                    isActive(item.href) ? 'text-white' : 'text-gray-500'
                  }`} />
                  {item.name}
                </div>
              </Link>
            ))}
            
            {/* Mobile User Info and Logout */}
            <div className="pt-4 pb-3 border-t border-gray-100 mx-3">
              <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-900">{currentUser?.name}</div>
                  <div className="text-sm font-medium text-gray-500">{currentUser?.email}</div>
                </div>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-300"
                >
                  <div className="flex items-center">
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-gray-500" />
                    Logout
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 