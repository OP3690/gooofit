const nodemailer = require('nodemailer');

// Log email configuration
console.log('📧 Email Configuration:');
console.log('   Transactional Emails: Gmail SMTP (Temporary)');
console.log('   Marketing Emails: SendMails.io API');
console.log('   Status: Ready for instant transactional email delivery');

// Generate OTP function
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Get country flag emoji
// Convert country code to country name
const getCountryName = (countryCode) => {
  const countryMap = {
    'IN': 'India',
    'US': 'United States',
    'UK': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'JP': 'Japan',
    'CN': 'China',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'ES': 'Spain',
    'IT': 'Italy',
    'NL': 'Netherlands',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'BE': 'Belgium',
    'PT': 'Portugal',
    'GR': 'Greece',
    'PL': 'Poland',
    'CZ': 'Czech Republic',
    'HU': 'Hungary',
    'RO': 'Romania',
    'BG': 'Bulgaria',
    'HR': 'Croatia',
    'SI': 'Slovenia',
    'SK': 'Slovakia',
    'EE': 'Estonia',
    'LV': 'Latvia',
    'LT': 'Lithuania',
    'IE': 'Ireland',
    'NZ': 'New Zealand',
    'ZA': 'South Africa',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'PE': 'Peru',
    'VE': 'Venezuela',
    'UY': 'Uruguay',
    'PY': 'Paraguay',
    'EC': 'Ecuador',
    'BO': 'Bolivia',
    'GY': 'Guyana',
    'SR': 'Suriname',
    'KR': 'South Korea',
    'KP': 'North Korea',
    'VN': 'Vietnam',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'SG': 'Singapore',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'TW': 'Taiwan',
    'HK': 'Hong Kong',
    'MO': 'Macau',
    'MN': 'Mongolia',
    'KZ': 'Kazakhstan',
    'UZ': 'Uzbekistan',
    'KG': 'Kyrgyzstan',
    'TJ': 'Tajikistan',
    'TM': 'Turkmenistan',
    'AF': 'Afghanistan',
    'PK': 'Pakistan',
    'BD': 'Bangladesh',
    'LK': 'Sri Lanka',
    'NP': 'Nepal',
    'BT': 'Bhutan',
    'MV': 'Maldives',
    'MM': 'Myanmar',
    'LA': 'Laos',
    'KH': 'Cambodia',
    'BN': 'Brunei',
    'TL': 'East Timor',
    'PG': 'Papua New Guinea',
    'FJ': 'Fiji',
    'WS': 'Samoa',
    'TO': 'Tonga',
    'VU': 'Vanuatu',
    'SB': 'Solomon Islands',
    'KI': 'Kiribati',
    'TV': 'Tuvalu',
    'NR': 'Nauru',
    'PW': 'Palau',
    'MH': 'Marshall Islands',
    'FM': 'Micronesia',
    'CK': 'Cook Islands',
    'NU': 'Niue',
    'TK': 'Tokelau',
    'AS': 'American Samoa',
    'GU': 'Guam',
    'MP': 'Northern Mariana Islands',
    'PF': 'French Polynesia',
    'NC': 'New Caledonia',
    'WF': 'Wallis and Futuna',
    'PN': 'Pitcairn',
    'BM': 'Bermuda',
    'KY': 'Cayman Islands',
    'TC': 'Turks and Caicos',
    'VG': 'British Virgin Islands',
    'VI': 'US Virgin Islands',
    'PR': 'Puerto Rico',
    'DO': 'Dominican Republic',
    'HT': 'Haiti',
    'JM': 'Jamaica',
    'CU': 'Cuba',
    'BS': 'Bahamas',
    'BB': 'Barbados',
    'TT': 'Trinidad and Tobago',
    'GD': 'Grenada',
    'VC': 'Saint Vincent',
    'LC': 'Saint Lucia',
    'AG': 'Antigua and Barbuda',
    'KN': 'Saint Kitts',
    'DM': 'Dominica',
    'MS': 'Montserrat',
    'AI': 'Anguilla',
    'AW': 'Aruba',
    'CW': 'Curacao',
    'SX': 'Sint Maarten',
    'BQ': 'Bonaire',
    'GL': 'Greenland',
    'IS': 'Iceland',
    'FO': 'Faroe Islands',
    'GS': 'South Georgia',
    'FK': 'Falkland Islands',
    'BV': 'Bouvet Island',
    'HM': 'Heard Island',
    'TF': 'French Southern Territories',
    'AQ': 'Antarctica',
    'Unknown': 'Unknown'
  };
  
  return countryMap[countryCode] || countryCode;
};

const getCountryFlag = (countryName) => {
  const countryFlags = {
    'India': '🇮🇳',
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Japan': '🇯🇵',
    'China': '🇨🇳',
    'Brazil': '🇧🇷',
    'Mexico': '🇲🇽',
    'Spain': '🇪🇸',
    'Italy': '🇮🇹',
    'Netherlands': '🇳🇱',
    'Sweden': '🇸🇪',
    'Norway': '🇳🇴',
    'Denmark': '🇩🇰',
    'Finland': '🇫🇮',
    'Switzerland': '🇨🇭',
    'Austria': '🇦🇹',
    'Belgium': '🇧🇪',
    'Portugal': '🇵🇹',
    'Greece': '🇬🇷',
    'Poland': '🇵🇱',
    'Czech Republic': '🇨🇿',
    'Hungary': '🇭🇺',
    'Romania': '🇷🇴',
    'Bulgaria': '🇧🇬',
    'Croatia': '🇭🇷',
    'Slovenia': '🇸🇮',
    'Slovakia': '🇸🇰',
    'Estonia': '🇪🇪',
    'Latvia': '🇱🇻',
    'Lithuania': '🇱🇹',
    'Ireland': '🇮🇪',
    'New Zealand': '🇳🇿',
    'South Africa': '🇿🇦',
    'Argentina': '🇦🇷',
    'Chile': '🇨🇱',
    'Colombia': '🇨🇴',
    'Peru': '🇵🇪',
    'Venezuela': '🇻🇪',
    'Uruguay': '🇺🇾',
    'Paraguay': '🇵🇾',
    'Ecuador': '🇪🇨',
    'Bolivia': '🇧🇴',
    'Guyana': '🇬🇾',
    'Suriname': '🇸🇷',
    'French Guiana': '🇬🇫',
    'Falkland Islands': '🇫🇰',
    'South Korea': '🇰🇷',
    'North Korea': '🇰🇵',
    'Vietnam': '🇻🇳',
    'Thailand': '🇹🇭',
    'Malaysia': '🇲🇾',
    'Singapore': '🇸🇬',
    'Indonesia': '🇮🇩',
    'Philippines': '🇵🇭',
    'Taiwan': '🇹🇼',
    'Hong Kong': '🇭🇰',
    'Macau': '🇲🇴',
    'Mongolia': '🇲🇳',
    'Kazakhstan': '🇰🇿',
    'Uzbekistan': '🇺🇿',
    'Kyrgyzstan': '🇰🇬',
    'Tajikistan': '🇹🇯',
    'Turkmenistan': '🇹🇲',
    'Afghanistan': '🇦🇫',
    'Pakistan': '🇵🇰',
    'Bangladesh': '🇧🇩',
    'Sri Lanka': '🇱🇰',
    'Nepal': '🇳🇵',
    'Bhutan': '🇧🇹',
    'Maldives': '🇲🇻',
    'Myanmar': '🇲🇲',
    'Laos': '🇱🇦',
    'Cambodia': '🇰🇭',
    'Brunei': '🇧🇳',
    'East Timor': '🇹🇱',
    'Papua New Guinea': '🇵🇬',
    'Fiji': '🇫🇯',
    'Samoa': '🇼🇸',
    'Tonga': '🇹🇴',
    'Vanuatu': '🇻🇺',
    'Solomon Islands': '🇸🇧',
    'Kiribati': '🇰🇮',
    'Tuvalu': '🇹🇻',
    'Nauru': '🇳🇷',
    'Palau': '🇵🇼',
    'Marshall Islands': '🇲🇭',
    'Micronesia': '🇫🇲',
    'Cook Islands': '🇨🇰',
    'Niue': '🇳🇺',
    'Tokelau': '🇹🇰',
    'American Samoa': '🇦🇸',
    'Guam': '🇬🇺',
    'Northern Mariana Islands': '🇲🇵',
    'French Polynesia': '🇵🇫',
    'New Caledonia': '🇳🇨',
    'Wallis and Futuna': '🇼🇫',
    'Pitcairn': '🇵🇳',
    'Easter Island': '🇨🇱',
    'Galapagos': '🇪🇨',
    'Bermuda': '🇧🇲',
    'Cayman Islands': '🇰🇾',
    'Turks and Caicos': '🇹🇨',
    'British Virgin Islands': '🇻🇬',
    'US Virgin Islands': '🇻🇮',
    'Puerto Rico': '🇵🇷',
    'Dominican Republic': '🇩🇴',
    'Haiti': '🇭🇹',
    'Jamaica': '🇯🇲',
    'Cuba': '🇨🇺',
    'Bahamas': '🇧🇸',
    'Barbados': '🇧🇧',
    'Trinidad and Tobago': '🇹🇹',
    'Grenada': '🇬🇩',
    'Saint Vincent': '🇻🇨',
    'Saint Lucia': '🇱🇨',
    'Antigua and Barbuda': '🇦🇬',
    'Saint Kitts': '🇰🇳',
    'Dominica': '🇩🇲',
    'Montserrat': '🇲🇸',
    'Anguilla': '🇦🇮',
    'Aruba': '🇦🇼',
    'Curacao': '🇨🇼',
    'Sint Maarten': '🇸🇽',
    'Bonaire': '🇧🇶',
    'Saba': '🇧🇶',
    'Saint Eustatius': '🇧🇶',
    'Greenland': '🇬🇱',
    'Iceland': '🇮🇸',
    'Faroe Islands': '🇫🇴',
    'Svalbard': '🇳🇴',
    'Jan Mayen': '🇳🇴',
    'Bouvet Island': '🇳🇴',
    'Peter I Island': '🇳🇴',
    'Queen Maud Land': '🇳🇴',
    'Antarctica': '🇦🇶',
    'South Georgia': '🇬🇸',
    'South Sandwich Islands': '🇬🇸',
    'Falkland Islands': '🇫🇰',
    'Bouvet Island': '🇧🇻',
    'Heard Island': '🇭🇲',
    'McDonald Islands': '🇭🇲',
    'French Southern Territories': '🇹🇫',
    'Kerguelen': '🇹🇫',
    'Crozet Islands': '🇹🇫',
    'Amsterdam Island': '🇹🇫',
    'Saint Paul Island': '🇹🇫',
    'Adelie Land': '🇹🇫',
    'Wilkes Land': '🇦🇶',
    'Victoria Land': '🇦🇶',
    'Ross Dependency': '🇳🇿',
    'Australian Antarctic Territory': '🇦🇺',
    'Chilean Antarctic Territory': '🇨🇱',
    'Argentine Antarctica': '🇦🇷',
    'British Antarctic Territory': '🇬🇧',
    'Queen Maud Land': '🇳🇴',
    'Peter I Island': '🇳🇴',
    'Bouvet Island': '🇳🇴',
    'South Orkney Islands': '🇬🇧',
    'South Shetland Islands': '🇬🇧',
    'Graham Land': '🇬🇧',
    'Palmer Land': '🇬🇧',
    'Ellsworth Land': '🇺🇸',
    'Marie Byrd Land': '🇺🇸',
    'Ross Sea': '🇳🇿',
    'Weddell Sea': '🇦🇶',
    'Amundsen Sea': '🇦🇶',
    'Bellingshausen Sea': '🇦🇶',
    'Davis Sea': '🇦🇺',
    'Mawson Sea': '🇦🇺',
    'Dumont d\'Urville Sea': '🇫🇷',
    'Cosmonauts Sea': '🇷🇺',
    'Lazarev Sea': '🇷🇺',
    'Riser-Larsen Sea': '🇷🇺',
    'Cooperation Sea': '🇷🇺',
    'Somov Sea': '🇷🇺',
    'Commonwealth Sea': '🇦🇺',
    'Unknown': '🌍'
  };
  
  return countryFlags[countryName] || '🌍';
};

// Gmail SMTP Configuration (Temporary for production)
const createGmailTransporter = (fromName = 'GoooFit') => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'onboarding.gooofit@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'yabi ffau orlt lguq'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send welcome email using Gmail SMTP for instant delivery
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient name
 * @returns {Promise<Object>} API response
 */
async function sendWelcomeEmail(to, name) {
  try {
    console.log('📧 Sending welcome email via Gmail SMTP...');
    
    const transporter = createGmailTransporter();
    
    const html = `
    <!DOCTYPE html>
      <html>
    <head>
        <meta charset="utf-8">
        <title>Welcome to GoooFit</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        </style>
    </head>
      <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #fff7ed;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);">
          <!-- Header with orange gradient -->
          <div style="background: linear-gradient(135deg, #ffb347 0%, #ffcc80 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">🎉 Welcome to GoooFit!</h1>
            <p style="color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 16px;">Your Health Journey Starts Here</p>
            </div>
            
            <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #b45309; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hi ${name || 'there'}! 👋</h2>
            
            <p style="color: #b45309; margin: 0 0 20px 0; font-size: 16px;">
              Thank you for joining GoooFit! We're excited to be part of your health and fitness journey. 
              Get ready to transform your life with our comprehensive health tools and personalized insights.
            </p>
            
            <!-- Features -->
            <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 12px; padding: 30px; margin: 30px 0;">
              <h3 style="color: #ea580c; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">🚀 What you can do with GoooFit:</h3>
              <ul style="color: #b45309; margin: 0; padding-left: 20px; font-size: 16px;">
                <li style="margin-bottom: 10px;"><strong>📊 Track Progress:</strong> Monitor your weight and health metrics</li>
                <li style="margin-bottom: 10px;"><strong>🧮 Health Calculators:</strong> BMI, Calories, Body Fat, BMR, and more</li>
                <li style="margin-bottom: 10px;"><strong>💡 Smart Insights:</strong> Get personalized recommendations</li>
                <li style="margin-bottom: 10px;"><strong>👥 Community:</strong> Join health enthusiasts worldwide</li>
                <li style="margin-bottom: 0;"><strong>🎯 Goal Setting:</strong> Set and achieve your fitness targets</li>
                    </ul>
                </div>
                
            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://gooofit.com" style="background: linear-gradient(135deg, #ffb347 0%, #ffcc80 100%); color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(255,179,71,0.15); transition: all 0.3s ease;">Start Your Journey</a>
                </div>
                
            <p style="color: #b45309; margin: 30px 0 0 0; font-size: 14px;">
              Ready to transform your health? Start by exploring our health calculators and tracking your progress!
                </p>
            </div>
            
            <!-- Footer -->
          <div style="background: #fff3e0; padding: 30px; text-align: center; border-top: 1px solid #ffe0b2;">
            <p style="color: #b45309; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">Best regards,</p>
            <p style="color: #b45309; margin: 0; font-size: 14px;">The GoooFit Team 💪</p>
            <div style="margin-top: 20px;">
              <a href="https://gooofit.com" style="color: #fb923c; text-decoration: none; font-size: 14px; font-weight: 500;">gooofit.com</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    
    const mailOptions = {
      from: `"GoooFit Team" <${process.env.EMAIL_USER || 'onboarding.gooofit@gmail.com'}>`,
      to: to,
      subject: 'Welcome to GoooFit! 🎉',
      html: html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully via Gmail SMTP');
    console.log('   Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      method: 'Gmail SMTP (Temporary)'
    };
    
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send password reset email using Gmail SMTP for instant delivery
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} name - Recipient name (optional)
 * @returns {Promise<Object>} API response
 */
async function sendPasswordResetEmail(to, resetToken, name = 'User') {
  try {
    console.log('📧 Sending password reset email via Gmail SMTP...');
    
    const transporter = createGmailTransporter();
    
    // Use OTP instead of token for better UX
    const resetUrl = `${process.env.CLIENT_URL || 'https://gooofit.com'}/reset-password?otp=${resetToken}`;
    
    const html = `
    <!DOCTYPE html>
      <html>
    <head>
        <meta charset="utf-8">
        <title>Password Reset - GoooFit</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        </style>
    </head>
      <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #fff7ed;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);">
          <!-- Header with orange gradient -->
          <div style="background: linear-gradient(135deg, #ffb347 0%, #ffcc80 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">🔐 Password Reset</h1>
            <p style="color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 16px;">GoooFit - Your Health Journey</p>
            </div>
            
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #b45309; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hi ${name || 'there'}! 👋</h2>
            
            <p style="color: #b45309; margin: 0 0 20px 0; font-size: 16px;">
              We received a request to reset your password for your GoooFit account.<br>
              To keep your account secure, we've generated a verification code for you.
            </p>
            
            <!-- OTP Display -->
            <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
              <p style="color: #fb923c; margin: 0 0 15px 0; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
              <div style="background: #fff; border-radius: 8px; padding: 20px; display: inline-block; border: 2px solid #ffb347;">
                <span style="font-size: 32px; font-weight: 700; color: #ea580c; letter-spacing: 4px; font-family: 'Courier New', monospace;">${resetToken}</span>
              </div>
                </div>
                
            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #ffb347 0%, #ffcc80 100%); color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(255,179,71,0.15); transition: all 0.3s ease;">Reset Password Now</a>
            </div>
            
            <!-- Security Notice -->
            <div style="background: #fff7ed; border-left: 4px solid #fb923c; padding: 16px; border-radius: 0 8px 8px 0; margin: 30px 0;">
              <p style="color: #b45309; margin: 0; font-size: 14px; font-weight: 500;">
                🔒 <strong>Security Notice:</strong> This verification code will expire in 1 hour for your security.
              </p>
            </div>
            
            <p style="color: #b45309; margin: 30px 0 0 0; font-size: 14px;">
              If you didn't request this password reset, please ignore this email.<br>
              Your account security is important to us.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #fff3e0; padding: 30px; text-align: center; border-top: 1px solid #ffe0b2;">
            <p style="color: #b45309; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">Best regards,</p>
            <p style="color: #b45309; margin: 0; font-size: 14px;">The GoooFit Team 💪</p>
            <div style="margin-top: 20px;">
              <a href="https://gooofit.com" style="color: #fb923c; text-decoration: none; font-size: 14px; font-weight: 500;">gooofit.com</a>
            </div>
            </div>
        </div>
    </body>
    </html>
    `;
    
    const mailOptions = {
      from: `"GoooFit Support" <${process.env.EMAIL_USER || 'onboarding.gooofit@gmail.com'}>`,
      to: to,
      subject: 'Password Reset Request - GoooFit',
      html: html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully via Gmail SMTP');
    console.log('   Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      method: 'Gmail SMTP (Temporary)'
    };
    
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send registration notification email using Gmail SMTP for instant delivery
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient name
 * @returns {Promise<Object>} API response
 */
async function sendRegistrationNotificationEmail(adminEmail, userName, userEmail, country = 'Unknown') {
  try {
    console.log('📧 Sending registration notification email via Gmail SMTP...');
    
    const transporter = createGmailTransporter();
    
    const html = `
    <!DOCTYPE html>
      <html>
    <head>
        <meta charset="utf-8">
        <title>New User Registration - GoooFit</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        </style>
    </head>
      <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #fff7ed;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);">
          <!-- Header with orange gradient -->
          <div style="background: linear-gradient(135deg, #ffb347 0%, #ffcc80 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">🎉 New User Registration</h1>
            <p style="color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 16px;">GoooFit - Admin Notification</p>
            </div>
            
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #b45309; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hello Admin! 👋</h2>
            
            <p style="color: #b45309; margin: 0 0 20px 0; font-size: 16px;">
              Great news! A new user has just joined the GoooFit community. 
              Here are the details of the new registration:
            </p>
            
            <!-- User Details -->
            <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 12px; padding: 30px; margin: 30px 0;">
              <h3 style="color: #ea580c; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">👤 New User Details:</h3>
              <div style="color: #b45309; font-size: 16px;">
                <p style="margin: 10px 0;"><strong>📝 Name:</strong> ${userName}</p>
                <p style="margin: 10px 0;"><strong>📧 Email:</strong> ${userEmail}</p>
                <p style="margin: 10px 0;"><strong>🌍 Country:</strong> ${getCountryFlag(getCountryName(country))} ${getCountryName(country)}</p>
                <p style="margin: 10px 0;"><strong>📅 Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p style="margin: 10px 0;"><strong>⏰ Registration Time:</strong> ${new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
                
            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://gooofit.com" style="background: linear-gradient(135deg, #ffb347 0%, #ffcc80 100%); color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(255,179,71,0.15); transition: all 0.3s ease;">View Dashboard</a>
                </div>
                
            <p style="color: #b45309; margin: 30px 0 0 0; font-size: 14px;">
              Welcome them to the GoooFit community and help them start their health journey!
            </p>
                </div>
                
          <!-- Footer -->
          <div style="background: #fff3e0; padding: 30px; text-align: center; border-top: 1px solid #ffe0b2;">
            <p style="color: #b45309; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">Best regards,</p>
            <p style="color: #b45309; margin: 0; font-size: 14px;">GoooFit Admin 🤖</p>
            <div style="margin-top: 20px;">
              <a href="https://gooofit.com" style="color: #fb923c; text-decoration: none; font-size: 14px; font-weight: 500;">gooofit.com</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    
    const mailOptions = {
      from: `"GoooFit Admin" <${process.env.EMAIL_USER || 'onboarding.gooofit@gmail.com'}>`,
      to: adminEmail,
      subject: 'New User Registration - GoooFit',
      html: html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Registration notification email sent successfully via Gmail SMTP');
    console.log('   Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      method: 'Gmail SMTP (Temporary)'
    };
    
  } catch (error) {
    console.error('❌ Failed to send registration notification email:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send contact form notification email to admin
 * @param {string} adminEmail - Admin email address
 * @param {string} userName - Name of the person submitting the form
 * @param {string} userEmail - Email of the person submitting the form
 * @param {string} subject - Subject of the message
 * @param {string} message - Message content
 * @returns {Promise<Object>} Email result
 */
async function sendContactNotificationEmail(adminEmail, userName, userEmail, subject, message) {
  try {
    console.log('📧 Sending contact form notification email via Gmail SMTP...');
    
    const transporter = createGmailTransporter();
    
    const html = `
    <!DOCTYPE html>
      <html>
    <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission - GoooFit</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        </style>
    </head>
      <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #fff7ed;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);">
          <!-- Header with orange gradient -->
          <div style="background: linear-gradient(135deg, #ffb347 0%, #ffcc80 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">📬 New Contact Form Submission</h1>
            <p style="color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 16px;">GoooFit - Admin Notification</p>
            </div>
            
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #b45309; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hello Admin! 👋</h2>
            
            <p style="color: #b45309; margin: 0 0 20px 0; font-size: 16px;">
              Someone has submitted a new message through the contact form. 
              Here are the details:
            </p>
            
            <!-- Contact Details -->
            <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 12px; padding: 30px; margin: 30px 0;">
              <h3 style="color: #ea580c; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📝 Contact Form Details:</h3>
              <div style="color: #b45309; font-size: 16px;">
                <p style="margin: 10px 0;"><strong>👤 Name:</strong> ${userName}</p>
                <p style="margin: 10px 0;"><strong>📧 Email:</strong> ${userEmail}</p>
                <p style="margin: 10px 0;"><strong>📋 Subject:</strong> ${subject}</p>
                <p style="margin: 10px 0;"><strong>📅 Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p style="margin: 10px 0;"><strong>⏰ Submission Time:</strong> ${new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            
            <!-- Message Content -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 30px; margin: 30px 0;">
              <h3 style="color: #d97706; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">💬 Message:</h3>
              <div style="color: #92400e; font-size: 16px; line-height: 1.8;">
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
                
            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${userEmail}" style="background: linear-gradient(135deg, #ffb347 0%, #ffcc80 100%); color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(255,179,71,0.15); transition: all 0.3s ease;">Reply to ${userName}</a>
                </div>
                
            <p style="color: #b45309; margin: 30px 0 0 0; font-size: 14px;">
              Please respond to this inquiry as soon as possible to provide excellent customer support!
            </p>
                </div>
                
          <!-- Footer -->
          <div style="background: #fff3e0; padding: 30px; text-align: center; border-top: 1px solid #ffe0b2;">
            <p style="color: #b45309; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">Best regards,</p>
            <p style="color: #b45309; margin: 0; font-size: 14px;">GoooFit Admin 🤖</p>
            <div style="margin-top: 20px;">
              <a href="https://gooofit.com" style="color: #fb923c; text-decoration: none; font-size: 14px; font-weight: 500;">gooofit.com</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    
    const mailOptions = {
      from: `"GoooFit Admin" <${process.env.EMAIL_USER || 'onboarding.gooofit@gmail.com'}>`,
      to: adminEmail,
      subject: `New Contact Form Submission: ${subject}`,
      html: html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Contact form notification email sent successfully via Gmail SMTP');
    console.log('   Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      method: 'Gmail SMTP (Temporary)'
    };
    
  } catch (error) {
    console.error('❌ Failed to send contact form notification email:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send generic email using Gmail SMTP for instant delivery
 * @param {Object} emailData - Email data object
 * @returns {Promise<Object>} API response
 */
async function sendEmail(emailData) {
  try {
    console.log('📧 Sending generic email via Gmail SMTP...');
    
    const transporter = createGmailTransporter();

    const mailOptions = {
      from: emailData.from || process.env.EMAIL_USER || 'onboarding.gooofit@gmail.com',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Generic email sent successfully via Gmail SMTP');
    console.log('   Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      method: 'Gmail SMTP (Temporary)'
    };
    
  } catch (error) {
    console.error('❌ Failed to send generic email:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test email service (Gmail SMTP only)
 * @returns {Promise<Object>} Test result
 */
async function testEmailService() {
  try {
    console.log('🧪 Testing email service (Gmail SMTP)...');
    
    // Test Gmail SMTP
    console.log('1️⃣ Testing Gmail SMTP...');
    const transporter = createGmailTransporter();
    const smtpTest = await transporter.verify();
    console.log('   SMTP Test:', smtpTest ? '✅ SUCCESS' : '❌ FAILED');
    
    return {
      success: smtpTest,
      smtp: { success: smtpTest },
      message: 'Email service test completed (Gmail SMTP only)'
    };
    
  } catch (error) {
    console.error('❌ Error testing email service:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendRegistrationNotificationEmail,
  sendContactNotificationEmail,
  sendEmail,
  testEmailService,
  generateOTP
}; 