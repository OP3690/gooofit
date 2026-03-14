# Email Authentication Troubleshooting Guide

## 🔍 **Current Issue**
- **Error**: `535 Authentication Failed for support@gooofit.com`
- **Status**: SSL connection works, but authentication fails
- **Root Cause**: Password or authentication method issue

## 🛠️ **Immediate Solutions**

### **Solution 1: Reset GoDaddy Email Password**
1. **Login to GoDaddy Email**: https://email.godaddy.com
2. **Go to Settings** → **Password & Security**
3. **Change Password** to a simple password (no special characters)
4. **Update Render Environment Variable**:
   - Go to: https://dashboard.render.com/web/weight-loss-final/environment
   - Update `EMAIL_PASSWORD` with new password

### **Solution 2: Use Gmail SMTP (Recommended)**
If GoDaddy continues to fail, switch to Gmail:

1. **Create Gmail App Password**:
   - Go to Gmail → Settings → Security
   - Enable 2-Factor Authentication
   - Generate App Password

2. **Update Email Service**:
   ```javascript
   const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 587,
     secure: false,
     auth: {
       user: 'your-gmail@gmail.com',
       pass: 'your-16-character-app-password'
     }
   });
   ```

3. **Update Render Environment Variables**:
   - `EMAIL_USER`: `your-gmail@gmail.com`
   - `EMAIL_PASSWORD`: `your-16-character-app-password`

### **Solution 3: Use GoDaddy App-Specific Password**
1. **Enable 2-Factor Authentication** in GoDaddy email
2. **Generate App-Specific Password**
3. **Use that password** in environment variables

## 🔧 **Technical Details**

### **Current Configuration**
```javascript
host: 'smtpout.secureserver.net'
port: 465
secure: true
auth: {
  user: 'support@gooofit.com',
  pass: 'Fortune$$336699'
}
```

### **GoDaddy Server Settings (from screenshot)**
- **SMTP Server**: `smtpout.secureserver.net`
- **SSL Port**: `465`
- **Security**: SSL

## 📋 **Testing Steps**

1. **Test Email Configuration**:
   ```bash
   curl https://weight-loss-final.onrender.com/api/test-email
   ```

2. **Test Registration**:
   - Register new user
   - Check for welcome email

3. **Test Password Reset**:
   - Use "Forgot Password"
   - Check for OTP email

## 🚨 **Common Issues & Fixes**

### **Issue 1: Password with Special Characters**
- **Problem**: `$$` in password might cause parsing issues
- **Solution**: Use simple password without special characters

### **Issue 2: Account Suspended**
- **Problem**: GoDaddy email account might be suspended
- **Solution**: Check email account status in GoDaddy dashboard

### **Issue 3: SMTP Not Enabled**
- **Problem**: SMTP might be disabled in GoDaddy settings
- **Solution**: Enable SMTP in email settings

### **Issue 4: Rate Limiting**
- **Problem**: Too many authentication attempts
- **Solution**: Wait 15 minutes before retrying

## 🎯 **Recommended Action Plan**

1. **Try Solution 1** (Reset GoDaddy password)
2. **If that fails, use Solution 2** (Switch to Gmail)
3. **Test thoroughly** after each change
4. **Monitor server logs** for detailed error messages

## 📞 **Support Contacts**

- **GoDaddy Support**: 1-866-938-1119
- **Gmail Support**: https://support.google.com/mail
- **Render Support**: https://render.com/docs/help

---

**Last Updated**: July 23, 2025
**Status**: Authentication failing, SSL working 