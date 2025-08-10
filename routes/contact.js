const express = require('express');
const router = express.Router();
// const emailService = require('../services/emailService');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Contact route is working!' });
});

// POST /api/contact - Handle contact form submissions
router.post('/', async (req, res) => {
  console.log('📝 Contact form submission received:', req.body);
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate message length
    if (message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters long'
      });
    }

    // Create email content with beautiful HTML template
    const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission - GoooFit</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #f97316 0%, #8b5cf6 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .content {
            padding: 40px 30px;
          }
          .form-details {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
          }
          .form-details h2 {
            color: #1e293b;
            margin: 0 0 20px 0;
            font-size: 20px;
            font-weight: 600;
          }
          .detail-row {
            display: flex;
            margin-bottom: 15px;
            align-items: flex-start;
          }
          .detail-row:last-child {
            margin-bottom: 0;
          }
          .detail-label {
            font-weight: 600;
            color: #475569;
            min-width: 80px;
            margin-right: 15px;
          }
          .detail-value {
            color: #1e293b;
            flex: 1;
          }
          .message-box {
            background-color: #f1f5f9;
            border-left: 4px solid #f97316;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin-top: 20px;
          }
          .message-box h3 {
            margin: 0 0 15px 0;
            color: #1e293b;
            font-size: 18px;
            font-weight: 600;
          }
          .message-content {
            color: #475569;
            line-height: 1.7;
            white-space: pre-wrap;
          }
          .footer {
            background-color: #1e293b;
            color: white;
            text-align: center;
            padding: 25px;
            font-size: 14px;
          }
          .footer a {
            color: #f97316;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
          .timestamp {
            color: #94a3b8;
            font-size: 12px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 New Contact Form Submission</h1>
            <p>Someone has reached out through your GoooFit website</p>
          </div>
          
          <div class="content">
            <div class="form-details">
              <h2>📋 Contact Details</h2>
              
              <div class="detail-row">
                <div class="detail-label">Name:</div>
                <div class="detail-value">${name}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">
                  <a href="mailto:${email}" style="color: #f97316; text-decoration: none;">${email}</a>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Subject:</div>
                <div class="detail-value">${subject}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Time:</div>
                <div class="detail-value">${new Date().toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}</div>
              </div>
            </div>
            
            <div class="message-box">
              <h3>💬 Message</h3>
              <div class="message-content">${message}</div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #64748b; margin-bottom: 15px;">
                <strong>Quick Actions:</strong>
              </p>
              <div style="display: inline-block; background-color: #f1f5f9; padding: 15px; border-radius: 8px;">
                <a href="mailto:${email}?subject=Re: ${subject}" 
                   style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
                  📧 Reply to ${name}
                </a>
                <a href="mailto:${email}?subject=Re: ${subject}&body=Hi ${name},%0D%0A%0D%0AThank you for contacting GoooFit. We have received your message and will get back to you soon.%0D%0A%0D%0ABest regards,%0DGoooFit Team" 
                   style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
                  ✨ Send Auto-Reply
                </a>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>This message was sent from your GoooFit website contact form</p>
            <p><a href="https://gooofit.com">gooofit.com</a> | <a href="mailto:support@gooofit.com">support@gooofit.com</a></p>
            <div class="timestamp">
              Sent on ${new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
              })}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to admin
    // const adminEmail = process.env.ADMIN_EMAIL || 'admin@gooofit.com';
    
    // try {
    //   await emailService.sendEmail({
    //     to: adminEmail,
    //     subject: `New Contact Form Submission: ${subject}`,
    //     html: emailContent,
    //     text: `
    // New Contact Form Submission

    // Name: ${name}
    // Email: ${email}
    // Subject: ${subject}
    // Time: ${new Date().toLocaleString()}

    // Message:
    // ${message}

    // ---
    // Sent from GoooFit website contact form
    //     `.trim()
    //   });
    //   console.log('✅ Admin notification email sent successfully');
    // } catch (emailError) {
    //   console.error('❌ Failed to send admin notification email:', emailError);
    //   // Continue with the process
    // }

    // Send confirmation email to user
    const userConfirmationEmail = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Message Received - GoooFit</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #f97316 0%, #8b5cf6 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          .message {
            color: #475569;
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 30px;
          }
          .footer {
            background-color: #1e293b;
            color: white;
            text-align: center;
            padding: 25px;
            font-size: 14px;
          }
          .footer a {
            color: #f97316;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Message Received!</h1>
          </div>
          
          <div class="content">
            <div class="icon">📧</div>
            <h2 style="color: #1e293b; margin-bottom: 20px;">Thank you for contacting GoooFit!</h2>
            <div class="message">
              <p>Hi <strong>${name}</strong>,</p>
              <p>We have received your message and appreciate you taking the time to reach out to us.</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p>Our team will review your message and get back to you within 24 hours.</p>
              <p>In the meantime, feel free to explore our platform and continue your fitness journey!</p>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0;">What happens next?</h3>
              <ul style="text-align: left; color: #475569; margin: 0; padding-left: 20px;">
                <li>We'll review your message within 24 hours</li>
                <li>You'll receive a detailed response from our team</li>
                <li>We may follow up with additional questions if needed</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated confirmation from GoooFit</p>
            <p><a href="https://gooofit.com">gooofit.com</a> | <a href="mailto:support@gooofit.com">support@gooofit.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send confirmation email to user
    // try {
    //   await emailService.sendEmail({
    //     to: email,
    //     subject: 'Message Received - GoooFit',
    //     html: userConfirmationEmail,
    //     text: `
    // Thank you for contacting GoooFit!

    // Hi ${name},

    // We have received your message and appreciate you taking the time to reach out to us.

    // Subject: ${subject}

    // Our team will review your message and get back to you within 24 hours.

    // In the meantime, feel free to explore our platform and continue your fitness journey!

    // What happens next?
    // - We'll review your message within 24 hours
    // - You'll receive a detailed response from our team
    // - We may follow up with additional questions if needed

    // ---
    // GoooFit Team
    // gooofit.com
    //     `.trim()
    //   });
    //   console.log('✅ User confirmation email sent successfully');
    // } catch (emailError) {
    //   console.error('❌ Failed to send user confirmation email:', emailError);
    //   // Continue with the process
    // }

    // Send notification email to admin (omprakashutaha@gmail.com)
    // try {
    //   console.log('📧 Sending contact form notification to admin...');
      
    //   const adminNotificationResult = await emailService.sendContactNotificationEmail(
    //     'omprakashutaha@gmail.com', // Admin email
    //     name,
    //     email,
    //     subject,
    //     message
    //   );
      
    //   console.log('✅ Contact form notification email sent to admin!');
    //   console.log('📧 Notification result:', adminNotificationResult);
      
    // } catch (notificationError) {
    //   console.error('❌ Failed to send contact form notification email:', notificationError);
    //   console.error('❌ Error stack:', notificationError.stack);
      
    //   // Don't fail the contact form submission if admin notification fails
    //   // The user has already received their confirmation email
    //   console.log('⚠️ Continuing with contact form submission despite admin notification failure');
    // }

    res.json({
      success: true,
      message: 'Message sent successfully! We\'ll get back to you soon.'
    });

  } catch (error) {
    console.error('Error sending contact form:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: `Something went wrong! ${error.message}`
    });
  }
});

module.exports = router;
