import robotsParser from 'robots-parser';
import * as cheerio from 'cheerio';
import { validateAndNormalizeUrl } from './url-validator';
import { fetchPublicText } from './safe-fetch';

export interface DiscoveryOptions {
  maxPages?: number;
  timeout?: number;
  userAgent?: string;
}

export interface DiscoveredPage {
  url: string;
  source: 'homepage' | 'sitemap' | 'likely' | 'robots';
}

const DEFAULT_OPTIONS: DiscoveryOptions = {
  maxPages: 8,
  timeout: 10000,
  userAgent: 'LeadLensBot/1.0 (+https://leadlens.ai)'
};

const LIKELY_PATHS = [
  '/about', '/about-us', '/services', '/solutions', '/products', 
  '/contact', '/contact-us', '/pricing', '/case-studies', '/customers', 
  '/blog', '/faq'
];

/**
 * Discovers pages to crawl starting from a base URL.
 * Follows robots.txt, checks sitemaps, and extracts navigation links from homepage.
 */
export async function discoverPages(baseUrl: string, options: DiscoveryOptions = {}): Promise<string[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const origin = new URL(baseUrl).origin;
  
  const discovered = new Map<string, DiscoveredPage>();
  const addUrl = (urlStr: string, source: DiscoveredPage['source']) => {
    try {
      const u = new URL(urlStr, baseUrl);
      // Only keep same-origin HTTP/S URLs
      if (u.origin === origin && (u.protocol === 'http:' || u.protocol === 'https:')) {
        // Normalize: remove hash
        u.hash = '';
        const normalized = u.toString().replace(/\/$/, ''); // strip trailing slash
        
        if (!discovered.has(normalized)) {
          discovered.set(normalized, { url: normalized, source });
        }
      }
    } catch (e) {
      // invalid URL
    }
  };

  addUrl(baseUrl, 'homepage'); // Always include the root

  // 1. Fetch robots.txt
  let isAllowed = true;
  let robots: any = null;
  try {
    const robotsUrl = `${origin}/robots.txt`;
    const res = await fetchPublicText(robotsUrl, {
      userAgent: opts.userAgent,
      timeoutMs: opts.timeout,
      maxBytes: 512 * 1024,
      acceptedContentTypes: ['text/plain', 'text/html'],
    });
    
    if (res.ok) {
      const text = res.text;
      robots = robotsParser(robotsUrl, text);
      isAllowed = robots.isAllowed(baseUrl, opts.userAgent!) !== false;
    }
  } catch (e) {
    // Ignore robots.txt errors
  }

  if (!isAllowed) {
    throw new Error('Crawling disallowed by robots.txt');
  }

  // 2. Check declared sitemaps and the conventional default.
  {
    const sitemaps = Array.from(new Set([...(robots?.getSitemaps?.() || []), `${origin}/sitemap.xml`]));
    for (const sm of sitemaps) {
      if (discovered.size >= opts.maxPages!) break;
      try {
        const res = await fetchPublicText(sm, {
          userAgent: opts.userAgent,
          timeoutMs: opts.timeout,
          maxBytes: 1024 * 1024,
          acceptedContentTypes: ['application/xml', 'text/xml', 'text/plain'],
        });
        if (res.ok) {
          const xml = res.text;
          const $ = cheerio.load(xml, { xmlMode: true });
          $('loc').each((_, el) => {
            const loc = $(el).text();
            addUrl(loc, 'sitemap');
          });
        }
      } catch (e) {
        // Ignore sitemap errors
      }
    }
  }

  // 3. Fetch Homepage and Extract Nav Links
  try {
    const res = await fetchPublicText(baseUrl, {
      userAgent: opts.userAgent,
      timeoutMs: opts.timeout,
    });
    
    if (res.ok) {
      const html = res.text;
      const $ = cheerio.load(html);
      
      // Look for links in nav, header, footer
      $('nav a, header a, footer a').each((_, el) => {
        const href = $(el).attr('href');
        if (href) addUrl(href, 'homepage');
      });
    }
  } catch (e) {
    // Ignore homepage fetch error for discovery phase
  }

  // 4. Use guessed paths only after real sitemap and navigation candidates.
  for (const p of LIKELY_PATHS) {
    addUrl(`${origin}${p}`, 'likely');
  }

  // 5. Filter by robots.txt and max length
  let finalUrls = Array.from(discovered.values())
    .filter(page => !robots || robots.isAllowed(page.url, opts.userAgent!) !== false)
    .slice(0, opts.maxPages)
    .map(p => p.url);
    
  // Ensure homepage is always first if it exists
  const homeIdx = finalUrls.indexOf(origin);
  if (homeIdx > 0) {
    finalUrls.splice(homeIdx, 1);
    finalUrls.unshift(origin);
  } else if (homeIdx === -1 && finalUrls.length < opts.maxPages!) {
    finalUrls.unshift(origin);
  }

  return finalUrls;
}
