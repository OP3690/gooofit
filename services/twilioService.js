const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send SMS OTP
const sendSMSOTP = async (phoneNumber, otp) => {
  try {
    console.log('📱 Starting SMS OTP process...');
    console.log('📞 To:', phoneNumber);
    console.log('🔢 OTP:', otp);
    
    // Temporary bypass for development/testing
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 DEVELOPMENT MODE: SMS bypassed for testing');
      console.log('📱 OTP for', phoneNumber, ':', otp);
      console.log('📱 In production, this would be sent via Twilio');
      
      return {
        success: true,
        messageId: 'dev-test-' + Date.now(),
        status: 'delivered',
        development: true
      };
    }
    
    const message = await client.messages.create({
      body: `Your GoooFit verification code is: ${otp}. This code will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    console.log('✅ SMS OTP sent successfully!');
    console.log('📱 Message SID:', message.sid);
    console.log('📱 Status:', message.status);
    
    return {
      success: true,
      messageId: message.sid,
      status: message.status
    };
    
  } catch (error) {
    console.error('❌ SMS OTP sending failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify Twilio credentials
const verifyTwilioCredentials = async () => {
  try {
    console.log('🔧 Verifying Twilio credentials...');
    
    // Test by getting account info
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    
    console.log('✅ Twilio credentials verified successfully');
    console.log('📱 Account:', account.friendlyName);
    console.log('📱 Status:', account.status);
    
    return {
      success: true,
      account: account.friendlyName,
      status: account.status
    };
    
  } catch (error) {
    console.error('❌ Twilio credentials verification failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  generateOTP,
  sendSMSOTP,
  verifyTwilioCredentials
}; 