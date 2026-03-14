# 🔧 Gmail Setup Guide for WeightPro Email

## 🚨 **Current Issue**
The email authentication is failing because Gmail requires proper security configuration. Here's how to fix it:

## 🔐 **Option 1: 2-Factor Authentication + App-Specific Password (Recommended)**

### **Step 1: Enable 2-Factor Authentication**
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "Signing in to Google," click **2-Step Verification**
4. Follow the steps to enable 2-Factor Authentication

### **Step 2: Generate App-Specific Password**
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "Signing in to Google," click **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Name it: `WeightPro Email Service`
6. Click **Generate**
7. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### **Step 3: Update Environment Variables**
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `weight-loss`
3. Go to **Settings** → **Environment Variables**
4. Update `EMAIL_PASSWORD` with the new app-specific password
5. Save and redeploy

## 🔓 **Option 2: Less Secure App Access (Alternative)**

### **Step 1: Enable Less Secure App Access**
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Scroll down to **Less secure app access**
4. Turn on **Allow less secure apps**
5. **Note**: This is less secure and Google may disable it

### **Step 2: Test the Current Password**
- The current password `Fortune$$336699` should work with this setting

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
1. **Check 2FA**: Make sure 2-Factor Authentication is enabled
2. **App Password**: Use the 16-character app-specific password
3. **Less Secure Apps**: Enable "Allow less secure apps" if not using 2FA
4. **Password Format**: Remove spaces from app-specific password

### **If emails are not received**:
1. Check spam/junk folder
2. Verify the email address is correct
3. Check Vercel deployment logs
4. Test with a simple email first

### **If you get "Username and Password not accepted"**:
1. Double-check the email address: `support@gooofit.com`
2. Verify the password is correct
3. Make sure you're using the right authentication method

## 📧 **Email Configuration Summary**

### **Current Settings**:
- **Email**: `support@gooofit.com`
- **Password**: `Fortune$$336699` (needs app-specific password)
- **Service**: Gmail SMTP

### **Required Action**:
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App-Specific Password** for "WeightPro Email Service"
3. **Update Vercel Environment Variables** with the new password
4. **Redeploy** the application

## 🎯 **Next Steps**

1. **Choose your authentication method** (2FA + App Password recommended)
2. **Follow the setup steps** above
3. **Update environment variables** in Vercel
4. **Test the email functionality**
5. **Verify welcome emails and password reset** are working

---

**💡 Recommendation**: Use Option 1 (2-Factor Authentication + App-Specific Password) for better security and reliability. 