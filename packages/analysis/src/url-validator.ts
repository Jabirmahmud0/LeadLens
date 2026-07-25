import dns from 'dns';
import ipaddr from 'ipaddr.js';

export class UrlValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UrlValidationError';
  }
}

/**
 * Checks if an IP address is considered "safe" for SSRF protection.
 * Blocks private, loopback, link-local, and cloud metadata IPs.
 */
function isIpSafe(ipStr: string): boolean {
  try {
    const ip = ipaddr.parse(ipStr);
    const range = ip.range();

    // List of blocked ranges according to standard SSRF prevention
    const blockedRanges = [
      'unspecified',
      'broadcast',
      'multicast',
      'linkLocal',
      'loopback',
      'private',
      'reserved'
    ];

    if (blockedRanges.includes(range)) {
      return false;
    }

    // Explicit check for cloud metadata IPs (like AWS 169.254.169.254)
    // ipaddr.js classifies 169.254.0.0/16 as linkLocal, which is blocked above,
    // but just to be sure we also block any IPv4 that starts with 169.254
    if (ip.kind() === 'ipv4' && ipStr.startsWith('169.254.')) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Validates, normalizes, and performs SSRF protection on a given URL.
 * 
 * @param urlString The input URL string
 * @returns The normalized URL object if safe, throws UrlValidationError otherwise.
 */
export async function validateAndNormalizeUrl(urlString: string): Promise<string> {
  // 1. Basic format & protocol check
  let url: URL;
  
  // Auto-prepend https:// if missing protocol
  let toParse = urlString.trim();
  if (!/^https?:\/\//i.test(toParse)) {
    toParse = 'https://' + toParse;
  }

  try {
    url = new URL(toParse);
  } catch (err) {
    throw new UrlValidationError('Invalid URL format.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UrlValidationError('Only HTTP and HTTPS protocols are allowed.');
  }

  // Normalize: Lowercase hostname is done automatically by URL parser.
  // Strip trailing slash if path is just '/'
  let normalized = url.toString();
  if (normalized.endsWith('/') && url.pathname === '/') {
    normalized = normalized.slice(0, -1);
  }

  // 2. Resolve DNS
  const hostname = url.hostname;
  
  // If hostname is already an IP, check it directly
  if (ipaddr.isValid(hostname)) {
    if (!isIpSafe(hostname)) {
      throw new UrlValidationError('Access to internal IP addresses is forbidden.');
    }
    return normalized;
  }

  // Resolve hostname
  try {
    const addresses = await dns.promises.resolve(hostname);
    if (!addresses || addresses.length === 0) {
      throw new UrlValidationError('Could not resolve domain.');
    }

    // Check all resolved IPs for safety
    for (const address of addresses) {
      if (!isIpSafe(address)) {
        throw new UrlValidationError('Domain resolves to an internal IP address and is forbidden.');
      }
    }
  } catch (err: any) {
    if (err instanceof UrlValidationError) throw err;
    throw new UrlValidationError(\`DNS resolution failed: \${err.message}\`);
  }

  return normalized;
}
