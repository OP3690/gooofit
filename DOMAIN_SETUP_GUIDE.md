# 🌐 Domain Setup Guide for gooofit.com

## 📋 Overview
This guide will help you set up the custom domain `gooofit.com` for your weight management application on Vercel.

## 🚀 Step-by-Step Setup

### **Step 1: Access Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com) and sign in
2. Navigate to your project: `weight-loss-final-git-op3690-w-44bdfa-omprakash-utahas-projects`

### **Step 2: Add Custom Domain**
1. In your project dashboard, click on **"Settings"** tab
2. Scroll down to **"Domains"** section
3. Click **"Add Domain"**
4. Enter your domain: `gooofit.com`
5. Click **"Add"**

### **Step 3: Configure DNS Records**
Vercel will provide you with DNS records to configure. Add these to your domain registrar:

#### **For Root Domain (gooofit.com):**
```
Type: A
Name: @
Value: 76.76.19.76
TTL: 3600 (or default)
```

#### **For WWW Subdomain (www.gooofit.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or default)
```

### **Step 4: Domain Registrar Configuration**
Depending on your domain registrar, follow these steps:

#### **GoDaddy:**
1. Log into your GoDaddy account
2. Go to **"My Products"** → **"Domains"**
3. Click **"Manage"** next to `gooofit.com`
4. Go to **"DNS"** tab
5. Add the DNS records provided by Vercel
6. Save changes

#### **Namecheap:**
1. Log into your Namecheap account
2. Go to **"Domain List"**
3. Click **"Manage"** next to `gooofit.com`
4. Go to **"Advanced DNS"** tab
5. Add the DNS records provided by Vercel
6. Save changes

#### **Other Registrars:**
- Look for **"DNS Management"** or **"DNS Settings"**
- Add the A and CNAME records as specified above

### **Step 5: Verify Domain Configuration**
1. Wait for DNS propagation (can take up to 48 hours, usually 15-30 minutes)
2. In Vercel dashboard, check domain status
3. Status should show **"Valid Configuration"**

### **Step 6: SSL Certificate**
Vercel will automatically provision an SSL certificate for your domain once DNS is configured.

## 🔧 Application Configuration

### **Backend (Already Configured)**
Your backend is already configured to accept requests from `gooofit.com`:
```javascript
// In server.js
const allowedOrigins = [
  'https://gooofit.com',
  'https://www.gooofit.com',
  // ... other domains
];
```

### **Frontend (Already Configured)**
Your frontend uses relative API URLs which work with any domain:
```javascript
// In client/src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
```

## 🌍 Environment Variables

### **For Production:**
Set these environment variables in Vercel:

```bash
# Frontend Environment Variables
REACT_APP_API_URL=https://your-backend-url.com/api

# Backend Environment Variables (if using separate backend)
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## 🔍 Troubleshooting

### **Common Issues:**

1. **DNS Not Propagated:**
   - Wait 15-30 minutes for DNS propagation
   - Use tools like [whatsmydns.net](https://whatsmydns.net) to check propagation

2. **SSL Certificate Issues:**
   - Vercel automatically handles SSL
   - Wait for certificate provisioning (usually 5-10 minutes)

3. **CORS Errors:**
   - Ensure `gooofit.com` is in allowed origins
   - Check both `https://gooofit.com` and `https://www.gooofit.com`

4. **Domain Not Loading:**
   - Verify DNS records are correct
   - Check domain status in Vercel dashboard
   - Ensure domain is not expired

### **Testing Your Domain:**
```bash
# Test DNS propagation
nslookup gooofit.com
nslookup www.gooofit.com

# Test SSL certificate
curl -I https://gooofit.com
```

## 📱 Final Steps

1. **Update Social Media Links:** Update any social media profiles with the new domain
2. **Update Documentation:** Update README files and documentation
3. **Test All Features:** Ensure all functionality works with the new domain
4. **Monitor Performance:** Use Vercel analytics to monitor site performance

## 🎯 Success Indicators

✅ Domain loads without errors  
✅ SSL certificate is active (green lock in browser)  
✅ All application features work correctly  
✅ API calls work properly  
✅ No CORS errors in browser console  

## 📞 Support

If you encounter issues:
1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Contact your domain registrar support
3. Check Vercel status page: [vercel-status.com](https://vercel-status.com)

---

**Note:** DNS propagation can take up to 48 hours, but typically completes within 15-30 minutes. Be patient during this process. 