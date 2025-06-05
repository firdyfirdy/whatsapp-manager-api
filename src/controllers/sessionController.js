// This module will handle API logic for sessions

const { sendResponse } = require('../utils/response');
const whatsappService = require('../services/whatsappService');
const Joi = require('joi');

// Validation schema
const sessionNameSchema = Joi.string().regex(/^[\w-]+$/).required();

const listSessions = (req, res) => {
  try {
    sendResponse(res, { success: true, message: 'Sessions fetched', sessions: Object.keys(whatsappService.clients) });
  } catch (e) {
    sendResponse(res, { success: false, message: e.message, status: 500 });
  }
};

const createSession = (req, res) => {
  try {
    const { sessionName } = req.body;
    const { error } = sessionNameSchema.validate(sessionName);
    if (error) return sendResponse(res, { success: false, message: 'Invalid sessionName. Only alphanumeric, underscore, hyphen allowed.', status: 400 });
    if (whatsappService.clients[sessionName]) return sendResponse(res, { success: false, message: 'Session exists', status: 400 });
    whatsappService.createClient(sessionName);
    sendResponse(res, { success: true, message: 'Session created. Scan QR to pair.' });
  } catch (e) {
    sendResponse(res, { success: false, message: e.message, status: 500 });
  }
};

const getSessionQR = (req, res) => {
  try {
    const { sessionName } = req.params;
    const clientObj = whatsappService.clients[sessionName];
    if (!clientObj) return sendResponse(res, { success: false, message: 'Session not found', status: 404 });
    if (!clientObj.qr) return sendResponse(res, { success: false, message: 'QR not available', status: 404 });
    sendResponse(res, { success: true, message: 'QR fetched', qr: clientObj.qr });
  } catch (e) {
    sendResponse(res, { success: false, message: e.message, status: 500 });
  }
};

const removeSession = (req, res) => {
  try {
    const { sessionName } = req.params;
    const clientObj = whatsappService.clients[sessionName];
    if (!clientObj) return sendResponse(res, { success: false, message: 'Session not found', status: 404 });
    whatsappService.removeClient(sessionName);
    sendResponse(res, { success: true, message: 'Session removed' });
  } catch (e) {
    sendResponse(res, { success: false, message: e.message, status: 500 });
  }
};

const setWebhook = (req, res) => {
  try {
    const { sessionName } = req.params;
    const { webhook, username, password } = req.body;
    const clientObj = whatsappService.clients[sessionName];
    if (!clientObj) return sendResponse(res, { success: false, message: 'Session not found', status: 404 });
    clientObj.webhook = webhook;
    clientObj.auth = username && password ? { username, password } : undefined;
    whatsappService.saveSession(sessionName, webhook, clientObj.auth);
    sendResponse(res, { success: true, message: 'Webhook set' });
  } catch (e) {
    sendResponse(res, { success: false, message: e.message, status: 500 });
  }
};

const getWebhook = (req, res) => {
  try {
    const { sessionName } = req.params;
    const clientObj = whatsappService.clients[sessionName];
    if (!clientObj) return sendResponse(res, { success: false, message: 'Session not found', status: 404 });
    sendResponse(res, { success: true, message: 'Webhook fetched', webhook: clientObj.webhook, username: clientObj.auth?.username });
  } catch (e) {
    sendResponse(res, { success: false, message: e.message, status: 500 });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { sessionName } = req.params;
    const { to, message } = req.body;
    const clientObj = whatsappService.clients[sessionName];
    if (!clientObj) return sendResponse(res, { success: false, message: 'Session not found', status: 404 });
    await clientObj.client.sendMessage(to, message);
    sendResponse(res, { success: true, message: 'Message sent' });
  } catch (e) {
    sendResponse(res, { success: false, message: e.message, status: 500 });
  }
};

module.exports = {
  listSessions,
  createSession,
  getSessionQR,
  removeSession,
  setWebhook,
  getWebhook,
  sendMessage
};
