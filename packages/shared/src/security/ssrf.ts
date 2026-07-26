/**
 * A simple utility to check if an IP address is a private or reserved IP,
 * preventing Server-Side Request Forgery (SSRF) when making outbound requests.
 */

const PRIVATE_RANGES = [
  /^127\./,                    // Loopback
  /^10\./,                     // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
  /^192\.168\./,               // 192.168.0.0/16
  /^169\.254\./,               // Link-local
  /^0\./,                      // Current network
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // Carrier-grade NAT
  /^192\.0\.0\./,              // IETF Protocol Assignments
  /^192\.0\.2\./,              // TEST-NET-1
  /^198\.18\./,                // Network benchmark
  /^198\.19\./,                // Network benchmark
  /^198\.51\.100\./,           // TEST-NET-2
  /^203\.0\.113\./,            // TEST-NET-3
  /^224\./,                    // Multicast
  /^240\./,                    // Reserved
  /^255\.255\.255\.255/,       // Broadcast
  /^::1$/,                     // IPv6 Loopback
  /^fe80:/i,                   // IPv6 Link-local
  /^fc00:/i,                   // IPv6 Unique Local Address
  /^fd00:/i,                   // IPv6 Unique Local Address
];

/**
 * Checks if a given IP address string falls into a private or reserved range.
 */
export function isPrivateIP(ip: string): boolean {
  // Normalize IPv6 mapped IPv4 if present (e.g., ::ffff:192.168.1.1)
  const normalized = ip.replace(/^::ffff:/i, '');
  
  for (const regex of PRIVATE_RANGES) {
    if (regex.test(normalized)) {
      return true;
    }
  }
  
  // Extra check for 'localhost' string just in case
  if (ip.toLowerCase() === 'localhost') {
    return true;
  }
  
  return false;
}
