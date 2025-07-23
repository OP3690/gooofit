const nodemailer = require('nodemailer');

// Create transporter with GoDaddy email credentials
const transporter = nodemailer.createTransport({
  host: 'smtpout.secureserver.net', // GoDaddy SMTP server
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'support@gooofit.com',
    pass: 'Fortune$$336699'
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true, // Enable debug output
  logger: true // Log to console
});

// Verify transporter configuration
const verifyTransporter = async () => {
  try {
    console.log('🔧 Verifying email transporter...');
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error);
    return false;
  }
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send Welcome Email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    console.log('🎉 Starting welcome email process...');
    console.log('📧 To:', userEmail);
    console.log('👤 User:', userName);
    
    // Verify transporter first
    const isVerified = await verifyTransporter();
    if (!isVerified) {
      throw new Error('Email transporter verification failed');
    }
    
    const welcomeEmailHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Welcome to GoooFit - Your personalized weight loss and fitness tracking platform. Start your health journey today with expert guidance and progress tracking.">
        <meta name="keywords" content="weight loss, fitness tracking, health goals, BMI calculator, progress monitoring, healthy lifestyle, weight management, fitness app">
        <meta name="author" content="GoooFit Team">
        <meta name="robots" content="noindex, nofollow">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="format-detection" content="telephone=no">
        <meta name="format-detection" content="date=no">
        <meta name="format-detection" content="address=no">
        <meta name="format-detection" content="email=no">
        <title>Welcome to GoooFit - Your Weight Loss Journey Begins</title>
        <!--[if mso]>
        <noscript>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
        </noscript>
        <![endif]-->
        <style type="text/css">
            /* Reset styles */
            body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
            
            /* Base styles */
            body {
                margin: 0 !important;
                padding: 0 !important;
                background-color: #f8f9fa !important;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                font-size: 16px !important;
                line-height: 1.6 !important;
                color: #333333 !important;
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
            }
            
            /* Container */
            .email-container {
                max-width: 600px !important;
                margin: 0 auto !important;
                background-color: #ffffff !important;
                border-radius: 12px !important;
                overflow: hidden !important;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
            }
            
            /* Header */
            .email-header {
                background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important;
                padding: 40px 30px !important;
                text-align: center !important;
                color: #ffffff !important;
            }
            
            .logo {
                font-size: 36px !important;
                font-weight: 700 !important;
                margin-bottom: 15px !important;
                letter-spacing: -1px !important;
            }
            
            .welcome-title {
                font-size: 28px !important;
                font-weight: 600 !important;
                margin: 0 !important;
                line-height: 1.3 !important;
            }
            
            .welcome-subtitle {
                font-size: 18px !important;
                margin: 10px 0 0 0 !important;
                opacity: 0.9 !important;
                font-weight: 400 !important;
            }
            
            /* Content */
            .email-content {
                padding: 40px 30px !important;
                background-color: #ffffff !important;
            }
            
            .greeting {
                font-size: 18px !important;
                margin-bottom: 25px !important;
                color: #2c3e50 !important;
            }
            
            .main-message {
                font-size: 16px !important;
                line-height: 1.7 !important;
                margin-bottom: 30px !important;
                color: #555555 !important;
            }
            
            /* Feature boxes */
            .feature-box {
                background-color: #f8f9fa !important;
                border-left: 4px solid #ff6b35 !important;
                padding: 20px !important;
                margin: 20px 0 !important;
                border-radius: 8px !important;
            }
            
            .feature-title {
                color: #ff6b35 !important;
                font-size: 18px !important;
                font-weight: 600 !important;
                margin: 0 0 12px 0 !important;
            }
            
            .feature-content {
                color: #555555 !important;
                font-size: 15px !important;
                line-height: 1.6 !important;
                margin: 0 !important;
            }
            
            .feature-list {
                margin: 15px 0 0 0 !important;
                padding-left: 20px !important;
            }
            
            .feature-list li {
                margin-bottom: 8px !important;
                color: #555555 !important;
            }
            
            /* CTA Button */
            .cta-section {
                text-align: center !important;
                margin: 35px 0 !important;
            }
            
            .cta-button {
                display: inline-block !important;
                background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important;
                color: #ffffff !important;
                text-decoration: none !important;
                padding: 16px 32px !important;
                border-radius: 50px !important;
                font-weight: 600 !important;
                font-size: 16px !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
                box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3) !important;
                transition: all 0.3s ease !important;
            }
            
            .cta-button:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4) !important;
            }
            
            /* Footer */
            .email-footer {
                background-color: #2c3e50 !important;
                color: #ffffff !important;
                padding: 30px !important;
                text-align: center !important;
            }
            
            .footer-content {
                font-size: 14px !important;
                line-height: 1.6 !important;
                margin: 0 !important;
            }
            
            .footer-links {
                margin: 20px 0 !important;
            }
            
            .footer-link {
                color: #ff6b35 !important;
                text-decoration: none !important;
                margin: 0 15px !important;
                font-size: 14px !important;
            }
            
            .footer-link:hover {
                text-decoration: underline !important;
            }
            
            .unsubscribe {
                font-size: 12px !important;
                color: #bdc3c7 !important;
                margin-top: 20px !important;
            }
            
            /* Responsive */
            @media only screen and (max-width: 600px) {
                .email-container {
                    margin: 0 !important;
                    border-radius: 0 !important;
                }
                
                .email-header, .email-content, .email-footer {
                    padding: 25px 20px !important;
                }
                
                .logo {
                    font-size: 28px !important;
                }
                
                .welcome-title {
                    font-size: 24px !important;
                }
                
                .welcome-subtitle {
                    font-size: 16px !important;
                }
                
                .cta-button {
                    padding: 14px 28px !important;
                    font-size: 15px !important;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="email-header">
                <div class="logo">GoooFit</div>
                <h1 class="welcome-title">Welcome to Your Health Journey!</h1>
                <p class="welcome-subtitle">Your personalized weight management platform</p>
            </div>
            
            <!-- Content -->
            <div class="email-content">
                <p class="greeting">Dear <strong>${userName}</strong>,</p>
                
                <p class="main-message">
                    Welcome to GoooFit! We're excited to have you join our community of health-conscious individuals. 
                    Your journey towards a healthier, more active lifestyle begins today.
                </p>
                
                <div class="feature-box">
                    <h3 class="feature-title">📊 Your Personalized Dashboard</h3>
                    <p class="feature-content">
                        You now have access to your comprehensive health tracking dashboard with:
                    </p>
                    <ul class="feature-list">
                        <li>Daily weight tracking and progress monitoring</li>
                        <li>BMI calculation and health metrics analysis</li>
                        <li>Personalized goal setting and achievement tracking</li>
                        <li>Visual progress charts and insights</li>
                        <li>Nutrition and exercise recommendations</li>
                    </ul>
                </div>
                
                <div class="feature-box">
                    <h3 class="feature-title">🎯 Start Strong, Stay Consistent</h3>
                    <p class="feature-content">
                        Remember, sustainable weight loss is a journey, not a destination. 
                        Small, consistent changes lead to lasting results. We're here to support 
                        you every step of the way with evidence-based guidance and motivation.
                    </p>
                </div>
                
                <div class="feature-box">
                    <h3 class="feature-title">🚀 Ready to Begin?</h3>
                    <p class="feature-content">
                        Your dashboard is ready and waiting. Log in now to start tracking your progress 
                        and take the first step towards achieving your health goals.
                    </p>
                </div>
                
                <div class="cta-section">
                    <a href="https://gooofit.com/dashboard" class="cta-button">Access Your Dashboard</a>
                </div>
                
                <p class="main-message">
                    If you have any questions or need assistance, our support team is here to help. 
                    Simply reply to this email or contact us through your dashboard.
                </p>
            </div>
            
            <!-- Footer -->
            <div class="email-footer">
                <p class="footer-content">
                    Thank you for choosing GoooFit for your health journey.
                </p>
                
                <div class="footer-links">
                    <a href="https://gooofit.com/privacy" class="footer-link">Privacy Policy</a>
                    <a href="https://gooofit.com/terms" class="footer-link">Terms of Service</a>
                    <a href="https://gooofit.com/support" class="footer-link">Support</a>
                </div>
                
                <p class="footer-content">
                    © 2024 GoooFit. All rights reserved.<br>
                    This email was sent to you because you registered for a GoooFit account.
                </p>
                
                <p class="unsubscribe">
                    If you no longer wish to receive these emails, you can 
                    <a href="https://gooofit.com/unsubscribe" style="color: #ff6b35; text-decoration: none;">unsubscribe here</a>.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
    
    const mailOptions = {
      from: '"GoooFit" <support@gooofit.com>',
      to: userEmail,
      subject: 'Welcome to GoooFit - Your Health Journey Begins',
      html: welcomeEmailHTML,
      text: `Welcome to GoooFit, ${userName}!

We're excited to have you join our community of health-conscious individuals. Your journey towards a healthier, more active lifestyle begins today.

Your personalized dashboard is now ready with:
- Daily weight tracking and progress monitoring
- BMI calculation and health metrics analysis
- Personalized goal setting and achievement tracking
- Visual progress charts and insights
- Nutrition and exercise recommendations

Access your dashboard: https://gooofit.com/dashboard

Remember, sustainable weight loss is a journey, not a destination. Small, consistent changes lead to lasting results.

If you have any questions or need assistance, our support team is here to help.

Best regards,
The GoooFit Team

---
This email was sent to you because you registered for a GoooFit account.
To unsubscribe, visit: https://gooofit.com/unsubscribe`
    };

    console.log('📤 Sending welcome email...');
    console.log('📧 From:', mailOptions.from);
    console.log('📧 To:', mailOptions.to);
    console.log('📧 Subject:', mailOptions.subject);

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Welcome email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Response:', result.response);
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
    
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response
    });
    
    throw new Error(`Welcome email failed: ${error.message}`);
  }
};

// Send Password Reset Email
const sendPasswordResetEmail = async (userEmail, userName, otp) => {
  try {
    console.log('🔐 Starting password reset email process...');
    console.log('📧 To:', userEmail);
    console.log('👤 User:', userName);
    
    // Verify transporter first
    const isVerified = await verifyTransporter();
    if (!isVerified) {
      throw new Error('Email transporter verification failed');
    }
    
    const resetEmailHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - GoooFit</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background-color: #ffffff;
                border-radius: 15px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #ff6b35;
                margin-bottom: 10px;
            }
            .otp-box {
                background-color: #f8f9fa;
                border: 2px solid #ff6b35;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
            }
            .otp-code {
                font-size: 32px;
                font-weight: bold;
                color: #ff6b35;
                letter-spacing: 5px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">GoooFit</div>
                <h1>Password Reset Request</h1>
            </div>
            
            <div class="content">
                <p>Dear <strong>${userName}</strong>,</p>
                
                <p>We received a request to reset your password for your GoooFit account.</p>
                
                <div class="otp-box">
                    <h3>Your Verification Code</h3>
                    <div class="otp-code">${otp}</div>
                    <p>Enter this code in the app to reset your password.</p>
                </div>
                
                <p><strong>Important:</strong></p>
                <ul>
                    <li>This code will expire in 10 minutes</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>For security, never share this code with anyone</li>
                </ul>
                
                <p>If you have any questions, please contact our support team.</p>
            </div>
            
            <div class="footer">
                <p>Thank you for using GoooFit!</p>
                <p>© 2024 GoooFit. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
    
    const mailOptions = {
      from: '"GoooFit Support" <support@gooofit.com>',
      to: userEmail,
      subject: 'Password Reset Code - GoooFit 🔐',
      html: resetEmailHTML,
      text: `Password Reset Request\n\nDear ${userName},\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this reset, please ignore this email.\n\nBest regards,\nThe GoooFit Team`
    };

    console.log('📤 Sending password reset email...');
    console.log('📧 From:', mailOptions.from);
    console.log('📧 To:', mailOptions.to);
    console.log('📧 Subject:', mailOptions.subject);

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Password reset email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Response:', result.response);
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
    
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response
    });
    
    throw new Error(`Password reset email failed: ${error.message}`);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  generateOTP,
  verifyTransporter
}; 