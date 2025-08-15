#!/bin/bash

# Version B ISR System - Deployment Configuration Script
# This script creates comprehensive deployment configurations for production

set -e

echo "🚀 Setting up Version B ISR Deployment Configurations..."

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEPLOY_DIR="$PROJECT_ROOT/deployment"

# Create deployment directory structure
mkdir -p "$DEPLOY_DIR"/{pm2,docker,systemd,nginx}

echo "📁 Created deployment directory structure"

# 1. PM2 Ecosystem Configuration
cat > "$DEPLOY_DIR/pm2/ecosystem.config.js" << 'EOF'
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
EOF

echo "✅ Created PM2 ecosystem configuration"

# 2. Dockerfile for containerization
cat > "$DEPLOY_DIR/docker/Dockerfile" << 'EOF'
# Multi-stage build for optimized production image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Build the application
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
EOF

echo "✅ Created Dockerfile"

# 3. Docker Compose configuration
cat > "$DEPLOY_DIR/docker/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  # Main application
  daynews-app:
    build:
      context: ../..
      dockerfile: deployment/docker/Dockerfile
      args:
        - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
        - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    container_name: daynews-isr
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - redis
    networks:
      - daynews-network
    volumes:
      - app-logs:/app/logs
    # Resource limits
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'

  # Redis for caching
  redis:
    image: redis:7-alpine
    container_name: daynews-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    networks:
      - daynews-network
    # Security configuration
    sysctls:
      - net.core.somaxconn=65535

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: daynews-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/sites:/etc/nginx/sites-available:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx-logs:/var/log/nginx
    depends_on:
      - daynews-app
    networks:
      - daynews-network

  # Optional: Monitoring with Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: daynews-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    networks:
      - daynews-network
    profiles:
      - monitoring

  # Optional: Grafana for visualization
  grafana:
    image: grafana/grafana:latest
    container_name: daynews-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - daynews-network
    profiles:
      - monitoring

networks:
  daynews-network:
    driver: bridge

volumes:
  redis-data:
    driver: local
  app-logs:
    driver: local
  nginx-logs:
    driver: local
  prometheus-data:
    driver: local
  grafana-data:
    driver: local
EOF

echo "✅ Created Docker Compose configuration"

# 4. Systemd service file
cat > "$DEPLOY_DIR/systemd/daynews.service" << 'EOF'
[Unit]
Description=DayNews ISR Application
Documentation=https://github.com/yourorg/daynews
After=network.target
Wants=network.target

[Service]
# Service configuration
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/var/www/daynews

# Environment
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=-/etc/environment
EnvironmentFile=-/var/www/daynews/.env.production

# Process management
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload ecosystem.config.js --env production
ExecStop=/usr/bin/pm2 stop ecosystem.config.js

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/var/www/daynews
ProtectHome=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

# Restart configuration
Restart=always
RestartSec=10
TimeoutStartSec=30
TimeoutStopSec=30

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=daynews

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Created systemd service file"

# 5. Nginx configuration
cat > "$DEPLOY_DIR/nginx/nginx.conf" << 'EOF'
# Main nginx configuration for DayNews ISR
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

# Optimize worker connections
events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    # Basic settings
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';
    
    access_log /var/log/nginx/access.log main;
    
    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;
    
    # Upstream for Node.js application
    upstream daynews_backend {
        server daynews-app:3000 max_fails=3 fail_timeout=30s;
        # Add more servers for load balancing
        # server daynews-app-2:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }
    
    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }
    
    # Main HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;
        
        # SSL configuration
        ssl_certificate /etc/nginx/ssl/your-domain.crt;
        ssl_certificate_key /etc/nginx/ssl/your-domain.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # Security
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        # Static assets caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://daynews_backend;
            proxy_cache_valid 200 1y;
            add_header Cache-Control "public, immutable";
            add_header X-Cache-Status $upstream_cache_status;
        }
        
        # API routes with rate limiting
        location /api/ {
            limit_req zone=api burst=10 nodelay;
            
            proxy_pass http://daynews_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 5s;
            proxy_send_timeout 10s;
            proxy_read_timeout 10s;
        }
        
        # Health check endpoint
        location /api/health {
            proxy_pass http://daynews_backend;
            access_log off;
        }
        
        # Main application
        location / {
            limit_req zone=general burst=20 nodelay;
            
            proxy_pass http://daynews_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # ISR-optimized caching
            proxy_cache_valid 200 5m;
            proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
            proxy_cache_background_update on;
            proxy_cache_lock on;
            
            # Timeouts
            proxy_connect_timeout 5s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }
        
        # Error pages
        error_page 404 /404.html;
        error_page 500 502 503 504 /50x.html;
        
        location = /50x.html {
            root /usr/share/nginx/html;
        }
    }
}
EOF

echo "✅ Created nginx configuration"

# 6. Create deployment scripts
cat > "$DEPLOY_DIR/deploy.sh" << 'EOF'
#!/bin/bash

# DayNews ISR Deployment Script
set -e

echo "🚀 Starting DayNews ISR deployment..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed."; exit 1; }

# Load environment variables
if [ -f .env.production ]; then
    source .env.production
else
    echo "❌ .env.production file not found. Please create it with required environment variables."
    exit 1
fi

# Build and start services
echo "📦 Building Docker images..."
docker-compose -f docker/docker-compose.yml build

echo "🔄 Starting services..."
docker-compose -f docker/docker-compose.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "✅ Deployment successful! Application is running at http://localhost:3000"
else
    echo "❌ Health check failed. Check logs with: docker-compose -f docker/docker-compose.yml logs"
    exit 1
fi

echo "📊 Service status:"
docker-compose -f docker/docker-compose.yml ps
EOF

chmod +x "$DEPLOY_DIR/deploy.sh"

# 7. Create environment template
cat > "$DEPLOY_DIR/.env.production.template" << 'EOF'
# DayNews ISR Production Environment Variables

# Application
NODE_ENV=production
PORT=3000

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Next.js Public Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Security
JWT_SECRET=your-jwt-secret-key
CORS_ORIGIN=https://your-domain.com

# Cache
REDIS_URL=redis://localhost:6379

# ISR Configuration
ISR_CACHE_TTL=3600
ISR_REVALIDATE_ON_DEMAND=true

# Monitoring (optional)
GRAFANA_PASSWORD=your-grafana-password

# External Services
WEATHER_API_KEY=your-weather-api-key
MAPS_API_KEY=your-maps-api-key
EOF

# 8. Create monitoring configuration
mkdir -p "$DEPLOY_DIR/monitoring"

cat > "$DEPLOY_DIR/monitoring/prometheus.yml" << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'daynews-app'
    static_configs:
      - targets: ['daynews-app:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
EOF

# 9. Create backup script
cat > "$DEPLOY_DIR/backup.sh" << 'EOF'
#!/bin/bash

# DayNews ISR Backup Script
set -e

BACKUP_DIR="/backups/daynews/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup at $BACKUP_DIR"

# Backup Redis data
echo "💾 Backing up Redis data..."
docker exec daynews-redis redis-cli SAVE
docker cp daynews-redis:/data/dump.rdb "$BACKUP_DIR/redis-dump.rdb"

# Backup application logs
echo "📋 Backing up application logs..."
docker cp daynews-isr:/app/logs "$BACKUP_DIR/app-logs"

# Backup nginx logs
echo "🌐 Backing up nginx logs..."
docker cp daynews-nginx:/var/log/nginx "$BACKUP_DIR/nginx-logs"

# Create metadata
echo "📝 Creating backup metadata..."
cat > "$BACKUP_DIR/metadata.json" << EOL
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "$(docker exec daynews-isr cat package.json | grep version | cut -d'"' -f4)",
  "containers": [
    "$(docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}' | grep daynews)"
  ]
}
EOL

# Compress backup
echo "🗜️ Compressing backup..."
tar -czf "${BACKUP_DIR}.tar.gz" -C "$(dirname "$BACKUP_DIR")" "$(basename "$BACKUP_DIR")"
rm -rf "$BACKUP_DIR"

echo "✅ Backup completed: ${BACKUP_DIR}.tar.gz"

# Cleanup old backups (keep last 7 days)
find /backups/daynews -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x "$DEPLOY_DIR/backup.sh"

# 10. Create README for deployment
cat > "$DEPLOY_DIR/README.md" << 'EOF'
# DayNews ISR Deployment Guide

This directory contains comprehensive deployment configurations for the DayNews ISR (Incremental Static Regeneration) system.

## Quick Start

1. **Copy environment template:**
   ```bash
   cp .env.production.template .env.production
   # Edit .env.production with your actual values
   ```

2. **Deploy with Docker:**
   ```bash
   ./deploy.sh
   ```

## Deployment Options

### 1. Docker Compose (Recommended)
- **File:** `docker/docker-compose.yml`
- **Usage:** `docker-compose -f docker/docker-compose.yml up -d`
- **Features:** Complete stack with Redis, Nginx, and optional monitoring

### 2. PM2 Process Manager
- **File:** `pm2/ecosystem.config.js`
- **Usage:** `pm2 start ecosystem.config.js --env production`
- **Features:** Cluster mode, auto-restart, logging

### 3. Systemd Service
- **File:** `systemd/daynews.service`
- **Installation:**
  ```bash
  sudo cp systemd/daynews.service /etc/systemd/system/
  sudo systemctl enable daynews
  sudo systemctl start daynews
  ```

## Configuration Files

- **PM2:** `pm2/ecosystem.config.js` - Process management
- **Docker:** `docker/Dockerfile` - Container image
- **Nginx:** `nginx/nginx.conf` - Reverse proxy and caching
- **Monitoring:** `monitoring/prometheus.yml` - Metrics collection

## Production Checklist

- [ ] Configure SSL certificates in nginx
- [ ] Set up database backups
- [ ] Configure monitoring alerts
- [ ] Test disaster recovery procedures
- [ ] Set up log rotation
- [ ] Configure firewall rules
- [ ] Set up CDN (optional)

## Monitoring

Access monitoring dashboards:
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3001 (admin/admin)

## Backup and Recovery

Run backup:
```bash
./backup.sh
```

Restore from backup:
```bash
# Stop services
docker-compose -f docker/docker-compose.yml down

# Restore Redis data
docker cp backup/redis-dump.rdb daynews-redis:/data/

# Restart services
docker-compose -f docker/docker-compose.yml up -d
```

## Security Considerations

1. **SSL/TLS:** Configure proper certificates
2. **Firewall:** Restrict access to necessary ports only
3. **Updates:** Keep base images and dependencies updated
4. **Secrets:** Use environment variables for sensitive data
5. **Monitoring:** Set up security alerts

## Performance Tuning

1. **Redis:** Adjust memory limits based on cache needs
2. **Nginx:** Tune worker processes and connections
3. **Node.js:** Optimize memory limits and worker count
4. **Database:** Index optimization and query performance

## Troubleshooting

Check service status:
```bash
docker-compose -f docker/docker-compose.yml ps
```

View logs:
```bash
docker-compose -f docker/docker-compose.yml logs -f daynews-app
```

Health check:
```bash
curl http://localhost:3000/api/health
```
EOF

echo ""
echo "🎉 Deployment configurations created successfully!"
echo ""
echo "📁 Files created in $DEPLOY_DIR:"
echo "   ├── pm2/ecosystem.config.js         # PM2 process management"
echo "   ├── docker/Dockerfile               # Container image"
echo "   ├── docker/docker-compose.yml       # Full stack deployment"
echo "   ├── systemd/daynews.service         # System service"
echo "   ├── nginx/nginx.conf                # Reverse proxy config"
echo "   ├── monitoring/prometheus.yml       # Metrics collection"
echo "   ├── .env.production.template        # Environment variables"
echo "   ├── deploy.sh                       # Deployment script"
echo "   ├── backup.sh                       # Backup script"
echo "   └── README.md                       # Deployment guide"
echo ""
echo "🚀 Next steps:"
echo "   1. Copy .env.production.template to .env.production"
echo "   2. Edit .env.production with your configuration"
echo "   3. Run ./deployment/deploy.sh to start deployment"
echo ""
echo "📖 See deployment/README.md for detailed instructions"