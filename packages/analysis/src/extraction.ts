import * as cheerio from 'cheerio';
import { createHash } from 'crypto';
import { fetchPublicText } from './safe-fetch';

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
  schemaLd: unknown[];
  securityHeaders: Record<string, string>;
  hasHttps: boolean;
  responseTimeMs: number;
  statusCode: number;
  contentType: string;
  responseSizeBytes: number;
  redirectChain: string[];
  language: string;
  navigationLabels: string[];
  callsToAction: string[];
  emails: string[];
  phoneNumbers: string[];
  responseHeaders: Record<string, string>;
  contentHash: string;
  rawHtml: string;
}

export async function fetchAndExtract(url: string, timeout = 10000): Promise<ExtractedData> {
  const res = await fetchPublicText(url, { timeoutMs: timeout });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);

  const html = res.text;
  const $ = cheerio.load(html);
  
  const title = $('title').text().trim();
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  
  const headings = {
    h1: $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h2: $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h3: $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean),
  };

  const $body = $('body').clone();
  $body.find('script, style, noscript, iframe, svg, nav, footer, header').remove();
  let text = $body.text().replace(/\s+/g, ' ').trim();
  
  if (text.length > 10000) {
    text = text.substring(0, 10000) + '...';
  }

  let internal = 0;
  let external = 0;
  const origin = new URL(url).origin;
  $('a[href]').each((_, el) => {
    try {
      const href = $(el).attr('href')!;
      const u = new URL(href, url);
      if (u.origin === origin) internal++;
      else external++;
    } catch(e) { /* ignore malformed hrefs */ }
  });

  const totalImages = $('img').length;
  const missingAlt = $('img:not([alt]), img[alt=""]').length;

  const forms = $('form').length;

  const socialDomains = ['twitter.com', 'facebook.com', 'linkedin.com', 'instagram.com', 'youtube.com'];
  const socialLinks: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')!;
    if (socialDomains.some(d => href.includes(d))) {
      socialLinks.push(href);
    }
  });

  const schemaLd: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      schemaLd.push(JSON.parse($(el).html() || '{}'));
    } catch(e) { /* ignore malformed JSON-LD */ }
  });

  const securityHeaders: Record<string, string> = {};
  const targetHeaders = ['x-frame-options', 'content-security-policy', 'strict-transport-security'];
  targetHeaders.forEach(h => {
    const val = res.headers[h];
    if (val) securityHeaders[h] = val;
  });

  const navigationLabels = $('nav a, header a, footer a')
    .map((_, element) => $(element).text().replace(/\s+/g, ' ').trim())
    .get()
    .filter(Boolean)
    .slice(0, 100);
  const ctaPattern = /book|contact|quote|demo|start|buy|shop|subscribe|call|learn more|get started/i;
  const callsToAction = $('a, button, input[type="submit"]')
    .map((_, element) => ($(element).text() || $(element).attr('value') || '').replace(/\s+/g, ' ').trim())
    .get()
    .filter((label) => label && ctaPattern.test(label))
    .slice(0, 50);
  const emails = Array.from(new Set((html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).map((email) => email.toLowerCase()))).slice(0, 25);
  const phoneNumbers = Array.from(new Set(html.match(/(?:\+?\d[\d\s().-]{7,}\d)/g) || [])).slice(0, 25);

  return {
    url: res.url,
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
    hasHttps: res.url.startsWith('https:'),
    responseTimeMs: res.durationMs,
    statusCode: res.status,
    contentType: res.contentType,
    responseSizeBytes: res.sizeBytes,
    redirectChain: res.redirectChain,
    language: $('html').attr('lang') || '',
    navigationLabels,
    callsToAction,
    emails,
    phoneNumbers,
    responseHeaders: res.headers,
    contentHash: createHash('sha256').update(text).digest('hex'),
    rawHtml: html,
  };
}
