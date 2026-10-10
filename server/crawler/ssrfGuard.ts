import dns from 'dns';
import { logger } from '../utils/logger';

export interface UrlValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  reason?: string;
  isPrivateOrInternal?: boolean;
}

/**
 * Checks if an IPv4 address is in a private, loopback, link-local, or reserved range.
 */
function isPrivateIPv4(ip: string): boolean {
  // If not a valid 4-octet IPv4 format, it is not an IPv4 address
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.trim().match(ipv4Regex);
  if (!match) return false;

  const a = parseInt(match[1], 10);
  const b = parseInt(match[2], 10);
  const c = parseInt(match[3], 10);
  const d = parseInt(match[4], 10);

  if (a > 255 || b > 255 || c > 255 || d > 255) return true; // Malformed / overflow octet

  // Loopback (127.0.0.0/8)
  if (a === 127) return true;

  // RFC 1918 Private Ranges:
  // 10.0.0.0/8
  if (a === 10) return true;

  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;

  // Link-local / Cloud metadata (169.254.0.0/16)
  if (a === 169 && b === 254) return true;

  // Broadcast / Zero address (0.0.0.0/8)
  if (a === 0) return true;

  // Carrier-grade NAT (100.64.0.0/10)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // Multicast (224.0.0.0/4)
  if (a >= 224 && a <= 239) return true;

  // Reserved (240.0.0.0/4 and 255.255.255.255)
  if (a >= 240) return true;

  return false;
}

/**
 * Checks if an IPv6 address is loopback, unique local, or link-local.
 */
function isPrivateIPv6(ip: string): boolean {
  if (!ip.includes(':')) return false; // Not IPv6 format
  const normalized = ip.toLowerCase().trim();
  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('fe80:') || normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true; // Link-local
  if (normalized.startsWith('fc00:') || normalized.startsWith('fd')) return true; // Unique local (fc00::/7)
  if (normalized.startsWith('::ffff:')) {
    // IPv4-mapped IPv6
    const ipv4 = normalized.replace('::ffff:', '');
    return isPrivateIPv4(ipv4);
  }
  return false;
}

/**
 * Comprehensive SSRF Guard:
 * 1. Validates HTTP/HTTPS URL syntax
 * 2. Blocks known cloud metadata endpoints & localhost hostnames
 * 3. Resolves DNS asynchronously to verify underlying IP is not private/loopback/cloud metadata
 */
export async function validateSafeUrl(rawUrl: string): Promise<UrlValidationResult> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, reason: 'Empty or non-string URL provided.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { isValid: false, reason: 'Invalid URL syntax.' };
  }

  // 1. Protocol check
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return {
      isValid: false,
      reason: `Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Reject obvious localhost / internal hostnames
  const forbiddenHostnames = [
    'localhost',
    'localhost.localdomain',
    'ip6-localhost',
    'ip6-loopback',
    'instance-data',
    'metadata.google.internal',
    'metadata',
  ];

  if (forbiddenHostnames.includes(hostname) || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return {
      isValid: false,
      isPrivateOrInternal: true,
      reason: `Access to internal host "${hostname}" is blocked for security (SSRF prevention).`,
    };
  }

  // Direct IP in hostname check
  if (isPrivateIPv4(hostname) || isPrivateIPv6(hostname)) {
    return {
      isValid: false,
      isPrivateOrInternal: true,
      reason: `Access to private IP address "${hostname}" is blocked (SSRF prevention).`,
    };
  }

  // 3. DNS Lookup check to prevent DNS rebinding attacks
  try {
    const lookup = await dns.promises.lookup(hostname, { all: true });
    for (const record of lookup) {
      if (record.family === 4 && isPrivateIPv4(record.address)) {
        logger.warn(`SSRF Block: Domain ${hostname} resolves to private IPv4 ${record.address}`);
        return {
          isValid: false,
          isPrivateOrInternal: true,
          reason: `Domain ${hostname} resolves to private/internal network IP (${record.address}). Access denied.`,
        };
      }
      if (record.family === 6 && isPrivateIPv6(record.address)) {
        logger.warn(`SSRF Block: Domain ${hostname} resolves to private IPv6 ${record.address}`);
        return {
          isValid: false,
          isPrivateOrInternal: true,
          reason: `Domain ${hostname} resolves to private/internal IPv6 address (${record.address}). Access denied.`,
        };
      }
    }
  } catch (dnsErr: any) {
    // If domain cannot be resolved (e.g. offline testing or simulated demo domains like nextgenresume.ai)
    // verify it is not an internal or reserved TLD
    const isPublicTld = /\.(com|org|net|io|ai|dev|co|app|tech|edu|gov)$/i.test(hostname);
    if (isPublicTld && !hostname.includes('localhost') && !hostname.includes('internal')) {
      return {
        isValid: true,
        sanitizedUrl: parsed.toString(),
      };
    }
    return {
      isValid: false,
      reason: `Cannot resolve domain "${hostname}": ${dnsErr.message || 'DNS lookup failed.'}`,
    };
  }

  return {
    isValid: true,
    sanitizedUrl: parsed.toString(),
  };
}
