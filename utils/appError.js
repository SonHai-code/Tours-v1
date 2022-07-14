const { Error } = require('mongoose');

class AppError extends Error {
  constructor(message, statusCode) {
    // Super calls parent's contructor
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
