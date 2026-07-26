export interface PageSpeedResult {
  scores: {
    performance: number | null;
    accessibility: number | null;
    seo: number | null;
    bestPractices: number | null;
  };
  metrics: {
    fcp: string | null; // First Contentful Paint
    lcp: string | null; // Largest Contentful Paint
    cls: string | null; // Cumulative Layout Shift
    tbt: string | null; // Total Blocking Time
    speedIndex: string | null;
  };
  opportunities: {
    title: string;
    description: string;
    savingsMs: number;
  }[];
}

export async function runPageSpeed(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedResult> {
  const apiKey = process.env.PAGESPEED_API_KEY ? `&key=${encodeURIComponent(process.env.PAGESPEED_API_KEY)}` : '';
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=accessibility&category=seo&category=best-practices&strategy=${strategy}${apiKey}`;
  
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      throw new Error(`PageSpeed API error: ${res.statusText}`);
    }

    const data = await res.json();
    const lighthouse = data.lighthouseResult;

    if (!lighthouse) {
      throw new Error('No Lighthouse result in response');
    }

    const categories = lighthouse.categories;
    const audits = lighthouse.audits;

    const opportunities = [];
    if (audits) {
      for (const key of Object.keys(audits)) {
        const audit = audits[key];
        if (audit.details && audit.details.type === 'opportunity' && audit.details.overallSavingsMs > 0) {
          opportunities.push({
            title: audit.title,
            description: audit.description,
            savingsMs: audit.details.overallSavingsMs
          });
        }
      }
    }

    return {
      scores: {
        performance: categories.performance?.score ? categories.performance.score * 100 : null,
        accessibility: categories.accessibility?.score ? categories.accessibility.score * 100 : null,
        seo: categories.seo?.score ? categories.seo.score * 100 : null,
        bestPractices: categories['best-practices']?.score ? categories['best-practices'].score * 100 : null,
      },
      metrics: {
        fcp: audits['first-contentful-paint']?.displayValue || null,
        lcp: audits['largest-contentful-paint']?.displayValue || null,
        cls: audits['cumulative-layout-shift']?.displayValue || null,
        tbt: audits['total-blocking-time']?.displayValue || null,
        speedIndex: audits['speed-index']?.displayValue || null,
      },
      opportunities: opportunities.sort((a, b) => b.savingsMs - a.savingsMs).slice(0, 5)
    };
  } catch (error) {
    console.error('PageSpeed API Error:', error);
    return {
      scores: { performance: null, accessibility: null, seo: null, bestPractices: null },
      metrics: { fcp: null, lcp: null, cls: null, tbt: null, speedIndex: null },
      opportunities: []
    };
  }
}
