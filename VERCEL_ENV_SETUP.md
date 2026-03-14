# 🔧 Vercel Environment Variables Setup

## 📧 **Email Configuration for WeightPro**

Your application has been deployed successfully! Now you need to set up the environment variables in Vercel to activate the email functionality.

## 🚀 **Step-by-Step Setup**

### **1. Access Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Click on your project: `weight-loss`
3. Go to **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### **2. Add Environment Variables**

Add these two environment variables:

#### **Variable 1: EMAIL_USER**
- **Name**: `EMAIL_USER`
- **Value**: `support@gooofit.com`
- **Environment**: Select all (Production, Preview, Development)

#### **Variable 2: EMAIL_PASSWORD**
- **Name**: `EMAIL_PASSWORD`
- **Value**: `Fortune$$336699`
- **Environment**: Select all (Production, Preview, Development)

### **3. Save and Redeploy**
1. Click **Save** after adding both variables
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment

## 🧪 **Testing Email Functionality**

### **Test Welcome Email**:
1. Go to: https://weight-loss-p7fmugol3-omprakash-utahas-projects.vercel.app
2. Click **Register** or **Get Started**
3. Fill out the registration form
4. Submit the form
5. Check your email for the welcome message

### **Test Password Reset**:
1. Go to the login page
2. Click **"Forgot Password?"**
3. Enter your email address
4. Click **Send OTP**
5. Check your email for the OTP
6. Enter the OTP and set a new password

## 🔍 **Troubleshooting**

### **If emails are not received**:
1. Check your spam/junk folder
2. Verify the environment variables are set correctly
3. Check Vercel logs for any errors
4. Ensure the email address is correct

### **If you get authentication errors**:
1. Verify the password is correct
2. Make sure 2-Factor Authentication is enabled on your Gmail account
3. Generate a new app-specific password if needed

## 📞 **Support**

If you continue to have issues:
1. Check the Vercel deployment logs
2. Verify all environment variables are set
3. Test with a simple email first

---

**🎉 Once the environment variables are set, your email functionality will be fully operational!** 