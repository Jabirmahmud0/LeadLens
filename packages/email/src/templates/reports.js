"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportCompletedTemplate = getReportCompletedTemplate;
exports.getReportFailedTemplate = getReportFailedTemplate;
var base_1 = require("./base");
function getReportCompletedTemplate(data) {
    var company = data.companyName || data.prospectUrl;
    var content = "\n    <h1>Your Opportunity Brief is ready!</h1>\n    <p>The analysis for <strong>${company}</strong> has finished processing.</p>\n    \n    ${data.issuesFound ? `<div style=\"background-color: #1e1b4b; border: 1px solid #3730a3; padding: 16px; border-radius: 8px; margin: 24px 0;\">\n      <p style=\"margin: 0; color: #818cf8; font-weight: 500;\">We detected ${data.issuesFound} potential issues you can leverage in your pitch.</p>\n    </div>` : ''}\n    \n    <a href=\"${data.reportUrl}\" class=\"button\" target=\"_blank\">View Opportunity Brief</a>\n    \n    <p style=\"margin-top: 32px; font-size: 14px; color: #a3a3a3;\">\n      Or copy and paste this link into your browser:<br/>\n      <span style=\"color: #60a5fa;\">${data.reportUrl}</span>\n    </p>\n  ";
    return {
        subject: "Analysis complete: ${company}",
        html: (0, base_1.wrapBaseTemplate)('Analysis Complete', "Your Opportunity Brief for ${company} is ready.", content),
    };
}
function getReportFailedTemplate(data) {
    var content = "\n    <h1 style=\"color: #ef4444;\">Analysis Failed</h1>\n    <p>Unfortunately, we encountered an error while analyzing <strong>${data.prospectUrl}</strong>.</p>\n    \n    <div style=\"background-color: #450a0a; border: 1px solid #7f1d1d; padding: 16px; border-radius: 8px; margin: 24px 0;\">\n      <p style=\"margin: 0; font-family: monospace; color: #fca5a5; font-size: 14px;\">Error: ${data.errorMessage}</p>\n    </div>\n    \n    <p>This can happen if the website is protected by aggressive anti-bot software (like Cloudflare), if the domain does not exist, or if the server timed out.</p>\n    \n    <a href=\"${data.dashboardUrl}\" class=\"button\" style=\"background-color: #3f3f46;\">Return to Dashboard</a>\n  ";
    return {
        subject: "Analysis failed: ${data.prospectUrl}",
        html: (0, base_1.wrapBaseTemplate)('Analysis Failed', "We encountered an error analyzing ${data.prospectUrl}.", content),
    };
}
