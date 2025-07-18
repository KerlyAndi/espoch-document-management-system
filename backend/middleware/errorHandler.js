const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack);

  // Default error
  let error = {
    message: err.message || 'Error interno del servidor',
    status: err.status || 500
  };

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    error.message = 'Ya existe un registro con esos datos';
    error.status = 400;
  }

  if (err.code === 'ER_NO_SUCH_TABLE') {
    error.message = 'Tabla de base de datos no encontrada';
    error.status = 500;
  }

  if (err.code === 'ECONNREFUSED') {
    error.message = 'No se puede conectar a la base de datos';
    error.status = 500;
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'El archivo es demasiado grande';
    error.status = 400;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = 'Tipo de archivo no permitido';
    error.status = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token inválido';
    error.status = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expirado';
    error.status = 401;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = 'Datos de entrada inválidos';
    error.status = 400;
  }

  res.status(error.status).json({
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
