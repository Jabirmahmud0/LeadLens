import { validateAndNormalizeUrl } from './url-validator';

const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
const DEFAULT_MAX_REDIRECTS = 5;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_CONTENT_TYPES = [
  'text/html',
  'application/xhtml+xml',
  'text/plain',
  'application/xml',
  'text/xml',
];

export interface PublicTextResponse {
  url: string;
  ok: boolean;
  status: number;
  statusText: string;
  contentType: string;
  headers: Record<string, string>;
  text: string;
  sizeBytes: number;
  durationMs: number;
  redirectChain: string[];
}

export interface PublicFetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  acceptedContentTypes?: string[];
  userAgent?: string;
}

function headersToRecord(headers: Headers): Record<string, string> {
  return Object.fromEntries(headers.entries());
}

async function readBoundedText(response: Response, maxBytes: number): Promise<{ text: string; sizeBytes: number }> {
  const declaredLength = Number(response.headers.get('content-length') || 0);
  if (declaredLength > maxBytes) {
    throw new Error(`Response exceeds the ${maxBytes}-byte limit`);
  }

  if (!response.body) return { text: '', sizeBytes: 0 };

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let sizeBytes = 0;
  let text = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      sizeBytes += value.byteLength;
      if (sizeBytes > maxBytes) {
        await reader.cancel('Response too large');
        throw new Error(`Response exceeds the ${maxBytes}-byte limit`);
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return { text, sizeBytes };
  } finally {
    reader.releaseLock();
  }
}

export async function fetchPublicText(
  inputUrl: string,
  options: PublicFetchOptions = {},
): Promise<PublicTextResponse> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  const acceptedContentTypes = options.acceptedContentTypes ?? DEFAULT_CONTENT_TYPES;
  const userAgent = options.userAgent ?? 'LeadLensBot/1.0 (+https://leadlens.ai)';
  const startedAt = Date.now();

  let currentUrl = await validateAndNormalizeUrl(inputUrl);
  const redirectChain: string[] = [];

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    // Re-resolve and validate before every network hop to reduce redirect and DNS-rebinding risk.
    currentUrl = await validateAndNormalizeUrl(currentUrl);
    const response = await fetch(currentUrl, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        'user-agent': userAgent,
        accept: acceptedContentTypes.join(', '),
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error(`Redirect from ${currentUrl} did not include a location`);
      if (redirectCount === maxRedirects) throw new Error(`Too many redirects (maximum ${maxRedirects})`);
      redirectChain.push(currentUrl);
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (contentType && !acceptedContentTypes.some((allowed) => contentType === allowed || contentType.startsWith(`${allowed}+`))) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    const body = await readBoundedText(response, maxBytes);
    return {
      url: currentUrl,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType,
      headers: headersToRecord(response.headers),
      text: body.text,
      sizeBytes: body.sizeBytes,
      durationMs: Date.now() - startedAt,
      redirectChain,
    };
  }

  throw new Error('Unable to fetch URL');
}
