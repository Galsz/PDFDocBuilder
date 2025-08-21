#!/bin/bash
# Script de monitoramento para EC2
# Execute: chmod +x monitor.sh && ./monitor.sh

echo "=== MONITORAMENTO PDF GENERATOR ==="
echo "Data: $(date)"
echo ""

echo "--- DOCKER CONTAINER ---"
docker stats pdf-doc-builder --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
echo ""

echo "--- HEALTH CHECK ---"
curl -s http://localhost:8092/health | jq '.'
echo ""

echo "--- MEMORY TOTAL EC2 ---"
free -h
echo ""

echo "--- DISK USAGE ---"
df -h
echo ""

echo "--- DOCKER LOGS (últimas 10 linhas) ---"
docker logs pdf-doc-builder --tail 10
echo ""

echo "--- PROCESSOS CHROME/NODE ---"
ps aux | grep -E "(chrome|chromium|node)" | grep -v grep
echo ""

echo "=== FIM MONITORAMENTO ==="
