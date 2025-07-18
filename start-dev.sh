#!/bin/bash

# Script de inicio para desarrollo - Sistema ESPOCH
# Este script inicia todos los servicios necesarios para desarrollo local

echo "🚀 Iniciando Sistema de Gestión de Documentos ESPOCH"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar si un puerto está en uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Puerto $1 está en uso${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Puerto $1 disponible${NC}"
        return 0
    fi
}

# Función para verificar dependencias
check_dependencies() {
    echo -e "${BLUE}🔍 Verificando dependencias...${NC}"
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js no está instalado${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
    fi
    
    # Verificar Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python3 no está instalado${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Python $(python3 --version)${NC}"
    fi
    
    # Verificar MySQL
    if ! command -v mysql &> /dev/null; then
        echo -e "${YELLOW}⚠️  MySQL no encontrado en PATH${NC}"
        echo -e "${YELLOW}   Asegúrate de que MySQL esté ejecutándose${NC}"
    else
        echo -e "${GREEN}✅ MySQL disponible${NC}"
    fi
}

# Función para instalar dependencias si no existen
install_dependencies() {
    echo -e "${BLUE}📦 Verificando e instalando dependencias...${NC}"
    
    # Frontend
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Instalando dependencias del frontend...${NC}"
        npm install
    fi
    
    # Backend
    if [ ! -d "backend/node_modules" ]; then
        echo -e "${YELLOW}📦 Instalando dependencias del backend...${NC}"
        cd backend && npm install && cd ..
    fi
    
    # FastAPI
    if [ ! -d "fastapi-service/venv" ]; then
        echo -e "${YELLOW}📦 Creando entorno virtual para FastAPI...${NC}"
        cd fastapi-service
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        cd ..
    fi
}

# Función para verificar configuración
check_config() {
    echo -e "${BLUE}⚙️  Verificando configuración...${NC}"
    
    # Verificar .env del backend
    if [ ! -f "backend/.env" ]; then
        echo -e "${YELLOW}⚠️  Creando archivo .env para backend...${NC}"
        cp backend/.env backend/.env 2>/dev/null || echo "DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=espoch_docs
PORT=5000
NODE_ENV=development
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
FASTAPI_URL=http://localhost:8001
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760" > backend/.env
    fi
    
    # Crear directorio de uploads
    mkdir -p backend/uploads
    
    echo -e "${GREEN}✅ Configuración verificada${NC}"
}

# Función para iniciar servicios
start_services() {
    echo -e "${BLUE}🚀 Iniciando servicios...${NC}"
    
    # Verificar puertos
    echo -e "${BLUE}🔍 Verificando puertos...${NC}"
    check_port 8000  # Frontend
    check_port 5000  # Backend
    check_port 8001  # FastAPI
    
    # Iniciar FastAPI en background
    echo -e "${YELLOW}🐍 Iniciando FastAPI (Puerto 8001)...${NC}"
    cd fastapi-service
    source venv/bin/activate
    python app.py &
    FASTAPI_PID=$!
    cd ..
    sleep 3
    
    # Iniciar Backend en background
    echo -e "${YELLOW}⚡ Iniciando Backend Express (Puerto 5000)...${NC}"
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    sleep 3
    
    # Iniciar Frontend
    echo -e "${YELLOW}🌐 Iniciando Frontend Next.js (Puerto 8000)...${NC}"
    npm run dev &
    FRONTEND_PID=$!
    
    # Guardar PIDs para poder terminar los procesos después
    echo $FASTAPI_PID > .fastapi.pid
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
    
    sleep 5
    
    echo -e "${GREEN}✅ Todos los servicios iniciados${NC}"
    echo ""
    echo -e "${BLUE}📋 URLs de acceso:${NC}"
    echo -e "   🌐 Frontend:  ${GREEN}http://localhost:8000${NC}"
    echo -e "   ⚡ Backend:   ${GREEN}http://localhost:5000${NC}"
    echo -e "   🐍 FastAPI:   ${GREEN}http://localhost:8001${NC}"
    echo ""
    echo -e "${BLUE}📋 Endpoints útiles:${NC}"
    echo -e "   📊 Health Backend:  ${GREEN}http://localhost:5000/api/health${NC}"
    echo -e "   📊 Health FastAPI:  ${GREEN}http://localhost:8001/health${NC}"
    echo -e "   📁 API Docs:        ${GREEN}http://localhost:8001/docs${NC}"
    echo ""
    echo -e "${YELLOW}💡 Para detener todos los servicios, ejecuta: ${GREEN}./stop-dev.sh${NC}"
    echo -e "${YELLOW}💡 Para ver logs en tiempo real: ${GREEN}tail -f *.log${NC}"
}

# Función para manejar la interrupción (Ctrl+C)
cleanup() {
    echo -e "\n${YELLOW}🛑 Deteniendo servicios...${NC}"
    
    if [ -f .frontend.pid ]; then
        kill $(cat .frontend.pid) 2>/dev/null
        rm .frontend.pid
    fi
    
    if [ -f .backend.pid ]; then
        kill $(cat .backend.pid) 2>/dev/null
        rm .backend.pid
    fi
    
    if [ -f .fastapi.pid ]; then
        kill $(cat .fastapi.pid) 2>/dev/null
        rm .fastapi.pid
    fi
    
    echo -e "${GREEN}✅ Servicios detenidos${NC}"
    exit 0
}

# Configurar trap para cleanup
trap cleanup SIGINT SIGTERM

# Función principal
main() {
    echo -e "${BLUE}🏁 Iniciando verificaciones...${NC}"
    
    check_dependencies
    install_dependencies
    check_config
    start_services
    
    echo -e "${GREEN}🎉 Sistema iniciado correctamente${NC}"
    echo -e "${BLUE}📝 Presiona Ctrl+C para detener todos los servicios${NC}"
    
    # Mantener el script corriendo
    wait
}

# Verificar si se está ejecutando como script principal
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
