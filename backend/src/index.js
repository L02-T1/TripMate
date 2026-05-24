require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { connect } = require('./config/database');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// CORS: allow configured origins OR all if not specified
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : null; 

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    // Allow all if no whitelist configured
    if (!allowedOrigins || allowedOrigins.includes('*')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow localhost in development
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: false,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight
app.options('*', cors());

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Quá nhiều yêu cầu, vui lòng thử lại sau' },
});
app.use('/auth', limiter);

// ── Body parser & logging ─────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev', { stream: { write: msg => logger.info(msg.trim()) } }));

// ── API Docs ──────────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { background-color: #1B4F8A; }',
  customSiteTitle: 'TripMate API Docs',
  swaggerOptions: { persistAuthorization: true },
}));
app.get('/api-docs.json', (_, res) => res.json(swaggerSpec));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth', require('./routes/auth'));
app.use('/trips', require('./routes/trips'));
app.use('/notifications', require('./routes/notifications'));
app.use('/users', require('./routes/users'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({
  status: 'ok',
  version: '1.0.0',
  app: 'TripMate API',
  docs: '/api-docs',
  timestamp: new Date().toISOString(),
}));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_, res) => res.status(404).json({ error: 'Route không tồn tại' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Lỗi hệ thống' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const start = async () => {
  await connect();

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`🚀 TripMate API running on port ${PORT}`);
    logger.info(`📖 Swagger Docs /api-docs`);
    logger.info(`💚 Health Check /health`);
  });
};

start().catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;