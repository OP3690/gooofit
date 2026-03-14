const { sendPasswordResetEmail, sendWelcomeEmail } = require('./services/emailService');

async function testEmailTemplates() {
  console.log('🧪 Testing email templates locally...');
  
  try {
    // Test 1: Password Reset Email
    console.log('\n1️⃣ Testing Password Reset Email...');
    const resetResult = await sendPasswordResetEmail('global5665@gmail.com', '123456', 'Omprakash Utaha');
    console.log('Password Reset Email Result:', resetResult);
    
    // Test 2: Welcome Email
    console.log('\n2️⃣ Testing Welcome Email...');
    const welcomeResult = await sendWelcomeEmail('global5665@gmail.com', 'Omprakash Utaha');
    console.log('Welcome Email Result:', welcomeResult);
    
    console.log('\n✅ Email templates sent! Check your email to review the design.');
    console.log('📧 Check: global5665@gmail.com');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEmailTemplates(); 