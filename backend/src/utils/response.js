export function sendSuccess(res, { status = 200, data = null, message } = {}) {
  return res.status(status).json({ success: true, ...(message ? { message } : {}), data });
}
