import AppError from "../utils/AppError.js";

export default function requireRole(...allowedRoles) {
  const allowed = allowedRoles.flat().map((role) => String(role).toUpperCase());

  return function roleMiddleware(req, _res, next) {
    if (!req.user) return next(new AppError(401, "Authentication is required.", "UNAUTHORIZED"));
    if (!allowed.includes(req.user.userType)) {
      return next(new AppError(403, "You do not have permission to access this resource.", "FORBIDDEN"));
    }
    return next();
  };
}
