/**
 * Global Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  console.error('🔥 Hata Yakalandı:', err);

  const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Sunucu içi beklenmeyen bir hata oluştu.',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}

/**
 * 404 Not Found Middleware
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `İstenen uç nokta bulunamadı: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
