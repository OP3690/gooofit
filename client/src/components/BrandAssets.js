import React from 'react';
import SEO from './SEO';

const BrandAssets = () => {
  const logoFiles = [
    {
      name: 'GoooFit Logo - High Resolution',
      format: 'PNG',
      size: '512x512',
      url: '/android-chrome-512x512.png',
      description: 'High-resolution logo for print and digital use'
    },
    {
      name: 'GoooFit Logo - Mobile',
      format: 'PNG',
      size: '192x192',
      url: '/android-chrome-192x192.png',
      description: 'Mobile-optimized logo for Android devices'
    },
    {
      name: 'GoooFit Logo - Standard',
      format: 'PNG',
      size: '32x32',
      url: '/favicon-32x32.png',
      description: 'Standard favicon for web browsers'
    },
    {
      name: 'GoooFit Logo - Small',
      format: 'PNG',
      size: '16x16',
      url: '/favicon-16x16.png',
      description: 'Small favicon for compact displays'
    },
    {
      name: 'GoooFit Logo - Apple',
      format: 'PNG',
      size: '180x180',
      url: '/apple-touch-icon.png',
      description: 'Apple touch icon for iOS devices'
    },
    {
      name: 'GoooFit Logo - Vector',
      format: 'SVG',
      size: 'Scalable',
      url: '/favicon.svg',
      description: 'Scalable vector logo for any size'
    },
    {
      name: 'GoooFit Logo - ICO',
      format: 'ICO',
      size: '16x16, 32x32',
      url: '/favicon.ico',
      description: 'Traditional favicon format'
    }
  ];

  return (
    <>
      <SEO
        title="GoooFit Brand Assets & Logo Downloads | Official Brand Resources"
        description="Download official GoooFit logo files in multiple formats and sizes. High-resolution PNG, SVG vector, and favicon files for your projects."
        canonical="https://gooofit.com/brand-assets"
        keywords="GoooFit logo, brand assets, logo download, favicon, brand resources, weight loss platform logo"
        schemaData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "GoooFit Brand Assets",
          "description": "Official GoooFit logo files and brand resources",
          "url": "https://gooofit.com/brand-assets",
          "mainEntity": {
            "@type": "ImageGallery",
            "name": "GoooFit Logo Collection",
            "description": "Complete collection of GoooFit logo files",
            "image": logoFiles.map(file => ({
              "@type": "ImageObject",
              "name": file.name,
              "description": file.description,
              "url": `https://gooofit.com${file.url}`,
              "width": file.size.includes('x') ? parseInt(file.size.split('x')[0]) : 512,
              "height": file.size.includes('x') ? parseInt(file.size.split('x')[1]) : 512
            }))
          }
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              GoooFit Brand Assets
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Download official GoooFit logo files in multiple formats and sizes. 
              Use these assets to represent our brand consistently across all platforms.
            </p>
          </div>

          {/* Logo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {logoFiles.map((file, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="text-center">
                  <img 
                    src={file.url} 
                    alt={file.name}
                    className="mx-auto mb-4 max-w-full h-auto"
                    style={{ 
                      maxHeight: file.size.includes('x') ? 
                        Math.min(parseInt(file.size.split('x')[1]), 200) : 200 
                    }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {file.format} • {file.size}
                  </p>
                  <p className="text-gray-600 mb-4 text-sm">
                    {file.description}
                  </p>
                  <a
                    href={file.url}
                    download
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Download {file.format}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Brand Guidelines */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Brand Guidelines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Logo Usage
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Maintain clear space around the logo</li>
                  <li>• Use high-resolution versions for print</li>
                  <li>• Don't modify colors or proportions</li>
                  <li>• Ensure good contrast on backgrounds</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Color Palette
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded mr-3"></div>
                    <span className="text-gray-600">Primary Blue: #0ea5e9</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-900 rounded mr-3"></div>
                    <span className="text-gray-600">Dark: #111827</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded mr-3"></div>
                    <span className="text-gray-600">Light: #f3f4f6</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Need Custom Logo Files?
            </h2>
            <p className="text-gray-600 mb-6">
              If you need logo files in specific formats or sizes not listed above, 
              please contact our team.
            </p>
            <a
              href="/contact"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrandAssets;
