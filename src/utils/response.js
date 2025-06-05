function sendResponse(res, { success, message, status = 200, ...data }) {
  res.status(status).json({ success, message, ...data });
}

module.exports = { sendResponse };
