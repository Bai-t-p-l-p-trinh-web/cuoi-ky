/**
 * Standardized error handling utility
 */

class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class ErrorHandler {
  static handleCastErrorDB(err) {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new ApiError(400, message);
  }

  static handleDuplicateFieldsDB(err) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new ApiError(400, message);
  }

  static handleValidationErrorDB(err) {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new ApiError(400, message);
  }

  static handleJWTError() {
    return new ApiError(401, "Invalid token. Please log in again!");
  }

  static handleJWTExpiredError() {
    return new ApiError(401, "Your token has expired! Please log in again.");
  }

  static sendErrorDev(err, res) {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  static sendErrorProd(err, res) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    } else {
      // Programming or other unknown error: don't leak error details
      console.error("ERROR 💥", err);
      res.status(500).json({
        success: false,
        message: "Something went wrong!",
      });
    }
  }

  static globalErrorHandler(err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
      ErrorHandler.sendErrorDev(err, res);
    } else {
      let error = { ...err };
      error.message = err.message;

      if (error.name === "CastError")
        error = ErrorHandler.handleCastErrorDB(error);
      if (error.code === 11000)
        error = ErrorHandler.handleDuplicateFieldsDB(error);
      if (error.name === "ValidationError")
        error = ErrorHandler.handleValidationErrorDB(error);
      if (error.name === "JsonWebTokenError")
        error = ErrorHandler.handleJWTError();
      if (error.name === "TokenExpiredError")
        error = ErrorHandler.handleJWTExpiredError();

      ErrorHandler.sendErrorProd(error, res);
    }
  }

  static catchAsync(fn) {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  }

  static standardResponse(res, statusCode, data, message = "Success") {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static standardError(res, statusCode, message, error = null) {
    const response = {
      success: false,
      message,
    };

    if (error && process.env.NODE_ENV === "development") {
      response.error = error;
    }

    return res.status(statusCode).json(response);
  }
}

module.exports = { ApiError, ErrorHandler };
