const axios = require('axios');

// SendMails.io API Configuration
const SENDMAILS_API_BASE = 'https://app.sendmails.io/api/v1';
const SENDMAILS_API_TOKEN = '9XYiI42Ccb70jqlRbmMqx537XvdIFLPkNafyshOHPf6kk02JCPdalA4b8ivt';

// Create axios instance with default config
const sendMailsAPI = axios.create({
  baseURL: SENDMAILS_API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Send welcome email via SendMails.io API
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient name
 * @returns {Promise<Object>} API response
 */
async function sendWelcomeEmail(to, name) {
  try {
    console.log('📧 SendMails.io: Sending welcome email to', to);
    
    // First, create or get a list
    console.log('   Creating/getting list...');
    const listData = {
      api_token: SENDMAILS_API_TOKEN,
      name: 'GoooFit Users',
      description: 'GoooFit application users',
      from_email: 'support@gooofit.com',
      from_name: 'GoooFit Team'
    };
    
    let listResponse;
    try {
      listResponse = await sendMailsAPI.post('/lists', listData);
      console.log('   List created:', listResponse.data);
    } catch (error) {
      console.log('   List creation failed, trying to get existing lists...');
      // If list creation fails, try to get existing lists
      const listsResponse = await sendMailsAPI.get('/lists', {
        params: { api_token: SENDMAILS_API_TOKEN }
      });
      
      if (listsResponse.data && listsResponse.data.length > 0) {
        listResponse = { data: listsResponse.data[0] };
        console.log('   Using existing list:', listResponse.data);
      } else {
        throw new Error('Failed to create or find a list');
      }
    }
    
    const listUid = listResponse.data.uid;
    console.log('   List UID:', listUid);
    
    // Add subscriber to the list
    console.log('   Adding subscriber...');
    const subscriberData = {
      api_token: SENDMAILS_API_TOKEN,
      EMAIL: to,
      first_name: name,
      last_name: '',
      status: 'subscribed',
      list_uid: listUid
    };
    
    const subscriberResponse = await sendMailsAPI.post('/subscribers', subscriberData);
    console.log('   Subscriber added:', subscriberResponse.data);
    
    // Create campaign
    console.log('   Creating campaign...');
    const campaignData = {
      api_token: SENDMAILS_API_TOKEN,
      name: `Welcome Email - ${name}`,
      subject: 'Welcome to GoooFit! 🎉',
      content: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to GoooFit</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2c5aa0;">Welcome to GoooFit! 🎉</h1>
            <p>Hi ${name},</p>
            <p>Thank you for joining GoooFit! We're excited to help you on your health and fitness journey.</p>
            <p>With GoooFit, you can:</p>
            <ul>
              <li>Track your weight and health metrics</li>
              <li>Use our comprehensive health calculators</li>
              <li>Get personalized insights and recommendations</li>
              <li>Join a community of health enthusiasts</li>
            </ul>
            <p>Start your journey today by exploring our health calculators and tracking your progress!</p>
            <p>Best regards,<br>The GoooFit Team</p>
          </div>
        </body>
        </html>
      `,
      from_name: 'GoooFit Team',
      from_email: 'support@gooofit.com',
      reply_to: 'support@gooofit.com',
      list_uid: listUid
    };
    
    const response = await sendMailsAPI.post('/campaigns', campaignData);
    
    if (response.data && response.data.uid) {
      // Run the campaign immediately
      await sendMailsAPI.post(`/campaigns/${response.data.uid}/run`, {
        api_token: SENDMAILS_API_TOKEN
      });
      
      console.log('✅ Welcome email sent via SendMails.io API');
      return {
        success: true,
        campaignId: response.data.uid,
        method: 'SendMails.io API'
      };
    }
    
    return {
      success: false,
      error: 'Failed to create campaign'
    };
    
  } catch (error) {
    console.error('❌ SendMails.io API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

/**
 * Send password reset email via SendMails.io API
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} name - Recipient name
 * @returns {Promise<Object>} API response
 */
async function sendPasswordResetEmail(to, resetToken, name = 'User') {
  try {
    console.log('📧 SendMails.io: Sending password reset email to', to);
    
    const resetUrl = `${process.env.CLIENT_URL || 'https://gooofit.com'}/reset-password?token=${resetToken}`;
    
    const campaignData = {
      api_token: SENDMAILS_API_TOKEN,
      name: `Password Reset - ${name}`,
      subject: 'Password Reset Request - GoooFit',
      content: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset - GoooFit</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2c5aa0;">Password Reset Request</h1>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password for your GoooFit account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2c5aa0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>The GoooFit Team</p>
          </div>
        </body>
        </html>
      `,
      from_name: 'GoooFit Team',
      from_email: 'support@gooofit.com',
      reply_to: 'support@gooofit.com',
      recipients: [to]
    };
    
    const response = await sendMailsAPI.post('/campaigns', campaignData);
    
    if (response.data && response.data.uid) {
      // Run the campaign immediately
      await sendMailsAPI.post(`/campaigns/${response.data.uid}/run`, {
        api_token: SENDMAILS_API_TOKEN
      });
      
      console.log('✅ Password reset email sent via SendMails.io API');
      return {
        success: true,
        campaignId: response.data.uid,
        method: 'SendMails.io API'
      };
    }
    
    return {
      success: false,
      error: 'Failed to create campaign'
    };
    
  } catch (error) {
    console.error('❌ SendMails.io API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

/**
 * Send registration notification email via SendMails.io API
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient name
 * @returns {Promise<Object>} API response
 */
async function sendRegistrationNotificationEmail(to, name) {
  try {
    console.log('📧 SendMails.io: Sending registration notification email to', to);
    
    const campaignData = {
      api_token: SENDMAILS_API_TOKEN,
      name: `Registration Notification - ${name}`,
      subject: 'New User Registration - GoooFit',
      content: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New User Registration - GoooFit</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2c5aa0;">New User Registration</h1>
            <p>A new user has registered on GoooFit:</p>
            <ul>
              <li><strong>Name:</strong> ${name}</li>
              <li><strong>Email:</strong> ${to}</li>
              <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
            <p>Welcome them to the GoooFit community!</p>
            <p>Best regards,<br>GoooFit System</p>
          </div>
        </body>
        </html>
      `,
      from_name: 'GoooFit System',
      from_email: 'support@gooofit.com',
      reply_to: 'support@gooofit.com',
      recipients: [to]
    };
    
    const response = await sendMailsAPI.post('/campaigns', campaignData);
    
    if (response.data && response.data.uid) {
      // Run the campaign immediately
      await sendMailsAPI.post(`/campaigns/${response.data.uid}/run`, {
        api_token: SENDMAILS_API_TOKEN
      });
      
      console.log('✅ Registration notification email sent via SendMails.io API');
      return {
        success: true,
        campaignId: response.data.uid,
        method: 'SendMails.io API'
      };
    }
    
    return {
      success: false,
      error: 'Failed to create campaign'
    };
    
  } catch (error) {
    console.error('❌ SendMails.io API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

/**
 * Send generic email via SendMails.io API
 * @param {Object} emailData - Email data object
 * @returns {Promise<Object>} API response
 */
async function sendEmail(emailData) {
  try {
    console.log('📧 SendMails.io: Sending generic email to', emailData.to);
    
    const campaignData = {
      api_token: SENDMAILS_API_TOKEN,
      name: `Email - ${emailData.subject}`,
      subject: emailData.subject,
      content: emailData.html || emailData.text,
      from_name: emailData.from_name || 'GoooFit Team',
      from_email: emailData.from || 'support@gooofit.com',
      reply_to: emailData.reply_to || 'support@gooofit.com',
      recipients: [emailData.to]
    };
    
    const response = await sendMailsAPI.post('/campaigns', campaignData);
    
    if (response.data && response.data.uid) {
      // Run the campaign immediately
      await sendMailsAPI.post(`/campaigns/${response.data.uid}/run`, {
        api_token: SENDMAILS_API_TOKEN
      });
      
      console.log('✅ Generic email sent via SendMails.io API');
      return {
        success: true,
        campaignId: response.data.uid,
        method: 'SendMails.io API'
      };
    }
    
    return {
      success: false,
      error: 'Failed to create campaign'
    };
    
  } catch (error) {
    console.error('❌ SendMails.io API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

/**
 * Test SendMails.io API connection
 * @returns {Promise<Object>} Test result
 */
async function testSendMailsConnection() {
  try {
    console.log('🧪 Testing SendMails.io API connection...');
    
    // Test by getting campaigns list
    const response = await sendMailsAPI.get('/campaigns', {
      params: { api_token: SENDMAILS_API_TOKEN }
    });
    
    console.log('✅ SendMails.io API connection successful');
    return {
      success: true,
      message: 'API connection successful',
      data: response.data
    };
    
  } catch (error) {
    console.error('❌ SendMails.io API connection failed:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendRegistrationNotificationEmail,
  sendEmail,
  testSendMailsConnection
}; 