/**
 * Login CLI - Save Instagram session cookies
 */

import { loginWithCredentials, saveSessionCookies } from './services/login.js';
import { loadCookies, saveCookies } from './services/cookies.js';
import readline from 'readline';

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

  // Check if already have cookies
  const existingCookies = loadCookies();
  
  if (existingCookies.length > 0) {
    console.log(`Found ${existingCookies.length} existing cookies`);
    const response = await ask('Overwrite? (y/n): ');
    if (response.toLowerCase() !== 'y') {
      console.log('Keeping existing cookies');
      rl.close();
      return;
    }
  }

  // Get credentials
  console.log();
  const username = await ask('Instagram username: ');
  const password = await ask('Instagram password: ');
  
  if (!username || !password) {
    console.log('Username and password required');
    rl.close();
    return;
  }

  console.log();
  console.log('Opening browser for login...');
  console.log('(Complete 2FA if required)');
  console.log();

  try {
    const cookies = await loginWithCredentials(username.trim(), password);
    
    if (cookies) {
      saveCookies(cookies);
      
      console.log();
      console.log('================================================');
      console.log('  login SUCCESSFUL');
      console.log('================================================');
      console.log('You can now use: npm start <username>');
    }

  } catch (err) {
    console.log('Login failed:', err.message);
  }

  rl.close();
}

// Run if called directly
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});