/**
 * Ephemeral Secret Vault - Scraper & Link-Preview Crawler Protection
 * 
 * Prevents automated link-unfurling bots (Slackbot, Discordbot, Facebook, WhatsApp, etc.)
 * from consuming or destroying ephemeral secrets.
 */

import { Request, Response, NextFunction } from 'express';
import { incrementCounter, logAuditEvent } from '../database/db.js';

// Comprehensive pattern of known link-preview bots & automated crawlers
const BOT_USER_AGENT_REGEX = /(bot|crawl|spider|slurp|slackbot|facebookexternalhit|discordbot|whatsapp|preview|twitterbot|telegrambot|embedly|quora link preview|outbrain|pinterest|vkshare|w3c_validator)/i;

export function isBotUserAgent(userAgent?: string): boolean {
  if (!userAgent) return false;
  return BOT_USER_AGENT_REGEX.test(userAgent);
}

/**
 * Middleware for safe GET /view/:id requests
 * If a bot is detected, returns safe OpenGraph preview metadata with NO secret decryption
 * and NO decrementing of view counters.
 */
export function scraperProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  const userAgent = req.headers['user-agent'] || '';

  if (isBotUserAgent(userAgent)) {
    incrementCounter('blocked_crawlers', 1);
    logAuditEvent('BOT_PREVIEW_BLOCKED', `Blocked automated crawler: ${userAgent.slice(0, 100)}`);

    // Return safe preview HTML without touching secret data
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Encrypted Secret | Ephemeral Secret Vault</title>
          <meta name="description" content="A secure, encrypted, self-destructing secret has been shared with you.">
          <meta property="og:title" content="🔐 Ephemeral Secret Vault - Encrypted Message">
          <meta property="og:description" content="Click link to safely open and view encrypted secret in your browser.">
          <meta property="og:type" content="website">
          <meta name="twitter:card" content="summary">
          <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
        </head>
        <body style="background:#050711;color:#f8fafc;font-family:sans-serif;padding:40px;text-align:center;">
          <h2>🔐 Ephemeral Secret Vault</h2>
          <p>This is a safe link preview. The encrypted secret was NOT consumed.</p>
        </body>
      </html>
    `);
  }

  next();
}
