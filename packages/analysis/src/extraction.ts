import * as cheerio from 'cheerio';

export interface ExtractedData {
  url: string;
  title: string;
  metaDescription: string;
  canonical: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  text: string;
  links: { internal: number; external: number };
  images: { total: number; missingAlt: number };
  forms: number;
  socialLinks: string[];
  schemaLd: any[];
  securityHeaders: Record<string, string>;
  hasHttps: boolean;
  responseTimeMs: number;
}

export async function fetchAndExtract(url: string, timeout = 10000): Promise<ExtractedData> {
  const startTime = Date.now();
  
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeout),
    headers: { 'User-Agent': 'LeadLensBot/1.0' }
  });

  const responseTimeMs = Date.now() - startTime;
  
  if (!res.ok) {
    throw new Error(\`Failed to fetch \${url}: \${res.status} \${res.statusText}\`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  
  // Basic Metadata
  const title = $('title').text().trim();
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  
  // Headings
  const headings = {
    h1: $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h2: $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h3: $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean),
  };

  // Text Extraction (stripping non-content)
  const $body = $('body').clone();
  $body.find('script, style, noscript, iframe, svg, nav, footer, header').remove();
  let text = $body.text().replace(/\\s+/g, ' ').trim();
  
  // Truncate text safely (e.g., max 10,000 chars)
  if (text.length > 10000) {
    text = text.substring(0, 10000) + '...';
  }

  // Links
  let internal = 0;
  let external = 0;
  const origin = new URL(url).origin;
  $('a[href]').each((_, el) => {
    try {
      const href = $(el).attr('href')!;
      const u = new URL(href, url);
      if (u.origin === origin) internal++;
      else external++;
    } catch(e) {}
  });

  // Images
  const totalImages = $('img').length;
  const missingAlt = $('img:not([alt]), img[alt=""]').length;

  // Forms
  const forms = $('form').length;

  // Social Links
  const socialDomains = ['twitter.com', 'facebook.com', 'linkedin.com', 'instagram.com', 'youtube.com'];
  const socialLinks: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')!;
    if (socialDomains.some(d => href.includes(d))) {
      socialLinks.push(href);
    }
  });

  // Schema.org
  const schemaLd: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      schemaLd.push(JSON.parse($(el).html() || '{}'));
    } catch(e) {}
  });

  // Security Headers
  const securityHeaders: Record<string, string> = {};
  const targetHeaders = ['x-frame-options', 'content-security-policy', 'strict-transport-security'];
  targetHeaders.forEach(h => {
    const val = res.headers.get(h);
    if (val) securityHeaders[h] = val;
  });

  return {
    url,
    title,
    metaDescription,
    canonical,
    headings,
    text,
    links: { internal, external },
    images: { total: totalImages, missingAlt },
    forms,
    socialLinks: Array.from(new Set(socialLinks)),
    schemaLd,
    securityHeaders,
    hasHttps: url.startsWith('https:'),
    responseTimeMs
  };
}
