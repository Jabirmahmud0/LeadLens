import { describe, expect, it } from 'vitest';
import { getReportCompletedTemplate, getReportFailedTemplate } from './reports';

describe('report email escaping', () => {
  it('escapes company-controlled HTML', () => expect(getReportCompletedTemplate({ prospectUrl: 'https://example.com', reportUrl: 'https://app.example.com/report', companyName: '<img src=x onerror=alert(1)>' }).html).not.toContain('<img src=x'));
  it('escapes provider error messages', () => expect(getReportFailedTemplate({ prospectUrl: 'https://example.com', dashboardUrl: 'https://app.example.com', errorMessage: '<script>alert(1)</script>' }).html).not.toContain('<script>alert(1)</script>'));
});
