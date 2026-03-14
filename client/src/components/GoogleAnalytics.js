import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views when route changes
    if (window.gtag) {
      window.gtag('config', 'G-6M2CW6E7B3', {
        page_path: location.pathname + location.search
      });
      
      // Also track for Google Ads
      window.gtag('config', 'AW-996988244', {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  return null;
};

// Helper function to track custom events
export const trackEvent = (action, category, label, value) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

// Helper function to track conversions
export const trackConversion = (conversionId, conversionLabel) => {
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `AW-996988244/${conversionId}/${conversionLabel}`
    });
  }
};

// Helper function to track page view conversions (from Google Ads snippet)
export const trackPageViewConversion = (url) => {
  if (window.gtag_report_conversion) {
    return window.gtag_report_conversion(url);
  }
  return false;
};

// Predefined tracking events for common actions
export const trackUserRegistration = () => {
  trackEvent('sign_up', 'engagement', 'user_registration');
  trackConversion('user_registration', 'sign_up');
  // Track page view conversion for registration
  trackPageViewConversion();
};

export const trackUserLogin = () => {
  trackEvent('login', 'engagement', 'user_login');
};

export const trackWeightEntry = () => {
  trackEvent('weight_entry', 'engagement', 'weight_tracking');
};

export const trackBMICalculation = () => {
  trackEvent('bmi_calculation', 'engagement', 'health_tools');
  // Track page view conversion for BMI calculation
  trackPageViewConversion();
};

export const trackPasswordReset = () => {
  trackEvent('password_reset', 'engagement', 'account_management');
};

export default GoogleAnalytics; 