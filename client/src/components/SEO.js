import { useEffect } from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  canonical, 
  ogImage, 
  ogType = 'website',
  twitterCard = 'summary_large_image',
  schemaData = null,
  articleData = null,
  breadcrumbData = null
}) => {
  const defaultTitle = 'GoooFit - Smart Weight Loss & Management Dashboard for Your Goals';
  const defaultDescription = 'Track your weight loss journey with GoooFit – a smart, intuitive dashboard for your health, fitness, and wellness goals. Calculate BMI, track calories, and achieve sustainable weight management.';
  const defaultKeywords = 'weight loss, weight management, health dashboard, fitness tracker, BMI calculator, calorie calculator, health goals, wellness, nutrition tracking, protein calculator, body fat calculator, BMR calculator, intermittent fasting, high protein diet, AI weight loss coach';
  const defaultCanonical = 'https://gooofit.com';
  const defaultOgImage = 'https://gooofit.com/og-image.svg';

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;
  const finalCanonical = canonical || defaultCanonical;
  const finalOgImage = ogImage || defaultOgImage;

  // Default Organization Schema
  const defaultOrganizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GoooFit",
    "url": "https://gooofit.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://gooofit.com/android-chrome-512x512.png",
      "width": 512,
      "height": 512,
      "caption": "GoooFit Logo"
    },
    "image": {
      "@type": "ImageObject",
      "url": "https://gooofit.com/android-chrome-512x512.png",
      "width": 512,
      "height": 512,
      "caption": "GoooFit Logo"
    },
    "description": "Smart weight loss and management dashboard for your health goals",
    "sameAs": [
      "https://twitter.com/gooofit",
      "https://facebook.com/gooofit",
      "https://instagram.com/gooofit"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@gooofit.com"
    }
  };

  // Logo Schema for Google Knowledge Graph
  const logoSchema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": "GoooFit Logo",
    "description": "Official GoooFit logo and brand identity",
    "url": "https://gooofit.com/android-chrome-512x512.png",
    "width": 512,
    "height": 512,
    "thumbnailUrl": "https://gooofit.com/favicon-32x32.png",
    "thumbnail": {
      "@type": "ImageObject",
      "url": "https://gooofit.com/favicon-32x32.png",
      "width": 32,
      "height": 32
    },
    "representativeOfPage": true,
    "license": "https://gooofit.com/terms",
    "creator": {
      "@type": "Organization",
      "name": "GoooFit"
    }
  };

  // Default Website Schema
  const defaultWebsiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GoooFit",
    "url": "https://gooofit.com",
    "description": "Smart weight loss and management dashboard",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://gooofit.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  // Default Breadcrumb Schema
  const defaultBreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://gooofit.com"
      }
    ]
  };

  useEffect(() => {
    // Update document title
    document.title = finalTitle;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', finalDescription);
    }
    
    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', finalCanonical);
    }
  }, [finalTitle, finalDescription, finalCanonical]);

  // Combine all schema data
  const allSchemaData = [
    defaultOrganizationSchema,
    defaultWebsiteSchema,
    defaultBreadcrumbSchema,
    logoSchema,
    ...(schemaData ? [schemaData] : []),
    ...(articleData ? [articleData] : []),
    ...(breadcrumbData ? [breadcrumbData] : [])
  ];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={finalCanonical} />
      
      {/* Enhanced SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content="GoooFit" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="coverage" content="Worldwide" />
      <meta name="target" content="all" />
      <meta name="HandheldFriendly" content="true" />
      
      {/* Mobile and Viewport Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="GoooFit" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalTitle} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalOgImage} />
      <meta name="twitter:site" content="@gooofit" />
      <meta name="twitter:creator" content="@gooofit" />
      
      {/* Additional Social Media Meta Tags */}
      <meta name="twitter:label1" content="Est. reading time" />
      <meta name="twitter:data1" content="5 minutes" />
      
      {/* Schema.org Structured Data */}
      {allSchemaData.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
      
      {/* Preconnect only for origins requested early; removed unused hints (Lighthouse) */}
    </Helmet>
  );
};

export default SEO;
