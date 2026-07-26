"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerificationEmailTemplate = getVerificationEmailTemplate;
exports.getPasswordResetTemplate = getPasswordResetTemplate;
var base_1 = require("./base");
/**
 * Supabase Verification Email Template
 * In Supabase, the {{ .ConfirmationURL }} variable is replaced at send time.
 */
function getVerificationEmailTemplate() {
    var content = "\n    <h1>Verify your email</h1>\n    <p>Welcome to LeadLens! Please verify your email address to get started.</p>\n    <a href=\"{{ .ConfirmationURL }}\" class=\"button\" target=\"_blank\">Verify Email</a>\n    <p style=\"margin-top: 32px; font-size: 14px; color: #a3a3a3;\">\n      Or copy and paste this link into your browser:<br/>\n      <span style=\"color: #60a5fa;\">{{ .ConfirmationURL }}</span>\n    </p>\n  ";
    return {
        subject: 'Confirm your email address - LeadLens',
        html: (0, base_1.wrapBaseTemplate)('Verify your email', 'Please confirm your email address to start using LeadLens.', content),
    };
}
/**
 * Supabase Password Reset Email Template
 * In Supabase, the {{ .ConfirmationURL }} variable is replaced at send time.
 */
function getPasswordResetTemplate() {
    var content = "\n    <h1>Reset your password</h1>\n    <p>We received a request to reset the password for your LeadLens account.</p>\n    <a href=\"{{ .ConfirmationURL }}\" class=\"button\" target=\"_blank\">Reset Password</a>\n    <p style=\"margin-top: 32px; font-size: 14px; color: #a3a3a3;\">\n      If you did not request a password reset, you can safely ignore this email.\n    </p>\n  ";
    return {
        subject: 'Reset your password - LeadLens',
        html: (0, base_1.wrapBaseTemplate)('Reset your password', 'Instructions to reset your LeadLens password.', content),
    };
}
