#!/bin/bash

# PDF Generator - Monitor de Performance para Alta Demanda
# Monitora métricas críticas para 2500+ clientes

echo "🚀 PDF Generator - Performance Monitor"
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "="

# Função para formatar números
format_number() {
    echo $1 | sed ':a;s/\B[0-9]\{3\}\>/,&/;ta'
}

# Verifica se o serviço está rodando
if curl -s http://localhost:8095/health > /dev/null 2>&1; then
    echo "✅ Serviço: ONLINE"
    
    # Obtém métricas do health endpoint
    HEALTH_DATA=$(curl -s http://localhost:8095/health)
    
    # Extrai métricas principais
    UPTIME=$(echo $HEALTH_DATA | jq -r '.uptime // 0' 2>/dev/null)
    MEMORY_USED=$(echo $HEALTH_DATA | jq -r '.memory.used // 0' 2>/dev/null)
    MEMORY_TOTAL=$(echo $HEALTH_DATA | jq -r '.memory.total // 0' 2>/dev/null)
    
    echo "⏱️  Uptime: ${UPTIME}s ($(echo $UPTIME/3600 | bc)h)"
    echo "💾 Memória: ${MEMORY_USED}MB / ${MEMORY_TOTAL}MB"
    
    # Browser Pool Stats
    ACTIVE_BROWSERS=$(echo $HEALTH_DATA | jq -r '.browsers.activeBrowsers // 0' 2>/dev/null)
    TOTAL_PAGES=$(echo $HEALTH_DATA | jq -r '.browsers.totalPages // 0' 2>/dev/null)
    QUEUE_LENGTH=$(echo $HEALTH_DATA | jq -r '.browsers.queueLength // 0' 2>/dev/null)
    UTILIZATION=$(echo $HEALTH_DATA | jq -r '.browsers.utilization // "0%"' 2>/dev/null)
    
    echo ""
    echo "🌐 Browser Pool:"
    echo "   Browsers Ativos: $ACTIVE_BROWSERS/4"
    echo "   Páginas em Uso: $TOTAL_PAGES/40"
    echo "   Fila de Espera: $QUEUE_LENGTH"
    echo "   Utilização: $UTILIZATION"
    
    # Page Pool Stats (se disponível)
    PAGE_POOL_AVAILABLE=$(echo $HEALTH_DATA | jq -r '.browsers.pagePool.available // 0' 2>/dev/null)
    PAGE_POOL_BUSY=$(echo $HEALTH_DATA | jq -r '.browsers.pagePool.busy // 0' 2>/dev/null)
    PAGE_POOL_EFFICIENCY=$(echo $HEALTH_DATA | jq -r '.browsers.pagePool.efficiency // "0%"' 2>/dev/null)
    
    if [ "$PAGE_POOL_AVAILABLE" != "0" ] || [ "$PAGE_POOL_BUSY" != "0" ]; then
        echo ""
        echo "📄 Page Pool:"
        echo "   Páginas Disponíveis: $PAGE_POOL_AVAILABLE"
        echo "   Páginas em Uso: $PAGE_POOL_BUSY"
        echo "   Eficiência: $PAGE_POOL_EFFICIENCY"
    fi
    
    # Cache Stats
    CACHE_SIZE=$(echo $HEALTH_DATA | jq -r '.cache.size // 0' 2>/dev/null)
    CACHE_HIT_RATE=$(echo $HEALTH_DATA | jq -r '.cache.hitRate // "0%"' 2>/dev/null)
    CACHE_MEMORY=$(echo $HEALTH_DATA | jq -r '.cache.totalSizeMB // 0' 2>/dev/null)
    
    if [ "$CACHE_SIZE" != "0" ]; then
        echo ""
        echo "🗂️  Cache:"
        echo "   PDFs em Cache: $CACHE_SIZE/100"
        echo "   Taxa de Acerto: $CACHE_HIT_RATE"
        echo "   Memória Cache: ${CACHE_MEMORY}MB"
    fi
    
    # Performance Stats
    TOTAL_REQUESTS=$(echo $HEALTH_DATA | jq -r '.stats.requests // 0' 2>/dev/null)
    CACHE_HITS=$(echo $HEALTH_DATA | jq -r '.stats.cacheHits // 0' 2>/dev/null)
    ERRORS=$(echo $HEALTH_DATA | jq -r '.stats.errors // 0' 2>/dev/null)
    
    if [ "$TOTAL_REQUESTS" != "0" ]; then
        echo ""
        echo "📊 Performance:"
        echo "   Requisições: $(format_number $TOTAL_REQUESTS)"
        echo "   Cache Hits: $(format_number $CACHE_HITS)"
        echo "   Erros: $(format_number $ERRORS)"
        
        if [ "$TOTAL_REQUESTS" -gt 0 ]; then
            SUCCESS_RATE=$(echo "scale=1; ($TOTAL_REQUESTS - $ERRORS) * 100 / $TOTAL_REQUESTS" | bc 2>/dev/null)
            echo "   Taxa de Sucesso: ${SUCCESS_RATE}%"
        fi
    fi
    
    # Análise de Capacidade
    echo ""
    echo "⚡ Análise de Capacidade:"
    
    if [ "$UTILIZATION" != "0%" ]; then
        UTIL_NUM=$(echo $UTILIZATION | sed 's/%//')
        if (( $(echo "$UTIL_NUM > 80" | bc -l) )); then
            echo "   ⚠️  Utilização ALTA: $UTILIZATION"
            echo "   💡 Considere escalonamento horizontal"
        elif (( $(echo "$UTIL_NUM > 60" | bc -l) )); then
            echo "   🟡 Utilização MODERADA: $UTILIZATION"
            echo "   👀 Monitore picos de demanda"
        else
            echo "   ✅ Utilização NORMAL: $UTILIZATION"
            echo "   🚀 Capacidade disponível"
        fi
    fi
    
    # Throughput estimado
    if [ "$TOTAL_PAGES" != "0" ]; then
        CURRENT_THROUGHPUT=$((TOTAL_PAGES * 60 / 4)) # Estimativa de PDFs/min
        echo "   📈 Throughput Atual: ~${CURRENT_THROUGHPUT} PDFs/min"
        
        if [ $CURRENT_THROUGHPUT -gt 80 ]; then
            echo "   🔥 ALTA DEMANDA detectada"
        elif [ $CURRENT_THROUGHPUT -gt 40 ]; then
            echo "   📊 Demanda moderada"
        else
            echo "   😴 Baixa demanda"
        fi
    fi
    
    # Recomendações baseadas nas métricas
    echo ""
    echo "💡 Recomendações:"
    
    if [ "$QUEUE_LENGTH" -gt 0 ]; then
        echo "   ⚠️  Fila detectada ($QUEUE_LENGTH) - Considere mais browsers"
    fi
    
    if [ "$MEMORY_USED" -gt 2048 ]; then
        echo "   ⚠️  Uso alto de memória (${MEMORY_USED}MB) - Monitore cache"
    fi
    
    if [ "$CACHE_HIT_RATE" != "0%" ]; then
        CACHE_NUM=$(echo $CACHE_HIT_RATE | sed 's/%//')
        if (( $(echo "$CACHE_NUM < 30" | bc -l) )); then
            echo "   📋 Cache hit rate baixo ($CACHE_HIT_RATE) - Verifique TTL"
        fi
    fi
    
    echo "   ✅ Sistema operando dentro dos parâmetros"
    
else
    echo "❌ Serviço: OFFLINE"
    echo ""
    echo "🔧 Para iniciar o serviço:"
    echo "   docker-compose up -d"
    echo "   # OU"
    echo "   npm start"
fi

echo ""
echo "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "="
echo "📊 Para monitoramento contínuo:"
echo "   watch -n 5 ./monitor-performance.sh"
echo ""
echo "📈 Para teste de carga:"
echo "   node docs/LOAD-TEST.js 30"
