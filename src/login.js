/**
 * Instagram Login CLI
 * Guardar cookies de sesion
 */

import { loginWithCredentials, saveSessionCookies } from './services/login.js';
import { loadCookies, saveCookies } from './services/cookies.js';
import readline from 'readline';
import fs from 'fs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.clear();
  console.log('================================================');
  console.log('      INSTAGRAM LOGIN');
  console.log('================================================');
  console.log();

  // Check existing cookies
  const existing = loadCookies();
  if (existing.length > 0) {
    console.log(`Found ${existing.length} cookies`);
    const res = await ask('Overwrite? (y/n): ');
    if (res.toLowerCase() !== 'y') {
      console.log('Keeping existing');
      rl.close();
      return;
    }
  }

  // Try to read credentials from temp file (set by run.bat)
  let username = '';
  let password = '';
  
  const tempCreds = './data/temp_creds.json';
  if (fs.existsSync(tempCreds)) {
    try {
      const creds = JSON.parse(fs.readFileSync(tempCreds, 'utf-8'));
      username = creds.username;
      password = creds.password;
    } catch (e) {}
  }

  // If not from file, ask
  if (!username) {
    username = await ask('Username: ');
    password = await ask('Password: ');
  }

  if (!username || !password) {
    console.log('Credentials required');
    rl.close();
    return;
  }

  console.log();
  console.log('Opening browser...');
  console.log('Complete 2FA if needed');
  console.log();

  try {
    const cookies = await loginWithCredentials(username, password);
    if (cookies) {
      saveCookies(cookies);
      console.log('Login successful!');
    }
  } catch (err) {
    console.log('Error:', err.message);
  }

  rl.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});