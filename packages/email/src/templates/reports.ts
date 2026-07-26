import { wrapBaseTemplate } from './base';

export interface ReportCompletedData {
  prospectUrl: string;
  reportUrl: string;
  companyName?: string;
  issuesFound?: number;
}

export function getReportCompletedTemplate(data: ReportCompletedData): { subject: string, html: string } {
  const company = data.companyName || data.prospectUrl;
  
  const content = `
    <h1>Your Opportunity Brief is ready!</h1>
    <p>The analysis for <strong>${company}</strong> has finished processing.</p>
    
    ${data.issuesFound ? `<div style="background-color: #1e1b4b; border: 1px solid #3730a3; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; color: #818cf8; font-weight: 500;">We detected ${data.issuesFound} potential issues you can leverage in your pitch.</p>
    </div>` : ''}
    
    <a href="${data.reportUrl}" class="button" target="_blank">View Opportunity Brief</a>
    
    <p style="margin-top: 32px; font-size: 14px; color: #a3a3a3;">
      Or copy and paste this link into your browser:<br/>
      <span style="color: #60a5fa;">${data.reportUrl}</span>
    </p>
  `;

  return {
    subject: `Analysis complete: ${company}`,
    html: wrapBaseTemplate('Analysis Complete', `Your Opportunity Brief for ${company} is ready.`, content),
  };
}

export interface ReportFailedData {
  prospectUrl: string;
  errorMessage: string;
  dashboardUrl: string;
}

export function getReportFailedTemplate(data: ReportFailedData): { subject: string, html: string } {
  const content = `
    <h1 style="color: #ef4444;">Analysis Failed</h1>
    <p>Unfortunately, we encountered an error while analyzing <strong>${data.prospectUrl}</strong>.</p>
    
    <div style="background-color: #450a0a; border: 1px solid #7f1d1d; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; font-family: monospace; color: #fca5a5; font-size: 14px;">Error: ${data.errorMessage}</p>
    </div>
    
    <p>This can happen if the website is protected by aggressive anti-bot software (like Cloudflare), if the domain does not exist, or if the server timed out.</p>
    
    <a href="${data.dashboardUrl}" class="button" style="background-color: #3f3f46;">Return to Dashboard</a>
  `;

  return {
    subject: `Analysis failed: ${data.prospectUrl}`,
    html: wrapBaseTemplate('Analysis Failed', `We encountered an error analyzing ${data.prospectUrl}.`, content),
  };
}
