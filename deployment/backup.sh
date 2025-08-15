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
