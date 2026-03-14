import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaPinterest } from 'react-icons/fa';

const SocialMediaIntegration = () => {
  const socialLinks = [
    {
      name: 'Facebook',
      icon: FaFacebook,
      url: 'https://facebook.com/gooofit',
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Follow us on Facebook for health tips and updates'
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: 'https://twitter.com/gooofit',
      color: 'bg-blue-400 hover:bg-blue-500',
      description: 'Get real-time updates and health insights on Twitter'
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      url: 'https://instagram.com/gooofit',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      description: 'Visual health inspiration and success stories on Instagram'
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      url: 'https://linkedin.com/company/gooofit',
      color: 'bg-blue-700 hover:bg-blue-800',
      description: 'Professional health and wellness insights on LinkedIn'
    },
    {
      name: 'YouTube',
      icon: FaYoutube,
      url: 'https://youtube.com/@gooofit',
      color: 'bg-red-600 hover:bg-red-700',
      description: 'Video tutorials and health education on YouTube'
    },
    {
      name: 'Pinterest',
      icon: FaPinterest,
      url: 'https://pinterest.com/gooofit',
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Health infographics and wellness inspiration on Pinterest'
    }
  ];

  const handleSocialClick = (platform, url) => {
    // Track social media clicks for analytics
    if (window.gtag) {
      window.gtag('event', 'social_click', {
        event_category: 'Social Media',
        event_label: platform,
        value: 1
      });
    }
    
    // Open social media link
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareContent = async (platform) => {
    const url = window.location.href;
    const title = 'GoooFit - Smart Weight Loss & Management Dashboard';
    const description = 'Track your weight loss journey with GoooFit – a smart, intuitive dashboard for your health, fitness, and wellness goals.';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(description)}`;
        break;
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Connect With GoooFit
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our community of health enthusiasts and get daily inspiration, 
            expert tips, and exclusive content to support your wellness journey.
          </p>
        </div>

        {/* Social Media Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {socialLinks.map((social) => {
            const IconComponent = social.icon;
            return (
              <div key={social.name} className="text-center">
                <button
                  onClick={() => handleSocialClick(social.name, social.url)}
                  className={`w-16 h-16 ${social.color} rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3 transition-all duration-300 transform hover:scale-110 hover:shadow-lg`}
                  aria-label={`Follow us on ${social.name}`}
                  title={social.description}
                >
                  <IconComponent />
                </button>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {social.name}
                </h3>
                <p className="text-xs text-gray-500 hidden lg:block">
                  {social.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Share Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Share GoooFit with Friends
          </h3>
          <p className="text-gray-600 mb-6">
            Help others discover the power of smart health tracking
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => shareContent('facebook')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <FaFacebook />
              Share on Facebook
            </button>
            <button
              onClick={() => shareContent('twitter')}
              className="bg-blue-400 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <FaTwitter />
              Share on Twitter
            </button>
            <button
              onClick={() => shareContent('linkedin')}
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <FaLinkedin />
              Share on LinkedIn
            </button>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Stay Updated with Health Tips
          </h3>
          <p className="text-gray-600 mb-6">
            Get weekly health insights, calculator tips, and success stories delivered to your inbox
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Join Thousands of Health Enthusiasts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-gray-600">Calculations Made</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaIntegration;
