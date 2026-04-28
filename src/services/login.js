/**
 * Instagram Login Service
 * Handles login flow when no cookies are available
 */

import puppeteer from './puppeteer.js';
import config from '../config/index.js';

/**
 * Login to Instagram and save cookies
 * @param {string} username - Instagram username
 * @param {string} password - Instagram password
 * @returns {Promise<Object>} cookies
 */
export async function loginWithCredentials(username, password) {
  console.log(`Logging in as @${username}...`);
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50
  });

  const page = await browser.newPage();
  
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(config.browser.userAgent);

  try {
    // Go to Instagram login
    await page.goto('https://www.instagram.com/accounts/login/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for login form
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });

    // Enter username
    await page.type('input[name="username"]', username, { delay: 50 });

    // Enter password
    await page.type('input[name="password"]', password, { delay: 50 });

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await page.waitForNavigation({ timeout: 30000 });

    // Save cookies
    const cookies = await page.cookies();
    
    console.log('Login successful!');
    console.log(`Saved ${cookies.length} cookies`);
    
    await browser.close();
    return cookies;

  } catch (err) {
    console.error('Login failed:', err.message);
    await browser.close();
    throw err;
  }
}

/**
 * Create cookies file from browser session
 * @param {Object} page - Puppeteer page with active session
 * @returns {Promise<void>}
 */
export async function saveSessionCookies(page) {
  const fs = await import('fs');
  
  const cookies = await page.cookies();
  
  // Filter Instagram cookies
  const igCookies = cookies.filter(c => 
    c.domain.includes('instagram')
  );

  fs.writeFileSync('./data/cookies.json', JSON.stringify(igCookies, null, 2));
  
  console.log(`Saved ${igCookies.length} cookies to data/cookies.json`);
}

export default {
  loginWithCredentials,
  saveSessionCookies
};