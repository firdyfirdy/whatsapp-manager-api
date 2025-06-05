// This module will handle WhatsApp client/session logic

const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { logger } = require('../utils/logger');
const { SESSIONS_DIR, CHROME_EXECUTABLE_PATH } = require('../config');

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);

const clients = {}; // sessionName -> { client, webhook, auth, qr }

function getSessionFile(sessionName) {
  return path.join(SESSIONS_DIR, `${sessionName}.json`);
}

function loadSessions() {
  fs.readdirSync(SESSIONS_DIR).forEach(file => {
    const sessionName = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(getSessionFile(sessionName)));
    createClient(sessionName, data.webhook, data.auth);
  });
}

function saveSession(sessionName, webhook, auth) {
  if (fs.existsSync(getSessionFile(sessionName))) fs.unlinkSync(getSessionFile(sessionName));
  fs.writeFileSync(getSessionFile(sessionName), JSON.stringify({ webhook, auth }));
}

function createClient(sessionName, webhook, auth) {
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: sessionName }),
    puppeteer: {
      headless: true,
      executablePath: CHROME_EXECUTABLE_PATH
    }
  });

  clients[sessionName] = { client, webhook, auth };

  client.on('qr', qr => {
    clients[sessionName].qr = qr;
    logger.info(`[${sessionName}] QR RECEIVED`);
  });

  client.on('ready', () => {
    logger.info(`[${sessionName}] Client is ready!`);
  });

  client.on('authenticated', () => {
    logger.info(`[${sessionName}] Authenticated`);
  });

  client.on('message', async message => {
    if (clients[sessionName].webhook) {
      try {
        await axios.post(clients[sessionName].webhook, {
          event: 'message',
          from: message.from,
          body: message.body,
          timestamp: new Date().toISOString(),
          session: sessionName
        }, clients[sessionName].auth ? { auth: clients[sessionName].auth } : {});
      } catch (e) {
        logger.error(`[${sessionName}] Webhook failed: ${e.message}`);
      }
    }
  });

  client.initialize();
}

function getClient(sessionName) {
  return clients[sessionName];
}

function removeClient(sessionName) {
  const clientObj = clients[sessionName];
  if (clientObj) {
    clientObj.client.destroy();
    delete clients[sessionName];
    fs.unlinkSync(getSessionFile(sessionName));
  }
}

function sendMessage(sessionName, to, message) {
  const clientObj = clients[sessionName];
  if (!clientObj) return;
  clientObj.client.sendMessage(to, message);
}

module.exports = {
  clients,
  getSessionFile,
  loadSessions,
  saveSession,
  createClient,
  getClient,
  removeClient,
  sendMessage
};
