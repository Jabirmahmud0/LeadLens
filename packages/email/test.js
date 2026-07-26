"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./src/index");
var template = (0, index_1.getReportCompletedTemplate)({
    prospectUrl: 'https://example.com',
    companyName: 'Acme Corp',
    reportUrl: 'https://app.leadlens.com/report/123',
    issuesFound: 14
});
console.log(template.subject);
console.log(template.html.substring(0, 500) + '...');
