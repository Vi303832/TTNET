/**
 * Simple HTTP Request Logger Middleware
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : status >= 300 ? '\x1b[36m' : '\x1b[32m';
    const resetColor = '\x1b[0m';
    
    console.log(`[${new Date().toLocaleTimeString()}] ${method} ${originalUrl} ${statusColor}${status}${resetColor} - ${duration}ms`);
  });

  next();
}

module.exports = requestLogger;
