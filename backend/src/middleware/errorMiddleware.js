import AppError from "../utils/AppError.js";

export function notFoundHandler(req, _res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`, "ROUTE_NOT_FOUND"));
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || error.status || (error instanceof SyntaxError && "body" in error ? 400 : 500);
  const production = process.env.NODE_ENV === "production";
  const message = statusCode >= 500 && production ? "Internal server error." : error.message || "Internal server error.";

  if (statusCode >= 500 && !error.isOperational) {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code: error.code || "INTERNAL_ERROR",
      message,
      ...(!production && error.details ? { details: error.details } : {}),
    },
  });
}
