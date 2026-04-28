/**
 * Instagram Scraper Service
 * Extracts profile and post data from Instagram
 */

import config from '../config/index.js';

/**
 * Extract profile data from Instagram username
 * @param {Object} page - Puppeteer page instance
 * @param {string} username - Instagram username to scrape
 * @returns {Promise<Object>} Profile data
 */
export async function extractProfile(page, username) {
  console.log(`Extracting @${username}...`);
  
  const url = `${config.instagram.baseUrl}/${username}/`;
  
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: config.instagram.timeout
  });

  // Wait for content to load
  await new Promise(r => setTimeout(r, 5000));

  // Scroll to load lazy content
  await scrollPage(page);

  // Extract data
  const data = await page.evaluate((targetUser) => {
    const result = {
      scrapedAt: new Date().toISOString(),
      targetUsername: targetUser,
      profile: {},
      posts: [],
      stats: { totalPostsFound: 0, postsWithLocation: 0 }
    };

    // Try to find user data in page scripts
    let user = null;

    // Source 1: window._sharedData
    const scripts = Array.from(document.querySelectorAll('script:not([src])'));
    const sharedScript = scripts.find(s => s.textContent.includes('window._sharedData'));
    
    if (sharedScript) {
      try {
        const jsonStr = sharedScript.textContent.match(/window\._sharedData = ({.+?});<\/script>/)?.[1];
        const sharedData = JSON.parse(jsonStr);
        user = sharedData?.entry_data?.ProfilePage?.[0]?.graphql?.user;
      } catch (e) {}
    }

    // Source 2: Inline data in HTML
    if (!user) {
      const html = document.documentElement.innerHTML;
      const match = html.match(/"user":\s*({.+?}),\s*"logging_page_id"/);
      if (match) {
        try {
          user = JSON.parse(match[1]);
        } catch (e) {}
      }
    }

    if (!user) {
      const bodyText = document.body.innerText.toLowerCase();
      
      if (bodyText.includes('login') || bodyText.includes('iniciar sesión')) {
        return { error: 'LOGIN_REQUIRED', message: 'Instagram requires login' };
      }
      if (bodyText.includes('page not found') || document.title.includes('not found')) {
        return { error: 'USER_NOT_FOUND', message: `User @${targetUser} not found` };
      }
      return { error: 'NO_DATA', message: 'No user data found' };
    }

    // Profile data
    result.profile = {
      username: user.username,
      fullName: user.full_name || '',
      biography: user.biography || '',
      followers: user.edge_followed_by?.count || 0,
      following: user.edge_follow?.count || 0,
      postsCount: user.edge_owner_to_timeline_media?.count || 0,
      isPrivate: user.is_private || false,
      isVerified: user.is_verified || false,
      profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url || null
    };

    // Posts
    const edges = user.edge_owner_to_timeline_media?.edges || [];
    result.stats.totalPostsFound = edges.length;

    result.posts = edges.map(edge => {
      const node = edge.node;
      const captionText = node.edge_media_to_caption?.edges?.[0]?.node?.text || '';
      
      if (node.location) result.stats.postsWithLocation++;

      return {
        id: node.id,
        shortcode: node.shortcode,
        url: `${config.instagram.baseUrl}/p/${node.shortcode}`,
        caption: captionText,
        likes: node.edge_media_preview_like?.count || 0,
        comments: node.edge_media_to_comment?.count || 0,
        timestamp: node.taken_at_timestamp 
          ? new Date(node.taken_at_timestamp * 1000).toISOString() 
          : null,
        isVideo: node.is_video || false,
        displayUrl: node.display_url || null,
        location: {
          name: node.location?.name || null,
          id: node.location?.id || null
        }
      };
    });

    return result;
  }, username);

  return data;
}

/**
 * Scroll page to load more content
 * @param {Object} page - Puppeteer page instance
 */
async function scrollPage(page) {
  let previousHeight = 0;
  let scrollCount = 0;

  while (scrollCount < config.instagram.maxScrolls) {
    previousHeight = await page.evaluate('document.body.scrollHeight');
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await new Promise(r => setTimeout(r, config.instagram.scrollDelay));
    
    const newHeight = await page.evaluate('document.body.scrollHeight');
    if (newHeight === previousHeight) break;
    scrollCount++;
  }
}

export default { extractProfile };