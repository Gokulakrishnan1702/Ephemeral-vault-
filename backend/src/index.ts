/**
 * Ephemeral Secret Vault - Main Backend Server Entrypoint
 * 
 * Production-style secure architecture:
 * - Express 4.x
 * - AES-256-GCM symmetric crypto engine
 * - SQLite with WAL mode and atomic mutations
 * - Background TTL Garbage Collection worker
 * - Anti-bot / Scraper defense layer
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';

// Load environment variables
dotenv.config({ path: '../.env' });
dotenv.config();

import { db, statements } from './database/db.js';
import { hashPassword } from './crypto/vaultCrypto.js';
import { startSweeper, stopSweeper, getSweeperStatus } from './workers/sweeper.js';
import { scraperProtectionMiddleware } from './middleware/scraperDetector.js';

// Route handlers
import secretRoutes from './routes/secretRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Provision default demo user if not present
try {
  const existingUser = statements.findUserByEmail.get('user@example.com');
  if (!existingUser) {
    statements.insertUser.run({
      id: crypto.randomUUID(),
      name: 'Security Admin',
      email: 'user@example.com',
      password_hash: hashPassword('password'),
      created_at: Date.now()
    });
    console.log('[Auth] Demo account initialized: user@example.com / password');
  }
} catch (err) {
  console.error('[Auth] Demo account provisioning notice:', err);
}

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// Security Headers & Request Correlation ID
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = crypto.randomUUID();
  res.setHeader('X-Request-ID', reqId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// CORS configuration
app.use(cors({
  origin: [APP_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// Body parsing with 1MB limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/**
 * Health check endpoint
 * Section 37 requirement:
 * GET /health -> { "status": "ok", "database": "connected", "encryption": "ready", "sweeper": "running" }
 */
app.get('/health', (req: Request, res: Response) => {
  try {
    // Quick SQLite health probe
    db.prepare('SELECT 1').get();
    const sweeper = getSweeperStatus();

    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      encryption: 'ready',
      sweeper: sweeper.running ? 'running' : 'stopped',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(503).json({
      status: 'unhealthy',
      database: 'error',
      message: error.message
    });
  }
});

// Mount API routes
app.use('/api/secret', secretRoutes);
app.use('/api/secrets', secretRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/auth', authRoutes);

// Safe Landing Route for GET /view/:id
// If a bot / crawler visits, scraperProtectionMiddleware serves safe preview HTML.
// If a human browser visits, serve the React frontend index.html!
const frontendDist = path.resolve('../frontend/dist');
const indexHtmlPath = path.join(frontendDist, 'index.html');

app.get('/view/:id', scraperProtectionMiddleware, (req: Request, res: Response, next: NextFunction) => {
  if (fs.existsSync(indexHtmlPath)) {
    return res.sendFile(indexHtmlPath);
  }
  return res.redirect(`${APP_URL}/view/${req.params.id}`);
});

// Serve frontend static files from dist
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  // SPA fallback for all frontend views
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    return res.sendFile(indexHtmlPath);
  });
} else {
  // Global 404 handler fallback
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found.' });
  });
}

// Global Error Handler (Sanitizes internal errors so keys/secrets are never leaked)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[SERVER UNHANDLED EXCEPTION]', err);
  res.status(500).json({
    error: 'An internal cryptographic or server error occurred.'
  });
});

// Start background TTL Sweeper worker (every 15s)
const sweeperIntervalMs = parseInt(process.env.SWEEPER_INTERVAL_MS || '15000', 10);
startSweeper(sweeperIntervalMs);

// Start listening
const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              🔐 EPHEMERAL SECRET VAULT - BACKEND             ║
║      SECRET INGESTION → ENCRYPTED VAULT → SAFE BURN          ║
╠══════════════════════════════════════════════════════════════╣
║  • Server running on: http://localhost:${PORT}                  ║
║  • Frontend Origin:   ${APP_URL}                  ║
║  • Cryptography:      AES-256-GCM (Hardware Authenticated)   ║
║  • Database Engine:   SQLite with WAL Mode                   ║
║  • TTL Sweeper:       Active (Interval: ${sweeperIntervalMs / 1000}s)              ║
║  • Health Probe:      http://localhost:${PORT}/health           ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful termination
const shutdown = () => {
  console.log('\n[Vault Server] Shutting down gracefully...');
  stopSweeper();
  try {
    db.close();
    console.log('[SQLite] Connection cleanly closed.');
  } catch (e) {
    // Ignore close error
  }
  server.close(() => {
    console.log('[Vault Server] Process terminated.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
