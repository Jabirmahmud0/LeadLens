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

    // Explicit check for AWS metadata IP 169.254.169.254
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
 */
export async function validateAndNormalizeUrl(urlString: string): Promise<string> {
  let url: URL;
  
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

  let normalized = url.toString();
  if (normalized.endsWith('/') && url.pathname === '/') {
    normalized = normalized.slice(0, -1);
  }

  const hostname = url.hostname;
  
  if (ipaddr.isValid(hostname)) {
    if (!isIpSafe(hostname)) {
      throw new UrlValidationError('Access to internal IP addresses is forbidden.');
    }
    return normalized;
  }

  try {
    const addresses = await dns.promises.resolve(hostname);
    if (!addresses || addresses.length === 0) {
      throw new UrlValidationError('Could not resolve domain.');
    }

    for (const address of addresses) {
      if (!isIpSafe(address)) {
        throw new UrlValidationError('Domain resolves to an internal IP address and is forbidden.');
      }
    }
  } catch (err: unknown) {
    if (err instanceof UrlValidationError) throw err;
    throw new UrlValidationError(`DNS resolution failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  return normalized;
}
