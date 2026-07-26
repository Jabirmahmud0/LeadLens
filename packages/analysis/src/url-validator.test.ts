import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateAndNormalizeUrl, UrlValidationError } from './url-validator';
import dns from 'dns';

vi.mock('dns', () => {
  return {
    default: {
      promises: {
        resolve: vi.fn(),
      }
    }
  };
});

describe('URL Normalization & Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation allows public IP
    (dns.promises.resolve as any).mockResolvedValue(['8.8.8.8']);
  });

  describe('Normalization edge cases', () => {
    it('should prepend https:// if missing protocol', async () => {
      const url = await validateAndNormalizeUrl('example.com');
      expect(url).toBe('https://example.com');
    });

    it('should trim whitespace', async () => {
      const url = await validateAndNormalizeUrl('  https://example.com  ');
      expect(url).toBe('https://example.com');
    });

    it('should strip trailing slash for root paths', async () => {
      const url = await validateAndNormalizeUrl('https://example.com/');
      expect(url).toBe('https://example.com');
    });

    it('should not strip trailing slash for non-root paths', async () => {
      const url = await validateAndNormalizeUrl('https://example.com/path/');
      expect(url).toBe('https://example.com/path/');
    });
  });

  describe('SSRF Protection in Validator', () => {
    it('should block non-HTTP(S) protocols', async () => {
      await expect(validateAndNormalizeUrl('ftp://example.com'))
        .rejects
        .toThrow(UrlValidationError);
        
      await expect(validateAndNormalizeUrl('file:///etc/passwd'))
        .rejects
        .toThrow(UrlValidationError);
    });

    it('should block direct IP access to private IPs', async () => {
      await expect(validateAndNormalizeUrl('http://127.0.0.1'))
        .rejects
        .toThrow('Access to internal IP addresses is forbidden.');

      await expect(validateAndNormalizeUrl('http://169.254.169.254'))
        .rejects
        .toThrow('Access to internal IP addresses is forbidden.');
    });

    it('should block domain resolving to private IPs', async () => {
      (dns.promises.resolve as any).mockResolvedValue(['192.168.1.1']);
      
      await expect(validateAndNormalizeUrl('http://internal.corp.com'))
        .rejects
        .toThrow('Domain resolves to an internal IP address and is forbidden.');
    });

    it('should reject invalid URLs', async () => {
      await expect(validateAndNormalizeUrl('http://'))
        .rejects
        .toThrow('Invalid URL format.');
    });
    
    it('should reject if DNS resolution fails', async () => {
      (dns.promises.resolve as any).mockRejectedValue(new Error('ENOTFOUND'));
      
      await expect(validateAndNormalizeUrl('http://nonexistent.invalid'))
        .rejects
        .toThrow('DNS resolution failed: ENOTFOUND');
    });
  });
});
