import { Request } from 'express';

/**
 * Normalize IPv6 mapped IPv4 addresses (::ffff:192.168.1.1 => 192.168.1.1)
 */
function normalizeIp(ip: string | undefined | null): string | null {
  if (!ip) {
    return null;
  }

  // Remove IPv6 prefix if present
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }

  // Remove brackets from IPv6 addresses if present
  if (ip.startsWith('[') && ip.endsWith(']')) {
    return ip.slice(1, -1);
  }

  return ip;
}

/**
 * Extract client IP from request, handling reverse proxy scenarios
 * 
 * Priority:
 * 1. X-Forwarded-For header (first IP in the chain) - if trust proxy is enabled
 * 2. X-Real-IP header - if trust proxy is enabled
 * 3. req.ip (set by Express when trust proxy is enabled)
 * 4. req.connection.remoteAddress (fallback)
 * 5. req.socket.remoteAddress (fallback)
 * 
 * @param req Express request object
 * @param trustProxy Whether to trust proxy headers (from TRUST_PROXY env var)
 * @returns Client IP address or 'unknown' if not found
 */
export function getClientIp(req: Request, trustProxy: boolean = false): string {
  let ip: string | null = null;

  if (trustProxy) {
    // Trust proxy headers
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
      // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
      // We want the first one (original client)
      const firstIp = typeof xForwardedFor === 'string' 
        ? xForwardedFor.split(',')[0].trim()
        : xForwardedFor[0]?.split(',')[0].trim();
      
      if (firstIp) {
        ip = normalizeIp(firstIp);
      }
    }

    // Fallback to X-Real-IP if X-Forwarded-For is not available
    if (!ip) {
      const xRealIp = req.headers['x-real-ip'];
      if (xRealIp) {
        ip = normalizeIp(typeof xRealIp === 'string' ? xRealIp : xRealIp[0]);
      }
    }
  }

  // Fallback to req.ip (set by Express when trust proxy is enabled)
  if (!ip && req.ip) {
    ip = normalizeIp(req.ip);
  }

  // Fallback to connection remote address
  if (!ip) {
    const remoteAddress = (req as any).connection?.remoteAddress || 
                         (req as any).socket?.remoteAddress;
    if (remoteAddress) {
      ip = normalizeIp(remoteAddress);
    }
  }

  return ip || 'unknown';
}
