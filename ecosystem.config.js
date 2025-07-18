module.exports = {
  apps: [
    {
      name: 'espoch-frontend',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_BASE: 'http://localhost:5000/api'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_BASE: 'https://tu-dominio.com/api'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    },
    {
      name: 'espoch-backend',
      script: 'index.js',
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        DB_HOST: 'localhost',
        DB_USER: 'espoch_user',
        DB_PASS: 'secure_password',
        DB_NAME: 'espoch_docs',
        JWT_SECRET: 'super_secure_jwt_secret_for_production',
        FASTAPI_URL: 'http://localhost:8001',
        UPLOAD_DIR: 'uploads',
        MAX_FILE_SIZE: '10485760'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        DB_HOST: 'localhost',
        DB_USER: 'espoch_user',
        DB_PASS: 'secure_password',
        DB_NAME: 'espoch_docs',
        JWT_SECRET: 'super_secure_jwt_secret_for_production',
        FASTAPI_URL: 'http://localhost:8001',
        UPLOAD_DIR: 'uploads',
        MAX_FILE_SIZE: '10485760'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'espoch-fastapi',
      script: 'app.py',
      cwd: './fastapi-service',
      interpreter: './fastapi-service/venv/bin/python',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        PYTHONPATH: './fastapi-service',
        PORT: 8001,
        HOST: '0.0.0.0'
      },
      error_file: './logs/fastapi-error.log',
      out_file: './logs/fastapi-out.log',
      log_file: './logs/fastapi-combined.log',
      time: true
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'tu-servidor.com',
      ref: 'origin/main',
      repo: 'git@github.com:tu-usuario/espoch-docs.git',
      path: '/var/www/espoch-docs',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && cd backend && npm install --production && cd ../fastapi-service && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cd .. && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
