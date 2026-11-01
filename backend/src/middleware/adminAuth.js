let _warnedOnce = false;

/**
 * Middleware that checks the X-Admin-Token header.
 *
 * - If ADMIN_TOKEN env var is not set: logs a one-time warning and lets
 *   requests pass (development convenience).
 * - If ADMIN_TOKEN is set: requires the header to match.
 *   Returns 401 when the header is absent, 403 when it is wrong.
 */
export function adminAuth(req, res, next) {
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    if (!_warnedOnce) {
      console.warn(
        "[adminAuth] WARNING: ADMIN_TOKEN is not set. " +
          "Admin endpoints are unprotected. Set ADMIN_TOKEN before deploying."
      );
      _warnedOnce = true;
    }
    return next();
  }

  const providedToken = req.headers["x-admin-token"];

  if (!providedToken) {
    return res.status(401).json({ error: "Yêu cầu xác thực quản trị viên." });
  }
  if (providedToken !== expectedToken) {
    return res.status(403).json({ error: "Token quản trị viên không hợp lệ." });
  }

  return next();
}
