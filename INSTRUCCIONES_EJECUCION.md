# 🚀 INSTRUCCIONES DE EJECUCIÓN - Sistema ESPOCH

## ⚡ EJECUCIÓN RÁPIDA (Recomendado)

### 1. Preparar MySQL
```bash
# Instalar MySQL (si no está instalado)
# Ubuntu/Debian:
sudo apt install mysql-server

# macOS:
brew install mysql

# Windows: Descargar desde https://dev.mysql.com/downloads/mysql/

# Iniciar MySQL
sudo systemctl start mysql  # Linux
brew services start mysql   # macOS

# Crear la base de datos
mysql -u root -p < mysql/schema.sql
```

### 2. Ejecutar con Script Automático
```bash
# Hacer ejecutable el script (solo la primera vez)
chmod +x start-dev.sh

# Ejecutar todo el sistema
./start-dev.sh
```

**¡Listo! El sistema estará disponible en:**
- 🌐 **Frontend**: http://localhost:8000
- ⚡ **Backend**: http://localhost:5000
- 🐍 **FastAPI**: http://localhost:8001

---

## 🔧 EJECUCIÓN MANUAL (Paso a paso)

### 1. Instalar Dependencias

#### Frontend (Next.js)
```bash
npm install
```

#### Backend (Express.js)
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus configuraciones de MySQL
cd ..
```

#### FastAPI (Python)
```bash
cd fastapi-service
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Configurar Base de Datos
```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el schema
source mysql/schema.sql
```

### 3. Iniciar Servicios (en terminales separadas)

#### Terminal 1 - FastAPI
```bash
cd fastapi-service
source venv/bin/activate
python app.py
```

#### Terminal 2 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 3 - Frontend
```bash
npm run dev
```

---

## 🐳 EJECUCIÓN CON DOCKER

### Opción 1: Docker Compose (Más fácil)
```bash
# Construir e iniciar todos los servicios
docker-compose up --build

# En segundo plano
docker-compose up -d --build

# Detener
docker-compose down
```

### Opción 2: Docker Manual
```bash
# Crear red
docker network create espoch-network

# MySQL
docker run -d --name espoch-mysql \
  --network espoch-network \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=espoch_docs \
  -p 3306:3306 \
  mysql:8.0

# FastAPI
docker build -t espoch-fastapi ./fastapi-service
docker run -d --name espoch-fastapi \
  --network espoch-network \
  -p 8001:8001 \
  espoch-fastapi

# Backend
docker build -t espoch-backend ./backend
docker run -d --name espoch-backend \
  --network espoch-network \
  -p 5000:5000 \
  -e DB_HOST=espoch-mysql \
  espoch-backend

# Frontend
docker build -t espoch-frontend .
docker run -d --name espoch-frontend \
  --network espoch-network \
  -p 3000:3000 \
  espoch-frontend
```

---

## 🛠️ CONFIGURACIÓN INICIAL

### Variables de Entorno

#### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_password_mysql
DB_NAME=espoch_docs
PORT=5000
JWT_SECRET=tu_jwt_secreto_muy_seguro
FASTAPI_URL=http://localhost:8001
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE=http://localhost:5000/api
```

### Usuario por Defecto
- **Email**: admin@espoch.edu.ec
- **Password**: admin123

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

### 1. Verificar Servicios
```bash
# Backend
curl http://localhost:5000/api/health

# FastAPI
curl http://localhost:8001/health

# Frontend (abrir en navegador)
http://localhost:8000
```

### 2. Endpoints de Prueba
```bash
# Listar documentos
curl http://localhost:5000/api/documents

# Estado de FastAPI
curl http://localhost:8001/

# Documentación de FastAPI
http://localhost:8001/docs
```

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### Error: Puerto en uso
```bash
# Encontrar proceso
sudo lsof -i :8000  # o :5000, :8001

# Matar proceso
sudo kill -9 <PID>

# O usar el script de parada
./stop-dev.sh
```

### Error: MySQL no conecta
```bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Reiniciar MySQL
sudo systemctl restart mysql

# Verificar usuario y contraseña en backend/.env
```

### Error: Dependencias de Python
```bash
cd fastapi-service
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Error: Permisos de archivos
```bash
# Dar permisos a scripts
chmod +x start-dev.sh stop-dev.sh

# Permisos a directorio uploads
chmod 755 backend/uploads
```

---

## 📱 ACCESO AL SISTEMA

Una vez que todo esté ejecutándose:

1. **Abrir navegador** en http://localhost:8000
2. **Registrar nuevo usuario** o usar admin@espoch.edu.ec / admin123
3. **Subir documentos** usando el botón "Subir Documento"
4. **Ver procesamiento** en tiempo real

---

## 🛑 DETENER EL SISTEMA

### Con Script
```bash
./stop-dev.sh
```

### Manual
```bash
# Ctrl+C en cada terminal
# O matar procesos por puerto
sudo lsof -ti:8000,5000,8001 | xargs kill -9
```

### Docker
```bash
docker-compose down
```

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa los logs en las terminales
2. Verifica que MySQL esté corriendo
3. Asegúrate de que los puertos 8000, 5000, 8001 estén libres
4. Revisa las variables de entorno en los archivos .env

**¡El sistema está completo y listo para usar!** 🎉
