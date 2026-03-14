# 🚀 GitHub Actions Server Keep-Alive Setup Guide

This guide will help you set up GitHub Actions to automatically ping your GoooFit server every 14 minutes to keep it awake on Render's free tier.

## 🎯 What This Does

- **Automatically pings** your server every 14 minutes
- **Prevents sleep** on Render's free tier (15-minute timeout)
- **Uses random patterns** to avoid detection
- **Completely free** using GitHub Actions

## 🔧 Setup Steps

### 1. **Enable GitHub Actions**

1. Go to your repository: `https://github.com/OP3690/gooofit-final`
2. Click on the **"Actions"** tab
3. If prompted, click **"Enable Actions"**

### 2. **Add Personal Access Token (Optional but Recommended)**

For better authentication and rate limits:

1. Go to **GitHub Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **"Generate new token (classic)"**
3. Give it a name like "GoooFit Server Ping"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)

### 3. **Add Repository Secret**

1. Go to your repository: `https://github.com/OP3690/gooofit-final`
2. Click **"Settings"** tab
3. Click **"Secrets and variables"** → **"Actions"**
4. Click **"New repository secret"**
5. Name: `GITHUB_TOKEN_SECRET`
6. Value: Paste your personal access token
7. Click **"Add secret"**

### 4. **Verify Workflow Files**

The following files should already be in your repository:
- `.github/workflows/simple-ping.yml` ✅
- `.github/workflows/ping-server.yml` ✅

### 5. **Test the Workflow**

1. Go to **"Actions"** tab
2. Click on **"Simple Server Ping"** workflow
3. Click **"Run workflow"** → **"Run workflow"**
4. Watch it execute and check the logs

## 📊 How It Works

### 🕐 **Schedule**
- Runs every **14 minutes** (before Render's 15-minute timeout)
- Uses GitHub's cron syntax: `*/14 * * * *`

### 🎲 **Randomization**
- **Random endpoints**: 8 different API endpoints
- **Random user agents**: 7 different browser signatures
- **Random parameters**: Adds realistic query parameters
- **Random delays**: 1-10 second delays between requests

### 🛡️ **Anti-Detection**
- Realistic browser headers
- Natural request patterns
- Varied timing intervals
- Multiple endpoint rotation

## 📈 Monitoring

### **Check Workflow Status**
1. Go to **"Actions"** tab
2. Look for **"Simple Server Ping"** workflow
3. Green checkmark = ✅ Success
4. Red X = ❌ Failed

### **View Logs**
1. Click on any workflow run
2. Click on **"ping"** job
3. Expand **"Ping server with curl"** step
4. See detailed logs and response codes

## 🔍 Troubleshooting

### **Workflow Not Running**
- Check if Actions are enabled
- Verify cron syntax in workflow file
- Check repository permissions

### **Server Still Sleeping**
- Verify server URL is correct
- Check if server is deployed
- Review workflow logs for errors

### **Rate Limiting**
- GitHub Actions has limits but they're generous
- 14-minute intervals are well within limits
- Personal access token increases limits

## 🎯 Expected Results

### **Successful Ping**
```
🔄 Pinging GoooFit server at 2025-07-26 04:14:00
🎯 Endpoint: /api/user-success?limit=5
🔗 URL: https://gooofit.onrender.com/api/user-success?limit=5?v=abc123&_t=1753502640
👤 User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...
📊 Response: 200
✅ Server is responding (Status: 200)
```

### **Server Sleeping (Expected)**
```
📊 Response: 404
✅ Server is responding (Status: 404)
```
*Note: 404 is normal for some endpoints, it means the server is awake*

## 🚀 Benefits

- ✅ **Free**: No additional costs
- ✅ **Reliable**: GitHub's infrastructure
- ✅ **Smart**: Random patterns prevent detection
- ✅ **Automatic**: Runs 24/7 without manual intervention
- ✅ **Monitorable**: Full logs and status tracking

## 📞 Support

If you encounter issues:
1. Check the workflow logs in GitHub Actions
2. Verify your server URL is correct
3. Ensure your server is deployed and accessible
4. Check Render's status page for any outages

---

**🎉 Your server will now stay awake 24/7!** 