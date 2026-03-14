# Alternative Gmail Account Setup

## 🚨 **Current Issue**
The current Gmail account (`onboarding.gooofit@gmail.com`) has hit its daily sending limit (500 emails/day).

## 🚀 **Solution: Use Alternative Gmail Account**

### **Step 1: Create New Gmail Account**
1. **Go to**: https://accounts.google.com/signup
2. **Create**: A new Gmail account (e.g., `support.gooofit@gmail.com`)
3. **Enable**: 2-factor authentication
4. **Generate**: App password

### **Step 2: Generate App Password**
1. **Go to**: https://myaccount.google.com/apppasswords
2. **Select**: "Mail" and "Other (Custom name)"
3. **Enter**: "GoooFit App"
4. **Copy**: The generated 16-character password

### **Step 3: Update Render Environment Variables**
1. **Go to**: https://dashboard.render.com
2. **Select**: Your `gooofit-final` service
3. **Go to**: **Environment** tab
4. **Update**:
   - **EMAIL_USER**: `support.gooofit@gmail.com` (or your new email)
   - **EMAIL_PASSWORD**: `[your-new-app-password]`

### **Step 4: Test**
After updating environment variables:
1. Server will auto-redeploy
2. Try password reset again
3. Should work immediately

## 🎯 **Why This Works**
- ✅ **Fresh Gmail account** - No daily limit issues
- ✅ **App password** - Secure authentication
- ✅ **Same code** - No code changes needed
- ✅ **Immediate fix** - Works right away

## 📧 **Alternative Email Providers**
If you prefer not to create a new Gmail account:

### **Option A: SendGrid**
- **Free tier**: 100 emails/day
- **Professional**: Reliable delivery
- **Setup**: API key authentication

### **Option B: Mailgun**
- **Free tier**: 5,000 emails/month
- **Professional**: Excellent deliverability
- **Setup**: API key authentication

### **Option C: Resend**
- **Free tier**: 3,000 emails/month
- **Modern**: Developer-friendly
- **Setup**: API key authentication

## 🔄 **Current Status**
- ❌ **Current Gmail**: Daily limit exceeded
- ✅ **Code**: Working perfectly
- ✅ **Environment**: Ready for new credentials
- ⏳ **Solution**: Update environment variables 