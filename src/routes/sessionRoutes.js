const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: List all active sessions
 *     responses:
 *       200:
 *         description: Array of session names
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/sessions', sessionController.listSessions);

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Create a new session and get QR
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session created
 *       400:
 *         description: Bad request
 */
router.post('/sessions', sessionController.createSession);

/**
 * @swagger
 * /api/sessions/{sessionName}/qr:
 *   get:
 *     summary: Get QR code for a session
 *     parameters:
 *       - in: path
 *         name: sessionName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code for session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 qr:
 *                   type: string
 *       404:
 *         description: Session or QR not found
 */
router.get('/sessions/:sessionName/qr', sessionController.getSessionQR);

/**
 * @swagger
 * /api/sessions/{sessionName}:
 *   delete:
 *     summary: Remove a session
 *     parameters:
 *       - in: path
 *         name: sessionName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session removed
 *       404:
 *         description: Session not found
 */
router.delete('/sessions/:sessionName', sessionController.removeSession);

/**
 * @swagger
 * /api/sessions/{sessionName}/webhook:
 *   post:
 *     summary: Set webhook for a session
 *     parameters:
 *       - in: path
 *         name: sessionName
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               webhook:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook set
 *       404:
 *         description: Session not found
 */
router.post('/sessions/:sessionName/webhook', sessionController.setWebhook);

/**
 * @swagger
 * /api/sessions/{sessionName}/webhook:
 *   get:
 *     summary: Get webhook for a session
 *     parameters:
 *       - in: path
 *         name: sessionName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook for session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 webhook:
 *                   type: string
 *                 username:
 *                   type: string
 *       404:
 *         description: Session not found
 */
router.get('/sessions/:sessionName/webhook', sessionController.getWebhook);

/**
 * @swagger
 * /api/sessions/{sessionName}/send:
 *   post:
 *     summary: Send a message from a session
 *     parameters:
 *       - in: path
 *         name: sessionName
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 example: "6281398184627@c.us"
 *               message:
 *                 type: string
 *                 example: "Hello from the API!"
 *     responses:
 *       200:
 *         description: Message sent
 *       404:
 *         description: Session not found
 *       500:
 *         description: Error sending message
 */
router.post('/sessions/:sessionName/send', sessionController.sendMessage);

module.exports = router;
