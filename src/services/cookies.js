/**
 * Cookie Manager Service
 * Handles loading and applying Instagram cookies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COOKIES_PATH = path.join(__dirname, '../../data/cookies.json');

/**
 * Load cookies from file
 * @param {string} customPath - Optional custom path to cookies file
 * @returns {Object[]} Array of cookie objects
 */
export function loadCookies(customPath = null) {
  const filePath = customPath || COOKIES_PATH;
  
  if (!fs.existsSync(filePath)) {
    console.log('No cookies file found');
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const cookies = JSON.parse(content);
    
    if (!Array.isArray(cookies)) {
      console.warn('Cookies file format invalid');
      return [];
    }
    
    console.log(`Loaded ${cookies.length} cookies`);
    return cookies;
  } catch (err) {
    console.error('Error loading cookies:', err.message);
    return [];
  }
}

/**
 * Save cookies to file
 * @param {Object[]} cookies - Array of cookie objects
 * @param {string} customPath - Optional custom path
 */
export function saveCookies(cookies, customPath = null) {
  const filePath = customPath || COOKIES_PATH;
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2));
    console.log(`Saved ${cookies.length} cookies to ${filePath}`);
  } catch (err) {
    console.error('Error saving cookies:', err.message);
  }
}

/**
 * Apply cookies to Puppeteer page
 * @param {Object} page - Puppeteer page instance
 * @param {string} domain - Domain for cookies (default: instagram.com)
 * @returns {Promise<void>}
 */
export async function applyCookies(page, domain = '.instagram.com') {
  const cookies = loadCookies();
  
  if (cookies.length === 0) {
    console.log('No cookies to apply');
    return;
  }

  // Filter cookies for the domain
  const validCookies = cookies.filter(c => 
    c.domain === domain || c.domain === `.${domain}`
  );

  if (validCookies.length === 0) {
    console.log(`No cookies found for ${domain}`);
    return;
  }

  // Set each cookie
  for (const cookie of validCookies) {
    await page.setCookie({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path || '/',
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      expires: cookie.expires !== -1 ? cookie.expires : undefined,
      sameSite: cookie.sameSite || 'None'
    });
  }

  console.log(`Applied ${validCookies.length} cookies`);
}

/**
 * Check if user is logged in based on cookies
 * @returns {boolean} True if session likely valid
 */
export function isLoggedIn() {
  const cookies = loadCookies();
  
  if (cookies.length === 0) {
    return false;
  }

  // Check for session cookies
  const sessionCookie = cookies.find(c => 
    c.name.includes('sessionid') || 
    c.name.includes('ds_user_id')
  );

  return !!sessionCookie;
}

/**
 * Validate cookies have required Instagram fields
 * @returns {Object} Validation result
 */
export function validateCookies() {
  const cookies = loadCookies();
  const result = {
    valid: false,
    issues: [],
    hasSession: false,
    hasUserId: false,
    count: cookies.length
  };

  if (cookies.length === 0) {
    result.issues.push('No cookies found');
    return result;
  }

  // Check for session ID
  result.hasSession = cookies.some(c => 
    c.name.toLowerCase().includes('sessionid')
  );

  // Check for user ID
  result.hasUserId = cookies.some(c => 
    c.name.toLowerCase().includes('ds_user_id')
  );

  if (!result.hasSession && !result.hasUserId) {
    result.issues.push('No session or user ID cookie found');
  }

  // Check expiration
  const expired = cookies.filter(c => {
    if (!c.expires || c.expires === -1) return false;
    return c.expires < Date.now() / 1000;
  });

  if (expired.length > 0) {
    result.issues.push(`${expired.length} cookies expired`);
  }

  result.valid = result.issues.length === 0 && (result.hasSession || result.hasUserId);

  return result;
}

export default {
  loadCookies,
  saveCookies,
  applyCookies,
  isLoggedIn,
  validateCookies
};