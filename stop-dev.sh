#!/bin/bash

# Script para detener todos los servicios del Sistema ESPOCH
echo "🛑 Deteniendo Sistema de Gestión de Documentos ESPOCH"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para matar procesos por puerto
kill_port() {
    local port=$1
    local service_name=$2
    
    echo -e "${BLUE}🔍 Buscando procesos en puerto $port ($service_name)...${NC}"
    
    # Buscar procesos usando el puerto
    local pids=$(lsof -ti:$port)
    
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}⚡ Deteniendo $service_name (PIDs: $pids)...${NC}"
        kill -TERM $pids 2>/dev/null
        sleep 2
        
        # Verificar si aún están corriendo
        local remaining_pids=$(lsof -ti:$port)
        if [ -n "$remaining_pids" ]; then
            echo -e "${RED}💀 Forzando cierre de $service_name...${NC}"
            kill -KILL $remaining_pids 2>/dev/null
        fi
        
        echo -e "${GREEN}✅ $service_name detenido${NC}"
    else
        echo -e "${GREEN}✅ No hay procesos corriendo en puerto $port${NC}"
    fi
}

# Función para limpiar archivos PID
cleanup_pid_files() {
    echo -e "${BLUE}🧹 Limpiando archivos PID...${NC}"
    
    if [ -f .frontend.pid ]; then
        local pid=$(cat .frontend.pid)
        kill $pid 2>/dev/null
        rm .frontend.pid
        echo -e "${GREEN}✅ Frontend PID limpiado${NC}"
    fi
    
    if [ -f .backend.pid ]; then
        local pid=$(cat .backend.pid)
        kill $pid 2>/dev/null
        rm .backend.pid
        echo -e "${GREEN}✅ Backend PID limpiado${NC}"
    fi
    
    if [ -f .fastapi.pid ]; then
        local pid=$(cat .fastapi.pid)
        kill $pid 2>/dev/null
        rm .fastapi.pid
        echo -e "${GREEN}✅ FastAPI PID limpiado${NC}"
    fi
}

# Función para matar procesos por nombre
kill_by_name() {
    local process_name=$1
    local service_name=$2
    
    echo -e "${BLUE}🔍 Buscando procesos de $service_name...${NC}"
    
    local pids=$(pgrep -f "$process_name")
    
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}⚡ Deteniendo $service_name (PIDs: $pids)...${NC}"
        pkill -TERM -f "$process_name" 2>/dev/null
        sleep 2
        
        # Verificar si aún están corriendo
        local remaining_pids=$(pgrep -f "$process_name")
        if [ -n "$remaining_pids" ]; then
            echo -e "${RED}💀 Forzando cierre de $service_name...${NC}"
            pkill -KILL -f "$process_name" 2>/dev/null
        fi
        
        echo -e "${GREEN}✅ $service_name detenido${NC}"
    else
        echo -e "${GREEN}✅ No hay procesos de $service_name corriendo${NC}"
    fi
}

# Función principal
main() {
    echo -e "${BLUE}🏁 Iniciando proceso de cierre...${NC}"
    
    # Limpiar archivos PID primero
    cleanup_pid_files
    
    # Detener servicios por puerto
    kill_port 8000 "Frontend (Next.js)"
    kill_port 5000 "Backend (Express.js)"
    kill_port 8001 "FastAPI"
    
    # Detener procesos por nombre como respaldo
    kill_by_name "next dev" "Next.js"
    kill_by_name "node.*index.js" "Express.js"
    kill_by_name "python.*app.py" "FastAPI"
    kill_by_name "uvicorn" "FastAPI (uvicorn)"
    
    # Limpiar procesos de Node.js relacionados con el proyecto
    echo -e "${BLUE}🔍 Limpiando procesos Node.js del proyecto...${NC}"
    pkill -f "node.*espoch" 2>/dev/null || true
    
    # Verificar que todos los puertos estén libres
    echo -e "${BLUE}🔍 Verificando puertos...${NC}"
    
    for port in 8000 5000 8001; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${RED}⚠️  Puerto $port aún en uso${NC}"
        else
            echo -e "${GREEN}✅ Puerto $port libre${NC}"
        fi
    done
    
    # Limpiar archivos temporales
    echo -e "${BLUE}🧹 Limpiando archivos temporales...${NC}"
    rm -f *.log 2>/dev/null || true
    rm -f .next/trace 2>/dev/null || true
    
    echo ""
    echo -e "${GREEN}🎉 Todos los servicios han sido detenidos${NC}"
    echo -e "${BLUE}💡 Para reiniciar el sistema, ejecuta: ${GREEN}./start-dev.sh${NC}"
}

# Ejecutar función principal
main "$@"
