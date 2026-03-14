const axios = require('axios');

class PingService {
  constructor() {
    this.isRunning = false;
    this.pingInterval = null;
    this.serverUrl = process.env.SERVER_URL || 'https://gooofit-final.onrender.com';
    this.pingEndpoints = [
      '/api/health'
    ];
  }

  // Start the ping service
  start() {
    if (this.isRunning) {
      console.log('Ping service is already running');
      return;
    }

    console.log('🚀 Starting ping service to keep server awake...');
    this.isRunning = true;

    // Ping every 10-14 minutes (random interval to avoid predictable patterns)
    this.pingInterval = setInterval(() => {
      this.pingServer();
    }, this.getRandomInterval(10, 14)); // 10-14 minutes in milliseconds

    // Initial ping
    this.pingServer();
  }

  // Stop the ping service
  stop() {
    if (!this.isRunning) {
      console.log('Ping service is not running');
      return;
    }

    console.log('🛑 Stopping ping service...');
    this.isRunning = false;

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // Ping the server with a random endpoint
  async pingServer() {
    try {
      const endpoint = this.pingEndpoints[Math.floor(Math.random() * this.pingEndpoints.length)];
      const url = `${this.serverUrl}${endpoint}`;
      
      console.log(`📡 Pinging server: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'PingService/1.0',
          'X-Ping-Service': 'true'
        }
      });

      console.log(`✅ Server ping successful: ${response.status} - ${response.statusText}`);
      
      // Log response time for monitoring
      if (response.headers['x-response-time']) {
        console.log(`⏱️ Response time: ${response.headers['x-response-time']}`);
      }

    } catch (error) {
      console.error(`❌ Server ping failed: ${error.message}`);
      
      // If it's a timeout or connection error, try again in 2 minutes
      if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.log('🔄 Retrying ping in 2 minutes...');
        setTimeout(() => {
          this.pingServer();
        }, 2 * 60 * 1000); // 2 minutes
      }
    }
  }

  // Get random interval between min and max minutes
  getRandomInterval(minMinutes, maxMinutes) {
    const minMs = minMinutes * 60 * 1000;
    const maxMs = maxMinutes * 60 * 1000;
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      serverUrl: this.serverUrl,
      nextPingIn: this.pingInterval ? 'Random interval (10-14 minutes)' : 'Not scheduled'
    };
  }
}

module.exports = PingService; 