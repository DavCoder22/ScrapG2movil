import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserPreferencesPlugin from 'puppeteer-extra-plugin-user-preferences';

puppeteer.use(StealthPlugin());
puppeteer.use(UserPreferencesPlugin({
  userPrefs: {
    webkit: {
      webprefs: {
        default_font_size: 16,
        default_fixed_font_size: 16,
        minimum_font_size: 12
      }
    }
  }
}));

export default puppeteer;