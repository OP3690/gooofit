# GoDaddy Email Troubleshooting Guide

## 🚨 **GoDaddy Authentication Issues**

The GoDaddy email authentication is failing on production. Let's fix this step by step.

## 🔧 **Step 1: Verify GoDaddy Account Settings**

### **Check GoDaddy Email Account**
1. **Login to GoDaddy**: https://sso.godaddy.com/
2. **Go to Email**: Find your `support@gooofit.com` account
3. **Check Status**: Ensure account is active and not suspended

### **Verify SMTP Settings**
1. **SMTP Server**: `smtpout.secureserver.net`
2. **Port**: `465` (SSL) or `587` (TLS)
3. **Authentication**: Required
4. **Username**: `support@gooofit.com`
5. **Password**: `Fortune$$336699`

## 🔧 **Step 2: Check GoDaddy Email Configuration**

### **Enable SMTP Access**
1. **Login to GoDaddy Email**: https://email.godaddy.com/
2. **Go to Settings**: Email settings
3. **Enable SMTP**: Make sure SMTP is enabled
4. **Check Security**: Ensure no security blocks

### **Alternative SMTP Servers**
If `smtpout.secureserver.net` fails, try:
- `smtp.secureserver.net` (port 465)
- `smtpout.secureserver.net` (port 587)
- `smtp.secureserver.net` (port 587)

## 🔧 **Step 3: Update Environment Variables**

### **Current Settings (Correct)**
```
EMAIL_USER=support@gooofit.com
EMAIL_PASSWORD=Fortune$$336699
```

### **Verify in Render Dashboard**
1. **Go to**: https://dashboard.render.com
2. **Select**: `gooofit-final` service
3. **Environment**: Check variables are correct
4. **Save**: If any changes made

## 🔧 **Step 4: Test Different Configurations**

### **Configuration 1: Primary (Port 465 SSL)**
```javascript
{
  host: 'smtpout.secureserver.net',
  port: 465,
  secure: true,
  auth: {
    user: 'support@gooofit.com',
    pass: 'Fortune$$336699'
  }
}
```

### **Configuration 2: Alternative (Port 587 TLS)**
```javascript
{
  host: 'smtpout.secureserver.net',
  port: 587,
  secure: false,
  auth: {
    user: 'support@gooofit.com',
    pass: 'Fortune$$336699'
  }
}
```

### **Configuration 3: Alternative Server**
```javascript
{
  host: 'smtp.secureserver.net',
  port: 465,
  secure: true,
  auth: {
    user: 'support@gooofit.com',
    pass: 'Fortune$$336699'
  }
}
```

## 🔧 **Step 5: Common Issues & Solutions**

### **Issue 1: Authentication Failed**
**Solution**: Check password and username are correct

### **Issue 2: Connection Timeout**
**Solution**: Try different SMTP servers or ports

### **Issue 3: SSL/TLS Issues**
**Solution**: Try port 587 with STARTTLS

### **Issue 4: Account Suspended**
**Solution**: Contact GoDaddy support

## 🔧 **Step 6: Alternative Solutions**

### **Option A: Use Different GoDaddy Account**
- Create new GoDaddy email account
- Use different credentials
- Test authentication

### **Option B: Use GoDaddy API**
- Use GoDaddy's email API instead of SMTP
- More reliable but requires API setup

### **Option C: Contact GoDaddy Support**
- Call GoDaddy support: 1-866-938-1119
- Ask about SMTP authentication issues
- Request account verification

## 🎯 **Next Steps**

1. **Verify GoDaddy account** is active
2. **Check SMTP settings** in GoDaddy dashboard
3. **Test different configurations** (already implemented in code)
4. **Contact GoDaddy support** if issues persist

## 📞 **GoDaddy Support**

- **Phone**: 1-866-938-1119
- **Live Chat**: Available on GoDaddy website
- **Email**: support@godaddy.com

## 🔄 **Current Status**

- ✅ **Code**: Updated with multiple GoDaddy configurations
- ✅ **Environment Variables**: Correctly set
- ❌ **Authentication**: Still failing on production
- 🔧 **Next**: Test different configurations and contact support 