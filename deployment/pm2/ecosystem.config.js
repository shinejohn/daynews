module.exports = {
  apps: [
    {
      name: 'daynews-isr-server',
      script: './dist/server/index.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Database Configuration
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        // Cache Configuration
        REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
        // ISR Configuration
        ISR_CACHE_TTL: '3600', // 1 hour default
        ISR_REVALIDATE_ON_DEMAND: 'true',
        // Security
        JWT_SECRET: process.env.JWT_SECRET,
        CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://yourdomain.com'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Production-specific optimizations
        NODE_OPTIONS: '--max-old-space-size=4096',
        UV_THREADPOOL_SIZE: 128
      },
      // Performance monitoring
      monitoring: false, // Set to true with PM2 Plus
      // Auto-restart configuration
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      // Logging configuration
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Process management
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      // Health check
      health_check_grace_period: 10000
    },
    {
      name: 'daynews-cache-warmer',
      script: './dist/scripts/cache-warmer.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 */6 * * *', // Restart every 6 hours
      env: {
        NODE_ENV: 'production',
        CACHE_WARM_INTERVAL: '300000', // 5 minutes
        WARM_POPULAR_PAGES: 'true',
        MAX_CONCURRENT_REQUESTS: '10'
      }
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:yourorg/daynews.git',
      path: '/var/www/daynews',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    }
  }
};
