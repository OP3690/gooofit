# 📧 Email Setup Guide for WeightPro

## 🎉 **Welcome Email & Password Reset Functionality**

Your WeightPro application now includes beautiful email functionality with:
- ✅ **Welcome Email**: Sent automatically when users register
- ✅ **Password Reset**: OTP-based password reset flow
- ✅ **Professional Design**: Beautiful HTML email templates
- ✅ **Security**: 10-minute OTP expiration with automatic cleanup

## 🔧 **Email Configuration Setup**

### **Step 1: Gmail App-Specific Password Setup**

1. **Enable 2-Factor Authentication**:
   - Go to your Google Account settings
   - Navigate to Security → 2-Step Verification
   - Enable 2-Step Verification if not already enabled

2. **Generate App-Specific Password**:
   - Go to Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Name it "WeightPro Email Service"
   - Copy the generated 16-character password

### **Step 2: Environment Variables**

Add these environment variables to your Vercel project:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `weight-loss`
3. **Go to Settings → Environment Variables**
4. **Add these variables**:

```bash
EMAIL_USER=support@gooofit.com
EMAIL_PASSWORD=your-16-character-app-password
```

### **Step 3: Update Email Service Configuration**

If you want to use a different email service or domain:

1. **Edit `services/emailService.js`**
2. **Update the transporter configuration**:

```javascript
// For Gmail (current setup)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'support@gooofit.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-specific-password'
  }
});

// For custom SMTP (alternative)
const transporter = nodemailer.createTransporter({
  host: 'smtp.yourdomain.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

## 📧 **Email Templates**

### **Welcome Email Features**:
- 🎨 Beautiful gradient design
- 📊 User statistics (100+ users, 4.7kg avg loss, 73.28% daily updates)
- 🚀 Call-to-action button
- 📱 Mobile responsive
- 🔗 Links to your domain

### **Password Reset Email Features**:
- 🔐 Secure OTP display
- ⚠️ Security warnings
- ⏰ 10-minute expiration notice
- 🔄 Resend functionality
- 📱 Mobile responsive

## 🚀 **Testing the Email Functionality**

### **Test Welcome Email**:
1. Register a new user account
2. Check the registered email for the welcome message
3. Verify the email design and links

### **Test Password Reset**:
1. Go to login page
2. Click "Forgot Password?"
3. Enter your email address
4. Check email for OTP
5. Enter OTP and set new password

## 🔒 **Security Features**

### **OTP Security**:
- ✅ 6-digit numeric OTP
- ✅ 10-minute expiration
- ✅ Automatic cleanup of expired OTPs
- ✅ One-time use only
- ✅ Rate limiting (60-second resend cooldown)

### **Email Security**:
- ✅ Secure SMTP connection
- ✅ App-specific passwords
- ✅ Environment variable protection
- ✅ Input validation and sanitization

## 📱 **Frontend Integration**

### **Password Reset Flow**:
1. **Step 1**: Enter email address
2. **Step 2**: Enter 6-digit OTP
3. **Step 3**: Set new password
4. **Success**: Redirect to login

### **Features**:
- ✅ Step-by-step progress indicator
- ✅ Real-time validation
- ✅ Password strength indicators
- ✅ Show/hide password toggles
- ✅ Resend OTP with countdown
- ✅ Beautiful animations

## 🛠 **Troubleshooting**

### **Common Issues**:

1. **"Authentication failed"**:
   - Check app-specific password
   - Verify 2FA is enabled
   - Ensure email is correct

2. **"OTP not received"**:
   - Check spam folder
   - Verify email address
   - Wait for 60-second cooldown

3. **"OTP expired"**:
   - Request new OTP
   - Check system time
   - Clear browser cache

### **Debug Mode**:
Enable debug logging by adding to `server.js`:

```javascript
// Add this to see email sending logs
console.log('Email configuration:', {
  user: process.env.EMAIL_USER,
  hasPassword: !!process.env.EMAIL_PASSWORD
});
```

## 📊 **Email Analytics**

### **Track Email Performance**:
- Monitor delivery rates
- Track open rates
- Analyze click-through rates
- Monitor bounce rates

### **Recommended Tools**:
- **SendGrid**: For production email delivery
- **Mailgun**: Alternative email service
- **Postmark**: Transactional email service

## 🎯 **Next Steps**

1. **Set up environment variables** in Vercel
2. **Test email functionality** with real email addresses
3. **Monitor email delivery** and user engagement
4. **Customize email templates** if needed
5. **Set up email analytics** for better insights

## 📞 **Support**

If you need help with email setup:
- Check the troubleshooting section above
- Verify environment variables are set correctly
- Test with a simple email first
- Contact support if issues persist

---

**🎉 Congratulations!** Your WeightPro application now has professional email functionality that will enhance user experience and engagement. 