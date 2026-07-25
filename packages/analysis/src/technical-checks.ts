import { ExtractedData } from './extraction';

export interface TechnicalChecks {
  httpsStatus: 'active' | 'missing' | 'error';
  compression: boolean;
  cacheHeaders: {
    cacheControl: boolean;
    etag: boolean;
    expires: boolean;
  };
  securityHeaders: {
    csp: boolean;
    hsts: boolean;
    xFrameOptions: boolean;
    referrerPolicy: boolean;
    permissionsPolicy: boolean;
  };
  mixedContentLikely: boolean;
  seoBasics: {
    viewport: boolean;
    robots: boolean;
    hasTitle: boolean;
    hasMetaDescription: boolean;
    hasH1: boolean;
    hasProperHeadings: boolean;
    missingAltImagesCount: number;
    totalImages: number;
  };
  copyrightYear?: number;
}

export function runTechnicalChecks(data: ExtractedData, html: string, rawHeaders: Headers): TechnicalChecks {
  // 1. Basic SEO & Content Quality
  const hasViewport = html.toLowerCase().includes('name="viewport"');
  const hasRobots = html.toLowerCase().includes('name="robots"');
  
  // Extract copyright year roughly
  const yearMatch = html.match(/(?:©|copyright|&copy;)[\\s\\w]*?(20\\d{2})/i);
  const copyrightYear = yearMatch ? parseInt(yearMatch[1], 10) : undefined;
  
  const mixedContentLikely = data.hasHttps && html.includes('http://');

  return {
    httpsStatus: data.hasHttps ? 'active' : 'missing',
    compression: !!rawHeaders.get('content-encoding'),
    cacheHeaders: {
      cacheControl: !!rawHeaders.get('cache-control'),
      etag: !!rawHeaders.get('etag'),
      expires: !!rawHeaders.get('expires'),
    },
    securityHeaders: {
      csp: !!rawHeaders.get('content-security-policy'),
      hsts: !!rawHeaders.get('strict-transport-security'),
      xFrameOptions: !!rawHeaders.get('x-frame-options'),
      referrerPolicy: !!rawHeaders.get('referrer-policy'),
      permissionsPolicy: !!rawHeaders.get('permissions-policy'),
    },
    mixedContentLikely,
    seoBasics: {
      viewport: hasViewport,
      robots: hasRobots,
      hasTitle: data.title.length > 0,
      hasMetaDescription: data.metaDescription.length > 0,
      hasH1: data.headings.h1.length > 0,
      hasProperHeadings: data.headings.h1.length === 1 && data.headings.h2.length > 0,
      missingAltImagesCount: data.images.missingAlt,
      totalImages: data.images.total,
    },
    copyrightYear
  };
}
