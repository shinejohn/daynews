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
