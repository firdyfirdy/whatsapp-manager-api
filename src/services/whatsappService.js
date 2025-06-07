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

function saveSession(data) {
  if (fs.existsSync(getSessionFile(data.sessionName))){
    fs.unlinkSync(getSessionFile(data.sessionName));
  }
  fs.writeFileSync(getSessionFile(data.sessionName), JSON.stringify(data));
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
  clients[sessionName].authenticated = false;

  client.on('qr', qr => {
    try {
      clients[sessionName].qr = qr;
      logger.info(`[${sessionName}] QR RECEIVED`);
  
      // check if more than 5 minutes the client not authenticated, 
      // then remove the client
      setTimeout(() => {
        if (!clients[sessionName].authenticated) {
          logger.info(`[${sessionName}] Client not authenticated after 5 minutes, removing...`);
          removeClient(sessionName);
        }
      }, 5 * 60 * 1000);
    } catch (e) {
      logger.error(`[${sessionName}] Error getting qr: ${e.message}`);
    }
  });

  client.on('ready', () => {
    logger.info(`[${sessionName}] Client is ready!`);
    clients[sessionName].authenticated = true;
    const user = client.info;
    logger.info(`[${sessionName}] User info: ${JSON.stringify(user)}`);
    logger.info(`Connected as: ${user.pushname}`);   // WhatsApp display name
    logger.info(`WhatsApp ID: ${user.wid.user}`);    // Phone number (string, without +)
    logger.info(`Full WID: ${user.wid._serialized}`); // Full ID (e.g. 1234567890@c.us)

    saveSession({ 
        sessionName, 
        webhook: webhook, 
        auth,
        displayName: user.pushname, 
        phoneNumber: user.wid.user,
        authenticated: true 
      });
  });

  client.on('authenticated', () => {
    try {
      logger.info(`[${sessionName}] is authenticated`);
  
      try {
        clients[sessionName].authenticated = true;
        const user = client.info;
        logger.info(`[${sessionName}] User info: ${JSON.stringify(user)}`);
        logger.info(`Connected as: ${user.pushname}`);   // WhatsApp display name
        logger.info(`WhatsApp ID: ${user.wid.user}`);    // Phone number (string, without +)
        logger.info(`Full WID: ${user.wid._serialized}`); // Full ID (e.g. 1234567890@c.us)
  
        saveSession({ 
            sessionName, 
            webhook: webhook, 
            auth,
            displayName: user.pushname, 
            phoneNumber: user.wid.user,
            authenticated: true 
          });
      } catch (e) {
        logger.error(`[${sessionName}] Error getting user info: ${e.message}`);
  
        saveSession({ 
            sessionName, 
            webhook: webhook, 
            auth, 
            displayName: '', 
            phoneNumber: '', 
            authenticated: true 
          });
      }
    } catch (e) {
      logger.error(`[${sessionName}] Error authenticated: ${e.message}`);
    }
  });

  client.on('message', async message => {
    try {
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
    } catch (e) {
      logger.error(`[${sessionName}] Error message: ${e.message}`);
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
