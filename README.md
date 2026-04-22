# Instagram Scraper

**Curso:** Dispositivos Móviles - Grupo 2

Instagram profile scraper using Puppeteer with stealth features.

## Features

- Extract profile data (followers, following, posts count, bio, verification status)
- Extract posts (likes, comments, timestamps, location)
- Export to JSON and CSV
- Stealth mode to avoid detection
- Cookie-based authentication
- Optional Tor proxy support
- Configurable settings

## Requirements

- Node.js 18+
- Docker (for Tor proxy - optional)

## Installation

```bash
npm install
```

## Usage

```bash
# Basic usage
npm start natgeo

# With specific username
npm start instagram
```

### Authentication (Required for Private Profiles)

1. Open Instagram in your browser
2. Login with your account
3. Install a cookie extension (EditThisCookie for Chrome/Firefox)
4. Export cookies to `data/cookies.json`

**Cookie Format:**
```json
[
  {
    "name": "sessionid",
    "value": "YOUR_SESSION_ID",
    "domain": ".instagram.com",
    "path": "/",
    "secure": true,
    "httpOnly": true,
    "expires": -1
  },
  {
    "name": "ds_user_id",
    "value": "YOUR_USER_ID",
    "domain": ".instagram.com", 
    "path": "/",
    "secure": true,
    "httpOnly": true,
    "expires": -1
  }
]
```

### Using Docker for Tor

```bash
# Start Tor container
docker run -d --name tor_proxy -p 9050:9050 --restart unless-stopped dperson/torproxy

# Enable Tor in config/src/config/index.js
npm run start:tor natgeo
```

## Project Structure

```
instagram-scraper/
├── src/
│   ├── index.js              # Main entry point
│   ├── config/
│   │   └── index.js         # Configuration
│   └── services/
│       ├── puppeteer.js    # Puppeteer setup
│       ├── instagram.js   # Instagram scraper
│       └── cookies.js    # Cookie manager
├── data/
│   ├── cookies.json       # Instagram session cookies
│   └── *.json           # Extracted data
├── screenshots/
├── package.json
└── README.md
```

## Configuration

Edit `src/config/index.js`:

```javascript
export default {
  instagram: {
    baseUrl: 'https://www.instagram.com',
    timeout: 60000,        // Page load timeout
    scrollDelay: 3000,    // Delay between scrolls
    maxScrolls: 3          // Max scroll attempts
  },
  proxy: {
    enabled: false,       // Enable Tor proxy
    host: '127.0.0.1',
    port: 9050,
    type: 'socks5'
  },
  browser: {
    headless: false,     // Show browser
    slowMo: 100         // Delay between actions
  }
};
```

## Output

Data saved to `data/`:
- `{username}_data.json` - Full profile data
- `{username}_posts.csv` - Posts in CSV

## License

MIT