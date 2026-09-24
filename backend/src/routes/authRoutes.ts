/**
 * Authentication Endpoints for Ephemeral Secret Vault
 * PBKDF2 password hashing & JWT token issuance.
 */

import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { statements } from '../database/db.js';
import { hashPassword, verifyPassword } from '../crypto/vaultCrypto.js';
import { generateToken, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * POST /api/auth/register
 */
router.post('/register', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = statements.findUserByEmail.get(normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);
    const now = Date.now();

    statements.insertUser.run({
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      created_at: now
    });

    const user = { id: userId, email: normalizedEmail, name: name.trim() };
    const token = generateToken(user);

    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader(
      'Set-Cookie',
      `vault_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}${isProd ? '; Secure' : ''}`
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user
    });
  } catch (error: any) {
    console.error('[AUTH REGISTER ERROR]', error);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userRow = statements.findUserByEmail.get(normalizedEmail) as any;

    if (!userRow) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = verifyPassword(password, userRow.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = { id: userRow.id, email: userRow.email, name: userRow.name };
    const token = generateToken(user);

    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader(
      'Set-Cookie',
      `vault_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}${isProd ? '; Secure' : ''}`
    );

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user
    });
  } catch (error: any) {
    console.error('[AUTH LOGIN ERROR]', error);
    return res.status(500).json({ error: 'Authentication failed.' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (_req: Request, res: Response) => {
  res.setHeader(
    'Set-Cookie',
    'vault_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
  );
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, (req: Request, res: Response) => {
  try {
    const userRow = statements.findUserById.get(req.user!.id) as any;
    if (!userRow) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ user: userRow });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

export default router;
