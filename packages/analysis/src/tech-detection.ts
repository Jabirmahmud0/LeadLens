export interface TechDetection {
  name: string;
  category: string;
  confidence: 'confirmed' | 'likely' | 'unknown';
}

const SIGNATURES = [
  { name: 'WordPress', category: 'CMS', regex: /wp-content|wp-includes|<meta name="generator" content="WordPress/i },
  { name: 'Shopify', category: 'E-commerce', regex: /cdn\.shopify\.com|Shopify\.theme/i },
  { name: 'Wix', category: 'Website Builder', regex: /wix\.com|X-Wix/i },
  { name: 'Squarespace', category: 'Website Builder', regex: /squarespace\.com/i },
  { name: 'Webflow', category: 'Website Builder', regex: /data-wf-site|webflow\.com/i },
  { name: 'Next.js', category: 'Framework', regex: /_next\/static|<div id="__next">/i },
  { name: 'React', category: 'Framework', regex: /data-reactroot|react\.js|react-dom/i },
  { name: 'jQuery', category: 'Library', regex: /jquery[\d.-]*\.js/i },
  { name: 'Bootstrap', category: 'UI Framework', regex: /bootstrap[\d.-]*\.css|bootstrap[\d.-]*\.js/i },
  { name: 'Google Tag Manager', category: 'Analytics', regex: /googletagmanager\.com\/gtm\.js/i },
  { name: 'Google Analytics', category: 'Analytics', regex: /google-analytics\.com\/analytics\.js|gtag\(/i },
  { name: 'HubSpot', category: 'Marketing', regex: /js\.hs-scripts\.com|hs-analytics/i },
  { name: 'Intercom', category: 'Live Chat', regex: /widget\.intercom\.io/i },
  { name: 'Tailwind CSS', category: 'UI Framework', regex: /tailwindcss/i },
  { name: 'Stripe', category: 'Payments', regex: /js\.stripe\.com/i },
];

export function detectTechnologies(html: string, headers: Headers): TechDetection[] {
  const detected: TechDetection[] = [];
  
  // Also check some common headers
  const server = headers.get('server') || '';
  const xPoweredBy = headers.get('x-powered-by') || '';
  
  if (server.toLowerCase().includes('cloudflare')) {
    detected.push({ name: 'Cloudflare', category: 'CDN', confidence: 'confirmed' });
  }
  if (server.toLowerCase().includes('nginx')) {
    detected.push({ name: 'Nginx', category: 'Web Server', confidence: 'likely' });
  }
  if (xPoweredBy.toLowerCase().includes('express')) {
    detected.push({ name: 'Express', category: 'Web Framework', confidence: 'confirmed' });
  }
  if (xPoweredBy.toLowerCase().includes('php')) {
    detected.push({ name: 'PHP', category: 'Language', confidence: 'confirmed' });
  }

  // Regex checks against HTML
  for (const sig of SIGNATURES) {
    if (sig.regex.test(html)) {
      detected.push({
        name: sig.name,
        category: sig.category,
        confidence: 'confirmed'
      });
    }
  }

  return detected;
}
