export default {
  instagram: {
    baseUrl: 'https://www.instagram.com',
    timeout: 60000,
    scrollDelay: 3000,
    maxScrolls: 3
  },
  proxy: {
    enabled: false,
    host: '127.0.0.1',
    port: 9050,
    type: 'socks5'
  },
  browser: {
    headless: false,
    slowMo: 150,
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  stealth: {
    webglVendor: 'Intel Inc.',
    webglRenderer: 'Intel Iris OpenGL Engine',
    platform: 'Win32',
    languages: ['en-US', 'en']
  }
};