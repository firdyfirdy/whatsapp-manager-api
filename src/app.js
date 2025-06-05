const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { logger } = require('./utils/logger');
const { PORT } = require('./config');
const sessionRoutes = require('./routes/sessionRoutes');
const setupSwagger = require('./docs/swagger');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Log all inbound requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - Body: ${JSON.stringify(req.body)}`);
  next();
});

// API routes
app.use('/api', sessionRoutes);

// Swagger docs
setupSwagger(app);

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = app;