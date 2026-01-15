import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class CsrfService {
  /**
   * Generate a random CSRF token
   */
  generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Validate CSRF token (compare header token with cookie token)
   */
  validateToken(headerToken: string | undefined, cookieToken: string | undefined): boolean {
    if (!headerToken || !cookieToken) {
      return false;
    }

    // Constant-time comparison to prevent timing attacks
    return this.constantTimeCompare(headerToken, cookieToken);
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}
