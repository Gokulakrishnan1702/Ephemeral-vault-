#!/usr/bin/env node
/**
 * Master Key Generator for Ephemeral Secret Vault
 * Generates a cryptographically strong 256-bit (32-byte) key for AES-256-GCM.
 */

import crypto from 'node:crypto';

const keyBytes = crypto.randomBytes(32);
const hexKey = keyBytes.toString('hex');
const base64Key = keyBytes.toString('base64');

console.log('='.repeat(65));
console.log('🔐 EPHEMERAL SECRET VAULT - MASTER ENCRYPTION KEY GENERATOR');
console.log('='.repeat(65));
console.log('\n[!] 256-bit AES Master Key (Hexadecimal - 64 chars):');
console.log(`\x1b[32m${hexKey}\x1b[0m`);
console.log('\n[!] 256-bit AES Master Key (Base64 - 44 chars):');
console.log(`\x1b[36m${base64Key}\x1b[0m`);
console.log('\n[INFO] Set this in your environment or .env file:');
console.log(`VAULT_MASTER_KEY=${hexKey}`);
console.log('\n[WARNING] NEVER commit this key to version control or store it in the database!');
console.log('='.repeat(65));
