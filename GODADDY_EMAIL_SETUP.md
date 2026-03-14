# 🔧 GoDaddy Email Setup Guide for WeightPro

## 📧 **Email Configuration for gooofit.com**

Your application is now configured to use your GoDaddy email service (`support@gooofit.com`) instead of Gmail.

## 🚀 **Current Configuration**

### **Email Settings**:
- **Email**: `support@gooofit.com`
- **Password**: `Fortune$$336699`
- **SMTP Server**: `smtp.office365.com` (GoDaddy uses Office 365)
- **Port**: `587`
- **Security**: TLS

## 🧪 **Testing Email Configuration**

### **Local Test**:
```bash
node test-email.js
```

### **Production Test**:
1. Go to: https://weight-loss-p7fmugol3-omprakash-utahas-projects.vercel.app
2. Register a new user
3. Check for welcome email
4. Test "Forgot Password" feature

## 🔍 **Troubleshooting**

### **If you get "Invalid login" error**:
1. **Verify GoDaddy Email Access**:
   - Log into your GoDaddy account
   - Go to Email & Office
   - Access your `support@gooofit.com` email
   - Verify the password works in webmail

2. **Check Email Configuration**:
   - Ensure your GoDaddy email is properly set up
   - Verify the email address is active
   - Check if there are any email restrictions

3. **Alternative SMTP Settings**:
   If the current settings don't work, try these alternatives:

   **Option 1: GoDaddy's own SMTP**
   ```javascript
   host: 'smtpout.secureserver.net',
   port: 587,
   secure: false
   ```

   **Option 2: GoDaddy with SSL**
   ```javascript
   host: 'smtpout.secureserver.net',
   port: 465,
   secure: true
   ```

### **If emails are not received**:
1. Check spam/junk folder
2. Verify the email address is correct
3. Check Vercel deployment logs
4. Test with a simple email first

## 🔧 **Environment Variables Setup**

### **Vercel Dashboard Setup**:
1. Go to: https://vercel.com/dashboard
2. Select your project: `weight-loss`
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

#### **Variable 1: EMAIL_USER**
- **Name**: `EMAIL_USER`
- **Value**: `support@gooofit.com`
- **Environment**: Select all (Production, Preview, Development)

#### **Variable 2: EMAIL_PASSWORD**
- **Name**: `EMAIL_PASSWORD`
- **Value**: `Fortune$$336699`
- **Environment**: Select all (Production, Preview, Development)

### **Save and Redeploy**:
1. Click **Save** after adding both variables
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment

## 📞 **GoDaddy Support**

If you continue to have issues:
1. **Contact GoDaddy Support**: https://www.godaddy.com/help
2. **Check Email Status**: Verify your email service is active
3. **Reset Password**: If needed, reset your email password
4. **Check Email Limits**: Ensure you haven't exceeded sending limits

## 🎯 **Next Steps**

1. **Test the email configuration** using the test script
2. **Set up environment variables** in Vercel
3. **Deploy the updated configuration**
4. **Test welcome emails and password reset**
5. **Verify all email functionality is working**

## 🔄 **Alternative Email Services**

If GoDaddy email continues to have issues, consider:
1. **Gmail with App-Specific Password**
2. **SendGrid** (free tier available)
3. **Mailgun** (free tier available)
4. **AWS SES** (very cost-effective)

---

**💡 Note**: GoDaddy email services can sometimes have stricter security policies. If you continue to have issues, we can switch to a more reliable email service provider. 