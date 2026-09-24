#!/usr/bin/env node
/**
 * Ephemeral Secret Vault - Command Line Interface (CLI)
 * 
 * Usage:
 *   cat secret.txt | ./vault-cli
 *   echo "my-db-pass" | ./vault-cli --ttl 300 --views 1
 *   ./vault-cli --help
 */

import fs from 'node:fs';

const args = process.argv.slice(2);

// Display help menu
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔐 Ephemeral Secret Vault - CLI Helper
======================================
Securely ingest secrets directly from your terminal or shell pipelines.

USAGE:
  cat secret.txt | node cli/vault-cli.js [OPTIONS]
  echo "secret_token" | node cli/vault-cli.js [OPTIONS]

OPTIONS:
  --ttl <seconds>       Expiration TTL in seconds (default: 3600, range: 10 - 604800)
  --views <count>       Maximum view allowance before safe burn (default: 1, range: 1 - 100)
  --type <type>         Secret label: Password, API Key, Token, Certificate, etc. (default: "CLI Secret")
  --passphrase <pass>   Optional secondary passphrase required for decryption
  --api-url <url>       Backend API endpoint (default: http://localhost:3000)
  -h, --help            Show this assistance screen

EXAMPLES:
  # Encrypt an env file with 1-hour expiration and 1 view:
  cat .env.production | node cli/vault-cli.js --type ".env File"

  # Encrypt a temporary database password with 5-minute expiration:
  echo "P@ssw0rd998!" | node cli/vault-cli.js --ttl 300 --views 1 --type "Database Password"
  `);
  process.exit(0);
}

// Parse arguments
let ttl = 3600;
let views = 1;
let secretType = 'CLI Secret';
let passphrase = undefined;
let apiUrl = process.env.VAULT_API_URL || 'http://localhost:3000';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ttl' && args[i + 1]) {
    ttl = parseInt(args[++i], 10);
  } else if (args[i] === '--views' && args[i + 1]) {
    views = parseInt(args[++i], 10);
  } else if (args[i] === '--type' && args[i + 1]) {
    secretType = args[++i];
  } else if (args[i] === '--passphrase' && args[i + 1]) {
    passphrase = args[++i];
  } else if (args[i] === '--api-url' && args[i + 1]) {
    apiUrl = args[++i];
  }
}

// Read from STDIN
async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if stdin is a TTY (interactive terminal without pipe)
    if (process.stdin.isTTY) {
      console.error('\x1b[33m[!] No piped input detected. Pipe a secret via stdin or enter text (Ctrl+D to finish):\x1b[0m');
    }

    let input = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      input += chunk;
    });

    process.stdin.on('end', () => {
      resolve(input.trim());
    });

    process.stdin.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  try {
    const secretContent = await readStdin();

    if (!secretContent) {
      console.error('\x1b[31m[ERROR] No secret provided. Aborting.\x1b[0m');
      process.exit(1);
    }

    console.log('\x1b[36m[*] Ingesting secret and requesting AES-256-GCM encryption...\x1b[0m');

    const response = await fetch(`${apiUrl}/api/secret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: secretContent,
        ttl_seconds: ttl,
        max_views: views,
        secret_type: secretType,
        passphrase
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`\x1b[31m[ERROR] API Rejected Ingestion (${response.status}): ${errorData.error || response.statusText}\x1b[0m`);
      process.exit(1);
    }

    const data = await response.json();

    console.log('\n' + '─'.repeat(60));
    console.log('\x1b[32m✔ SECRET ENCRYPTED & VAULTED SUCCESSFULLY\x1b[0m');
    console.log('─'.repeat(60));
    console.log(`\x1b[1mSecret ID:\x1b[0m       ${data.id}`);
    console.log(`\x1b[1mSecure Share URL:\x1b[0m \x1b[36m\x1b[4m${data.view_url}\x1b[0m`);
    console.log(`\x1b[1mExpires At:\x1b[0m       ${new Date(data.expires_at).toLocaleString()}`);
    console.log(`\x1b[1mMax Views:\x1b[0m        ${data.max_views} (Burn upon reveal)`);
    console.log(`\x1b[1mCipher Method:\x1b[0m    AES-256-GCM + 12-byte Random IV`);
    console.log('─'.repeat(60));
    console.log('\x1b[33m⚠ Note: Share this link securely. Opening the GET link is safe; clicking "Reveal & Destroy" burns it permanently.\x1b[0m\n');
  } catch (err: any) {
    console.error('\x1b[31m[FATAL CLI ERROR]\x1b[0m', err.message);
    process.exit(1);
  }
}

main();
