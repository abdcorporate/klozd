import { Request } from 'express';
import { getClientIp } from './ip-utils';

describe('getClientIp', () => {
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      ip: undefined,
      connection: undefined,
      socket: undefined,
    };
  });

  describe('with trust proxy enabled', () => {
    it('should return first IP from X-Forwarded-For header', () => {
      mockRequest.headers = {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1',
      };

      const ip = getClientIp(mockRequest as Request, true);

      expect(ip).toBe('192.168.1.1');
    });

    it('should return X-Real-IP if X-Forwarded-For is not available', () => {
      mockRequest.headers = {
        'x-real-ip': '192.168.1.2',
      };

      const ip = getClientIp(mockRequest as Request, true);

      expect(ip).toBe('192.168.1.2');
    });

    it('should return req.ip if headers are not available', () => {
      mockRequest.ip = '192.168.1.3';

      const ip = getClientIp(mockRequest as Request, true);

      expect(ip).toBe('192.168.1.3');
    });

    it('should normalize IPv6 mapped IPv4 addresses from X-Forwarded-For', () => {
      mockRequest.headers = {
        'x-forwarded-for': '::ffff:192.168.1.1',
      };

      const ip = getClientIp(mockRequest as Request, true);

      expect(ip).toBe('192.168.1.1');
    });

    it('should handle single IP in X-Forwarded-For', () => {
      mockRequest.headers = {
        'x-forwarded-for': '192.168.1.1',
      };

      const ip = getClientIp(mockRequest as Request, true);

      expect(ip).toBe('192.168.1.1');
    });

    it('should trim whitespace from X-Forwarded-For', () => {
      mockRequest.headers = {
        'x-forwarded-for': '  192.168.1.1  ,  10.0.0.1  ',
      };

      const ip = getClientIp(mockRequest as Request, true);

      expect(ip).toBe('192.168.1.1');
    });
  });

  describe('with trust proxy disabled', () => {
    it('should ignore X-Forwarded-For header and use req.ip', () => {
      mockRequest.headers = {
        'x-forwarded-for': '192.168.1.1',
      };
      mockRequest.ip = '10.0.0.1';

      const ip = getClientIp(mockRequest as Request, false);

      expect(ip).toBe('10.0.0.1');
    });

    it('should ignore X-Real-IP header and use req.ip', () => {
      mockRequest.headers = {
        'x-real-ip': '192.168.1.1',
      };
      mockRequest.ip = '10.0.0.1';

      const ip = getClientIp(mockRequest as Request, false);

      expect(ip).toBe('10.0.0.1');
    });
  });

  describe('fallback scenarios', () => {
    it('should fallback to req.connection.remoteAddress', () => {
      mockRequest.connection = {
        remoteAddress: '192.168.1.4',
      } as any;

      const ip = getClientIp(mockRequest as Request, false);

      expect(ip).toBe('192.168.1.4');
    });

    it('should fallback to req.socket.remoteAddress', () => {
      mockRequest.socket = {
        remoteAddress: '192.168.1.5',
      } as any;

      const ip = getClientIp(mockRequest as Request, false);

      expect(ip).toBe('192.168.1.5');
    });

    it('should return "unknown" if no IP is found', () => {
      const ip = getClientIp(mockRequest as Request, false);

      expect(ip).toBe('unknown');
    });
  });

  describe('IPv6 normalization', () => {
    it('should normalize ::ffff: prefix', () => {
      mockRequest.ip = '::ffff:192.168.1.1';

      const ip = getClientIp(mockRequest as Request, false);

      expect(ip).toBe('192.168.1.1');
    });

    it('should remove brackets from IPv6 addresses', () => {
      mockRequest.ip = '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]';

      const ip = getClientIp(mockRequest as Request, false);

      expect(ip).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    });

    it('should handle normal IPv6 addresses', () => {
      mockRequest.ip = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';

      const ip = getClientIp(mockRequest as Request, false);

      expect(ip).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    });

    it('should handle IPv6 mapped from X-Forwarded-For', () => {
      mockRequest.headers = {
        'x-forwarded-for': '::ffff:10.0.0.1',
      };

      const ip = getClientIp(mockRequest as Request, true);

      expect(ip).toBe('10.0.0.1');
    });
  });

  describe('edge cases', () => {
    it('should handle empty X-Forwarded-For', () => {
      mockRequest.headers = {
        'x-forwarded-for': '',
      };
      mockRequest.ip = '192.168.1.1';

      const ip = getClientIp(mockRequest as Request, true);

      expect(ip).toBe('192.168.1.1');
    });

    it('should handle X-Forwarded-For with only commas', () => {
      mockRequest.headers = {
        'x-forwarded-for': ',,,',
      };
      mockRequest.ip = '192.168.1.1';

      const ip = getClientIp(mockRequest as Request, true);

      expect(ip).toBe('192.168.1.1');
    });

    it('should handle array X-Forwarded-For header', () => {
      mockRequest.headers = {
        'x-forwarded-for': ['192.168.1.1', '10.0.0.1'],
      };

      const ip = getClientIp(mockRequest as Request, true);

      expect(ip).toBe('192.168.1.1');
    });

    it('should handle array X-Real-IP header', () => {
      mockRequest.headers = {
        'x-real-ip': ['192.168.1.2'],
      };

      const ip = getClientIp(mockRequest as Request, true);

      expect(ip).toBe('192.168.1.2');
    });
  });
});
