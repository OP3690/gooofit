# Environment Variables Update Required

## 🔧 **Switch Back to Gmail - GoDaddy Auth Issues**

GoDaddy authentication is failing on production. Let's switch back to Gmail with the new app password that we tested and confirmed is working.

### **Step 1: Update Render Environment Variables**

**Go to your Render Dashboard:**
1. Visit: https://dashboard.render.com
2. Select your `gooofit-final` service
3. Go to **Environment** tab
4. **Update these variables:**

**EMAIL_USER:**
- **From**: `support@gooofit.com` (GoDaddy)
- **To**: `onboarding.gooofit@gmail.com` (Gmail)

**EMAIL_PASSWORD:**
- **From**: `Fortune$$336699` (GoDaddy)
- **To**: `yabi ffau orlt lguq` (Gmail app password)

### **Step 2: Save and Wait**
1. Click **Save Changes**
2. Server will auto-redeploy
3. Wait 2-3 minutes

### **Step 3: Test**
After deployment, try password reset again.

## 🎯 **Why This Will Work**

- ✅ **Gmail app password tested** and working perfectly
- ✅ **Authentication successful** - confirmed working
- ✅ **Email sending successful** - confirmed working
- ✅ **No authentication issues** - unlike GoDaddy on production

## 📧 **Gmail SMTP Settings**

- **Host**: `smtp.gmail.com`
- **Port**: `587` (STARTTLS)
- **Authentication**: Required
- **Username**: `onboarding.gooofit@gmail.com`
- **Password**: `yabi ffau orlt lguq` (app password)

## 🚀 **Expected Result**

After updating environment variables:
- ✅ **Password reset emails sent** via Gmail
- ✅ **No more 500 errors**
- ✅ **No more authentication failures**
- ⚠️ **Note**: Gmail has daily sending limits (500 emails/day)

## 🔄 **Deployment Status**

- ✅ **Code changes**: Pushed to repository (Gmail SMTP)
- ❌ **Environment variables**: Need to be updated
- ⏳ **Server restart**: Will happen automatically after env var update
- 🎯 **Result**: Password reset will work immediately 