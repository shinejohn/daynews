#!/bin/bash

echo "📊 Cache Monitor"
echo "==============="

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq is required. Install with: brew install jq (Mac) or apt-get install jq (Linux)"
    exit 1
fi

while true; do
  clear
  echo "📊 Cache Statistics - $(date)"
  echo "================================"
  
  # Show cache stats via API
  STATS=$(curl -s http://localhost:3000/health 2>/dev/null)
  
  if [ $? -eq 0 ]; then
    echo "Cache Performance:"
    echo "$STATS" | jq -r '.cache | "  Hit Rate: \(.hitRate * 100 | floor)%"'
    echo "$STATS" | jq -r '.cache | "  Total Hits: \(.hits)"'
    echo "$STATS" | jq -r '.cache | "  Total Misses: \(.misses)"'
    echo "$STATS" | jq -r '.cache | "  Entries: \(.entries)"'
    echo ""
    echo "System Info:"
    echo "$STATS" | jq -r '"  Database: \(.database)"'
    echo "$STATS" | jq -r '"  Uptime: \(.uptime | floor)s"'
    echo "$STATS" | jq -r '.memory | "  Memory: \(.heapUsed / 1024 / 1024 | floor)MB / \(.heapTotal / 1024 / 1024 | floor)MB"'
  else
    echo "❌ Server not responding"
  fi
  
  echo ""
  echo "📁 Recent Cache Files:"
  echo "---------------------"
  ls -lat cache/*.json 2>/dev/null | head -10 | while read line; do
    echo "  $line"
  done || echo "  No cache files found"
  
  echo ""
  echo "💾 Cache Size: $(du -sh cache 2>/dev/null | cut -f1 || echo '0')"
  echo ""
  echo "Press Ctrl+C to exit | Refreshing in 5s..."
  
  sleep 5
done
