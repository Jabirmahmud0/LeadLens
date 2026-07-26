import { describe, it, expect } from 'vitest';
import { isPrivateIP } from './ssrf';

describe('SSRF Protection - isPrivateIP', () => {
  it('should block 127.x.x.x loopback addresses', () => {
    expect(isPrivateIP('127.0.0.1')).toBe(true);
    expect(isPrivateIP('127.1.2.3')).toBe(true);
    expect(isPrivateIP('localhost')).toBe(true);
  });

  it('should block 10.x.x.x private addresses', () => {
    expect(isPrivateIP('10.0.0.1')).toBe(true);
    expect(isPrivateIP('10.255.255.255')).toBe(true);
  });

  it('should block 172.16.x.x to 172.31.x.x private addresses', () => {
    expect(isPrivateIP('172.16.0.1')).toBe(true);
    expect(isPrivateIP('172.31.255.255')).toBe(true);
  });

  it('should block 192.168.x.x private addresses', () => {
    expect(isPrivateIP('192.168.0.1')).toBe(true);
    expect(isPrivateIP('192.168.100.100')).toBe(true);
  });

  it('should block 169.254.x.x link-local metadata addresses (AWS/GCP)', () => {
    expect(isPrivateIP('169.254.169.254')).toBe(true);
  });
  
  it('should block IPv6 loopback and private addresses', () => {
    expect(isPrivateIP('::1')).toBe(true);
    expect(isPrivateIP('fc00::1')).toBe(true);
    expect(isPrivateIP('fe80::1')).toBe(true);
    expect(isPrivateIP('::ffff:127.0.0.1')).toBe(true);
    expect(isPrivateIP('::ffff:169.254.169.254')).toBe(true);
  });

  it('should allow valid public IP addresses', () => {
    expect(isPrivateIP('8.8.8.8')).toBe(false);
    expect(isPrivateIP('1.1.1.1')).toBe(false);
    expect(isPrivateIP('104.21.4.1')).toBe(false);
    expect(isPrivateIP('172.32.0.1')).toBe(false); // Outside of 172.16-31 range
    expect(isPrivateIP('2001:4860:4860::8888')).toBe(false); // Public IPv6
  });
});
