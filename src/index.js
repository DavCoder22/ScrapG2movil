/**
 * Main entry point for Instagram Scraper
 */

import puppeteer from './services/puppeteer.js';
import { extractProfile } from './services/instagram.js';
import { applyCookies, isLoggedIn, validateCookies } from './services/cookies.js';
import config from './config/index.js';
import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function getBrowserArgs() {
  const useTor = process.argv.includes('--tor');
  
  if (!useTor) {
    return [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled'
    ];
  }

  // TOR mode
  console.log('Using TOR proxy: socks5://127.0.0.1:9050');
  
  return [
    '--proxy-server=socks5://127.0.0.1:9050',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--disable-blink-features=AutomationControlled',
    '--disable-web-security',
    '--allow-running-insecure-content',
    '--ignore-certificate-errors'
  ];
}

/**
 * Check if cookies are available and valid
 */
async function checkSession() {
  if (!isLoggedIn()) {
    console.log('No valid session found');
    console.log('To login:');
    console.log('1. Open Instagram in browser');
    console.log('2. Install cookie extension (EditThisCookie)');
    console.log('3. Export cookies to data/cookies.json');
    console.log();
    
    const response = await ask('Continue without login? (y/n): ');
    if (response.toLowerCase() !== 'y') {
      rl.close();
      process.exit(0);
    }
    return false;
  }

  const validation = validateCookies();
  console.log(`Session: ${validation.valid ? 'Valid' : 'Invalid'}`);
  
  if (!validation.valid) {
    console.log('Issues:', validation.issues.join(', '));
    
    const response = await ask('Continue anyway? (y/n): ');
    if (response.toLowerCase() !== 'y') {
      rl.close();
      process.exit(0);
    }
  }

  return true;
}

async function main() {
  console.clear();
  console.log('================================================');
  console.log('      INSTAGRAM SCRAPER v1.0.0');
  console.log('================================================');
  console.log();

  // Check session (optional - can press n to skip)
  await checkSession();

  // Get username - handle --tor flag
  const useTor = process.argv.includes('--tor');
  let username = null;
  
  if (useTor) {
    username = process.argv[3]; // User is at position 3 if --tor is used
  } else {
    username = process.argv[2];
  }
  
  if (!username) {
    username = await ask('Instagram user (without @): ');
  } else {
    console.log(`User: @${username}`);
  }
  
  if (!username.trim()) {
    console.log('Please enter a user');
    rl.close();
    return;
  }

  username = username.trim().replace(/^@/, '');

  console.log();
  console.log('Starting browser...');

  const args = await getBrowserArgs();

  const browser = await puppeteer.launch({
    headless: config.browser.headless,
    slowMo: config.browser.slowMo,
    args: args
  });

  const page = await browser.newPage();
  
  await page.setViewport(config.browser.viewport);
  await page.setUserAgent(config.browser.userAgent);

  // Apply cookies if available
  if (isLoggedIn()) {
    console.log('Applying cookies...');
    await applyCookies(page);
    console.log('Cookies applied');
  }

  // Anti-detection
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    window.chrome = { runtime: {} };
  });

  try {
    // Extract data
    console.log(`Scraping @${username}...`);
    const data = await extractProfile(page, username);

    if (data.error) {
      console.log(`Error: ${data.error} - ${data.message}`);
      
      if (data.error === 'LOGIN_REQUIRED') {
        console.log();
        console.log('Instagram requires login');
        console.log('Please update cookies in data/cookies.json');
      }
      
      await browser.close();
      rl.close();
      return;
    }

    // Show results
    console.log();
    console.log('================================================');
    console.log('  RESULTS');
    console.log('================================================');
    console.log(`  @${data.profile.username}`);
    console.log(`  ${data.profile.fullName || 'No name'}`);
    console.log(`  Verified: ${data.profile.isVerified ? 'Yes' : 'No'}`);
    console.log(`  Private: ${data.profile.isPrivate ? 'Yes' : 'No'}`);
    console.log(`  Followers: ${data.profile.followers.toLocaleString()}`);
    console.log(`  Posts: ${data.profile.postsCount.toLocaleString()}`);
    console.log(`  Extracted: ${data.posts.length}`);
    console.log('================================================');

    // Save JSON
    const jsonFile = `./data/${username}_data.json`;
    fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2));
    console.log(`\nSaved: ${jsonFile}`);

    // Save CSV if posts exist
    if (data.posts.length > 0) {
      const csvFile = `./data/${username}_posts.csv`;
      
      const csvWriter = createObjectCsvWriter({
        path: csvFile,
        header: [
          { id: 'shortcode', title: 'Shortcode' },
          { id: 'url', title: 'URL' },
          { id: 'likes', title: 'Likes' },
          { id: 'comments', title: 'Comments' },
          { id: 'timestamp', title: 'Date' },
          { id: 'isVideo', title: 'Video' }
        ]
      });

      await csvWriter.writeRecords(data.posts.map(p => ({
        shortcode: p.shortcode,
        url: p.url,
        likes: p.likes,
        comments: p.comments,
        timestamp: p.timestamp || '',
        isVideo: p.isVideo ? 'Yes' : 'No'
      })));

      console.log(`Saved: ${csvFile}`);
    }

    console.log();
    console.log(`Done for @${username}`);

  } catch (error) {
    console.log(`Error: ${error.message}`);
  } finally {
    await browser.close();
    rl.close();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});