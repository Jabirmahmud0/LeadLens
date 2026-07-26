/**
 * Wraps email content in a standard branded HTML skeleton.
 */
export function wrapBaseTemplate(title: string, preheader: string, content: string): string {
  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0a0a0a;
      color: #ffffff;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #0a0a0a;
      padding-bottom: 60px;
    }
    .main {
      background-color: #121212;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-spacing: 0;
      color: #e5e5e5;
      border: 1px solid #262626;
      border-radius: 12px;
      overflow: hidden;
      margin-top: 40px;
    }
    .header {
      padding: 32px;
      text-align: center;
      border-bottom: 1px solid #262626;
      background-color: #0a0a0a;
    }
    .content {
      padding: 32px;
      line-height: 1.6;
    }
    .footer {
      padding: 32px;
      text-align: center;
      font-size: 12px;
      color: #737373;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin-top: 24px;
      margin-bottom: 24px;
    }
    a {
      color: #60a5fa;
      text-decoration: none;
    }
    h1 {
      font-size: 24px;
      color: #ffffff;
      margin-top: 0;
    }
    h2 {
      font-size: 20px;
      color: #ffffff;
    }
    p {
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <span style="display:none !important; visibility:hidden; mso-hide:all; font-size:1px; color:#ffffff; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
    ${escapeHtml(preheader)}
  </span>
  <center class="wrapper">
    <table class="main" width="100%">
      <tr>
        <td class="header">
          <div style="display:inline-block; width:32px; height:32px; background-color:#2563eb; border-radius:8px; vertical-align:middle; margin-right:12px;"></div>
          <span style="font-size:20px; font-weight:bold; color:#ffffff; vertical-align:middle;">LeadLens</span>
        </td>
      </tr>
      <tr>
        <td class="content">
          ${content}
        </td>
      </tr>
    </table>
    <table width="100%" max-width="600" style="margin: 0 auto;">
      <tr>
        <td class="footer">
          <p>© ${new Date().getFullYear()} LeadLens Inc. All rights reserved.</p>
          <p>If you did not request this email, please safely ignore it.</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
  `.trim();
}
